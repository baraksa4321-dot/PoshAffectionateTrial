import {
  Apple,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  Dumbbell,
  Footprints,
  Home,
  LayoutGrid,
  MessageSquare,
  Pencil,
  Play,
  Plus,
  Scale,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import "./Editorial.css";

type RoutineItem = { id: number; label: string; done: boolean; time?: string };

const initialRoutine: RoutineItem[] = [
  { id: 1, label: "בקבוק מים", done: true },
  { id: 2, label: "מגבת ואוזניות", done: false, time: "לפני יציאה" },
];

const editorialNav = [
  { label: "היום שלי", icon: Home },
  { label: "האימונים שלי", icon: LayoutGrid },
  { label: "התזונה שלי", icon: Apple },
];

function EditorialStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="re-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export function Editorial() {
  const [routine, setRoutine] = useState(initialRoutine);
  const [routineInput, setRoutineInput] = useState("");
  const [activeNav, setActiveNav] = useState("היום שלי");
  const [started, setStarted] = useState(false);
  const [coachVisible, setCoachVisible] = useState(true);
  const [showWeighIn, setShowWeighIn] = useState(false);
  const [weight, setWeight] = useState("65.4");
  const [toast, setToast] = useState("");

  const completed = routine.filter((item) => item.done).length;

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const addRoutineItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = routineInput.trim();
    if (!label) return;
    setRoutine((items) => [...items, { id: Date.now(), label, done: false }]);
    setRoutineInput("");
    announce("הפריט נוסף לשגרת היציאה");
  };

  const selectNav = (label: string) => {
    setActiveNav(label);
    announce(label === "היום שלי" ? "חזרת למסך היום שלי" : `${label} נבחרה`);
  };

  return (
    <div className="routine-editorial">
      <header className="re-topbar">
        <div className="re-wordmark" aria-label="My Routine">
          <span className="re-mark" aria-hidden="true">
            <Dumbbell size={15} strokeWidth={2.25} />
          </span>
          <span className="re-word">
            My Routine
            <small>הגוף שלך. הקצב שלך.</small>
          </span>
        </div>
        <button type="button" className="re-profile" onClick={() => announce("הפרופיל של נועה מסונכרן")}>
          <span className="re-sync" aria-hidden="true" />
          <span className="re-avatar">נ</span>
          נועה לוי
        </button>
      </header>

      <main className="re-page">
        <section className="re-hero">
          <div>
            <p className="re-kicker">יום חמישי · 12 ביוני 2025</p>
            <h1>היום שלי,<br /><em>בקצב שלי.</em></h1>
            <p className="re-hero-copy">עוד צעד קטן בדרך לשגרה שמרגישה שלך. לא צריך למהר כדי להתקדם.</p>
          </div>
          <div className="re-day-stamp" aria-label="יום 12">
            <span>יוני</span>
            <strong>12</strong>
            <small>יום ה׳</small>
          </div>
        </section>

        {coachVisible ? (
          <section className="re-coach" aria-label="הודעה מהמאמנת">
            <span className="re-coach-icon"><MessageSquare size={16} aria-hidden="true" /></span>
            <div className="re-coach-copy">
              <div className="re-coach-meta">
                <span>מילה מהמאמנת שלך</span>
                <time>היום, 08:14</time>
              </div>
              <p>״היום לא צריך להיות מושלם — רק להגיע ולהתחיל. אני איתך.״</p>
            </div>
            <button type="button" className="re-close" onClick={() => setCoachVisible(false)} aria-label="סגירת הודעת המאמנת">
              <X size={15} aria-hidden="true" />
            </button>
          </section>
        ) : null}

        <section className="re-consistency" aria-label="רצף אימונים שבועי">
          <div>
            <div className="re-label"><TrendingUp size={15} aria-hidden="true" /> רצף אימונים שבועי</div>
            <p>3 מתוך 4 אימונים השבוע</p>
            <div className="re-track" aria-label="מדד עקביות 75%"><span /></div>
          </div>
          <div className="re-score"><strong>75%</strong><span>עקביות</span></div>
        </section>

        <section className="re-section" aria-labelledby="movement-title">
          <div className="re-section-heading">
            <div>
              <h2 className="re-section-title" id="movement-title">היום בתנועה</h2>
              <p className="re-section-subtitle">שני דברים קטנים שמחזיקים את היום</p>
            </div>
          </div>
          <div className="re-movement">
            <article className="re-workout">
              <div className="re-workout-top"><span>אימון יומי</span><Dumbbell size={17} aria-hidden="true" /></div>
              <h2>פלג גוף<br />תחתון</h2>
              <p>6 תרגילים <i aria-hidden="true">·</i> כ־42 דק׳</p>
              <button
                type="button"
                className="re-primary"
                onClick={() => {
                  setStarted((value) => !value);
                  announce(started ? "האימון הושהה" : "האימון התחיל, בהצלחה");
                }}
              >
                <Play size={13} fill="currentColor" aria-hidden="true" />
                {started ? "האימון התחיל" : "התחלת אימון"}
              </button>
            </article>

            <button type="button" className="re-nutrition" onClick={() => selectNav("התזונה שלי")}>
              <div className="re-nutrition-top"><span>תזונה יומית</span><Apple size={17} aria-hidden="true" /></div>
              <strong>1,286 <small>קק״ל</small></strong>
              <p>מתוך 2,000<br />714 נשארו</p>
              <span className="re-protein">88 גרם חלבון <ChevronLeft size={14} aria-hidden="true" /></span>
            </button>
          </div>
        </section>

        <section className="re-section" aria-labelledby="routine-title">
          <div className="re-section-heading">
            <div>
              <h2 className="re-section-title" id="routine-title">שגרת היציאה</h2>
              <p className="re-section-subtitle">דברים שחשוב לזכור לפני שיוצאים לאימון</p>
            </div>
            <button type="button" className="re-link-button" onClick={() => { setRoutine([]); announce("השגרה נוקתה"); }}>
              נקה <X size={13} aria-hidden="true" />
            </button>
          </div>
          <div className="re-routine-card">
            <form className="re-add-row" onSubmit={addRoutineItem}>
              <input value={routineInput} onChange={(event) => setRoutineInput(event.target.value)} placeholder="למשל: בקבוק מים" aria-label="פריט חדש בשגרת היציאה" />
              <button type="submit" disabled={!routineInput.trim()} aria-label="הוספת פריט"><Plus size={16} aria-hidden="true" /></button>
            </form>
            <div className="re-routine-list">
              {routine.map((item) => (
                <label className="re-routine-item" key={item.id}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => setRoutine((items) => items.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))}
                  />
                  <span className="re-check"><Check size={12} aria-hidden="true" /></span>
                  <span className={item.done ? "re-done" : ""}>{item.label}</span>
                  {item.time ? <small>{item.time}</small> : null}
                </label>
              ))}
              {routine.length === 0 ? <p className="re-empty">עדיין אין פריטים. הוסיפי את הראשון.</p> : null}
            </div>
            <div className="re-routine-footer">
              <span>הקצב שלך, הסדר שלך</span>
              <span className="re-count">{completed} מתוך {routine.length} הושלמו</span>
            </div>
          </div>
        </section>

        <section className="re-section" aria-labelledby="checkin-title">
          <div className="re-section-heading">
            <div>
              <h2 className="re-section-title" id="checkin-title">צ׳ק־אין חודשי</h2>
              <p className="re-section-subtitle">דיווח קטן שעוזר לראות את התמונה</p>
            </div>
          </div>
          <div className="re-checkin-grid">
            <button type="button" className="re-checkin" onClick={() => setShowWeighIn(true)}>
              <span className="re-checkin-icon"><Scale size={17} aria-hidden="true" /></span>
              <span className="re-checkin-label">שקילה שבועית</span>
              <strong>{weight} ק״ג</strong>
              <span>עדכון משקל בוקר <ChevronLeft size={13} aria-hidden="true" /></span>
            </button>
            <button type="button" className="re-checkin measure" onClick={() => announce("המדידות מתעדכנות על ידי המאמנת")}>
              <span className="re-checkin-icon"><Award size={17} aria-hidden="true" /></span>
              <span className="re-checkin-label">מדידות חודשיות</span>
              <strong>3 נתונים</strong>
              <span>היקפים ומסת שריר <ChevronLeft size={13} aria-hidden="true" /></span>
            </button>
          </div>
        </section>

        <section className="re-section" aria-labelledby="activity-title">
          <div className="re-section-heading">
            <div>
              <h2 className="re-section-title" id="activity-title">פעילות השבוע</h2>
              <p className="re-section-subtitle">3 אימונים בוצעו השבוע</p>
            </div>
          </div>
          <div className="re-stats-grid">
            <EditorialStat label="אימונים" value="3" note="מתוך 4 מתוכננים" />
            <EditorialStat label="נפח ק״ג" value="2.4k" note="עלייה קטנה השבוע" />
            <EditorialStat label="זמן אימון" value="118m" note="תנועה מצטברת" />
          </div>
        </section>

        <section className="re-section" aria-labelledby="measurements-title">
          <div className="re-section-heading">
            <div>
              <h2 className="re-section-title" id="measurements-title">המדידות החודשיות שלי</h2>
              <p className="re-section-subtitle">תצוגה בלבד · מתעדכנות על ידי המאמנת</p>
            </div>
          </div>
          <div className="re-measure-grid">
            <div className="re-measure"><span>מותניים</span><strong>72 ס״מ</strong></div>
            <div className="re-measure"><span>אחוז שומן</span><strong>24.8%</strong></div>
            <div className="re-measure"><span>מסת שריר</span><strong>42.1 ק״ג</strong></div>
          </div>
        </section>

        <section className="re-section" aria-labelledby="cardio-title">
          <div className="re-section-heading">
            <div>
              <h2 className="re-section-title" id="cardio-title">אימון אירובי</h2>
              <p className="re-section-subtitle">74 דקות השבוע · כ־412 קל׳</p>
            </div>
            <button type="button" className="re-add-button" onClick={() => announce("טופס אירובי מוכן להוספה")}><Plus size={13} aria-hidden="true" /> הוספה</button>
          </div>
          <div className="re-cardio">
            <span className="re-cardio-icon"><Footprints size={19} aria-hidden="true" /></span>
            <div className="re-cardio-copy">
              <strong>הליכה מהירה</strong>
              <p>32 דקות · כ־176 קל׳ · היום</p>
            </div>
            <div className="re-cardio-actions">
              <button type="button" onClick={() => announce("עריכת הליכה מהירה")} aria-label="עריכת הליכה מהירה"><Pencil size={14} /></button>
              <button type="button" onClick={() => announce("האימון נמחק מהמכשיר")} aria-label="מחיקת הליכה מהירה"><Trash2 size={14} /></button>
            </div>
          </div>
        </section>
      </main>

      <nav className="re-bottom-nav" aria-label="ניווט ראשי">
        {editorialNav.map(({ label, icon: Icon }) => (
          <button key={label} type="button" aria-current={activeNav === label ? "page" : undefined} onClick={() => selectNav(label)}>
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      {toast ? <div className="re-toast" role="status" aria-live="polite"><CheckCircle2 size={15} aria-hidden="true" />{toast}</div> : null}

      {showWeighIn ? (
        <div className="re-dialog-backdrop" role="presentation" onClick={() => setShowWeighIn(false)}>
          <section className="re-dialog" role="dialog" aria-modal="true" aria-labelledby="re-weight-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="re-dialog-head">
              <h2 id="re-weight-dialog-title"><Scale size={18} aria-hidden="true" /> שקילה שבועית בבוקר</h2>
              <button type="button" className="re-close" onClick={() => setShowWeighIn(false)} aria-label="סגירת שקילה שבועית"><X size={17} /></button>
            </div>
            <label>
              משקל נוכחי (ק״ג)
              <input type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} />
            </label>
            <button type="button" className="re-dialog-save" onClick={() => { setShowWeighIn(false); announce("השקילה השבועית נשמרה בהצלחה"); }}>
              שמור שקילה שבועית
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
