"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  fileUrl: string | null;
  courseId: string;
  course: { title: string };
  _count: { submissions: number };
}

interface Submission {
  id: string;
  userId: string;
  user: { name: string; email: string };
  assignment: { title: string; course: { title: string } };
  fileUrl: string;
  submittedAt: string;
  marks: number | null;
  feedback: string | null;
  status: string; // PENDING, GRADED
}

const assignmentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  deadline: z.string().min(10, "Deadline required"),
  fileUrl: z.string().or(z.string().length(0)),
  courseId: z.string().min(1, "Please select a course"),
});

export default function ManageAssignments() {
  const { toast } = useToast();

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [gradeModalOpen, setGradeModalOpen] = React.useState(false);
  const [activeSubmission, setActiveSubmission] = React.useState<Submission | null>(null);
  
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [gradeMarks, setGradeMarks] = React.useState("");
  const [gradeFeedback, setGradeFeedback] = React.useState("");

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: "", description: "", deadline: "", fileUrl: "", courseId: "" },
  });

  const loadData = React.useCallback(async () => {
    try {
      const [coursesRes, assignmentsRes, submissionsRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/assignments?mode=assignments"),
        fetch("/api/admin/assignments?mode=submissions"),
      ]);

      if (coursesRes.ok && assignmentsRes.ok && submissionsRes.ok) {
        setCourses(await coursesRes.json());
        setAssignments(await assignmentsRes.json());
        setSubmissions(await submissionsRes.json());
      }
    } catch (e) {
      toast("Error loading platform assignments data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleOpenCreate = () => {
    form.reset({ title: "", description: "", deadline: "", fileUrl: "", courseId: courses[0]?.id || "" });
    setModalOpen(true);
  };

  const onAssignmentSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast("Assignment created successfully", "success");
        setModalOpen(false);
        loadData();
      } else {
        toast("Failed to create assignment", "error");
      }
    } catch (e) {
      toast("Error submitting request", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch(`/api/admin/assignments?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Assignment deleted successfully", "success");
        loadData();
      }
    } catch (e) {
      toast("Error deleting assignment", "error");
    }
  };

  // Grade action
  const handleOpenGrade = (sub: Submission) => {
    setActiveSubmission(sub);
    setGradeMarks(sub.marks ? sub.marks.toString() : "");
    setGradeFeedback(sub.feedback || "");
    setGradeModalOpen(true);
  };

  const onGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: activeSubmission.id,
          marks: gradeMarks,
          feedback: gradeFeedback,
        }),
      });

      if (res.ok) {
        toast("Submission graded successfully!", "success");
        setGradeModalOpen(false);
        loadData();
      } else {
        toast("Failed to grade submission", "error");
      }
    } catch (e) {
      toast("Error submitting grades", "error");
    } finally {
      setSubmitLoading(false);
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
            <FileText className="h-6 w-6 text-primary" />
            Assignments Panel
          </h1>
          <p className="text-xs text-muted-foreground">Formulate coding assignments, check deadlines, and review student project PDF files.</p>
        </div>
        <Button onClick={handleOpenCreate} variant="gradient" className="flex items-center gap-1.5 font-bold shadow-md">
          <Plus className="h-4.5 w-4.5" />
          Create Assignment
        </Button>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 mb-6">
          <TabsTrigger value="assignments">Manage Tasks</TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-1">
            Student Submissions
            {submissions.filter(s => s.status === "PENDING").length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: List Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          {assignments.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
              <FileText className="h-10 w-10 mx-auto opacity-40 mb-2" />
              <h3 className="font-extrabold text-sm">No assignments active</h3>
              <p className="text-xs text-muted-foreground">Click &ldquo;Create Assignment&rdquo; to launch courses worksheets.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((ass) => (
                <Card key={ass.id} className="dark:border-slate-800 bg-card/60 backdrop-blur-md flex flex-col justify-between">
                  <CardHeader className="text-left pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                        {ass.course.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Due: {new Date(ass.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-base font-extrabold mt-2 leading-tight">{ass.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-3 mt-1.5">{ass.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 border-t dark:border-slate-800/80 flex items-center justify-between gap-4">
                    <span className="text-[10px] text-muted-foreground font-bold">
                      {ass._count.submissions} submissions
                    </span>
                    <div className="flex items-center gap-1">
                      {ass.fileUrl && (
                        <a href={ass.fileUrl} target="_blank" rel="noreferrer">
                          <Button size="icon" variant="outline" className="h-8 w-8 text-indigo-500" title="Download task blueprint">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button onClick={() => handleDeleteAssignment(ass.id)} size="icon" variant="outline" className="h-8 w-8 text-rose-500" title="Delete assignment">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Submissions grading */}
        <TabsContent value="submissions" className="space-y-4">
          {submissions.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
              <GraduationCap className="h-10 w-10 mx-auto opacity-40 mb-2" />
              <h3 className="font-extrabold text-sm">No submissions received</h3>
              <p className="text-xs text-muted-foreground">Students have not uploaded assignment drafts yet.</p>
            </Card>
          ) : (
            <div className="overflow-x-auto border rounded-xl dark:border-slate-800 bg-card/60 backdrop-blur-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b dark:border-slate-800 font-bold uppercase text-[9px] text-muted-foreground tracking-wider">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Assignment</th>
                    <th className="px-5 py-3.5">Submitted</th>
                    <th className="px-5 py-3.5">File</th>
                    <th className="px-5 py-3.5">Marks</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-5 py-4">
                        <p className="font-bold">{sub.user.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub.user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold">{sub.assignment.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sub.assignment.course.title}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold flex items-center gap-0.5">
                          View PDF <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-5 py-4 font-bold">
                        {sub.marks !== null ? `${sub.marks}/100` : "--"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          sub.status === "GRADED" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}>
                          {sub.status === "GRADED" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button onClick={() => handleOpenGrade(sub)} size="sm" variant="gradient" className="h-7 text-[10px] font-bold">
                          Grade
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assignment Create Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Create Coursework Assignment">
        <form onSubmit={form.handleSubmit(onAssignmentSubmit)} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Course</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...form.register("courseId")}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assignment Title</label>
              <Input placeholder="e.g. Build Redux Shopping Cart" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-[10px] text-rose-500 font-semibold">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deadline Date</label>
              <Input type="date" {...form.register("deadline")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Blueprint Reference File URL</label>
            <Input placeholder="https://..." {...form.register("fileUrl")} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instructions (Markdown Supported)</label>
            <Textarea placeholder="Explain assignment expectations..." rows={4} {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-[10px] text-rose-500 font-semibold">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Assignment"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Grading Dialog */}
      <Dialog open={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Grade Student Submission">
        {activeSubmission && (
          <form onSubmit={onGradeSubmit} className="space-y-4 text-left">
            <div className="text-xs bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded border dark:border-slate-800/80 space-y-1">
              <p><span className="font-bold">Student:</span> {activeSubmission.user.name}</p>
              <p><span className="font-bold">Assignment:</span> {activeSubmission.assignment.title}</p>
              <p>
                <span className="font-bold">Attached Document:</span>{" "}
                <a href={activeSubmission.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                  View PDF <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Score / Marks (out of 100)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={gradeMarks}
                onChange={(e) => setGradeMarks(e.target.value)}
                required
                placeholder="e.g. 95"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Evaluation Feedback</label>
              <Textarea
                placeholder="Write constructive evaluation notes..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setGradeModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={submitLoading}>
                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Grades"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
