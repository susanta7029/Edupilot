"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Video, 
  FileText, 
  Loader2,
  BookOpen,
  ArrowRight,
  ExternalLink
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

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  youtubeUrl: string | null;
  pdfUrl: string | null;
  duration: string;
  order: number;
}

const lessonSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  content: z.string().min(10, "Study Notes must be at least 10 characters"),
  youtubeUrl: z.string().or(z.string().length(0)),
  pdfUrl: z.string().or(z.string().length(0)),
  duration: z.string().min(2, "Duration must be specified"),
  order: z.string().optional(),
});

export default function ManageLessons() {
  const { toast } = useToast();

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState("");
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [lessonsLoading, setLessonsLoading] = React.useState(false);
  
  const [lessonModalOpen, setLessonModalOpen] = React.useState(false);
  const [editingLesson, setEditingLesson] = React.useState<Lesson | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const lessonForm = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      content: "", 
      youtubeUrl: "", 
      pdfUrl: "", 
      duration: "15 mins",
      order: "" 
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
          loadLessons(data[0].id);
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

  const loadLessons = async (courseId: string) => {
    setLessonsLoading(true);
    try {
      const res = await fetch(`/api/admin/lessons?courseId=${courseId}`);
      if (res.ok) {
        setLessons(await res.json());
      }
    } catch (e) {
      toast("Error loading course lessons", "error");
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedCourseId(cid);
    loadLessons(cid);
  };

  // Lesson Actions
  const handleOpenLessonCreate = () => {
    setEditingLesson(null);
    lessonForm.reset({ 
      title: "", 
      description: "", 
      content: "", 
      youtubeUrl: "", 
      pdfUrl: "", 
      duration: "15 mins",
      order: "" 
    });
    setLessonModalOpen(true);
  };

  const handleOpenLessonEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    lessonForm.setValue("title", lesson.title);
    lessonForm.setValue("description", lesson.description || "");
    lessonForm.setValue("content", lesson.content);
    lessonForm.setValue("youtubeUrl", lesson.youtubeUrl || "");
    lessonForm.setValue("pdfUrl", lesson.pdfUrl || "");
    lessonForm.setValue("duration", lesson.duration);
    lessonForm.setValue("order", lesson.order.toString());
    setLessonModalOpen(true);
  };

  const onLessonSubmit = async (values: z.infer<typeof lessonSchema>) => {
    setSubmitLoading(true);
    const payload = {
      ...values,
      courseId: selectedCourseId,
      id: editingLesson?.id,
    };

    try {
      const res = await fetch("/api/admin/lessons", {
        method: editingLesson ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(editingLesson ? "Lesson updated" : "Lesson created", "success");
        setLessonModalOpen(false);
        loadLessons(selectedCourseId);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to save lesson", "error");
      }
    } catch (e) {
      toast("Request error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast("Lesson deleted", "success");
        loadLessons(selectedCourseId);
      }
    } catch (e) {
      toast("Error deleting lesson", "error");
    }
  };

  // Reordering
  const handleMoveLesson = async (index: number, direction: "up" | "down") => {
    const updated = [...lessons];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap orders
    const temp = updated[index].order;
    updated[index].order = updated[targetIdx].order;
    updated[targetIdx].order = temp;

    // Sort locally
    updated.sort((a, b) => a.order - b.order);
    setLessons(updated);

    // Save to DB in background
    try {
      const list = updated.map((l, i) => ({ id: l.id, order: i + 1 }));
      await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorderList: list }),
      });
      toast("Lessons order updated", "success");
    } catch (e) {
      toast("Failed to save reorder", "error");
    }
  };

  // Video embed checker
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
            <Video className="h-6 w-6 text-primary" />
            Lessons Workspace
          </h1>
          <p className="text-xs text-muted-foreground">Manage lesson modules, reorder syllabus trees, configure vimeo/youtube players.</p>
        </div>
        {selectedCourseId && (
          <Button onClick={handleOpenLessonCreate} variant="gradient" className="flex items-center gap-1.5 font-bold shadow-md">
            <Plus className="h-4.5 w-4.5" />
            Add Lesson
          </Button>
        )}
      </div>

      {/* Select Course Selection */}
      <Card className="dark:border-slate-800">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4 text-left">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={handleCourseChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Table / List */}
      {lessonsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : lessons.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
          <BookOpen className="h-10 w-10 mx-auto opacity-40 mb-2" />
          <h3 className="font-extrabold text-sm">No lessons in this course</h3>
          <p className="text-xs text-muted-foreground">Click &ldquo;Add Lesson&rdquo; to structure your syllabus.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, idx) => {
            const embed = getEmbedUrl(lesson.youtubeUrl);
            return (
              <Card key={lesson.id} className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
                  <div className="space-y-1 flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Lesson {lesson.order} &bull; {lesson.duration}
                    </span>
                    <h3 className="font-extrabold text-base mt-1">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>
                    )}

                    {/* Resources links display */}
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground flex-wrap">
                      {lesson.youtubeUrl && (
                        <span className="flex items-center gap-0.5 text-blue-500 font-semibold">
                          <Video className="h-3.5 w-3.5" /> Video Configured
                        </span>
                      )}
                      {lesson.pdfUrl && (
                        <a href={lesson.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-rose-500 font-semibold hover:underline">
                          <FileText className="h-3.5 w-3.5" /> Reference PDF <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reorder and management controls */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleMoveLesson(idx, "up")}
                        disabled={idx === 0}
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleMoveLesson(idx, "down")}
                        disabled={idx === lessons.length - 1}
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

                    <Button onClick={() => handleOpenLessonEdit(lesson)} size="icon" variant="outline" className="h-8 w-8 text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteLesson(lesson.id)} size="icon" variant="outline" className="h-8 w-8 text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={lessonModalOpen} onClose={() => setLessonModalOpen(false)} title={editingLesson ? "Edit Lesson Structure" : "Create New Lesson"}>
        <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lesson Title</label>
              <Input placeholder="e.g. Setting up Context Providers" {...lessonForm.register("title")} />
              {lessonForm.formState.errors.title && (
                <p className="text-[10px] text-rose-500 font-semibold">{lessonForm.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration / Study Time</label>
              <Input placeholder="e.g. 15 mins" {...lessonForm.register("duration")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
            <Input placeholder="Brief overview of lesson objectives..." {...lessonForm.register("description")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lecture Video URL (Vimeo/YouTube)</label>
              <Input placeholder="https://youtube.com/..." {...lessonForm.register("youtubeUrl")} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reference PDF/CheatSheet URL</label>
              <Input placeholder="https://cloudinary..." {...lessonForm.register("pdfUrl")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lesson Notes (Markdown Supported)</label>
            <Textarea placeholder="Markdown text notes..." rows={5} {...lessonForm.register("content")} />
            {lessonForm.formState.errors.content && (
              <p className="text-[10px] text-rose-500 font-semibold">{lessonForm.formState.errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setLessonModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Lesson"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
