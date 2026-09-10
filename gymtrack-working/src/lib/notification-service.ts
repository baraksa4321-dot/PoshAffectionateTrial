import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { supabase } from "./supabase";

const SERVICE_WORKER_URL = "/sw.js?v=12";
const WORKOUT_NOTIFICATION_PREFIX = 82_000;
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

function scheduledWorkoutDate(date: string): Date | null {
  const scheduled = new Date(
    `${date}T${String(WORKOUT_REMINDER_HOUR).padStart(2, "0")}:${String(
      WORKOUT_REMINDER_MINUTE,
    ).padStart(2, "0")}:00`,
  );
  return Number.isNaN(scheduled.getTime()) || scheduled <= new Date() ? null : scheduled;
}

async function savePushToken(userId: string, token: string, currentPlatform = platform()) {
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token,
      provider: "fcm",
      platform: currentPlatform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "token" },
  );
  if (error) throw new Error(`שמירת מכשיר להתראות נכשלה: ${error.message}`);
}

async function showWebNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
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

    if (!nativeListenersReady) {
      nativeListenersReady = true;
      await FirebaseMessaging.addListener("tokenReceived", ({ token }) => {
        if (!nativeUserId || !token) return;
        void savePushToken(nativeUserId, token, platform()).catch((error) =>
          console.warn("[FCM token] Could not persist native token:", error),
        );
      });
      await FirebaseMessaging.addListener("notificationReceived", ({ notification }) => {
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
    await sendFirebaseConfigToServiceWorker(registration, config);
    const messaging = messagingModule.getMessaging(app);
    const vapidKey = import.meta.env["VITE_FIREBASE_VAPID_KEY"];
    if (typeof vapidKey !== "string" || !vapidKey.trim()) {
      return { state: "error", detail: "חסר מפתח VAPID של Firebase עבור התראות Web." };
    }
    const token = await messagingModule.getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { state: "error", detail: "Firebase לא החזיר token למכשיר." };
    await savePushToken(userId, token, "web");
    webForegroundUnsubscribe?.();
    webForegroundUnsubscribe = messagingModule.onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "הודעה חדשה מהמאמן";
      const body = payload.notification?.body ?? "";
      if (body) void showWebNotification(title, body);
    });
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
  nativeUserId = null;
  if (Capacitor.isNativePlatform()) {
    await import("@capacitor-firebase/messaging")
      .then(({ FirebaseMessaging }) => FirebaseMessaging.deleteToken())
      .catch(() => undefined);
  }
  const { error } = await supabase.from("push_tokens").delete().eq("user_id", userId);
  if (error) console.warn("[FCM token] Could not remove device token:", error.message);
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

export async function notifyRemotePush(payload: {
  recipientUserId?: string;
  audience?: "assigned_clients" | "coaches" | "clients" | "everyone";
  title: string;
  body: string;
}) {
  try {
    await supabase.functions.invoke("send-fcm-notification", { body: payload });
  } catch (error) {
    console.warn("[FCM remote notification]", error);
  }
}