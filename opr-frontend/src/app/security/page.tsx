"use client";

import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  KeyRound, 
  Database, 
  Activity, 
  Cloud, 
  Cpu, 
  Zap, 
  Fingerprint 
} from "lucide-react";
import { motion } from "framer-motion";
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

const infrastructurePoints = [
  {
    icon: Cloud,
    title: "GCP Infrastructure",
    detail: "Leveraging Google Cloud's world-class data centers with physical security and redundant power/cooling.",
  },
  {
    icon: Cpu,
    title: "Isolated Execution",
    detail: "AI agents run in sandboxed environments, preventing cross-tenant data leakage during execution.",
  },
  {
    icon: Zap,
    title: "DDoS Mitigation",
    detail: "Built-in protection against network-layer attacks to ensure your workflows remain online 24/7.",
  },
];

const faqs = [
  {
    q: "How does AutoWeave handle my OpenAI API keys?",
    a: "Keys are encrypted using AES-256 and stored in a secure vault. They are only decrypted at the moment of execution and are never logged in plain text.",
  },
  {
    q: "Are my workflows isolated from other users?",
    a: "Yes. AutoWeave uses multi-tenant data isolation logic at the database and messaging (Kafka) levels to ensure no data crossover.",
  },
  {
    q: "What happens if a node fails during execution?",
    a: "Our orchestration layer uses Kafka for fault tolerance. If a worker fails, the system preserves the workflow state in Redis and attempts a secure recovery.",
  },
];

export default function SecurityPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-28">
      <Header />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 sm:px-6 lg:px-8">

        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2"
          >
            <div className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-sm font-medium text-muted-foreground">Security</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-foreground md:text-6xl"
          >
            Security at AutoWeave
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
          >
            Built for teams that require trust, control, and reliability at every stage of AI automation.
          </motion.p>
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

        <section className="grid gap-12 md:grid-cols-2 items-center rounded-3xl border border-border bg-card/40 p-8 md:p-12">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">Infrastructure Resilience</h2>
            <p className="mt-4 text-muted-foreground">
              AutoWeave is built on a foundation of secure cloud architecture. By leveraging distributed systems and containerized workers, we ensure your automation engine is as stable as it is secure.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-500 border border-cyan-500/20">
              <Fingerprint className="h-3 w-3" />
              GCP SOC3 Certified Data Centers
            </div>
          </div>
          <div className="grid gap-4">
            {infrastructurePoints.map((pt) => (
              <div key={pt.title} className="flex gap-4 p-5 rounded-2xl bg-secondary/30 border border-border hover:border-cyan-500/30 transition-colors">
                <pt.icon className="h-6 w-6 text-cyan-500 shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">{pt.title}</h4>
                  <p className="text-sm text-muted-foreground">{pt.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-400 hover:border-foreground/20 hover:bg-secondary/70 md:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.10), transparent 62%)" }} />
          <h2 className="relative text-2xl font-semibold text-foreground md:text-3xl text-center">Core security controls</h2>
          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            {controls.map((control) => (
              <div key={control.title} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg">
                <control.icon className="mb-3 h-5 w-5 text-cyan-500" />
                <h3 className="text-base font-semibold text-foreground">{control.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{control.detail}</p>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-400 group-hover:opacity-100" style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.55), transparent)" }} />
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 md:p-12 text-center md:text-left">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-semibold text-foreground">Privacy & Compliance</h2>
            <p className="mt-4 text-lg text-muted-foreground italic">
              &ldquo;Your data belongs to you. AutoWeave is designed to process your workflows without ever claiming ownership of your intellectual property or sensitive business logic.&rdquo;
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-border pt-8 text-center">
              <div>
                <h4 className="text-xl font-bold text-foreground">GDPR</h4>
                <p className="text-xs text-muted-foreground mt-1">Data Privacy Standards</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground">SOC2</h4>
                <p className="text-xs text-muted-foreground mt-1">Trust Service Criteria</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground">AES-256</h4>
                <p className="text-xs text-muted-foreground mt-1">Storage Encryption</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground">TLS 1.3</h4>
                <p className="text-xs text-muted-foreground mt-1">Secure Transit</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10 pb-10">
          <h2 className="text-center text-2xl font-semibold text-foreground md:text-3xl">Security FAQ</h2>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/50 p-6 transition hover:bg-card">
                <h3 className="text-lg font-medium text-foreground">Q: {faq.q}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-10 text-center">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Security-first by design</h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
            AutoWeave is continuously improved with secure defaults, proactive monitoring, and defense-in-depth practices so your workflows remain resilient in production.
          </p>
        </section>
      </div>
      <Footer />
    </section>
  );
}