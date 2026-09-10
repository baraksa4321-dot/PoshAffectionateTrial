#!/usr/bin/env bash

set -Eeuo pipefail

port="${GYMTRACK_SMOKE_PORT:-4173}"
preview_start_timeout_seconds="${GYMTRACK_PREVIEW_START_TIMEOUT_SECONDS:-30}"
webkit_timeout_seconds="${GYMTRACK_WEBKIT_TIMEOUT_SECONDS:-180}"
log_file="$(mktemp)"
preview_pid=""
cleanup_started=false

configure_webkit_runtime() {
  local webkit_dir
  local nix_library_path
  local gst_libav_path
  local wrapper
  local missing_dependencies

  webkit_dir="$(node --input-type=module -e '
    import { dirname } from "node:path";
    import { webkit } from "@playwright/test";
    process.stdout.write(dirname(webkit.executablePath()));
  ')"
  nix_library_path="$(nix eval --raw --impure --expr '
    with import <nixpkgs> {};
    lib.makeLibraryPath [
      webkitgtk_6_0
      gcc.cc.lib
      libjxl
      gst_all_1.gstreamer
      gst_all_1.gst-plugins-base
      gst_all_1.gst-plugins-bad
      gst_all_1.gst-libav
      libglvnd
      mesa
      gtk4
      glib
      libsoup_3
    ]
  ')"
  gst_libav_path="$(nix eval --raw --impure --expr '
    with import <nixpkgs> {};
    gst_all_1.gst-libav.outPath
  ')/lib/gstreamer-1.0"

  export GYMTRACK_WEBKIT_NIX_LIBRARY_PATH="$nix_library_path"
  export GST_PLUGIN_PATH="$gst_libav_path${GST_PLUGIN_PATH:+:$GST_PLUGIN_PATH}"

  for wrapper in \
    "$webkit_dir/minibrowser-gtk/MiniBrowser" \
    "$webkit_dir/minibrowser-wpe/MiniBrowser"; do
    if [[ ! -f "$wrapper" ]]; then
      echo "ERROR: Playwright WebKit wrapper is missing: $wrapper" >&2
      return 1
    fi

    if ! grep -q "GYMTRACK_WEBKIT_NIX_LIBRARY_PATH" "$wrapper"; then
      sed -i \
        's#export LD_LIBRARY_PATH="${MYDIR}/lib:${MYDIR}/sys/lib"#export LD_LIBRARY_PATH="${MYDIR}/lib:${MYDIR}/sys/lib${GYMTRACK_WEBKIT_NIX_LIBRARY_PATH:+:$GYMTRACK_WEBKIT_NIX_LIBRARY_PATH}"#' \
        "$wrapper"
    fi
  done

  missing_dependencies="$(
    LD_LIBRARY_PATH="$webkit_dir/minibrowser-wpe/lib:$webkit_dir/minibrowser-wpe/sys/lib:$nix_library_path" \
      ldd "$webkit_dir/minibrowser-wpe/bin/MiniBrowser" |
      awk '/not found/ { print $1 }'
  )"
  if [[ -n "$missing_dependencies" ]]; then
    echo "ERROR: Playwright WebKit runtime is missing libraries:" >&2
    printf '  %s\n' $missing_dependencies >&2
    return 1
  fi

  if [[ ! -f "$gst_libav_path/libgstlibav.so" ]]; then
    echo "ERROR: GStreamer libav plugin is missing: $gst_libav_path/libgstlibav.so" >&2
    return 1
  fi
}

cleanup() {
  if [[ "$cleanup_started" == true ]]; then
    return
  fi
  cleanup_started=true

  if [[ -n "$preview_pid" ]] && kill -0 "$preview_pid" 2>/dev/null; then
    echo "Stopping GymTrack preview process group ${preview_pid}..."
    kill -TERM -- "-${preview_pid}" 2>/dev/null || kill "$preview_pid" 2>/dev/null || true
    for _ in {1..50}; do
      if ! kill -0 -- "-${preview_pid}" 2>/dev/null; then
        break
      fi
      sleep 0.1
    done
    if kill -0 -- "-${preview_pid}" 2>/dev/null; then
      echo "Preview process group did not stop after 5 seconds; forcing termination." >&2
      kill -KILL -- "-${preview_pid}" 2>/dev/null || true
    fi
    wait "$preview_pid" 2>/dev/null || true
  fi
  rm -f "$log_file"
}
trap cleanup EXIT

configure_webkit_runtime

echo "Starting GymTrack release preview on port ${port}..."
# Put the preview and all of its npm/vite children in one process group so
# cleanup cannot leave a server behind or wait on an orphaned child.
if command -v setsid >/dev/null 2>&1; then
  setsid bash -c 'cd gymtrack-working && exec npm run dev -- --host 127.0.0.1 --port "$1"' \
    bash "$port" >"$log_file" 2>&1 &
else
  (
    cd gymtrack-working
    exec npm run dev -- --host 127.0.0.1 --port "$port"
  ) >"$log_file" 2>&1 &
fi
preview_pid="$!"

for _ in $(seq 1 "$preview_start_timeout_seconds"); do
  if curl --fail --silent --show-error "http://127.0.0.1:${port}/" >/dev/null; then
    echo "GymTrack release preview started successfully."
    # Playwright's DLOPEN preflight only consults ldconfig, which cannot see
    # Nix store libraries. The actual WPE runtime was checked above and the
    # WebKit tests remain a required, fail-closed release gate.
    echo "Running GymTrack WebKit smoke tests for iPhone and desktop projects..."
    if timeout --foreground --signal=TERM --kill-after=10s "$webkit_timeout_seconds" \
      env PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 \
        GYMTRACK_SMOKE_PORT="$port" \
        pnpm run test:ios -- --project=webkit-iphone --project=webkit-desktop --retries=1
    then
      echo "PASS: WebKit iPhone and desktop smoke tests completed."
    else
      status=$?
      if [[ "$status" -eq 124 || "$status" -eq 137 ]]; then
        echo "FAIL: WebKit smoke timed out after ${webkit_timeout_seconds}s." >&2
        echo "Action: inspect the last test step above and rerun with GYMTRACK_WEBKIT_TIMEOUT_SECONDS set higher only after investigating." >&2
      else
        echo "FAIL: WebKit smoke exited with status ${status}." >&2
      fi
      echo "Preview server log:" >&2
      cat "$log_file" >&2
      exit "$status"
    fi
    exit 0
  fi

  if ! kill -0 "$preview_pid" 2>/dev/null; then
    echo "ERROR: GymTrack release preview exited before it became ready." >&2
    cat "$log_file" >&2
    exit 1
  fi

  sleep 1
done

echo "ERROR: GymTrack release preview did not respond on port ${port} within ${preview_start_timeout_seconds} seconds." >&2
cat "$log_file" >&2
exit 1
