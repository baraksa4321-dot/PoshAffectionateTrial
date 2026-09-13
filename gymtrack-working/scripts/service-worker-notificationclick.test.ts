import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { expect, test } from "bun:test";

const serviceWorkerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

type NotificationData = Record<string, unknown> | undefined;

type Harness = {
  click(data: NotificationData): Promise<{ closed: boolean }>;
  push(payload: Record<string, unknown>): Promise<void>;
  openedTargets: string[];
  shownNotifications: Array<{ title: string; options: Record<string, unknown> }>;
};

async function createHarness(scope: string): Promise<Harness> {
  const listeners = new Map<string, (event: any) => void>();
  const openedTargets: string[] = [];
  const shownNotifications: Array<{ title: string; options: Record<string, unknown> }> = [];

  const serviceWorker = {
    registration: {
      scope,
      showNotification: async (title: string, options: Record<string, unknown>) => {
        shownNotifications.push({ title, options });
      },
    },
    clients: {
      matchAll: async () => [],
      openWindow: async (target: string) => {
        openedTargets.push(target);
        return { url: target };
      },
    },
    addEventListener: (type: string, listener: Parameters<typeof listeners.set>[1]) => {
      listeners.set(type, listener);
    },
  };

  runInNewContext(serviceWorkerSource, {
    URL,
    console,
    self: serviceWorker,
  });

  const notificationClick = listeners.get("notificationclick");
  if (!notificationClick) {
    throw new Error("Service Worker notificationclick listener was not registered.");
  }

  return {
    openedTargets,
    shownNotifications,
    click: async (data) => {
      let closed = false;
      let pending: Promise<unknown> | undefined;
      notificationClick({
        notification: {
          data,
          close: () => {
            closed = true;
          },
        },
        waitUntil: (promise) => {
          pending = promise;
        },
      });
      await pending;
      return { closed };
    },
    push: async (payload) => {
      const push = listeners.get("push");
      if (!push) throw new Error("Service Worker push listener was not registered.");
      let pending: Promise<unknown> | undefined;
      push({
        data: {
          json: () => payload,
          text: () => JSON.stringify(payload),
        },
        waitUntil: (promise: Promise<unknown>) => {
          pending = promise;
        },
      });
      await pending;
    },
  };
}

test("opens a flat deep link under the Service Worker scope", async () => {
  const harness = await createHarness("https://example.test/gymtrack/");

  const result = await harness.click({
    deep_link: "/gymtrack/coach/messages?client=trainee-7",
  });

  expect(result.closed).toBe(true);
  expect(harness.openedTargets).toEqual([
    "https://example.test/gymtrack/coach/messages?client=trainee-7",
  ]);
});

test("opens a deep link nested inside FCM_MSG data", async () => {
  const harness = await createHarness("https://example.test/gymtrack/");

  const result = await harness.click({
    FCM_MSG: {
      data: {
        deep_link: "/gymtrack/messages",
      },
    },
  });

  expect(result.closed).toBe(true);
  expect(harness.openedTargets).toEqual(["https://example.test/gymtrack/messages"]);
});

test("opens the Service Worker scope when a notification has no deep link", async () => {
  const scope = "https://example.test/gymtrack/";
  const harness = await createHarness(scope);

  const result = await harness.click({});

  expect(result.closed).toBe(true);
  expect(harness.openedTargets).toEqual([scope]);
});

test("does not navigate to an external origin from a protocol-relative deep link", async () => {
  const scope = "https://example.test/gymtrack/";
  const harness = await createHarness(scope);

  const result = await harness.click({
    deep_link: "//evil.example/phishing",
  });

  expect(result.closed).toBe(true);
  expect(harness.openedTargets).toEqual([scope]);
});

test("displays a data-only FCM push during a cold Service Worker start", async () => {
  const harness = await createHarness("https://example.test/gymtrack/");

  await harness.push({
    messageId: "message-1",
    data: {
      title: "עדכון מהמאמן",
      body: "יש לך הודעה חדשה",
      deep_link: "/gymtrack/messages",
    },
  });

  expect(harness.shownNotifications).toEqual([
    {
      title: "עדכון מהמאמן",
      options: {
        body: "יש לך הודעה חדשה",
        icon: "/icons/icon-192.png",
        dir: "rtl",
        lang: "he",
        tag: "gymtrack-message-1",
        data: {
          title: "עדכון מהמאמן",
          body: "יש לך הודעה חדשה",
          deep_link: "/gymtrack/messages",
        },
      },
    },
  ]);
});

test("does not display the same FCM message twice", async () => {
  const harness = await createHarness("https://example.test/gymtrack/");
  const payload = {
    messageId: "message-duplicate",
    data: { title: "עדכון", body: "בדיקה" },
  };

  await harness.push(payload);
  await harness.push(payload);

  expect(harness.shownNotifications).toHaveLength(1);
});