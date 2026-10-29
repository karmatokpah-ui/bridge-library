import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  NotebookPen,
  PlayCircle,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiteLayout } from "./SiteChrome";
import { parseBlocks, useSiteContent } from "@/lib/site-content";

function PageShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <SiteLayout>
      <section className="bl-container bl-section">
        <h1 className="bl-h2" style={{ fontSize: "2rem" }}>{title}</h1>
        <p className="bl-muted" style={{ maxWidth: 680 }}>{intro}</p>
        <div style={{ marginTop: 24 }}>{children}</div>
      </section>
    </SiteLayout>
  );
}

const featureList = [
  { icon: BookOpen, title: "Subject courses", text: "Structured lessons for every core subject.", to: "/courses" },
  { icon: FileText, title: "Past questions", text: "Practise real WASSCE-style questions.", to: "/practice" },
  { icon: ClipboardCheck, title: "Mock tests", text: "Timed practice exams with instant scores.", to: "/practice" },
  { icon: NotebookPen, title: "Study notes", text: "Key concepts and tips inside each course.", to: "/courses" },
  { icon: PlayCircle, title: "Video lessons", text: "Watch lessons attached to course topics.", to: "/courses" },
  { icon: BarChart3, title: "Progress tracking", text: "See completed lessons and exam results.", to: "/dashboard" },
  { icon: UsersRound, title: "Classes", text: "Teachers create classes and assignments.", to: "/teacher" },
  { icon: GraduationCap, title: "WASSCE preparation", text: "Everything you need for exam day.", to: "/wassce" },
] as const;

export function FeaturesPage() {
  return (
    <PageShell title="Features" intro="Everything BridgeLIB offers students, teachers and schools in Liberia.">
      <div className="bl-grid-3">
        {featureList.map(({ icon: Icon, title, text, to }) => (
          <Link key={title} to={to} className="bl-card bl-course">
            <span className="bl-icon-tile blue"><Icon size={22} /></span>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="bl-link">Open</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

const faqs = [
  ["Is BridgeLIB free?", "Yes. Creating an account and studying courses is free."],
  ["How do I create an account?", "Click Sign Up at the top of any page and fill in your details."],
  ["I forgot my password. What do I do?", "Open Login and choose “Forgot password” to get a reset link by email."],
  ["Where are past questions and mock tests?", "Open Practice from the menu to take past questions and timed mock tests."],
  ["How do I track my progress?", "Sign in and open My dashboard to see completed lessons and exam scores."],
  ["Can teachers use BridgeLIB?", "Yes. Teachers can create classes, add students and set assignments."],
];

export function FaqPage() {
  return (
    <PageShell title="Frequently Asked Questions" intro="Quick answers to common questions about BridgeLIB.">
      <div style={{ display: "grid", gap: 12 }}>
        {(parseBlocks(useSiteContent().data?.faq).length ? parseBlocks(useSiteContent().data?.faq) : faqs).map(([q, a]) => (
          <details key={q} className="bl-card" style={{ padding: 18 }}>
            <summary style={{ fontWeight: 700, cursor: "pointer", color: "var(--bl-navy)" }}>{q}</summary>
            <p className="bl-muted" style={{ margin: "10px 0 0" }}>{a}</p>
          </details>
        ))}
      </div>
      <p className="bl-muted" style={{ marginTop: 20 }}>
        Still need help? <Link to="/contact" className="bl-link">Contact us</Link>.
      </p>
    </PageShell>
  );
}

export function Sections({ items }: { items: Array<[string, string]> }) {
  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 760 }}>
      {items.map(([h, t]) => (
        <div key={h}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--bl-navy)", margin: "0 0 6px" }}>{h}</h2>
          <p className="bl-muted" style={{ margin: 0 }}>{t}</p>
        </div>
      ))}
    </div>
  );
}

export function TermsPage() {
  const custom = parseBlocks(useSiteContent().data?.terms);
  return (
    <PageShell title="Terms of Service" intro="The rules for using BridgeLIB.">
      <Sections
        items={custom.length ? custom : [
          ["Using BridgeLIB", "BridgeLIB is an educational platform. Use it for learning and teaching only."],
          ["Your account", "Keep your password private. You are responsible for activity on your account."],
          ["Content", "Lessons, questions and materials are provided for personal study and may not be resold."],
          ["Conduct", "Do not share answers during assessments, upload harmful content, or misuse other accounts."],
          ["Changes", "We may update these terms. Continued use means you accept the updated terms."],
        ]}
      />
    </PageShell>
  );
}

export function PrivacyPage() {
  const custom = parseBlocks(useSiteContent().data?.privacy);
  return (
    <PageShell title="Privacy Policy" intro="How BridgeLIB handles your information.">
      <Sections
        items={custom.length ? custom : [
          ["What we collect", "Your name, email, school details you provide, and your learning progress."],
          ["How we use it", "To run your account, show your progress, and let teachers see their class results."],
          ["Sharing", "We do not sell your data. Teachers only see students in their own classes."],
          ["Your choices", "You can update your profile in Settings or contact us to delete your account."],
        ]}
      />
    </PageShell>
  );
}
