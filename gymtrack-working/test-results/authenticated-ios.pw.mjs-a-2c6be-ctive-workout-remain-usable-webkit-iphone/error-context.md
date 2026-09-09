# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:298:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - button "פתח טיימר מנוחה" [ref=f1e3]:
    - paragraph [ref=f1e8]: טיימר
  - generic [ref=f1e9]:
    - banner [ref=f1e10]:
      - generic [ref=f1e11]:
        - generic [ref=f1e12]:
          - link "MY routine — דף הבית" [ref=f1e13]:
            - /url: /
            - img "MY routine" [ref=f1e14]
          - button "מעבר לתצוגת לילה" [ref=f1e15]
        - button "הפעלת אימון משקל גוף" [ref=f1e20]: אימון משקל גוף
        - generic [ref=f1e21]:
          - generic [ref=f1e22]:
            - paragraph [ref=f1e23]: תוכנית בדיקה לאייפון
            - heading "אימון בדיקה ארוך" [level=1] [ref=f1e24]
          - generic [ref=f1e25]:
            - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר" [ref=f1e26]
            - generic [ref=f1e31]:
              - button "השהה אימון" [ref=f1e32] [cursor=pointer]
              - button "יציאה מהאימון" [ref=f1e36] [cursor=pointer]
    - main [ref=f1e40]:
      - generic [ref=f1e41]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
      - generic [ref=f1e47]:
        - paragraph [ref=f1e48]: התקדמות אימון
        - paragraph [ref=f1e49]: 0%
      - generic [ref=f1e50]:
        - article [ref=f1e51]:
          - generic [ref=f1e52]:
            - button "פתח פרטי תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=f1e53] [cursor=pointer]
            - generic [ref=f1e56]:
              - button "תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=f1e58] [cursor=pointer]
              - paragraph [ref=f1e59]: מכונה
            - generic [ref=f1e60]:
              - button "תחליף מורשה" [ref=f1e61] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e67] [cursor=pointer]: 60ש׳
          - generic [ref=f1e71]:
            - paragraph [ref=f1e72]: ביצוע בפועל
            - generic [ref=f1e73]:
              - generic [ref=f1e74]:
                - generic [ref=f1e75]:
                  - generic [ref=f1e76]: "1"
                  - paragraph [ref=f1e78]:
                    - text: סט 1
                    - generic [ref=f1e79]: · 123 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e80] [cursor=pointer]
                - generic [ref=f1e83]:
                  - generic [ref=f1e84]:
                    - paragraph [ref=f1e85]: משקל בפועל
                    - generic [ref=f1e86]:
                      - button "הורד משקל בפועל" [ref=f1e87]
                      - generic [ref=f1e89]:
                        - textbox [ref=f1e90]: "123"
                        - generic [ref=f1e91]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e92]
                  - generic [ref=f1e94]:
                    - paragraph [ref=f1e95]: חזרות בפועל
                    - generic [ref=f1e96]:
                      - button "הורד חזרות בפועל" [ref=f1e97]
                      - textbox [ref=f1e100]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e101]
              - generic [ref=f1e103]:
                - generic [ref=f1e104]:
                  - generic [ref=f1e105]: "2"
                  - paragraph [ref=f1e107]:
                    - text: סט 2
                    - generic [ref=f1e108]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e109] [cursor=pointer]
                - generic [ref=f1e112]:
                  - generic [ref=f1e113]:
                    - paragraph [ref=f1e114]: משקל בפועל
                    - generic [ref=f1e115]:
                      - button "הורד משקל בפועל" [ref=f1e116]
                      - generic [ref=f1e118]:
                        - textbox [ref=f1e119]: "20"
                        - generic [ref=f1e120]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e121]
                  - generic [ref=f1e123]:
                    - paragraph [ref=f1e124]: חזרות בפועל
                    - generic [ref=f1e125]:
                      - button "הורד חזרות בפועל" [ref=f1e126]
                      - textbox [ref=f1e129]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e130]
              - generic [ref=f1e132]:
                - generic [ref=f1e133]:
                  - generic [ref=f1e134]: "3"
                  - paragraph [ref=f1e136]:
                    - text: סט 3
                    - generic [ref=f1e137]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e138] [cursor=pointer]
                - generic [ref=f1e141]:
                  - generic [ref=f1e142]:
                    - paragraph [ref=f1e143]: משקל בפועל
                    - generic [ref=f1e144]:
                      - button "הורד משקל בפועל" [ref=f1e145]
                      - generic [ref=f1e147]:
                        - textbox [ref=f1e148]: "20"
                        - generic [ref=f1e149]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e150]
                  - generic [ref=f1e152]:
                    - paragraph [ref=f1e153]: חזרות בפועל
                    - generic [ref=f1e154]:
                      - button "הורד חזרות בפועל" [ref=f1e155]
                      - textbox [ref=f1e158]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e159]
          - generic [ref=f1e163] [cursor=pointer]:
            - generic [ref=f1e168]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e169]
          - generic [ref=f1e170]:
            - paragraph [ref=f1e171]: איך היה התרגיל?
            - generic [ref=f1e172]:
              - button "קל" [ref=f1e173]
              - button "מתאים" [ref=f1e174]
              - button "כבד" [ref=f1e175]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e176]
        - article [ref=f1e177]:
          - generic [ref=f1e178]:
            - button "פתח פרטי תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e179] [cursor=pointer]
            - generic [ref=f1e182]:
              - button "תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e184] [cursor=pointer]
              - paragraph [ref=f1e185]: מכונה
            - generic [ref=f1e186]:
              - button "תחליף מורשה" [ref=f1e187] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e193] [cursor=pointer]: 60ש׳
          - generic [ref=f1e197]:
            - paragraph [ref=f1e198]: ביצוע בפועל
            - generic [ref=f1e199]:
              - generic [ref=f1e200]:
                - generic [ref=f1e201]:
                  - generic [ref=f1e202]: "1"
                  - paragraph [ref=f1e204]:
                    - text: סט 1
                    - generic [ref=f1e205]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e206] [cursor=pointer]
                - generic [ref=f1e209]:
                  - generic [ref=f1e210]:
                    - paragraph [ref=f1e211]: משקל בפועל
                    - generic [ref=f1e212]:
                      - button "הורד משקל בפועל" [ref=f1e213]
                      - generic [ref=f1e215]:
                        - textbox [ref=f1e216]: "21"
                        - generic [ref=f1e217]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e218]
                  - generic [ref=f1e220]:
                    - paragraph [ref=f1e221]: חזרות בפועל
                    - generic [ref=f1e222]:
                      - button "הורד חזרות בפועל" [ref=f1e223]
                      - textbox [ref=f1e226]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e227]
              - generic [ref=f1e229]:
                - generic [ref=f1e230]:
                  - generic [ref=f1e231]: "2"
                  - paragraph [ref=f1e233]:
                    - text: סט 2
                    - generic [ref=f1e234]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e235] [cursor=pointer]
                - generic [ref=f1e238]:
                  - generic [ref=f1e239]:
                    - paragraph [ref=f1e240]: משקל בפועל
                    - generic [ref=f1e241]:
                      - button "הורד משקל בפועל" [ref=f1e242]
                      - generic [ref=f1e244]:
                        - textbox [ref=f1e245]: "21"
                        - generic [ref=f1e246]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e247]
                  - generic [ref=f1e249]:
                    - paragraph [ref=f1e250]: חזרות בפועל
                    - generic [ref=f1e251]:
                      - button "הורד חזרות בפועל" [ref=f1e252]
                      - textbox [ref=f1e255]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e256]
              - generic [ref=f1e258]:
                - generic [ref=f1e259]:
                  - generic [ref=f1e260]: "3"
                  - paragraph [ref=f1e262]:
                    - text: סט 3
                    - generic [ref=f1e263]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e264] [cursor=pointer]
                - generic [ref=f1e267]:
                  - generic [ref=f1e268]:
                    - paragraph [ref=f1e269]: משקל בפועל
                    - generic [ref=f1e270]:
                      - button "הורד משקל בפועל" [ref=f1e271]
                      - generic [ref=f1e273]:
                        - textbox [ref=f1e274]: "21"
                        - generic [ref=f1e275]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e276]
                  - generic [ref=f1e278]:
                    - paragraph [ref=f1e279]: חזרות בפועל
                    - generic [ref=f1e280]:
                      - button "הורד חזרות בפועל" [ref=f1e281]
                      - textbox [ref=f1e284]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e285]
          - generic [ref=f1e289] [cursor=pointer]:
            - generic [ref=f1e294]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e295]
          - generic [ref=f1e296]:
            - paragraph [ref=f1e297]: איך היה התרגיל?
            - generic [ref=f1e298]:
              - button "קל" [ref=f1e299]
              - button "מתאים" [ref=f1e300]
              - button "כבד" [ref=f1e301]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e302]
        - article [ref=f1e303]:
          - generic [ref=f1e304]:
            - button "פתח פרטי תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e305] [cursor=pointer]
            - generic [ref=f1e308]:
              - button "תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e310] [cursor=pointer]
              - paragraph [ref=f1e311]: מכונה
            - generic [ref=f1e312]:
              - button "תחליף מורשה" [ref=f1e313] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e319] [cursor=pointer]: 60ש׳
          - generic [ref=f1e323]:
            - paragraph [ref=f1e324]: ביצוע בפועל
            - generic [ref=f1e325]:
              - generic [ref=f1e326]:
                - generic [ref=f1e327]:
                  - generic [ref=f1e328]: "1"
                  - paragraph [ref=f1e330]:
                    - text: סט 1
                    - generic [ref=f1e331]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e332] [cursor=pointer]
                - generic [ref=f1e335]:
                  - generic [ref=f1e336]:
                    - paragraph [ref=f1e337]: משקל בפועל
                    - generic [ref=f1e338]:
                      - button "הורד משקל בפועל" [ref=f1e339]
                      - generic [ref=f1e341]:
                        - textbox [ref=f1e342]: "22"
                        - generic [ref=f1e343]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e344]
                  - generic [ref=f1e346]:
                    - paragraph [ref=f1e347]: חזרות בפועל
                    - generic [ref=f1e348]:
                      - button "הורד חזרות בפועל" [ref=f1e349]
                      - textbox [ref=f1e352]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e353]
              - generic [ref=f1e355]:
                - generic [ref=f1e356]:
                  - generic [ref=f1e357]: "2"
                  - paragraph [ref=f1e359]:
                    - text: סט 2
                    - generic [ref=f1e360]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e361] [cursor=pointer]
                - generic [ref=f1e364]:
                  - generic [ref=f1e365]:
                    - paragraph [ref=f1e366]: משקל בפועל
                    - generic [ref=f1e367]:
                      - button "הורד משקל בפועל" [ref=f1e368]
                      - generic [ref=f1e370]:
                        - textbox [ref=f1e371]: "22"
                        - generic [ref=f1e372]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e373]
                  - generic [ref=f1e375]:
                    - paragraph [ref=f1e376]: חזרות בפועל
                    - generic [ref=f1e377]:
                      - button "הורד חזרות בפועל" [ref=f1e378]
                      - textbox [ref=f1e381]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e382]
              - generic [ref=f1e384]:
                - generic [ref=f1e385]:
                  - generic [ref=f1e386]: "3"
                  - paragraph [ref=f1e388]:
                    - text: סט 3
                    - generic [ref=f1e389]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e390] [cursor=pointer]
                - generic [ref=f1e393]:
                  - generic [ref=f1e394]:
                    - paragraph [ref=f1e395]: משקל בפועל
                    - generic [ref=f1e396]:
                      - button "הורד משקל בפועל" [ref=f1e397]
                      - generic [ref=f1e399]:
                        - textbox [ref=f1e400]: "22"
                        - generic [ref=f1e401]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e402]
                  - generic [ref=f1e404]:
                    - paragraph [ref=f1e405]: חזרות בפועל
                    - generic [ref=f1e406]:
                      - button "הורד חזרות בפועל" [ref=f1e407]
                      - textbox [ref=f1e410]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e411]
          - generic [ref=f1e415] [cursor=pointer]:
            - generic [ref=f1e420]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e421]
          - generic [ref=f1e422]:
            - paragraph [ref=f1e423]: איך היה התרגיל?
            - generic [ref=f1e424]:
              - button "קל" [ref=f1e425]
              - button "מתאים" [ref=f1e426]
              - button "כבד" [ref=f1e427]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e428]
        - article [ref=f1e429]:
          - generic [ref=f1e430]:
            - button "פתח פרטי תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e431] [cursor=pointer]
            - generic [ref=f1e434]:
              - button "תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e436] [cursor=pointer]
              - paragraph [ref=f1e437]: מכונה
            - generic [ref=f1e438]:
              - button "תחליף מורשה" [ref=f1e439] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e445] [cursor=pointer]: 60ש׳
          - generic [ref=f1e449]:
            - paragraph [ref=f1e450]: ביצוע בפועל
            - generic [ref=f1e451]:
              - generic [ref=f1e452]:
                - generic [ref=f1e453]:
                  - generic [ref=f1e454]: "1"
                  - paragraph [ref=f1e456]:
                    - text: סט 1
                    - generic [ref=f1e457]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e458] [cursor=pointer]
                - generic [ref=f1e461]:
                  - generic [ref=f1e462]:
                    - paragraph [ref=f1e463]: משקל בפועל
                    - generic [ref=f1e464]:
                      - button "הורד משקל בפועל" [ref=f1e465]
                      - generic [ref=f1e467]:
                        - textbox [ref=f1e468]: "23"
                        - generic [ref=f1e469]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e470]
                  - generic [ref=f1e472]:
                    - paragraph [ref=f1e473]: חזרות בפועל
                    - generic [ref=f1e474]:
                      - button "הורד חזרות בפועל" [ref=f1e475]
                      - textbox [ref=f1e478]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e479]
              - generic [ref=f1e481]:
                - generic [ref=f1e482]:
                  - generic [ref=f1e483]: "2"
                  - paragraph [ref=f1e485]:
                    - text: סט 2
                    - generic [ref=f1e486]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e487] [cursor=pointer]
                - generic [ref=f1e490]:
                  - generic [ref=f1e491]:
                    - paragraph [ref=f1e492]: משקל בפועל
                    - generic [ref=f1e493]:
                      - button "הורד משקל בפועל" [ref=f1e494]
                      - generic [ref=f1e496]:
                        - textbox [ref=f1e497]: "23"
                        - generic [ref=f1e498]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e499]
                  - generic [ref=f1e501]:
                    - paragraph [ref=f1e502]: חזרות בפועל
                    - generic [ref=f1e503]:
                      - button "הורד חזרות בפועל" [ref=f1e504]
                      - textbox [ref=f1e507]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e508]
              - generic [ref=f1e510]:
                - generic [ref=f1e511]:
                  - generic [ref=f1e512]: "3"
                  - paragraph [ref=f1e514]:
                    - text: סט 3
                    - generic [ref=f1e515]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e516] [cursor=pointer]
                - generic [ref=f1e519]:
                  - generic [ref=f1e520]:
                    - paragraph [ref=f1e521]: משקל בפועל
                    - generic [ref=f1e522]:
                      - button "הורד משקל בפועל" [ref=f1e523]
                      - generic [ref=f1e525]:
                        - textbox [ref=f1e526]: "23"
                        - generic [ref=f1e527]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e528]
                  - generic [ref=f1e530]:
                    - paragraph [ref=f1e531]: חזרות בפועל
                    - generic [ref=f1e532]:
                      - button "הורד חזרות בפועל" [ref=f1e533]
                      - textbox [ref=f1e536]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e537]
          - generic [ref=f1e541] [cursor=pointer]:
            - generic [ref=f1e546]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e547]
          - generic [ref=f1e548]:
            - paragraph [ref=f1e549]: איך היה התרגיל?
            - generic [ref=f1e550]:
              - button "קל" [ref=f1e551]
              - button "מתאים" [ref=f1e552]
              - button "כבד" [ref=f1e553]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e554]
        - article [ref=f1e555]:
          - generic [ref=f1e556]:
            - button "פתח פרטי תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e557] [cursor=pointer]
            - generic [ref=f1e560]:
              - button "תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e562] [cursor=pointer]
              - paragraph [ref=f1e563]: מכונה
            - generic [ref=f1e564]:
              - button "תחליף מורשה" [ref=f1e565] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e571] [cursor=pointer]: 60ש׳
          - generic [ref=f1e575]:
            - paragraph [ref=f1e576]: ביצוע בפועל
            - generic [ref=f1e577]:
              - generic [ref=f1e578]:
                - generic [ref=f1e579]:
                  - generic [ref=f1e580]: "1"
                  - paragraph [ref=f1e582]:
                    - text: סט 1
                    - generic [ref=f1e583]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e584] [cursor=pointer]
                - generic [ref=f1e587]:
                  - generic [ref=f1e588]:
                    - paragraph [ref=f1e589]: משקל בפועל
                    - generic [ref=f1e590]:
                      - button "הורד משקל בפועל" [ref=f1e591]
                      - generic [ref=f1e593]:
                        - textbox [ref=f1e594]: "24"
                        - generic [ref=f1e595]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e596]
                  - generic [ref=f1e598]:
                    - paragraph [ref=f1e599]: חזרות בפועל
                    - generic [ref=f1e600]:
                      - button "הורד חזרות בפועל" [ref=f1e601]
                      - textbox [ref=f1e604]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e605]
              - generic [ref=f1e607]:
                - generic [ref=f1e608]:
                  - generic [ref=f1e609]: "2"
                  - paragraph [ref=f1e611]:
                    - text: סט 2
                    - generic [ref=f1e612]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e613] [cursor=pointer]
                - generic [ref=f1e616]:
                  - generic [ref=f1e617]:
                    - paragraph [ref=f1e618]: משקל בפועל
                    - generic [ref=f1e619]:
                      - button "הורד משקל בפועל" [ref=f1e620]
                      - generic [ref=f1e622]:
                        - textbox [ref=f1e623]: "24"
                        - generic [ref=f1e624]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e625]
                  - generic [ref=f1e627]:
                    - paragraph [ref=f1e628]: חזרות בפועל
                    - generic [ref=f1e629]:
                      - button "הורד חזרות בפועל" [ref=f1e630]
                      - textbox [ref=f1e633]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e634]
              - generic [ref=f1e636]:
                - generic [ref=f1e637]:
                  - generic [ref=f1e638]: "3"
                  - paragraph [ref=f1e640]:
                    - text: סט 3
                    - generic [ref=f1e641]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e642] [cursor=pointer]
                - generic [ref=f1e645]:
                  - generic [ref=f1e646]:
                    - paragraph [ref=f1e647]: משקל בפועל
                    - generic [ref=f1e648]:
                      - button "הורד משקל בפועל" [ref=f1e649]
                      - generic [ref=f1e651]:
                        - textbox [ref=f1e652]: "24"
                        - generic [ref=f1e653]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e654]
                  - generic [ref=f1e656]:
                    - paragraph [ref=f1e657]: חזרות בפועל
                    - generic [ref=f1e658]:
                      - button "הורד חזרות בפועל" [ref=f1e659]
                      - textbox [ref=f1e662]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e663]
          - generic [ref=f1e667] [cursor=pointer]:
            - generic [ref=f1e672]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e673]
          - generic [ref=f1e674]:
            - paragraph [ref=f1e675]: איך היה התרגיל?
            - generic [ref=f1e676]:
              - button "קל" [ref=f1e677]
              - button "מתאים" [ref=f1e678]
              - button "כבד" [ref=f1e679]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e680]
        - article [ref=f1e681]:
          - generic [ref=f1e682]:
            - button "פתח פרטי תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e683] [cursor=pointer]
            - generic [ref=f1e686]:
              - button "תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e688] [cursor=pointer]
              - paragraph [ref=f1e689]: מכונה
            - generic [ref=f1e690]:
              - button "תחליף מורשה" [ref=f1e691] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e697] [cursor=pointer]: 60ש׳
          - generic [ref=f1e701]:
            - paragraph [ref=f1e702]: ביצוע בפועל
            - generic [ref=f1e703]:
              - generic [ref=f1e704]:
                - generic [ref=f1e705]:
                  - generic [ref=f1e706]: "1"
                  - paragraph [ref=f1e708]:
                    - text: סט 1
                    - generic [ref=f1e709]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e710] [cursor=pointer]
                - generic [ref=f1e713]:
                  - generic [ref=f1e714]:
                    - paragraph [ref=f1e715]: משקל בפועל
                    - generic [ref=f1e716]:
                      - button "הורד משקל בפועל" [ref=f1e717]
                      - generic [ref=f1e719]:
                        - textbox [ref=f1e720]: "25"
                        - generic [ref=f1e721]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e722]
                  - generic [ref=f1e724]:
                    - paragraph [ref=f1e725]: חזרות בפועל
                    - generic [ref=f1e726]:
                      - button "הורד חזרות בפועל" [ref=f1e727]
                      - textbox [ref=f1e730]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e731]
              - generic [ref=f1e733]:
                - generic [ref=f1e734]:
                  - generic [ref=f1e735]: "2"
                  - paragraph [ref=f1e737]:
                    - text: סט 2
                    - generic [ref=f1e738]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e739] [cursor=pointer]
                - generic [ref=f1e742]:
                  - generic [ref=f1e743]:
                    - paragraph [ref=f1e744]: משקל בפועל
                    - generic [ref=f1e745]:
                      - button "הורד משקל בפועל" [ref=f1e746]
                      - generic [ref=f1e748]:
                        - textbox [ref=f1e749]: "25"
                        - generic [ref=f1e750]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e751]
                  - generic [ref=f1e753]:
                    - paragraph [ref=f1e754]: חזרות בפועל
                    - generic [ref=f1e755]:
                      - button "הורד חזרות בפועל" [ref=f1e756]
                      - textbox [ref=f1e759]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e760]
              - generic [ref=f1e762]:
                - generic [ref=f1e763]:
                  - generic [ref=f1e764]: "3"
                  - paragraph [ref=f1e766]:
                    - text: סט 3
                    - generic [ref=f1e767]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e768] [cursor=pointer]
                - generic [ref=f1e771]:
                  - generic [ref=f1e772]:
                    - paragraph [ref=f1e773]: משקל בפועל
                    - generic [ref=f1e774]:
                      - button "הורד משקל בפועל" [ref=f1e775]
                      - generic [ref=f1e777]:
                        - textbox [ref=f1e778]: "25"
                        - generic [ref=f1e779]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e780]
                  - generic [ref=f1e782]:
                    - paragraph [ref=f1e783]: חזרות בפועל
                    - generic [ref=f1e784]:
                      - button "הורד חזרות בפועל" [ref=f1e785]
                      - textbox [ref=f1e788]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e789]
          - generic [ref=f1e793] [cursor=pointer]:
            - generic [ref=f1e798]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e799]
          - generic [ref=f1e800]:
            - paragraph [ref=f1e801]: איך היה התרגיל?
            - generic [ref=f1e802]:
              - button "קל" [ref=f1e803]
              - button "מתאים" [ref=f1e804]
              - button "כבד" [ref=f1e805]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e806]
        - article [ref=f1e807]:
          - generic [ref=f1e808]:
            - button "פתח פרטי תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e809] [cursor=pointer]
            - generic [ref=f1e812]:
              - button "תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e814] [cursor=pointer]
              - paragraph [ref=f1e815]: מכונה
            - generic [ref=f1e816]:
              - button "תחליף מורשה" [ref=f1e817] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e823] [cursor=pointer]: 60ש׳
          - generic [ref=f1e827]:
            - paragraph [ref=f1e828]: ביצוע בפועל
            - generic [ref=f1e829]:
              - generic [ref=f1e830]:
                - generic [ref=f1e831]:
                  - generic [ref=f1e832]: "1"
                  - paragraph [ref=f1e834]:
                    - text: סט 1
                    - generic [ref=f1e835]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e836] [cursor=pointer]
                - generic [ref=f1e839]:
                  - generic [ref=f1e840]:
                    - paragraph [ref=f1e841]: משקל בפועל
                    - generic [ref=f1e842]:
                      - button "הורד משקל בפועל" [ref=f1e843]
                      - generic [ref=f1e845]:
                        - textbox [ref=f1e846]: "26"
                        - generic [ref=f1e847]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e848]
                  - generic [ref=f1e850]:
                    - paragraph [ref=f1e851]: חזרות בפועל
                    - generic [ref=f1e852]:
                      - button "הורד חזרות בפועל" [ref=f1e853]
                      - textbox [ref=f1e856]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e857]
              - generic [ref=f1e859]:
                - generic [ref=f1e860]:
                  - generic [ref=f1e861]: "2"
                  - paragraph [ref=f1e863]:
                    - text: סט 2
                    - generic [ref=f1e864]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e865] [cursor=pointer]
                - generic [ref=f1e868]:
                  - generic [ref=f1e869]:
                    - paragraph [ref=f1e870]: משקל בפועל
                    - generic [ref=f1e871]:
                      - button "הורד משקל בפועל" [ref=f1e872]
                      - generic [ref=f1e874]:
                        - textbox [ref=f1e875]: "26"
                        - generic [ref=f1e876]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e877]
                  - generic [ref=f1e879]:
                    - paragraph [ref=f1e880]: חזרות בפועל
                    - generic [ref=f1e881]:
                      - button "הורד חזרות בפועל" [ref=f1e882]
                      - textbox [ref=f1e885]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e886]
              - generic [ref=f1e888]:
                - generic [ref=f1e889]:
                  - generic [ref=f1e890]: "3"
                  - paragraph [ref=f1e892]:
                    - text: סט 3
                    - generic [ref=f1e893]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e894] [cursor=pointer]
                - generic [ref=f1e897]:
                  - generic [ref=f1e898]:
                    - paragraph [ref=f1e899]: משקל בפועל
                    - generic [ref=f1e900]:
                      - button "הורד משקל בפועל" [ref=f1e901]
                      - generic [ref=f1e903]:
                        - textbox [ref=f1e904]: "26"
                        - generic [ref=f1e905]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e906]
                  - generic [ref=f1e908]:
                    - paragraph [ref=f1e909]: חזרות בפועל
                    - generic [ref=f1e910]:
                      - button "הורד חזרות בפועל" [ref=f1e911]
                      - textbox [ref=f1e914]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e915]
          - generic [ref=f1e919] [cursor=pointer]:
            - generic [ref=f1e924]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e925]
          - generic [ref=f1e926]:
            - paragraph [ref=f1e927]: איך היה התרגיל?
            - generic [ref=f1e928]:
              - button "קל" [ref=f1e929]
              - button "מתאים" [ref=f1e930]
              - button "כבד" [ref=f1e931]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e932]
        - article [ref=f1e933]:
          - generic [ref=f1e934]:
            - button "פתח פרטי תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e935] [cursor=pointer]
            - generic [ref=f1e938]:
              - button "תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e940] [cursor=pointer]
              - paragraph [ref=f1e941]: מכונה
            - generic [ref=f1e942]:
              - button "תחליף מורשה" [ref=f1e943] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e949] [cursor=pointer]: 60ש׳
          - generic [ref=f1e953]:
            - paragraph [ref=f1e954]: ביצוע בפועל
            - generic [ref=f1e955]:
              - generic [ref=f1e956]:
                - generic [ref=f1e957]:
                  - generic [ref=f1e958]: "1"
                  - paragraph [ref=f1e960]:
                    - text: סט 1
                    - generic [ref=f1e961]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e962] [cursor=pointer]
                - generic [ref=f1e965]:
                  - generic [ref=f1e966]:
                    - paragraph [ref=f1e967]: משקל בפועל
                    - generic [ref=f1e968]:
                      - button "הורד משקל בפועל" [ref=f1e969]
                      - generic [ref=f1e971]:
                        - textbox [ref=f1e972]: "27"
                        - generic [ref=f1e973]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e974]
                  - generic [ref=f1e976]:
                    - paragraph [ref=f1e977]: חזרות בפועל
                    - generic [ref=f1e978]:
                      - button "הורד חזרות בפועל" [ref=f1e979]
                      - textbox [ref=f1e982]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e983]
              - generic [ref=f1e985]:
                - generic [ref=f1e986]:
                  - generic [ref=f1e987]: "2"
                  - paragraph [ref=f1e989]:
                    - text: סט 2
                    - generic [ref=f1e990]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e991] [cursor=pointer]
                - generic [ref=f1e994]:
                  - generic [ref=f1e995]:
                    - paragraph [ref=f1e996]: משקל בפועל
                    - generic [ref=f1e997]:
                      - button "הורד משקל בפועל" [ref=f1e998]
                      - generic [ref=f1e1000]:
                        - textbox [ref=f1e1001]: "27"
                        - generic [ref=f1e1002]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e1003]
                  - generic [ref=f1e1005]:
                    - paragraph [ref=f1e1006]: חזרות בפועל
                    - generic [ref=f1e1007]:
                      - button "הורד חזרות בפועל" [ref=f1e1008]
                      - textbox [ref=f1e1011]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1012]
              - generic [ref=f1e1014]:
                - generic [ref=f1e1015]:
                  - generic [ref=f1e1016]: "3"
                  - paragraph [ref=f1e1018]:
                    - text: סט 3
                    - generic [ref=f1e1019]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e1020] [cursor=pointer]
                - generic [ref=f1e1023]:
                  - generic [ref=f1e1024]:
                    - paragraph [ref=f1e1025]: משקל בפועל
                    - generic [ref=f1e1026]:
                      - button "הורד משקל בפועל" [ref=f1e1027]
                      - generic [ref=f1e1029]:
                        - textbox [ref=f1e1030]: "27"
                        - generic [ref=f1e1031]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e1032]
                  - generic [ref=f1e1034]:
                    - paragraph [ref=f1e1035]: חזרות בפועל
                    - generic [ref=f1e1036]:
                      - button "הורד חזרות בפועל" [ref=f1e1037]
                      - textbox [ref=f1e1040]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1041]
          - generic [ref=f1e1045] [cursor=pointer]:
            - generic [ref=f1e1050]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e1051]
          - generic [ref=f1e1052]:
            - paragraph [ref=f1e1053]: איך היה התרגיל?
            - generic [ref=f1e1054]:
              - button "קל" [ref=f1e1055]
              - button "מתאים" [ref=f1e1056]
              - button "כבד" [ref=f1e1057]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e1058]
      - button "סיים ושמור אימון" [ref=f1e1060] [cursor=pointer]
    - navigation "ניווט ראשי":
      - generic [ref=f1e1063]:
        - link [ref=f1e1064]:
          - /url: /coach
        - link "מתאמנים" [ref=f1e1068]:
          - /url: /coach/clients
        - link "מעקב" [ref=f1e1075]:
          - /url: /coach/tracking
        - link "תרגילים" [ref=f1e1079]:
          - /url: /exercises
  - dialog "משוב על האימון" [ref=f1e1087]:
    - generic [ref=f1e1089]:
      - generic [ref=f1e1090]:
        - heading "סיימת את החלק שמתאים לך היום" [level=3] [ref=f1e1095]
        - paragraph [ref=f1e1096]: המשוב יישמר בהיסטוריית האימון שלך
      - generic [ref=f1e1097]:
        - generic [ref=f1e1098]: דרגת קושי
        - generic [ref=f1e1099]:
          - button "קל מדי" [ref=f1e1100] [cursor=pointer]
          - button "מדויק" [ref=f1e1105] [cursor=pointer]
          - button "קשה מדי" [ref=f1e1109] [cursor=pointer]
      - generic [ref=f1e1114]:
        - generic [ref=f1e1115]: דיווח על אי-נוחות / הערה למאמן (אופציונלי)
        - 'textbox "למשל: עומס קל במרפק ימין בסט האחרון..." [ref=f1e1116]'
      - button "אישור ושמירת אימון" [ref=f1e1117] [cursor=pointer]
```

# Test source

```ts
  195 |       Storage.prototype.getItem = function getItem(key) {
  196 |         if (this === window.localStorage && key.endsWith("-auth-token")) {
  197 |           return JSON.stringify(session);
  198 |         }
  199 |         return originalGetItem.call(this, key);
  200 |       };
  201 |       window.localStorage.setItem(cacheKey, JSON.stringify(cacheValue));
  202 |       window.localStorage.setItem(`${cacheKey.replace("user.", "pending.")}`, "false");
  203 |       window.sessionStorage.setItem("gymtrack.workspace", "management");
  204 | 
  205 |       const originalFetch = window.fetch.bind(window);
  206 |       let remoteWorkouts = workouts.map((workout) => ({
  207 |         ...workout,
  208 |         items: JSON.parse(JSON.stringify(workout.items)),
  209 |       }));
  210 |       window.fetch = async (input, init) => {
  211 |         const url = typeof input === "string" ? input : input.url;
  212 |         if (url.includes("/auth/v1/user")) {
  213 |           return new Response(JSON.stringify(session.user), {
  214 |             status: 200,
  215 |             headers: { "content-type": "application/json" },
  216 |           });
  217 |         }
  218 |         if (url.includes("/rest/v1/")) {
  219 |           const parsed = new URL(url);
  220 |           const path = parsed.pathname.replace(/^.*\/rest\/v1\//, "");
  221 |           let body = [];
  222 |           if (path === "coach_clients") {
  223 |             body = [
  224 |               {
  225 |                 id: "ios-smoke-link",
  226 |                 client_id: clientProfile.id,
  227 |                 created_at: "2026-01-02T00:00:00.000Z",
  228 |                 profiles: {
  229 |                   email: clientProfile.email,
  230 |                   full_name: clientProfile.full_name,
  231 |                   weight_kg: clientProfile.weight_kg,
  232 |                 },
  233 |               },
  234 |             ];
  235 |           } else if (path === "profiles") {
  236 |             body = [parsed.searchParams.get("id")?.includes(clientProfile.id) ? clientProfile : coachProfile];
  237 |           } else if (path === "programs") {
  238 |             body = [{ id: program.id, user_id: clientProfile.id, name: program.name, description: program.notes }];
  239 |           } else if (path === "program_days") {
  240 |             const method = (init?.method ?? "GET").toUpperCase();
  241 |             if (method === "PATCH" || method === "PUT") {
  242 |               const requestBody = typeof init?.body === "string" ? JSON.parse(init.body) : null;
  243 |               const dayId = parsed.searchParams.get("id")?.replace(/^eq\./, "");
  244 |               if (requestBody?.items && dayId) {
  245 |                 remoteWorkouts = remoteWorkouts.map((workout) =>
  246 |                   workout.id === dayId ? { ...workout, items: requestBody.items } : workout,
  247 |                 );
  248 |               }
  249 |             }
  250 |             body = remoteWorkouts.map((workout, index) => ({
  251 |               id: workout.id,
  252 |               program_id: program.id,
  253 |               user_id: clientProfile.id,
  254 |               name: workout.name,
  255 |               items: workout.items,
  256 |               sort_order: index,
  257 |             }));
  258 |           } else if (path === "nutrition_days") {
  259 |             body = [nutritionDay];
  260 |           }
  261 |           return new Response(JSON.stringify(body), {
  262 |             status: 200,
  263 |             headers: {
  264 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  265 |               "content-type": "application/json",
  266 |             },
  267 |           });
  268 |         }
  269 |         return originalFetch(input, init);
  270 |       };
  271 |     },
  272 |     {
  273 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  274 |       cacheValue: gymData,
  275 |       session: authSession(),
  276 |       clientProfile,
  277 |       coachProfile,
  278 |       program,
  279 |       workouts,
  280 |       nutritionDay,
  281 |     },
  282 |   );
  283 | }
  284 | 
  285 | function assertKeyboardVisible(locator) {
  286 |   return expect
  287 |     .poll(async () => {
  288 |       return locator.evaluate((element) => {
  289 |         const rect = element.getBoundingClientRect();
  290 |         const viewport = window.visualViewport;
  291 |         const bottom = viewport?.height ?? window.innerHeight;
  292 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  293 |       });
  294 |     })
> 295 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  296 | }
  297 | 
  298 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  299 |   await installFixture(page);
  300 | 
  301 |   await page.goto("/");
  302 |   const coachNav = page.getByTestId("link-nav-coach");
  303 |   await expect(coachNav).toBeVisible();
  304 |   await coachNav.click();
  305 |   await expect(page).toHaveURL(/\/coach\/clients/);
  306 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  307 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  308 | 
  309 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  310 |   await clientCard.click();
  311 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  312 | 
  313 |   const workspace = page.locator('[data-coach-workspace="true"]');
  314 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  315 |   await workspace.evaluate((element) => {
  316 |     element.scrollTop = element.scrollHeight;
  317 |   });
  318 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  319 |   await expect
  320 |     .poll(() =>
  321 |       workspace.evaluate((element) => {
  322 |         const last = element.lastElementChild;
  323 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  324 |       }),
  325 |     )
  326 |     .toBe(true);
  327 | 
  328 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  329 |   await programsTab.click();
  330 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  331 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  332 |   await expect(dayButtons).toHaveCount(4);
  333 |   await dayButtons.nth(0).click();
  334 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  335 |   await expect(page.locator("#coach-programs")).toBeHidden();
  336 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  337 |   await expect(workoutSurface).toBeVisible();
  338 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  339 |   await expect(reportToggle).toBeVisible();
  340 |   await reportToggle.click();
  341 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  342 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  343 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  344 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  345 | 
  346 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  347 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  348 | 
  349 |   const setCountInput = page.getByRole("textbox", { name: "מספר סטים", exact: true });
  350 |   await setCountInput.fill("4");
  351 |   await expect(page.getByText("סט 4", { exact: true })).toBeVisible();
  352 |   const fourthSet = page
  353 |     .getByText("סט 4", { exact: true })
  354 |     .locator("..")
  355 |     .locator("..");
  356 |   await fourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }).fill("8");
  357 |   await fourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }).fill("12");
  358 |   await page.getByRole("button", { name: "שמור שינויי תרגיל", exact: true }).click();
  359 | 
  360 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  361 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  362 |   await expect(setCountInput).toHaveValue("4");
  363 |   const reopenedFourthSet = page
  364 |     .getByText("סט 4", { exact: true })
  365 |     .locator("..")
  366 |     .locator("..");
  367 |   await expect(
  368 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מינ׳", exact: true }),
  369 |   ).toHaveValue("8");
  370 |   await expect(
  371 |     reopenedFourthSet.getByRole("textbox", { name: "חזרות מקס׳", exact: true }),
  372 |   ).toHaveValue("12");
  373 | 
  374 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  375 |   await thirdSetMode.selectOption("drop");
  376 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  377 |   await dropRestInput.fill("45");
  378 |   await expect(dropRestInput).toHaveValue("45");
  379 | 
  380 |   await thirdSetMode.selectOption("superset");
  381 |   const supersetSearch = page.getByRole("searchbox", {
  382 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  383 |   });
  384 |   await supersetSearch.fill("תרגיל בדיקה 2");
  385 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  386 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  387 | 
  388 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  389 |   await expect(dayButtons).toHaveCount(4);
  390 | 
  391 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  392 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  393 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  394 |   await foodSearch.fill("אורז");
  395 |   await assertKeyboardVisible(foodSearch);
```