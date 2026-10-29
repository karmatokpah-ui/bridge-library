import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, KeyRound, LifeBuoy } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Help — BridgeLIB" },
      {
        name: "description",
        content: "Get help with your BridgeLIB account, practice exams, and school applications.",
      },
      { property: "og:title", content: "Contact & Help — BridgeLIB" },
      {
        property: "og:description",
        content: "Help with accounts, practice exams, and school applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bl-container bl-section">
        <h1 className="bl-page-title">Contact &amp; Help</h1>
        <p className="bl-muted">Answers to common questions about using BridgeLIB.</p>
        <div className="bl-grid-3 bl-mt">
          <article className="bl-card bl-course">
            <span className="bl-icon-tile blue">
              <KeyRound size={22} />
            </span>
            <h3>Forgot your password?</h3>
            <p>
              Open the sign-in form and choose “Forgot password” to receive a reset link by email.
            </p>
            <a href="/?auth=login" className="bl-link">
              Go to sign in
            </a>
          </article>
          <article className="bl-card bl-course">
            <span className="bl-icon-tile green">
              <HelpCircle size={22} />
            </span>
            <h3>Practice exams</h3>
            <p>
              Sign in, choose a subject, and start a timed practice test. Results show after
              submitting.
            </p>
            <Link to="/practice" className="bl-link">
              Open practice
            </Link>
          </article>
          <article className="bl-card bl-course">
            <span className="bl-icon-tile orange">
              <LifeBuoy size={22} />
            </span>
            <h3>Schools &amp; teachers</h3>
            <p>
              Schools can apply from the learner dashboard. Teacher access is granted after
              verification.
            </p>
            <a href="/?auth=signup" className="bl-link">
              Create an account
            </a>
          </article>
        </div>
        <div className="bl-empty bl-mt">
          <h3>Direct contact details coming soon</h3>
          <p>
            Official BridgeLIB phone, email and social accounts will be listed here once published.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
