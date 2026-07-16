"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  MessageSquare, 
  BrainCircuit, 
  Route, 
  Layers, 
  Zap, 
  Cpu, 
  UserCheck, 
  Plus, 
  Trash, 
  Loader2, 
  HelpCircle,
  Code2,
  Terminal,
  BookmarkCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Helper component to render simple Markdown (headers, code blocks, bold text, bullets)
function ResponseRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let language = "";

  return (
    <div className="space-y-2.5 text-left text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, idx) => {
        // Handle Code Blocks
        if (line.trim().startsWith("```")) {
          if (inCodeBlock) {
            inCodeBlock = false;
            const codeContent = codeLines.join("\n");
            codeLines = [];
            return (
              <pre key={idx} className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 my-2">
                <code>{codeContent}</code>
              </pre>
            );
          } else {
            inCodeBlock = true;
            language = line.trim().substring(3) || "code";
            return null;
          }
        }

        if (inCodeBlock) {
          codeLines.push(line);
          return null;
        }

        // Handle Headers
        if (line.startsWith("### ")) {
          return <h4 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-4">{line.substring(4)}</h4>;
        }
        if (line.startsWith("## ")) {
          return <h3 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white mt-4 border-b pb-1 dark:border-slate-800">{line.substring(3)}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-4">{line.substring(2)}</h2>;
        }

        // Handle Bullets
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const bulletText = line.trim().substring(2);
          // Highlight bold text in bullet
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              <li className="text-xs sm:text-sm">
                {parseBoldText(bulletText)}
              </li>
            </ul>
          );
        }

        // Handle normal line
        return <p key={idx} className="min-h-[1rem]">{parseBoldText(line)}</p>;
      })}
    </div>
  );
}

// Utility to parse **bold** text in lines
function parseBoldText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{part}</strong> : part));
}

function AiToolsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "chat";

  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [loading, setLoading] = React.useState(false);

  // Tab definitions
  const tabs = [
    { id: "chat", name: "AI Chat Assistant", icon: <MessageSquare className="h-4.5 w-4.5" />, desc: "Discuss topics with your copilot" },
    { id: "quiz", name: "AI Quiz Generator", icon: <BrainCircuit className="h-4.5 w-4.5" />, desc: "Test comprehension on any subject" },
    { id: "roadmap", name: "Roadmap Architect", icon: <Route className="h-4.5 w-4.5" />, desc: "Generate career and skill learning paths" },
    { id: "notes", name: "Notes Summarizer", icon: <BookmarkCheck className="h-4.5 w-4.5" />, desc: "Condense long textbook pages" },
    { id: "flashcards", name: "Flashcards Generator", icon: <Layers className="h-4.5 w-4.5" />, desc: "Create visual memorization cards" },
    { id: "career", name: "Career Recommendation", icon: <UserCheck className="h-4.5 w-4.5" />, desc: "Identify path options from your skills" },
    { id: "doubt", name: "Doubt Solver", icon: <HelpCircle className="h-4.5 w-4.5" />, desc: "Resolve equations or conceptual blocks" },
    { id: "code", name: "Code Explainer", icon: <Code2 className="h-4.5 w-4.5" />, desc: "Deconstruct syntax line-by-line" },
    { id: "interview", name: "Interview Prep Simulator", icon: <Terminal className="h-4.5 w-4.5" />, desc: "Simulate top technical review lists" },
  ];

  // 1. AI Chat States
  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "model"; content: string }[]>([
    { role: "model", content: "Hi! I am your EduPilot AI study partner. Ask me any conceptual question about your active courses." },
  ]);

  // 2. AI Quiz States
  const [quizTopic, setQuizTopic] = React.useState("");
  const [quizCount, setQuizCount] = React.useState("3");
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState("");
  const [showExplanation, setShowExplanation] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState(0);
  const [quizFinished, setQuizFinished] = React.useState(false);

  // 3. AI Roadmap States
  const [roadmapTopic, setRoadmapTopic] = React.useState("");
  const [activeRoadmap, setActiveRoadmap] = React.useState<any>(null);
  const [savedRoadmaps, setSavedRoadmaps] = React.useState<any[]>([]);

  // 4. Summarizer States
  const [summarizerInput, setSummarizerInput] = React.useState("");
  const [summarizerResult, setSummarizerResult] = React.useState("");

  // 5. Flashcards States
  const [flashcardTopic, setFlashcardTopic] = React.useState("");
  const [flashcardCount, setFlashcardCount] = React.useState("3");
  const [flashcards, setFlashcards] = React.useState<any[]>([]);
  const [activeCardIdx, setActiveCardIdx] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  // 6. Career States
  const [careerSkills, setCareerSkills] = React.useState("");
  const [careerGoal, setCareerGoal] = React.useState("");
  const [careerResult, setCareerResult] = React.useState<any>(null);

  // 7. Doubt Solver States
  const [doubtText, setDoubtText] = React.useState("");
  const [doubtContext, setDoubtContext] = React.useState("");
  const [doubtSolution, setDoubtSolution] = React.useState("");

  // 8. Code Explainer States
  const [codeSnippet, setCodeSnippet] = React.useState("");
  const [codeLanguage, setCodeLanguage] = React.useState("javascript");
  const [codeExplanation, setCodeExplanation] = React.useState("");

  // 9. Interview States
  const [interviewRole, setInterviewRole] = React.useState("");
  const [interviewLevel, setInterviewLevel] = React.useState("mid");
  const [interviewQuestions, setInterviewQuestions] = React.useState<any[]>([]);
  const [revealedAnswers, setRevealedAnswers] = React.useState<Set<number>>(new Set());

  // Load roadmaps on mount
  React.useEffect(() => {
    if (activeTab === "roadmap") {
      fetchRoadmaps();
    }
  }, [activeTab]);

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch("/api/ai/roadmap");
      if (res.ok) {
        const json = await res.json();
        setSavedRoadmaps(json);
      }
    } catch (e) {}
  };

  // 1. AI Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...chatMessages, userMsg] }),
      });

      if (res.ok) {
        const json = await res.json();
        setChatMessages((prev) => [...prev, { role: "model", content: json.response }]);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to connect to AI server", "error");
      }
    } catch (err) {
      toast("Connection timeout", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. AI Quiz Generator
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim() || loading) return;
    setLoading(true);
    setQuizQuestions([]);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIdx(0);
    setSelectedAnswer("");
    setShowExplanation(false);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: quizTopic, count: quizCount }),
      });

      if (res.ok) {
        const json = await res.json();
        setQuizQuestions(json);
        toast("Quiz deck compiled!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to compile quiz", "error");
      }
    } catch (err) {
      toast("Error connecting to generator", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
    setShowExplanation(true);
    const isCorrect = option === quizQuestions[currentQuizIdx].answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      toast("Correct Answer!", "success");
    } else {
      toast("Incorrect option.", "error");
    }
  };

  const handleQuizNext = async () => {
    setSelectedAnswer("");
    setShowExplanation(false);
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Save result to DB
      try {
        await fetch("/api/ai/quiz", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: quizScore,
            totalQuestions: quizQuestions.length,
            topic: quizTopic,
          }),
        });
      } catch (e) {}
    }
  };

  // 3. AI Roadmap Generator
  const handleRoadmapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTopic.trim() || loading) return;
    setLoading(true);
    setActiveRoadmap(null);

    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: roadmapTopic }),
      });

      if (res.ok) {
        const json = await res.json();
        setActiveRoadmap(json);
        setSavedRoadmaps((prev) => [json, ...prev]);
        toast("Skill Roadmap built and saved!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to compile roadmap", "error");
      }
    } catch (e) {
      toast("Error reaching planner", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoadmap = async (id: string) => {
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSavedRoadmaps((prev) => prev.filter((r) => r.id !== id));
        if (activeRoadmap?.id === id) setActiveRoadmap(null);
        toast("Roadmap removed", "success");
      }
    } catch (e) {}
  };

  // 4. AI Notes Summarizer
  const handleSummarizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summarizerInput.trim() || loading) return;
    setLoading(true);
    setSummarizerResult("");

    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summarizerInput }),
      });

      if (res.ok) {
        const json = await res.json();
        setSummarizerResult(json.summary);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to summarize notes", "error");
      }
    } catch (e) {
      toast("Server connection timeout", "error");
    } finally {
      setLoading(false);
    }
  };

  // 5. Flashcards Generator
  const handleFlashcardsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcardTopic.trim() || loading) return;
    setLoading(true);
    setFlashcards([]);
    setActiveCardIdx(0);
    setIsFlipped(false);

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: flashcardTopic, count: flashcardCount }),
      });

      if (res.ok) {
        const json = await res.json();
        setFlashcards(json);
        toast("Flashcards deck ready!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to generate deck", "error");
      }
    } catch (e) {
      toast("Error creating flashcards", "error");
    } finally {
      setLoading(false);
    }
  };

  // 6. Career Recommendation
  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerGoal.trim() || loading) return;
    setLoading(true);
    setCareerResult(null);

    const skillsArray = careerSkills.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

    try {
      const res = await fetch("/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsArray, goal: careerGoal }),
      });

      if (res.ok) {
        const json = await res.json();
        setCareerResult(json);
        toast("Career path recommendations generated!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to analyze career trajectory", "error");
      }
    } catch (e) {
      toast("Error checking career outlooks", "error");
    } finally {
      setLoading(false);
    }
  };

  // 7. Doubt Solver
  const handleDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || loading) return;
    setLoading(true);
    setDoubtSolution("");

    try {
      const res = await fetch("/api/ai/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubt: doubtText, context: doubtContext }),
      });

      if (res.ok) {
        const json = await res.json();
        setDoubtSolution(json.solution);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to solve doubt", "error");
      }
    } catch (e) {
      toast("Error connecting to tutor", "error");
    } finally {
      setLoading(false);
    }
  };

  // 8. Code Explainer
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSnippet.trim() || loading) return;
    setLoading(true);
    setCodeExplanation("");

    try {
      const res = await fetch("/api/ai/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeSnippet, language: codeLanguage }),
      });

      if (res.ok) {
        const json = await res.json();
        setCodeExplanation(json.explanation);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to explain snippet", "error");
      }
    } catch (e) {
      toast("Error checking syntax parser", "error");
    } finally {
      setLoading(false);
    }
  };

  // 9. Interview Questions
  const handleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewRole.trim() || loading) return;
    setLoading(true);
    setInterviewQuestions([]);
    setRevealedAnswers(new Set());

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: interviewRole, level: interviewLevel }),
      });

      if (res.ok) {
        const json = await res.json();
        setInterviewQuestions(json);
        toast("Technical prep list generated!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || "Failed to compile questions", "error");
      }
    } catch (e) {
      toast("Error checking review database", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswerReveal = (idx: number) => {
    const next = new Set(revealedAnswers);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setRevealedAnswers(next);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500 animate-pulse" />
          AI Learning Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Unlock modular study guides, quizzes, and code breakdown tools driven by the Gemini API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left pane: Tab selection sidebar */}
        <div className="lg:col-span-1">
          <Card className="dark:border-slate-800 bg-card/40 backdrop-blur-md sticky top-20">
            <div className="flex flex-col p-2 gap-1 max-h-[75vh] overflow-y-auto">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 text-primary dark:bg-primary/20 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{tab.icon}</div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold leading-tight">{tab.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 leading-none">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right pane: Interactive tool screens */}
        <div className="lg:col-span-3">
          <Card className="dark:border-slate-800 min-h-[500px] flex flex-col justify-between">
            {/* SCREEN 1: AI Chat Assistant */}
            {activeTab === "chat" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <MessageSquare className="h-5 w-5 text-violet-500" />
                    AI Chat Assistant
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Discuss concepts and get structural explanations based on your active studies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6 min-h-[400px]">
                  {/* Messages list */}
                  <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {chatMessages.map((msg, i) => {
                      const isAi = msg.role === "model";
                      return (
                        <div
                          key={i}
                          className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`p-3.5 rounded-xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                              isAi
                                ? "bg-slate-100 dark:bg-slate-900 border text-slate-800 dark:text-slate-200"
                                : "bg-primary text-primary-foreground font-medium"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border text-muted-foreground text-xs flex items-center gap-1.5">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Copilot is writing...
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      placeholder="Ask a question (e.g. What is the difference between SQL and NoSQL?)"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={loading}
                      className="bg-card/50"
                    />
                    <Button type="submit" variant="gradient" disabled={loading}>
                      Send
                    </Button>
                  </form>
                </CardContent>
              </>
            )}

            {/* SCREEN 2: AI Quiz Generator */}
            {activeTab === "quiz" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <BrainCircuit className="h-5 w-5 text-indigo-500" />
                    AI Quiz Generator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generate customized multiple-choice practice worksheets on any topic.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  {quizQuestions.length === 0 ? (
                    <form onSubmit={handleQuizSubmit} className="space-y-4 max-w-md mx-auto w-full text-left">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Topic / Study Area</label>
                        <Input
                          placeholder="e.g. Next.js Routing, Mitochondria, Linear Algebra"
                          value={quizTopic}
                          onChange={(e) => setQuizTopic(e.target.value)}
                          required
                          className="bg-card/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Number of Questions</label>
                        <Select
                          value={quizCount}
                          onChange={(e: any) => setQuizCount(e.target.value)}
                          options={[
                            { value: "3", label: "3 Questions" },
                            { value: "5", label: "5 Questions" },
                            { value: "10", label: "10 Questions" },
                          ]}
                          className="bg-card/50"
                        />
                      </div>
                      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Compiling worksheet...
                          </>
                        ) : (
                          "Compile Quiz"
                        )}
                      </Button>
                    </form>
                  ) : quizFinished ? (
                    <div className="text-center py-8 space-y-4 max-w-sm mx-auto">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 text-3xl font-black">
                        {quizScore}/{quizQuestions.length}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base">Quiz Completed!</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          You scored {Math.round((quizScore / quizQuestions.length) * 100)}% on {quizTopic}. Score recorded in your history log.
                        </p>
                      </div>
                      <Button onClick={() => setQuizQuestions([])} variant="outline" className="w-full">
                        Try Another Topic
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6 text-left max-w-xl mx-auto w-full">
                      {/* Progress header */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-bold border-b pb-2 dark:border-slate-800">
                        <span>Question {currentQuizIdx + 1} of {quizQuestions.length}</span>
                        <span>Score: {quizScore}</span>
                      </div>

                      {/* Question */}
                      <h3 className="font-bold text-sm sm:text-base leading-snug">
                        {quizQuestions[currentQuizIdx].question}
                      </h3>

                      {/* Options Grid */}
                      <div className="flex flex-col gap-2.5">
                        {quizQuestions[currentQuizIdx].options.map((opt: string, oIdx: number) => {
                          const isAnswer = opt === quizQuestions[currentQuizIdx].answer;
                          const isSelected = opt === selectedAnswer;

                          let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900";
                          if (showExplanation) {
                            if (isAnswer) {
                              btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold";
                            } else if (isSelected) {
                              btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold";
                            } else {
                              btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswer(opt)}
                              disabled={showExplanation}
                              className={`w-full p-3 rounded-lg border text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100/40 dark:bg-slate-900/30 dark:border-slate-800 text-xs sm:text-sm leading-relaxed"
                        >
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">Explanation:</span>{" "}
                          {quizQuestions[currentQuizIdx].explanation}
                          <Button onClick={handleQuizNext} className="mt-4 w-full h-9 text-xs">
                            {currentQuizIdx < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* SCREEN 3: AI Roadmap Generator */}
            {activeTab === "roadmap" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <Route className="h-5 w-5 text-emerald-500" />
                    AI Roadmap Generator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Input any target skill or career direction and map out study guides and milestones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col gap-6">
                  {/* Prompt Form */}
                  <form onSubmit={handleRoadmapSubmit} className="flex gap-2 max-w-lg">
                    <Input
                      placeholder="e.g. Become a Full-Stack Dev, Master Docker, Learn German"
                      value={roadmapTopic}
                      onChange={(e) => setRoadmapTopic(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-card/50"
                    />
                    <Button type="submit" variant="gradient" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Architecting...
                        </>
                      ) : (
                        "Build"
                      )}
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Saved list */}
                    <div className="md:col-span-1 space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground pl-1">Saved roadmaps</h3>
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {savedRoadmaps.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic pl-1">No saved plans yet.</p>
                        ) : (
                          savedRoadmaps.map((road) => (
                            <div
                              key={road.id}
                              className={`flex items-center justify-between p-2 rounded-lg border dark:border-slate-800 group transition-colors ${
                                activeRoadmap?.id === road.id ? "bg-primary/5 border-primary/20" : "bg-card/60 hover:bg-slate-50 dark:hover:bg-slate-900"
                              }`}
                            >
                              <button
                                onClick={() => setActiveRoadmap(road)}
                                className="flex-1 text-left text-xs font-semibold truncate pr-2"
                              >
                                {road.title}
                              </button>
                              <button
                                onClick={() => handleDeleteRoadmap(road.id)}
                                className="p-1 text-muted-foreground hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right: Active timeline rendering */}
                    <div className="md:col-span-2 border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[300px]">
                      {activeRoadmap ? (
                        <div className="space-y-6 text-left">
                          <div>
                            <h3 className="font-extrabold text-base text-gradient">{activeRoadmap.title}</h3>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                              Generated {new Date(activeRoadmap.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Timeline list */}
                          <div className="relative pl-6 border-l border-indigo-100 dark:border-slate-800 space-y-6 ml-2">
                            {(activeRoadmap.steps as any[]).map((step, sIdx) => (
                              <div key={sIdx} className="relative">
                                {/* Dot indicator */}
                                <div className="absolute -left-[30px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-2 border-background">
                                  <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded font-medium">
                                      {step.duration}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-12">
                          <Route className="h-8 w-8 opacity-40" />
                          <p className="text-xs">Submit a goal above or select a saved roadmap from the index to render your learning steps.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* SCREEN 4: AI Notes Summarizer */}
            {activeTab === "notes" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <BookmarkCheck className="h-5 w-5 text-rose-500" />
                    AI Notes Summarizer
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste raw lecture transcripts or long textbook chapters to generate condensed lists.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                  <form onSubmit={handleSummarizeSubmit} className="flex-1 flex flex-col gap-3 text-left">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Raw Notes Content</label>
                    <Textarea
                      placeholder="Paste your raw learning content here..."
                      value={summarizerInput}
                      onChange={(e) => setSummarizerInput(e.target.value)}
                      required
                      className="flex-1 min-h-[220px] bg-card/50"
                    />
                    <Button type="submit" variant="gradient" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Condensing notes...
                        </>
                      ) : (
                        "Generate Summary"
                      )}
                    </Button>
                  </form>

                  <div className="flex-1 border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[250px] overflow-y-auto">
                    {summarizerResult ? (
                      <ResponseRenderer content={summarizerResult} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-12">
                        <BookmarkCheck className="h-8 w-8 opacity-40" />
                        <p className="text-xs">Your structured summary will render here after the AI completes compiling details.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* SCREEN 5: AI Flashcard Generator */}
            {activeTab === "flashcards" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <Layers className="h-5 w-5 text-rose-500" />
                    AI Flashcard Generator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Convert study topics into interactive flashcard decks for visual review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-center gap-6">
                  {flashcards.length === 0 ? (
                    <form onSubmit={handleFlashcardsSubmit} className="space-y-4 max-w-md mx-auto w-full text-left">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Topic</label>
                        <Input
                          placeholder="e.g. CSS Grid, JavaScript Closures, photosynthesis"
                          value={flashcardTopic}
                          onChange={(e) => setFlashcardTopic(e.target.value)}
                          required
                          className="bg-card/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Deck Count</label>
                        <Select
                          value={flashcardCount}
                          onChange={(e: any) => setFlashcardCount(e.target.value)}
                          options={[
                            { value: "3", label: "3 Flashcards" },
                            { value: "5", label: "5 Flashcards" },
                          ]}
                          className="bg-card/50"
                        />
                      </div>
                      <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Forging flashcards...
                          </>
                        ) : (
                          "Generate Deck"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6 max-w-sm mx-auto w-full text-center">
                      <div className="text-xs font-bold text-muted-foreground">
                        Card {activeCardIdx + 1} of {flashcards.length}
                      </div>

                      {/* Interactive Flip Card container */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="relative h-44 w-full cursor-pointer rounded-2xl border dark:border-slate-800 bg-card hover:shadow-md transition-shadow select-none overflow-hidden"
                      >
                        {/* Sun/Moon subtle background blur for premium touch */}
                        <div className="absolute right-0 bottom-0 h-16 w-16 bg-primary/5 rounded-full blur-xl" />

                        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                          <AnimatePresence mode="wait">
                            {!isFlipped ? (
                              <motion.div
                                key="front"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-2"
                              >
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Question</span>
                                <h3 className="font-extrabold text-sm sm:text-base leading-snug text-slate-900 dark:text-white">
                                  {flashcards[activeCardIdx].front}
                                </h3>
                                <p className="text-[10px] text-muted-foreground italic mt-3">Click to reveal answer</p>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="back"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-2"
                              >
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Answer</span>
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                                  {flashcards[activeCardIdx].back}
                                </p>
                                <p className="text-[10px] text-muted-foreground italic mt-3">Click to see question</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={activeCardIdx === 0}
                          onClick={() => {
                            setActiveCardIdx((p) => p - 1);
                            setIsFlipped(false);
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFlashcards([])}
                        >
                          Reset Topic
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={activeCardIdx === flashcards.length - 1}
                          onClick={() => {
                            setActiveCardIdx((p) => p + 1);
                            setIsFlipped(false);
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* SCREEN 6: AI Career Recommendation */}
            {activeTab === "career" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <UserCheck className="h-5 w-5 text-sky-500" />
                    AI Career Recommendation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Evaluate skill matches, target gaps, and explore suggested tech industries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                  <form onSubmit={handleCareerSubmit} className="flex-1 space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Active Skills (comma-separated)</label>
                      <Input
                        placeholder="e.g. JavaScript, HTML, CSS, Git"
                        value={careerSkills}
                        onChange={(e) => setCareerSkills(e.target.value)}
                        className="bg-card/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Career Goal / Target</label>
                      <Textarea
                        placeholder="e.g. I want to build AI-driven web apps and secure full-stack databases."
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        required
                        className="min-h-[100px] bg-card/50"
                      />
                    </div>
                    <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing compatibility...
                        </>
                      ) : (
                        "Generate Profile Recommendation"
                      )}
                    </Button>
                  </form>

                  <div className="flex-1 border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[250px] text-left">
                    {careerResult ? (
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase">Recommended Role</span>
                          <h3 className="font-extrabold text-base mt-0.5">{careerResult.recommendedRole}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Skills Match</span>
                            <div className="h-2 w-full bg-secondary dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${careerResult.skillsMatch}%` }} />
                            </div>
                          </div>
                          <span className="text-sm font-black pt-4 shrink-0">{careerResult.skillsMatch}%</span>
                        </div>
                        
                        <div className="space-y-1.5 border-t pt-3 dark:border-slate-800 text-xs">
                          <h4 className="font-bold text-rose-500 uppercase tracking-wide">Identified Skill Gaps</h4>
                          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                            {careerResult.skillGaps.map((gap: string, i: number) => (
                              <li key={i}>{gap}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5 border-t pt-3 dark:border-slate-800 text-xs">
                          <h4 className="font-bold text-emerald-500 uppercase tracking-wide">Suggested Learning Path</h4>
                          <ul className="list-decimal pl-5 text-muted-foreground space-y-1">
                            {careerResult.learningPathway.map((path: string, i: number) => (
                              <li key={i}>{path}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1 border-t pt-3 dark:border-slate-800 text-xs">
                          <h4 className="font-bold text-muted-foreground uppercase tracking-wide">Industry Outlook</h4>
                          <p className="text-muted-foreground leading-relaxed">{careerResult.outlook}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-12">
                        <UserCheck className="h-8 w-8 opacity-40" />
                        <p className="text-xs">Your career recommendation and compatibility match calculations will render here.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* SCREEN 7: AI Doubt Solver */}
            {activeTab === "doubt" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <Zap className="h-5 w-5 text-amber-500" />
                    AI Doubt Solver
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste math problems, calculations, or complex concepts to get tutorial explanations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                  <form onSubmit={handleDoubtSubmit} className="flex-1 space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Optional Course Context</label>
                      <Input
                        placeholder="e.g. Lesson 4: Indexing, or leave empty"
                        value={doubtContext}
                        onChange={(e) => setDoubtContext(e.target.value)}
                        className="bg-card/50"
                      />
                    </div>
                    <div className="space-y-1 flex-1 flex flex-col">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Describe your academic doubt</label>
                      <Textarea
                        placeholder="e.g. Explain how Dijkstra's algorithm finds the shortest path, or how is phyloP conservation calculated?"
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        required
                        className="flex-1 min-h-[120px] bg-card/50"
                      />
                    </div>
                    <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Solving doubt...
                        </>
                      ) : (
                        "Solve Doubt"
                      )}
                    </Button>
                  </form>

                  <div className="flex-1 border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[250px] overflow-y-auto">
                    {doubtSolution ? (
                      <ResponseRenderer content={doubtSolution} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-12">
                        <Zap className="h-8 w-8 opacity-40" />
                        <p className="text-xs">Your step-by-step doubt resolution tutorial will render here.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* SCREEN 8: AI Code Explainer */}
            {activeTab === "code" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <Cpu className="h-5 w-5 text-sky-500" />
                    AI Code Explainer
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste programming snippets to dissect logic flows and time complexity bounds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                  <form onSubmit={handleCodeSubmit} className="flex-1 space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Programming Language</label>
                      <Select
                        value={codeLanguage}
                        onChange={(e: any) => setCodeLanguage(e.target.value)}
                        options={[
                          { value: "javascript", label: "JavaScript / TypeScript" },
                          { value: "python", label: "Python" },
                          { value: "sql", label: "SQL" },
                          { value: "rust", label: "Rust / C++" },
                        ]}
                        className="bg-card/50"
                      />
                    </div>
                    <div className="space-y-1 flex-1 flex flex-col">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Paste Code Snippet</label>
                      <Textarea
                        placeholder="e.g. const fib = n => n <= 1 ? n : fib(n-1) + fib(n-2);"
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                        required
                        className="flex-1 min-h-[140px] font-mono text-xs bg-card/50"
                      />
                    </div>
                    <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deconstructing code...
                        </>
                      ) : (
                        "Explain Code"
                      )}
                    </Button>
                  </form>

                  <div className="flex-1 border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[250px] overflow-y-auto">
                    {codeExplanation ? (
                      <ResponseRenderer content={codeExplanation} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-12">
                        <Cpu className="h-8 w-8 opacity-40" />
                        <p className="text-xs">Your line-by-line syntax logic explanation and complexity check will render here.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* SCREEN 9: AI Interview Prep */}
            {activeTab === "interview" && (
              <>
                <CardHeader className="border-b dark:border-slate-800">
                  <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                    <Terminal className="h-5 w-5 text-teal-500" />
                    Interview Prep simulator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prepare for job profiles by generating specialized technical mock questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col gap-6">
                  <form onSubmit={handleInterviewSubmit} className="flex gap-4 items-end max-w-2xl text-left">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Target Job Title</label>
                      <Input
                        placeholder="e.g. Front-end Engineer, Database Admin"
                        value={interviewRole}
                        onChange={(e) => setInterviewRole(e.target.value)}
                        required
                        className="bg-card/50"
                      />
                    </div>
                    <div className="space-y-1 w-32">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Level</label>
                      <Select
                        value={interviewLevel}
                        onChange={(e: any) => setInterviewLevel(e.target.value)}
                        options={[
                          { value: "junior", label: "Entry" },
                          { value: "mid", label: "Mid-level" },
                          { value: "senior", label: "Senior" },
                        ]}
                        className="bg-card/50"
                      />
                    </div>
                    <Button type="submit" variant="gradient" disabled={loading}>
                      {loading ? "Preparing..." : "Generate List"}
                    </Button>
                  </form>

                  <div className="border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[250px] text-left">
                    {interviewQuestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground gap-2">
                        <Terminal className="h-8 w-8 opacity-40" />
                        <p className="text-xs">Select your target role above to compile practice questions.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {interviewQuestions.map((q, idx) => (
                          <div key={idx} className="border-b last:border-0 pb-4 last:pb-0 dark:border-slate-800">
                            <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-primary uppercase">
                              <span>Question {idx + 1}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded text-muted-foreground">
                                {q.category}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm sm:text-base mt-2">{q.question}</h4>
                            <div className="mt-3">
                              <Button
                                onClick={() => toggleAnswerReveal(idx)}
                                size="sm"
                                variant="outline"
                                className="text-[10px] h-7 px-3"
                              >
                                {revealedAnswers.has(idx) ? "Hide Sample Answer" : "Reveal Sample Answer"}
                              </Button>
                              <AnimatePresence>
                                {revealedAnswers.has(idx) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300 mt-2 border border-slate-200/50 dark:border-slate-800"
                                  >
                                    <span className="font-bold text-emerald-500">Suggested Answer:</span>{" "}
                                    {q.sampleAnswer}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AiToolsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AiToolsContent />
    </Suspense>
  );
}
