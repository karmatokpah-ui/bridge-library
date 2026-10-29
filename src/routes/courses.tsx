import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import {
  EmptyState,
  SiteLayout,
  SkeletonGrid,
  SubjectIcon,
  learningCategories,
  useSubjects,
} from "@/components/site/SiteChrome";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — BridgeLIB" },
      {
        name: "description",
        content: "Browse BridgeLIB subjects and start learning and practising today.",
      },
      { property: "og:title", content: "Courses — BridgeLIB" },
      {
        property: "og:description",
        content: "Search subjects, filter by category and start practising.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
});

const categoryKeywords: Record<string, string[]> = {
  Mathematics: ["math"],
  English: ["english", "literature"],
  Science: ["science", "biology", "chemistry", "physics", "agric"],
  "Social Studies": ["social", "history", "government", "geography", "civic"],
  ICT: ["ict", "computer"],
  "Business Studies": ["business", "economics", "account", "commerce"],
};

function CoursesPage() {
  const { subjects, state, error } = useSubjects();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      const name = s.name.toLowerCase();
      const inCat =
        category === "All" || (categoryKeywords[category] ?? []).some((k) => name.includes(k));
      const inQuery = !q || name.includes(q) || (s.description ?? "").toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [subjects, query, category]);

  return (
    <SiteLayout>
      <section className="bl-container bl-section">
        <h1 className="bl-page-title">Our Courses</h1>
        <p className="bl-muted">Choose from a range of subjects and start learning today.</p>

        <label className="bl-search bl-mt">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search for a course…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search courses"
          />
        </label>

        <div className="bl-chips" role="tablist" aria-label="Filter by category">
          {["All", ...learningCategories].map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              className={`bl-chip ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="bl-mt">
          {state === "loading" && <SkeletonGrid />}
          {state === "error" && (
            <EmptyState
              title="Sign in to see courses"
              text="The course catalogue is available to signed-in learners."
              action={
                <a href="/?auth=login" className="bl-btn bl-btn-primary">
                  Sign in
                </a>
              }
            />
          )}
          {state === "ready" && filtered.length === 0 && (
            <EmptyState
              title="No courses found"
              text={
                subjects.length
                  ? "Try another search or category."
                  : "No subjects have been published yet."
              }
            />
          )}
          {state === "ready" && filtered.length > 0 && (
            <div className="bl-grid-3">
              {filtered.map((s) => (
                <article className="bl-card bl-course" key={s.id}>
                  <SubjectIcon name={s.name} />
                  <h3>{s.name}</h3>
                  <p>{s.description || "Lessons and practice questions for this subject."}</p>
                  <Link to="/courses/$subjectId" params={{subjectId:String(s.id)}} className="bl-link">
                    View course <ArrowRight size={14} />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
