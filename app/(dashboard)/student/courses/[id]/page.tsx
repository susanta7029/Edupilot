"use client";

import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle, 
  Clock, 
  Download, 
  FileText, 
  ExternalLink,
  PlayCircle,
  Video,
  ChevronRight,
  Sparkles,
  HelpCircle,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string;
  youtubeUrl: string | null;
  pdfUrl: string | null;
  order: number;
  completed: boolean;
  bookmarked: boolean;
}

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  type: string;
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const courseId = params.id as string;
  const initialLessonId = searchParams.get("lesson");

  const [course, setCourse] = React.useState<CourseDetails | null>(null);
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null);
  
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  // AI Tab Local States
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiSummary, setAiSummary] = React.useState("");
  const [doubtText, setDoubtText] = React.useState("");
  const [doubtSolution, setDoubtSolution] = React.useState("");
  const [quizQuestions, setQuizQuestions] = React.useState<any[]>([]);
  const [quizIdx, setQuizIdx] = React.useState(0);
  const [quizScore, setQuizScore] = React.useState(0);
  const [quizFinished, setQuizFinished] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState("");
  const [showExplanation, setShowExplanation] = React.useState(false);

  const fetchCourseDetails = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons);
        setResources(data.resources);

        // Set active lesson
        if (data.lessons.length > 0) {
          const matched = initialLessonId 
            ? data.lessons.find((l: Lesson) => l.id === initialLessonId)
            : data.lessons.find((l: Lesson) => !l.completed) || data.lessons[0];
          
          setActiveLesson(matched || data.lessons[0]);
        }
      } else {
        toast("Failed to load course details", "error");
        router.push("/student/courses");
      }
    } catch (e) {
      console.error("LMS detail fetch error:", e);
      toast("An error occurred loading course", "error");
    } finally {
      setLoading(false);
    }
  }, [courseId, initialLessonId, router, toast]);

  React.useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  // Reset AI states when switching lessons
  React.useEffect(() => {
    setAiSummary("");
    setDoubtText("");
    setDoubtSolution("");
    setQuizQuestions([]);
    setQuizFinished(false);
  }, [activeLesson]);

  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;
    try {
      let videoId = "";
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v") || "";
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
      return null;
    }
  };

  const toggleProgress = async () => {
    if (!activeLesson || actionLoading) return;
    setActionLoading(true);
    const nextCompleted = !activeLesson.completed;

    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          completed: nextCompleted,
        }),
      });

      if (res.ok) {
        toast(
          nextCompleted ? "Lesson marked as completed! +15 study minutes awarded." : "Lesson marked as incomplete.",
          "success"
        );

        setLessons((prev) =>
          prev.map((l) => (l.id === activeLesson.id ? { ...l, completed: nextCompleted } : l))
        );
        setActiveLesson((prev) => (prev ? { ...prev, completed: nextCompleted } : null));
      } else {
        toast("Failed to save progress", "error");
      }
    } catch (e) {
      toast("Error updating progress", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!activeLesson || actionLoading) return;
    setActionLoading(true);
    const nextBookmarked = !activeLesson.bookmarked;

    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          bookmarked: nextBookmarked,
        }),
      });

      if (res.ok) {
        toast(nextBookmarked ? "Lesson bookmarked successfully!" : "Bookmark removed.", "success");
        
        setLessons((prev) =>
          prev.map((l) => (l.id === activeLesson.id ? { ...l, bookmarked: nextBookmarked } : l))
        );
        setActiveLesson((prev) => (prev ? { ...prev, bookmarked: nextBookmarked } : null));
      } else {
        toast("Failed to toggle bookmark", "error");
      }
    } catch (e) {
      toast("Error toggling bookmark", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    const newUrl = `/student/courses/${courseId}?lesson=${lesson.id}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // AI Action 1: Summarize this specific lesson content
  const handleAiSummarize = async () => {
    if (!activeLesson || aiLoading) return;
    setAiLoading(true);
    setAiSummary("");

    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeLesson.content }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiSummary(json.summary);
        toast("Lesson summary compiled!", "success");
      }
    } catch (e) {
      toast("AI Error", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // AI Action 2: Solve doubt with lesson title + content as context
  const handleAiSolveDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !doubtText.trim() || aiLoading) return;
    setAiLoading(true);
    setDoubtSolution("");

    const context = `Course: ${course?.title || ""}\nLesson ${activeLesson.order}: ${activeLesson.title}\nContent: ${activeLesson.content}`;

    try {
      const res = await fetch("/api/ai/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubt: doubtText, context }),
      });

      if (res.ok) {
        const json = await res.json();
        setDoubtSolution(json.solution);
        toast("Tutor resolved doubt!", "success");
      }
    } catch (e) {
      toast("AI Error", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // AI Action 3: Generate quiz only from this lesson
  const handleAiGenerateQuiz = async () => {
    if (!activeLesson || aiLoading) return;
    setAiLoading(true);
    setQuizQuestions([]);
    setQuizFinished(false);
    setQuizScore(0);
    setQuizIdx(0);
    setSelectedOption("");
    setShowExplanation(false);

    const topic = `Course: ${course?.title || ""}\nLesson ${activeLesson.order}: ${activeLesson.title}\nContent details: ${activeLesson.content}`;

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: 3 }),
      });

      if (res.ok) {
        const json = await res.json();
        setQuizQuestions(json);
        toast("Interactive Lesson Quiz generated!", "success");
      }
    } catch (e) {
      toast("AI Error", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (showExplanation) return;
    setSelectedOption(option);
    setShowExplanation(true);
    const isCorrect = option === quizQuestions[quizIdx].answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      toast("Correct!", "success");
    } else {
      toast("Incorrect.", "error");
    }
  };

  const handleQuizNext = () => {
    setSelectedOption("");
    setShowExplanation(false);
    if (quizIdx < quizQuestions.length - 1) {
      setQuizIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className="h-10 w-24 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-[500px] rounded-xl bg-muted animate-pulse md:col-span-1" />
          <div className="h-[500px] rounded-xl bg-muted animate-pulse md:col-span-3" />
        </div>
      </div>
    );
  }

  if (!course || !activeLesson) return null;

  const embedUrl = getEmbedUrl(activeLesson.youtubeUrl);
  const activeLessonIdx = lessons.findIndex((l) => l.id === activeLesson.id);
  const nextLessonObj = activeLessonIdx < lessons.length - 1 ? lessons[activeLessonIdx + 1] : null;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/student/courses">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded">
          {course.category}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black">{course.title}</h1>
        <p className="text-xs text-muted-foreground max-w-3xl">{course.description}</p>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side: Lessons Index Sidebar */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider pl-1">Lessons Index</h3>
          <Card className="dark:border-slate-800 bg-card/40 backdrop-blur-md">
            <div className="flex flex-col p-2 max-h-[500px] overflow-y-auto">
              {lessons.map((les) => {
                const isSelected = les.id === activeLesson.id;
                return (
                  <button
                    key={les.id}
                    onClick={() => handleLessonSelect(les)}
                    className={`flex items-start gap-2.5 p-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 text-primary dark:bg-primary/20 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {les.completed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <PlayCircle className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight line-clamp-2">
                        {les.order}. {les.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Side: Interactive Lesson Player */}
        <div className="md:col-span-3 space-y-4">
          <Card className="dark:border-slate-800">
            <CardContent className="p-6 space-y-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800 flex-wrap gap-4">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Lesson {activeLesson.order} &bull; {activeLesson.duration}</span>
                  <h2 className="text-lg font-extrabold mt-0.5">{activeLesson.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleBookmark}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 h-9"
                    disabled={actionLoading}
                  >
                    {activeLesson.bookmarked ? (
                      <>
                        <BookmarkCheck className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4.5 w-4.5 text-muted-foreground" />
                        Save Notes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={toggleProgress}
                    variant={activeLesson.completed ? "outline" : "default"}
                    size="sm"
                    className="flex items-center gap-1.5 h-9"
                    disabled={actionLoading}
                  >
                    <CheckCircle className={`h-4.5 w-4.5 ${activeLesson.completed ? "text-emerald-500 fill-emerald-100 dark:fill-emerald-950" : ""}`} />
                    {activeLesson.completed ? "Completed" : "Mark Done"}
                  </Button>
                </div>
              </div>

              {/* Tabs Content System */}
              <Tabs defaultValue="video" className="w-full">
                <TabsList className="w-full sm:w-auto grid grid-cols-4 mb-6">
                  <TabsTrigger value="video" className="flex items-center gap-1.5 justify-center"><Video className="h-4 w-4" /> Video</TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center gap-1.5 justify-center"><FileText className="h-4 w-4" /> Notes</TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-1.5 justify-center"><Download className="h-4 w-4" /> Files</TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-1.5 justify-center">
                    <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
                    AI Copilot
                  </TabsTrigger>
                </TabsList>

                {/* Video Tab */}
                <TabsContent value="video" className="mt-0">
                  {embedUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border shadow-sm dark:border-slate-800 bg-black">
                      <iframe
                        src={embedUrl}
                        title={activeLesson.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center gap-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                      <Video className="h-10 w-10 text-muted-foreground/60" />
                      <h4 className="font-bold text-sm">No lecture video configured</h4>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        This lesson consists primarily of reading notes. Please click on the &ldquo;Notes&rdquo; tab above to study.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-0">
                  <div className="prose dark:prose-invert max-w-none text-left leading-relaxed text-sm dark:text-slate-300 border rounded-xl p-5 bg-slate-50/30 dark:bg-slate-900/30">
                    {activeLesson.content.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx} className="mb-4 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="mt-0">
                  <div className="space-y-4">
                    {resources.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 border rounded-xl text-center text-muted-foreground dark:border-slate-800">
                        <FileText className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-xs">No supplemental resources or PDF notes available for this course.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {resources.map((res) => (
                          <Card key={res.id} className="dark:border-slate-800 bg-card/50">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-bold text-xs truncate max-w-[150px]">{res.title}</h4>
                                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{res.type}</p>
                                </div>
                              </div>
                              <a
                                href={res.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
                              >
                                Download
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* AI Assistant Tab - Contextual Knowledge (Part 12) */}
                <TabsContent value="ai" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {/* Left Panel: Trigger Buttons */}
                    <div className="md:col-span-1 space-y-4">
                      <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-0 shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            Lesson Assistant
                          </CardTitle>
                          <CardDescription className="text-slate-400 text-[10px]">
                            AI runs with complete context of Course: &ldquo;{course.title}&rdquo;, Lesson {activeLesson.order}: &ldquo;{activeLesson.title}&rdquo;.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2.5 pt-0">
                          <Button
                            onClick={handleAiSummarize}
                            disabled={aiLoading}
                            size="sm"
                            className="w-full text-xs justify-start bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800"
                          >
                            📝 Summarize Lesson Notes
                          </Button>
                          <Button
                            onClick={handleAiGenerateQuiz}
                            disabled={aiLoading}
                            size="sm"
                            className="w-full text-xs justify-start bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800"
                          >
                            🎯 Generate Lesson Quiz
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Solve doubt Form */}
                      <Card className="dark:border-slate-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ask Lesson Doubt</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <form onSubmit={handleAiSolveDoubt} className="space-y-3">
                            <Textarea
                              placeholder="Ask a question about this lesson..."
                              value={doubtText}
                              onChange={(e) => setDoubtText(e.target.value)}
                              required
                              rows={3}
                              className="text-xs bg-card/60"
                              disabled={aiLoading}
                            />
                            <Button type="submit" size="sm" variant="gradient" className="w-full text-xs" disabled={aiLoading}>
                              {aiLoading ? "Thinking..." : "Submit Question"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Panel: Output Workspace */}
                    <div className="md:col-span-2 border rounded-xl p-5 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 min-h-[300px]">
                      {aiLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-16">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-xs font-semibold">Gemini is processing lesson parameters...</p>
                        </div>
                      ) : quizQuestions.length > 0 ? (
                        /* Interactive Quiz for this lesson */
                        <div className="space-y-4">
                          {quizFinished ? (
                            <div className="text-center py-6 space-y-4 max-w-sm mx-auto">
                              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 font-black text-lg">
                                {quizScore}/{quizQuestions.length}
                              </span>
                              <h4 className="font-extrabold text-sm">Lesson Quiz Completed!</h4>
                              <p className="text-xs text-muted-foreground">You scored {Math.round((quizScore/quizQuestions.length)*100)}% on this lesson worksheet.</p>
                              <Button onClick={() => setQuizQuestions([])} variant="outline" size="sm" className="w-full">
                                Reset Worksheets
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold border-b pb-2 dark:border-slate-800">
                                <span>Lesson Quiz: Question {quizIdx + 1} of {quizQuestions.length}</span>
                                <span>Correct: {quizScore}</span>
                              </div>
                              <h4 className="font-bold text-xs sm:text-sm">{quizQuestions[quizIdx].question}</h4>
                              <div className="flex flex-col gap-2">
                                {quizQuestions[quizIdx].options.map((opt: string, oIdx: number) => {
                                  const isAns = opt === quizQuestions[quizIdx].answer;
                                  const isSel = opt === selectedOption;
                                  let style = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30";
                                  if (showExplanation) {
                                    if (isAns) style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold";
                                    else if (isSel) style = "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold";
                                    else style = "opacity-50 border-slate-200 dark:border-slate-800";
                                  }
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => {
                                        if (showExplanation) return;
                                        setSelectedOption(opt);
                                        setShowExplanation(true);
                                        if (isAns) setQuizScore(s => s + 1);
                                      }}
                                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${style}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {showExplanation && (
                                <div className="p-3 bg-slate-100/50 dark:bg-slate-900/30 rounded border dark:border-slate-800 text-xs mt-3">
                                  <span className="font-bold text-indigo-500">Explanation:</span> {quizQuestions[quizIdx].explanation}
                                  <Button onClick={handleQuizNext} size="sm" className="w-full mt-3 h-8 text-xs">
                                    {quizIdx < quizQuestions.length - 1 ? "Next Question" : "Finish Review"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Render Notes summary or doubt solver markdown answers */
                        <div className="max-h-[60vh] overflow-y-auto pr-1">
                          {aiSummary ? (
                            <div className="space-y-4">
                              <h4 className="font-extrabold text-sm text-gradient">AI Notes Summary</h4>
                              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/25">
                                {aiSummary}
                              </div>
                            </div>
                          ) : doubtSolution ? (
                            <div className="space-y-4">
                              <h4 className="font-extrabold text-sm text-gradient">Tutor Solution</h4>
                              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/25">
                                {doubtSolution}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-16">
                              <Sparkles className="h-8 w-8 text-violet-400 opacity-40 animate-pulse" />
                              <p className="text-xs">Your lesson AI output workspace. Trigger actions or ask doubt queries on the left panel to begin.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation footer buttons */}
              {nextLessonObj && (
                <div className="border-t pt-5 mt-4 flex justify-end dark:border-slate-800">
                  <Button
                    onClick={() => handleLessonSelect(nextLessonObj)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    Next Lesson: {nextLessonObj.title}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
