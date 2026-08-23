import {
  Apple,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleUserRound,
  Dumbbell,
  Footprints,
  Home,
  LayoutGrid,
  MessageCircle,
  Plus,
  Scale,
  Timer,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import "./_group.css";

type RoutineItem = { id: number; label: string; done: boolean };

const startingItems: RoutineItem[] = [
  { id: 1, label: "בקבוק מים", done: true },
  { id: 2, label: "מגבת ואוזניות", done: false },
];

const brandNav = [
  { label: "היום", icon: Home },
  { label: "אימונים", icon: LayoutGrid },
  { label: "תזונה", icon: Apple },
];

function BrandMetric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return (
    <div className={`brand-metric ${tone}`}>
      <span>{label}</span>
      <strong className="gt-display gt-tabular">{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export function BrandDirection() {
  const [routine, setRoutine] = useState(startingItems);
  const [newItem, setNewItem] = useState("");
  const [activeNav, setActiveNav] = useState("היום");
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [showCoachNote, setShowCoachNote] = useState(true);
  const [weight, setWeight] = useState("65.4");
  const [notice, setNotice] = useState("");

  const checkedCount = routine.filter((item) => item.done).length;
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const addRoutineItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = newItem.trim();
    if (!label) return;
    setRoutine((items) => [...items, { id: Date.now(), label, done: false }]);
    setNewItem("");
    notify("נוסף לרוטינה של היום");
  };

  return (
    <div className="gymtrack-mockup brand-screen" dir="rtl">
      <header className="brand-topbar">
        <div className="brand-wordmark" aria-label="My Routine">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-word">my <b>routine</b></span>
        </div>
        <button type="button" className="brand-profile" onClick={() => notify("הפרופיל שלך מסונכרן")} aria-label="פתיחת פרופיל">
          <CircleUserRound size={18} aria-hidden="true" />
          <span>נועה</span>
        </button>
      </header>

      <main className="gt-page brand-page">
        <div className="brand-welcome">
          <div>
            <p className="brand-date">חמישי · 12.06.25</p>
            <h1 className="gt-display">בוקר טוב, נועה<span>.</span></h1>
            <p>היום שלך לא צריך יותר מקצב אחד טוב להתחיל ממנו.</p>
          </div>
          <div className="brand-day-badge" aria-label="יום 4 מתוך 7">
            <span>יום</span>
            <strong className="gt-tabular">04</strong>
            <small>מתוך 07</small>
          </div>
        </div>

        {showCoachNote ? (
          <section className="brand-coach-note" aria-label="הודעה מהמאמנת">
            <div className="brand-note-icon"><MessageCircle size={17} aria-hidden="true" /></div>
            <div>
              <div className="brand-note-meta"><span>מילה מהמאמנת</span><time>08:14</time></div>
              <p>״היום לא צריך להיות מושלם — רק להגיע ולהתחיל. אני איתך.״</p>
            </div>
            <button type="button" onClick={() => setShowCoachNote(false)} aria-label="סגירת הודעת המאמנת"><X size={15} /></button>
          </section>
        ) : null}

        <section className="brand-progress-card" aria-label="רצף שבועי">
          <div className="brand-progress-ring" aria-label="75 אחוז עקביות">
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle className="brand-ring-track" cx="22" cy="22" r="18" />
              <circle className="brand-ring-value" cx="22" cy="22" r="18" />
            </svg>
            <span><strong>75</strong><small>%</small></span>
          </div>
          <div className="brand-progress-copy">
            <span className="brand-eyebrow"><TrendingUp size={13} aria-hidden="true" /> הקצב שלך השבוע</span>
            <h2>3 מתוך 4 אימונים</h2>
            <p>את ממש קרובה ליעד השבועי. עוד אימון אחד והוא שלך.</p>
          </div>
          <div className="brand-progress-days" aria-label="סטטוס הימים השבוע">
            {["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((day, index) => (
              <span key={day} className={index < 3 ? "is-complete" : index === 4 ? "is-today" : ""}>{index < 3 ? "✓" : day}</span>
            ))}
          </div>
        </section>

        <section className="brand-section brand-focus-section">
          <div className="brand-section-head">
            <div>
              <span className="brand-eyebrow">הפוקוס של היום</span>
              <h2>תנועה ואנרגיה</h2>
            </div>
            <button type="button" className="brand-text-button" onClick={() => notify("כל האימונים שלך מחכים כאן")}>לכל האימונים <ArrowLeft size={14} /></button>
          </div>

          <article className="brand-workout-card">
            <div className="brand-workout-rail" aria-hidden="true">
              <span>MY ROUTINE</span>
              <b>01</b>
            </div>
            <div className="brand-workout-content">
              <div className="brand-workout-kicker"><span>האימון הבא</span><Timer size={14} aria-hidden="true" /></div>
              <h3 className="gt-display">פלג גוף תחתון</h3>
              <p>6 תרגילים <i /> כ־42 דקות <i /> כוח</p>
              <button
                type="button"
                className="brand-primary-button"
                aria-pressed={isWorkoutActive}
                onClick={() => {
                  setIsWorkoutActive((value) => !value);
                  notify(isWorkoutActive ? "האימון הושהה" : "האימון התחיל, בקצב שלך");
                }}
              >
                <span className="brand-play-mark">{isWorkoutActive ? "Ⅱ" : "▶"}</span>
                {isWorkoutActive ? "האימון התחיל" : "מתחילים לזוז"}
              </button>
            </div>
          </article>

          <button type="button" className="brand-nutrition-card" onClick={() => { setActiveNav("תזונה"); notify("נפתח המעקב היומי שלך"); }}>
            <div className="brand-nutrition-icon"><Apple size={20} aria-hidden="true" /></div>
            <div className="brand-nutrition-copy">
              <div className="brand-card-title"><span>תזונה יומית</span><ChevronLeft size={15} aria-hidden="true" /></div>
              <strong className="gt-display gt-tabular">1,286 <small>קק״ל</small></strong>
              <p>88 גרם חלבון <i /> 714 נשארו</p>
              <div className="brand-nutrition-track"><span /></div>
            </div>
            <span className="brand-nutrition-percent gt-tabular">64%</span>
          </button>
        </section>

        <section className="brand-section brand-routine-section">
          <div className="brand-section-head">
            <div>
              <span className="brand-eyebrow">לפני שיוצאים</span>
              <h2>הרוטינה הקטנה שלי</h2>
            </div>
            <span className="brand-complete-count">{checkedCount}/{routine.length || 0}</span>
          </div>
          <div className="brand-routine-card">
            <form className="brand-add-row" onSubmit={addRoutineItem}>
              <input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="להוסיף משהו קטן..." aria-label="הוספת פריט לרוטינה" />
              <button type="submit" disabled={!newItem.trim()} aria-label="הוספת פריט"><Plus size={17} /></button>
            </form>
            <div className="brand-routine-list">
              {routine.map((item) => (
                <label key={item.id} className={`brand-routine-item ${item.done ? "is-done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => setRoutine((items) => items.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))}
                  />
                  <span className="brand-check"><Check size={12} aria-hidden="true" /></span>
                  <span>{item.label}</span>
                  {item.done ? <small>בוצע</small> : null}
                </label>
              ))}
              {routine.length === 0 ? <p className="brand-empty">הוסיפי את הדבר הראשון שיעזור לך לצאת רגועה.</p> : null}
            </div>
            <div className="brand-routine-footer">
              <span><i className="brand-footer-rule" aria-hidden="true" /> הרגלים קטנים, ימים יציבים</span>
              <button type="button" onClick={() => { setRoutine([]); notify("הרוטינה אופסה"); }}>ניקוי</button>
            </div>
          </div>
        </section>

        <section className="brand-section brand-checkin-section">
          <div className="brand-section-head">
            <div>
              <span className="brand-eyebrow">לשים לב להתקדמות</span>
              <h2>צ׳ק־אין קצר</h2>
            </div>
            <span className="brand-muted-label">דיווח למאמנת</span>
          </div>
          <div className="brand-checkin-grid">
            <button type="button" className="brand-checkin-card brand-weight-card" onClick={() => setShowWeightDialog(true)}>
              <span className="brand-checkin-icon"><Scale size={18} aria-hidden="true" /></span>
              <span className="brand-checkin-label">שקילה שבועית</span>
              <strong className="gt-display gt-tabular">{weight} <small>ק״ג</small></strong>
              <span className="brand-link-label">עדכון משקל בוקר <ChevronLeft size={13} /></span>
            </button>
            <button type="button" className="brand-checkin-card brand-measure-card" onClick={() => notify("המדידות מתעדכנות על ידי המאמנת")}>
              <span className="brand-checkin-icon"><Footprints size={18} aria-hidden="true" /></span>
              <span className="brand-checkin-label">צ׳ק־אין חודשי</span>
              <strong className="gt-display">המדידות שלך</strong>
              <span className="brand-link-label">תצוגה בלבד <ChevronLeft size={13} /></span>
            </button>
          </div>
        </section>

        <section className="brand-section brand-insights">
          <div className="brand-section-head">
            <div>
              <span className="brand-eyebrow">המספרים שמספרים סיפור</span>
              <h2>השבוע שלך בתנועה</h2>
            </div>
            <button type="button" className="brand-round-button" onClick={() => notify("היסטוריית הפעילות תיפתח בקרוב")} aria-label="פתיחת היסטוריית פעילות"><ArrowLeft size={16} /></button>
          </div>
          <div className="brand-metrics-grid">
            <BrandMetric label="אימונים" value="3" note="השבוע" tone="metric-coral" />
            <BrandMetric label="נפח" value="2.4k" note="ק״ג" tone="metric-lilac" />
            <BrandMetric label="זמן תנועה" value="118" note="דקות" tone="metric-sage" />
          </div>
          <div className="brand-last-card">
            <div className="brand-last-icon"><Footprints size={17} aria-hidden="true" /></div>
            <div><strong>הליכה מהירה</strong><span>32 דקות · היום</span></div>
            <span className="brand-last-calories">176 <small>קל׳</small></span>
          </div>
        </section>
      </main>

      <nav className="gt-bottom-nav brand-bottom-nav" aria-label="ניווט ראשי">
        {brandNav.map(({ label, icon: Icon }) => (
          <button key={label} type="button" aria-current={activeNav === label ? "page" : undefined} onClick={() => { setActiveNav(label); notify(label === "היום" ? "חזרת למסך היום" : `${label} נבחר`); }}>
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      {notice ? <div className="gt-toast brand-toast" role="status" aria-live="polite"><CheckCircle2 size={15} aria-hidden="true" /> {notice}</div> : null}

      {showWeightDialog ? (
        <div className="brand-dialog-backdrop" role="presentation" onClick={() => setShowWeightDialog(false)}>
          <section className="brand-dialog" role="dialog" aria-modal="true" aria-labelledby="brand-weight-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="brand-dialog-close" onClick={() => setShowWeightDialog(false)} aria-label="סגירת שקילה"><X size={16} /></button>
            <div className="brand-dialog-icon"><Scale size={19} /></div>
            <span className="brand-eyebrow">צ׳ק־אין שבועי</span>
            <h2 id="brand-weight-title" className="gt-display">איך הגוף מרגיש הבוקר?</h2>
            <p>המספר הוא רק נקודת מידע קטנה בדרך.</p>
            <label>משקל נוכחי (ק״ג)<input type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
            <button type="button" className="brand-primary-button brand-dialog-save" onClick={() => { setShowWeightDialog(false); notify("השקילה השבועית נשמרה"); }}>שמירה והמשך <ArrowLeft size={15} /></button>
          </section>
        </div>
      ) : null}
    </div>
  );
}