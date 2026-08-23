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
import "./_group.css";

type ChecklistItem = { id: number; label: string; done: boolean };

const initialChecklist: ChecklistItem[] = [
  { id: 1, label: "בקבוק מים", done: true },
  { id: 2, label: "מגבת ואוזניות", done: false },
];

const navItems = [
  { label: "היום שלי", icon: Home },
  { label: "האימונים שלי", icon: LayoutGrid },
  { label: "התזונה שלי", icon: Apple },
];

function CurrentStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Dumbbell;
  tone: "rose" | "sage" | "cream";
}) {
  return (
    <div className="gt-card current-stat" data-tone={tone}>
      <Icon size={16} aria-hidden="true" />
      <strong className="gt-display gt-tabular">{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function Current() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [checklistInput, setChecklistInput] = useState("");
  const [activeNav, setActiveNav] = useState("היום שלי");
  const [started, setStarted] = useState(false);
  const [showWeighIn, setShowWeighIn] = useState(false);
  const [weight, setWeight] = useState("65.4");
  const [toast, setToast] = useState("");

  const completed = checklist.filter((item) => item.done).length;

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const addChecklistItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = checklistInput.trim();
    if (!label) return;
    setChecklist((items) => [...items, { id: Date.now(), label, done: false }]);
    setChecklistInput("");
    announce("הפריט נוסף לצ׳ק־ליסט");
  };

  return (
    <div className="gymtrack-mockup current-screen" dir="rtl">
      <header className="gt-topbar">
        <div className="gt-logo" aria-label="My Routine">
          <span className="gt-logo-mark" aria-hidden="true">
            <Dumbbell size={16} strokeWidth={2.5} />
          </span>
          <span className="gt-logo-word">
            My Routine
            <small>הגוף שלך. הקצב שלך.</small>
          </span>
        </div>
        <div className="gt-user-pill" aria-label="החשבון של נועה, מסונכרן">
          <span className="current-sync-dot" aria-hidden="true" />
          <span className="gt-avatar">נ</span>
          <span className="current-user-name">נועה לוי</span>
        </div>
      </header>

      <main className="gt-page current-page">
        <div className="current-heading">
          <div>
            <p className="gt-overline">יום חמישי · 12 ביוני 2025</p>
            <h1 className="gt-page-title">היום שלי</h1>
            <p className="gt-page-subtitle">עוד צעד קטן בדרך לשגרה שמרגישה שלך.</p>
          </div>
        </div>

        <section className="gt-card current-coach" aria-label="הודעה מהמאמנת">
          <div className="current-coach-head">
            <span>
              <MessageSquare size={15} aria-hidden="true" />
              הודעה מהמאמנת שלך
            </span>
            <time>היום, 08:14</time>
          </div>
          <p>״היום לא צריך להיות מושלם — רק להגיע ולהתחיל. אני איתך.״</p>
        </section>

        <section className="gt-card current-consistency" aria-label="רצף אימונים שבועי">
          <div className="current-consistency-copy">
            <div className="current-card-label">
              <TrendingUp size={16} aria-hidden="true" />
              <strong>רצף אימונים שבועי</strong>
            </div>
            <p>3 מתוך 4 אימונים השבוע</p>
            <div className="gt-progress-track" aria-label="מדד עקביות 75%">
              <div className="gt-progress-fill" style={{ width: "75%" }} />
            </div>
          </div>
          <div className="current-consistency-score">
            <strong className="gt-display gt-tabular">75%</strong>
            <span>עקביות</span>
          </div>
        </section>

        <section className="current-daily-grid" aria-label="היום בתנועה ובתזונה">
          <article className="current-workout">
            <div className="current-tile-top">
              <span>אימון יומי</span>
              <Dumbbell size={17} aria-hidden="true" />
            </div>
            <h2 className="gt-display">פלג גוף תחתון</h2>
            <p>6 תרגילים · כ־42 דק׳</p>
            <button
              type="button"
              className="current-start-button"
              onClick={() => {
                setStarted((value) => !value);
                announce(started ? "האימון הושהה" : "האימון התחיל, בהצלחה");
              }}
            >
              <Play size={14} fill="currentColor" aria-hidden="true" />
              {started ? "האימון התחיל" : "התחלת אימון"}
            </button>
          </article>

          <button
            type="button"
            className="current-nutrition"
            onClick={() => {
              setActiveNav("התזונה שלי");
              announce("תזונה יומית נבחרה");
            }}
          >
            <div className="current-tile-top">
              <span>תזונה יומית</span>
              <Apple size={17} aria-hidden="true" />
            </div>
            <strong className="gt-display gt-tabular">1,286 <small>קק״ל</small></strong>
            <p>מתוך 2,000 · 714 נשארו</p>
            <span className="current-protein-link">
              88 גרם חלבון
              <ChevronLeft size={14} aria-hidden="true" />
            </span>
          </button>
        </section>

        <section className="gt-card current-checklist" aria-labelledby="current-checklist-title">
          <div className="current-section-heading">
            <div>
              <h2 id="current-checklist-title">צ׳ק־ליסט לפני יציאה מהבית</h2>
              <p>דברים שחשוב לזכור לפני שיוצאים לאימון.</p>
            </div>
            <button
              type="button"
              className="current-icon-button"
              onClick={() => {
                setChecklist([]);
                announce("הצ׳ק־ליסט נוקה");
              }}
              aria-label="מחיקת הצ׳ק־ליסט"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
          <form className="current-add-form" onSubmit={addChecklistItem}>
            <input
              value={checklistInput}
              onChange={(event) => setChecklistInput(event.target.value)}
              placeholder="למשל: בקבוק מים"
              aria-label="פריט חדש בצ׳ק־ליסט"
            />
            <button type="submit" disabled={!checklistInput.trim()}>
              <Plus size={14} aria-hidden="true" />
              הוספה
            </button>
          </form>
          <div className="current-checklist-items">
            {checklist.map((item) => (
              <label key={item.id} className="current-check-item">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    setChecklist((items) =>
                      items.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)),
                    )
                  }
                />
                <span className="current-check-box">
                  <Check size={12} aria-hidden="true" />
                </span>
                <span className={item.done ? "is-done" : ""}>{item.label}</span>
              </label>
            ))}
            {checklist.length === 0 ? <p className="current-empty">עדיין אין פריטים. הוסיפי את הראשון.</p> : null}
          </div>
          <div className="current-check-count">{completed} מתוך {checklist.length || 0} הושלמו</div>
        </section>

        <section className="gt-section">
          <div className="gt-section-heading">
            <div>
              <h2>מעקב משקל וצ׳ק־אין חודשי</h2>
              <p>דיווח למאמנת</p>
            </div>
          </div>
          <div className="current-checkin-grid">
            <button type="button" className="gt-card current-checkin-card" onClick={() => setShowWeighIn(true)}>
              <Scale size={17} aria-hidden="true" />
              <strong>שקילה שבועית</strong>
              <span>עדכון משקל בוקר: <b>{weight} ק״ג</b></span>
            </button>
            <button type="button" className="gt-card current-checkin-card current-monthly" onClick={() => announce("המדידות מתעדכנות על ידי המאמנת")}>
              <Award size={17} aria-hidden="true" />
              <strong>צ׳ק־אין חודשי</strong>
              <span>היקפים, אחוז שומן ומסת שריר</span>
            </button>
          </div>
        </section>

        <section className="gt-section">
          <div className="gt-section-heading">
            <div>
              <h2>פעילות השבוע</h2>
              <p>3 אימונים בוצעו השבוע</p>
            </div>
          </div>
          <div className="current-stats-grid">
            <CurrentStat label="אימונים" value="3" icon={Footprints} tone="rose" />
            <CurrentStat label="נפח ק״ג" value="2.4k" icon={TrendingUp} tone="sage" />
            <CurrentStat label="זמן אימון" value="118m" icon={Dumbbell} tone="cream" />
          </div>
        </section>

        <section className="gt-section current-measurements">
          <div className="gt-section-heading">
            <div>
              <h2>המדידות החודשיות שלי</h2>
              <p>תצוגה בלבד · מתעדכנות על ידי המאמנת</p>
            </div>
          </div>
          <div className="current-measurement-grid">
            <div className="gt-card"><span>מותניים</span><strong>72 ס״מ</strong></div>
            <div className="gt-card"><span>אחוז שומן</span><strong>24.8%</strong></div>
            <div className="gt-card"><span>מסת שריר</span><strong>42.1 ק״ג</strong></div>
          </div>
        </section>

        <section className="gt-section">
          <div className="gt-section-heading">
            <div>
              <h2>אימון אירובי</h2>
              <p>74 דקות השבוע · כ־412 קל׳</p>
            </div>
            <button type="button" className="current-add-pill" onClick={() => announce("טופס אירובי מוכן להוספה")}>
              <Plus size={14} aria-hidden="true" /> הוספה
            </button>
          </div>
          <div className="gt-card current-cardio-row">
            <span className="current-cardio-icon"><Footprints size={19} aria-hidden="true" /></span>
            <div>
              <strong>הליכה מהירה</strong>
              <p>32 דקות · כ־176 קל׳ · היום</p>
            </div>
            <button type="button" onClick={() => announce("עריכת הליכה מהירה")} aria-label="עריכת הליכה מהירה"><Pencil size={14} /></button>
            <button type="button" onClick={() => announce("האימון נמחק מהמכשיר")} aria-label="מחיקת הליכה מהירה"><Trash2 size={14} /></button>
          </div>
        </section>
      </main>

      <nav className="gt-bottom-nav" aria-label="ניווט ראשי">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            aria-current={activeNav === label ? "page" : undefined}
            onClick={() => {
              setActiveNav(label);
              announce(label === "היום שלי" ? "חזרת למסך היום שלי" : `${label} נבחרה`);
            }}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      {toast ? <div className="gt-toast" role="status" aria-live="polite"><CheckCircle2 size={15} aria-hidden="true" /> {toast}</div> : null}

      {showWeighIn ? (
        <div className="current-dialog-backdrop" role="presentation" onClick={() => setShowWeighIn(false)}>
          <section className="current-dialog" role="dialog" aria-modal="true" aria-labelledby="weight-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="current-dialog-top">
              <h2 id="weight-dialog-title"><Scale size={18} aria-hidden="true" /> שקילה שבועית בבוקר</h2>
              <button type="button" onClick={() => setShowWeighIn(false)} aria-label="סגירת שקילה שבועית"><X size={17} /></button>
            </div>
            <label>
              משקל נוכחי (ק״ג)
              <input type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} />
            </label>
            <button type="button" className="current-dialog-save" onClick={() => { setShowWeighIn(false); announce("השקילה השבועית נשמרה בהצלחה"); }}>
              שמור שקילה שבועית
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}