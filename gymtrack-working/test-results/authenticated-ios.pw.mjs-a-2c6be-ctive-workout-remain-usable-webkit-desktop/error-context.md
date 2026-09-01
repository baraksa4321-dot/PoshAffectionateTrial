# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:284:1

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
          - generic [ref=f1e26]:
            - button "השהה אימון" [ref=f1e27] [cursor=pointer]
            - button "יציאה מהאימון" [ref=f1e31] [cursor=pointer]
    - main [ref=f1e35]:
      - generic [ref=f1e36]: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
      - generic [ref=f1e42]:
        - paragraph [ref=f1e43]: התקדמות אימון
        - paragraph [ref=f1e44]: 0%
      - generic [ref=f1e46]:
        - article [ref=f1e47]:
          - generic [ref=f1e48]:
            - button "פתח פרטי תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=f1e49] [cursor=pointer]
            - button "תרגיל בדיקה 1 (Smoke Exercise 1)" [ref=f1e54] [cursor=pointer]
            - generic [ref=f1e55]:
              - button "תחליף מורשה" [ref=f1e56] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e62] [cursor=pointer]: 60ש׳
          - generic [ref=f1e66]:
            - paragraph [ref=f1e67]: ביצוע בפועל
            - generic [ref=f1e68]:
              - generic [ref=f1e69]:
                - generic [ref=f1e70]:
                  - generic [ref=f1e71]: "1"
                  - paragraph [ref=f1e73]:
                    - text: סט 1
                    - generic [ref=f1e74]: · 123 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e75] [cursor=pointer]
                - generic [ref=f1e78]:
                  - generic [ref=f1e79]:
                    - paragraph [ref=f1e80]: משקל בפועל
                    - generic [ref=f1e81]:
                      - button "הורד משקל בפועל" [ref=f1e82]
                      - generic [ref=f1e84]:
                        - textbox [ref=f1e85]: "123"
                        - generic [ref=f1e86]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e87]
                  - generic [ref=f1e89]:
                    - paragraph [ref=f1e90]: חזרות בפועל
                    - generic [ref=f1e91]:
                      - button "הורד חזרות בפועל" [ref=f1e92]
                      - textbox [ref=f1e95]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e96]
              - generic [ref=f1e98]:
                - generic [ref=f1e99]:
                  - generic [ref=f1e100]: "2"
                  - paragraph [ref=f1e102]:
                    - text: סט 2
                    - generic [ref=f1e103]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e104] [cursor=pointer]
                - generic [ref=f1e107]:
                  - generic [ref=f1e108]:
                    - paragraph [ref=f1e109]: משקל בפועל
                    - generic [ref=f1e110]:
                      - button "הורד משקל בפועל" [ref=f1e111]
                      - generic [ref=f1e113]:
                        - textbox [ref=f1e114]: "20"
                        - generic [ref=f1e115]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e116]
                  - generic [ref=f1e118]:
                    - paragraph [ref=f1e119]: חזרות בפועל
                    - generic [ref=f1e120]:
                      - button "הורד חזרות בפועל" [ref=f1e121]
                      - textbox [ref=f1e124]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e125]
              - generic [ref=f1e127]:
                - generic [ref=f1e128]:
                  - generic [ref=f1e129]: "3"
                  - paragraph [ref=f1e131]:
                    - text: סט 3
                    - generic [ref=f1e132]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e133] [cursor=pointer]
                - generic [ref=f1e136]:
                  - generic [ref=f1e137]:
                    - paragraph [ref=f1e138]: משקל בפועל
                    - generic [ref=f1e139]:
                      - button "הורד משקל בפועל" [ref=f1e140]
                      - generic [ref=f1e142]:
                        - textbox [ref=f1e143]: "20"
                        - generic [ref=f1e144]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e145]
                  - generic [ref=f1e147]:
                    - paragraph [ref=f1e148]: חזרות בפועל
                    - generic [ref=f1e149]:
                      - button "הורד חזרות בפועל" [ref=f1e150]
                      - textbox [ref=f1e153]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e154]
          - generic [ref=f1e158] [cursor=pointer]:
            - generic [ref=f1e163]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e164]
          - generic [ref=f1e165]:
            - paragraph [ref=f1e166]: איך היה התרגיל?
            - generic [ref=f1e167]:
              - button "קל" [ref=f1e168]
              - button "מתאים" [ref=f1e169]
              - button "כבד" [ref=f1e170]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e171]
        - article [ref=f1e172]:
          - generic [ref=f1e173]:
            - button "פתח פרטי תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e174] [cursor=pointer]
            - button "תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e179] [cursor=pointer]
            - generic [ref=f1e180]:
              - button "תחליף מורשה" [ref=f1e181] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e187] [cursor=pointer]: 60ש׳
          - generic [ref=f1e191]:
            - paragraph [ref=f1e192]: ביצוע בפועל
            - generic [ref=f1e193]:
              - generic [ref=f1e194]:
                - generic [ref=f1e195]:
                  - generic [ref=f1e196]: "1"
                  - paragraph [ref=f1e198]:
                    - text: סט 1
                    - generic [ref=f1e199]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e200] [cursor=pointer]
                - generic [ref=f1e203]:
                  - generic [ref=f1e204]:
                    - paragraph [ref=f1e205]: משקל בפועל
                    - generic [ref=f1e206]:
                      - button "הורד משקל בפועל" [ref=f1e207]
                      - generic [ref=f1e209]:
                        - textbox [ref=f1e210]: "21"
                        - generic [ref=f1e211]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e212]
                  - generic [ref=f1e214]:
                    - paragraph [ref=f1e215]: חזרות בפועל
                    - generic [ref=f1e216]:
                      - button "הורד חזרות בפועל" [ref=f1e217]
                      - textbox [ref=f1e220]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e221]
              - generic [ref=f1e223]:
                - generic [ref=f1e224]:
                  - generic [ref=f1e225]: "2"
                  - paragraph [ref=f1e227]:
                    - text: סט 2
                    - generic [ref=f1e228]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e229] [cursor=pointer]
                - generic [ref=f1e232]:
                  - generic [ref=f1e233]:
                    - paragraph [ref=f1e234]: משקל בפועל
                    - generic [ref=f1e235]:
                      - button "הורד משקל בפועל" [ref=f1e236]
                      - generic [ref=f1e238]:
                        - textbox [ref=f1e239]: "21"
                        - generic [ref=f1e240]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e241]
                  - generic [ref=f1e243]:
                    - paragraph [ref=f1e244]: חזרות בפועל
                    - generic [ref=f1e245]:
                      - button "הורד חזרות בפועל" [ref=f1e246]
                      - textbox [ref=f1e249]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e250]
              - generic [ref=f1e252]:
                - generic [ref=f1e253]:
                  - generic [ref=f1e254]: "3"
                  - paragraph [ref=f1e256]:
                    - text: סט 3
                    - generic [ref=f1e257]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e258] [cursor=pointer]
                - generic [ref=f1e261]:
                  - generic [ref=f1e262]:
                    - paragraph [ref=f1e263]: משקל בפועל
                    - generic [ref=f1e264]:
                      - button "הורד משקל בפועל" [ref=f1e265]
                      - generic [ref=f1e267]:
                        - textbox [ref=f1e268]: "21"
                        - generic [ref=f1e269]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e270]
                  - generic [ref=f1e272]:
                    - paragraph [ref=f1e273]: חזרות בפועל
                    - generic [ref=f1e274]:
                      - button "הורד חזרות בפועל" [ref=f1e275]
                      - textbox [ref=f1e278]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e279]
          - generic [ref=f1e283] [cursor=pointer]:
            - generic [ref=f1e288]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e289]
          - generic [ref=f1e290]:
            - paragraph [ref=f1e291]: איך היה התרגיל?
            - generic [ref=f1e292]:
              - button "קל" [ref=f1e293]
              - button "מתאים" [ref=f1e294]
              - button "כבד" [ref=f1e295]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e296]
        - article [ref=f1e297]:
          - generic [ref=f1e298]:
            - button "פתח פרטי תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e299] [cursor=pointer]
            - button "תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e304] [cursor=pointer]
            - generic [ref=f1e305]:
              - button "תחליף מורשה" [ref=f1e306] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e312] [cursor=pointer]: 60ש׳
          - generic [ref=f1e316]:
            - paragraph [ref=f1e317]: ביצוע בפועל
            - generic [ref=f1e318]:
              - generic [ref=f1e319]:
                - generic [ref=f1e320]:
                  - generic [ref=f1e321]: "1"
                  - paragraph [ref=f1e323]:
                    - text: סט 1
                    - generic [ref=f1e324]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e325] [cursor=pointer]
                - generic [ref=f1e328]:
                  - generic [ref=f1e329]:
                    - paragraph [ref=f1e330]: משקל בפועל
                    - generic [ref=f1e331]:
                      - button "הורד משקל בפועל" [ref=f1e332]
                      - generic [ref=f1e334]:
                        - textbox [ref=f1e335]: "22"
                        - generic [ref=f1e336]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e337]
                  - generic [ref=f1e339]:
                    - paragraph [ref=f1e340]: חזרות בפועל
                    - generic [ref=f1e341]:
                      - button "הורד חזרות בפועל" [ref=f1e342]
                      - textbox [ref=f1e345]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e346]
              - generic [ref=f1e348]:
                - generic [ref=f1e349]:
                  - generic [ref=f1e350]: "2"
                  - paragraph [ref=f1e352]:
                    - text: סט 2
                    - generic [ref=f1e353]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e354] [cursor=pointer]
                - generic [ref=f1e357]:
                  - generic [ref=f1e358]:
                    - paragraph [ref=f1e359]: משקל בפועל
                    - generic [ref=f1e360]:
                      - button "הורד משקל בפועל" [ref=f1e361]
                      - generic [ref=f1e363]:
                        - textbox [ref=f1e364]: "22"
                        - generic [ref=f1e365]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e366]
                  - generic [ref=f1e368]:
                    - paragraph [ref=f1e369]: חזרות בפועל
                    - generic [ref=f1e370]:
                      - button "הורד חזרות בפועל" [ref=f1e371]
                      - textbox [ref=f1e374]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e375]
              - generic [ref=f1e377]:
                - generic [ref=f1e378]:
                  - generic [ref=f1e379]: "3"
                  - paragraph [ref=f1e381]:
                    - text: סט 3
                    - generic [ref=f1e382]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e383] [cursor=pointer]
                - generic [ref=f1e386]:
                  - generic [ref=f1e387]:
                    - paragraph [ref=f1e388]: משקל בפועל
                    - generic [ref=f1e389]:
                      - button "הורד משקל בפועל" [ref=f1e390]
                      - generic [ref=f1e392]:
                        - textbox [ref=f1e393]: "22"
                        - generic [ref=f1e394]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e395]
                  - generic [ref=f1e397]:
                    - paragraph [ref=f1e398]: חזרות בפועל
                    - generic [ref=f1e399]:
                      - button "הורד חזרות בפועל" [ref=f1e400]
                      - textbox [ref=f1e403]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e404]
          - generic [ref=f1e408] [cursor=pointer]:
            - generic [ref=f1e413]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e414]
          - generic [ref=f1e415]:
            - paragraph [ref=f1e416]: איך היה התרגיל?
            - generic [ref=f1e417]:
              - button "קל" [ref=f1e418]
              - button "מתאים" [ref=f1e419]
              - button "כבד" [ref=f1e420]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e421]
        - article [ref=f1e422]:
          - generic [ref=f1e423]:
            - button "פתח פרטי תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e424] [cursor=pointer]
            - button "תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e429] [cursor=pointer]
            - generic [ref=f1e430]:
              - button "תחליף מורשה" [ref=f1e431] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e437] [cursor=pointer]: 60ש׳
          - generic [ref=f1e441]:
            - paragraph [ref=f1e442]: ביצוע בפועל
            - generic [ref=f1e443]:
              - generic [ref=f1e444]:
                - generic [ref=f1e445]:
                  - generic [ref=f1e446]: "1"
                  - paragraph [ref=f1e448]:
                    - text: סט 1
                    - generic [ref=f1e449]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e450] [cursor=pointer]
                - generic [ref=f1e453]:
                  - generic [ref=f1e454]:
                    - paragraph [ref=f1e455]: משקל בפועל
                    - generic [ref=f1e456]:
                      - button "הורד משקל בפועל" [ref=f1e457]
                      - generic [ref=f1e459]:
                        - textbox [ref=f1e460]: "23"
                        - generic [ref=f1e461]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e462]
                  - generic [ref=f1e464]:
                    - paragraph [ref=f1e465]: חזרות בפועל
                    - generic [ref=f1e466]:
                      - button "הורד חזרות בפועל" [ref=f1e467]
                      - textbox [ref=f1e470]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e471]
              - generic [ref=f1e473]:
                - generic [ref=f1e474]:
                  - generic [ref=f1e475]: "2"
                  - paragraph [ref=f1e477]:
                    - text: סט 2
                    - generic [ref=f1e478]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e479] [cursor=pointer]
                - generic [ref=f1e482]:
                  - generic [ref=f1e483]:
                    - paragraph [ref=f1e484]: משקל בפועל
                    - generic [ref=f1e485]:
                      - button "הורד משקל בפועל" [ref=f1e486]
                      - generic [ref=f1e488]:
                        - textbox [ref=f1e489]: "23"
                        - generic [ref=f1e490]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e491]
                  - generic [ref=f1e493]:
                    - paragraph [ref=f1e494]: חזרות בפועל
                    - generic [ref=f1e495]:
                      - button "הורד חזרות בפועל" [ref=f1e496]
                      - textbox [ref=f1e499]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e500]
              - generic [ref=f1e502]:
                - generic [ref=f1e503]:
                  - generic [ref=f1e504]: "3"
                  - paragraph [ref=f1e506]:
                    - text: סט 3
                    - generic [ref=f1e507]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e508] [cursor=pointer]
                - generic [ref=f1e511]:
                  - generic [ref=f1e512]:
                    - paragraph [ref=f1e513]: משקל בפועל
                    - generic [ref=f1e514]:
                      - button "הורד משקל בפועל" [ref=f1e515]
                      - generic [ref=f1e517]:
                        - textbox [ref=f1e518]: "23"
                        - generic [ref=f1e519]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e520]
                  - generic [ref=f1e522]:
                    - paragraph [ref=f1e523]: חזרות בפועל
                    - generic [ref=f1e524]:
                      - button "הורד חזרות בפועל" [ref=f1e525]
                      - textbox [ref=f1e528]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e529]
          - generic [ref=f1e533] [cursor=pointer]:
            - generic [ref=f1e538]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e539]
          - generic [ref=f1e540]:
            - paragraph [ref=f1e541]: איך היה התרגיל?
            - generic [ref=f1e542]:
              - button "קל" [ref=f1e543]
              - button "מתאים" [ref=f1e544]
              - button "כבד" [ref=f1e545]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e546]
        - article [ref=f1e547]:
          - generic [ref=f1e548]:
            - button "פתח פרטי תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e549] [cursor=pointer]
            - button "תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e554] [cursor=pointer]
            - generic [ref=f1e555]:
              - button "תחליף מורשה" [ref=f1e556] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e562] [cursor=pointer]: 60ש׳
          - generic [ref=f1e566]:
            - paragraph [ref=f1e567]: ביצוע בפועל
            - generic [ref=f1e568]:
              - generic [ref=f1e569]:
                - generic [ref=f1e570]:
                  - generic [ref=f1e571]: "1"
                  - paragraph [ref=f1e573]:
                    - text: סט 1
                    - generic [ref=f1e574]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e575] [cursor=pointer]
                - generic [ref=f1e578]:
                  - generic [ref=f1e579]:
                    - paragraph [ref=f1e580]: משקל בפועל
                    - generic [ref=f1e581]:
                      - button "הורד משקל בפועל" [ref=f1e582]
                      - generic [ref=f1e584]:
                        - textbox [ref=f1e585]: "24"
                        - generic [ref=f1e586]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e587]
                  - generic [ref=f1e589]:
                    - paragraph [ref=f1e590]: חזרות בפועל
                    - generic [ref=f1e591]:
                      - button "הורד חזרות בפועל" [ref=f1e592]
                      - textbox [ref=f1e595]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e596]
              - generic [ref=f1e598]:
                - generic [ref=f1e599]:
                  - generic [ref=f1e600]: "2"
                  - paragraph [ref=f1e602]:
                    - text: סט 2
                    - generic [ref=f1e603]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e604] [cursor=pointer]
                - generic [ref=f1e607]:
                  - generic [ref=f1e608]:
                    - paragraph [ref=f1e609]: משקל בפועל
                    - generic [ref=f1e610]:
                      - button "הורד משקל בפועל" [ref=f1e611]
                      - generic [ref=f1e613]:
                        - textbox [ref=f1e614]: "24"
                        - generic [ref=f1e615]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e616]
                  - generic [ref=f1e618]:
                    - paragraph [ref=f1e619]: חזרות בפועל
                    - generic [ref=f1e620]:
                      - button "הורד חזרות בפועל" [ref=f1e621]
                      - textbox [ref=f1e624]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e625]
              - generic [ref=f1e627]:
                - generic [ref=f1e628]:
                  - generic [ref=f1e629]: "3"
                  - paragraph [ref=f1e631]:
                    - text: סט 3
                    - generic [ref=f1e632]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e633] [cursor=pointer]
                - generic [ref=f1e636]:
                  - generic [ref=f1e637]:
                    - paragraph [ref=f1e638]: משקל בפועל
                    - generic [ref=f1e639]:
                      - button "הורד משקל בפועל" [ref=f1e640]
                      - generic [ref=f1e642]:
                        - textbox [ref=f1e643]: "24"
                        - generic [ref=f1e644]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e645]
                  - generic [ref=f1e647]:
                    - paragraph [ref=f1e648]: חזרות בפועל
                    - generic [ref=f1e649]:
                      - button "הורד חזרות בפועל" [ref=f1e650]
                      - textbox [ref=f1e653]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e654]
          - generic [ref=f1e658] [cursor=pointer]:
            - generic [ref=f1e663]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e664]
          - generic [ref=f1e665]:
            - paragraph [ref=f1e666]: איך היה התרגיל?
            - generic [ref=f1e667]:
              - button "קל" [ref=f1e668]
              - button "מתאים" [ref=f1e669]
              - button "כבד" [ref=f1e670]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e671]
        - article [ref=f1e672]:
          - generic [ref=f1e673]:
            - button "פתח פרטי תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e674] [cursor=pointer]
            - button "תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e679] [cursor=pointer]
            - generic [ref=f1e680]:
              - button "תחליף מורשה" [ref=f1e681] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e687] [cursor=pointer]: 60ש׳
          - generic [ref=f1e691]:
            - paragraph [ref=f1e692]: ביצוע בפועל
            - generic [ref=f1e693]:
              - generic [ref=f1e694]:
                - generic [ref=f1e695]:
                  - generic [ref=f1e696]: "1"
                  - paragraph [ref=f1e698]:
                    - text: סט 1
                    - generic [ref=f1e699]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e700] [cursor=pointer]
                - generic [ref=f1e703]:
                  - generic [ref=f1e704]:
                    - paragraph [ref=f1e705]: משקל בפועל
                    - generic [ref=f1e706]:
                      - button "הורד משקל בפועל" [ref=f1e707]
                      - generic [ref=f1e709]:
                        - textbox [ref=f1e710]: "25"
                        - generic [ref=f1e711]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e712]
                  - generic [ref=f1e714]:
                    - paragraph [ref=f1e715]: חזרות בפועל
                    - generic [ref=f1e716]:
                      - button "הורד חזרות בפועל" [ref=f1e717]
                      - textbox [ref=f1e720]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e721]
              - generic [ref=f1e723]:
                - generic [ref=f1e724]:
                  - generic [ref=f1e725]: "2"
                  - paragraph [ref=f1e727]:
                    - text: סט 2
                    - generic [ref=f1e728]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e729] [cursor=pointer]
                - generic [ref=f1e732]:
                  - generic [ref=f1e733]:
                    - paragraph [ref=f1e734]: משקל בפועל
                    - generic [ref=f1e735]:
                      - button "הורד משקל בפועל" [ref=f1e736]
                      - generic [ref=f1e738]:
                        - textbox [ref=f1e739]: "25"
                        - generic [ref=f1e740]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e741]
                  - generic [ref=f1e743]:
                    - paragraph [ref=f1e744]: חזרות בפועל
                    - generic [ref=f1e745]:
                      - button "הורד חזרות בפועל" [ref=f1e746]
                      - textbox [ref=f1e749]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e750]
              - generic [ref=f1e752]:
                - generic [ref=f1e753]:
                  - generic [ref=f1e754]: "3"
                  - paragraph [ref=f1e756]:
                    - text: סט 3
                    - generic [ref=f1e757]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e758] [cursor=pointer]
                - generic [ref=f1e761]:
                  - generic [ref=f1e762]:
                    - paragraph [ref=f1e763]: משקל בפועל
                    - generic [ref=f1e764]:
                      - button "הורד משקל בפועל" [ref=f1e765]
                      - generic [ref=f1e767]:
                        - textbox [ref=f1e768]: "25"
                        - generic [ref=f1e769]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e770]
                  - generic [ref=f1e772]:
                    - paragraph [ref=f1e773]: חזרות בפועל
                    - generic [ref=f1e774]:
                      - button "הורד חזרות בפועל" [ref=f1e775]
                      - textbox [ref=f1e778]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e779]
          - generic [ref=f1e783] [cursor=pointer]:
            - generic [ref=f1e788]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e789]
          - generic [ref=f1e790]:
            - paragraph [ref=f1e791]: איך היה התרגיל?
            - generic [ref=f1e792]:
              - button "קל" [ref=f1e793]
              - button "מתאים" [ref=f1e794]
              - button "כבד" [ref=f1e795]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e796]
        - article [ref=f1e797]:
          - generic [ref=f1e798]:
            - button "פתח פרטי תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e799] [cursor=pointer]
            - button "תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e804] [cursor=pointer]
            - generic [ref=f1e805]:
              - button "תחליף מורשה" [ref=f1e806] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e812] [cursor=pointer]: 60ש׳
          - generic [ref=f1e816]:
            - paragraph [ref=f1e817]: ביצוע בפועל
            - generic [ref=f1e818]:
              - generic [ref=f1e819]:
                - generic [ref=f1e820]:
                  - generic [ref=f1e821]: "1"
                  - paragraph [ref=f1e823]:
                    - text: סט 1
                    - generic [ref=f1e824]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e825] [cursor=pointer]
                - generic [ref=f1e828]:
                  - generic [ref=f1e829]:
                    - paragraph [ref=f1e830]: משקל בפועל
                    - generic [ref=f1e831]:
                      - button "הורד משקל בפועל" [ref=f1e832]
                      - generic [ref=f1e834]:
                        - textbox [ref=f1e835]: "26"
                        - generic [ref=f1e836]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e837]
                  - generic [ref=f1e839]:
                    - paragraph [ref=f1e840]: חזרות בפועל
                    - generic [ref=f1e841]:
                      - button "הורד חזרות בפועל" [ref=f1e842]
                      - textbox [ref=f1e845]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e846]
              - generic [ref=f1e848]:
                - generic [ref=f1e849]:
                  - generic [ref=f1e850]: "2"
                  - paragraph [ref=f1e852]:
                    - text: סט 2
                    - generic [ref=f1e853]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e854] [cursor=pointer]
                - generic [ref=f1e857]:
                  - generic [ref=f1e858]:
                    - paragraph [ref=f1e859]: משקל בפועל
                    - generic [ref=f1e860]:
                      - button "הורד משקל בפועל" [ref=f1e861]
                      - generic [ref=f1e863]:
                        - textbox [ref=f1e864]: "26"
                        - generic [ref=f1e865]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e866]
                  - generic [ref=f1e868]:
                    - paragraph [ref=f1e869]: חזרות בפועל
                    - generic [ref=f1e870]:
                      - button "הורד חזרות בפועל" [ref=f1e871]
                      - textbox [ref=f1e874]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e875]
              - generic [ref=f1e877]:
                - generic [ref=f1e878]:
                  - generic [ref=f1e879]: "3"
                  - paragraph [ref=f1e881]:
                    - text: סט 3
                    - generic [ref=f1e882]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e883] [cursor=pointer]
                - generic [ref=f1e886]:
                  - generic [ref=f1e887]:
                    - paragraph [ref=f1e888]: משקל בפועל
                    - generic [ref=f1e889]:
                      - button "הורד משקל בפועל" [ref=f1e890]
                      - generic [ref=f1e892]:
                        - textbox [ref=f1e893]: "26"
                        - generic [ref=f1e894]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e895]
                  - generic [ref=f1e897]:
                    - paragraph [ref=f1e898]: חזרות בפועל
                    - generic [ref=f1e899]:
                      - button "הורד חזרות בפועל" [ref=f1e900]
                      - textbox [ref=f1e903]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e904]
          - generic [ref=f1e908] [cursor=pointer]:
            - generic [ref=f1e913]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e914]
          - generic [ref=f1e915]:
            - paragraph [ref=f1e916]: איך היה התרגיל?
            - generic [ref=f1e917]:
              - button "קל" [ref=f1e918]
              - button "מתאים" [ref=f1e919]
              - button "כבד" [ref=f1e920]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e921]
        - article [ref=f1e922]:
          - generic [ref=f1e923]:
            - button "פתח פרטי תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e924] [cursor=pointer]
            - button "תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e929] [cursor=pointer]
            - generic [ref=f1e930]:
              - button "תחליף מורשה" [ref=f1e931] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e937] [cursor=pointer]: 60ש׳
          - generic [ref=f1e941]:
            - paragraph [ref=f1e942]: ביצוע בפועל
            - generic [ref=f1e943]:
              - generic [ref=f1e944]:
                - generic [ref=f1e945]:
                  - generic [ref=f1e946]: "1"
                  - paragraph [ref=f1e948]:
                    - text: סט 1
                    - generic [ref=f1e949]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e950] [cursor=pointer]
                - generic [ref=f1e953]:
                  - generic [ref=f1e954]:
                    - paragraph [ref=f1e955]: משקל בפועל
                    - generic [ref=f1e956]:
                      - button "הורד משקל בפועל" [ref=f1e957]
                      - generic [ref=f1e959]:
                        - textbox [ref=f1e960]: "27"
                        - generic [ref=f1e961]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e962]
                  - generic [ref=f1e964]:
                    - paragraph [ref=f1e965]: חזרות בפועל
                    - generic [ref=f1e966]:
                      - button "הורד חזרות בפועל" [ref=f1e967]
                      - textbox [ref=f1e970]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e971]
              - generic [ref=f1e973]:
                - generic [ref=f1e974]:
                  - generic [ref=f1e975]: "2"
                  - paragraph [ref=f1e977]:
                    - text: סט 2
                    - generic [ref=f1e978]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e979] [cursor=pointer]
                - generic [ref=f1e982]:
                  - generic [ref=f1e983]:
                    - paragraph [ref=f1e984]: משקל בפועל
                    - generic [ref=f1e985]:
                      - button "הורד משקל בפועל" [ref=f1e986]
                      - generic [ref=f1e988]:
                        - textbox [ref=f1e989]: "27"
                        - generic [ref=f1e990]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e991]
                  - generic [ref=f1e993]:
                    - paragraph [ref=f1e994]: חזרות בפועל
                    - generic [ref=f1e995]:
                      - button "הורד חזרות בפועל" [ref=f1e996]
                      - textbox [ref=f1e999]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1000]
              - generic [ref=f1e1002]:
                - generic [ref=f1e1003]:
                  - generic [ref=f1e1004]: "3"
                  - paragraph [ref=f1e1006]:
                    - text: סט 3
                    - generic [ref=f1e1007]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e1008] [cursor=pointer]
                - generic [ref=f1e1011]:
                  - generic [ref=f1e1012]:
                    - paragraph [ref=f1e1013]: משקל בפועל
                    - generic [ref=f1e1014]:
                      - button "הורד משקל בפועל" [ref=f1e1015]
                      - generic [ref=f1e1017]:
                        - textbox [ref=f1e1018]: "27"
                        - generic [ref=f1e1019]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e1020]
                  - generic [ref=f1e1022]:
                    - paragraph [ref=f1e1023]: חזרות בפועל
                    - generic [ref=f1e1024]:
                      - button "הורד חזרות בפועל" [ref=f1e1025]
                      - textbox [ref=f1e1028]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1029]
          - generic [ref=f1e1033] [cursor=pointer]:
            - generic [ref=f1e1038]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e1039]
          - generic [ref=f1e1040]:
            - paragraph [ref=f1e1041]: איך היה התרגיל?
            - generic [ref=f1e1042]:
              - button "קל" [ref=f1e1043]
              - button "מתאים" [ref=f1e1044]
              - button "כבד" [ref=f1e1045]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e1046]
      - button "סיים ושמור אימון" [ref=f1e1048] [cursor=pointer]
    - navigation "ניווט ראשי":
      - generic [ref=f1e1051]:
        - link [ref=f1e1052]:
          - /url: /coach
        - link "מתאמנים" [ref=f1e1057]:
          - /url: /coach/clients
        - link "מעקב" [ref=f1e1065]:
          - /url: /coach/tracking
        - link "תרגילים" [ref=f1e1070]:
          - /url: /exercises
  - dialog "משוב על האימון" [ref=f1e1079]:
    - generic [ref=f1e1081]:
      - generic [ref=f1e1082]:
        - heading "אימון מצוין! איך הרגשת?" [level=3] [ref=f1e1087]
        - paragraph [ref=f1e1088]: המשוב יישמר בהיסטוריית האימון שלך
      - generic [ref=f1e1089]:
        - generic [ref=f1e1090]: דרגת קושי
        - generic [ref=f1e1091]:
          - button "קל מדי" [ref=f1e1092] [cursor=pointer]
          - button "מדויק" [ref=f1e1097] [cursor=pointer]
          - button "קשה מדי" [ref=f1e1101] [cursor=pointer]
      - generic [ref=f1e1106]:
        - generic [ref=f1e1107]: דיווח על אי-נוחות / הערה למאמן (אופציונלי)
        - 'textbox "למשל: עומס קל במרפק ימין בסט האחרון..." [ref=f1e1108]': הערת בדיקה 123
      - button "אישור ושמירת אימון" [ref=f1e1109] [cursor=pointer]
```

# Test source

```ts
  181 |       created_at: "2026-01-01T00:00:00.000Z",
  182 |       confirmed_at: "2026-01-01T00:00:00.000Z",
  183 |     },
  184 |   };
  185 | }
  186 | 
  187 | async function installFixture(page) {
  188 |   await page.addInitScript(
  189 |     ({ cacheKey, cacheValue, session, clientProfile, coachProfile, program, workouts, nutritionDay }) => {
  190 |       Object.defineProperty(window.navigator, "onLine", {
  191 |         configurable: true,
  192 |         get: () => false,
  193 |       });
  194 |       const originalGetItem = Storage.prototype.getItem;
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
  206 |       window.fetch = async (input, init) => {
  207 |         const url = typeof input === "string" ? input : input.url;
  208 |         if (url.includes("/auth/v1/user")) {
  209 |           return new Response(JSON.stringify(session.user), {
  210 |             status: 200,
  211 |             headers: { "content-type": "application/json" },
  212 |           });
  213 |         }
  214 |         if (url.includes("/rest/v1/")) {
  215 |           const parsed = new URL(url);
  216 |           const path = parsed.pathname.replace(/^.*\/rest\/v1\//, "");
  217 |           let body = [];
  218 |           if (path === "coach_clients") {
  219 |             body = [
  220 |               {
  221 |                 id: "ios-smoke-link",
  222 |                 client_id: clientProfile.id,
  223 |                 created_at: "2026-01-02T00:00:00.000Z",
  224 |                 profiles: {
  225 |                   email: clientProfile.email,
  226 |                   full_name: clientProfile.full_name,
  227 |                   weight_kg: clientProfile.weight_kg,
  228 |                 },
  229 |               },
  230 |             ];
  231 |           } else if (path === "profiles") {
  232 |             body = [parsed.searchParams.get("id")?.includes(clientProfile.id) ? clientProfile : coachProfile];
  233 |           } else if (path === "programs") {
  234 |             body = [{ id: program.id, user_id: clientProfile.id, name: program.name, description: program.notes }];
  235 |           } else if (path === "program_days") {
  236 |             body = workouts.map((workout, index) => ({
  237 |               id: workout.id,
  238 |               program_id: program.id,
  239 |               user_id: clientProfile.id,
  240 |               name: workout.name,
  241 |               items: workout.items,
  242 |               sort_order: index,
  243 |             }));
  244 |           } else if (path === "nutrition_days") {
  245 |             body = [nutritionDay];
  246 |           }
  247 |           return new Response(JSON.stringify(body), {
  248 |             status: 200,
  249 |             headers: {
  250 |               "content-range": `0-${Math.max(0, body.length - 1)}/*`,
  251 |               "content-type": "application/json",
  252 |             },
  253 |           });
  254 |         }
  255 |         return originalFetch(input, init);
  256 |       };
  257 |     },
  258 |     {
  259 |       cacheKey: `gymtrack.v1.user.${COACH_ID}`,
  260 |       cacheValue: gymData,
  261 |       session: authSession(),
  262 |       clientProfile,
  263 |       coachProfile,
  264 |       program,
  265 |       workouts,
  266 |       nutritionDay,
  267 |     },
  268 |   );
  269 | }
  270 | 
  271 | function assertKeyboardVisible(locator) {
  272 |   return expect
  273 |     .poll(async () => {
  274 |       return locator.evaluate((element) => {
  275 |         const rect = element.getBoundingClientRect();
  276 |         const viewport = window.visualViewport;
  277 |         const bottom = viewport?.height ?? window.innerHeight;
  278 |         return document.activeElement === element && rect.top >= 0 && rect.bottom <= bottom;
  279 |       });
  280 |     })
> 281 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  282 | }
  283 | 
  284 | test("authenticated iPhone coach workspace and active workout remain usable", async ({ page }) => {
  285 |   await installFixture(page);
  286 | 
  287 |   await page.goto("/");
  288 |   const coachNav = page.getByTestId("link-nav-coach");
  289 |   await expect(coachNav).toBeVisible();
  290 |   await coachNav.click();
  291 |   await expect(page).toHaveURL(/\/coach\/clients/);
  292 |   await page.getByRole("textbox", { name: "חיפוש לפי שם או אימייל" }).fill("בדיקה");
  293 |   await expect(page.getByText("מתאמנת בדיקה", { exact: true })).toBeVisible();
  294 | 
  295 |   const clientCard = page.getByText("מתאמנת בדיקה", { exact: true }).first();
  296 |   await clientCard.click();
  297 |   await expect(page.locator('[data-coach-workspace="true"]')).toBeVisible();
  298 | 
  299 |   const workspace = page.locator('[data-coach-workspace="true"]');
  300 |   await expect(workspace).toHaveCSS("overflow-y", "auto");
  301 |   await workspace.evaluate((element) => {
  302 |     element.scrollTop = element.scrollHeight;
  303 |   });
  304 |   await expect.poll(() => workspace.evaluate((element) => element.scrollTop > 0)).toBe(true);
  305 |   await expect
  306 |     .poll(() =>
  307 |       workspace.evaluate((element) => {
  308 |         const last = element.lastElementChild;
  309 |         return Boolean(last && last.getBoundingClientRect().bottom <= window.innerHeight);
  310 |       }),
  311 |     )
  312 |     .toBe(true);
  313 | 
  314 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  315 |   await expect(page.getByText("תוכנית האימונים", { exact: true })).toBeVisible();
  316 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  317 |   await expect(dayButtons).toHaveCount(4);
  318 |   await dayButtons.nth(0).click();
  319 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  320 |   await expect(page.locator("#coach-programs")).toBeHidden();
  321 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  322 |   await expect(workoutSurface).toBeVisible();
  323 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  324 |   await expect(reportToggle).toBeVisible();
  325 |   await reportToggle.click();
  326 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  327 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  328 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  329 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  330 | 
  331 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  332 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  333 | 
  334 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  335 |   await thirdSetMode.selectOption("drop");
  336 |   const dropRestInput = page.getByRole("spinbutton", { name: "דרופ סט זמן מנוחה" });
  337 |   await dropRestInput.fill("45");
  338 |   await expect(dropRestInput).toHaveValue("45");
  339 | 
  340 |   await thirdSetMode.selectOption("superset");
  341 |   const supersetSearch = page.getByRole("searchbox", {
  342 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  343 |   });
  344 |   await supersetSearch.fill("תרגיל בדיקה 2");
  345 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  346 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  347 | 
  348 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  349 |   await expect(dayButtons).toHaveCount(4);
  350 | 
  351 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  352 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  353 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  354 |   await foodSearch.fill("אורז");
  355 |   await assertKeyboardVisible(foodSearch);
  356 |   await expect(foodSearch).toHaveValue("אורז");
  357 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  358 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  359 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  360 | 
  361 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  362 |   await dayButtons.nth(0).click();
  363 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  364 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  365 | 
  366 |   await page.goto(`/session/${WORKOUT_ID}`);
  367 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  368 |   const progress = page.locator(".workout-progress-sticky");
  369 |   const firstExercise = page.locator("article").first();
  370 |   const progressBottom = await progress.boundingBox();
  371 |   const firstExerciseTop = await firstExercise.boundingBox();
  372 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  373 | 
  374 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  375 |   await repsInput.fill("123");
  376 |   await assertKeyboardVisible(repsInput);
  377 |   await page.keyboard.press("Tab");
  378 |   await expect(repsInput).toHaveValue("123");
  379 | 
  380 |   await page.getByRole("button", { name: "סיים ושמור אימון" }).click();
  381 |   const workoutNote = page.getByPlaceholder("למשל: עומס קל במרפק ימין בסט האחרון...");
```