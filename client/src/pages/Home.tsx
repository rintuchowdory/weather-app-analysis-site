import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  CalendarCheck2,
  CheckCircle2,
  Code2,
  Database,
  FileCheck2,
  GitBranch,
  Lock,
  Printer,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type Severity = "Critical" | "High" | "Medium";

const SEVERITY_STYLES: Record<Severity, { badge: string; border: string; text: string }> = {
  Critical: {
    badge: "bg-red-500/10 text-red-400 border border-red-500/30",
    border: "border-l-red-500",
    text: "text-red-400",
  },
  High: {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    border: "border-l-amber-500",
    text: "text-amber-400",
  },
  Medium: {
    badge: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30",
    border: "border-l-yellow-400",
    text: "text-yellow-300",
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
        The JWT signing key (<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-red-300">xco0sr0fh4e52x03g9mv</code>) is hardcoded in both the auth and UI services. Anyone with repository access can forge valid session tokens, and the key cannot be rotated without a re-release.
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
        docker-compose.yaml uses a weak, easily guessable password (<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-red-300">unprotectedP@ssword</code>) for the MySQL root user and the auth service connection, stored in plaintext in the repository.
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
        User passwords are hashed with MD5 in both the registration handler and the database layer. MD5 is cryptographically broken and highly susceptible to rainbow-table and collision attacks.
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
        All queries are built with <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">fmt.Sprintf</code> string formatting instead of parameterized statements. The login lookup interpolates the username directly, enabling classic SQL injection.
      </>
    ),
    evidence: {
      file: "auth/src/authdb/authdb.go (lines 40, 49)",
      snippet: "db.Query(fmt.Sprintf(\"SELECT * FROM auth.users where user_name = '%s'\", user_name))",
    },
  },
  {
    id: "cors",
    title: "Permissive CORS Configuration",
    severity: "High",
    summary: (
      <>
        CORS allows all origins (<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">AllowOrigins: []string{"{\"*\"}"}</code>), exposing the API to cross-site requests from any domain and widening the CSRF attack surface.
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
        The RapidAPI key for the weather service is committed in plaintext to docker-compose.yaml, making it publicly usable and liable to quota abuse.
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
        The auth service uses <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">github.com/dgrijalva/jwt-go</code>, archived since 2020 and affected by CVE-2020-26160 (audience verification bypass). The maintained fork <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">golang-jwt/jwt</code> is a drop-in replacement.
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
        The weather service pins <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Flask_Cors==3.0.10</code> (several majors behind) and <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">requests==2.26.0</code> (from 2021). Both have accumulated security and compatibility fixes since.
      </>
    ),
    evidence: {
      file: "weather/requirements.txt (lines 1–3)",
      snippet: "Flask==3.0.0 · Flask_Cors==3.0.10 · requests==2.26.0",
    },
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
  { name: "Cleanup Workspace", text: "Wipes the Jenkins workspace so every build starts from a clean state" },
  { name: "Checkout Git Repo", text: "Clones the source from the GitHub repository (push-triggered via Generic Webhook Trigger)" },
  { name: "Build Docker Images", text: "Builds images for the auth, UI, and weather services, tagged with build number and latest" },
  { name: "Push to DockerHub", text: "Logs into DockerHub and pushes the freshly built images" },
  { name: "Trigger Config Pipeline", text: "Starts the second pipeline in the CurrentWeatherApp_Config repo for GitOps-based deployment" },
];

const SERVICES = [
  {
    icon: Server,
    color: "text-sky-400",
    title: "UI Service",
    description: "Node.js/Express service serving the web interface, managing sessions via JWTs, and proxying requests to the auth and weather services.",
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
    description: "Go service (Gin) handling registration and login against MySQL, issuing JWTs for sessions.",
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
    description: "Python/Flask service providing weather data by querying the weatherapi.com endpoint via RapidAPI.",
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
    description: "MySQL instance used by the auth service to store registered users, persisted via a Docker volume.",
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

function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ id, kicker, title, description }: { id: string; kicker: string; title: string; description?: string }) {
  return (
    <div id={id} className="scroll-mt-24 mb-8">
      <p className="text-sm font-mono uppercase tracking-widest text-primary mb-2">{kicker}</p>
      <h2 className="text-3xl font-bold text-foreground">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  );
}

export default function Home() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const isFindingOpen = (id: string) => expandedSections[id] ?? id === "jwt-secret";

  const toggleFinding = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !isFindingOpen(id) }));
  };

  const counts = {
    critical: FINDINGS.filter(f => f.severity === "Critical").length,
    high: FINDINGS.filter(f => f.severity === "High").length,
    medium: FINDINGS.filter(f => f.severity === "Medium").length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <a href="#top" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}weather-logo.svg`} alt="Logo" className="h-8 w-8 rounded-md" />
            <h1 className="text-lg font-bold tracking-tight">CurrentWeatherApp <span className="text-muted-foreground font-medium">Analysis</span></h1>
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition">Architecture</a>
            <a href="#cicd" className="text-sm text-muted-foreground hover:text-foreground transition">CI/CD</a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition">Security</a>
            <a href="#compliance" className="text-sm text-muted-foreground hover:text-foreground transition">Compliance</a>
            <a href="#recommendations" className="text-sm text-muted-foreground hover:text-foreground transition">Recommendations</a>
          </nav>
          <Badge className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            Re-verified Sep 2026
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative overflow-hidden py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/10 font-mono">Technical Analysis Report · v2</Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              CurrentWeatherApp
              <span className="block mt-2 text-2xl md:text-3xl font-semibold text-muted-foreground">Architecture, CI/CD &amp; Security Review</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              A code-level analysis of the three-service weather application — re-verified against the current repository state, with every finding traced to an exact file and line.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="#security">
                  Read the findings
                  <ArrowDown className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button variant="outline" className="border-border hover:bg-muted" onClick={() => window.print()}>
                <Printer className="mr-2 w-4 h-4" />
                Print / Save as PDF
              </Button>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Critical findings", value: counts.critical, style: "text-red-400" },
                { label: "High findings", value: counts.high, style: "text-amber-400" },
                { label: "Medium findings", value: counts.medium, style: "text-yellow-300" },
                { label: "Recommendations", value: RECOMMENDATIONS.length, style: "text-emerald-400" },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                  <p className={`text-3xl font-bold ${stat.style}`}>{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container pb-16">
        {/* Introduction */}
        <FadeIn className="mb-20">
          <SectionHeading
            id="introduction"
            kicker="01 · Overview"
            title="Introduction"
            description="What this report covers and what changed since the last review."
          />
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  This report analyzes the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">CurrentWeatherApp</code> GitHub repository: a multi-service application that displays current weather information, with user authentication and a web UI. The review covers the service architecture, the Jenkins-based GitOps CI/CD pipeline, the Docker setup, and the security posture. All findings were re-verified against the current <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">main</code> branch on 7 September 2026 — every security issue from the original review is still present, alongside a few new observations.
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  What&apos;s new since the last review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {WHATS_NEW.map(item => (
                  <div key={item.title} className="flex gap-3">
                    <item.icon className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Architecture Section */}
        <FadeIn className="mb-20">
          <SectionHeading
            id="architecture"
            kicker="02 · Architecture"
            title="Architecture Overview"
            description="Four Docker-Compose orchestrated components: a Node.js UI, a Go auth service, a Python weather service, and MySQL."
          />
          <div className="mb-8">
            <img src={`${import.meta.env.BASE_URL}architecture-diagram.svg`} alt="Architecture Diagram" className="w-full rounded-lg border border-border shadow-sm" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map(service => (
              <Card key={service.title} className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className={`w-5 h-5 ${service.color}`} />
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="space-y-1.5 text-sm">
                    {service.details.map(([label, value]) => (
                      <p key={label} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-right">{value}</span>
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        {/* CI/CD Section */}
        <FadeIn className="mb-20">
          <SectionHeading
            id="cicd"
            kicker="03 · CI/CD"
            title="Pipeline Analysis"
            description="A five-stage Jenkins declarative pipeline, webhook-triggered on every push, with a second GitOps config pipeline."
          />
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Jenkins Declarative Pipeline</CardTitle>
                <CardDescription>Runs on every GitHub push via the Generic Webhook Trigger plugin</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-6 border-l border-border ml-3 pl-6">
                  {PIPELINE_STAGES.map((stage, i) => (
                    <li key={stage.name} className="relative">
                      <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-card text-[10px] font-mono text-primary">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold">{stage.name}</h4>
                      <p className="text-sm text-muted-foreground">{stage.text}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  GitOps: two-repo pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Source code and deployment configuration live in separate repositories. Pipeline #1 builds and pushes images; it then triggers pipeline #2 in <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">CurrentWeatherApp_Config</code>, which applies the deployment configuration. This separation keeps deploys reviewable and reproducible.
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Security Section */}
        <FadeIn className="mb-20">
          <SectionHeading
            id="security"
            kicker="04 · Security"
            title="Security Posture Review"
            description="Eight findings re-verified against the current code — every original issue remains unfixed."
          />
          <div className="space-y-4">
            {FINDINGS.map(finding => {
              const styles = SEVERITY_STYLES[finding.severity];
              const isOpen = isFindingOpen(finding.id);
              return (
                <Card key={finding.id} className={`border-l-4 ${styles.border} bg-card`}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className={`w-5 h-5 ${styles.text}`} />
                        {finding.title}
                      </CardTitle>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}>
                        {finding.severity}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{finding.summary}</p>
                    {finding.evidence && (
                      <>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => toggleFinding(finding.id)}>
                          {isOpen ? "Hide evidence" : "Show evidence"}
                        </Button>
                        {isOpen && (
                          <div className="mt-3 rounded-md border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed overflow-x-auto">
                            <p className="text-muted-foreground">{finding.evidence.file}</p>
                            <p className="mt-1 text-foreground whitespace-pre-wrap">{finding.evidence.snippet}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* Compliance & Updates Section */}
        <FadeIn className="mb-20">
          <SectionHeading
            id="compliance"
            kicker="05 · Compliance"
            title="DSGVO & Project Updates"
            description="Recent commits show the project moving toward German-market readiness."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {WHATS_NEW.map(item => (
              <Card key={item.title} className="border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 border-primary/25">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground leading-relaxed flex gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
                <span>
                  <strong className="text-foreground">Worth noting:</strong> the new privacy pages are a good foundation, but the app still processes personal data (usernames, MD5-hashed passwords, weather queries tied to sessions). For full DSGVO alignment, the security findings above — particularly password hashing and TLS — should be resolved, and the pages should reference the actual data flows.
                </span>
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Recommendations Section */}
        <FadeIn className="mb-20">
          <SectionHeading
            id="recommendations"
            kicker="06 · Recommendations"
            title="Recommendations"
            description="Prioritized remediation steps — the first four address the critical and high findings."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {RECOMMENDATIONS.map((rec, i) => (
              <Card key={rec.title} className="border-l-4 border-l-primary hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-mono text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {rec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        {/* Conclusion */}
        <FadeIn>
          <SectionHeading id="conclusion" kicker="07 · Conclusion" title="Conclusion" />
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                CurrentWeatherApp is a well-structured microservices project: clean separation of UI, auth, and weather concerns, Docker Compose orchestration, and a genuinely thoughtful Jenkins/GitOps delivery pipeline. The compliance work added in 2026 (Datenschutz, Impressum, Flask 3.0) shows the project is actively maintained. The security debt, however, is significant and unchanged — hardcoded and leaked secrets, MD5 password hashing, and SQL injection are all still exploitable today. Fixing the first four recommendations would transform the risk profile; adding dependency hygiene would keep it that way.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge variant="outline" className="gap-1.5 border-border text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 8 findings documented
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-border text-muted-foreground">
                  <Code2 className="w-3.5 h-3.5 text-primary" /> Evidence with file &amp; line references
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-border text-muted-foreground">
                  <CalendarCheck2 className="w-3.5 h-3.5 text-primary" /> Verified 7 Sep 2026
                </Badge>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>CurrentWeatherApp Analysis Report · v2 · Re-verified 7 September 2026</p>
          <p>
            Analyzed repository:{" "}
            <a href="https://github.com/rintuchowdory/CurrentWeatherApp" className="text-primary hover:underline">
              github.com/rintuchowdory/CurrentWeatherApp
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
