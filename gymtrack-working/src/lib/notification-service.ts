import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { supabase } from "./supabase";

const SERVICE_WORKER_URL = "/sw.js?v=27";
const WORKOUT_NOTIFICATION_PREFIX = 82_000;
const REST_TIMER_NOTIFICATION_ID = 81_999;
const REST_TIMER_CHANNEL_ID = "gymtrack-rest-timer-v1";
const REST_TIMER_DEVICE_KEY = "gymtrack.rest-timer-device-key";
const FIREBASE_APP_NAME = "gymtrack";
const WORKOUT_REMINDER_HOUR = 8;
const WORKOUT_REMINDER_MINUTE = 0;

type DeliveryResult = {
  state: "ready" | "error";
  detail: string;
};

type WorkoutReminder = {
  id: string;
  date: string;
  workoutName: string;
};

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let nativeListenersReady = false;
let nativeUserId: string | null = null;
let webForegroundUnsubscribe: (() => void) | null = null;
let webTokenRefreshCleanup: (() => void) | null = null;
let webUserId: string | null = null;
let webRestTimerTimeout: number | null = null;

function firebaseConfig(): FirebaseClientConfig | null {
  const values = {
    apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
    authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
    projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
    storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
    messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
    appId: import.meta.env["VITE_FIREBASE_APP_ID"],
  };
  return Object.values(values).every((value) => typeof value === "string" && value.trim())
    ? values
    : null;
}

function platform(): "ios" | "android" | "web" {
  if (!Capacitor.isNativePlatform()) return "web";
  return Capacitor.getPlatform() === "ios" ? "ios" : "android";
}

function notificationId(value: string): number {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return WORKOUT_NOTIFICATION_PREFIX + Math.abs(hash % 10_000);
}

function tokenStorageKey(userId: string, currentPlatform: string) {
  return `gymtrack.push-token:${userId}:${currentPlatform}`;
}

function restTimerDeviceKey() {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(REST_TIMER_DEVICE_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(REST_TIMER_DEVICE_KEY, generated);
    return generated;
  } catch {
    return "ephemeral";
  }
}

function restTimerKey(scope: string) {
  return `${restTimerDeviceKey()}:${scope || "active"}`;
}

function isMissingRestTimerRpc(error: { message?: string } | null) {
  return Boolean(
    error &&
      (/schedule_rest_timer|cancel_rest_timer/i.test(error.message ?? "") ||
        /schema cache|function .* does not exist/i.test(error.message ?? "")),
  );
}

async function queueWebRestTimer(endsAt: Date, timerScope: string) {
  const { error } = await supabase.rpc("schedule_rest_timer", {
    p_timer_key: restTimerKey(timerScope),
    p_ends_at: endsAt.toISOString(),
  });
  if (error && !isMissingRestTimerRpc(error)) throw new Error(error.message);
  if (isMissingRestTimerRpc(error)) {
    console.warn(
      "[Rest timer] Server scheduling is not enabled; using the best-effort Service Worker fallback.",
    );
  }
}

async function cancelQueuedWebRestTimer(timerScope: string) {
  const { error } = await supabase.rpc("cancel_rest_timer", {
    p_timer_key: restTimerKey(timerScope),
  });
  if (error && !isMissingRestTimerRpc(error)) throw new Error(error.message);
}

function scheduledWorkoutDate(date: string): Date | null {
  const scheduled = new Date(
    `${date}T${String(WORKOUT_REMINDER_HOUR).padStart(2, "0")}:${String(
      WORKOUT_REMINDER_MINUTE,
    ).padStart(2, "0")}:00`,
  );
  return Number.isNaN(scheduled.getTime()) || scheduled <= new Date() ? null : scheduled;
}

async function savePushToken(userId: string, token: string, currentPlatform = platform()) {
  const storageKey = tokenStorageKey(userId, currentPlatform);
  let previousToken: string | null = null;
  try {
    previousToken = window.localStorage.getItem(storageKey);
  } catch {
    // The database remains the source of truth when local storage is unavailable.
  }

  let { error } = await supabase.rpc("claim_push_token", {
    p_token: token,
    p_platform: currentPlatform,
  });
  // Keep staged deployments usable until migration 56 reaches the connected
  // project. The RPC is the safe rotation path; this fallback preserves the
  // previous behavior only for projects that do not know the function yet.
  if (
    error &&
    (/claim_push_token/i.test(error.message) ||
      /schema cache|function .* does not exist/i.test(error.message))
  ) {
    const fallback = await supabase.from("push_tokens").upsert(
      {
        user_id: userId,
        token,
        provider: "fcm",
        platform: currentPlatform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
    error = fallback.error;
  }
  if (error) throw new Error(`שמירת מכשיר להתראות נכשלה: ${error.message}`);

  if (previousToken && previousToken !== token) {
    const { error: cleanupError } = await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("token", previousToken);
    if (cleanupError) {
      console.warn("[FCM token] Could not remove replaced token:", cleanupError.message);
    }
  }

  try {
    window.localStorage.setItem(storageKey, token);
  } catch {
    // The next successful refresh will still upsert the current token.
  }
}

async function showWebNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png", dir: "rtl", lang: "he" });
  } catch {
    // Safari may reject a foreground Notification in an unsupported context.
  }
}

async function showNativeNotification(title: string, body: string) {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationId(`${title}:${body}:${Date.now()}`),
        title,
        body,
        schedule: { at: new Date(Date.now() + 250) },
      },
    ],
  });
}

export async function showForegroundNotification(title: string, body: string) {
  if (Capacitor.isNativePlatform()) {
    await showNativeNotification(title, body);
  } else {
    await showWebNotification(title, body);
  }
}

export async function requestRestTimerNotificationPermission() {
  if (
    Capacitor.isNativePlatform() ||
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "default"
  ) {
    return;
  }
  await Notification.requestPermission();
}

export async function scheduleRestTimerNotification(endsAt: number, timerScope = "active") {
  const at = new Date(endsAt);
  if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) return;

  if (!Capacitor.isNativePlatform()) {
    if (webRestTimerTimeout !== null) {
      window.clearTimeout(webRestTimerTimeout);
      webRestTimerTimeout = null;
    }
    const delay = Math.max(0, at.getTime() - Date.now());
    // The Edge Function dispatcher is the closed-app delivery path. It uses
    // the registered FCM web token and remains independent of this page.
    void queueWebRestTimer(at, timerScope).catch((error) => {
      console.warn("[Rest timer] Could not queue server completion alert:", error);
    });
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready
        .then((registration) => {
          registration.active?.postMessage({
            type: "schedule-rest-timer",
            endsAt: at.getTime(),
          });
        })
        .catch(() => undefined);
    }
    webRestTimerTimeout = window.setTimeout(() => {
      webRestTimerTimeout = null;
      // Browsers do not expose a reliable background audio scheduler for a
      // normal tab. A granted system notification is the best available
      // background fallback; the in-page Web Audio tone handles foreground.
      if (
        document.visibilityState === "hidden" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("זמן המנוחה הסתיים", {
            body: "אפשר להתחיל את הסט הבא.",
            icon: "/icons/icon-192.png",
            dir: "rtl",
            lang: "he",
            tag: "gymtrack-rest-timer",
          });
        } catch {
          // The browser can reject notifications in an unsupported context.
        }
      }
    }, delay);
    return;
  }

  const permission = await LocalNotifications.checkPermissions();
  const resolvedPermission =
    permission.display === "prompt"
      ? await LocalNotifications.requestPermissions()
      : permission;
  if (resolvedPermission.display !== "granted") {
    throw new Error("הרשאת ההתראות נדחתה, ולכן אי אפשר להשמיע טיימר ברקע.");
  }

  await LocalNotifications.cancel({
    notifications: [{ id: REST_TIMER_NOTIFICATION_ID }],
  }).catch(() => undefined);
  if (Capacitor.getPlatform() === "android") {
    await LocalNotifications.createChannel({
      id: REST_TIMER_CHANNEL_ID,
      name: "סיום טיימר מנוחה",
      description: "צליל והתראה כשהמנוחה בין הסטים מסתיימת",
      sound: "rest_timer.wav",
      importance: 5,
      visibility: 1,
      vibration: true,
    }).catch(() => undefined);
  }
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REST_TIMER_NOTIFICATION_ID,
        title: "זמן המנוחה הסתיים",
        body: "אפשר להתחיל את הסט הבא.",
        sound: "rest_timer.wav",
        channelId: REST_TIMER_CHANNEL_ID,
        schedule: { at, allowWhileIdle: true },
        extra: { type: "rest-timer" },
      },
    ],
  });
}

export async function cancelRestTimerNotification(timerScope = "active") {
  if (!Capacitor.isNativePlatform()) {
    if (webRestTimerTimeout !== null) {
      window.clearTimeout(webRestTimerTimeout);
      webRestTimerTimeout = null;
    }
    void cancelQueuedWebRestTimer(timerScope).catch((error) => {
      if (!isMissingRestTimerRpc(error)) {
        console.warn("[Rest timer] Could not cancel server completion alert:", error);
      }
    });
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready
        .then((registration) => registration.active?.postMessage({ type: "cancel-rest-timer" }))
        .catch(() => undefined);
    }
    return;
  }
  await LocalNotifications.cancel({
    notifications: [{ id: REST_TIMER_NOTIFICATION_ID }],
  }).catch(() => undefined);
}

async function configureNativeNotifications(userId: string): Promise<DeliveryResult> {
  try {
    const { FirebaseMessaging } = await import("@capacitor-firebase/messaging");
    nativeUserId = userId;
    const pushPermission = await FirebaseMessaging.checkPermissions();
    const requestedPushPermission =
      pushPermission.receive === "prompt"
        ? await FirebaseMessaging.requestPermissions()
        : pushPermission;
    if (requestedPushPermission.receive !== "granted") {
      return { state: "error", detail: "הרשאת ההתראות נדחתה במכשיר." };
    }

    const localPermission = await LocalNotifications.checkPermissions();
    if (localPermission.display === "prompt") await LocalNotifications.requestPermissions();
    if (Capacitor.getPlatform() === "android") {
      await LocalNotifications.createChannel({
        id: "gymtrack",
        name: "GymTrack",
        description: "הודעות אימון והודעות מהמאמן",
        importance: 4,
        visibility: 1,
        vibration: true,
      }).catch(() => undefined);
    }

    if (!nativeListenersReady) {
      nativeListenersReady = true;
      await FirebaseMessaging.addListener("tokenReceived", ({ token }) => {
        if (!nativeUserId || !token) return;
        void savePushToken(nativeUserId, token, platform()).catch((error) =>
          console.warn("[FCM token] Could not persist native token:", error),
        );
      });
      await FirebaseMessaging.addListener("notificationReceived", ({ notification }) => {
        // FCM can already present a native notification for a notification
        // payload. Scheduling another local notification here duplicates it.
        // Only mirror the event while the app is not visible.
        if (typeof document !== "undefined" && document.visibilityState === "visible") return;
        const title = notification.title ?? "הודעה חדשה";
        const body = notification.body ?? "";
        if (body) void showNativeNotification(title, body).catch(() => undefined);
      });
    }

    const { token } = await FirebaseMessaging.getToken();
    if (!token) return { state: "error", detail: "Firebase לא החזיר token למכשיר." };
    await savePushToken(userId, token, platform());
  } catch (error) {
    return {
      state: "error",
      detail:
        error instanceof Error
          ? `הפעלת Firebase במכשיר נכשלה: ${error.message}`
          : "הפעלת Firebase במכשיר נכשלה. יש להוסיף google-services.json ו־GoogleService-Info.plist.",
    };
  }
  return {
    state: "ready",
    detail: "התראות Firebase הופעלו במכשיר הזה.",
  };
}

async function sendFirebaseConfigToServiceWorker(
  registration: ServiceWorkerRegistration,
  config: FirebaseClientConfig,
) {
  const active = registration.active ?? registration.waiting ?? registration.installing;
  if (!active) return;
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(resolve, 1_500);
    channel.port1.onmessage = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    active.postMessage({ type: "configure-firebase", config }, [channel.port2]);
  });
}

async function configureWebNotifications(userId: string): Promise<DeliveryResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { state: "error", detail: "הדפדפן הזה אינו תומך בהתראות." };
  }
  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") {
    return { state: "error", detail: "הרשאת ההתראות נדחתה בדפדפן." };
  }
  if (!("serviceWorker" in navigator)) {
    return { state: "ready", detail: "התראות הדפדפן הופעלו עבור שימוש כשהאתר פתוח." };
  }

    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
    updateViaCache: "none",
  });
    const readyRegistration = await navigator.serviceWorker.ready;
  const config = firebaseConfig();
  if (!config) {
    return {
      state: "error",
      detail: "הרשאת ההתראות הופעלה, אך חסרות הגדרות Firebase של האתר.",
    };
  }

  try {
    const [{ getApp, getApps, initializeApp }, messagingModule] = await Promise.all([
      import("firebase/app"),
      import("firebase/messaging"),
    ]);
    const app = getApps().some((candidate) => candidate.name === FIREBASE_APP_NAME)
      ? getApp(FIREBASE_APP_NAME)
      : initializeApp(config, FIREBASE_APP_NAME);
    const supported = await messagingModule.isSupported();
    if (!supported) {
      return { state: "ready", detail: "התראות הדפדפן הופעלו, אך Push אינו נתמך בדפדפן הזה." };
    }
    await sendFirebaseConfigToServiceWorker(readyRegistration, config);
    const messaging = messagingModule.getMessaging(app);
    const vapidKey = import.meta.env["VITE_FIREBASE_VAPID_KEY"];
    if (typeof vapidKey !== "string" || !vapidKey.trim()) {
      return { state: "error", detail: "חסר מפתח VAPID של Firebase עבור התראות Web." };
    }
    const tokenOptions = {
      vapidKey,
      serviceWorkerRegistration: readyRegistration,
    };
    const refreshToken = async () => {
      if (webUserId !== userId) return;
      const refreshedToken = await messagingModule.getToken(messaging, tokenOptions);
      if (refreshedToken) await savePushToken(userId, refreshedToken, "web");
    };
    const token = await messagingModule.getToken(messaging, tokenOptions);
    if (!token) return { state: "error", detail: "Firebase לא החזיר token למכשיר." };
    await savePushToken(userId, token, "web");
    webForegroundUnsubscribe?.();
    webForegroundUnsubscribe = messagingModule.onMessage(messaging, (payload) => {
      const title =
        payload.notification?.title ?? payload.data?.["title"] ?? "הודעה חדשה מהמאמן";
      const body = payload.notification?.body ?? payload.data?.["body"] ?? "";
      if (body) void showWebNotification(title, body);
    });
    webTokenRefreshCleanup?.();
    webUserId = userId;
    const refreshFromBrowserLifecycle = () => {
      void refreshToken().catch((error) => console.warn("[FCM token refresh]", error));
    };
    window.addEventListener("focus", refreshFromBrowserLifecycle);
    window.addEventListener("online", refreshFromBrowserLifecycle);
    document.addEventListener("visibilitychange", refreshFromBrowserLifecycle);
    const refreshInterval = window.setInterval(refreshFromBrowserLifecycle, 5 * 60 * 1_000);
    webTokenRefreshCleanup = () => {
      window.removeEventListener("focus", refreshFromBrowserLifecycle);
      window.removeEventListener("online", refreshFromBrowserLifecycle);
      document.removeEventListener("visibilitychange", refreshFromBrowserLifecycle);
      window.clearInterval(refreshInterval);
    };
    return { state: "ready", detail: "התראות Firebase הופעלו במכשיר הזה." };
  } catch (error) {
    console.warn("[FCM web setup]", error);
    return {
      state: "error",
      detail: error instanceof Error ? `הפעלת Firebase נכשלה: ${error.message}` : "הפעלת Firebase נכשלה.",
    };
  }
}

export async function configureNotificationDelivery(userId: string): Promise<DeliveryResult> {
  return Capacitor.isNativePlatform()
    ? configureNativeNotifications(userId)
    : configureWebNotifications(userId);
}

export async function disableNotificationDelivery(userId: string) {
  webForegroundUnsubscribe?.();
  webForegroundUnsubscribe = null;
  webTokenRefreshCleanup?.();
  webTokenRefreshCleanup = null;
  webUserId = null;
  nativeUserId = null;
  const currentPlatform = platform();
  let currentToken: string | null = null;
  try {
    currentToken = window.localStorage.getItem(tokenStorageKey(userId, currentPlatform));
  } catch {
    // Without the local token we cannot safely identify which device to remove.
  }
  if (Capacitor.isNativePlatform()) {
    await import("@capacitor-firebase/messaging")
      .then(({ FirebaseMessaging }) => FirebaseMessaging.deleteToken())
      .catch(() => undefined);
  }
  if (currentToken) {
    const { error } = await supabase
      .from("push_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("token", currentToken);
    if (error) console.warn("[FCM token] Could not remove device token:", error.message);
  }
  try {
    window.localStorage.removeItem(tokenStorageKey(userId, currentPlatform));
  } catch {
    // The remote delete above remains the best-effort cleanup.
  }
  if (Capacitor.isNativePlatform()) {
    const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
    await LocalNotifications.cancel({
      notifications: pending.notifications
        .filter((notification) => notification.id >= WORKOUT_NOTIFICATION_PREFIX)
        .map((notification) => ({ id: notification.id })),
    }).catch(() => undefined);
  }
}

export async function scheduleWorkoutReminders(reminders: WorkoutReminder[]) {
  if (!Capacitor.isNativePlatform()) return;
  await clearWorkoutReminders();
  const notifications = reminders
    .map((reminder) => {
      const at = scheduledWorkoutDate(reminder.date);
      if (!at) return null;
      return {
        id: notificationId(reminder.id),
        title: "האימון שלך מחכה",
        body: `היום בתכנית: ${reminder.workoutName}`,
        schedule: { at, allowWhileIdle: true },
      };
    })
    .filter((notification): notification is NonNullable<typeof notification> => Boolean(notification));
  if (notifications.length) await LocalNotifications.schedule({ notifications });
}

export async function clearWorkoutReminders() {
  if (!Capacitor.isNativePlatform()) return;
  const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
  const workoutNotifications = pending.notifications
    .filter((notification) => notification.id >= WORKOUT_NOTIFICATION_PREFIX)
    .map((notification) => ({ id: notification.id }));
  if (workoutNotifications.length) {
    await LocalNotifications.cancel({ notifications: workoutNotifications }).catch(() => undefined);
  }
}

export async function notifyRemotePush(payload: {
  recipientUserId?: string;
  audience?: "assigned_clients" | "coaches" | "clients" | "everyone";
  title: string;
  body: string;
  data?: Record<string, string>;
  deepLink?: string;
}): Promise<
  | { success: true; sent: number; failed: number }
  | { success: false; error: string; sent: number; failed: number }
> {
  try {
    const { data, error } = await supabase.functions.invoke("send-fcm-notification", {
      body: payload,
    });
    if (error) throw new Error(error.message);
    if (data && typeof data === "object" && "error" in data) {
      throw new Error(String(data.error));
    }
    const result = data as { sent?: number; failed?: number } | null;
    const sent = Number(result?.sent ?? 0);
    const failed = Number(result?.failed ?? 0);
    if (failed > 0) {
      return {
        success: false,
        error: `ההודעה נשמרה, אך ${failed} מכשירים לא קיבלו התראת Push.`,
        sent,
        failed,
      };
    }
    return { success: true, sent, failed };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "שליחת ההתראה נכשלה.";
    console.warn("[FCM remote notification]", detail);
    return { success: false, error: detail, sent: 0, failed: 0 };
  }
}