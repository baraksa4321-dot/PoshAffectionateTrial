# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1009:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'סיים ושמור אימון' })
    - locator resolved to <button type="button" data-tsd-source="/src/routes/session.$workoutId.tsx:1467:9" class="ui-button ui-button-primary primary-shadow press inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-bold tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="flex items-center gap-2" data-tsd-source="/src/routes/session.$workoutId.tsx:1812:19">…</div> from <div class="fixed z-[60]" data-tsd-source="/src/routes/session.$workoutId.tsx:1757:13">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="flex items-center gap-2" data-tsd-source="/src/routes/session.$workoutId.tsx:1812:19">…</div> from <div class="fixed z-[60]" data-tsd-source="/src/routes/session.$workoutId.tsx:1757:13">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    43 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="flex items-center gap-2" data-tsd-source="/src/routes/session.$workoutId.tsx:1812:19">…</div> from <div class="fixed z-[60]" data-tsd-source="/src/routes/session.$workoutId.tsx:1757:13">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - button "עצור טיימר מנוחה" [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e9]:
        - paragraph [ref=f1e10]: זמן מנוחה
        - paragraph [ref=f1e11]: 0:37
        - paragraph [ref=f1e12]: תרגיל בדיקה 1 (Smoke Exercise 1) · סט 1
      - generic [ref=f1e13]: פעיל
  - generic [ref=f1e14]:
    - banner [ref=f1e15]:
      - generic [ref=f1e16]:
        - generic [ref=f1e17]:
          - link "MY routine — דף הבית" [ref=f1e18]:
            - /url: /
            - img "MY routine" [ref=f1e19]
          - button "מעבר לתצוגת לילה" [ref=f1e20]
        - button "הפעלת אימון משקל גוף" [ref=f1e25]: אימון משקל גוף
        - generic [ref=f1e26]:
          - generic [ref=f1e27]:
            - paragraph [ref=f1e28]: תוכנית בדיקה לאייפון
            - heading "אימון בדיקה ארוך" [level=1] [ref=f1e29]
          - generic [ref=f1e30]:
            - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=f1e31]
            - generic [ref=f1e36]:
              - button "השהה אימון" [ref=f1e37] [cursor=pointer]
              - button "יציאה מהאימון" [ref=f1e41] [cursor=pointer]
    - main [ref=f1e45]:
      - generic [ref=f1e46]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
      - generic [ref=f1e52]:
        - paragraph [ref=f1e53]: התקדמות אימון
        - paragraph [ref=f1e54]: 0%
      - generic [ref=f1e55]:
        - article [ref=f1e56]:
          - generic [ref=f1e57]:
            - button "פתח פרטי תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=f1e58] [cursor=pointer]
            - generic [ref=f1e61]:
              - button "תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=f1e63] [cursor=pointer]
              - paragraph [ref=f1e64]: מכונה
            - generic [ref=f1e65]:
              - button "תחליף מורשה" [ref=f1e66] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e72] [cursor=pointer]: 60ש׳
          - generic [ref=f1e76]:
            - paragraph [ref=f1e77]: ביצוע בפועל
            - generic [ref=f1e78]:
              - generic [ref=f1e79]:
                - generic [ref=f1e80]:
                  - generic [ref=f1e81]: "1"
                  - paragraph [ref=f1e83]:
                    - text: סט 1
                    - generic [ref=f1e84]: · 123 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [active] [ref=f1e85] [cursor=pointer]
                - generic [ref=f1e88]:
                  - generic [ref=f1e89]:
                    - paragraph [ref=f1e90]: משקל בפועל
                    - generic [ref=f1e91]:
                      - button "הורד משקל בפועל" [ref=f1e92]
                      - generic [ref=f1e94]:
                        - textbox [ref=f1e95]: "123"
                        - generic [ref=f1e96]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e97]
                  - generic [ref=f1e99]:
                    - paragraph [ref=f1e100]: חזרות בפועל
                    - generic [ref=f1e101]:
                      - button "הורד חזרות בפועל" [ref=f1e102]
                      - textbox [ref=f1e105]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e106]
              - generic [ref=f1e108]:
                - generic [ref=f1e109]:
                  - generic [ref=f1e110]: "2"
                  - paragraph [ref=f1e112]:
                    - text: סט 2
                    - generic [ref=f1e113]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e114] [cursor=pointer]
                - generic [ref=f1e117]:
                  - generic [ref=f1e118]:
                    - paragraph [ref=f1e119]: משקל בפועל
                    - generic [ref=f1e120]:
                      - button "הורד משקל בפועל" [ref=f1e121]
                      - generic [ref=f1e123]:
                        - textbox [ref=f1e124]: "20"
                        - generic [ref=f1e125]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e126]
                  - generic [ref=f1e128]:
                    - paragraph [ref=f1e129]: חזרות בפועל
                    - generic [ref=f1e130]:
                      - button "הורד חזרות בפועל" [ref=f1e131]
                      - textbox [ref=f1e134]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e135]
              - generic [ref=f1e137]:
                - generic [ref=f1e138]:
                  - generic [ref=f1e139]: "3"
                  - paragraph [ref=f1e141]:
                    - text: סט 3
                    - generic [ref=f1e142]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e143] [cursor=pointer]
                - generic [ref=f1e146]:
                  - generic [ref=f1e147]:
                    - paragraph [ref=f1e148]: משקל בפועל
                    - generic [ref=f1e149]:
                      - button "הורד משקל בפועל" [ref=f1e150]
                      - generic [ref=f1e152]:
                        - textbox [ref=f1e153]: "20"
                        - generic [ref=f1e154]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e155]
                  - generic [ref=f1e157]:
                    - paragraph [ref=f1e158]: חזרות בפועל
                    - generic [ref=f1e159]:
                      - button "הורד חזרות בפועל" [ref=f1e160]
                      - textbox [ref=f1e163]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e164]
          - generic [ref=f1e168] [cursor=pointer]:
            - generic [ref=f1e173]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e174]
          - generic [ref=f1e175]:
            - paragraph [ref=f1e176]: איך היה התרגיל?
            - generic [ref=f1e177]:
              - button "קל" [ref=f1e178]
              - button "מתאים" [ref=f1e179]
              - button "כבד" [ref=f1e180]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e181]
        - article [ref=f1e182]:
          - generic [ref=f1e183]:
            - button "פתח פרטי תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e184] [cursor=pointer]
            - generic [ref=f1e187]:
              - button "תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e189] [cursor=pointer]
              - paragraph [ref=f1e190]: מכונה
            - generic [ref=f1e191]:
              - button "תחליף מורשה" [ref=f1e192] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e198] [cursor=pointer]: 60ש׳
          - generic [ref=f1e202]:
            - paragraph [ref=f1e203]: ביצוע בפועל
            - generic [ref=f1e204]:
              - generic [ref=f1e205]:
                - generic [ref=f1e206]:
                  - generic [ref=f1e207]: "1"
                  - paragraph [ref=f1e209]:
                    - text: סט 1
                    - generic [ref=f1e210]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e211] [cursor=pointer]
                - generic [ref=f1e214]:
                  - generic [ref=f1e215]:
                    - paragraph [ref=f1e216]: משקל בפועל
                    - generic [ref=f1e217]:
                      - button "הורד משקל בפועל" [ref=f1e218]
                      - generic [ref=f1e220]:
                        - textbox [ref=f1e221]: "21"
                        - generic [ref=f1e222]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e223]
                  - generic [ref=f1e225]:
                    - paragraph [ref=f1e226]: חזרות בפועל
                    - generic [ref=f1e227]:
                      - button "הורד חזרות בפועל" [ref=f1e228]
                      - textbox [ref=f1e231]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e232]
              - generic [ref=f1e234]:
                - generic [ref=f1e235]:
                  - generic [ref=f1e236]: "2"
                  - paragraph [ref=f1e238]:
                    - text: סט 2
                    - generic [ref=f1e239]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e240] [cursor=pointer]
                - generic [ref=f1e243]:
                  - generic [ref=f1e244]:
                    - paragraph [ref=f1e245]: משקל בפועל
                    - generic [ref=f1e246]:
                      - button "הורד משקל בפועל" [ref=f1e247]
                      - generic [ref=f1e249]:
                        - textbox [ref=f1e250]: "21"
                        - generic [ref=f1e251]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e252]
                  - generic [ref=f1e254]:
                    - paragraph [ref=f1e255]: חזרות בפועל
                    - generic [ref=f1e256]:
                      - button "הורד חזרות בפועל" [ref=f1e257]
                      - textbox [ref=f1e260]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e261]
              - generic [ref=f1e263]:
                - generic [ref=f1e264]:
                  - generic [ref=f1e265]: "3"
                  - paragraph [ref=f1e267]:
                    - text: סט 3
                    - generic [ref=f1e268]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e269] [cursor=pointer]
                - generic [ref=f1e272]:
                  - generic [ref=f1e273]:
                    - paragraph [ref=f1e274]: משקל בפועל
                    - generic [ref=f1e275]:
                      - button "הורד משקל בפועל" [ref=f1e276]
                      - generic [ref=f1e278]:
                        - textbox [ref=f1e279]: "21"
                        - generic [ref=f1e280]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e281]
                  - generic [ref=f1e283]:
                    - paragraph [ref=f1e284]: חזרות בפועל
                    - generic [ref=f1e285]:
                      - button "הורד חזרות בפועל" [ref=f1e286]
                      - textbox [ref=f1e289]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e290]
          - generic [ref=f1e294] [cursor=pointer]:
            - generic [ref=f1e299]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e300]
          - generic [ref=f1e301]:
            - paragraph [ref=f1e302]: איך היה התרגיל?
            - generic [ref=f1e303]:
              - button "קל" [ref=f1e304]
              - button "מתאים" [ref=f1e305]
              - button "כבד" [ref=f1e306]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e307]
        - article [ref=f1e308]:
          - generic [ref=f1e309]:
            - button "פתח פרטי תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e310] [cursor=pointer]
            - generic [ref=f1e313]:
              - button "תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e315] [cursor=pointer]
              - paragraph [ref=f1e316]: מכונה
            - generic [ref=f1e317]:
              - button "תחליף מורשה" [ref=f1e318] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e324] [cursor=pointer]: 60ש׳
          - generic [ref=f1e328]:
            - paragraph [ref=f1e329]: ביצוע בפועל
            - generic [ref=f1e330]:
              - generic [ref=f1e331]:
                - generic [ref=f1e332]:
                  - generic [ref=f1e333]: "1"
                  - paragraph [ref=f1e335]:
                    - text: סט 1
                    - generic [ref=f1e336]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e337] [cursor=pointer]
                - generic [ref=f1e340]:
                  - generic [ref=f1e341]:
                    - paragraph [ref=f1e342]: משקל בפועל
                    - generic [ref=f1e343]:
                      - button "הורד משקל בפועל" [ref=f1e344]
                      - generic [ref=f1e346]:
                        - textbox [ref=f1e347]: "22"
                        - generic [ref=f1e348]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e349]
                  - generic [ref=f1e351]:
                    - paragraph [ref=f1e352]: חזרות בפועל
                    - generic [ref=f1e353]:
                      - button "הורד חזרות בפועל" [ref=f1e354]
                      - textbox [ref=f1e357]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e358]
              - generic [ref=f1e360]:
                - generic [ref=f1e361]:
                  - generic [ref=f1e362]: "2"
                  - paragraph [ref=f1e364]:
                    - text: סט 2
                    - generic [ref=f1e365]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e366] [cursor=pointer]
                - generic [ref=f1e369]:
                  - generic [ref=f1e370]:
                    - paragraph [ref=f1e371]: משקל בפועל
                    - generic [ref=f1e372]:
                      - button "הורד משקל בפועל" [ref=f1e373]
                      - generic [ref=f1e375]:
                        - textbox [ref=f1e376]: "22"
                        - generic [ref=f1e377]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e378]
                  - generic [ref=f1e380]:
                    - paragraph [ref=f1e381]: חזרות בפועל
                    - generic [ref=f1e382]:
                      - button "הורד חזרות בפועל" [ref=f1e383]
                      - textbox [ref=f1e386]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e387]
              - generic [ref=f1e389]:
                - generic [ref=f1e390]:
                  - generic [ref=f1e391]: "3"
                  - paragraph [ref=f1e393]:
                    - text: סט 3
                    - generic [ref=f1e394]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e395] [cursor=pointer]
                - generic [ref=f1e398]:
                  - generic [ref=f1e399]:
                    - paragraph [ref=f1e400]: משקל בפועל
                    - generic [ref=f1e401]:
                      - button "הורד משקל בפועל" [ref=f1e402]
                      - generic [ref=f1e404]:
                        - textbox [ref=f1e405]: "22"
                        - generic [ref=f1e406]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e407]
                  - generic [ref=f1e409]:
                    - paragraph [ref=f1e410]: חזרות בפועל
                    - generic [ref=f1e411]:
                      - button "הורד חזרות בפועל" [ref=f1e412]
                      - textbox [ref=f1e415]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e416]
          - generic [ref=f1e420] [cursor=pointer]:
            - generic [ref=f1e425]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e426]
          - generic [ref=f1e427]:
            - paragraph [ref=f1e428]: איך היה התרגיל?
            - generic [ref=f1e429]:
              - button "קל" [ref=f1e430]
              - button "מתאים" [ref=f1e431]
              - button "כבד" [ref=f1e432]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e433]
        - article [ref=f1e434]:
          - generic [ref=f1e435]:
            - button "פתח פרטי תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e436] [cursor=pointer]
            - generic [ref=f1e439]:
              - button "תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e441] [cursor=pointer]
              - paragraph [ref=f1e442]: מכונה
            - generic [ref=f1e443]:
              - button "תחליף מורשה" [ref=f1e444] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e450] [cursor=pointer]: 60ש׳
          - generic [ref=f1e454]:
            - paragraph [ref=f1e455]: ביצוע בפועל
            - generic [ref=f1e456]:
              - generic [ref=f1e457]:
                - generic [ref=f1e458]:
                  - generic [ref=f1e459]: "1"
                  - paragraph [ref=f1e461]:
                    - text: סט 1
                    - generic [ref=f1e462]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e463] [cursor=pointer]
                - generic [ref=f1e466]:
                  - generic [ref=f1e467]:
                    - paragraph [ref=f1e468]: משקל בפועל
                    - generic [ref=f1e469]:
                      - button "הורד משקל בפועל" [ref=f1e470]
                      - generic [ref=f1e472]:
                        - textbox [ref=f1e473]: "23"
                        - generic [ref=f1e474]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e475]
                  - generic [ref=f1e477]:
                    - paragraph [ref=f1e478]: חזרות בפועל
                    - generic [ref=f1e479]:
                      - button "הורד חזרות בפועל" [ref=f1e480]
                      - textbox [ref=f1e483]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e484]
              - generic [ref=f1e486]:
                - generic [ref=f1e487]:
                  - generic [ref=f1e488]: "2"
                  - paragraph [ref=f1e490]:
                    - text: סט 2
                    - generic [ref=f1e491]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e492] [cursor=pointer]
                - generic [ref=f1e495]:
                  - generic [ref=f1e496]:
                    - paragraph [ref=f1e497]: משקל בפועל
                    - generic [ref=f1e498]:
                      - button "הורד משקל בפועל" [ref=f1e499]
                      - generic [ref=f1e501]:
                        - textbox [ref=f1e502]: "23"
                        - generic [ref=f1e503]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e504]
                  - generic [ref=f1e506]:
                    - paragraph [ref=f1e507]: חזרות בפועל
                    - generic [ref=f1e508]:
                      - button "הורד חזרות בפועל" [ref=f1e509]
                      - textbox [ref=f1e512]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e513]
              - generic [ref=f1e515]:
                - generic [ref=f1e516]:
                  - generic [ref=f1e517]: "3"
                  - paragraph [ref=f1e519]:
                    - text: סט 3
                    - generic [ref=f1e520]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e521] [cursor=pointer]
                - generic [ref=f1e524]:
                  - generic [ref=f1e525]:
                    - paragraph [ref=f1e526]: משקל בפועל
                    - generic [ref=f1e527]:
                      - button "הורד משקל בפועל" [ref=f1e528]
                      - generic [ref=f1e530]:
                        - textbox [ref=f1e531]: "23"
                        - generic [ref=f1e532]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e533]
                  - generic [ref=f1e535]:
                    - paragraph [ref=f1e536]: חזרות בפועל
                    - generic [ref=f1e537]:
                      - button "הורד חזרות בפועל" [ref=f1e538]
                      - textbox [ref=f1e541]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e542]
          - generic [ref=f1e546] [cursor=pointer]:
            - generic [ref=f1e551]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e552]
          - generic [ref=f1e553]:
            - paragraph [ref=f1e554]: איך היה התרגיל?
            - generic [ref=f1e555]:
              - button "קל" [ref=f1e556]
              - button "מתאים" [ref=f1e557]
              - button "כבד" [ref=f1e558]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e559]
        - article [ref=f1e560]:
          - generic [ref=f1e561]:
            - button "פתח פרטי תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e562] [cursor=pointer]
            - generic [ref=f1e565]:
              - button "תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e567] [cursor=pointer]
              - paragraph [ref=f1e568]: מכונה
            - generic [ref=f1e569]:
              - button "תחליף מורשה" [ref=f1e570] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e576] [cursor=pointer]: 60ש׳
          - generic [ref=f1e580]:
            - paragraph [ref=f1e581]: ביצוע בפועל
            - generic [ref=f1e582]:
              - generic [ref=f1e583]:
                - generic [ref=f1e584]:
                  - generic [ref=f1e585]: "1"
                  - paragraph [ref=f1e587]:
                    - text: סט 1
                    - generic [ref=f1e588]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e589] [cursor=pointer]
                - generic [ref=f1e592]:
                  - generic [ref=f1e593]:
                    - paragraph [ref=f1e594]: משקל בפועל
                    - generic [ref=f1e595]:
                      - button "הורד משקל בפועל" [ref=f1e596]
                      - generic [ref=f1e598]:
                        - textbox [ref=f1e599]: "24"
                        - generic [ref=f1e600]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e601]
                  - generic [ref=f1e603]:
                    - paragraph [ref=f1e604]: חזרות בפועל
                    - generic [ref=f1e605]:
                      - button "הורד חזרות בפועל" [ref=f1e606]
                      - textbox [ref=f1e609]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e610]
              - generic [ref=f1e612]:
                - generic [ref=f1e613]:
                  - generic [ref=f1e614]: "2"
                  - paragraph [ref=f1e616]:
                    - text: סט 2
                    - generic [ref=f1e617]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e618] [cursor=pointer]
                - generic [ref=f1e621]:
                  - generic [ref=f1e622]:
                    - paragraph [ref=f1e623]: משקל בפועל
                    - generic [ref=f1e624]:
                      - button "הורד משקל בפועל" [ref=f1e625]
                      - generic [ref=f1e627]:
                        - textbox [ref=f1e628]: "24"
                        - generic [ref=f1e629]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e630]
                  - generic [ref=f1e632]:
                    - paragraph [ref=f1e633]: חזרות בפועל
                    - generic [ref=f1e634]:
                      - button "הורד חזרות בפועל" [ref=f1e635]
                      - textbox [ref=f1e638]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e639]
              - generic [ref=f1e641]:
                - generic [ref=f1e642]:
                  - generic [ref=f1e643]: "3"
                  - paragraph [ref=f1e645]:
                    - text: סט 3
                    - generic [ref=f1e646]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e647] [cursor=pointer]
                - generic [ref=f1e650]:
                  - generic [ref=f1e651]:
                    - paragraph [ref=f1e652]: משקל בפועל
                    - generic [ref=f1e653]:
                      - button "הורד משקל בפועל" [ref=f1e654]
                      - generic [ref=f1e656]:
                        - textbox [ref=f1e657]: "24"
                        - generic [ref=f1e658]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e659]
                  - generic [ref=f1e661]:
                    - paragraph [ref=f1e662]: חזרות בפועל
                    - generic [ref=f1e663]:
                      - button "הורד חזרות בפועל" [ref=f1e664]
                      - textbox [ref=f1e667]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e668]
          - generic [ref=f1e672] [cursor=pointer]:
            - generic [ref=f1e677]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e678]
          - generic [ref=f1e679]:
            - paragraph [ref=f1e680]: איך היה התרגיל?
            - generic [ref=f1e681]:
              - button "קל" [ref=f1e682]
              - button "מתאים" [ref=f1e683]
              - button "כבד" [ref=f1e684]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e685]
        - article [ref=f1e686]:
          - generic [ref=f1e687]:
            - button "פתח פרטי תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e688] [cursor=pointer]
            - generic [ref=f1e691]:
              - button "תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e693] [cursor=pointer]
              - paragraph [ref=f1e694]: מכונה
            - generic [ref=f1e695]:
              - button "תחליף מורשה" [ref=f1e696] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e702] [cursor=pointer]: 60ש׳
          - generic [ref=f1e706]:
            - paragraph [ref=f1e707]: ביצוע בפועל
            - generic [ref=f1e708]:
              - generic [ref=f1e709]:
                - generic [ref=f1e710]:
                  - generic [ref=f1e711]: "1"
                  - paragraph [ref=f1e713]:
                    - text: סט 1
                    - generic [ref=f1e714]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e715] [cursor=pointer]
                - generic [ref=f1e718]:
                  - generic [ref=f1e719]:
                    - paragraph [ref=f1e720]: משקל בפועל
                    - generic [ref=f1e721]:
                      - button "הורד משקל בפועל" [ref=f1e722]
                      - generic [ref=f1e724]:
                        - textbox [ref=f1e725]: "25"
                        - generic [ref=f1e726]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e727]
                  - generic [ref=f1e729]:
                    - paragraph [ref=f1e730]: חזרות בפועל
                    - generic [ref=f1e731]:
                      - button "הורד חזרות בפועל" [ref=f1e732]
                      - textbox [ref=f1e735]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e736]
              - generic [ref=f1e738]:
                - generic [ref=f1e739]:
                  - generic [ref=f1e740]: "2"
                  - paragraph [ref=f1e742]:
                    - text: סט 2
                    - generic [ref=f1e743]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e744] [cursor=pointer]
                - generic [ref=f1e747]:
                  - generic [ref=f1e748]:
                    - paragraph [ref=f1e749]: משקל בפועל
                    - generic [ref=f1e750]:
                      - button "הורד משקל בפועל" [ref=f1e751]
                      - generic [ref=f1e753]:
                        - textbox [ref=f1e754]: "25"
                        - generic [ref=f1e755]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e756]
                  - generic [ref=f1e758]:
                    - paragraph [ref=f1e759]: חזרות בפועל
                    - generic [ref=f1e760]:
                      - button "הורד חזרות בפועל" [ref=f1e761]
                      - textbox [ref=f1e764]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e765]
              - generic [ref=f1e767]:
                - generic [ref=f1e768]:
                  - generic [ref=f1e769]: "3"
                  - paragraph [ref=f1e771]:
                    - text: סט 3
                    - generic [ref=f1e772]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e773] [cursor=pointer]
                - generic [ref=f1e776]:
                  - generic [ref=f1e777]:
                    - paragraph [ref=f1e778]: משקל בפועל
                    - generic [ref=f1e779]:
                      - button "הורד משקל בפועל" [ref=f1e780]
                      - generic [ref=f1e782]:
                        - textbox [ref=f1e783]: "25"
                        - generic [ref=f1e784]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e785]
                  - generic [ref=f1e787]:
                    - paragraph [ref=f1e788]: חזרות בפועל
                    - generic [ref=f1e789]:
                      - button "הורד חזרות בפועל" [ref=f1e790]
                      - textbox [ref=f1e793]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e794]
          - generic [ref=f1e798] [cursor=pointer]:
            - generic [ref=f1e803]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e804]
          - generic [ref=f1e805]:
            - paragraph [ref=f1e806]: איך היה התרגיל?
            - generic [ref=f1e807]:
              - button "קל" [ref=f1e808]
              - button "מתאים" [ref=f1e809]
              - button "כבד" [ref=f1e810]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e811]
        - article [ref=f1e812]:
          - generic [ref=f1e813]:
            - button "פתח פרטי תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e814] [cursor=pointer]
            - generic [ref=f1e817]:
              - button "תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e819] [cursor=pointer]
              - paragraph [ref=f1e820]: מכונה
            - generic [ref=f1e821]:
              - button "תחליף מורשה" [ref=f1e822] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e828] [cursor=pointer]: 60ש׳
          - generic [ref=f1e832]:
            - paragraph [ref=f1e833]: ביצוע בפועל
            - generic [ref=f1e834]:
              - generic [ref=f1e835]:
                - generic [ref=f1e836]:
                  - generic [ref=f1e837]: "1"
                  - paragraph [ref=f1e839]:
                    - text: סט 1
                    - generic [ref=f1e840]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e841] [cursor=pointer]
                - generic [ref=f1e844]:
                  - generic [ref=f1e845]:
                    - paragraph [ref=f1e846]: משקל בפועל
                    - generic [ref=f1e847]:
                      - button "הורד משקל בפועל" [ref=f1e848]
                      - generic [ref=f1e850]:
                        - textbox [ref=f1e851]: "26"
                        - generic [ref=f1e852]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e853]
                  - generic [ref=f1e855]:
                    - paragraph [ref=f1e856]: חזרות בפועל
                    - generic [ref=f1e857]:
                      - button "הורד חזרות בפועל" [ref=f1e858]
                      - textbox [ref=f1e861]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e862]
              - generic [ref=f1e864]:
                - generic [ref=f1e865]:
                  - generic [ref=f1e866]: "2"
                  - paragraph [ref=f1e868]:
                    - text: סט 2
                    - generic [ref=f1e869]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e870] [cursor=pointer]
                - generic [ref=f1e873]:
                  - generic [ref=f1e874]:
                    - paragraph [ref=f1e875]: משקל בפועל
                    - generic [ref=f1e876]:
                      - button "הורד משקל בפועל" [ref=f1e877]
                      - generic [ref=f1e879]:
                        - textbox [ref=f1e880]: "26"
                        - generic [ref=f1e881]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e882]
                  - generic [ref=f1e884]:
                    - paragraph [ref=f1e885]: חזרות בפועל
                    - generic [ref=f1e886]:
                      - button "הורד חזרות בפועל" [ref=f1e887]
                      - textbox [ref=f1e890]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e891]
              - generic [ref=f1e893]:
                - generic [ref=f1e894]:
                  - generic [ref=f1e895]: "3"
                  - paragraph [ref=f1e897]:
                    - text: סט 3
                    - generic [ref=f1e898]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e899] [cursor=pointer]
                - generic [ref=f1e902]:
                  - generic [ref=f1e903]:
                    - paragraph [ref=f1e904]: משקל בפועל
                    - generic [ref=f1e905]:
                      - button "הורד משקל בפועל" [ref=f1e906]
                      - generic [ref=f1e908]:
                        - textbox [ref=f1e909]: "26"
                        - generic [ref=f1e910]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e911]
                  - generic [ref=f1e913]:
                    - paragraph [ref=f1e914]: חזרות בפועל
                    - generic [ref=f1e915]:
                      - button "הורד חזרות בפועל" [ref=f1e916]
                      - textbox [ref=f1e919]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e920]
          - generic [ref=f1e924] [cursor=pointer]:
            - generic [ref=f1e929]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e930]
          - generic [ref=f1e931]:
            - paragraph [ref=f1e932]: איך היה התרגיל?
            - generic [ref=f1e933]:
              - button "קל" [ref=f1e934]
              - button "מתאים" [ref=f1e935]
              - button "כבד" [ref=f1e936]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e937]
        - article [ref=f1e938]:
          - generic [ref=f1e939]:
            - button "פתח פרטי תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e940] [cursor=pointer]
            - generic [ref=f1e943]:
              - button "תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e945] [cursor=pointer]
              - paragraph [ref=f1e946]: מכונה
            - generic [ref=f1e947]:
              - button "תחליף מורשה" [ref=f1e948] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e954] [cursor=pointer]: 60ש׳
          - generic [ref=f1e958]:
            - paragraph [ref=f1e959]: ביצוע בפועל
            - generic [ref=f1e960]:
              - generic [ref=f1e961]:
                - generic [ref=f1e962]:
                  - generic [ref=f1e963]: "1"
                  - paragraph [ref=f1e965]:
                    - text: סט 1
                    - generic [ref=f1e966]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e967] [cursor=pointer]
                - generic [ref=f1e970]:
                  - generic [ref=f1e971]:
                    - paragraph [ref=f1e972]: משקל בפועל
                    - generic [ref=f1e973]:
                      - button "הורד משקל בפועל" [ref=f1e974]
                      - generic [ref=f1e976]:
                        - textbox [ref=f1e977]: "27"
                        - generic [ref=f1e978]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e979]
                  - generic [ref=f1e981]:
                    - paragraph [ref=f1e982]: חזרות בפועל
                    - generic [ref=f1e983]:
                      - button "הורד חזרות בפועל" [ref=f1e984]
                      - textbox [ref=f1e987]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e988]
              - generic [ref=f1e990]:
                - generic [ref=f1e991]:
                  - generic [ref=f1e992]: "2"
                  - paragraph [ref=f1e994]:
                    - text: סט 2
                    - generic [ref=f1e995]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e996] [cursor=pointer]
                - generic [ref=f1e999]:
                  - generic [ref=f1e1000]:
                    - paragraph [ref=f1e1001]: משקל בפועל
                    - generic [ref=f1e1002]:
                      - button "הורד משקל בפועל" [ref=f1e1003]
                      - generic [ref=f1e1005]:
                        - textbox [ref=f1e1006]: "27"
                        - generic [ref=f1e1007]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e1008]
                  - generic [ref=f1e1010]:
                    - paragraph [ref=f1e1011]: חזרות בפועל
                    - generic [ref=f1e1012]:
                      - button "הורד חזרות בפועל" [ref=f1e1013]
                      - textbox [ref=f1e1016]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1017]
              - generic [ref=f1e1019]:
                - generic [ref=f1e1020]:
                  - generic [ref=f1e1021]: "3"
                  - paragraph [ref=f1e1023]:
                    - text: סט 3
                    - generic [ref=f1e1024]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e1025] [cursor=pointer]
                - generic [ref=f1e1028]:
                  - generic [ref=f1e1029]:
                    - paragraph [ref=f1e1030]: משקל בפועל
                    - generic [ref=f1e1031]:
                      - button "הורד משקל בפועל" [ref=f1e1032]
                      - generic [ref=f1e1034]:
                        - textbox [ref=f1e1035]: "27"
                        - generic [ref=f1e1036]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e1037]
                  - generic [ref=f1e1039]:
                    - paragraph [ref=f1e1040]: חזרות בפועל
                    - generic [ref=f1e1041]:
                      - button "הורד חזרות בפועל" [ref=f1e1042]
                      - textbox [ref=f1e1045]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1046]
          - generic [ref=f1e1050] [cursor=pointer]:
            - generic [ref=f1e1055]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e1056]
          - generic [ref=f1e1057]:
            - paragraph [ref=f1e1058]: איך היה התרגיל?
            - generic [ref=f1e1059]:
              - button "קל" [ref=f1e1060]
              - button "מתאים" [ref=f1e1061]
              - button "כבד" [ref=f1e1062]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e1063]
      - button "סיים ושמור אימון" [ref=f1e1065] [cursor=pointer]
    - navigation "ניווט ראשי":
      - generic [ref=f1e1068]:
        - link [ref=f1e1069]:
          - /url: /coach
        - link "מתאמנים" [ref=f1e1073]:
          - /url: /coach/clients
        - link "מעקב" [ref=f1e1080]:
          - /url: /coach/tracking
        - link "תרגילים" [ref=f1e1084]:
          - /url: /exercises
```

# Test source

```ts
  1100 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  1101 |   const fourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1102 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  1103 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  1104 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  1105 | 
  1106 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  1107 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  1108 |   await expect(setCountInput).toHaveValue("4");
  1109 |   const reopenedFourthSet = page.getByText("סט 4", { exact: true }).locator("..").locator("..");
  1110 |   await expect(
  1111 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  1112 |   ).toHaveValue("8");
  1113 |   await expect(
  1114 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  1115 |   ).toHaveValue("12");
  1116 | 
  1117 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  1118 |   await thirdSetMode.selectOption("drop");
  1119 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  1120 |   await dropRestInput.fill("45");
  1121 |   await expect(dropRestInput).toHaveValue("45");
  1122 | 
  1123 |   await thirdSetMode.selectOption("superset");
  1124 |   const supersetSearch = page.getByRole("searchbox", {
  1125 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  1126 |   });
  1127 |   await supersetSearch.fill("תרגיל בדיקה 2");
  1128 |   const supersetOption = page
  1129 |     .getByRole("listbox", { name: "תוצאות חיפוש לתרגיל בן־זוג" })
  1130 |     .getByRole("option", { name: /תרגיל בדיקה 2/ });
  1131 |   await expect(supersetOption).toBeVisible();
  1132 |   await supersetOption.click({ force: true });
  1133 |   await expect(supersetSearch).toHaveValue("");
  1134 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible({
  1135 |     timeout: 20_000,
  1136 |   });
  1137 | 
  1138 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1139 |   await expect(dayButtons).toHaveCount(4);
  1140 | 
  1141 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1142 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  1143 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  1144 |   await foodSearch.fill("אורז");
  1145 |   await assertKeyboardVisible(foodSearch);
  1146 |   await expect(foodSearch).toHaveValue("אורז");
  1147 |   await page.getByRole("option", { name: /אורז/ }).first().click();
  1148 |   const addFoodButton = page.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first();
  1149 |   await expect(addFoodButton).toBeEnabled();
  1150 |   await addFoodButton.click();
  1151 |   const nutritionMeal = page.locator('[id^="coach-menu-meal-"]').first();
  1152 |   const nutritionFoodQuantity = nutritionMeal.getByTestId("nutrition-food-quantity").first();
  1153 |   await expect(nutritionFoodQuantity).toBeVisible();
  1154 |   await expect(nutritionFoodQuantity).toHaveText(/\d/);
  1155 |   const coachMacroGrid = nutritionMeal.getByTestId("nutrition-macro-grid").first();
  1156 |   const coachMacroLabels = ["חלבון", "פחמימות", "שומן", "קלוריות"];
  1157 |   for (const [index, label] of coachMacroLabels.entries()) {
  1158 |     const macro = coachMacroGrid.locator("[data-nutrition-macro]").nth(index);
  1159 |     await expect(macro).toHaveAttribute("data-nutrition-macro", label);
  1160 |     await expect(macro.locator("[data-nutrition-macro-value]")).toHaveText(/\d/);
  1161 |   }
  1162 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  1163 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  1164 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1165 | 
  1166 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  1167 |   await dayButtons.nth(0).click();
  1168 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  1169 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  1170 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1171 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  1172 | 
  1173 |   await page.goto(`/session/${WORKOUT_ID}`);
  1174 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1175 |   const progress = page.locator(".workout-progress-sticky");
  1176 |   const firstExercise = page.locator("article").first();
  1177 |   const progressBottom = await progress.boundingBox();
  1178 |   const firstExerciseTop = await firstExercise.boundingBox();
  1179 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  1180 | 
  1181 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1182 |   await repsInput.fill("123");
  1183 |   await assertKeyboardVisible(repsInput);
  1184 |   await page.keyboard.press("Tab");
  1185 |   await expect(repsInput).toHaveValue("123");
  1186 | 
  1187 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1188 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1189 |   await expect(workoutNote).toBeVisible();
  1190 |   await workoutNote.fill("הערת בדיקה 123");
  1191 |   await assertKeyboardVisible(workoutNote);
  1192 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1193 |   await page.keyboard.press("Escape");
  1194 |   await expect(workoutNote).toBeHidden();
  1195 | 
  1196 |   await page.getByRole("button", { name: "סמן סט כבוצע" }).first().click();
  1197 |   await expect(page.getByText("4%", { exact: true })).toBeVisible();
  1198 |   await page.getByRole("button", { name: "בטל סיום סט" }).first().click();
  1199 |   await expect(page.getByText("0%", { exact: true })).toBeVisible();
> 1200 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
       |                                                                ^ Error: locator.click: Test timeout of 45000ms exceeded.
  1201 |   await expect(workoutNote).toBeVisible();
  1202 |   await expect(workoutNote).toHaveValue("הערת בדיקה 123");
  1203 |   await page.keyboard.press("Escape");
  1204 |   await expect(workoutNote).toBeHidden();
  1205 | 
  1206 |   await page.getByRole("button", { name: "פתח פרטי תרגיל בדיקה 1" }).click();
  1207 |   const detailsSheet = page.getByRole("dialog", { name: "פרטי תרגיל" });
  1208 |   await expect(detailsSheet).toBeVisible();
  1209 |   await detailsSheet.getByRole("button").first().click();
  1210 |   await expect(detailsSheet).toBeHidden();
  1211 |   await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  1212 | 
  1213 |   await page.locator("article").last().scrollIntoViewIfNeeded();
  1214 |   await expect(page.locator("article").last()).toBeInViewport();
  1215 | });
  1216 | 
  1217 | test("household portions stay correct across coach save and trainee replacement", async ({ page }) => {
  1218 |   await installFixture(page, { online: true });
  1219 | 
  1220 |   await page.goto("/");
  1221 |   await page.getByTestId("link-nav-coach").click();
  1222 |   await expect(page).toHaveURL(/\/coach\/clients/);
  1223 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1224 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1225 | 
  1226 |   const workspace = page.locator('[data-coach-workspace="true"]');
  1227 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1228 |     timeout: 20_000,
  1229 |   });
  1230 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1231 |   const menu = page.locator("#coach-menu");
  1232 |   await expect(menu).toBeVisible();
  1233 |   await expect(menu.getByText("2 כף", { exact: true })).toBeVisible();
  1234 | 
  1235 |   const addFood = async (searchTerm, unit, quantity) => {
  1236 |     await menu.getByRole("button", { name: "+ מאכל", exact: true }).first().click();
  1237 |     const foodSearch = menu.locator('input[type="search"][id^="menu-food-search-"]').first();
  1238 |     await foodSearch.fill(searchTerm);
  1239 |     await menu.getByRole("option", { name: new RegExp(searchTerm) }).first().click();
  1240 |     const unitSelect = menu.getByRole("combobox", { name: "יחידת מידה למאכל" });
  1241 |     await expect(unitSelect).toBeVisible();
  1242 |     await unitSelect.selectOption(unit);
  1243 |     await menu.getByRole("textbox", { name: "כמות המאכל" }).fill(String(quantity));
  1244 |     await menu.getByRole("button", { name: "הוסיפי לארוחה", exact: true }).first().click();
  1245 |   };
  1246 | 
  1247 |   await addFood("יוגורט", "unit", 1);
  1248 |   await addFood("שמן זית", "tbsp", 1);
  1249 |   await addFood("משקה חלב", "cup", 1);
  1250 |   await addFood("גבינה צהובה", "slice", 2);
  1251 |   await addFood("אורז מבושל", "cup", 1);
  1252 | 
  1253 |   const macroGrid = menu.getByTestId("nutrition-macro-grid").first();
  1254 |   const expectedMacros = [
  1255 |     ["חלבון", "39.5"],
  1256 |     ["פחמימות", "111.3"],
  1257 |     ["שומן", "32.9"],
  1258 |     ["קלוריות", "931.1"],
  1259 |   ];
  1260 |   for (const [label, value] of expectedMacros) {
  1261 |     await expect(
  1262 |       macroGrid.locator(`[data-nutrition-macro="${label}"] [data-nutrition-macro-value]`),
  1263 |     ).toHaveText(value);
  1264 |   }
  1265 | 
  1266 |   const saveMenuButton = menu.getByRole("button", { name: "שמרי תפריט", exact: true });
  1267 |   await saveMenuButton.click();
  1268 |   await expect(saveMenuButton).toHaveText("שמרי תפריט");
  1269 |   await expect(menu).toContainText("יוגורט טבעי");
  1270 | 
  1271 |   await page.getByRole("button", { name: "סגירת תכנית המתאמן" }).click();
  1272 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("מתאמנת");
  1273 |   await page.getByText("מתאמנת בדיקה", { exact: true }).first().click();
  1274 |   await expect(workspace).toHaveAttribute("data-coach-details-state", "ready", {
  1275 |     timeout: 20_000,
  1276 |   });
  1277 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  1278 |   await expect(page.locator("#coach-menu")).toContainText("יוגורט טבעי");
  1279 |   await expect(page.locator("#coach-menu")).toContainText("1 יחידה");
  1280 |   await expect(page.locator("#coach-menu")).toContainText("1 כף");
  1281 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1282 |   await expect(page.locator("#coach-menu")).toContainText("2 פרוסה");
  1283 |   await expect(page.locator("#coach-menu")).toContainText("1 כוס");
  1284 | 
  1285 |   const savedPlannedMenu = await page.evaluate(() => window.__iosSmokeGetPlannedMenu?.());
  1286 |   const traineePage = await page.context().newPage();
  1287 |   await installFixture(traineePage, { role: "trainee", plannedMenu: savedPlannedMenu });
  1288 |   await traineePage.goto("/nutrition");
  1289 |   await expect(traineePage).toHaveURL(/\/nutrition/);
  1290 |   await expect(traineePage.getByTestId("nutrition-food-quantity").first()).toHaveText("2 כף");
  1291 | 
  1292 |   await traineePage.getByRole("button", { name: "החלפת מאכל", exact: true }).first().click();
  1293 |   const replacementDialog = traineePage.getByRole("dialog", { name: "החלפת מאכל" });
  1294 |   await expect(replacementDialog).toBeVisible();
  1295 |   await replacementDialog.locator('input[placeholder*="חפשי מאכל חלופי"]').fill("יוגורט");
  1296 |   const yogurtReplacement = replacementDialog.getByRole("button", { name: /יוגורט/ }).first();
  1297 |   await expect(yogurtReplacement).toContainText("כף");
  1298 |   const replacementName = (await yogurtReplacement.locator("p").first().textContent())?.trim();
  1299 |   expect(replacementName).toBeTruthy();
  1300 |   await yogurtReplacement.click();
```