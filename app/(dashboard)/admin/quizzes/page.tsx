"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy,
  HelpCircle,
  Loader2,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
}

interface QuizQuestion {
  id: string;
  courseId: string;
  lessonId: string | null;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: string;
  marks: number;
  timeLimit: number;
  course: { title: string };
  lesson?: { title: string } | null;
}

const quizSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  optionA: z.string().min(1, "Option A required"),
  optionB: z.string().min(1, "Option B required"),
  optionC: z.string().min(1, "Option C required"),
  optionD: z.string().min(1, "Option D required"),
  answer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(5, "Explanation required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  marks: z.string().or(z.number()),
  timeLimit: z.string().or(z.number()),
});

export default function ManageQuizzes() {
  const { toast } = useToast();

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState("");
  const [quizzes, setQuizzes] = React.useState<QuizQuestion[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [quizzesLoading, setQuizzesLoading] = React.useState(false);
  const [quizModalOpen, setQuizModalOpen] = React.useState(false);
  const [editingQuiz, setEditingQuiz] = React.useState<QuizQuestion | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const quizForm = useForm<z.infer<typeof quizSchema>>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "A",
      explanation: "",
      difficulty: "Medium",
      marks: "5",
      timeLimit: "10",
    },
  });

  const loadCourses = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
          loadQuizzes(data[0].id);
        }
      }
    } catch (e) {
      toast("Error loading courses list", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadQuizzes = async (courseId: string) => {
    setQuizzesLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes?courseId=${courseId}`);
      if (res.ok) {
        setQuizzes(await res.json());
      }
    } catch (e) {
      toast("Error loading quizzes", "error");
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedCourseId(cid);
    loadQuizzes(cid);
  };

  // Actions
  const handleOpenQuizCreate = () => {
    setEditingQuiz(null);
    quizForm.reset({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "A",
      explanation: "",
      difficulty: "Medium",
      marks: "5",
      timeLimit: "10",
    });
    setQuizModalOpen(true);
  };

  const handleOpenQuizEdit = (quiz: QuizQuestion) => {
    setEditingQuiz(quiz);
    quizForm.setValue("question", quiz.question);
    quizForm.setValue("optionA", quiz.options[0] || "");
    quizForm.setValue("optionB", quiz.options[1] || "");
    quizForm.setValue("optionC", quiz.options[2] || "");
    quizForm.setValue("optionD", quiz.options[3] || "");
    
    // Match answer index to letter A, B, C, D
    const ansIdx = quiz.options.indexOf(quiz.answer);
    const ansLetter = ansIdx === 0 ? "A" : ansIdx === 1 ? "B" : ansIdx === 2 ? "C" : "D";
    quizForm.setValue("answer", ansLetter as any);
    
    quizForm.setValue("explanation", quiz.explanation);
    quizForm.setValue("difficulty", quiz.difficulty as any);
    quizForm.setValue("marks", quiz.marks.toString());
    quizForm.setValue("timeLimit", quiz.timeLimit.toString());
    setQuizModalOpen(true);
  };

  const onQuizSubmit = async (values: z.infer<typeof quizSchema>) => {
    setSubmitLoading(true);
    const options = [values.optionA, values.optionB, values.optionC, values.optionD];
    const answerVal = values.answer === "A" ? values.optionA : values.answer === "B" ? values.optionB : values.answer === "C" ? values.optionC : values.optionD;

    const payload = {
      courseId: selectedCourseId,
      question: values.question,
      options,
      answer: answerVal,
      explanation: values.explanation,
      difficulty: values.difficulty,
      marks: parseInt(values.marks.toString()) || 5,
      timeLimit: parseInt(values.timeLimit.toString()) || 10,
      id: editingQuiz?.id,
    };

    try {
      const res = await fetch("/api/admin/quizzes", {
        method: editingQuiz ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(editingQuiz ? "Quiz question updated" : "Quiz question created", "success");
        setQuizModalOpen(false);
        loadQuizzes(selectedCourseId);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to save quiz question", "error");
      }
    } catch (e) {
      toast("Error submitting quiz", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/quizzes?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Question deleted successfully", "success");
        loadQuizzes(selectedCourseId);
      }
    } catch (e) {
      toast("Error deleting question", "error");
    }
  };

  const handleDuplicateQuiz = async (quiz: QuizQuestion) => {
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: quiz.courseId,
          lessonId: quiz.lessonId,
          question: `${quiz.question} (Copy)`,
          options: quiz.options,
          answer: quiz.answer,
          explanation: quiz.explanation,
          difficulty: quiz.difficulty,
          marks: quiz.marks,
          timeLimit: quiz.timeLimit,
        }),
      });

      if (res.ok) {
        toast("Question duplicated successfully", "success");
        loadQuizzes(selectedCourseId);
      }
    } catch (e) {
      toast("Error duplicating question", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 w-44 rounded bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Quiz Management
          </h1>
          <p className="text-xs text-muted-foreground">Manage curriculum test sheets, configure multiple-choice questions, and define correct responses.</p>
        </div>
        {selectedCourseId && (
          <Button onClick={handleOpenQuizCreate} variant="gradient" className="flex items-center gap-1.5 font-bold shadow-md">
            <Plus className="h-4.5 w-4.5" />
            Add Question
          </Button>
        )}
      </div>

      {/* Select Course dropdown */}
      <Card className="dark:border-slate-800">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4 text-left">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={handleCourseChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      {quizzesLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
          <HelpCircle className="h-10 w-10 mx-auto opacity-40 mb-2" />
          <h3 className="font-extrabold text-sm">No quiz questions configured</h3>
          <p className="text-xs text-muted-foreground">Add questions to enable assessment tools for this course.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, idx) => (
            <Card key={quiz.id} className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
              <CardContent className="p-5 flex flex-col justify-between gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-bold text-primary">Question {idx + 1} &bull; Marks: {quiz.marks}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 font-semibold">{quiz.difficulty}</span>
                  </div>
                  <h3 className="font-extrabold text-base leading-snug">{quiz.question}</h3>
                  
                  {/* Render Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {quiz.options.map((opt, oIdx) => {
                      const isCorrect = opt === quiz.answer;
                      return (
                        <div key={oIdx} className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          isCorrect 
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" 
                            : "border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/10"
                        }`}>
                          <div className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isCorrect ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-300"
                          }`}>
                            {isCorrect && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {quiz.explanation && (
                    <p className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded border dark:border-slate-800/80 mt-2">
                      <span className="font-bold text-indigo-500">Explanation:</span> {quiz.explanation}
                    </p>
                  )}
                </div>

                {/* Operations Footer */}
                <div className="border-t dark:border-slate-800/80 pt-3 flex items-center justify-end gap-2">
                  <Button onClick={() => handleOpenQuizEdit(quiz)} size="sm" variant="outline" className="h-8 px-3 text-xs text-blue-500 flex items-center gap-1">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button onClick={() => handleDuplicateQuiz(quiz)} size="sm" variant="outline" className="h-8 px-3 text-xs text-indigo-500 flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </Button>
                  <Button onClick={() => handleDeleteQuiz(quiz.id)} size="sm" variant="outline" className="h-8 px-3 text-xs text-rose-500 flex items-center gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={quizModalOpen} onClose={() => setQuizModalOpen(false)} title={editingQuiz ? "Edit Question" : "Add Question"}>
        <form onSubmit={quizForm.handleSubmit(onQuizSubmit)} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Question Prompt</label>
            <Textarea placeholder="e.g. Which Hook is used to trigger side-effects in React?" {...quizForm.register("question")} />
            {quizForm.formState.errors.question && (
              <p className="text-[10px] text-rose-500 font-semibold">{quizForm.formState.errors.question.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Option A</label>
              <Input placeholder="Option A value..." {...quizForm.register("optionA")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Option B</label>
              <Input placeholder="Option B value..." {...quizForm.register("optionB")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Option C</label>
              <Input placeholder="Option C value..." {...quizForm.register("optionC")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Option D</label>
              <Input placeholder="Option D value..." {...quizForm.register("optionD")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Correct Answer</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...quizForm.register("answer")}>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Difficulty</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...quizForm.register("difficulty")}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Marks / Points</label>
              <Input type="number" {...quizForm.register("marks")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Explanation of Solution</label>
            <Textarea placeholder="Explain why this answer is correct..." rows={3} {...quizForm.register("explanation")} />
            {quizForm.formState.errors.explanation && (
              <p className="text-[10px] text-rose-500 font-semibold">{quizForm.formState.errors.explanation.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setQuizModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Question"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
