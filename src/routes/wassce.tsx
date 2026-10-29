import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, FileQuestion, NotebookPen, Search } from "lucide-react";
import { EmptyState, SiteLayout, SubjectIcon, useSubjects } from "@/components/site/SiteChrome";
import heroImg from "@/assets/wassce-hero.jpg";
import { Resources } from '@/components/learning/Resources';

export const Route = createFileRoute("/wassce")({
  head: () => ({
    meta: [
      { title: "WASSCE Preparation — BridgeLIB" },
      {
        name: "description",
        content:
          "Practise WASSCE-style questions, take timed mock tests and review explanations on BridgeLIB.",
      },
      { property: "og:title", content: "WASSCE Preparation — BridgeLIB" },
      {
        property: "og:description",
        content: "Practice. Improve. Pass. Timed mock tests and explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WasscePage,
});

const resources = [
  {
    icon: FileQuestion,
    title: "Practice Questions",
    text: "Answer published exam-style questions by subject.",
  },
  {
    icon: ClipboardList,
    title: "Mock Tests",
    text: "Timed 30-minute tests to track your progress.",
  },
  {
    icon: NotebookPen,
    title: "Explanations",
    text: "Review the reasoning behind each answer after submitting.",
  },
];

function WasscePage() {
  const { subjects, state } = useSubjects();
  const [q, setQ] = useState("");
  const list = useMemo(
    () => subjects.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase())),
    [subjects, q],
  );

  return (
    <SiteLayout>
      <section className="bl-photo-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="bl-container">
          <h1>WASSCE Preparation</h1>
          <p className="bl-hero-sub">Practice. Improve. Pass.</p>
          <p>Practise exam questions and timed mock tests for your subjects.</p>
        </div>
      </section>

      <section className="bl-container bl-section">
        <div className="bl-grid-3">
          {resources.map((r) => (
            <article className="bl-card bl-course" key={r.title}>
              <span className="bl-icon-tile blue">
                <r.icon size={22} />
              </span>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
              <Link to="/practice" className="bl-link">
                Start Now <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>

        <h2 className="bl-h2 bl-mt-lg">Choose a subject</h2>
        <label className="bl-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search for WASSCE subjects…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search subjects"
          />
        </label>
        <div className="bl-mt">
          {state === "error" && (
            <EmptyState
              title="Sign in to start practising"
              text="WASSCE practice questions are available to signed-in learners."
              action={
                <a href="/?auth=login" className="bl-btn bl-btn-primary">
                  Sign in
                </a>
              }
            />
          )}
          {state === "ready" && list.length === 0 && (
            <EmptyState title="No subjects found" text="Try another search." />
          )}
          {state === "ready" && list.length > 0 && (
            <div className="bl-grid-3">
              {list.map((s) => (
                <Link to="/practice" search={{subject:String(s.id)}} key={s.id} className="bl-card bl-subject-row">
                  <SubjectIcon name={s.name} />
                  <span>{s.name}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <Resources />
      </section>
    </SiteLayout>
  );
}
