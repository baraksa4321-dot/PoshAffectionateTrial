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
            - paragraph [ref=f1e55]: מכונה
            - generic [ref=f1e56]:
              - button "תחליף מורשה" [ref=f1e57] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e63] [cursor=pointer]: 60ש׳
          - generic [ref=f1e67]:
            - paragraph [ref=f1e68]: ביצוע בפועל
            - generic [ref=f1e69]:
              - generic [ref=f1e70]:
                - generic [ref=f1e71]:
                  - generic [ref=f1e72]: "1"
                  - paragraph [ref=f1e74]:
                    - text: סט 1
                    - generic [ref=f1e75]: · 123 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e76] [cursor=pointer]
                - generic [ref=f1e79]:
                  - generic [ref=f1e80]:
                    - paragraph [ref=f1e81]: משקל בפועל
                    - generic [ref=f1e82]:
                      - button "הורד משקל בפועל" [ref=f1e83]
                      - generic [ref=f1e85]:
                        - textbox [ref=f1e86]: "123"
                        - generic [ref=f1e87]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e88]
                  - generic [ref=f1e90]:
                    - paragraph [ref=f1e91]: חזרות בפועל
                    - generic [ref=f1e92]:
                      - button "הורד חזרות בפועל" [ref=f1e93]
                      - textbox [ref=f1e96]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e97]
              - generic [ref=f1e99]:
                - generic [ref=f1e100]:
                  - generic [ref=f1e101]: "2"
                  - paragraph [ref=f1e103]:
                    - text: סט 2
                    - generic [ref=f1e104]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e105] [cursor=pointer]
                - generic [ref=f1e108]:
                  - generic [ref=f1e109]:
                    - paragraph [ref=f1e110]: משקל בפועל
                    - generic [ref=f1e111]:
                      - button "הורד משקל בפועל" [ref=f1e112]
                      - generic [ref=f1e114]:
                        - textbox [ref=f1e115]: "20"
                        - generic [ref=f1e116]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e117]
                  - generic [ref=f1e119]:
                    - paragraph [ref=f1e120]: חזרות בפועל
                    - generic [ref=f1e121]:
                      - button "הורד חזרות בפועל" [ref=f1e122]
                      - textbox [ref=f1e125]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e126]
              - generic [ref=f1e128]:
                - generic [ref=f1e129]:
                  - generic [ref=f1e130]: "3"
                  - paragraph [ref=f1e132]:
                    - text: סט 3
                    - generic [ref=f1e133]: · 20 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e134] [cursor=pointer]
                - generic [ref=f1e137]:
                  - generic [ref=f1e138]:
                    - paragraph [ref=f1e139]: משקל בפועל
                    - generic [ref=f1e140]:
                      - button "הורד משקל בפועל" [ref=f1e141]
                      - generic [ref=f1e143]:
                        - textbox [ref=f1e144]: "20"
                        - generic [ref=f1e145]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e146]
                  - generic [ref=f1e148]:
                    - paragraph [ref=f1e149]: חזרות בפועל
                    - generic [ref=f1e150]:
                      - button "הורד חזרות בפועל" [ref=f1e151]
                      - textbox [ref=f1e154]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e155]
          - generic [ref=f1e159] [cursor=pointer]:
            - generic [ref=f1e164]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e165]
          - generic [ref=f1e166]:
            - paragraph [ref=f1e167]: איך היה התרגיל?
            - generic [ref=f1e168]:
              - button "קל" [ref=f1e169]
              - button "מתאים" [ref=f1e170]
              - button "כבד" [ref=f1e171]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e172]
        - article [ref=f1e173]:
          - generic [ref=f1e174]:
            - button "פתח פרטי תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e175] [cursor=pointer]
            - button "תרגיל בדיקה 2 (Smoke Exercise 2)" [ref=f1e180] [cursor=pointer]
            - paragraph [ref=f1e181]: מכונה
            - generic [ref=f1e182]:
              - button "תחליף מורשה" [ref=f1e183] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e189] [cursor=pointer]: 60ש׳
          - generic [ref=f1e193]:
            - paragraph [ref=f1e194]: ביצוע בפועל
            - generic [ref=f1e195]:
              - generic [ref=f1e196]:
                - generic [ref=f1e197]:
                  - generic [ref=f1e198]: "1"
                  - paragraph [ref=f1e200]:
                    - text: סט 1
                    - generic [ref=f1e201]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e202] [cursor=pointer]
                - generic [ref=f1e205]:
                  - generic [ref=f1e206]:
                    - paragraph [ref=f1e207]: משקל בפועל
                    - generic [ref=f1e208]:
                      - button "הורד משקל בפועל" [ref=f1e209]
                      - generic [ref=f1e211]:
                        - textbox [ref=f1e212]: "21"
                        - generic [ref=f1e213]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e214]
                  - generic [ref=f1e216]:
                    - paragraph [ref=f1e217]: חזרות בפועל
                    - generic [ref=f1e218]:
                      - button "הורד חזרות בפועל" [ref=f1e219]
                      - textbox [ref=f1e222]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e223]
              - generic [ref=f1e225]:
                - generic [ref=f1e226]:
                  - generic [ref=f1e227]: "2"
                  - paragraph [ref=f1e229]:
                    - text: סט 2
                    - generic [ref=f1e230]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e231] [cursor=pointer]
                - generic [ref=f1e234]:
                  - generic [ref=f1e235]:
                    - paragraph [ref=f1e236]: משקל בפועל
                    - generic [ref=f1e237]:
                      - button "הורד משקל בפועל" [ref=f1e238]
                      - generic [ref=f1e240]:
                        - textbox [ref=f1e241]: "21"
                        - generic [ref=f1e242]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e243]
                  - generic [ref=f1e245]:
                    - paragraph [ref=f1e246]: חזרות בפועל
                    - generic [ref=f1e247]:
                      - button "הורד חזרות בפועל" [ref=f1e248]
                      - textbox [ref=f1e251]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e252]
              - generic [ref=f1e254]:
                - generic [ref=f1e255]:
                  - generic [ref=f1e256]: "3"
                  - paragraph [ref=f1e258]:
                    - text: סט 3
                    - generic [ref=f1e259]: · 21 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e260] [cursor=pointer]
                - generic [ref=f1e263]:
                  - generic [ref=f1e264]:
                    - paragraph [ref=f1e265]: משקל בפועל
                    - generic [ref=f1e266]:
                      - button "הורד משקל בפועל" [ref=f1e267]
                      - generic [ref=f1e269]:
                        - textbox [ref=f1e270]: "21"
                        - generic [ref=f1e271]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e272]
                  - generic [ref=f1e274]:
                    - paragraph [ref=f1e275]: חזרות בפועל
                    - generic [ref=f1e276]:
                      - button "הורד חזרות בפועל" [ref=f1e277]
                      - textbox [ref=f1e280]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e281]
          - generic [ref=f1e285] [cursor=pointer]:
            - generic [ref=f1e290]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e291]
          - generic [ref=f1e292]:
            - paragraph [ref=f1e293]: איך היה התרגיל?
            - generic [ref=f1e294]:
              - button "קל" [ref=f1e295]
              - button "מתאים" [ref=f1e296]
              - button "כבד" [ref=f1e297]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e298]
        - article [ref=f1e299]:
          - generic [ref=f1e300]:
            - button "פתח פרטי תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e301] [cursor=pointer]
            - button "תרגיל בדיקה 3 (Smoke Exercise 3)" [ref=f1e306] [cursor=pointer]
            - paragraph [ref=f1e307]: מכונה
            - generic [ref=f1e308]:
              - button "תחליף מורשה" [ref=f1e309] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e315] [cursor=pointer]: 60ש׳
          - generic [ref=f1e319]:
            - paragraph [ref=f1e320]: ביצוע בפועל
            - generic [ref=f1e321]:
              - generic [ref=f1e322]:
                - generic [ref=f1e323]:
                  - generic [ref=f1e324]: "1"
                  - paragraph [ref=f1e326]:
                    - text: סט 1
                    - generic [ref=f1e327]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e328] [cursor=pointer]
                - generic [ref=f1e331]:
                  - generic [ref=f1e332]:
                    - paragraph [ref=f1e333]: משקל בפועל
                    - generic [ref=f1e334]:
                      - button "הורד משקל בפועל" [ref=f1e335]
                      - generic [ref=f1e337]:
                        - textbox [ref=f1e338]: "22"
                        - generic [ref=f1e339]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e340]
                  - generic [ref=f1e342]:
                    - paragraph [ref=f1e343]: חזרות בפועל
                    - generic [ref=f1e344]:
                      - button "הורד חזרות בפועל" [ref=f1e345]
                      - textbox [ref=f1e348]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e349]
              - generic [ref=f1e351]:
                - generic [ref=f1e352]:
                  - generic [ref=f1e353]: "2"
                  - paragraph [ref=f1e355]:
                    - text: סט 2
                    - generic [ref=f1e356]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e357] [cursor=pointer]
                - generic [ref=f1e360]:
                  - generic [ref=f1e361]:
                    - paragraph [ref=f1e362]: משקל בפועל
                    - generic [ref=f1e363]:
                      - button "הורד משקל בפועל" [ref=f1e364]
                      - generic [ref=f1e366]:
                        - textbox [ref=f1e367]: "22"
                        - generic [ref=f1e368]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e369]
                  - generic [ref=f1e371]:
                    - paragraph [ref=f1e372]: חזרות בפועל
                    - generic [ref=f1e373]:
                      - button "הורד חזרות בפועל" [ref=f1e374]
                      - textbox [ref=f1e377]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e378]
              - generic [ref=f1e380]:
                - generic [ref=f1e381]:
                  - generic [ref=f1e382]: "3"
                  - paragraph [ref=f1e384]:
                    - text: סט 3
                    - generic [ref=f1e385]: · 22 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e386] [cursor=pointer]
                - generic [ref=f1e389]:
                  - generic [ref=f1e390]:
                    - paragraph [ref=f1e391]: משקל בפועל
                    - generic [ref=f1e392]:
                      - button "הורד משקל בפועל" [ref=f1e393]
                      - generic [ref=f1e395]:
                        - textbox [ref=f1e396]: "22"
                        - generic [ref=f1e397]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e398]
                  - generic [ref=f1e400]:
                    - paragraph [ref=f1e401]: חזרות בפועל
                    - generic [ref=f1e402]:
                      - button "הורד חזרות בפועל" [ref=f1e403]
                      - textbox [ref=f1e406]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e407]
          - generic [ref=f1e411] [cursor=pointer]:
            - generic [ref=f1e416]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e417]
          - generic [ref=f1e418]:
            - paragraph [ref=f1e419]: איך היה התרגיל?
            - generic [ref=f1e420]:
              - button "קל" [ref=f1e421]
              - button "מתאים" [ref=f1e422]
              - button "כבד" [ref=f1e423]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e424]
        - article [ref=f1e425]:
          - generic [ref=f1e426]:
            - button "פתח פרטי תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e427] [cursor=pointer]
            - button "תרגיל בדיקה 4 (Smoke Exercise 4)" [ref=f1e432] [cursor=pointer]
            - paragraph [ref=f1e433]: מכונה
            - generic [ref=f1e434]:
              - button "תחליף מורשה" [ref=f1e435] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e441] [cursor=pointer]: 60ש׳
          - generic [ref=f1e445]:
            - paragraph [ref=f1e446]: ביצוע בפועל
            - generic [ref=f1e447]:
              - generic [ref=f1e448]:
                - generic [ref=f1e449]:
                  - generic [ref=f1e450]: "1"
                  - paragraph [ref=f1e452]:
                    - text: סט 1
                    - generic [ref=f1e453]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e454] [cursor=pointer]
                - generic [ref=f1e457]:
                  - generic [ref=f1e458]:
                    - paragraph [ref=f1e459]: משקל בפועל
                    - generic [ref=f1e460]:
                      - button "הורד משקל בפועל" [ref=f1e461]
                      - generic [ref=f1e463]:
                        - textbox [ref=f1e464]: "23"
                        - generic [ref=f1e465]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e466]
                  - generic [ref=f1e468]:
                    - paragraph [ref=f1e469]: חזרות בפועל
                    - generic [ref=f1e470]:
                      - button "הורד חזרות בפועל" [ref=f1e471]
                      - textbox [ref=f1e474]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e475]
              - generic [ref=f1e477]:
                - generic [ref=f1e478]:
                  - generic [ref=f1e479]: "2"
                  - paragraph [ref=f1e481]:
                    - text: סט 2
                    - generic [ref=f1e482]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e483] [cursor=pointer]
                - generic [ref=f1e486]:
                  - generic [ref=f1e487]:
                    - paragraph [ref=f1e488]: משקל בפועל
                    - generic [ref=f1e489]:
                      - button "הורד משקל בפועל" [ref=f1e490]
                      - generic [ref=f1e492]:
                        - textbox [ref=f1e493]: "23"
                        - generic [ref=f1e494]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e495]
                  - generic [ref=f1e497]:
                    - paragraph [ref=f1e498]: חזרות בפועל
                    - generic [ref=f1e499]:
                      - button "הורד חזרות בפועל" [ref=f1e500]
                      - textbox [ref=f1e503]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e504]
              - generic [ref=f1e506]:
                - generic [ref=f1e507]:
                  - generic [ref=f1e508]: "3"
                  - paragraph [ref=f1e510]:
                    - text: סט 3
                    - generic [ref=f1e511]: · 23 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e512] [cursor=pointer]
                - generic [ref=f1e515]:
                  - generic [ref=f1e516]:
                    - paragraph [ref=f1e517]: משקל בפועל
                    - generic [ref=f1e518]:
                      - button "הורד משקל בפועל" [ref=f1e519]
                      - generic [ref=f1e521]:
                        - textbox [ref=f1e522]: "23"
                        - generic [ref=f1e523]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e524]
                  - generic [ref=f1e526]:
                    - paragraph [ref=f1e527]: חזרות בפועל
                    - generic [ref=f1e528]:
                      - button "הורד חזרות בפועל" [ref=f1e529]
                      - textbox [ref=f1e532]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e533]
          - generic [ref=f1e537] [cursor=pointer]:
            - generic [ref=f1e542]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e543]
          - generic [ref=f1e544]:
            - paragraph [ref=f1e545]: איך היה התרגיל?
            - generic [ref=f1e546]:
              - button "קל" [ref=f1e547]
              - button "מתאים" [ref=f1e548]
              - button "כבד" [ref=f1e549]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e550]
        - article [ref=f1e551]:
          - generic [ref=f1e552]:
            - button "פתח פרטי תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e553] [cursor=pointer]
            - button "תרגיל בדיקה 5 (Smoke Exercise 5)" [ref=f1e558] [cursor=pointer]
            - paragraph [ref=f1e559]: מכונה
            - generic [ref=f1e560]:
              - button "תחליף מורשה" [ref=f1e561] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e567] [cursor=pointer]: 60ש׳
          - generic [ref=f1e571]:
            - paragraph [ref=f1e572]: ביצוע בפועל
            - generic [ref=f1e573]:
              - generic [ref=f1e574]:
                - generic [ref=f1e575]:
                  - generic [ref=f1e576]: "1"
                  - paragraph [ref=f1e578]:
                    - text: סט 1
                    - generic [ref=f1e579]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e580] [cursor=pointer]
                - generic [ref=f1e583]:
                  - generic [ref=f1e584]:
                    - paragraph [ref=f1e585]: משקל בפועל
                    - generic [ref=f1e586]:
                      - button "הורד משקל בפועל" [ref=f1e587]
                      - generic [ref=f1e589]:
                        - textbox [ref=f1e590]: "24"
                        - generic [ref=f1e591]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e592]
                  - generic [ref=f1e594]:
                    - paragraph [ref=f1e595]: חזרות בפועל
                    - generic [ref=f1e596]:
                      - button "הורד חזרות בפועל" [ref=f1e597]
                      - textbox [ref=f1e600]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e601]
              - generic [ref=f1e603]:
                - generic [ref=f1e604]:
                  - generic [ref=f1e605]: "2"
                  - paragraph [ref=f1e607]:
                    - text: סט 2
                    - generic [ref=f1e608]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e609] [cursor=pointer]
                - generic [ref=f1e612]:
                  - generic [ref=f1e613]:
                    - paragraph [ref=f1e614]: משקל בפועל
                    - generic [ref=f1e615]:
                      - button "הורד משקל בפועל" [ref=f1e616]
                      - generic [ref=f1e618]:
                        - textbox [ref=f1e619]: "24"
                        - generic [ref=f1e620]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e621]
                  - generic [ref=f1e623]:
                    - paragraph [ref=f1e624]: חזרות בפועל
                    - generic [ref=f1e625]:
                      - button "הורד חזרות בפועל" [ref=f1e626]
                      - textbox [ref=f1e629]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e630]
              - generic [ref=f1e632]:
                - generic [ref=f1e633]:
                  - generic [ref=f1e634]: "3"
                  - paragraph [ref=f1e636]:
                    - text: סט 3
                    - generic [ref=f1e637]: · 24 ק״ג · 8 חזרות
                  - button "סמן סט כבוצע" [ref=f1e638] [cursor=pointer]
                - generic [ref=f1e641]:
                  - generic [ref=f1e642]:
                    - paragraph [ref=f1e643]: משקל בפועל
                    - generic [ref=f1e644]:
                      - button "הורד משקל בפועל" [ref=f1e645]
                      - generic [ref=f1e647]:
                        - textbox [ref=f1e648]: "24"
                        - generic [ref=f1e649]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e650]
                  - generic [ref=f1e652]:
                    - paragraph [ref=f1e653]: חזרות בפועל
                    - generic [ref=f1e654]:
                      - button "הורד חזרות בפועל" [ref=f1e655]
                      - textbox [ref=f1e658]: "8"
                      - button "הגדל חזרות בפועל" [ref=f1e659]
          - generic [ref=f1e663] [cursor=pointer]:
            - generic [ref=f1e668]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e669]
          - generic [ref=f1e670]:
            - paragraph [ref=f1e671]: איך היה התרגיל?
            - generic [ref=f1e672]:
              - button "קל" [ref=f1e673]
              - button "מתאים" [ref=f1e674]
              - button "כבד" [ref=f1e675]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e676]
        - article [ref=f1e677]:
          - generic [ref=f1e678]:
            - button "פתח פרטי תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e679] [cursor=pointer]
            - button "תרגיל בדיקה 6 (Smoke Exercise 6)" [ref=f1e684] [cursor=pointer]
            - paragraph [ref=f1e685]: מכונה
            - generic [ref=f1e686]:
              - button "תחליף מורשה" [ref=f1e687] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e693] [cursor=pointer]: 60ש׳
          - generic [ref=f1e697]:
            - paragraph [ref=f1e698]: ביצוע בפועל
            - generic [ref=f1e699]:
              - generic [ref=f1e700]:
                - generic [ref=f1e701]:
                  - generic [ref=f1e702]: "1"
                  - paragraph [ref=f1e704]:
                    - text: סט 1
                    - generic [ref=f1e705]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e706] [cursor=pointer]
                - generic [ref=f1e709]:
                  - generic [ref=f1e710]:
                    - paragraph [ref=f1e711]: משקל בפועל
                    - generic [ref=f1e712]:
                      - button "הורד משקל בפועל" [ref=f1e713]
                      - generic [ref=f1e715]:
                        - textbox [ref=f1e716]: "25"
                        - generic [ref=f1e717]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e718]
                  - generic [ref=f1e720]:
                    - paragraph [ref=f1e721]: חזרות בפועל
                    - generic [ref=f1e722]:
                      - button "הורד חזרות בפועל" [ref=f1e723]
                      - textbox [ref=f1e726]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e727]
              - generic [ref=f1e729]:
                - generic [ref=f1e730]:
                  - generic [ref=f1e731]: "2"
                  - paragraph [ref=f1e733]:
                    - text: סט 2
                    - generic [ref=f1e734]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e735] [cursor=pointer]
                - generic [ref=f1e738]:
                  - generic [ref=f1e739]:
                    - paragraph [ref=f1e740]: משקל בפועל
                    - generic [ref=f1e741]:
                      - button "הורד משקל בפועל" [ref=f1e742]
                      - generic [ref=f1e744]:
                        - textbox [ref=f1e745]: "25"
                        - generic [ref=f1e746]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e747]
                  - generic [ref=f1e749]:
                    - paragraph [ref=f1e750]: חזרות בפועל
                    - generic [ref=f1e751]:
                      - button "הורד חזרות בפועל" [ref=f1e752]
                      - textbox [ref=f1e755]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e756]
              - generic [ref=f1e758]:
                - generic [ref=f1e759]:
                  - generic [ref=f1e760]: "3"
                  - paragraph [ref=f1e762]:
                    - text: סט 3
                    - generic [ref=f1e763]: · 25 ק״ג · 9 חזרות
                  - button "סמן סט כבוצע" [ref=f1e764] [cursor=pointer]
                - generic [ref=f1e767]:
                  - generic [ref=f1e768]:
                    - paragraph [ref=f1e769]: משקל בפועל
                    - generic [ref=f1e770]:
                      - button "הורד משקל בפועל" [ref=f1e771]
                      - generic [ref=f1e773]:
                        - textbox [ref=f1e774]: "25"
                        - generic [ref=f1e775]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e776]
                  - generic [ref=f1e778]:
                    - paragraph [ref=f1e779]: חזרות בפועל
                    - generic [ref=f1e780]:
                      - button "הורד חזרות בפועל" [ref=f1e781]
                      - textbox [ref=f1e784]: "9"
                      - button "הגדל חזרות בפועל" [ref=f1e785]
          - generic [ref=f1e789] [cursor=pointer]:
            - generic [ref=f1e794]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e795]
          - generic [ref=f1e796]:
            - paragraph [ref=f1e797]: איך היה התרגיל?
            - generic [ref=f1e798]:
              - button "קל" [ref=f1e799]
              - button "מתאים" [ref=f1e800]
              - button "כבד" [ref=f1e801]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e802]
        - article [ref=f1e803]:
          - generic [ref=f1e804]:
            - button "פתח פרטי תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e805] [cursor=pointer]
            - button "תרגיל בדיקה 7 (Smoke Exercise 7)" [ref=f1e810] [cursor=pointer]
            - paragraph [ref=f1e811]: מכונה
            - generic [ref=f1e812]:
              - button "תחליף מורשה" [ref=f1e813] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e819] [cursor=pointer]: 60ש׳
          - generic [ref=f1e823]:
            - paragraph [ref=f1e824]: ביצוע בפועל
            - generic [ref=f1e825]:
              - generic [ref=f1e826]:
                - generic [ref=f1e827]:
                  - generic [ref=f1e828]: "1"
                  - paragraph [ref=f1e830]:
                    - text: סט 1
                    - generic [ref=f1e831]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e832] [cursor=pointer]
                - generic [ref=f1e835]:
                  - generic [ref=f1e836]:
                    - paragraph [ref=f1e837]: משקל בפועל
                    - generic [ref=f1e838]:
                      - button "הורד משקל בפועל" [ref=f1e839]
                      - generic [ref=f1e841]:
                        - textbox [ref=f1e842]: "26"
                        - generic [ref=f1e843]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e844]
                  - generic [ref=f1e846]:
                    - paragraph [ref=f1e847]: חזרות בפועל
                    - generic [ref=f1e848]:
                      - button "הורד חזרות בפועל" [ref=f1e849]
                      - textbox [ref=f1e852]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e853]
              - generic [ref=f1e855]:
                - generic [ref=f1e856]:
                  - generic [ref=f1e857]: "2"
                  - paragraph [ref=f1e859]:
                    - text: סט 2
                    - generic [ref=f1e860]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e861] [cursor=pointer]
                - generic [ref=f1e864]:
                  - generic [ref=f1e865]:
                    - paragraph [ref=f1e866]: משקל בפועל
                    - generic [ref=f1e867]:
                      - button "הורד משקל בפועל" [ref=f1e868]
                      - generic [ref=f1e870]:
                        - textbox [ref=f1e871]: "26"
                        - generic [ref=f1e872]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e873]
                  - generic [ref=f1e875]:
                    - paragraph [ref=f1e876]: חזרות בפועל
                    - generic [ref=f1e877]:
                      - button "הורד חזרות בפועל" [ref=f1e878]
                      - textbox [ref=f1e881]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e882]
              - generic [ref=f1e884]:
                - generic [ref=f1e885]:
                  - generic [ref=f1e886]: "3"
                  - paragraph [ref=f1e888]:
                    - text: סט 3
                    - generic [ref=f1e889]: · 26 ק״ג · 10 חזרות
                  - button "סמן סט כבוצע" [ref=f1e890] [cursor=pointer]
                - generic [ref=f1e893]:
                  - generic [ref=f1e894]:
                    - paragraph [ref=f1e895]: משקל בפועל
                    - generic [ref=f1e896]:
                      - button "הורד משקל בפועל" [ref=f1e897]
                      - generic [ref=f1e899]:
                        - textbox [ref=f1e900]: "26"
                        - generic [ref=f1e901]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e902]
                  - generic [ref=f1e904]:
                    - paragraph [ref=f1e905]: חזרות בפועל
                    - generic [ref=f1e906]:
                      - button "הורד חזרות בפועל" [ref=f1e907]
                      - textbox [ref=f1e910]: "10"
                      - button "הגדל חזרות בפועל" [ref=f1e911]
          - generic [ref=f1e915] [cursor=pointer]:
            - generic [ref=f1e920]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e921]
          - generic [ref=f1e922]:
            - paragraph [ref=f1e923]: איך היה התרגיל?
            - generic [ref=f1e924]:
              - button "קל" [ref=f1e925]
              - button "מתאים" [ref=f1e926]
              - button "כבד" [ref=f1e927]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e928]
        - article [ref=f1e929]:
          - generic [ref=f1e930]:
            - button "פתח פרטי תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e931] [cursor=pointer]
            - button "תרגיל בדיקה 8 (Smoke Exercise 8)" [ref=f1e936] [cursor=pointer]
            - paragraph [ref=f1e937]: מכונה
            - generic [ref=f1e938]:
              - button "תחליף מורשה" [ref=f1e939] [cursor=pointer]
              - button "התחל מנוחה" [ref=f1e945] [cursor=pointer]: 60ש׳
          - generic [ref=f1e949]:
            - paragraph [ref=f1e950]: ביצוע בפועל
            - generic [ref=f1e951]:
              - generic [ref=f1e952]:
                - generic [ref=f1e953]:
                  - generic [ref=f1e954]: "1"
                  - paragraph [ref=f1e956]:
                    - text: סט 1
                    - generic [ref=f1e957]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e958] [cursor=pointer]
                - generic [ref=f1e961]:
                  - generic [ref=f1e962]:
                    - paragraph [ref=f1e963]: משקל בפועל
                    - generic [ref=f1e964]:
                      - button "הורד משקל בפועל" [ref=f1e965]
                      - generic [ref=f1e967]:
                        - textbox [ref=f1e968]: "27"
                        - generic [ref=f1e969]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e970]
                  - generic [ref=f1e972]:
                    - paragraph [ref=f1e973]: חזרות בפועל
                    - generic [ref=f1e974]:
                      - button "הורד חזרות בפועל" [ref=f1e975]
                      - textbox [ref=f1e978]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e979]
              - generic [ref=f1e981]:
                - generic [ref=f1e982]:
                  - generic [ref=f1e983]: "2"
                  - paragraph [ref=f1e985]:
                    - text: סט 2
                    - generic [ref=f1e986]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e987] [cursor=pointer]
                - generic [ref=f1e990]:
                  - generic [ref=f1e991]:
                    - paragraph [ref=f1e992]: משקל בפועל
                    - generic [ref=f1e993]:
                      - button "הורד משקל בפועל" [ref=f1e994]
                      - generic [ref=f1e996]:
                        - textbox [ref=f1e997]: "27"
                        - generic [ref=f1e998]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e999]
                  - generic [ref=f1e1001]:
                    - paragraph [ref=f1e1002]: חזרות בפועל
                    - generic [ref=f1e1003]:
                      - button "הורד חזרות בפועל" [ref=f1e1004]
                      - textbox [ref=f1e1007]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1008]
              - generic [ref=f1e1010]:
                - generic [ref=f1e1011]:
                  - generic [ref=f1e1012]: "3"
                  - paragraph [ref=f1e1014]:
                    - text: סט 3
                    - generic [ref=f1e1015]: · 27 ק״ג · 11 חזרות
                  - button "סמן סט כבוצע" [ref=f1e1016] [cursor=pointer]
                - generic [ref=f1e1019]:
                  - generic [ref=f1e1020]:
                    - paragraph [ref=f1e1021]: משקל בפועל
                    - generic [ref=f1e1022]:
                      - button "הורד משקל בפועל" [ref=f1e1023]
                      - generic [ref=f1e1025]:
                        - textbox [ref=f1e1026]: "27"
                        - generic [ref=f1e1027]: ק״ג
                      - button "הגדל משקל בפועל" [ref=f1e1028]
                  - generic [ref=f1e1030]:
                    - paragraph [ref=f1e1031]: חזרות בפועל
                    - generic [ref=f1e1032]:
                      - button "הורד חזרות בפועל" [ref=f1e1033]
                      - textbox [ref=f1e1036]: "11"
                      - button "הגדל חזרות בפועל" [ref=f1e1037]
          - generic [ref=f1e1041] [cursor=pointer]:
            - generic [ref=f1e1046]: בחירה מהגלריה
            - button "בחירה מהגלריה" [ref=f1e1047]
          - generic [ref=f1e1048]:
            - paragraph [ref=f1e1049]: איך היה התרגיל?
            - generic [ref=f1e1050]:
              - button "קל" [ref=f1e1051]
              - button "מתאים" [ref=f1e1052]
              - button "כבד" [ref=f1e1053]
            - textbox "כאב, אי־נוחות או הערה למאמנת..." [ref=f1e1054]
      - button "סיים ושמור אימון" [ref=f1e1056] [cursor=pointer]
    - navigation "ניווט ראשי":
      - generic [ref=f1e1059]:
        - link [ref=f1e1060]:
          - /url: /coach
        - link "מתאמנים" [ref=f1e1064]:
          - /url: /coach/clients
        - link "מעקב" [ref=f1e1071]:
          - /url: /coach/tracking
        - link "תרגילים" [ref=f1e1075]:
          - /url: /exercises
  - dialog "משוב על האימון" [ref=f1e1083]:
    - generic [ref=f1e1085]:
      - generic [ref=f1e1086]:
        - heading "אימון מצוין! איך הרגשת?" [level=3] [ref=f1e1091]
        - paragraph [ref=f1e1092]: המשוב יישמר בהיסטוריית האימון שלך
      - generic [ref=f1e1093]:
        - generic [ref=f1e1094]: דרגת קושי
        - generic [ref=f1e1095]:
          - button "קל מדי" [ref=f1e1096] [cursor=pointer]
          - button "מדויק" [ref=f1e1101] [cursor=pointer]
          - button "קשה מדי" [ref=f1e1105] [cursor=pointer]
      - generic [ref=f1e1110]:
        - generic [ref=f1e1111]: דיווח על אי-נוחות / הערה למאמן (אופציונלי)
        - 'textbox "למשל: עומס קל במרפק ימין בסט האחרון..." [ref=f1e1112]': הערת בדיקה 123
      - button "אישור ושמירת אימון" [ref=f1e1113] [cursor=pointer]
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
  314 |   const programsTab = page.getByRole("tab", { name: "תוכנית אימונים", exact: true });
  315 |   await programsTab.click();
  316 |   await expect(programsTab).toHaveAttribute("aria-selected", "true");
  317 |   const dayButtons = page.getByRole("button", { name: /^בניית אימון אימון בדיקה/ });
  318 |   await expect(dayButtons).toHaveCount(4);
  319 |   await dayButtons.nth(0).click();
  320 |   await expect(page.getByRole("button", { name: "סגירת בניית אימון", exact: true })).toBeVisible();
  321 |   await expect(page.locator("#coach-programs")).toBeHidden();
  322 |   const workoutSurface = page.locator('[data-coach-workout-surface-slot="true"]');
  323 |   await expect(workoutSurface).toBeVisible();
  324 |   const reportToggle = page.getByRole("button", { name: "פתיחת דוח", exact: true });
  325 |   await expect(reportToggle).toBeVisible();
  326 |   await reportToggle.click();
  327 |   await expect(page.getByRole("button", { name: "סגירת דוח", exact: true })).toBeVisible();
  328 |   await expect(page.locator('[data-testid="coach-workout-daily-report"]')).toBeVisible();
  329 |   await page.getByRole("button", { name: "סגירת דוח", exact: true }).click();
  330 |   await expect(page.getByRole("button", { name: "פתיחת דוח", exact: true })).toBeVisible();
  331 | 
  332 |   await page.getByRole("button", { name: "עריכה", exact: true }).first().click();
  333 |   await expect(page.getByText("עריכת תרגיל באימון", { exact: true })).toBeVisible();
  334 | 
  335 |   const thirdSetMode = page.getByRole("combobox", { name: "סוג סט 3" });
  336 |   await thirdSetMode.selectOption("drop");
  337 |   const dropRestInput = page.getByRole("textbox", { name: "דרופ סט זמן מנוחה" });
  338 |   await dropRestInput.fill("45");
  339 |   await expect(dropRestInput).toHaveValue("45");
  340 | 
  341 |   await thirdSetMode.selectOption("superset");
  342 |   const supersetSearch = page.getByRole("searchbox", {
  343 |     name: "חיפוש תרגיל בן־זוג לסופר סט",
  344 |   });
  345 |   await supersetSearch.fill("תרגיל בדיקה 2");
  346 |   await page.getByRole("option", { name: /תרגיל בדיקה 2/ }).click();
  347 |   await expect(page.getByText(/^נבחר: תרגיל בדיקה 2/)).toBeVisible();
  348 | 
  349 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  350 |   await expect(dayButtons).toHaveCount(4);
  351 | 
  352 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  353 |   await page.getByRole("button", { name: "+ מאכל" }).first().click();
  354 |   const foodSearch = page.locator('input[type="search"][id^="menu-food-search-"]').first();
  355 |   await foodSearch.fill("אורז");
  356 |   await assertKeyboardVisible(foodSearch);
  357 |   await expect(foodSearch).toHaveValue("אורז");
  358 |   const menuDraft = page.getByRole("textbox", { name: "שם הארוחה" }).first();
  359 |   await menuDraft.fill("טיוטת תפריט לפני פתיחת הדוח");
  360 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  361 | 
  362 |   await page.getByRole("tab", { name: "תוכנית אימונים" }).click();
  363 |   await dayButtons.nth(0).click();
  364 |   await expect(page.getByRole("tab", { name: "תפריט תזונה" })).toBeHidden();
  365 |   await page.getByRole("button", { name: "סגירת בניית אימון", exact: true }).click();
  366 |   await page.getByRole("tab", { name: "תפריט תזונה" }).click();
  367 |   await expect(menuDraft).toHaveValue("טיוטת תפריט לפני פתיחת הדוח");
  368 | 
  369 |   await page.goto(`/session/${WORKOUT_ID}`);
  370 |   await expect(page.getByText("התקדמות אימון", { exact: true })).toBeVisible();
  371 |   const progress = page.locator(".workout-progress-sticky");
  372 |   const firstExercise = page.locator("article").first();
  373 |   const progressBottom = await progress.boundingBox();
  374 |   const firstExerciseTop = await firstExercise.boundingBox();
  375 |   expect(progressBottom?.y + progressBottom?.height).toBeLessThanOrEqual(firstExerciseTop?.y ?? 0);
  376 | 
  377 |   const repsInput = page.locator('input[inputmode="decimal"]').first();
  378 |   await repsInput.fill("123");
  379 |   await assertKeyboardVisible(repsInput);
  380 |   await page.keyboard.press("Tab");
  381 |   await expect(repsInput).toHaveValue("123");
```