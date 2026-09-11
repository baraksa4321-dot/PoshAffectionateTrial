# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> trainee reopens a broadcast notice offline before reconnect refresh
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:1320:1

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
      - button "פתיחת צ׳קליסט לאימון" [ref=f1e13]: צ׳קליסט
      - generic [ref=f1e17]:
        - generic [ref=f1e18]:
          - paragraph [ref=f1e19]: 11.09.2026
          - heading "בוקר טוב, מתאמנת." [level=1] [ref=f1e20]
        - generic [ref=f1e22]:
          - button "הנתונים מסונכרנים" [ref=f1e23] [cursor=pointer]
          - button "פתיחת הפרופיל האישי" [ref=f1e26] [cursor=pointer]:
            - generic [ref=f1e27]: מתאמנת בדיקה
            - generic [ref=f1e28]: ios-smoke-client@example.test
          - button "בחירת פלטת צבעים" [ref=f1e30] [cursor=pointer]
          - button "התנתק" [ref=f1e32] [cursor=pointer]
  - main [ref=f1e36]:
    - generic [ref=f1e37]: הנתונים מסונכרנים
    - generic [ref=f1e38]:
      - generic [ref=f1e39]:
        - generic [ref=f1e40]:
          - generic [ref=f1e41]: הודעה מהמאמן שלך
          - generic [ref=f1e44]:
            - generic [ref=f1e45]: 25.8.2026
            - button "מחיקת הודעת המאמן" [ref=f1e46]
        - paragraph [ref=f1e50]: "\"כל הכבוד על ההתמדה השבוע\""
      - generic [ref=f1e51]:
        - generic [ref=f1e52]:
          - generic [ref=f1e53]: הודעה חשובה
          - generic [ref=f1e56]:
            - generic [ref=f1e57]: 25.8.2026
            - button "הסתרת הודעת תפוצה" [ref=f1e58]
        - paragraph [ref=f1e62]: "\"הודעת תפוצה לבדיקה\""
      - generic [ref=f1e63]:
        - generic [ref=f1e64]:
          - generic [ref=f1e65]: רצף אימונים שבועי
          - paragraph [ref=f1e70]: 0 אימונים השבוע · הוסיפי יעד שבועי כדי לראות עקביות
          - generic "מדד עקביות ללא יעד" [ref=f1e71]
        - generic [ref=f1e72]:
          - strong [ref=f1e78]: —
          - paragraph [ref=f1e79]: עקביות
      - generic [ref=f1e81]:
        - generic [ref=f1e83]:
          - paragraph [ref=f1e84]: אין אימון להיום
          - paragraph [ref=f1e85]: האימונים שלך מחכים במסך האימונים.
          - link "יצירת תכנית" [ref=f1e86]:
            - /url: /programs
        - link "תזונה יומית 0קק״ל מתוך 1900 · 1900 נשארו 0 גרם חלבון" [ref=f1e88]:
          - /url: /nutrition
          - generic [ref=f1e89]: תזונה יומית
          - paragraph [ref=f1e94]: 0קק״ל
          - paragraph [ref=f1e95]: מתוך 1900 · 1900 נשארו
          - generic [ref=f1e96]: 0 גרם חלבון
      - generic [ref=f1e100]:
        - generic [ref=f1e101]:
          - generic [ref=f1e103]:
            - heading "פעילות השבוע" [level=2] [ref=f1e104]
            - paragraph [ref=f1e105]: 0 אימונים בוצעו השבוע
          - button "פתיחת מגמות והיסטוריית תרגיל" [ref=f1e106]: מגמות
        - generic [ref=f1e109]:
          - generic [ref=f1e110]:
            - paragraph [ref=f1e112]: אימונים
            - paragraph [ref=f1e116]: "0"
          - generic [ref=f1e117]:
            - paragraph [ref=f1e119]: נפח ק״ג
            - paragraph [ref=f1e124]: "0"
          - generic [ref=f1e125]:
            - paragraph [ref=f1e127]: זמן אימון
            - paragraph [ref=f1e135]: 0m
      - generic [ref=f1e136]:
        - generic [ref=f1e138]:
          - heading "מעקב משקל וצ'ק-אין חודשי" [level=2] [ref=f1e139]
          - paragraph [ref=f1e140]: דיווח למאמן
        - generic [ref=f1e141]:
          - generic [ref=f1e142] [cursor=pointer]:
            - generic [ref=f1e143]: שקילה שבועית
            - paragraph [ref=f1e149]:
              - text: "עדכון משקל בוקר:"
              - strong [ref=f1e150]: 64 ק"ג
          - generic [ref=f1e151]:
            - generic [ref=f1e152]: צ'ק-אין חודשי
            - paragraph [ref=f1e157]: היקפים, אחוז שומן ומסת שריר מתעדכנים על ידי המאמנת או הבעלים
      - generic [ref=f1e158]:
        - generic [ref=f1e160]:
          - heading "המדידות החודשיות שלי" [level=2] [ref=f1e161]
          - paragraph [ref=f1e162]: תצוגה בלבד — מתעדכנות על ידי המאמנת או הבעלים
        - generic [ref=f1e163]:
          - generic [ref=f1e164]:
            - generic [ref=f1e165]: מותניים
            - strong [ref=f1e166]: 74 ס״מ
          - generic [ref=f1e167]:
            - generic [ref=f1e168]: אחוז שומן
            - strong [ref=f1e169]: 24.5 %
          - generic [ref=f1e170]:
            - generic [ref=f1e171]: מסת שריר
            - strong [ref=f1e172]: 42.1 ק״ג
  - navigation "ניווט ראשי":
    - generic [ref=f1e173]:
      - link "היום שלי" [ref=f1e174]:
        - /url: /
      - link "האימונים שלי" [ref=f1e179]:
        - /url: /workouts
      - link "התזונה שלי" [ref=f1e186]:
        - /url: /nutrition
```