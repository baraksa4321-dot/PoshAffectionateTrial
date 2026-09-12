# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a received coach message offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1499:1

# Error details

```
Error: Channel closed
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e5]:
        - link "MY routine — דף הבית" [ref=f1e6]:
          - /url: /
          - img "MY routine" [ref=f1e7]
        - button "מעבר לתצוגת לילה" [ref=f1e8]
      - generic [ref=f1e13]:
        - button "פתיחת צ׳קליסט לאימון" [ref=f1e14]: צ׳קליסט
        - button "פתיחת שקילה שבועית" [ref=f1e18]: שקילה
      - generic [ref=f1e23]:
        - generic [ref=f1e24]:
          - paragraph [ref=f1e25]: 12.09.2026
          - heading "בוקר טוב, מתאמנת." [level=1] [ref=f1e26]
        - generic [ref=f1e28]:
          - button "הנתונים מסונכרנים" [ref=f1e29] [cursor=pointer]
          - button "פתיחת הפרופיל האישי" [ref=f1e32] [cursor=pointer]:
            - generic [ref=f1e33]: מתאמנת בדיקה
            - generic [ref=f1e34]: ios-smoke-client@example.test
          - button "בחירת פלטת צבעים" [ref=f1e36] [cursor=pointer]
          - button "התנתק" [ref=f1e38] [cursor=pointer]
  - main [ref=f1e42]:
    - generic [ref=f1e43]: הנתונים מסונכרנים
    - generic [ref=f1e44]:
      - generic [ref=f1e45]:
        - generic [ref=f1e46]:
          - generic [ref=f1e47]: הודעה מהמאמן שלך
          - generic [ref=f1e50]:
            - generic [ref=f1e51]: 25.8.2026
            - button "מחיקת הודעת המאמן" [ref=f1e52]
        - paragraph [ref=f1e56]: "\"כל הכבוד על ההתמדה השבוע\""
      - generic [ref=f1e57]:
        - generic [ref=f1e58]:
          - generic [ref=f1e59]: הודעה חשובה
          - generic [ref=f1e62]:
            - generic [ref=f1e63]: 25.8.2026
            - button "הסתרת הודעת תפוצה" [ref=f1e64]
        - paragraph [ref=f1e68]: "\"הודעת תפוצה לבדיקה\""
      - generic [ref=f1e69]:
        - generic [ref=f1e70]:
          - generic [ref=f1e71]: רצף אימונים שבועי
          - paragraph [ref=f1e76]: 0 אימונים השבוע · הוסיפי יעד שבועי כדי לראות עקביות
          - generic "מדד עקביות ללא יעד" [ref=f1e77]
        - generic [ref=f1e78]:
          - strong [ref=f1e84]: —
          - paragraph [ref=f1e85]: עקביות
      - generic [ref=f1e87]:
        - generic [ref=f1e89]:
          - paragraph [ref=f1e90]: אין אימון להיום
          - paragraph [ref=f1e91]: האימונים שלך מחכים במסך האימונים.
          - link "יצירת תכנית" [ref=f1e92]:
            - /url: /programs
        - link "תזונה יומית 0קק״ל מתוך 1900 · 1900 נשארו 0 גרם חלבון" [ref=f1e94]:
          - /url: /nutrition
          - generic [ref=f1e95]: תזונה יומית
          - paragraph [ref=f1e100]: 0קק״ל
          - paragraph [ref=f1e101]: מתוך 1900 · 1900 נשארו
          - generic [ref=f1e102]: 0 גרם חלבון
      - generic [ref=f1e106]:
        - generic [ref=f1e107]:
          - generic [ref=f1e109]:
            - heading "פעילות השבוע" [level=2] [ref=f1e110]
            - paragraph [ref=f1e111]: 0 אימונים בוצעו השבוע
          - button "פתיחת מגמות והיסטוריית תרגיל" [ref=f1e112]: מגמות
        - generic [ref=f1e115]:
          - generic [ref=f1e116]:
            - paragraph [ref=f1e118]: אימונים
            - paragraph [ref=f1e122]: "0"
          - generic [ref=f1e123]:
            - paragraph [ref=f1e125]: נפח ק״ג
            - paragraph [ref=f1e130]: "0"
          - generic [ref=f1e131]:
            - paragraph [ref=f1e133]: זמן אימון
            - paragraph [ref=f1e141]: 0m
  - navigation "ניווט ראשי":
    - generic [ref=f1e142]:
      - link "היום שלי" [ref=f1e143]:
        - /url: /
      - link "האימונים שלי" [ref=f1e148]:
        - /url: /workouts
      - link "התזונה שלי" [ref=f1e155]:
        - /url: /nutrition
```