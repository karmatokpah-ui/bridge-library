import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarClock, ClipboardCheck, Eye, FileText,
  GraduationCap, House, Lightbulb, LineChart, ListChecks, LogOut, NotebookText, Send, Settings,
  Timer, TimerReset, User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import heroImg from "@/assets/home-hero-girl.jpg";

type Option = { id: string; text: string };
type Question = { id: string; prompt: string; options: Option[]; explanation: string | null; exam_type: string | null; correct_option?: string };
type Review = { question_id: string; is_correct: boolean; correct_option: string; explanation: string | null };
type Result = { score: number; total_questions: number };
type Subject = { id: number | string; name: string };

export type PracticeViewProps = {
  subjects: Subject[];
  subjectId: string;
  onSubject: (id: string) => void;
  questions: Question[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, optionId: string) => void;
  result: Result | null;
  review: Review[];
  secondsLeft: number;
  loading: boolean;
  examStarted: boolean;
  isDemoExam: boolean;
  submitting: boolean;
  errorMessage: string;
  authRequired: boolean;
  onStart: () => void;
  onSubmit: () => void;
  onReset: () => void;
};

type Status = "current" | "correct" | "incorrect" | "answered" | "empty";

export function PracticeView(p: PracticeViewProps) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => { setCurrent(0); }, [p.questions]);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const meta = u.user_metadata as Record<string, unknown>;
      const name = typeof meta["full_name"] === "string" ? meta["full_name"] : u.email?.split("@")[0];
      setProfileName(name ?? null);
    });
  }, []);

  const subjectName = p.subjects.find((s) => String(s.id) === p.subjectId)?.name ?? "Practice";
  const reviewById = useMemo(() => new Map(p.review.map((r) => [r.question_id, r])), [p.review]);
  const total = p.questions.length;
  const answered = p.questions.filter((q) => p.answers[q.id]).length;
  const correct = p.review.filter((r) => r.is_correct && p.answers[r.question_id]).length;
  const incorrect = p.review.filter((r) => !r.is_correct && p.answers[r.question_id]).length;
  const progress = total ? Math.round((answered / total) * 100) : 0;
  const inTest = (p.examStarted || p.result) && total > 0;
  const q = p.questions[current];
  const mm = String(Math.floor(p.secondsLeft / 60)).padStart(2, "0");
  const ss = String(p.secondsLeft % 60).padStart(2, "0");

  function statusOf(i: number): Status {
    const question = p.questions[i];
    if (!question) return "empty";
    if (i === current) return "current";
    if (!p.answers[question.id]) return "empty";
    const r = reviewById.get(question.id);
    if (r) return r.is_correct ? "correct" : "incorrect";
    return "answered";
  }

  function reviewAnswers() {
    const firstUnanswered = p.questions.findIndex((x) => !p.answers[x.id]);
    setCurrent(firstUnanswered >= 0 && !p.result ? firstUnanswered : 0);
    document.getElementById("pt-question")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function logout() {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  }

  const r = q ? reviewById.get(q.id) : undefined;
  const selected = q ? p.answers[q.id] : undefined;
  const correctId = q && r ? q.options.find((o) => o.text === r.correct_option || o.id === r.correct_option)?.id : undefined;
  const ring = 2 * Math.PI * 34;

  return (
    <main className="bl-pt">
      <aside className="bl-pt-side" aria-label="Student menu">
        <div className="bl-pt-user">
          <span className="bl-pt-avatar"><User size={22} /></span>
          <div><strong>{profileName ?? "Guest"}</strong><span>Student</span></div>
        </div>
        <nav>
          <Link to="/dashboard"><House size={18} />Dashboard</Link>
          <Link to="/courses"><BookOpen size={18} />My Courses</Link>
          <Link to="/practice" className="is-active"><ClipboardCheck size={18} />Quizzes &amp; Practice</Link>
          <Link to="/dashboard"><BarChart3 size={18} />My Progress</Link>
          <Link to="/wassce"><GraduationCap size={18} />WASSCE</Link>
          <hr />
          <Link to="/settings"><Settings size={18} />Settings</Link>
          {profileName
            ? <button type="button" onClick={() => void logout()}><LogOut size={18} />Logout</button>
            : <Link to="/" search={{ auth: "login" } as never}><LogOut size={18} />Login</Link>}
        </nav>
        <div className="bl-pt-side-card">
          <strong>Learn Today, Build Tomorrow.</strong>
          <span>Better education. A brighter Liberia.</span>
        </div>
      </aside>

      <div className="bl-pt-main">
        <section className="bl-pt-hero">
          <div className="bl-pt-hero-text">
            <span className="bl-pt-chip"><GraduationCap size={16} />WASSCE Preparation</span>
            <h1>{subjectName === "Practice" ? "Practice Test" : `${subjectName} Practice Test`}</h1>
            <p>Test your knowledge and build confidence for your WASSCE exams. Choose a subject, answer past-style questions and learn from explanations.</p>
          </div>
          <img src={heroImg} alt="Student writing an exam" />
        </section>
        <div className="bl-pt-facts">
          <div><BookOpen size={20} /><span>Subject<strong>{subjectName === "Practice" ? "Choose below" : subjectName}</strong></span></div>
          <div><FileText size={20} /><span>Exam Type<strong>{q?.exam_type ?? "WASSCE"}</strong></span></div>
          <div><ListChecks size={20} /><span>Total Questions<strong>{total ? `${total} Questions` : "Up to 20"}</strong></span></div>
          <div><CalendarClock size={20} /><span>Time Limit<strong>30 Minutes</strong></span></div>
        </div>

        {p.errorMessage && (
          <div role="alert" className="bl-pt-alert">
            {p.errorMessage}
            {p.authRequired && <> <Link to="/" search={{ auth: "login" } as never}>Sign in</Link></>}
          </div>
        )}

        {!inTest && (
          <section className="bl-pt-card bl-pt-start">
            <h2>Choose your subject</h2>
            <label htmlFor="practice-subject">Subject</label>
            <select id="practice-subject" value={p.subjectId} disabled={p.loading} onChange={(e) => p.onSubject(e.target.value)}>
              <option value="">Select a subject</option>
              {p.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p>Up to 20 questions per session · 30-minute timer</p>
            <button type="button" className="bl-pt-primary" disabled={p.loading || !p.subjectId} onClick={p.onStart}>
              {p.loading ? "Loading…" : "Start Practice"} <ArrowRight size={16} />
            </button>
          </section>
        )}

        {inTest && q && (
          <div className="bl-pt-grid">
            <section className="bl-pt-card" id="pt-question">
              {p.isDemoExam && <p className="bl-pt-note">Sample questions — this subject has no published questions yet. Results are not saved.</p>}
              <div className="bl-pt-qhead">
                <div>
                  <strong>Question {current + 1} of {total}</strong>
                  <div className="bl-pt-bar"><span style={{ width: `${progress}%` }} /></div>
                </div>
                <span className="bl-pt-pct">{progress}%</span>
                {p.result
                  ? <span className="bl-pt-timer is-done">Score {p.result.score}/{p.result.total_questions}</span>
                  : <span className="bl-pt-timer" aria-live="polite"><Timer size={16} />00:{mm}:{ss}</span>}
              </div>
              <div className="bl-pt-q">
                <span className="bl-pt-tag">{subjectName}</span>
                <h2>{q.prompt}</h2>
                <div className="bl-pt-options" role="radiogroup">
                  {q.options.map((o, i) => {
                    const cls = [
                      selected === o.id ? "is-selected" : "",
                      r && o.id === correctId ? "is-correct" : "",
                      r && selected === o.id && !r.is_correct ? "is-wrong" : "",
                    ].join(" ");
                    return (
                      <label key={o.id} className={cls}>
                        <input type="radio" name={`q-${q.id}`} checked={selected === o.id} disabled={!!p.result}
                          onChange={() => p.onAnswer(q.id, o.id)} />
                        <span>{String.fromCharCode(65 + i)}. {o.text}</span>
                      </label>
                    );
                  })}
                </div>
                {r && (
                  <div className="bl-pt-explain">
                    <Lightbulb size={18} />
                    <div><strong>{r.is_correct ? "Correct" : selected ? "Incorrect" : "Not answered"} — Answer: {r.correct_option}</strong>
                      {r.explanation && <p>{r.explanation}</p>}</div>
                  </div>
                )}
                {!r && !p.result && <p className="bl-pt-hint">Explanations appear after you submit the test.</p>}
              </div>
              <div className="bl-pt-nav">
                <button type="button" className="bl-pt-outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}><ArrowLeft size={16} />Previous</button>
                {current < total - 1
                  ? <button type="button" className="bl-pt-primary" onClick={() => setCurrent((c) => c + 1)}>Next<ArrowRight size={16} /></button>
                  : !p.result && <button type="button" className="bl-pt-primary" disabled={p.submitting} onClick={p.onSubmit}>{p.submitting ? "Marking…" : "Submit Test"}<Send size={16} /></button>}
              </div>
            </section>

            <div className="bl-pt-rail">
              <section className="bl-pt-card">
                <h3>Test Progress</h3>
                <div className="bl-pt-ring">
                  <svg viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="34" className="track" />
                    <circle cx="40" cy="40" r="34" className="fill" strokeDasharray={ring} strokeDashoffset={ring * (1 - progress / 100)} />
                  </svg>
                  <strong>{progress}%</strong>
                  <span>{answered} of {total} questions</span>
                </div>
                <ul className="bl-pt-stats">
                  {p.result ? <>
                    <li><i className="ok" />Correct<b>{correct}</b></li>
                    <li><i className="bad" />Incorrect<b>{incorrect}</b></li>
                  </> : <li><i className="ans" />Answered<b>{answered}</b></li>}
                  <li><i className="none" />Not Answered<b>{total - answered}</b></li>
                </ul>
              </section>
              <section className="bl-pt-card">
                <h3>Question Navigator</h3>
                <div className="bl-pt-navgrid">
                  {p.questions.map((x, i) => (
                    <button key={x.id} type="button" className={`s-${statusOf(i)}`} aria-label={`Question ${i + 1}`} onClick={() => setCurrent(i)}>{i + 1}</button>
                  ))}
                </div>
                <ul className="bl-pt-legend">
                  <li><i className="s-current" />Current Question</li>
                  {p.result ? <><li><i className="s-correct" />Answered Correctly</li><li><i className="s-incorrect" />Answered Incorrectly</li></>
                    : <li><i className="s-answered" />Answered</li>}
                  <li><i className="s-empty" />Not Answered</li>
                </ul>
              </section>
              <section className="bl-pt-card bl-pt-actions">
                <h3>Quick Actions</h3>
                {p.result
                  ? <button type="button" className="bl-pt-primary" onClick={() => { p.onReset(); }}><TimerReset size={16} />Practise Again</button>
                  : <button type="button" className="bl-pt-primary" disabled={p.submitting} onClick={p.onSubmit}><Send size={16} />{p.submitting ? "Marking…" : "Submit Test"}</button>}
                <button type="button" className="bl-pt-outline" onClick={reviewAnswers}><Eye size={16} />Review Answers</button>
                <button type="button" className="bl-pt-outline" disabled={!p.result} title={p.result ? "" : "Submit the test to see results"}
                  onClick={() => document.getElementById("pt-results")?.scrollIntoView({ behavior: "smooth" })}><BarChart3 size={16} />View Results</button>
              </section>
            </div>
          </div>
        )}

        {p.result && (
          <section className="bl-pt-card bl-pt-results" id="pt-results">
            <h2>Your Results</h2>
            <p className="big">{p.result.score} / {p.result.total_questions} · {p.result.total_questions ? Math.round((p.result.score / p.result.total_questions) * 100) : 0}%</p>
            <p>{correct} correct, {incorrect} incorrect, {total - answered} not answered. Use the navigator to see each answer and explanation.</p>
          </section>
        )}

        <section className="bl-pt-features">
          {[
            { icon: NotebookText, title: "Past Questions", text: "Access WASSCE-style questions with detailed answers and explanations.", cta: "Start Practicing", onClick: () => document.getElementById("practice-subject")?.focus() ?? reviewAnswers() },
            { icon: Timer, title: "Mock Tests", text: "Timed practice tests to improve your speed and accuracy.", cta: "Start Test", onClick: () => { if (inTest) reviewAnswers(); else if (p.subjectId) p.onStart(); else document.getElementById("practice-subject")?.focus(); } },
            { icon: FileText, title: "Study Notes", text: "Notes and revision materials for all subjects.", cta: "View Notes", to: "/courses" as const },
            { icon: LineChart, title: "Performance Tracking", text: "Monitor your progress, identify weak areas and improve.", cta: "View Progress", to: "/dashboard" as const },
          ].map((f) => (
            <article key={f.title} className="bl-pt-feature">
              <span className="ico"><f.icon size={20} /></span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              {"to" in f && f.to
                ? <Link to={f.to}>{f.cta} <ArrowRight size={14} /></Link>
                : <button type="button" onClick={f.onClick}>{f.cta} <ArrowRight size={14} /></button>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
