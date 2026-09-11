# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> active workout values survive leaving and reopening the session
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1396:1

# Error details

```
Error: Channel closed
```

```
Error: expect(locator).toBeVisible() failed

Locator:  getByPlaceholder('למשל: עומס קל במרפק ימין בסט האחרון...')
Expected: visible
Received: undefined

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByPlaceholder('למשל: עומס קל במרפק ימין בסט האחרון...')
  - 

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - button "פתח טיימר מנוחה" [ref=e3]:
    - paragraph [ref=e8]: טיימר
  - generic [ref=e9]:
    - banner [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - link "MY routine — דף הבית" [ref=e13]:
            - /url: /
            - img "MY routine" [ref=e14]
          - button "מעבר לתצוגת לילה" [ref=e15]
        - button "הפעלת אימון משקל גוף" [ref=e20]: אימון משקל גוף
        - generic [ref=e21]:
          - generic [ref=e22]:
            - paragraph [ref=e23]: תוכנית בדיקה לאייפון
            - heading "אימון בדיקה ארוך" [level=1] [ref=e24]
          - generic [ref=e25]:
            - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=e26]
            - generic [ref=e31]:
              - button "השהה אימון" [ref=e32] [cursor=pointer]
              - button "יציאה מהאימון" [ref=e36] [cursor=pointer]
    - main [ref=e40]:
      - generic [ref=e41]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
      - generic [ref=e47]:
        - paragraph [ref=e48]: התקדמות אימון
        - paragraph [ref=e49]: 0%
      - generic [ref=e50]:
        - article [ref=e51]:
          - generic [ref=e52]:
            - button "פתח פרטי תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=e53] [cursor=pointer]
            - generic [ref=e56]:
              - button "תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=e58] [cursor=pointer]
              - paragraph [ref=e59]: מכונה
            - generic [ref=e60]:
              - button "תחליף מורשה" [ref=e61] [cursor=pointer]
              - button "התחל מנוחה" [ref=e67] [cursor=pointer]: 60ש׳
          - generic [ref=e71]:
            - paragraph [ref=e72]: ביצוע בפועל
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]: "1"
                  - paragraph [ref=e78]:
                    - text: סט 1
                    - generic [ref=e79]: · 123 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=e80] [cursor=pointer]
                - generic [ref=e83]:
                  - generic [ref=e84]:
                    - paragraph [ref=e85]: משקל בפועל
                    - generic [ref=e86]:
                      - button "הורד משקל בפועל" [ref=e87]
                      - generic [ref=e89]:
                        - textbox [ref=e90]: "123"
                        - generic [ref=e91]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e92]
                  - generic [ref=e94]:
                    - paragraph [ref=e95]: חזרות בפועל
                    - generic [ref=e96]:
                      - button "הורד חזרות בפועל" [ref=e97]
                      - textbox [ref=e100]: "8"
                      - button "הגדל חזרות בפועל" [ref=e101]
              - generic [ref=e103]:
                - generic [ref=e104]:
                  - generic [ref=e105]: "2"
                  - paragraph [ref=e107]:
                    - text: סט 2
                    - generic [ref=e108]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=e109] [cursor=pointer]
                - generic [ref=e112]:
                  - generic [ref=e113]:
                    - paragraph [ref=e114]: משקל בפועל
                    - generic [ref=e115]:
                      - button "הורד משקל בפועל" [ref=e116]
                      - generic [ref=e118]:
                        - textbox [ref=e119]: "20"
                        - generic [ref=e120]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e121]
                  - generic [ref=e123]:
                    - paragraph [ref=e124]: חזרות בפועל
                    - generic [ref=e125]:
                      - button "הורד חזרות בפועל" [ref=e126]
                      - textbox [ref=e129]: "8"
                      - button "הגדל חזרות בפועל" [ref=e130]
              - generic [ref=e132]:
                - generic [ref=e133]:
                  - generic [ref=e134]: "3"
                  - paragraph [ref=e136]:
                    - text: סט 3
                    - generic [ref=e137]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=e138] [cursor=pointer]
                - generic [ref=e141]:
                  - generic [ref=e142]:
                    - paragraph [ref=e143]: משקל בפועל
                    - generic [ref=e144]:
                      - button "הורד משקל בפועל" [ref=e145]
                      - generic [ref=e147]:
                        - textbox [ref=e148]: "20"
                        - generic [ref=e149]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e150]
                  - generic [ref=e152]:
                    - paragraph [ref=e153]: חזרות בפועל
                    - generic [ref=e154]:
                      - button "הורד חזרות בפועל" [ref=e155]
                      - textbox [ref=e158]: "8"
                      - button "הגדל חזרות בפועל" [ref=e159]
          - generic [ref=e163] [cursor=pointer]:
            - generic [ref=e168]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e169]
          - generic [ref=e170]:
            - paragraph [ref=e171]: איך היה התרגיל?
            - generic [ref=e172]:
              - button "קל" [ref=e173]
              - button "מתאים" [ref=e174]
              - button "כבד" [ref=e175]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e176]
        - article [ref=e177]:
          - generic [ref=e178]:
            - button "פתח פרטי תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=e179] [cursor=pointer]
            - generic [ref=e182]:
              - button "תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=e184] [cursor=pointer]
              - paragraph [ref=e185]: מכונה
            - generic [ref=e186]:
              - button "תחליף מורשה" [ref=e187] [cursor=pointer]
              - button "התחל מנוחה" [ref=e193] [cursor=pointer]: 60ש׳
          - generic [ref=e197]:
            - paragraph [ref=e198]: ביצוע בפועל
            - generic [ref=e199]:
              - generic [ref=e200]:
                - generic [ref=e201]:
                  - generic [ref=e202]: "1"
                  - paragraph [ref=e204]:
                    - text: סט 1
                    - generic [ref=e205]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=e206] [cursor=pointer]
                - generic [ref=e209]:
                  - generic [ref=e210]:
                    - paragraph [ref=e211]: משקל בפועל
                    - generic [ref=e212]:
                      - button "הורד משקל בפועל" [ref=e213]
                      - generic [ref=e215]:
                        - textbox [ref=e216]: "21"
                        - generic [ref=e217]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e218]
                  - generic [ref=e220]:
                    - paragraph [ref=e221]: חזרות בפועל
                    - generic [ref=e222]:
                      - button "הורד חזרות בפועל" [ref=e223]
                      - textbox [ref=e226]: "9"
                      - button "הגדל חזרות בפועל" [ref=e227]
              - generic [ref=e229]:
                - generic [ref=e230]:
                  - generic [ref=e231]: "2"
                  - paragraph [ref=e233]:
                    - text: סט 2
                    - generic [ref=e234]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=e235] [cursor=pointer]
                - generic [ref=e238]:
                  - generic [ref=e239]:
                    - paragraph [ref=e240]: משקל בפועל
                    - generic [ref=e241]:
                      - button "הורד משקל בפועל" [ref=e242]
                      - generic [ref=e244]:
                        - textbox [ref=e245]: "21"
                        - generic [ref=e246]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e247]
                  - generic [ref=e249]:
                    - paragraph [ref=e250]: חזרות בפועל
                    - generic [ref=e251]:
                      - button "הורד חזרות בפועל" [ref=e252]
                      - textbox [ref=e255]: "9"
                      - button "הגדל חזרות בפועל" [ref=e256]
              - generic [ref=e258]:
                - generic [ref=e259]:
                  - generic [ref=e260]: "3"
                  - paragraph [ref=e262]:
                    - text: סט 3
                    - generic [ref=e263]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=e264] [cursor=pointer]
                - generic [ref=e267]:
                  - generic [ref=e268]:
                    - paragraph [ref=e269]: משקל בפועל
                    - generic [ref=e270]:
                      - button "הורד משקל בפועל" [ref=e271]
                      - generic [ref=e273]:
                        - textbox [ref=e274]: "21"
                        - generic [ref=e275]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e276]
                  - generic [ref=e278]:
                    - paragraph [ref=e279]: חזרות בפועל
                    - generic [ref=e280]:
                      - button "הורד חזרות בפועל" [ref=e281]
                      - textbox [ref=e284]: "9"
                      - button "הגדל חזרות בפועל" [ref=e285]
          - generic [ref=e289] [cursor=pointer]:
            - generic [ref=e294]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e295]
          - generic [ref=e296]:
            - paragraph [ref=e297]: איך היה התרגיל?
            - generic [ref=e298]:
              - button "קל" [ref=e299]
              - button "מתאים" [ref=e300]
              - button "כבד" [ref=e301]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e302]
        - article [ref=e303]:
          - generic [ref=e304]:
            - button "פתח פרטי תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=e305] [cursor=pointer]
            - generic [ref=e308]:
              - button "תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=e310] [cursor=pointer]
              - paragraph [ref=e311]: מכונה
            - generic [ref=e312]:
              - button "תחליף מורשה" [ref=e313] [cursor=pointer]
              - button "התחל מנוחה" [ref=e319] [cursor=pointer]: 60ש׳
          - generic [ref=e323]:
            - paragraph [ref=e324]: ביצוע בפועל
            - generic [ref=e325]:
              - generic [ref=e326]:
                - generic [ref=e327]:
                  - generic [ref=e328]: "1"
                  - paragraph [ref=e330]:
                    - text: סט 1
                    - generic [ref=e331]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=e332] [cursor=pointer]
                - generic [ref=e335]:
                  - generic [ref=e336]:
                    - paragraph [ref=e337]: משקל בפועל
                    - generic [ref=e338]:
                      - button "הורד משקל בפועל" [ref=e339]
                      - generic [ref=e341]:
                        - textbox [ref=e342]: "22"
                        - generic [ref=e343]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e344]
                  - generic [ref=e346]:
                    - paragraph [ref=e347]: חזרות בפועל
                    - generic [ref=e348]:
                      - button "הורד חזרות בפועל" [ref=e349]
                      - textbox [ref=e352]: "10"
                      - button "הגדל חזרות בפועל" [ref=e353]
              - generic [ref=e355]:
                - generic [ref=e356]:
                  - generic [ref=e357]: "2"
                  - paragraph [ref=e359]:
                    - text: סט 2
                    - generic [ref=e360]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=e361] [cursor=pointer]
                - generic [ref=e364]:
                  - generic [ref=e365]:
                    - paragraph [ref=e366]: משקל בפועל
                    - generic [ref=e367]:
                      - button "הורד משקל בפועל" [ref=e368]
                      - generic [ref=e370]:
                        - textbox [ref=e371]: "22"
                        - generic [ref=e372]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e373]
                  - generic [ref=e375]:
                    - paragraph [ref=e376]: חזרות בפועל
                    - generic [ref=e377]:
                      - button "הורד חזרות בפועל" [ref=e378]
                      - textbox [ref=e381]: "10"
                      - button "הגדל חזרות בפועל" [ref=e382]
              - generic [ref=e384]:
                - generic [ref=e385]:
                  - generic [ref=e386]: "3"
                  - paragraph [ref=e388]:
                    - text: סט 3
                    - generic [ref=e389]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=e390] [cursor=pointer]
                - generic [ref=e393]:
                  - generic [ref=e394]:
                    - paragraph [ref=e395]: משקל בפועל
                    - generic [ref=e396]:
                      - button "הורד משקל בפועל" [ref=e397]
                      - generic [ref=e399]:
                        - textbox [ref=e400]: "22"
                        - generic [ref=e401]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e402]
                  - generic [ref=e404]:
                    - paragraph [ref=e405]: חזרות בפועל
                    - generic [ref=e406]:
                      - button "הורד חזרות בפועל" [ref=e407]
                      - textbox [ref=e410]: "10"
                      - button "הגדל חזרות בפועל" [ref=e411]
          - generic [ref=e415] [cursor=pointer]:
            - generic [ref=e420]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e421]
          - generic [ref=e422]:
            - paragraph [ref=e423]: איך היה התרגיל?
            - generic [ref=e424]:
              - button "קל" [ref=e425]
              - button "מתאים" [ref=e426]
              - button "כבד" [ref=e427]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e428]
        - article [ref=e429]:
          - generic [ref=e430]:
            - button "פתח פרטי תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=e431] [cursor=pointer]
            - generic [ref=e434]:
              - button "תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=e436] [cursor=pointer]
              - paragraph [ref=e437]: מכונה
            - generic [ref=e438]:
              - button "תחליף מורשה" [ref=e439] [cursor=pointer]
              - button "התחל מנוחה" [ref=e445] [cursor=pointer]: 60ש׳
          - generic [ref=e449]:
            - paragraph [ref=e450]: ביצוע בפועל
            - generic [ref=e451]:
              - generic [ref=e452]:
                - generic [ref=e453]:
                  - generic [ref=e454]: "1"
                  - paragraph [ref=e456]:
                    - text: סט 1
                    - generic [ref=e457]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=e458] [cursor=pointer]
                - generic [ref=e461]:
                  - generic [ref=e462]:
                    - paragraph [ref=e463]: משקל בפועל
                    - generic [ref=e464]:
                      - button "הורד משקל בפועל" [ref=e465]
                      - generic [ref=e467]:
                        - textbox [ref=e468]: "23"
                        - generic [ref=e469]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e470]
                  - generic [ref=e472]:
                    - paragraph [ref=e473]: חזרות בפועל
                    - generic [ref=e474]:
                      - button "הורד חזרות בפועל" [ref=e475]
                      - textbox [ref=e478]: "11"
                      - button "הגדל חזרות בפועל" [ref=e479]
              - generic [ref=e481]:
                - generic [ref=e482]:
                  - generic [ref=e483]: "2"
                  - paragraph [ref=e485]:
                    - text: סט 2
                    - generic [ref=e486]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=e487] [cursor=pointer]
                - generic [ref=e490]:
                  - generic [ref=e491]:
                    - paragraph [ref=e492]: משקל בפועל
                    - generic [ref=e493]:
                      - button "הורד משקל בפועל" [ref=e494]
                      - generic [ref=e496]:
                        - textbox [ref=e497]: "23"
                        - generic [ref=e498]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e499]
                  - generic [ref=e501]:
                    - paragraph [ref=e502]: חזרות בפועל
                    - generic [ref=e503]:
                      - button "הורד חזרות בפועל" [ref=e504]
                      - textbox [ref=e507]: "11"
                      - button "הגדל חזרות בפועל" [ref=e508]
              - generic [ref=e510]:
                - generic [ref=e511]:
                  - generic [ref=e512]: "3"
                  - paragraph [ref=e514]:
                    - text: סט 3
                    - generic [ref=e515]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=e516] [cursor=pointer]
                - generic [ref=e519]:
                  - generic [ref=e520]:
                    - paragraph [ref=e521]: משקל בפועל
                    - generic [ref=e522]:
                      - button "הורד משקל בפועל" [ref=e523]
                      - generic [ref=e525]:
                        - textbox [ref=e526]: "23"
                        - generic [ref=e527]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e528]
                  - generic [ref=e530]:
                    - paragraph [ref=e531]: חזרות בפועל
                    - generic [ref=e532]:
                      - button "הורד חזרות בפועל" [ref=e533]
                      - textbox [ref=e536]: "11"
                      - button "הגדל חזרות בפועל" [ref=e537]
          - generic [ref=e541] [cursor=pointer]:
            - generic [ref=e546]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e547]
          - generic [ref=e548]:
            - paragraph [ref=e549]: איך היה התרגיל?
            - generic [ref=e550]:
              - button "קל" [ref=e551]
              - button "מתאים" [ref=e552]
              - button "כבד" [ref=e553]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e554]
        - article [ref=e555]:
          - generic [ref=e556]:
            - button "פתח פרטי תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=e557] [cursor=pointer]
            - generic [ref=e560]:
              - button "תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=e562] [cursor=pointer]
              - paragraph [ref=e563]: מכונה
            - generic [ref=e564]:
              - button "תחליף מורשה" [ref=e565] [cursor=pointer]
              - button "התחל מנוחה" [ref=e571] [cursor=pointer]: 60ש׳
          - generic [ref=e575]:
            - paragraph [ref=e576]: ביצוע בפועל
            - generic [ref=e577]:
              - generic [ref=e578]:
                - generic [ref=e579]:
                  - generic [ref=e580]: "1"
                  - paragraph [ref=e582]:
                    - text: סט 1
                    - generic [ref=e583]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=e584] [cursor=pointer]
                - generic [ref=e587]:
                  - generic [ref=e588]:
                    - paragraph [ref=e589]: משקל בפועל
                    - generic [ref=e590]:
                      - button "הורד משקל בפועל" [ref=e591]
                      - generic [ref=e593]:
                        - textbox [ref=e594]: "24"
                        - generic [ref=e595]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e596]
                  - generic [ref=e598]:
                    - paragraph [ref=e599]: חזרות בפועל
                    - generic [ref=e600]:
                      - button "הורד חזרות בפועל" [ref=e601]
                      - textbox [ref=e604]: "8"
                      - button "הגדל חזרות בפועל" [ref=e605]
              - generic [ref=e607]:
                - generic [ref=e608]:
                  - generic [ref=e609]: "2"
                  - paragraph [ref=e611]:
                    - text: סט 2
                    - generic [ref=e612]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=e613] [cursor=pointer]
                - generic [ref=e616]:
                  - generic [ref=e617]:
                    - paragraph [ref=e618]: משקל בפועל
                    - generic [ref=e619]:
                      - button "הורד משקל בפועל" [ref=e620]
                      - generic [ref=e622]:
                        - textbox [ref=e623]: "24"
                        - generic [ref=e624]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e625]
                  - generic [ref=e627]:
                    - paragraph [ref=e628]: חזרות בפועל
                    - generic [ref=e629]:
                      - button "הורד חזרות בפועל" [ref=e630]
                      - textbox [ref=e633]: "8"
                      - button "הגדל חזרות בפועל" [ref=e634]
              - generic [ref=e636]:
                - generic [ref=e637]:
                  - generic [ref=e638]: "3"
                  - paragraph [ref=e640]:
                    - text: סט 3
                    - generic [ref=e641]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=e642] [cursor=pointer]
                - generic [ref=e645]:
                  - generic [ref=e646]:
                    - paragraph [ref=e647]: משקל בפועל
                    - generic [ref=e648]:
                      - button "הורד משקל בפועל" [ref=e649]
                      - generic [ref=e651]:
                        - textbox [ref=e652]: "24"
                        - generic [ref=e653]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e654]
                  - generic [ref=e656]:
                    - paragraph [ref=e657]: חזרות בפועל
                    - generic [ref=e658]:
                      - button "הורד חזרות בפועל" [ref=e659]
                      - textbox [ref=e662]: "8"
                      - button "הגדל חזרות בפועל" [ref=e663]
          - generic [ref=e667] [cursor=pointer]:
            - generic [ref=e672]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e673]
          - generic [ref=e674]:
            - paragraph [ref=e675]: איך היה התרגיל?
            - generic [ref=e676]:
              - button "קל" [ref=e677]
              - button "מתאים" [ref=e678]
              - button "כבד" [ref=e679]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e680]
        - article [ref=e681]:
          - generic [ref=e682]:
            - button "פתח פרטי תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=e683] [cursor=pointer]
            - generic [ref=e686]:
              - button "תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=e688] [cursor=pointer]
              - paragraph [ref=e689]: מכונה
            - generic [ref=e690]:
              - button "תחליף מורשה" [ref=e691] [cursor=pointer]
              - button "התחל מנוחה" [ref=e697] [cursor=pointer]: 60ש׳
          - generic [ref=e701]:
            - paragraph [ref=e702]: ביצוע בפועל
            - generic [ref=e703]:
              - generic [ref=e704]:
                - generic [ref=e705]:
                  - generic [ref=e706]: "1"
                  - paragraph [ref=e708]:
                    - text: סט 1
                    - generic [ref=e709]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=e710] [cursor=pointer]
                - generic [ref=e713]:
                  - generic [ref=e714]:
                    - paragraph [ref=e715]: משקל בפועל
                    - generic [ref=e716]:
                      - button "הורד משקל בפועל" [ref=e717]
                      - generic [ref=e719]:
                        - textbox [ref=e720]: "25"
                        - generic [ref=e721]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e722]
                  - generic [ref=e724]:
                    - paragraph [ref=e725]: חזרות בפועל
                    - generic [ref=e726]:
                      - button "הורד חזרות בפועל" [ref=e727]
                      - textbox [ref=e730]: "9"
                      - button "הגדל חזרות בפועל" [ref=e731]
              - generic [ref=e733]:
                - generic [ref=e734]:
                  - generic [ref=e735]: "2"
                  - paragraph [ref=e737]:
                    - text: סט 2
                    - generic [ref=e738]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=e739] [cursor=pointer]
                - generic [ref=e742]:
                  - generic [ref=e743]:
                    - paragraph [ref=e744]: משקל בפועל
                    - generic [ref=e745]:
                      - button "הורד משקל בפועל" [ref=e746]
                      - generic [ref=e748]:
                        - textbox [ref=e749]: "25"
                        - generic [ref=e750]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e751]
                  - generic [ref=e753]:
                    - paragraph [ref=e754]: חזרות בפועל
                    - generic [ref=e755]:
                      - button "הורד חזרות בפועל" [ref=e756]
                      - textbox [ref=e759]: "9"
                      - button "הגדל חזרות בפועל" [ref=e760]
              - generic [ref=e762]:
                - generic [ref=e763]:
                  - generic [ref=e764]: "3"
                  - paragraph [ref=e766]:
                    - text: סט 3
                    - generic [ref=e767]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=e768] [cursor=pointer]
                - generic [ref=e771]:
                  - generic [ref=e772]:
                    - paragraph [ref=e773]: משקל בפועל
                    - generic [ref=e774]:
                      - button "הורד משקל בפועל" [ref=e775]
                      - generic [ref=e777]:
                        - textbox [ref=e778]: "25"
                        - generic [ref=e779]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e780]
                  - generic [ref=e782]:
                    - paragraph [ref=e783]: חזרות בפועל
                    - generic [ref=e784]:
                      - button "הורד חזרות בפועל" [ref=e785]
                      - textbox [ref=e788]: "9"
                      - button "הגדל חזרות בפועל" [ref=e789]
          - generic [ref=e793] [cursor=pointer]:
            - generic [ref=e798]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e799]
          - generic [ref=e800]:
            - paragraph [ref=e801]: איך היה התרגיל?
            - generic [ref=e802]:
              - button "קל" [ref=e803]
              - button "מתאים" [ref=e804]
              - button "כבד" [ref=e805]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e806]
        - article [ref=e807]:
          - generic [ref=e808]:
            - button "פתח פרטי תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=e809] [cursor=pointer]
            - generic [ref=e812]:
              - button "תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=e814] [cursor=pointer]
              - paragraph [ref=e815]: מכונה
            - generic [ref=e816]:
              - button "תחליף מורשה" [ref=e817] [cursor=pointer]
              - button "התחל מנוחה" [ref=e823] [cursor=pointer]: 60ש׳
          - generic [ref=e827]:
            - paragraph [ref=e828]: ביצוע בפועל
            - generic [ref=e829]:
              - generic [ref=e830]:
                - generic [ref=e831]:
                  - generic [ref=e832]: "1"
                  - paragraph [ref=e834]:
                    - text: סט 1
                    - generic [ref=e835]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=e836] [cursor=pointer]
                - generic [ref=e839]:
                  - generic [ref=e840]:
                    - paragraph [ref=e841]: משקל בפועל
                    - generic [ref=e842]:
                      - button "הורד משקל בפועל" [ref=e843]
                      - generic [ref=e845]:
                        - textbox [ref=e846]: "26"
                        - generic [ref=e847]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e848]
                  - generic [ref=e850]:
                    - paragraph [ref=e851]: חזרות בפועל
                    - generic [ref=e852]:
                      - button "הורד חזרות בפועל" [ref=e853]
                      - textbox [ref=e856]: "10"
                      - button "הגדל חזרות בפועל" [ref=e857]
              - generic [ref=e859]:
                - generic [ref=e860]:
                  - generic [ref=e861]: "2"
                  - paragraph [ref=e863]:
                    - text: סט 2
                    - generic [ref=e864]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=e865] [cursor=pointer]
                - generic [ref=e868]:
                  - generic [ref=e869]:
                    - paragraph [ref=e870]: משקל בפועל
                    - generic [ref=e871]:
                      - button "הורד משקל בפועל" [ref=e872]
                      - generic [ref=e874]:
                        - textbox [ref=e875]: "26"
                        - generic [ref=e876]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e877]
                  - generic [ref=e879]:
                    - paragraph [ref=e880]: חזרות בפועל
                    - generic [ref=e881]:
                      - button "הורד חזרות בפועל" [ref=e882]
                      - textbox [ref=e885]: "10"
                      - button "הגדל חזרות בפועל" [ref=e886]
              - generic [ref=e888]:
                - generic [ref=e889]:
                  - generic [ref=e890]: "3"
                  - paragraph [ref=e892]:
                    - text: סט 3
                    - generic [ref=e893]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=e894] [cursor=pointer]
                - generic [ref=e897]:
                  - generic [ref=e898]:
                    - paragraph [ref=e899]: משקל בפועל
                    - generic [ref=e900]:
                      - button "הורד משקל בפועל" [ref=e901]
                      - generic [ref=e903]:
                        - textbox [ref=e904]: "26"
                        - generic [ref=e905]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e906]
                  - generic [ref=e908]:
                    - paragraph [ref=e909]: חזרות בפועל
                    - generic [ref=e910]:
                      - button "הורד חזרות בפועל" [ref=e911]
                      - textbox [ref=e914]: "10"
                      - button "הגדל חזרות בפועל" [ref=e915]
          - generic [ref=e919] [cursor=pointer]:
            - generic [ref=e924]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e925]
          - generic [ref=e926]:
            - paragraph [ref=e927]: איך היה התרגיל?
            - generic [ref=e928]:
              - button "קל" [ref=e929]
              - button "מתאים" [ref=e930]
              - button "כבד" [ref=e931]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e932]
        - article [ref=e933]:
          - generic [ref=e934]:
            - button "פתח פרטי תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=e935] [cursor=pointer]
            - generic [ref=e938]:
              - button "תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=e940] [cursor=pointer]
              - paragraph [ref=e941]: מכונה
            - generic [ref=e942]:
              - button "תחליף מורשה" [ref=e943] [cursor=pointer]
              - button "התחל מנוחה" [ref=e949] [cursor=pointer]: 60ש׳
          - generic [ref=e953]:
            - paragraph [ref=e954]: ביצוע בפועל
            - generic [ref=e955]:
              - generic [ref=e956]:
                - generic [ref=e957]:
                  - generic [ref=e958]: "1"
                  - paragraph [ref=e960]:
                    - text: סט 1
                    - generic [ref=e961]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=e962] [cursor=pointer]
                - generic [ref=e965]:
                  - generic [ref=e966]:
                    - paragraph [ref=e967]: משקל בפועל
                    - generic [ref=e968]:
                      - button "הורד משקל בפועל" [ref=e969]
                      - generic [ref=e971]:
                        - textbox [ref=e972]: "27"
                        - generic [ref=e973]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e974]
                  - generic [ref=e976]:
                    - paragraph [ref=e977]: חזרות בפועל
                    - generic [ref=e978]:
                      - button "הורד חזרות בפועל" [ref=e979]
                      - textbox [ref=e982]: "11"
                      - button "הגדל חזרות בפועל" [ref=e983]
              - generic [ref=e985]:
                - generic [ref=e986]:
                  - generic [ref=e987]: "2"
                  - paragraph [ref=e989]:
                    - text: סט 2
                    - generic [ref=e990]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=e991] [cursor=pointer]
                - generic [ref=e994]:
                  - generic [ref=e995]:
                    - paragraph [ref=e996]: משקל בפועל
                    - generic [ref=e997]:
                      - button "הורד משקל בפועל" [ref=e998]
                      - generic [ref=e1000]:
                        - textbox [ref=e1001]: "27"
                        - generic [ref=e1002]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e1003]
                  - generic [ref=e1005]:
                    - paragraph [ref=e1006]: חזרות בפועל
                    - generic [ref=e1007]:
                      - button "הורד חזרות בפועל" [ref=e1008]
                      - textbox [ref=e1011]: "11"
                      - button "הגדל חזרות בפועל" [ref=e1012]
              - generic [ref=e1014]:
                - generic [ref=e1015]:
                  - generic [ref=e1016]: "3"
                  - paragraph [ref=e1018]:
                    - text: סט 3
                    - generic [ref=e1019]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=e1020] [cursor=pointer]
                - generic [ref=e1023]:
                  - generic [ref=e1024]:
                    - paragraph [ref=e1025]: משקל בפועל
                    - generic [ref=e1026]:
                      - button "הורד משקל בפועל" [ref=e1027]
                      - generic [ref=e1029]:
                        - textbox [ref=e1030]: "27"
                        - generic [ref=e1031]: ק״ג
                      - button "הגדל משקל בפועל" [ref=e1032]
                  - generic [ref=e1034]:
                    - paragraph [ref=e1035]: חזרות בפועל
                    - generic [ref=e1036]:
                      - button "הורד חזרות בפועל" [ref=e1037]
                      - textbox [ref=e1040]: "11"
                      - button "הגדל חזרות בפועל" [ref=e1041]
          - generic [ref=e1045] [cursor=pointer]:
            - generic [ref=e1050]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=e1051]
          - generic [ref=e1052]:
            - paragraph [ref=e1053]: איך היה התרגיל?
            - generic [ref=e1054]:
              - button "קל" [ref=e1055]
              - button "מתאים" [ref=e1056]
              - button "כבד" [ref=e1057]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=e1058]
      - button "סיים ושמור אימון" [active] [ref=e1060] [cursor=pointer]
    - navigation "ניווט ראשי":
      - generic [ref=e1063]:
        - link [ref=e1064]:
          - /url: /coach
        - link "מתאמנים" [ref=e1068]:
          - /url: /coach/clients
        - link "מעקב" [ref=e1075]:
          - /url: /coach/tracking
        - link "תרגילים" [ref=e1079]:
          - /url: /exercises
```

# Test source

```ts
  1311 |       const cached = await page.evaluate(
  1312 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1313 |         "gymtrack.v1.user.ios-smoke-client",
  1314 |       );
  1315 |       return cached.coachMessages?.length ?? 0;
  1316 |     })
  1317 |     .toBe(1);
  1318 | });
  1319 | 
  1320 | test("trainee reopens a broadcast notice offline before reconnect refresh", async ({ page }) => {
  1321 |   await installFixture(page, { role: "trainee" });
  1322 | 
  1323 |   await page.goto("/");
  1324 |   const broadcast = page.getByTestId("broadcast-message-banner");
  1325 |   await expect(broadcast).toContainText("הודעת תפוצה לבדיקה");
  1326 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1327 | 
  1328 |   await page.reload();
  1329 |   const reopenedBroadcast = page.getByTestId("broadcast-message-banner");
  1330 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1331 |   await expect.poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads())).toBe(0);
  1332 | 
  1333 |   await page.evaluate(() => window.__iosSmokeSetOnline(true));
  1334 |   await expect
  1335 |     .poll(() => page.evaluate(() => window.__iosSmokeBroadcastReads()))
  1336 |     .toBeGreaterThan(0);
  1337 |   await expect(reopenedBroadcast).toContainText("הודעת תפוצה לבדיקה");
  1338 |   await expect
  1339 |     .poll(async () => {
  1340 |       const cached = await page.evaluate(
  1341 |         (key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"),
  1342 |         "gymtrack.v1.user.ios-smoke-client",
  1343 |       );
  1344 |       return cached.broadcasts?.length ?? 0;
  1345 |     })
  1346 |     .toBe(1);
  1347 | });
  1348 | 
  1349 | test("authenticated workspace paints from the boot cache before full refresh", async ({ page }) => {
  1350 |   await installFixture(page, {
  1351 |     online: true,
  1352 |     fullCacheValue: reopenFullCacheValue,
  1353 |     bootCacheValue: reopenBootCacheValue,
  1354 |     pendingChanges: true,
  1355 |     trackBootCacheTiming: true,
  1356 |   });
  1357 | 
  1358 |   await page.goto("/");
  1359 |   const coachNav = page.getByTestId("link-nav-coach");
  1360 |   await expect(coachNav).toBeVisible({ timeout: 20_000 });
  1361 | 
  1362 |   await expect
  1363 |     .poll(() =>
  1364 |       page.evaluate(() => ({
  1365 |         workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1366 |         fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1367 |       })),
  1368 |     )
  1369 |     .toMatchObject({
  1370 |       workspaceMountedAt: expect.any(Number),
  1371 |       fullCacheReadAt: expect.any(Number),
  1372 |     });
  1373 | 
  1374 |   const bootTiming = await page.evaluate(() => ({
  1375 |     workspaceMountedAt: window.__iosSmokeWorkspaceMountedAt,
  1376 |     fullCacheReadAt: window.__iosSmokeFullCacheReadAt,
  1377 |   }));
  1378 |   expect(bootTiming.workspaceMountedAt).toBeLessThan(bootTiming.fullCacheReadAt);
  1379 | 
  1380 |   await expect
  1381 |     .poll(() => page.evaluate(() => window.__iosSmokeInitialPullCompleteAt))
  1382 |     .not.toBeNull();
  1383 |   await expect
  1384 |     .poll(() => page.evaluate(() => window.__iosSmokeFullCacheWriteCount))
  1385 |     .toBeGreaterThan(0);
  1386 | 
  1387 |   const refreshedCache = await page.evaluate(
  1388 |     (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
  1389 |     `gymtrack.v1.user.${COACH_ID}`,
  1390 |   );
  1391 |   expect(refreshedCache.foods.length).toBeGreaterThanOrEqual(reopenFullCacheValue.foods.length);
  1392 |   expect(refreshedCache.workouts[0].items[0].reps).toBe(123);
  1393 |   expect(refreshedCache.preExitChecklist[0].label).toBe("עריכה מקומית שנשמרת");
  1394 | });
  1395 | 
  1396 | test("active workout values survive leaving and reopening the session", async ({ page }) => {
  1397 |   await installFixture(page);
  1398 | 
  1399 |   await page.goto(`/session/${WORKOUT_ID}`);
  1400 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1401 | 
  1402 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  1403 |   await repsInput.fill("123");
  1404 |   await page.keyboard.press("Tab");
  1405 |   await expect(repsInput).toHaveValue("123");
  1406 | 
  1407 |   // Completion feedback belongs to the active workout draft and should follow
  1408 |   // the workout when the coach navigates away before saving.
  1409 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1410 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
> 1411 |   await expect(workoutNote).toBeVisible();
       |                             ^ Error: expect(locator).toBeVisible() failed
  1412 |   await workoutNote.fill("הערת סיום בטיוטת האימון");
  1413 |   await assertKeyboardVisible(workoutNote);
  1414 |   await expect(workoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1415 |   await page.keyboard.press("Escape");
  1416 |   await expect(workoutNote).toBeHidden();
  1417 | 
  1418 |   const firstExercise = page.locator("article").first();
  1419 |   await firstExercise.getByRole("button", { name: "קל", exact: true }).click();
  1420 |   const exerciseNote = firstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת...");
  1421 |   await exerciseNote.fill("הערת תרגיל בטיוטה");
  1422 |   await expect(exerciseNote).toHaveValue("הערת תרגיל בטיוטה");
  1423 | 
  1424 |   await page.goto("/programs");
  1425 |   // TanStack can finish the document navigation before the route's client
  1426 |   // transition settles on WebKit. Wait for visible route content before
  1427 |   // starting the next navigation, otherwise WebKit reports an interrupted
  1428 |   // goto even though the app is healthy.
  1429 |   await expect(page.getByText("התוכניות שלך", { exact: true })).toBeVisible();
  1430 |   await page.goto(`/session/${WORKOUT_ID}`);
  1431 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1432 |   await page.reload();
  1433 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  1434 |   await expect(page.locator('input[inputmode="decimal"]').first()).toHaveValue("123");
  1435 | 
  1436 |   const reopenedFirstExercise = page.locator("article").first();
  1437 |   await expect(reopenedFirstExercise.getByRole("button", { name: "קל", exact: true })).toHaveClass(
  1438 |     /border-primary/,
  1439 |   );
  1440 |   await expect(
  1441 |     reopenedFirstExercise.getByPlaceholder("כאב, אי־נוחות או הערה למאמנת..."),
  1442 |   ).toHaveValue("הערת תרגיל בטיוטה");
  1443 | 
  1444 |   // Reopening the completion sheet restores the unfinished workout note.
  1445 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  1446 |   const reopenedWorkoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
  1447 |   await expect(reopenedWorkoutNote).toHaveValue("הערת סיום בטיוטת האימון");
  1448 |   await page.getByRole("button", { name: "אישור ושמירת אימון" }).click();
  1449 |   await expect(page).toHaveURL(/\/programs/);
  1450 |   await expect
  1451 |     .poll(() => page.evaluate((key) => localStorage.getItem(key), ACTIVE_SESSION_FEEDBACK_KEY))
  1452 |     .toBeNull();
  1453 | });
  1454 | 
```