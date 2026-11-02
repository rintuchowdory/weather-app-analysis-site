import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CopyButton } from "@/components/CopyButton";
import { CountUp } from "@/components/CountUp";
import { DiffBlock } from "@/components/DiffBlock";
import { ScoreGauge } from "@/components/ScoreGauge";
import { SeverityDonut } from "@/components/SeverityDonut";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  type Variants,
} from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  Boxes,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Code2,
  Database,
  FileCheck2,
  Gauge,
  GitBranch,
  Github,
  Layers,
  ListChecks,
  Lock,
  Network,
  Printer,
  Scale,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";

type Severity = "Critical" | "High" | "Medium";

const SEVERITY_STYLES: Record<
  Severity,
  { badge: string; accent: string; text: string; dot: string; hex: string }
> = {
  Critical: {
    badge: "bg-red-500/10 text-red-300 border border-red-500/30",
    accent: "border-l-red-500/80",
    text: "text-red-400",
    dot: "bg-red-500",
    hex: "#ef4444",
  },
  High: {
    badge: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
    accent: "border-l-amber-500/80",
    text: "text-amber-400",
    dot: "bg-amber-500",
    hex: "#f59e0b",
  },
  Medium: {
    badge: "bg-yellow-500/10 text-yellow-200 border border-yellow-500/30",
    accent: "border-l-yellow-400/80",
    text: "text-yellow-300",
    dot: "bg-yellow-400",
    hex: "#facc15",
  },
};

interface Finding {
  id: string;
  title: string;
  severity: Severity;
  summary: ReactNode;
  evidence?: { file: string; snippet: string };
}

const FINDINGS: Finding[] = [
  {
    id: "jwt-secret",
    title: "Hardcoded JWT Secret",
    severity: "Critical",
    summary: (
      <>
        The JWT signing key (
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-red-300">
          xco0sr0fh4e52x03g9mv
        </code>
        ) is hardcoded in both the auth and UI services. Anyone with repository
        access can forge valid session tokens, and the key cannot be rotated
        without a re-release.
      </>
    ),
    evidence: {
      file: "auth/src/main/main.go (line 18)",
      snippet: 'const secretkey string = "xco0sr0fh4e52x03g9mv"',
    },
  },
  {
    id: "db-password",
    title: "Weak Database Password",
    severity: "Critical",
    summary: (
      <>
        docker-compose.yaml uses a weak, easily guessable password (
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-red-300">
          unprotectedP@ssword
        </code>
        ) for the MySQL root user and the auth service connection, stored in
        plaintext in the repository.
      </>
    ),
    evidence: {
      file: "docker-compose.yaml (lines 8, 19)",
      snippet: "MYSQL_ROOT_PASSWORD: unprotectedP@ssword",
    },
  },
  {
    id: "md5",
    title: "MD5 Password Hashing",
    severity: "Critical",
    summary: (
      <>
        User passwords are hashed with MD5 in both the registration handler and
        the database layer. MD5 is cryptographically broken and highly
        susceptible to rainbow-table and collision attacks.
      </>
    ),
    evidence: {
      file: "auth/src/main/main.go (line 74) · auth/src/authdb/authdb.go (line 39)",
      snippet: "encPasswordb := md5.Sum([]byte(uc.Password))",
    },
  },
  {
    id: "sqli",
    title: "SQL Injection",
    severity: "High",
    summary: (
      <>
        All queries are built with{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          fmt.Sprintf
        </code>{" "}
        string formatting instead of parameterized statements. The login lookup
        interpolates the username directly, enabling classic SQL injection.
      </>
    ),
    evidence: {
      file: "auth/src/authdb/authdb.go (lines 40, 49)",
      snippet:
        "db.Query(fmt.Sprintf(\"SELECT * FROM auth.users where user_name = '%s'\", user_name))",
    },
  },
  {
    id: "cors",
    title: "Permissive CORS Configuration",
    severity: "High",
    summary: (
      <>
        CORS allows all origins (
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          AllowOrigins: []string{'{"*"}'}
        </code>
        ), exposing the API to cross-site requests from any domain and widening
        the CSRF attack surface.
      </>
    ),
    evidence: {
      file: "auth/src/main/main.go (line 42)",
      snippet: 'corsConfig.AllowOrigins = []string{"*"}',
    },
  },
  {
    id: "api-key",
    title: "Exposed RapidAPI Key",
    severity: "High",
    summary: (
      <>
        The RapidAPI key for the weather service is committed in plaintext to
        docker-compose.yaml, making it publicly usable and liable to quota
        abuse.
      </>
    ),
    evidence: {
      file: "docker-compose.yaml (line 25)",
      snippet: "APIKEY: 5ec66691f6msh2bfa4dd1fa4b710p1580e9jsn12916c268a62",
    },
  },
  {
    id: "jwt-lib",
    title: "Deprecated JWT Library",
    severity: "Medium",
    summary: (
      <>
        The auth service uses{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          github.com/dgrijalva/jwt-go
        </code>
        , archived since 2020 and affected by CVE-2020-26160 (audience
        verification bypass). The maintained fork{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          golang-jwt/jwt
        </code>{" "}
        is a drop-in replacement.
      </>
    ),
    evidence: {
      file: "auth/src/main/go.mod (line 7)",
      snippet: "github.com/dgrijalva/jwt-go v3.2.0+incompatible",
    },
  },
  {
    id: "python-deps",
    title: "Outdated Python Dependencies",
    severity: "Medium",
    summary: (
      <>
        The weather service pins{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          Flask_Cors==3.0.10
        </code>{" "}
        (several majors behind) and{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
          requests==2.26.0
        </code>{" "}
        (from 2021). Both have accumulated security and compatibility fixes
        since.
      </>
    ),
    evidence: {
      file: "weather/requirements.txt (lines 1–3)",
      snippet: "Flask==3.0.0 · Flask_Cors==3.0.10 · requests==2.26.0",
    },
  },
];

/** Deduction per finding, weighted by severity (CVSS-style impact). */
const SEVERITY_DEDUCTION: Record<Severity, number> = {
  Critical: 25,
  High: 14,
  Medium: 7,
};

/** Map a 0-100 score to a letter grade. */
function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  if (score >= 20) return "E";
  return "F";
}

const REMEDIATIONS = [
  {
    id: "fix-secrets",
    title: "Secrets out of the repo, into the environment",
    fixes: ["jwt-secret", "db-password", "api-key"],
    language: "Go",
    before: `// auth/src/main/main.go — hardcoded signing key
const secretkey string = "xco0sr0fh4e52x03g9mv"

// docker-compose.yaml — plaintext credentials
MYSQL_ROOT_PASSWORD: unprotectedP@ssword
APIKEY: 5ec66691f6msh2bfa4dd1fa4b710p1580e9jsn12916c268a62`,
    after: `// auth/src/main/main.go — injected at deploy time, never committed
secretkey := os.Getenv("JWT_SECRET")
if secretkey == "" {
  log.Fatal("JWT_SECRET must be set")
}

# docker-compose.yaml — read from an untracked .env file
MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
APIKEY: \${RAPIDAPI_KEY}`,
    note: "Rotate every exposed credential as part of the migration — assume the committed values are burned.",
  },
  {
    id: "fix-md5",
    title: "MD5 → bcrypt password hashing",
    fixes: ["md5"],
    language: "Go",
    before: `// auth/src/main/main.go
encPasswordb := md5.Sum([]byte(uc.Password))
Password: hex.EncodeToString(encPasswordb[:]),

// login: SELECT on password column, comparison in Go`,
    after: `import "golang.org/x/crypto/bcrypt"

hash, err := bcrypt.GenerateFromPassword(
  []byte(uc.Password), bcrypt.DefaultCost)
if err != nil { /* ... */ }

// login: constant-time bcrypt comparison
if bcrypt.CompareHashAndPassword(
  []byte(stored.Hash), []byte(password)) != nil {
  return errors.New("invalid credentials")
}`,
    note: "Migrating existing hashes requires a re-hash-on-next-login strategy — never convert MD5 digests directly.",
  },
  {
    id: "fix-sqli",
    title: "Parameterized queries end the SQL injection",
    fixes: ["sqli"],
    language: "Go",
    before: `// auth/src/authdb/authdb.go — user input concatenated into SQL
db.Query(fmt.Sprintf(
  "SELECT * FROM auth.users where user_name = '%s'",
  user_name))`,
    after: `// auth/src/authdb/authdb.go — placeholder binding
row := db.QueryRow(
  "SELECT id, user_name, password FROM auth.users "+
    "WHERE user_name = ?", user_name)`,
    note: "Apply the same pattern to every query in the codebase — the fix is mechanical, and go vet plus sqlvet can flag stragglers.",
  },
  {
    id: "fix-cors",
    title: "CORS: from wildcard to an explicit allow-list",
    fixes: ["cors"],
    language: "Go",
    before: `// auth/src/main/main.go — every origin is trusted
corsConfig.AllowOrigins = []string{"*"}`,
    after: `// auth/src/main/main.go — explicit, environment-driven origins
corsConfig.AllowOrigins = strings.Split(
  os.Getenv("CORS_ALLOWED_ORIGINS"), ",")
// e.g. CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com`,
    note: "Pair with credentials-aware settings (AllowCredentials + no wildcard) and a HTTPS reverse proxy in front of every service.",
  },
];

const RECOMMENDATIONS = [
  {
    title: "Secret Management",
    text: "Move the JWT secret, DB password, and RapidAPI key into a proper secret store (Docker/Kubernetes Secrets, HashiCorp Vault, or environment-injected values) and rotate all currently exposed credentials.",
  },
  {
    title: "Strong Password Hashing",
    text: "Replace MD5 with a modern password-hashing algorithm — bcrypt, scrypt, or Argon2id. These are deliberately computationally expensive, making offline brute-force attacks impractical.",
  },
  {
    title: "Parameterized Queries",
    text: "Refactor all database access to use parameterized queries or prepared statements. This is the single most effective fix for the SQL injection findings.",
  },
  {
    title: "Restricted CORS",
    text: "Set AllowOrigins to the exact trusted origins the UI is served from. Wildcard CORS should never ship to production.",
  },
  {
    title: "HTTPS Everywhere",
    text: "Terminate TLS with a reverse proxy (Nginx or Caddy plus Let's Encrypt) so browser-to-UI, service-to-service, and UI-to-auth traffic is encrypted in transit — especially important since JWTs travel as cookies/headers.",
  },
  {
    title: "Input Validation",
    text: "Validate and constrain all user input (username format, password policy, query parameters) on both client and server to blunt injection and XSS attempts.",
  },
  {
    title: "Migrate to golang-jwt/jwt",
    text: "Swap the archived dgrijalva/jwt-go for its maintained fork golang-jwt/jwt. The API is compatible, and it closes CVE-2020-26160 while restoring upstream bug fixes.",
  },
  {
    title: "Dependency Hygiene",
    text: "Upgrade Flask-Cors and requests to current releases and add a dependency checker (pip-audit / Dependabot) so outdated, vulnerable packages surface automatically in the future.",
  },
];

const PIPELINE_STAGES = [
  {
    name: "Cleanup Workspace",
    text: "Wipes the Jenkins workspace so every build starts from a clean state",
  },
  {
    name: "Checkout Git Repo",
    text: "Clones the source from the GitHub repository (push-triggered via Generic Webhook Trigger)",
  },
  {
    name: "Build Docker Images",
    text: "Builds images for the auth, UI, and weather services, tagged with build number and latest",
  },
  {
    name: "Push to DockerHub",
    text: "Logs into DockerHub and pushes the freshly built images",
  },
  {
    name: "Trigger Config Pipeline",
    text: "Starts the second pipeline in the CurrentWeatherApp_Config repo for GitOps-based deployment",
  },
];

const SERVICES = [
  {
    icon: Server,
    color: "text-sky-400",
    title: "UI Service",
    badge: ":3000",
    description:
      "Node.js/Express service serving the web interface, managing sessions via JWTs, and proxying requests to the auth and weather services.",
    details: [
      ["Port", "3000"],
      ["Framework", "Express.js"],
      ["Key deps", "axios, cookie-parser, jsonwebtoken"],
    ],
  },
  {
    icon: Lock,
    color: "text-amber-400",
    title: "Auth Service",
    badge: ":8080",
    description:
      "Go service (Gin) handling registration and login against MySQL, issuing JWTs for sessions.",
    details: [
      ["Port", "8080"],
      ["Language", "Go (Gin)"],
      ["Database", "MySQL"],
    ],
  },
  {
    icon: GitBranch,
    color: "text-emerald-400",
    title: "Weather Service",
    badge: ":5000",
    description:
      "Python/Flask service providing weather data by querying the weatherapi.com endpoint via RapidAPI.",
    details: [
      ["Port", "5000"],
      ["Framework", "Flask 3.0"],
      ["API", "weatherapi.com via RapidAPI"],
    ],
  },
  {
    icon: Database,
    color: "text-violet-400",
    title: "Database",
    badge: "MySQL",
    description:
      "MySQL instance used by the auth service to store registered users, persisted via a Docker volume.",
    details: [
      ["Type", "MySQL"],
      ["Storage", "db_vol persistent volume"],
      ["Used by", "Auth Service"],
    ],
  },
];

const WHATS_NEW = [
  {
    icon: FileCheck2,
    title: "DSGVO pages added",
    text: "A Datenschutzerklärung (datenschutz.html) and Impressum (impressum.html) were added — an important step toward German-market compliance.",
  },
  {
    icon: Sparkles,
    title: "Flask upgraded",
    text: "The weather service moved to Flask 3.0.0, dropping the legacy 2.x line.",
  },
  {
    icon: CalendarCheck2,
    title: "Documentation refreshed",
    text: "The README now documents the RapidAPI key setup and the full Jenkins/GitOps CI flow.",
  },
];

const NAV_SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "architecture", label: "Architecture", icon: Boxes },
  { id: "pipeline", label: "CI / CD", icon: Network },
  { id: "security", label: "Security", icon: ShieldAlert },
  { id: "compliance", label: "Compliance", icon: Scale },
  { id: "recommendations", label: "Recommendations", icon: ListChecks },
  { id: "remediation", label: "Remediation", icon: Wrench },
  { id: "conclusion", label: "Conclusion", icon: FileCheck2 },
];

const SECTION_IDS = NAV_SECTIONS.map(section => section.id);

function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`panel rounded-2xl ${className}`}>{children}</div>;
}

function SectionHeader({
  index,
  icon: Icon,
  kicker,
  title,
  description,
  action,
}: {
  index: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {index} · {kicker}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const barVariants: Variants = {
  hidden: { width: 0 },
  visible: (value: number) => ({
    width: `${value}%`,
    transition: { duration: 0.9, ease: "easeOut" },
  }),
};

function StatTile({
  label,
  value,
  hint,
  dotClass,
}: {
  label: string;
  value: number;
  hint: string;
  dotClass: string;
}) {
  return (
    <Panel className="panel-hover rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <p className="mt-2 text-3xl font-semibold leading-none tabular-nums">
        <CountUp value={value} />
      </p>
      <p className="mt-2 text-xs leading-snug text-muted-foreground">{hint}</p>
    </Panel>
  );
}

function Sidebar({
  score,
  grade,
  activeSection,
  criticalCount,
}: {
  score: number;
  grade: string;
  activeSection: string;
  criticalCount: number;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-border/70 bg-[#0a0c12]/80 backdrop-blur-xl lg:flex print:hidden">
      <a href="#overview" className="flex items-center gap-3 px-5 py-5">
        <img
          src={`${import.meta.env.BASE_URL}weather-logo.svg`}
          alt=""
          className="h-9 w-9 rounded-xl ring-1 ring-white/10"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">CurrentWeatherApp</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Analysis dashboard · v3
          </p>
        </div>
      </a>

      <nav className="thin-scroll flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-2 pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Report
        </p>
        {NAV_SECTIONS.map(section => {
          const isActive = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg border border-primary/30 bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <section.icon
                className={`relative h-4 w-4 ${isActive ? "text-primary" : ""}`}
              />
              <span className="relative">{section.label}</span>
              {section.id === "security" && (
                <span className="relative ml-auto rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-300 tabular-nums">
                  {criticalCount}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border/70 p-4">
        <div className="rounded-xl border border-border/70 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Security score</span>
            <span className="font-mono text-[11px]">Grade {grade}</span>
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {score}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / 100
            </span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(score, 2)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save as PDF
        </button>
        <a
          href="https://github.com/rintuchowdory/CurrentWeatherApp"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
          Analyzed repository
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </aside>
  );
}

function TopBar({
  activeSection,
  score,
}: {
  activeSection: string;
  score: number;
}) {
  const { scrollYProgress } = useScroll();
  const current =
    NAV_SECTIONS.find(section => section.id === activeSection)?.label ??
    "Overview";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl print:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          <img
            src={`${import.meta.env.BASE_URL}weather-logo.svg`}
            alt=""
            className="h-8 w-8 rounded-lg ring-1 ring-white/10"
          />
          <p className="truncate text-sm font-semibold">{current}</p>
        </div>
        <div className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground lg:flex">
          <Activity className="h-4 w-4 text-primary" />
          <span className="truncate">Live report</span>
          <span className="text-border">/</span>
          <span className="truncate text-foreground">{current}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Re-verified 7 Sep 2026
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Score {score}
          </span>
          <a
            href="https://github.com/rintuchowdory/CurrentWeatherApp"
            target="_blank"
            rel="noreferrer"
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Open the analyzed repository on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="thin-scroll flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
        {NAV_SECTIONS.map(section => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
              activeSection === section.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {section.label}
          </a>
        ))}
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-indigo-400 via-cyan-300 to-fuchsia-400"
        style={{ scaleX: scrollYProgress }}
      />
    </header>
  );
}

export default function Home() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [severityFilter, setSeverityFilter] = useState<"All" | Severity>("All");

  const activeSection = useScrollSpy(SECTION_IDS);

  const isFindingOpen = (id: string) =>
    expandedSections[id] ?? id === "jwt-secret";

  const toggleFinding = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !isFindingOpen(id) }));
  };

  const visibleFindings = useMemo(
    () =>
      severityFilter === "All"
        ? FINDINGS
        : FINDINGS.filter(f => f.severity === severityFilter),
    [severityFilter]
  );

  const counts = {
    critical: FINDINGS.filter(f => f.severity === "Critical").length,
    high: FINDINGS.filter(f => f.severity === "High").length,
    medium: FINDINGS.filter(f => f.severity === "Medium").length,
  };

  // Weighted security score: 100 minus severity-weighted deductions, floored at 0.
  const deduction = FINDINGS.reduce(
    (total, f) => total + SEVERITY_DEDUCTION[f.severity],
    0
  );
  const score = Math.max(0, 100 - deduction);
  const grade = scoreToGrade(score);

  const allOpen = visibleFindings.every(f => isFindingOpen(f.id));

  // Findings grouped by the component their evidence points at.
  const componentTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const finding of FINDINGS) {
      const file = finding.evidence?.file ?? "";
      const bucket = file.startsWith("auth/")
        ? "Auth service"
        : file.startsWith("weather/")
          ? "Weather service"
          : file.startsWith("docker-compose")
            ? "Infrastructure"
            : "Other";
      map.set(bucket, (map.get(bucket) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const maxComponent = Math.max(...componentTotals.map(c => c.value), 1);

  return (
    <div className="relative min-h-screen text-foreground">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          score={score}
          grade={grade}
          activeSection={activeSection}
          criticalCount={counts.critical}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar activeSection={activeSection} score={score} />

          <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-14 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            {/* ---------------------------------------------------------------- */}
            {/* 01 · Overview                                                    */}
            {/* ---------------------------------------------------------------- */}
            <section id="overview" className="scroll-mt-28 space-y-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    Technical analysis report · v3
                  </div>
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    <span className="text-gradient">CurrentWeatherApp</span>
                    <span className="mt-2 block text-lg font-medium text-muted-foreground sm:text-2xl">
                      Architecture, CI/CD &amp; security review
                    </span>
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    A code-level analysis of the three-service weather
                    application, re-verified against the current repository
                    state, with every finding traced to an exact file and line.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("security")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
                  >
                    Read the findings
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground print:hidden"
                  >
                    <Printer className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-12">
                <Panel className="flex flex-col items-center justify-center gap-2 p-6 lg:col-span-4">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Weighted security score
                    </p>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-300">
                      <ShieldAlert className="h-3 w-3" />
                      At risk
                    </span>
                  </div>
                  <ScoreGauge
                    score={score}
                    grade={grade}
                    label="Report card"
                    sublabel={`Severity-weighted: −${SEVERITY_DEDUCTION.Critical} critical · −${SEVERITY_DEDUCTION.High} high · −${SEVERITY_DEDUCTION.Medium} medium per finding`}
                  />
                </Panel>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
                  <StatTile
                    label="Total findings"
                    value={FINDINGS.length}
                    hint="Every finding re-verified against main"
                    dotClass="bg-slate-400"
                  />
                  <StatTile
                    label="Critical"
                    value={counts.critical}
                    hint="Exploitable today, highest impact"
                    dotClass="bg-red-500"
                  />
                  <StatTile
                    label="High"
                    value={counts.high}
                    hint="Serious exposure, fix next"
                    dotClass="bg-amber-500"
                  />
                  <StatTile
                    label="Medium"
                    value={counts.medium}
                    hint="Maintenance and hardening debt"
                    dotClass="bg-yellow-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-12">
                <Panel className="p-5 lg:col-span-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Severity split</h3>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {FINDINGS.length} findings
                    </span>
                  </div>
                  <SeverityDonut
                    totalLabel="Findings"
                    slices={[
                      {
                        label: "Critical",
                        value: counts.critical,
                        color: SEVERITY_STYLES.Critical.hex,
                      },
                      {
                        label: "High",
                        value: counts.high,
                        color: SEVERITY_STYLES.High.hex,
                      },
                      {
                        label: "Medium",
                        value: counts.medium,
                        color: SEVERITY_STYLES.Medium.hex,
                      },
                    ]}
                  />
                </Panel>

                <Panel className="p-5 lg:col-span-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Findings by component</h3>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-4">
                    {componentTotals.map(item => (
                      <div key={item.label}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-medium tabular-nums">
                            {item.value}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            variants={barVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={(item.value / maxComponent) * 100}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Grouped by the component named in each finding&apos;s
                    evidence path.
                  </p>
                </Panel>

                <Panel className="p-5 lg:col-span-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Report scope</h3>
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <dl className="space-y-2.5 text-sm">
                    {[
                      ["Repository", "rintuchowdory/CurrentWeatherApp"],
                      ["Branch", "main"],
                      ["Last verified", "7 September 2026"],
                      ["Services", "4 (UI, Auth, Weather, MySQL)"],
                      ["Pipeline stages", "5 + GitOps config pipeline"],
                      ["Remediation examples", `${REMEDIATIONS.length}`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-right font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </Panel>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 02 · Architecture                                                */}
            {/* ---------------------------------------------------------------- */}
            <section id="architecture" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="02"
                  icon={Boxes}
                  kicker="Architecture"
                  title="Architecture overview"
                  description="Four Docker Compose orchestrated components: a Node.js UI, a Go auth service, a Python weather service, and MySQL."
                  action={
                    <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      4 services · 1 compose file
                    </span>
                  }
                />
              </FadeIn>

              <FadeIn>
                <Panel className="overflow-hidden p-2 sm:p-3">
                  <img
                    src={`${import.meta.env.BASE_URL}architecture-diagram.svg`}
                    alt="Architecture diagram showing the UI, auth, weather and database services"
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
                </Panel>
              </FadeIn>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {SERVICES.map((service, index) => (
                  <FadeIn key={service.title} delay={index * 0.05}>
                    <Panel className="panel-hover group h-full p-5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-white/[0.03] ${service.color}`}
                        >
                          <service.icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                          {service.badge}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold">{service.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="mt-4 space-y-1.5 border-t border-border/40 pt-3 text-xs">
                        {service.details.map(([label, value]) => (
                          <p key={label} className="flex justify-between gap-3">
                            <span className="text-muted-foreground">
                              {label}
                            </span>
                            <span className="text-right font-medium">
                              {value}
                            </span>
                          </p>
                        ))}
                      </div>
                    </Panel>
                  </FadeIn>
                ))}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 03 · CI/CD                                                       */}
            {/* ---------------------------------------------------------------- */}
            <section id="pipeline" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="03"
                  icon={Network}
                  kicker="CI / CD"
                  title="Pipeline analysis"
                  description="A five-stage Jenkins declarative pipeline, webhook-triggered on every push, with a second GitOps config pipeline."
                  action={
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Push-triggered
                    </span>
                  }
                />
              </FadeIn>

              <div className="grid gap-5 lg:grid-cols-3">
                <FadeIn className="lg:col-span-2">
                  <Panel className="h-full p-5 sm:p-6">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">
                          Jenkins declarative pipeline
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Runs on every GitHub push via the Generic Webhook
                          Trigger plugin
                        </p>
                      </div>
                      <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                        5 stages
                      </span>
                    </div>

                    <div className="relative grid gap-4 sm:grid-cols-5">
                      <div className="absolute left-[3%] right-[3%] top-5 hidden h-px bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 sm:block" />
                      {PIPELINE_STAGES.map((stage, index) => (
                        <div
                          key={stage.name}
                          className="relative flex gap-3 sm:flex-col sm:items-center sm:text-center"
                        >
                          <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-card font-mono text-xs text-primary shadow-[0_0_0_4px_rgba(11,13,20,0.9)]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-sm font-medium leading-snug">
                              {stage.name}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {stage.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </FadeIn>

                <FadeIn delay={0.08}>
                  <Panel className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <GitBranch className="h-4 w-4" />
                      </span>
                      <h3 className="font-semibold">GitOps: two-repo pattern</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Source code and deployment configuration live in separate
                      repositories. Pipeline #1 builds and pushes images; it
                      then triggers pipeline #2 in{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        CurrentWeatherApp_Config
                      </code>
                      , which applies the deployment configuration. This
                      separation keeps deploys reviewable and reproducible.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
                        <p className="text-muted-foreground">Pipeline #1</p>
                        <p className="mt-1 font-medium">Build &amp; push</p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
                        <p className="text-muted-foreground">Pipeline #2</p>
                        <p className="mt-1 font-medium">Deploy config</p>
                      </div>
                    </div>
                  </Panel>
                </FadeIn>
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 04 · Security                                                    */}
            {/* ---------------------------------------------------------------- */}
            <section id="security" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="04"
                  icon={ShieldAlert}
                  kicker="Security"
                  title="Security posture review"
                  description="Eight findings re-verified against the current code — every original issue remains unfixed."
                  action={
                    <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                      <span className="text-xs text-muted-foreground">
                        Score impact
                      </span>
                      <span className="font-mono text-sm font-semibold text-red-400 tabular-nums">
                        −{deduction}
                      </span>
                    </div>
                  }
                />
              </FadeIn>

              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <div className="flex flex-wrap items-center gap-2">
                  {(["All", "Critical", "High", "Medium"] as const).map(
                    filter => {
                      const isActive = severityFilter === filter;
                      const count =
                        filter === "All"
                          ? FINDINGS.length
                          : FINDINGS.filter(f => f.severity === filter).length;
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setSeverityFilter(filter)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          }`}
                        >
                          {filter}
                          <span
                            className={`rounded-full px-1.5 tabular-nums ${
                              isActive ? "bg-primary/20" : "bg-muted"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSections(() => {
                      if (allOpen) return { "jwt-secret": false };
                      return Object.fromEntries(
                        visibleFindings.map(f => [f.id, true])
                      );
                    })
                  }
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                >
                  {allOpen ? (
                    <ChevronsUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronsDown className="h-3.5 w-3.5" />
                  )}
                  {allOpen ? "Collapse all" : "Expand all"}
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {visibleFindings.map(finding => {
                  const styles = SEVERITY_STYLES[finding.severity];
                  const isOpen = isFindingOpen(finding.id);
                  return (
                    <FadeIn key={finding.id}>
                      <article
                        id={`finding-${finding.id}`}
                        className={`panel panel-hover h-full scroll-mt-28 rounded-2xl border-l-2 p-5 ${styles.accent}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <AlertCircle
                              className={`mt-0.5 h-5 w-5 shrink-0 ${styles.text}`}
                            />
                            <div className="min-w-0">
                              <h3 className="font-semibold">{finding.title}</h3>
                              {finding.evidence && (
                                <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                                  {finding.evidence.file}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                              />
                              {finding.severity}
                            </span>
                            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                              −{SEVERITY_DEDUCTION[finding.severity]}
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {finding.summary}
                        </p>

                        {finding.evidence && (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleFinding(finding.id)}
                              aria-expanded={isOpen}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                            >
                              {isOpen ? "Hide evidence" : "Show evidence"}
                              <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 overflow-hidden rounded-lg border border-border bg-black/40">
                                    <div className="flex items-center justify-between gap-2 border-b border-border bg-white/[0.02] px-3 py-1.5">
                                      <span className="truncate font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Evidence
                                      </span>
                                      <CopyButton value={finding.evidence.snippet} />
                                    </div>
                                    <pre className="thin-scroll overflow-x-auto p-3 font-mono text-xs leading-relaxed text-red-200/90">
                                      {finding.evidence.snippet}
                                    </pre>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </article>
                    </FadeIn>
                  );
                })}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 05 · Compliance                                                  */}
            {/* ---------------------------------------------------------------- */}
            <section id="compliance" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="05"
                  icon={Scale}
                  kicker="Compliance"
                  title="DSGVO & project updates"
                  description="Recent commits show the project moving toward German-market readiness."
                />
              </FadeIn>

              <div className="grid gap-5 md:grid-cols-3">
                {WHATS_NEW.map((item, index) => (
                  <FadeIn key={item.title} delay={index * 0.05}>
                    <Panel className="panel-hover h-full border-emerald-500/20 p-5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          <item.icon className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </Panel>
                  </FadeIn>
                ))}
              </div>

              <FadeIn>
                <Panel className="border-amber-500/25 p-5">
                  <div className="flex gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <strong className="text-foreground">Worth noting:</strong>{" "}
                      the new privacy pages are a good foundation, but the app
                      still processes personal data (usernames, MD5-hashed
                      passwords, weather queries tied to sessions). For full
                      DSGVO alignment, the security findings above —
                      particularly password hashing and TLS — should be
                      resolved, and the pages should reference the actual data
                      flows.
                    </p>
                  </div>
                </Panel>
              </FadeIn>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 06 · Recommendations                                             */}
            {/* ---------------------------------------------------------------- */}
            <section id="recommendations" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="06"
                  icon={ListChecks}
                  kicker="Recommendations"
                  title="Prioritized recommendations"
                  description="Prioritized remediation steps — the first four address the critical and high findings."
                />
              </FadeIn>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {RECOMMENDATIONS.map((rec, index) => (
                  <FadeIn key={rec.title} delay={Math.min(index * 0.04, 0.2)}>
                    <Panel
                      className={`panel-hover h-full p-5 ${
                        index < 4 ? "border-l-2 border-l-primary/70" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {index < 4 ? (
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Priority
                          </span>
                        ) : (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Follow-up
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-sm font-semibold">{rec.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {rec.text}
                      </p>
                    </Panel>
                  </FadeIn>
                ))}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 07 · Remediation                                                 */}
            {/* ---------------------------------------------------------------- */}
            <section id="remediation" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="07"
                  icon={Wrench}
                  kicker="Remediation"
                  title="Remediation playbook"
                  description="Concrete before/after fixes for the critical and high findings — copy the corrected code straight into the repo."
                  action={
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      <Code2 className="h-3.5 w-3.5" />
                      {REMEDIATIONS.length} copy-ready fixes
                    </span>
                  }
                />
              </FadeIn>

              <div className="grid gap-5 xl:grid-cols-2">
                {REMEDIATIONS.map(item => (
                  <FadeIn key={item.id}>
                    <Panel className="h-full border-l-2 border-l-emerald-500/70 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Wrench className="h-4 w-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">
                          Addresses:
                        </span>
                        {item.fixes.map(id => {
                          const target = FINDINGS.find(f => f.id === id);
                          if (!target) return null;
                          return (
                            <a
                              key={id}
                              href={`#finding-${id}`}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition hover:opacity-80 ${SEVERITY_STYLES[target.severity].badge}`}
                            >
                              {target.title}
                            </a>
                          );
                        })}
                      </div>
                      <div className="mt-3">
                        <DiffBlock
                          before={item.before}
                          after={item.after}
                          language={item.language}
                        />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {item.note}
                      </p>
                    </Panel>
                  </FadeIn>
                ))}
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* 08 · Conclusion                                                  */}
            {/* ---------------------------------------------------------------- */}
            <section id="conclusion" className="scroll-mt-28 space-y-6">
              <FadeIn>
                <SectionHeader
                  index="08"
                  icon={FileCheck2}
                  kicker="Conclusion"
                  title="Conclusion"
                />
              </FadeIn>

              <FadeIn>
                <Panel className="overflow-hidden p-6 sm:p-8">
                  <p className="max-w-4xl leading-relaxed text-muted-foreground">
                    CurrentWeatherApp is a well-structured microservices
                    project: clean separation of UI, auth, and weather concerns,
                    Docker Compose orchestration, and a genuinely thoughtful
                    Jenkins/GitOps delivery pipeline. The compliance work added
                    in 2026 (Datenschutz, Impressum, Flask 3.0) shows the
                    project is actively maintained. The security debt, however,
                    is significant and unchanged — hardcoded and leaked secrets,
                    MD5 password hashing, and SQL injection are all still
                    exploitable today. Fixing the first four recommendations
                    would transform the risk profile; adding dependency hygiene
                    would keep it that way — the remediation playbook above
                    shows exactly how.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {FINDINGS.length} findings documented
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      <Code2 className="h-3.5 w-3.5 text-primary" />
                      Evidence with file &amp; line references
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      <CalendarCheck2 className="h-3.5 w-3.5 text-primary" />
                      Verified 7 Sep 2026
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 print:hidden">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      <Printer className="h-4 w-4" />
                      Export the report
                    </button>
                    <a
                      href="https://github.com/rintuchowdory/CurrentWeatherApp"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                      Open repository
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </Panel>
              </FadeIn>
            </section>
          </main>

          <footer className="border-t border-border/70 px-4 py-8 sm:px-6 lg:px-8 print:border-0">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
              <p>
                CurrentWeatherApp analysis report · v3 · Re-verified 7 September
                2026
              </p>
              <p className="flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" />
                Static dashboard · no tracking · built with React &amp; Vite
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
