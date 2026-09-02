# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:284:1

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /home/runner/workspace/.cache/ms-playwright/webkit-2336/pw_run.sh --inspector-pipe --headless --no-startup-window
<launched> pid=5083
[pid=5083][err] /home/runner/workspace/.cache/ms-playwright/webkit-2336/minibrowser-wpe/bin/MiniBrowser: error while loading shared libraries: libatomic.so.1: cannot open shared object file: No such file or directory
Call log:
  - <launching> /home/runner/workspace/.cache/ms-playwright/webkit-2336/pw_run.sh --inspector-pipe --headless --no-startup-window
  - <launched> pid=5083
  - [pid=5083][err] /home/runner/workspace/.cache/ms-playwright/webkit-2336/minibrowser-wpe/bin/MiniBrowser: error while loading shared libraries: libatomic.so.1: cannot open shared object file: No such file or directory
  - [pid=5083] <gracefully close start>
  - [pid=5083] <kill>
  - [pid=5083] <will force kill>
  - [pid=5083] exception while trying to kill process: Error: kill ESRCH
  - [pid=5083] <process did exit: exitCode=127, signal=null>
  - [pid=5083] starting temporary directories cleanup
  - [pid=5083] finished temporary directories cleanup
  - [pid=5083] <gracefully close end>

```