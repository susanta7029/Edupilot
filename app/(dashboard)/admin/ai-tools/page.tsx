"use client";

import React from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  BrainCircuit, 
  BookOpen, 
  FileText, 
  HelpCircle,
  Award,
  Terminal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AdminAiTools() {
  const { toast } = useToast();

  const [activeTool, setActiveTool] = React.useState("description");
  const [promptInput, setPromptInput] = React.useState("");
  const [outputResult, setOutputResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const tools = [
    { id: "description", label: "Course Outline", desc: "Generate full descriptions, tags, and difficulty guidelines.", icon: <BookOpen className="h-4.5 w-4.5" />, api: "/api/ai/chat", promptPrefix: "Generate a detailed course description, subtitle, target level, and 5 comma-separated tags for the topic: " },
    { id: "notes", label: "Lesson Notes", desc: "Write comprehensive educational study notes in Markdown format.", icon: <FileText className="h-4.5 w-4.5" />, api: "/api/ai/chat", promptPrefix: "Write structured, comprehensive study notes in Markdown format with code examples about the topic: " },
    { id: "quiz", label: "Quiz Sheet", desc: "Generate multiple choice questions with explanations.", icon: <HelpCircle className="h-4.5 w-4.5" />, api: "/api/ai/quiz", promptPrefix: "" },
    { id: "assignment", label: "Assignment Task", desc: "Formulate coding assignments, instructions, and deadlines.", icon: <Terminal className="h-4.5 w-4.5" />, api: "/api/ai/chat", promptPrefix: "Design a high-fidelity capstone project assignment for students with expectations and markdown instructions on the topic: " },
    { id: "flashcards", label: "Study Flashcards", desc: "Compile Q&A flashcards for exam review.", icon: <BrainCircuit className="h-4.5 w-4.5" />, api: "/api/ai/flashcards", promptPrefix: "" },
    { id: "interview", label: "Interview Checklists", desc: "Create high-yield role-specific interview Q&As.", icon: <Award className="h-4.5 w-4.5" />, api: "/api/ai/interview", promptPrefix: "" }
  ];

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId);
    setPromptInput("");
    setOutputResult("");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || loading) return;
    setLoading(true);
    setOutputResult("");

    const currentTool = tools.find(t => t.id === activeTool);
    if (!currentTool) return;

    try {
      let body: any = {};
      
      // Determine post parameters based on endpoint type
      if (currentTool.api === "/api/ai/chat") {
        body = {
          messages: [
            { role: "user", content: `${currentTool.promptPrefix}${promptInput}` }
          ]
        };
      } else if (currentTool.api === "/api/ai/quiz") {
        body = { topic: promptInput, count: 3 };
      } else if (currentTool.api === "/api/ai/flashcards") {
        body = { topic: promptInput, count: 5 };
      } else if (currentTool.api === "/api/ai/interview") {
        body = { role: promptInput, level: "Senior" };
      }

      const res = await fetch(currentTool.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        let formattedText = "";
        
        if (currentTool.api === "/api/ai/chat") {
          formattedText = json.response;
        } else if (currentTool.api === "/api/ai/quiz" || currentTool.api === "/api/ai/flashcards" || currentTool.api === "/api/ai/interview") {
          // JSON stringify the array output cleanly
          formattedText = JSON.stringify(json, null, 2);
        }

        setOutputResult(formattedText);
        toast("Content generated successfully!", "success");
      } else {
        toast("AI generation failed", "error");
      }
    } catch (e) {
      toast("Request error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    toast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const activeToolObj = tools.find(t => t.id === activeTool);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500 animate-pulse" />
          AI Curriculum Workspace
        </h1>
        <p className="text-xs text-muted-foreground">Leverage Google Gemini to generate high-fidelity syllabus descriptions, study notes, and MCQs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Select Tools list */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider pl-1">Available Generative Agents</h3>
          <div className="flex flex-col gap-2">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => handleToolChange(t.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                  activeTool === t.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-card/60 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="mt-0.5 shrink-0">{t.icon}</div>
                <div>
                  <h4 className="text-xs font-bold leading-none">{t.label}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-normal">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Input & Output Workspaces */}
        <div className="md:col-span-2 space-y-4">
          {activeToolObj && (
            <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
              <CardHeader className="text-left pb-3">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Generate {activeToolObj.label}
                </CardTitle>
                <CardDescription className="text-xs">
                  Fill in parameters below to run the Gemini prompt compiler.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {activeTool === "interview" 
                        ? "Enter Target Role (e.g. Full-Stack Dev)" 
                        : "Enter Topic / Keyword (e.g. Next.js Caching)"}
                    </label>
                    <Textarea
                      placeholder={activeTool === "interview" ? "e.g. React.js Frontend Engineer" : "e.g. Data Structures Binary Trees"}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      required
                      rows={2}
                      disabled={loading}
                      className="text-xs"
                    />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full text-xs" disabled={loading || !promptInput.trim()}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        Generating with Gemini 2.5...
                      </>
                    ) : (
                      "Compile Content"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Code Output panel */}
          <Card className="dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Output Result</span>
              {outputResult && (
                <Button onClick={handleCopy} variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold flex items-center gap-1">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Code
                    </>
                  )}
                </Button>
              )}
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Gemini is structuring workspace parameters...</p>
                </div>
              ) : outputResult ? (
                <pre className="p-5 overflow-auto max-h-[500px] text-xs font-mono bg-slate-950 text-slate-100 text-left leading-relaxed whitespace-pre-wrap select-all">
                  {outputResult}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-2">
                  <BrainCircuit className="h-8 w-8 opacity-40 animate-pulse text-primary" />
                  <p className="text-xs">No content compiled yet. Fill in parameters above to start.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
