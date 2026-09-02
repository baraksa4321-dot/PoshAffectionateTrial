# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:413:1

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /home/runner/workspace/.cache/ms-playwright/webkit-2336/pw_run.sh --inspector-pipe --headless --no-startup-window
<launched> pid=5062
[pid=5062][err] /home/runner/workspace/.cache/ms-playwright/webkit-2336/minibrowser-wpe/bin/MiniBrowser: error while loading shared libraries: libatomic.so.1: cannot open shared object file: No such file or directory
Call log:
  - <launching> /home/runner/workspace/.cache/ms-playwright/webkit-2336/pw_run.sh --inspector-pipe --headless --no-startup-window
  - <launched> pid=5062
  - [pid=5062][err] /home/runner/workspace/.cache/ms-playwright/webkit-2336/minibrowser-wpe/bin/MiniBrowser: error while loading shared libraries: libatomic.so.1: cannot open shared object file: No such file or directory
  - [pid=5062] <gracefully close start>
  - [pid=5062] <kill>
  - [pid=5062] <will force kill>
  - [pid=5062] exception while trying to kill process: Error: kill ESRCH
  - [pid=5062] <process did exit: exitCode=127, signal=null>
  - [pid=5062] starting temporary directories cleanup
  - [pid=5062] finished temporary directories cleanup
  - [pid=5062] <gracefully close end>

```