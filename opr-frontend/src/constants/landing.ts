import { Bot, Workflow, Zap, Shield, Globe, Puzzle, TrendingUp, Clock, Users } from "lucide-react";
import { FaCloud, FaCogs, FaJava } from "react-icons/fa";
import { MdApi } from "react-icons/md";
import { SiFastapi, SiLangchain } from "react-icons/si";
import {
  SiDocker,
  SiGit,
  SiGraphql,
  SiNextdotjs,
  SiPostgresql,
  SiSpringboot,
  SiTypescript,
} from "react-icons/si";

export const featuresData = [
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

export const statsData = [
  { icon: TrendingUp, value: "2,400+", label: "Workflows built", color: "#06b6d4" },
  { icon: Clock, value: "1.8s", label: "Avg execution time", color: "#a78bfa" },
  { icon: Users, value: "500+", label: "Teams using AutoWeave", color: "#22c55e" },
  { icon: Zap, value: "99.9%", label: "Platform uptime", color: "#f59e0b" },
];

export const creatorData = [
  {
    name: "Saumya",
    email: "saumyasood27@gmail.com",
    linkdin: "https://www.linkedin.com/in/saumya-sood-875837332/",
    github: "https://github.com/Marcella2706",
    about:
      "Full Stack Developer with expertise in both TypeScript and Java. Proficient in building scalable web applications using Next.js for frontend and Spring Boot for backend. Experienced in designing robust APIs with GraphQL and integrating modern technologies across the stack.",
    techUsed: [
      { icon: FaJava, name: "Java" },
      { icon: SiSpringboot, name: "Spring Boot" },
      { icon: SiGraphql, name: "GraphQL" },
      { icon: MdApi, name: "REST APIs" },
      { icon: SiPostgresql, name: "PostgreSQL" },
      { icon: SiTypescript, name: "TypeScript" },
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: SiDocker, name: "Docker" },
      { icon: FaCloud, name: "Cloud" },
    ],
    imageUrl: "finalSaumya.png",
  },
  {
    name: "Vishwas",
    email: "kaixoxerl@gmail.com",
    linkdin: "https://www.linkedin.com/in/vishwas-pahwa-694928328/",
    github: "https://github.com/ScorchedPearl",
    about:
      "Full Stack Developer skilled in TypeScript with experience building various projects such as PostPearl. Adept in both frontend and backend development, and highly proficient in DevOps practices including Docker, CI/CD, and cloud deployment.",
    techUsed: [
      { icon: SiTypescript, name: "TypeScript" },
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: SiDocker, name: "Docker" },
      { icon: FaCogs, name: "DevOps" },
      { icon: FaCloud, name: "Cloud" },
      { icon: SiGit, name: "Git" },
      { icon: FaJava, name: "Java" },
      { icon: SiGraphql, name: "GraphQL" },
      { icon: SiFastapi, name: "FastAPI" },
      { icon: SiLangchain, name: "LangChain" },
      { icon: SiPostgresql, name: "PostgreSQL" },
    ],
    imageUrl: "vishwasfinal.png",
  },
  {
    name: "Ayushi Jaseja",
    email: "ajseja7@gmail.com",
    linkdin: "https://linkedin.com/in/ayushi-jaseja",
    github: "https://github.com/ayushijaseja",
    about:
      "Full Stack Developer. Experienced in creating beautiful and scalable web applications.",
    techUsed: [
      { icon: SiTypescript, name: "TypeScript" },
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: FaCloud, name: "Cloud" },
    ],
    imageUrl: "ayushi.png",
  },
  {
    name: "Vadik Kathal",
    email: "john@example.com",
    linkdin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    about:
      "Software Engineer with a passion for learning new technologies.",
    techUsed: [
      { icon: FaJava, name: "Java" },
      { icon: SiDocker, name: "Docker" },
    ],
    imageUrl: "vaidik.png",
  },
  {
    name: "Suvanwita Das",
    email: "jane@example.com",
    linkdin: "https://linkedin.com/in/janesmith",
    github: "https://github.com/janesmith",
    about:
      "Frontend Developer specializing in React and modern UI/UX design.",
    techUsed: [
      { icon: SiTypescript, name: "TypeScript" },
      { icon: SiNextdotjs, name: "Next.js" },
    ],
    imageUrl: "suvanwita.png",
  },
];
