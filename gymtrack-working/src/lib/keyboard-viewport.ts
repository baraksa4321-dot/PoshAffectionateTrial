const KEYBOARD_THRESHOLD = 100;

export function isKeyboardEditableElement(element: Element | null): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element.matches(
      'input:not([type="hidden"]):not([type="file"]), textarea, [contenteditable="true"]',
    )
  );
}

let layoutViewportHeight = 0;

function currentViewport() {
  const visualViewport = window.visualViewport;
  const visibleHeight = visualViewport?.height ?? window.innerHeight;
  const viewportTop = visualViewport?.offsetTop ?? 0;
  const observedLayoutHeight = Math.max(
    window.innerHeight,
    document.documentElement.clientHeight,
    visibleHeight + viewportTop,
  );

  return { visibleHeight, viewportTop, observedLayoutHeight };
}

/**
 * iOS may resize both innerHeight and visualViewport when the keyboard opens.
 * Keep the largest observed height as the layout viewport so the keyboard
 * inset is not calculated as zero in that mode.
 */
export function getKeyboardViewportMetrics() {
  const { visibleHeight, viewportTop, observedLayoutHeight } = currentViewport();
  const activeElement = document.activeElement;
  const editableFocused = isKeyboardEditableElement(activeElement);
  const keyboardWasOpen = document.documentElement.hasAttribute("data-keyboard-open");

  if (!keyboardWasOpen && !editableFocused) {
    layoutViewportHeight = Math.max(layoutViewportHeight, observedLayoutHeight);
  }
  if (layoutViewportHeight === 0) {
    layoutViewportHeight = observedLayoutHeight;
  }

  const rawKeyboardInset = Math.max(
    0,
    layoutViewportHeight - visibleHeight - viewportTop,
  );
  const keyboardInset =
    editableFocused && rawKeyboardInset > KEYBOARD_THRESHOLD ? rawKeyboardInset : 0;

  return {
    visibleHeight,
    viewportTop,
    keyboardInset,
    keyboardOpen: keyboardInset > KEYBOARD_THRESHOLD,
  };
}