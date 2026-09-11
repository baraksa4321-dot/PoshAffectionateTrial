import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { expect, test } from "bun:test";

const serviceWorkerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

type NotificationData = Record<string, unknown> | undefined;

type Harness = {
  click(data: NotificationData): Promise<{ closed: boolean }>;
  openedTargets: string[];
};

async function createHarness(scope: string): Promise<Harness> {
  const listeners = new Map<string, (event: {
    notification: { data?: NotificationData; close: () => void };
    waitUntil: (promise: Promise<unknown>) => void;
  }) => void>();
  const openedTargets: string[] = [];

  const serviceWorker = {
    registration: { scope },
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