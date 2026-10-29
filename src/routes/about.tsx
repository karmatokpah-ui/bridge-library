import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteChrome";
import aboutImg from "@/assets/about-students.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BridgeLIB — Empowering learners in Liberia" },
      {
        name: "description",
        content:
          "BridgeLIB is an online learning platform helping Liberian students access quality education and prepare for the WASSCE.",
      },
      { property: "og:title", content: "About BridgeLIB — Empowering learners in Liberia" },
      {
        property: "og:description",
        content: "Our mission, vision, and the platform features built for Liberian students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const features = [
  {
    icon: BookOpen,
    title: "Subject lessons",
    text: "Learning organised by subject, level and grade.",
  },
  {
    icon: GraduationCap,
    title: "WASSCE practice",
    text: "Timed practice with scoring and explanations.",
  },
  { icon: BarChart3, title: "Progress", text: "See results after every practice attempt." },
  {
    icon: ShieldCheck,
    title: "Secure accounts",
    text: "Each learner’s data stays private to them.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bl-container bl-about">
        <div>
          <h1 className="bl-page-title">About BridgeLIB</h1>
          <p className="bl-lead-strong">Empowering Learners, Building a Stronger Liberia</p>
          <p className="bl-muted">
            BridgeLIB is an online learning platform designed to help Liberian students access
            quality education, prepare for the WASSCE, and build a brighter future. We believe every
            learner deserves the right tools, support, and guidance to achieve their dreams.
          </p>
          <div className="bl-grid-4 bl-mt">
            {features.map((f) => (
              <div className="bl-card bl-stat" key={f.title}>
                <span className="bl-icon-tile blue">
                  <f.icon size={20} />
                </span>
                <b>{f.title}</b>
                <small>{f.text}</small>
              </div>
            ))}
          </div>
          <h2 className="bl-h3 bl-mt">Our Mission</h2>
          <p className="bl-muted">
            To provide accessible, high-quality, and affordable education for every Liberian
            student, using technology and innovation.
          </p>
          <h2 className="bl-h3">Our Vision</h2>
          <p className="bl-muted">
            A Liberia where every young person is educated, skilled, and ready to contribute to
            national development.
          </p>
          <a href="/?auth=signup" className="bl-btn bl-btn-red bl-mt">
            Join BridgeLIB Today
          </a>
        </div>
        <figure className="bl-about-photo">
          <img
            src={aboutImg}
            alt="Liberian students holding books beneath the Liberian flag"
            width={768}
            height={1024}
            loading="lazy"
          />
          <figcaption>
            Education
            <br />
            Changes Lives
          </figcaption>
        </figure>
      </section>
    </SiteLayout>
  );
}
