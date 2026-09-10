# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated-ios.pw.mjs >> authenticated iPhone coach workspace and active workout remain usable
- Location: gymtrack-working/e2e/authenticated-ios.pw.mjs:718:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last()
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('[id^="coach-menu-meal-"]').first().getByText(/אורז ·/).last()
  - Target page, context or browser has been closed

```

```yaml
- banner:
  - link "MY routine — דף הבית":
    - /url: /
    - img "MY routine"
  - button "מעבר לתצוגת לילה"
  - paragraph: בניית תוכניות ותפריטים
  - heading "עריכה" [level=1]
  - button "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
- main:
  - text: אין חיבור לאינטרנט — השינויים נשמרים במכשיר
  - heading "מתאמנת בדיקה" [level=3]
  - button "פתיחת פרופיל המשתמש": פרופיל
  - button "סגירת תכנית המתאמן"
  - navigation "ניווט בסביבת העריכה":
    - tab "תוכנית אימונים"
    - tab "תפריט תזונה" [selected]
  - heading "בניית תפריט למתאמן" [level=4]
  - paragraph: התפריט נשמר כתבנית קבועה ונפרד מהיומן בפועל. תאריך הבדיקה מציג רק את מה שנרשם בפועל.
  - textbox "תאריך להצגת רישום בפועל": 2026-08-26
  - text: חלבון 6.5 ג׳ פחמימות 72 ג׳ שומן 0.3 ג׳ קלוריות 330 קל׳
  - textbox "שם הארוחה": ארוחת בדיקה
  - button "+ מאכל"
  - paragraph: אורז
  - paragraph: 1 1 מנה
  - button "הסר אורז"
  - text: חלבון
  - strong: 4 ג׳
  - text: פחמימות
  - strong: 44 ג׳
  - text: שומן
  - strong: 0 ג׳
  - text: קלוריות
  - strong: 200 קל׳
  - paragraph: אורז לבן מבושל
  - paragraph: 100 גרם
  - button "הסר אורז לבן מבושל"
  - text: חלבון
  - strong: 0 ג׳
  - text: פחמימות
  - strong: 0.3 ג׳
  - text: שומן
  - strong: 0 ג׳
  - text: קלוריות
  - strong: 1.3 קל׳
  - text: מה שהמתאמן אכל בפועל 26.8.2026 אורז ×1
  - button "+ הוסיפי ארוחה"
  - button "שמרי תפריט"
  - heading "יעד קלורי ותזונה למתאמן" [level=3]
  - button "ערוך יעדים"
  - button "הצגת קלוריות למתאמן מוצג במסכי התזונה והמאזן" [pressed]
  - button "מחשבון BMR"
  - text: קלוריות 1900 kcal ימי מעקב 1 ימים
- navigation "ניווט ראשי":
  - link:
    - /url: /coach
  - link "מתאמנים":
    - /url: /coach/clients
  - link "מעקב":
    - /url: /coach/tracking
  - link "תרגילים":
    - /url: /exercises
```

```
Error: write EPIPE
```