"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Compass, 
  BrainCircuit, 
  Sparkles, 
  Layers, 
  Cpu, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  CheckCircle,
  MessageSquare,
  BookOpen,
  Route,
  Zap,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/shared/Footer";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-violet-500" />,
      title: "AI Chat Assistant",
      description: "Ask queries and receive instantly structured markdown explanations matching your course context.",
    },
    {
      icon: <BrainCircuit className="h-6 w-6 text-indigo-500" />,
      title: "Interactive Quiz Engine",
      description: "Generate customized practice quizzes dynamically on any topic to test your comprehension.",
    },
    {
      icon: <Route className="h-6 w-6 text-emerald-500" />,
      title: "Personalized Roadmap Architect",
      description: "Input any career path or technology and map out step-by-step phases with precise timelines.",
    },
    {
      icon: <Layers className="h-6 w-6 text-rose-500" />,
      title: "AI Flashcards Generator",
      description: "Extract core ideas into visual memorization decks to study faster and retain longer.",
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: "Instant Doubt Solver",
      description: "Stuck on a calculation or a code snippet? Paste it to receive detailed explanations.",
    },
    {
      icon: <Cpu className="h-6 w-6 text-sky-500" />,
      title: "AI Code Explainer",
      description: "Paste complex files to dissect time complexities, logic sequences, and refactoring pathways.",
    },
  ];

  const pricingTiers = [
    {
      name: "Student Spark",
      price: "Free",
      desc: "Perfect for casual students getting started with AI study aids.",
      features: [
        "10 AI Chat credits per day",
        "Generate up to 5 roadmaps",
        "Access to standard courses",
        "Basic progress analytics",
      ],
      cta: "Start Learning",
      href: "/signup",
      popular: false,
    },
    {
      name: "EduPilot Premium",
      price: "$19/mo",
      desc: "Our most popular tier for deep learners and exam preppers.",
      features: [
        "UNLIMITED AI Chat & Doubt Solver",
        "Unlimited Custom Quizzes & Flashcards",
        "Premium LMS Courses & PDF Downloads",
        "Advanced Analytics & Study Goal Tracker",
        "AI Interview Mock Simulator",
      ],
      cta: "Fly High with Premium",
      href: "/signup",
      popular: true,
    },
    {
      name: "Institution",
      price: "Custom",
      desc: "For colleges and bootcamps wanting customized class analytics.",
      features: [
        "Everything in Premium",
        "Admin control for curriculum creators",
        "Classroom progress & category tracking",
        "Dedicated API throughput",
        "SAML SSO Integration",
      ],
      cta: "Contact Sales",
      href: "mailto:sales@edupilot.ai",
      popular: false,
    },
  ];

  const testimonials = [
    {
      quote: "EduPilot AI completely transformed how I study. The roadmap generator helped me break down React and PostgreSQL in just 3 weeks!",
      author: "Alex Rivera",
      role: "Career Switcher, now Front-End Developer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
    },
    {
      quote: "The Code Explainer is a lifesaver. It breaks down raw algorithms line by line better than standard class tutorials.",
      author: "Devon Chen",
      role: "CS Sophomore, Boston University",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    },
    {
      quote: "As an instructor, I recommend EduPilot to all my students. The interactive quizzes keep them engaged outside class hours.",
      author: "Dr. Sarah Jenkins",
      role: "Adjunct Professor, EdTech Innovation Hub",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
    },
  ];

  const faqs = [
    {
      q: "How does the AI Learning Companion work?",
      a: "EduPilot AI uses the Google Gemini API to analyze study concepts, generate testing decks, write detailed career pathways, and answer doubts in real-time. It is linked directly to our learning management database, providing answers tailored to your active courses.",
    },
    {
      q: "Is there an Admin panel to manage curricula?",
      a: "Yes. Instructors and platform admins get a comprehensive dashboard to upload categories, write course contents, manage student profiles, and review AI analytics reports.",
    },
    {
      q: "Can I use it for programming and math courses?",
      a: "Absolutely. EduPilot includes specialized coding engines (AI Code Explainer) and step-by-step doubt solvers that handle math syntax, algorithms, and logical proofs.",
    },
    {
      q: "What is your refund policy for Premium accounts?",
      a: "We offer a 14-day money-back guarantee. If you're not satisfied, simply email our support team and we will refund your current billing cycle.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 bg-gradient-to-b from-slate-900 via-slate-950 to-background text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent_70%)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-400 border border-violet-500/25 mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Empowered by Gemini 1.5 Flash
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl"
          >
            Navigate Your Learning with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              EduPilot AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-light"
          >
            The premium AI-powered SaaS platform that builds custom roadmaps, generates interactive flashcards, answers doubts, and tracks progress.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" variant="gradient" className="flex items-center gap-2 px-8">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900/50">
                Explore Features
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-background relative z-10 border-t dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              An AI Study Buddy for Every Step
            </h2>
            <p className="text-muted-foreground mt-4">
              Unlock modular AI engines designed to accelerate vocabulary, code logic, exam prep, and career goal setting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="h-full border-slate-100 dark:border-slate-800/80 hover:-translate-y-1 transition-all bg-card/40 backdrop-blur-md">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-snug">{f.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{f.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950/20 border-t dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Trusted by Thousands of Students</h2>
            <p className="text-muted-foreground mt-3">Read how self-learners are conquering complex technical skills with EduPilot.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="border-slate-100 dark:border-slate-800 bg-background/80">
                <CardContent className="p-6 flex flex-col justify-between h-full gap-6">
                  <p className="text-sm italic leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.author} className="h-10 w-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-bold text-xs leading-none">{t.author}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background border-t dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Flexible Plans for Active Learners</h2>
            <p className="text-muted-foreground mt-3">Start with our free core study tier and upgrade as your learning targets grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((p, idx) => (
              <Card 
                key={idx} 
                className={`relative border-slate-100 dark:border-slate-800 flex flex-col justify-between ${
                  p.popular ? "ring-2 ring-primary dark:bg-slate-950/40" : "bg-card/40"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}
                <CardContent className="p-8 flex flex-col gap-6">
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5">{p.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{p.price}</span>
                  </div>
                  <hr className="dark:border-slate-800" />
                  <ul className="flex flex-col gap-3 text-sm text-left">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                        <span className="text-muted-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-8 pt-0 mt-auto">
                  <Link href={p.href} className="w-full">
                    <Button 
                      className="w-full" 
                      variant={p.popular ? "gradient" : "outline"}
                    >
                      {p.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50/50 dark:bg-slate-950/20 border-t dark:border-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-3">Find answers regarding access controls, features, and credits.</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <div 
                key={i} 
                className="border rounded-xl bg-background dark:border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 font-semibold text-left text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                    {f.q}
                  </span>
                  <span className="text-muted-foreground font-light ml-2">{activeFaq === i ? "—" : "+"}</span>
                </button>
                {activeFaq === i && (
                  <div className="p-5 pt-0 border-t dark:border-slate-800 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
