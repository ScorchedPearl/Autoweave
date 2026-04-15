"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import Header from "../_landingPage/header";
import Footer from "../_landingPage/footer";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const creators = [
  {
    name: "Vishwas Pahwa",
    role: "Lead Systems Architect",
    about: "The real magic of AutoWeave happens in the orchestration. Integrating Kahn’s algorithm allowed us to handle complex, non-linear dependencies, ensuring that every agentic workflow executes in the exact logical order required for enterprise-grade stability.",
  },
  {
    name: "Saumya Sood",
    role: "Backend & Infra Engineer",
    about: "Making Spring Boot, FastAPI, and Kafka talk to each other seamlessly was our biggest hurdle during the development of AutoWeave. We built a distributed system that handles high-throughput messaging while maintaining real-time context through Redis.",
  },
  {
    name: "Suvanwita Das",
    role: "Frontend Specialist",
    about: "We chose Next.js and React Flow to ensure the AutoWeave UI was as 'smart' as the backend. The goal was to take complex, autonomous agent architecture and make it accessible through an intuitive, drag-and-drop canvas for all users.",
  },
  {
    name: "Ayushi Jaseja",
    role: "AI Integration Lead",
    about: "AutoWeave is not just about calling an API; it's about autonomous execution. We focused on dynamic OpenAI configuration so users can deploy agents that think, decide, and adapt based on live data inputs throughout the workflow.",
  },
  {
    name: "Vaidik Kathal",
    role: "DevOps & Cloud Lead",
    about: "Scaling AutoWeave from a single VM to a fully containerized environment on Google Cloud with automated CI/CD pipelines was essential. We built this platform to be enterprise-ready and secure from the very first deployment.",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Ananya R.",
    role: "Founder, ScaleUp AI",
    quote:
      "Before moving to AutoWeave, our team was drowning in fragmented scripts that required constant manual oversight. Integrating an autonomous agentic loop felt like an unreachable goal for a non-technical founder like myself. However, the intuitive drag-and-drop nodes allowed us to architect our first complex workflow in a single afternoon. The real breakthrough came when we realized how the platform handles state; seeing our agents maintain context across multiple decision-making nodes was the 'aha' moment. We’ve successfully cut our operational response time by nearly 60% since adopting this stack. It’s not just a tool; it has become the central nervous system of our entire customer lifecycle management.",
  },
  {
    name: "Michael T.",
    role: "Lead Product Manager",
    quote:
      "I’ve spent years working with Zapier and Make, but they always hit a ceiling when we tried to implement true AI decision-making. AutoWeave is in a league of its own. The engineering team has clearly prioritized reliability—the dependency-based execution, powered by Kahn’s algorithm, ensures that our most complex DAGs run with surgical precision every single time. We no longer worry about race conditions or stalled executions in our backend. Even during high-traffic periods, the Kafka-driven orchestration keeps everything moving smoothly. It’s rare to find a no-code platform that doesn’t sacrifice depth for simplicity, but this team has managed to build an enterprise-grade engine that actually scales with our growth.",
  },
  {
    name: "Priya K.",
    role: "Automation Architect",
    quote:
      "What sets AutoWeave apart is the sheer technical transparency and the robustness of the underlying architecture. As an engineer, I was initially skeptical of another 'no-code' solution, but once I saw the Spring Boot and FastAPI integration, I knew this was different. The platform allows us to inject custom OpenAI configurations directly into a Start Node, giving us granular control over how our agents think and execute. The real-time context provided by the Redis layer means our agents don’t just perform isolated tasks; they understand the narrative of the entire workflow. It’s the perfect blend of high-level abstraction and low-level control, allowing us to build sophisticated AI tools without the typical overhead of a massive dev team.",
  },
  {
    name: "David L.",
    role: "Solutions Consultant",
    quote:
      "Implementing AutoWeave for our enterprise clients has been a revelation in terms of ROI and deployment speed. Most 'agentic' platforms are either too academic or too buggy for production use, but the AutoWeave ecosystem is built on a bedrock of stability. We recently deployed a multi-stage data analysis workflow that involves complex branching logic based on LLM outputs. In any other system, this would have been a nightmare to debug, but here, the visual interface makes troubleshooting instant. The way the platform utilizes Google Cloud infrastructure ensures that latency is never an issue, even for our global clients. It has completely redefined what we think is possible with no-code automation, moving us from 'if-this-then-that' to true autonomous agency.",
  },
  {
    name: "Sara M.",
    role: "Independent SaaS Developer",
    quote:
      "As a solo developer, my most valuable asset is time. AutoWeave has essentially acted as a force multiplier for my business. I was able to set up a fully containerized, AI-driven content pipeline that handles everything from research to social media scheduling without writing a single line of backend logic. The 'Advanced' login process was a minor step compared to the massive power I gained once inside the dashboard. The UI is incredibly polished, and the transition between the Next.js frontend and the FastAPI execution layer is invisible and fast. It feels like having a team of senior backend engineers working for me in the background. If you're looking to leverage AI agents at scale without the technical debt, this is the only platform that truly delivers on that promise.",
  },
];

const CreatorWordCard = ({
  name,
  role,
  about,
  delay,
}: {
  name: string;
  role: string;
  about: string;
  delay: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-400 hover:border-foreground/20 hover:bg-secondary"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.10),transparent_60%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
      <h3 className="relative z-10 text-xl font-semibold text-foreground">
        {name}
      </h3>
      <p className="relative z-10 text-xs font-medium uppercase tracking-wider text-cyan-500">
        {role}
      </p>
      <p className="relative z-10 mt-3 text-sm leading-relaxed text-muted-foreground">
        “{about}”
      </p>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[linear-gradient(to_right,transparent,rgba(6,182,212,0.4),transparent)] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
    </motion.article>
  );
};

export default function BlogPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const headerRef = useRef(null);
  const creatorsRef = useRef(null);
  const testimonialRef = useRef(null);
  const formRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true });
  const creatorsInView = useInView(creatorsRef, { once: true });
  const testimonialInView = useInView(testimonialRef, { once: true });
  const formInView = useInView(formRef, { once: true });

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-28">
      <Header />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2"
          >
            <div className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Blog
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-foreground md:text-6xl"
          >
            Stories from our creators & users
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
          >
            Read insights from the AutoWeave team, browse detailed testimonials, and share your own automation success stories.
          </motion.p>
        </div>

        <div
          ref={creatorsRef}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-400 hover:border-foreground/20 hover:bg-secondary/70 md:p-10"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.12), transparent 62%)",
            }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={creatorsInView ? { opacity: 1, y: 0 } : {}}
            className="text-2xl font-semibold text-foreground md:text-3xl"
          >
            Words from the AutoWeave team
          </motion.h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator, index) => (
              <CreatorWordCard
                key={creator.name}
                name={creator.name}
                role={creator.role}
                about={creator.about}
                delay={index * 0.06}
              />
            ))}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(6,182,212,0.55), transparent)",
            }}
          />
        </div>

        <motion.div
          ref={testimonialRef}
          initial={{ opacity: 0, y: 20 }}
          animate={testimonialInView ? { opacity: 1, y: 0 } : {}}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-400 hover:border-foreground/20 hover:bg-secondary/70 md:p-10"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(167,139,250,0.14), transparent 62%)",
            }}
          />
          <div className="relative flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              User stories
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-border bg-secondary p-2 text-foreground transition hover:bg-secondary/80"
                onClick={() =>
                  setTestimonialIndex(
                    (prev) =>
                      (prev - 1 + testimonials.length) % testimonials.length,
                  )
                }
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-border bg-secondary p-2 text-foreground transition hover:bg-secondary/80"
                onClick={() =>
                  setTestimonialIndex(
                    (prev) => (prev + 1) % testimonials.length,
                  )
                }
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <article className="relative z-10 mt-6 min-h-[320px] overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(167,139,250,0.1),transparent_55%)]" />
            <motion.p 
              key={testimonialIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative text-base italic leading-relaxed text-foreground md:text-lg"
            >
              “{testimonials[testimonialIndex].quote}”
            </motion.p>
            <p className="relative mt-8 text-sm font-medium text-muted-foreground">
              {testimonials[testimonialIndex].name} ·{" "}
              {testimonials[testimonialIndex].role}
            </p>
          </article>

          <div className="mt-5 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                onClick={() => setTestimonialIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  testimonialIndex === index ? "bg-cyan-500" : "bg-muted"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(167,139,250,0.55), transparent)",
            }}
          />
        </motion.div>

        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 20 }}
          animate={formInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-400 hover:border-foreground/20 hover:bg-secondary/70 md:p-10"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(34,197,94,0.10), transparent 62%)",
            }}
          />
          <h2 className="relative text-2xl font-semibold text-foreground md:text-3xl">
            Send your blog
          </h2>
          <p className="relative mt-2 text-muted-foreground">
            Want to be featured? Share your AutoWeave case study and we will review it.
          </p>

          <form className="relative mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-cyan-500/50 transition focus:ring"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-cyan-500/50 transition focus:ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Blog title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter your blog title"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-cyan-500/50 transition focus:ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-foreground"
              >
                Blog content
              </label>
              <textarea
                id="content"
                rows={8}
                placeholder="Paste your blog content here..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none ring-cyan-500/50 transition focus:ring"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-black transition hover:bg-cyan-400"
            >
              <Send className="h-4 w-4" />
              Send your blog
            </button>
          </form>
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(34,197,94,0.55), transparent)",
            }}
          />
        </motion.div>
      </div>
      <Footer />
    </section>
  );
}