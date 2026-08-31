# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:367:1

# Error details

```
Error: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Please install them with the following command:      ║
║                                                      ║
║     sudo pnpm exec playwright install-deps           ║
║                                                      ║
║ Alternatively, use apt:                              ║
║     sudo apt-get install libatomic1\                 ║
║         libgles2\                                    ║
║         gstreamer1.0-libav                           ║
║                                                      ║
║ <3 Playwright Team                                   ║
╚══════════════════════════════════════════════════════╝
```