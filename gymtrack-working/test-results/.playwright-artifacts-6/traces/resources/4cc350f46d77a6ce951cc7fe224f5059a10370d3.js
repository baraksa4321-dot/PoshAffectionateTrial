"use strict";const waitForSuccessfulPingInternal = async function waitForSuccessfulPingInternal(socketUrl, visibilityManager, ms = 1e3) {
	function wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	async function ping() {
		try {
			const socket = new WebSocket(socketUrl, "vite-ping");
			return new Promise((resolve) => {
				function onOpen() {
					resolve(true);
					close();
				}
				function onError() {
					resolve(false);
					close();
				}
				function close() {
					socket.removeEventListener("open", onOpen);
					socket.removeEventListener("error", onError);
					socket.close();
				}
				socket.addEventListener("open", onOpen);
				socket.addEventListener("error", onError);
			});
		} catch {
			return false;
		}
	}
	function waitForWindowShow(visibilityManager) {
		return new Promise((resolve) => {
			const onChange = (newVisibility) => {
				if (newVisibility === "visible") {
					resolve();
					visibilityManager.listeners.delete(onChange);
				}
			};
			visibilityManager.listeners.add(onChange);
		});
	}
	if (await ping()) return;
	await wait(ms);
	while (true) if (visibilityManager.currentState === "visible") {
		if (await ping()) break;
		await wait(ms);
	} else await waitForWindowShow(visibilityManager);
};const fn = function pingWorkerContentMain(socketUrl) {
	self.addEventListener("connect", (_event) => {
		const port = _event.ports[0];
		if (!socketUrl) {
			port.postMessage({
				type: "error",
				error: /* @__PURE__ */ new Error("socketUrl not found")
			});
			return;
		}
		const visibilityManager = {
			currentState: "visible",
			listeners: /* @__PURE__ */ new Set()
		};
		port.addEventListener("message", (event) => {
			const { visibility } = event.data;
			visibilityManager.currentState = visibility;
			console.debug("[vite] new window visibility", visibility);
			for (const listener of visibilityManager.listeners) listener(visibility);
		});
		port.start();
		console.debug("[vite] connected from window");
		waitForSuccessfulPingInternal(socketUrl, visibilityManager).then(() => {
			console.debug("[vite] ping successful");
			try {
				port.postMessage({ type: "success" });
			} catch (error) {
				port.postMessage({
					type: "error",
					error
				});
			}
		}, (error) => {
			console.debug("[vite] error happened", error);
			try {
				port.postMessage({
					type: "error",
					error
				});
			} catch (error) {
				port.postMessage({
					type: "error",
					error
				});
			}
		});
	});
};fn("ws://127.0.0.1:4173/")