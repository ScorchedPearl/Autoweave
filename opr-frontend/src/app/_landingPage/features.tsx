"use client";
import { motion, useInView } from "framer-motion";
import { Bot, Workflow, Zap, Shield, Globe, Puzzle, TrendingUp, Clock, Users } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Bot,
    title: "Autonomous Agents",
    description: "Deploy AI agents that operate independently, making intelligent decisions and executing complex workflows without human intervention.",
    color: "#a78bfa",
    delay: 0,
  },
  {
    icon: Workflow,
    title: "Visual Builder",
    description: "Intuitive drag-and-drop interface that transforms complex logic into simple visual workflows. No programming experience required.",
    color: "#06b6d4",
    delay: 0.05,
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description: "Lightning-fast processing with real-time monitoring and instant feedback. Scale from prototype to production seamlessly.",
    color: "#f59e0b",
    delay: 0.1,
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption, SOC 2 compliance, and comprehensive audit trails for enterprise peace of mind.",
    color: "#22c55e",
    delay: 0.15,
  },
  {
    icon: Globe,
    title: "Universal Integrations",
    description: "Connect with 1000+ services and APIs. From databases to SaaS platforms, integrate everything in your tech stack.",
    color: "#06b6d4",
    delay: 0.2,
  },
  {
    icon: Puzzle,
    title: "Adaptive Intelligence",
    description: "Self-improving workflows that learn from patterns, optimize performance, and adapt to changing business requirements.",
    color: "#a78bfa",
    delay: 0.25,
  },
];

const stats = [
  { icon: TrendingUp, value: "2,400+", label: "Workflows built", color: "#06b6d4" },
  { icon: Clock, value: "1.8s", label: "Avg execution time", color: "#a78bfa" },
  { icon: Users, value: "500+", label: "Teams using AutoWeave", color: "#22c55e" },
  { icon: Zap, value: "99.9%", label: "Platform uptime", color: "#f59e0b" },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: feature.delay }}
      className="group relative bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/6 hover:border-white/15 transition-all duration-400 overflow-hidden cursor-default"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}10, transparent 60%)` }}
      />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
      >
        <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-white/45 text-sm leading-relaxed">{feature.description}</p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `linear-gradient(to right, transparent, ${feature.color}60, transparent)` }}
      />
    </motion.div>
  );
};

const StatCard = ({ stat, index }: { stat: typeof stats[0]; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center p-6 bg-white/3 border border-white/8 rounded-2xl"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: `${stat.color}15` }}
      >
        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
      <div className="text-white/40 text-sm">{stat.label}</div>
    </motion.div>
  );
};

const Features = () => {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="features" className="py-28 bg-gradient-to-b from-black to-[#060810] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
            <span className="text-sm text-white/55 font-medium">Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-5"
          >
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              automate anything
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/45 max-w-2xl mx-auto"
          >
            Professional-grade tools designed for teams that demand reliability,
            security, and performance at scale.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
