import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, ChevronRight, Home, Laptop, Search, Target, Layers3 } from "lucide-react";
import heroImg from "@/assets/reference-home-hero.jpg";
import mathImg from "@/assets/course-math.jpg";
import englishImg from "@/assets/course-english.jpg";
import scienceImg from "@/assets/course-science.jpg";
import socialImg from "@/assets/reference-social-studies.jpg";
import wassceImg from "@/assets/wassce-hero.jpg";
import aboutImg from "@/assets/about-students.jpg";
import ctaImg from "@/assets/courses-cta.jpg";
import { CourseMetrics, useCourseMetrics } from '@/components/learning/CourseMetrics';
import { Button } from '@/components/ui/button';
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
  validateSearch: (search: Record<string, unknown>): { q?: string; category?: string } => ({
    ...(typeof search['q'] === 'string' && search['q'] ? { q: search['q'] } : {}),
    ...(typeof search['category'] === 'string' && search['category'] ? { category: search['category'] } : {}),
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

function subjectImage(name: string) {
  const n = name.toLowerCase();
  if (n.includes("math") || n.includes("account") || n.includes("econom")) return mathImg;
  if (n.includes("physics")) return wassceImg;
  if (n.includes("literature")) return aboutImg;
  if (n.includes("english")) return englishImg;
  if (["biology", "chemistry", "physics", "science", "agric"].some((k) => n.includes(k))) return scienceImg;
  if (["government", "history", "geography", "social", "civic"].some((k) => n.includes(k))) return socialImg;
  if (n.includes("ict") || n.includes("computer")) return aboutImg;
  return wassceImg;
}

const popularOrder = ["math", "english", "biology", "chemistry", "physics", "government"];

function CoursesPage() {
  const { subjects, state } = useSubjects();
  const metrics = useCourseMetrics();
  const { q: initialQ = "", category: initialCategory = 'All' } = Route.useSearch();
  const [draft, setDraft] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  useEffect(() => { setDraft(initialQ); setQuery(initialQ); }, [initialQ]);
  const [category, setCategory] = useState(initialCategory);
  useEffect(() => {setCategory(initialCategory);},[initialCategory]);
  const [sort, setSort] = useState("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = subjects.filter((s) => {
      const name = s.name.toLowerCase();
      const inCat =
        category === "All" || (categoryKeywords[category] ?? []).some((k) => name.includes(k));
      const inQuery = !q || name.includes(q) || (s.description ?? "").toLowerCase().includes(q);
      return inCat && inQuery;
    });
    const rank = (n: string) => {
      const i = popularOrder.findIndex((k) => n.toLowerCase().startsWith(k));
      return i === -1 ? 99 : i;
    };
    return [...list].sort((a, b) =>
      sort === "az" ? a.name.localeCompare(b.name)
      : sort === "za" ? b.name.localeCompare(a.name)
       : Number(metrics.data?.metrics.find(m=>Number(m.subject_id)===b.id)?.student_count ?? 0) - Number(metrics.data?.metrics.find(m=>Number(m.subject_id)===a.id)?.student_count ?? 0) || rank(a.name) - rank(b.name) || a.name.localeCompare(b.name),
    );
  }, [subjects, query, category, sort, metrics.data]);

  const popular = filtered.slice(0, 6);
  const more = filtered.slice(6);

  return (
    <SiteLayout>
      <section className="bl-page-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="bl-container bl-page-hero-inner">
          <nav className="bl-crumbs" aria-label="Breadcrumb">
            <Link to="/"><Home size={15} /> Home</Link> <ChevronRight size={14} /> <span>Courses</span>
          </nav>
          <h1>Our Courses</h1>
          <p className="bl-page-hero-lead">Choose from a wide range of subjects and start learning today.</p>
          <p>Access high-quality courses, past questions, video lessons, quizzes, and study materials designed for Liberian students.</p>
        </div>
      </section>

      <section className="bl-container bl-section-sm">
        <form className="bl-search-row" onSubmit={(e) => { e.preventDefault(); setQuery(draft); }}>
          <label className="bl-search">
            <Search size={18} aria-hidden="true" />
            <input type="search" placeholder="Search for a course, subject, or topic…" value={draft}
              onChange={(e) => { setDraft(e.target.value); if (!e.target.value) setQuery(""); }} aria-label="Search courses" />
          </label>
          <Button>Search</Button>
        </form>

        <div className="bl-chips bl-chips-icons" role="tablist" aria-label="Filter by category">
          {["All", ...learningCategories].map((c) => (
            <Button key={c} type="button" role="tab" aria-selected={category === c}
              className={`bl-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
              {c === "All" ? <span className="bl-icon-tile blue" aria-hidden="true"><Layers3 size={18} /></span> : <SubjectIcon name={c} />}
              {c === "All" ? "All Subjects" : c}
            </Button>
          ))}
        </div>

        <div className="bl-courses-head">
          <div>
            <h2 className="bl-h2">Popular Courses</h2>
            <p className="bl-muted">Explore our most popular courses chosen by Liberian students.</p>
          </div>
          <label className="bl-sort">Sort by:
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="az">Name A–Z</option>
              <option value="za">Name Z–A</option>
            </select>
          </label>
        </div>

        {state === "loading" && <SkeletonGrid />}
        {state === "error" && (
          <EmptyState title="Courses could not load" text="Please refresh the page or sign in and try again."
            action={<a href="/?auth=login" className="bl-btn bl-btn-primary">Sign in</a>} />
        )}
        {state === "ready" && filtered.length === 0 && (
          <EmptyState title="No courses found" text={subjects.length ? "Try another search or category." : "No subjects have been published yet."} />
        )}
        {popular.length > 0 && (
          <div className="bl-grid-3">
            {popular.map((s) => (
              <article className="bl-card bl-photo-course" key={s.id}>
                <div className="bl-course-photo"><img src={subjectImage(s.name)} alt="" loading="lazy" width={1024} height={656} /><CourseMetrics subjectId={s.id} lessonsOnly/></div>
                <div className="bl-photo-course-body">
                  <SubjectIcon name={s.name} />
                  <h3>{s.name}</h3>
                  <p>{s.description || "Lessons and practice questions for this subject."}</p>
                  <CourseMetrics subjectId={s.id}/>
                  <Link to="/courses/$subjectId" params={{ subjectId: String(s.id) }} className="bl-btn bl-btn-primary bl-btn-sm">
                    View Course <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {more.length > 0 && (
          <>
            <h2 className="bl-h2 bl-mt-lg">More Subjects</h2>
            <p className="bl-muted">Discover all available subjects and learning resources.</p>
            <div className="bl-more-grid">
              {more.map((s) => (
                <article className="bl-card bl-more-card" key={s.id}>
                  <div className="bl-more-top">
                    <SubjectIcon name={s.name} />
                    <div>
                      <h3>{s.name}</h3>
                      <p>{s.description || "Lessons and practice questions."}</p>
                    </div>
                  </div>
                  <CourseMetrics subjectId={s.id} lessonsOnly/><CourseMetrics subjectId={s.id}/>
                  <Link to="/courses/$subjectId" params={{ subjectId: String(s.id) }} className="bl-btn bl-btn-primary bl-btn-sm">
                    View Course <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="bl-courses-cta">
        <img src={ctaImg} alt="Students learning together on a laptop" loading="lazy" />
        <div className="bl-courses-cta-copy">
          <h2>Start Learning Today</h2>
          <p>Join Liberian students building a brighter future with BridgeLIB.</p>
          <div className="bl-cta-points">
            <span><BookOpenText size={20} /> Access quality courses</span>
            <span><Laptop size={20} /> Learn at your own pace</span>
            <span><Target size={20} /> Prepare for WASSCE and beyond</span>
          </div>
          <a href="/?auth=signup" className="bl-btn bl-btn-red">Get Started Free <ArrowRight size={18} /></a>
        </div>
      </section>
    </SiteLayout>
  );
}
