#!/usr/bin/env bash

set -Eeuo pipefail

port="${GYMTRACK_SMOKE_PORT:-4173}"
log_file="$(mktemp)"
preview_pid=""

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
  if [[ -n "$preview_pid" ]] && kill -0 "$preview_pid" 2>/dev/null; then
    kill "$preview_pid" 2>/dev/null || true
    wait "$preview_pid" 2>/dev/null || true
  fi
  rm -f "$log_file"
}
trap cleanup EXIT

configure_webkit_runtime

echo "Starting GymTrack release preview on port ${port}..."
(
  cd gymtrack-working
  npm run dev -- --host 127.0.0.1 --port "$port"
) >"$log_file" 2>&1 &
preview_pid="$!"

for _ in {1..30}; do
  if curl --fail --silent --show-error "http://127.0.0.1:${port}/" >/dev/null; then
    echo "GymTrack release preview started successfully."
    # Playwright's DLOPEN preflight only consults ldconfig, which cannot see
    # Nix store libraries. The actual WPE runtime was checked above and the
    # WebKit tests remain a required, fail-closed release gate.
    echo "Running GymTrack WebKit smoke tests for iPhone and desktop projects..."
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 \
      GYMTRACK_SMOKE_PORT="$port" \
      pnpm run test:ios -- --project=webkit-iphone --project=webkit-desktop --retries=1
    exit 0
  fi

  if ! kill -0 "$preview_pid" 2>/dev/null; then
    echo "ERROR: GymTrack release preview exited before it became ready." >&2
    cat "$log_file" >&2
    exit 1
  fi

  sleep 1
done

echo "ERROR: GymTrack release preview did not respond on port ${port} within 30 seconds." >&2
cat "$log_file" >&2
exit 1