import { ShieldCheck, Lock, Eye, KeyRound, Database, Activity } from "lucide-react";
import Header from "../_landingPage/header";
import Footer from "../_landingPage/footer";

const securityPillars = [
  {
    icon: ShieldCheck,
    title: "Enterprise-grade protection",
    description:
      "AutoWeave enforces strict security controls across workflow orchestration, API integrations, and runtime execution layers.",
    color: "#22c55e",
  },
  {
    icon: Lock,
    title: "End-to-end encryption",
    description:
      "Sensitive payloads are protected in transit and at rest using modern encryption standards and secure key handling.",
    color: "#06b6d4",
  },
  {
    icon: Eye,
    title: "Audit visibility",
    description:
      "Execution traces and security logs help teams monitor access, investigate anomalies, and maintain accountability.",
    color: "#a78bfa",
  },
];

const controls = [
  {
    icon: KeyRound,
    title: "Role-based access control",
    detail: "Granular permissions for builders, reviewers, and admins.",
  },
  {
    icon: Database,
    title: "Data isolation",
    detail: "Workflow and user data scoped to authorized contexts and services.",
  },
  {
    icon: Activity,
    title: "Operational monitoring",
    detail: "Real-time health checks and suspicious activity tracking.",
  },
];

export default function SecurityPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-28">
      <Header/>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-sm font-medium text-muted-foreground">Security</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground md:text-6xl">Security at AutoWeave</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Built for teams that require trust, control, and reliability at every stage of automation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {securityPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-400 hover:border-foreground/20 hover:bg-secondary"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${pillar.color}1F, transparent 60%)`,
                }}
              />
              <div
                className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${pillar.color}20`,
                  border: `1px solid ${pillar.color}40`,
                }}
              >
                <pillar.icon className="h-5 w-5" style={{ color: pillar.color }} />
              </div>
              <h2 className="relative mb-2 text-lg font-semibold text-foreground">{pillar.title}</h2>
              <p className="relative text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(to right, transparent, ${pillar.color}90, transparent)`,
                }}
              />
            </article>
          ))}
        </div>

        <section className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-400 hover:border-foreground/20 hover:bg-secondary/70 md:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.10), transparent 62%)" }} />
          <h2 className="relative text-2xl font-semibold text-foreground md:text-3xl">Core security controls</h2>
          <div className="relative mt-6 grid gap-4 md:grid-cols-3">
            {controls.map((control) => (
              <div key={control.title} className="rounded-2xl border border-border bg-card p-5">
                <control.icon className="mb-3 h-5 w-5 text-cyan-500" />
                <h3 className="text-base font-semibold text-foreground">{control.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{control.detail}</p>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-400 group-hover:opacity-100" style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.55), transparent)" }} />
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 text-center md:p-10">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Security-first by design</h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
            AutoWeave is continuously improved with secure defaults, proactive monitoring, and defense-in-depth practices so your workflows remain resilient in production.
          </p>
        </section>
      </div>
      <Footer/>
    </section>
  );
}
