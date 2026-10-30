import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Atom,
  BookOpenText,
  Briefcase,
  Calculator,
  FlaskConical,
  Globe2,
  Landmark,
  Leaf,
  Menu,
  Search,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Monitor,
  X,
  type LucideIcon,
  Bell,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import shieldImg from "@/assets/bridgelib-shield.png";
import { safeUrl, useSiteContent, type SiteContent } from "@/lib/site-content";
import { Button } from "@/components/ui/button";

const socials = [
  ["facebook", "Facebook", Facebook],
  ["x", "X", Twitter],
  ["youtube", "YouTube", Youtube],
  ["instagram", "Instagram", Instagram],
  ["linkedin", "LinkedIn", Linkedin],
] as const;

export function ContactLines({ content }: { content?: SiteContent } = {}) {
  const live = useSiteContent().data;
  const c = content ?? live ?? {};
  const social = socials.flatMap(([k, label, Icon]) => {
    const href = safeUrl(c[k]);
    return href ? [{ href, label, Icon }] : [];
  });
  return (
    <>
      {c.contact_address ? <span className="bl-contact-line"><MapPin size={15}/>{c.contact_address}</span> : null}
      {c.contact_phone ? <a className="bl-contact-line" href={`tel:${c.contact_phone.replace(/[^+\d]/g, "")}` }><Phone size={15}/>{c.contact_phone}</a> : null}
      {c.contact_email ? <a className="bl-contact-line" href={`mailto:${c.contact_email}`}><Mail size={15}/>{c.contact_email}</a> : null}
      {social.length ? (
        <span className="bl-socials">
          {social.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
              <Icon size={16} />
            </a>
          ))}
        </span>
      ) : null}
      {!c.contact_address && !c.contact_phone && !c.contact_email && social.length === 0 ? (
        <Link to="/contact">Contact &amp; help</Link>
      ) : null}
    </>
  );
}

export function ContactDetails() {
  return (
    <div className="bl-card bl-mt" style={{ padding: 22, display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0, color: "var(--bl-navy)" }}>Contact BridgeLIB</h3>
      <ContactLines />
    </div>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`bl-logo ${light ? "light" : ""}`} aria-label="BridgeLIB home">
      <span className="bl-logo-mark" aria-hidden="true">
        <img src={shieldImg} alt="" width={34} height={34} />
      </span>
      <span className="bl-logo-text">
        Bridge<span className="bl-logo-accent">LIB</span>
      </span>
    </Link>
  );
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/wassce", label: "WASSCE" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
] as const;

export function useSignedIn() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session)),
    );
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return signedIn;
}

export function SiteHeader({ actions, student = false }: { actions?: ReactNode; student?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = useSignedIn();

  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [studentName, setStudentName] = useState("Guest");
  useEffect(() => {
    if (!student) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const profile = await supabase.from('profiles').select('full_name').eq('id',data.user.id).maybeSingle();
      setStudentName(profile.data?.full_name || data.user.user_metadata['full_name'] || 'Student');
    });
  }, [student]);
  useEffect(() => { setOpen(false); setSearchOpen(false); }, [pathname]);

  const defaultActions = signedIn ? (
    <Link to="/dashboard" className="bl-btn bl-btn-primary bl-btn-sm">
      My dashboard
    </Link>
  ) : (
    <>
      <a href="/?auth=login" className="bl-btn bl-btn-outline bl-btn-sm">
        Login
      </a>
      <a href="/?auth=signup" className="bl-btn bl-btn-primary bl-btn-sm">
        Sign Up
      </a>
    </>
  );

  return (
    <header className={`bl-header ${student ? 'bl-student-header' : ''}`}>
      <div className="bl-container bl-header-inner">
        <Logo />
        <nav className="bl-nav" aria-label="Main navigation">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="bl-nav-link"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bl-nav-link active" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Button type="button" className="bl-search-btn" aria-label="Search courses" aria-expanded={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}>
          <Search size={18} />
        </Button>
        {student && <div className="bl-student-actions"><Button className="bl-search-btn" aria-label="Notifications" aria-expanded={noticesOpen} onClick={()=>setNoticesOpen(v=>!v)}><Bell size={18}/></Button><Link to="/profile" className="bl-header-profile"><User size={22}/><span><strong>{studentName}</strong><small>Student</small></span></Link>{noticesOpen&&<div className="bl-notifications"><strong>Notifications</strong><Link to="/dashboard">View class assignments</Link><Link to="/progress">View saved practice results</Link></div>}</div>}
        {!student && <div className="bl-header-actions">{actions ?? defaultActions}</div>}
        <Button
          type="button"
          className="bl-menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>
      {searchOpen && (
        <form className="bl-container bl-header-search" role="search"
          onSubmit={(e) => { e.preventDefault(); void navigate({ to: "/courses", search: term.trim() ? { q: term.trim() } : {} }); setSearchOpen(false); }}>
          <input autoFocus type="search" value={term} onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for a course, subject, or topic…" aria-label="Search courses" />
          <Button className="bl-btn-sm">Search</Button>
        </form>
      )}
      {open && (
        <div className="bl-mobile-nav">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="bl-mobile-link">
              {l.label}
            </Link>
          ))}
          <div className="bl-mobile-actions">{actions ?? defaultActions}</div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bl-footer">
      <div className="bl-container bl-footer-grid">
        <div>
          <Logo light />
          <p className="bl-footer-tag">Learn Today, Build Tomorrow</p>
          <p className="bl-footer-text">
            Empowering Liberian students with quality education, technology, and opportunity.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/wassce">WASSCE</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Learning Resources</h4>
          <Link to="/practice">Past Questions</Link>
          <Link to="/courses">Study Notes</Link>
          <Link to="/practice">Mock Tests</Link>
          <Link to="/courses">Video Lessons</Link>
          <Link to="/certificates">Certificates</Link>
        </div>
        <div>
          <h4>Help &amp; Support</h4>
          <Link to="/faq">FAQs</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/contact">Contact Us</Link>
          <a href="/?auth=login">Sign in / Reset password</a>
        </div>
        <div>
          <h4>Contact Us</h4>
          <ContactLines />
        </div>
      </div>
      <div className="bl-container bl-footer-bottom">
        <span>© {new Date().getFullYear()} BridgeLIB. All rights reserved.</span>
        <span className="bl-proud">
          Proudly Liberian <LiberiaFlag />
        </span>
      </div>
    </footer>
  );
}

export function LiberiaFlag({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 2) / 3}
      viewBox="0 0 33 22"
      aria-label="Liberian flag"
      role="img"
    >
      {Array.from({ length: 11 }).map((_, i) => (
        <rect key={i} y={i * 2} width="33" height="2" fill={i % 2 ? "#fff" : "#E53945"} />
      ))}
      <rect width="12" height="12" fill="#062B59" />
      <path d="M6 2.3l1 3h3.1L7.6 7.1l1 3L6 8.3 3.4 10.1l1-3L1.9 5.3H5z" fill="#fff" />
    </svg>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bl-site">
      <SiteHeader />
      <main className="bl-main">{children}</main>
      <SiteFooter />
    </div>
  );
}

const iconMap: Array<[string, LucideIcon, string]> = [
  ["math", Calculator, "green"],
  ["english", BookOpenText, "violet"],
  ["literature", BookOpenText, "violet"],
  ["biology", Leaf, "green"],
  ["chemistry", FlaskConical, "violet"],
  ["physics", Atom, "blue"],
  ["science", FlaskConical, "blue"],
  ["government", Landmark, "orange"],
  ["history", Landmark, "orange"],
  ["social", Globe2, "orange"],
  ["geography", Globe2, "blue"],
  ["ict", Monitor, "blue"],
  ["computer", Monitor, "blue"],
  ["business", Briefcase, "red"],
  ["economics", Briefcase, "red"],
];

export function SubjectIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const match = iconMap.find(([k]) => lower.includes(k));
  const Icon = match?.[1] ?? BookOpenText;
  return (
    <span className={`bl-icon-tile ${match?.[2] ?? "blue"}`} aria-hidden="true">
      <Icon size={22} />
    </span>
  );
}

export const learningCategories = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "ICT",
  "Business Studies",
];

export type PublicSubject = { id: number; name: string; description: string | null };

export function useSubjects() {
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void supabase
      .from("subjects")
      .select("id,name,description")
      .order("name")
      .then(({ data, error: e }) => {
        if (!active) return;
        if (e) {
          setError(e.message);
          setState("error");
        } else {
          setSubjects((data ?? []) as PublicSubject[]);
          setState("ready");
        }
      });
    return () => {
      active = false;
    };
  }, []);
  return { subjects, state, error };
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="bl-empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="bl-grid-3" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bl-card bl-skeleton-card">
          <div className="bl-skel" style={{ width: 48, height: 48 }} />
          <div className="bl-skel" style={{ width: "60%", height: 16 }} />
          <div className="bl-skel" style={{ width: "90%", height: 12 }} />
        </div>
      ))}
    </div>
  );
}
