import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Code2, GitBranch, Lock, Server } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}weather-logo.svg`} alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-foreground">CurrentWeatherApp Analysis</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition">Architecture</a>
            <a href="#cicd" className="text-sm text-muted-foreground hover:text-foreground transition">CI/CD</a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition">Security</a>
            <a href="#recommendations" className="text-sm text-muted-foreground hover:text-foreground transition">Recommendations</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              CurrentWeatherApp
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              A comprehensive technical analysis covering architecture, CI/CD pipeline, Docker setup, and security posture
            </p>
            <div className="flex gap-4">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                View Full Report
              </Button>
              <Button variant="outline">
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-16">
        {/* Introduction */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6">Introduction</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                This report provides a comprehensive analysis of the <code className="bg-muted px-2 py-1 rounded text-sm font-mono">CurrentWeatherApp</code> GitHub repository, focusing on its architecture, CI/CD pipeline, Docker setup, and security posture. The project is a multi-service application designed to display current weather information, featuring user authentication and a web-based user interface.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6">Architecture Overview</h2>
          
          <div className="mb-8">
            <img src={`${import.meta.env.BASE_URL}architecture-diagram.svg`} alt="Architecture Diagram" className="w-full rounded-lg border border-border shadow-sm" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  UI Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Node.js/Express service handling the web interface, session management via JWTs, and proxying to backend services.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Port:</strong> 3000</p>
                  <p><strong>Framework:</strong> Express.js</p>
                  <p><strong>Key Dependencies:</strong> axios, cookie-parser, jsonwebtoken</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  Auth Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Go service managing user authentication and registration with MySQL database integration.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Port:</strong> 8080</p>
                  <p><strong>Language:</strong> Go</p>
                  <p><strong>Database:</strong> MySQL</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-green-600" />
                  Weather Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Python/Flask service providing weather data by querying external APIs.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Port:</strong> 5000</p>
                  <p><strong>Framework:</strong> Flask</p>
                  <p><strong>API:</strong> weatherapi.com via RapidAPI</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-slate-600" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  MySQL database instance used by the auth service for storing user data.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> MySQL</p>
                  <p><strong>Storage:</strong> Persistent Volume</p>
                  <p><strong>Used By:</strong> Auth Service</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CI/CD Section */}
        <section id="cicd" className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6">CI/CD Pipeline Analysis</h2>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Jenkins Declarative Pipeline</CardTitle>
              <CardDescription>Five-stage automated build and deployment process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <Badge className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Cleanup Workspace</h4>
                    <p className="text-sm text-muted-foreground">Cleans the Jenkins workspace before starting the build</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Badge className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Checkout Git Repo</h4>
                    <p className="text-sm text-muted-foreground">Clones the source code from the GitHub repository</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Badge className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Build Docker Images</h4>
                    <p className="text-sm text-muted-foreground">Builds Docker images for auth, UI, and weather services with build number and latest tags</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Badge className="mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Push Docker Images to DockerHub</h4>
                    <p className="text-sm text-muted-foreground">Logs into DockerHub and pushes newly built images to the aakkiiff repository</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Badge className="mt-1">5</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Triggering the Config Pipeline</h4>
                    <p className="text-sm text-muted-foreground">Triggers a separate Jenkins pipeline for GitOps-based deployment configuration</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6">Security Posture Review</h2>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Hardcoded Secrets
                </CardTitle>
                <Badge variant="destructive" className="w-fit">Critical</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  The JWT secret key (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">xco0sr0fh4e52x03g9mv</code>) is hardcoded in the auth service and UI service. This makes it easily discoverable and difficult to rotate.
                </p>
                <Button variant="ghost" size="sm" onClick={() => toggleSection('hardcoded')}>
                  {expandedSections['hardcoded'] ? 'Hide Details' : 'Show Details'}
                </Button>
                {expandedSections['hardcoded'] && (
                  <div className="mt-4 pt-4 border-t border-border text-xs bg-muted p-3 rounded font-mono overflow-x-auto">
                    <p>File: auth/src/main/main.go (line 18)</p>
                    <p>const secretkey string = "xco0sr0fh4e52x03g9mv"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Weak Database Password
                </CardTitle>
                <Badge variant="destructive" className="w-fit">Critical</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  The docker-compose.yaml file uses a weak, easily guessable password (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">unprotectedP@ssword</code>) for the MySQL root user and exposes it directly in the configuration file.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  MD5 Password Hashing
                </CardTitle>
                <Badge variant="destructive" className="w-fit">Critical</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  User passwords are hashed using MD5, which is cryptographically broken and highly susceptible to collision attacks and rainbow table attacks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  SQL Injection Vulnerability
                </CardTitle>
                <Badge className="w-fit bg-amber-600">High</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  SQL queries are constructed using string formatting (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">fmt.Sprintf</code>) instead of parameterized queries, making the application vulnerable to SQL injection attacks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  Permissive CORS Configuration
                </CardTitle>
                <Badge className="w-fit bg-amber-600">High</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  CORS is configured to allow all origins (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">AllowOrigins: []string{"*"}</code>), which can expose the API to CSRF attacks.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  Exposed API Key
                </CardTitle>
                <Badge className="w-fit bg-amber-600">High</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  The RapidAPI key for the weather service is hardcoded in the docker-compose.yaml file, making it publicly visible in the repository.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recommendations Section */}
        <section id="recommendations" className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6">Recommendations</h2>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Secret Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Implement a secure secret management solution (Kubernetes Secrets, HashiCorp Vault, AWS Secrets Manager) to store and inject sensitive information. Avoid hardcoding secrets in the codebase or configuration files.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Strong Password Hashing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Replace MD5 with a modern, strong password hashing algorithm such as bcrypt, scrypt, or Argon2. These algorithms are designed to be computationally intensive, making brute-force attacks significantly harder.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Parameterized Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Refactor database interactions to use parameterized queries or prepared statements instead of string formatting. This is the most effective way to prevent SQL injection vulnerabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Restricted CORS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Restrict CORS AllowOrigins to only trusted domains in production environments. Avoid using wildcard (*) unless absolutely necessary and with proper understanding of the security implications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  HTTPS Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure HTTPS for all external and internal communication to encrypt data in transit. Use a reverse proxy like Nginx or Caddy with Let's Encrypt for SSL/TLS certificates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Input Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Implement robust input validation on both client and server sides for all user inputs to prevent various attacks, including injection and cross-site scripting (XSS).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-6">Conclusion</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                The CurrentWeatherApp demonstrates a microservices architecture with separate services for UI, authentication, and weather data, orchestrated via Docker Compose and managed with a Jenkins CI/CD pipeline. While the project provides a functional application, it exhibits several critical security vulnerabilities, particularly concerning secret management, password hashing, and SQL injection risks. Addressing these issues with the recommended practices will significantly enhance the application's security posture and overall reliability.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>CurrentWeatherApp Analysis Report | Generated by Manus AI</p>
          <p className="mt-2">For more information, visit the <a href="https://github.com/rintuchowdory/CurrentWeatherApp" className="text-accent hover:underline">GitHub repository</a></p>
        </div>
      </footer>
    </div>
  );
}
