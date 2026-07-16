"use client";

import React from "react";
import { 
  Plus, 
  Layers, 
  Trash2, 
  UserPlus, 
  Search, 
  Loader2, 
  Users, 
  BookOpen, 
  CheckSquare, 
  Square 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  enrolledAt: string;
}

export default function ManageEnrollments() {
  const { toast } = useToast();

  const [students, setStudents] = React.useState<Student[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [enrollModalOpen, setEnrollModalOpen] = React.useState(false);
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  // Single enroll form state
  const [selectedStudentId, setSelectedStudentId] = React.useState("");
  const [selectedCourseId, setSelectedCourseId] = React.useState("");

  // Bulk enroll form state
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [bulkTargetCourseId, setBulkTargetCourseId] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/enrollments"),
      ]);

      if (studentsRes.ok && coursesRes.ok && enrollmentsRes.ok) {
        setStudents(await studentsRes.json());
        setCourses(await coursesRes.json());
        setEnrollments(await enrollmentsRes.json());
      }
    } catch (e) {
      toast("Error loading enrollments data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleOpenEnroll = () => {
    if (students.length > 0) setSelectedStudentId(students[0].id);
    if (courses.length > 0) setSelectedCourseId(courses[0].id);
    setEnrollModalOpen(true);
  };

  const handleOpenBulkEnroll = () => {
    setSelectedStudentIds([]);
    if (courses.length > 0) setBulkTargetCourseId(courses[0].id);
    setBulkModalOpen(true);
  };

  const onSingleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudentId,
          courseId: selectedCourseId,
        }),
      });

      if (res.ok) {
        toast("Student enrolled successfully", "success");
        setEnrollModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        toast(err.error || "Failed to enroll student", "error");
      }
    } catch (e) {
      toast("Enrollment request error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const onBulkEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !bulkTargetCourseId) {
      toast("Please select at least one student and a target course", "error");
      return;
    }
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulkUserIds: selectedStudentIds,
          courseId: bulkTargetCourseId,
        }),
      });

      if (res.ok) {
        toast(`Successfully enrolled ${selectedStudentIds.length} students`, "success");
        setBulkModalOpen(false);
        loadData();
      } else {
        toast("Failed bulk enrollment", "error");
      }
    } catch (e) {
      toast("Error submitting bulk request", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRemoveEnrollment = async (userId: string, courseId: string) => {
    if (!confirm("Are you sure you want to remove this student enrollment? Progress will be lost.")) return;
    try {
      const res = await fetch(`/api/admin/enrollments?userId=${userId}&courseId=${courseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Enrollment removed successfully", "success");
        loadData();
      }
    } catch (e) {
      toast("Failed to remove enrollment", "error");
    }
  };

  const toggleStudentSelection = (uid: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  // Filter enrollments based on search
  const filteredEnrollments = enrollments.filter((enroll) => {
    const matchUser = enroll.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      enroll.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = enroll.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchUser || matchCourse;
  });

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
            <Layers className="h-6 w-6 text-primary" />
            Class Enrollments
          </h1>
          <p className="text-xs text-muted-foreground">Monitor student progress states, register users manually, or execute batch bulk enrollments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenEnroll} variant="outline" className="flex items-center gap-1.5 font-bold h-9 text-xs">
            <UserPlus className="h-4 w-4" /> Enroll Learner
          </Button>
          <Button onClick={handleOpenBulkEnroll} variant="gradient" className="flex items-center gap-1.5 font-bold h-9 text-xs shadow-md">
            <Users className="h-4 w-4" /> Bulk Enrollment
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student or course name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card/60"
        />
      </div>

      {/* Enrollments Table */}
      {filteredEnrollments.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
          <Layers className="h-10 w-10 mx-auto opacity-45 mb-2" />
          <h3 className="font-extrabold text-sm">No enrollments match</h3>
          <p className="text-xs text-muted-foreground">Register students using the dashboard helper tools above.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto border rounded-xl dark:border-slate-800 bg-card/60 backdrop-blur-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b dark:border-slate-800 font-bold uppercase text-[9px] text-muted-foreground tracking-wider">
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Course Title</th>
                <th className="px-5 py-3.5">Lessons Completed</th>
                <th className="px-5 py-3.5">Progress Gauge</th>
                <th className="px-5 py-3.5">Enrolled Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enroll) => (
                <tr key={enroll.id} className="border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="px-5 py-4">
                    <p className="font-bold">{enroll.userName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{enroll.userEmail}</p>
                  </td>
                  <td className="px-5 py-4 font-bold">{enroll.courseTitle}</td>
                  <td className="px-5 py-4 font-semibold text-muted-foreground">
                    {enroll.completedLessons} of {enroll.totalLessons} unit{enroll.totalLessons > 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 max-w-[150px] w-full">
                      <Progress value={enroll.progressPercent} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-bold text-muted-foreground shrink-0">{enroll.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(enroll.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      onClick={() => handleRemoveEnrollment(enroll.userId, enroll.courseId)}
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 text-rose-500 hover:bg-rose-50/50"
                      title="Remove enrollment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Single Enroll Dialog */}
      <Dialog open={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} title="Enroll Student in Course">
        <form onSubmit={onSingleEnrollSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setEnrollModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll Student"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Bulk Enroll Dialog */}
      <Dialog open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Student Enrollment">
        <form onSubmit={onBulkEnrollSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Target Course</label>
            <select
              value={bulkTargetCourseId}
              onChange={(e) => setBulkTargetCourseId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center pb-2 border-b dark:border-slate-800">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Students</label>
              <button
                type="button"
                onClick={toggleSelectAllStudents}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto p-1 border rounded-lg dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              {students.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudentSelection(student.id)}
                    className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-left text-xs transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4.5 w-4.5 text-primary shrink-0" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{student.name} ({student.email})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading || selectedStudentIds.length === 0}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Bulk Enroll (${selectedStudentIds.length})`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
