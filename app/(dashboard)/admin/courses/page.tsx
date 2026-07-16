"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  ArrowRight, 
  Video, 
  FileText, 
  Loader2,
  Copy,
  Archive,
  CheckCircle,
  XCircle,
  Tag,
  DollarSign,
  User,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  banner: string | null;
  instructor: string;
  duration: string;
  level: string;
  price: number;
  tags: string[];
  status: string;
  categoryId: string;
  category: { name: string };
  _count: { lessons: number; resources: number };
}

interface Category {
  id: string;
  name: string;
}

const courseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z.string().url("Please enter a valid image URL").or(z.string().length(0)),
  banner: z.string().url("Please enter a valid banner URL").or(z.string().length(0)),
  instructor: z.string().min(2, "Instructor must be specified"),
  duration: z.string().min(2, "Duration must be specified"),
  level: z.string().min(2, "Level must be selected"),
  price: z.string().or(z.number()),
  tags: z.string().optional(),
  status: z.string().min(2),
  categoryId: z.string().min(1, "Please select a category"),
});

export default function ManageCourses() {
  const { toast } = useToast();

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [courseModalOpen, setCourseModalOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  // Forms
  const courseForm = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: { 
      title: "", 
      subtitle: "", 
      description: "", 
      thumbnail: "", 
      banner: "",
      instructor: "Sarah Johnson",
      duration: "10 Hours",
      level: "Intermediate",
      price: "0.00",
      tags: "",
      status: "DRAFT",
      categoryId: "" 
    },
  });

  const loadInitialData = React.useCallback(async () => {
    try {
      const [coursesRes, catsRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/categories"),
      ]);

      if (coursesRes.ok && catsRes.ok) {
        setCourses(await coursesRes.json());
        setCategories(await catsRes.json());
      }
    } catch (e) {
      toast("Error loading platform data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Course Actions
  const handleOpenCourseCreate = () => {
    setEditingCourse(null);
    courseForm.reset({ 
      title: "", 
      subtitle: "", 
      description: "", 
      thumbnail: "", 
      banner: "",
      instructor: "Sarah Johnson",
      duration: "10 Hours",
      level: "Intermediate",
      price: "0.00",
      tags: "",
      status: "DRAFT",
      categoryId: categories[0]?.id || "" 
    });
    setCourseModalOpen(true);
  };

  const handleOpenCourseEdit = (course: Course) => {
    setEditingCourse(course);
    courseForm.setValue("title", course.title);
    courseForm.setValue("subtitle", course.subtitle || "");
    courseForm.setValue("description", course.description);
    courseForm.setValue("thumbnail", course.thumbnail || "");
    courseForm.setValue("banner", course.banner || "");
    courseForm.setValue("instructor", course.instructor);
    courseForm.setValue("duration", course.duration);
    courseForm.setValue("level", course.level);
    courseForm.setValue("price", course.price.toString());
    courseForm.setValue("tags", course.tags?.join(", ") || "");
    courseForm.setValue("status", course.status);
    courseForm.setValue("categoryId", course.categoryId);
    setCourseModalOpen(true);
  };

  const onCourseSubmit = async (values: z.infer<typeof courseSchema>) => {
    setSubmitLoading(true);
    const parsedTags = typeof values.tags === "string" 
      ? values.tags.split(",").map(t => t.trim()).filter(Boolean) 
      : [];

    const payload = {
      ...values,
      tags: parsedTags,
      price: parseFloat(values.price.toString()) || 0.00,
      id: editingCourse?.id,
    };

    try {
      const res = await fetch("/api/admin/courses", {
        method: editingCourse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(editingCourse ? "Course updated successfully" : "Course created successfully", "success");
        setCourseModalOpen(false);
        loadInitialData();
      } else {
        const err = await res.json();
        toast(err.error || "Failed to save course", "error");
      }
    } catch (e) {
      toast("Request error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course and all its lessons?")) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast("Course deleted successfully", "success");
        loadInitialData();
      }
    } catch (e) {
      toast("Failed to delete course", "error");
    }
  };

  const handleDuplicateCourse = async (id: string) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duplicateOfId: id }),
      });

      if (res.ok) {
        toast("Course duplicated successfully", "success");
        loadInitialData();
      } else {
        toast("Failed to duplicate course", "error");
      }
    } catch (e) {
      toast("Duplication request error", "error");
    }
  };

  const toggleCourseStatus = async (course: Course, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...course,
          status: newStatus,
        }),
      });

      if (res.ok) {
        toast(`Course status updated to ${newStatus}`, "success");
        loadInitialData();
      }
    } catch (e) {
      toast("Error updating status", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 w-44 rounded bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Courses Catalog</h1>
          <p className="text-xs text-muted-foreground">Add new bootcamps, manage difficulty levels, pricing, tags, and course statuses.</p>
        </div>
        <Button onClick={handleOpenCourseCreate} variant="gradient" className="flex items-center gap-1.5 font-bold shadow-md">
          <Plus className="h-4.5 w-4.5" />
          Add Course
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="h-full flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow dark:border-slate-800">
            <div>
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-40 w-full object-cover shrink-0"
                />
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                    {course.category.name}
                  </span>
                  
                  {/* Status Badges */}
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    course.status === "PUBLISHED" 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : course.status === "ARCHIVED"
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}>
                    {course.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-base leading-snug line-clamp-1">{course.title}</h3>
                {course.subtitle && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{course.subtitle}</p>
                )}

                <div className="flex flex-col gap-2 pt-3 border-t dark:border-slate-800 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {course.instructor}
                    </span>
                    <span className="capitalize">{course.level}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration}
                    </span>
                    <span className="font-bold text-primary">
                      {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground/80">
                    <span>{course._count.lessons} Lessons</span>
                    <span>{course.enrolledCount} Students Enrolled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Control deck actions */}
            <div className="px-5 py-3 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Button onClick={() => handleOpenCourseEdit(course)} size="icon" variant="outline" className="h-7 w-7 text-blue-500" title="Edit course metadata">
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={() => handleDuplicateCourse(course.id)} size="icon" variant="outline" className="h-7 w-7 text-indigo-500" title="Duplicate course">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {course.status === "PUBLISHED" ? (
                  <Button onClick={() => toggleCourseStatus(course, "DRAFT")} size="icon" variant="outline" className="h-7 w-7 text-amber-500" title="Unpublish (Save draft)">
                    <Archive className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button onClick={() => toggleCourseStatus(course, "PUBLISHED")} size="icon" variant="outline" className="h-7 w-7 text-emerald-500" title="Publish course">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Button onClick={() => handleDeleteCourse(course.id)} size="icon" variant="outline" className="h-7 w-7 text-rose-500" title="Delete course">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Course Edit/Create Dialog */}
      <Dialog open={courseModalOpen} onClose={() => setCourseModalOpen(false)} title={editingCourse ? "Edit Course Metadata" : "Create New Course"}>
        <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course Title</label>
              <Input placeholder="e.g. Next.js 15 Full Stack" {...courseForm.register("title")} />
              {courseForm.formState.errors.title && (
                <p className="text-[10px] text-rose-500 font-semibold">{courseForm.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course Subtitle</label>
              <Input placeholder="e.g. Master state, routing, and databases" {...courseForm.register("subtitle")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
            <Textarea placeholder="Course description details..." rows={3} {...courseForm.register("description")} />
            {courseForm.formState.errors.description && (
              <p className="text-[10px] text-rose-500 font-semibold">{courseForm.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instructor</label>
              <Input {...courseForm.register("instructor")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
              <Input placeholder="e.g. 20 Hours" {...courseForm.register("duration")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Difficulty Level</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...courseForm.register("level")}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price ($)</label>
              <Input type="number" step="0.01" {...courseForm.register("price")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...courseForm.register("categoryId")}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...courseForm.register("status")}>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thumbnail Image URL</label>
              <Input placeholder="https://..." {...courseForm.register("thumbnail")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Banner Image URL</label>
              <Input placeholder="https://..." {...courseForm.register("banner")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tags (comma separated)</label>
            <Input placeholder="React, Frontend, State" {...courseForm.register("tags")} />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setCourseModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Course"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
