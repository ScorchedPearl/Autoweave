"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { featuresData, statsData } from "../../constants/landing";


const FeatureCard = ({ feature }: { feature: typeof featuresData[0] }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: feature.delay }}
      className="group relative bg-card border border-border rounded-2xl p-6 hover:bg-secondary hover:border-foreground/20 transition-all duration-400 overflow-hidden cursor-default"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}10, transparent 60%)` }}
      />

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
      >
        <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `linear-gradient(to right, transparent, ${feature.color}60, transparent)` }}
      />
    </motion.div>
  );
};

const StatCard = ({ stat, index }: { stat: typeof statsData[0]; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center p-6 bg-card border border-border rounded-2xl"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: `${stat.color}15` }}
      >
        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
      <div className="text-muted-foreground text-sm">{stat.label}</div>
    </motion.div>
  );
};

const Features = () => {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="features" className="py-28 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
            <span className="text-sm text-muted-foreground font-medium">Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-5"
          >
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              automate anything
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Professional-grade tools designed for teams that demand reliability,
            security, and performance at scale.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {featuresData.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
