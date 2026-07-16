"use client";

import React from "react";
import { Users, Edit2, Trash2, Search, Target, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  skills: string[];
  careerGoal: string;
  studyTime: number;
  createdAt: string;
  completedLessons: number;
  bookmarksCount: number;
  quizzesTaken: number;
}

export default function ManageStudents() {
  const { toast } = useToast();

  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [studyMinutesInput, setStudyMinutesInput] = React.useState("");
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const loadStudents = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/students");
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (e) {
      toast("Error loading students list", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setStudyMinutesInput(String(student.studyTime));
    setModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || submitLoading) return;
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingStudent.id,
          studyTime: studyMinutesInput,
        }),
      });

      if (res.ok) {
        toast("Student study minutes updated!", "success");
        setModalOpen(false);
        loadStudents();
      } else {
        toast("Failed to update student metrics", "error");
      }
    } catch (e) {
      toast("Connection error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student? All their quiz records, bookmarks, and progress will be deleted!")) return;
    try {
      const res = await fetch("/api/admin/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast("Student account deleted", "success");
        loadStudents();
      }
    } catch (e) {}
  };

  const filteredStudents = students.filter((s) => {
    const query = search.toLowerCase();
    return s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Student Index
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Review active student cohorts, study times, and complete syllabus benchmarks.</p>
      </div>

      {/* Search Filter */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/50"
        />
      </div>

      {loading ? (
        <div className="h-44 bg-muted animate-pulse rounded-xl" />
      ) : filteredStudents.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto opacity-45 mb-2" />
          <p className="text-sm font-bold">No students registered matching criteria.</p>
        </Card>
      ) : (
        <Card className="dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800 font-bold uppercase text-muted-foreground text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Career Goal</th>
                  <th className="p-4 text-center">Lessons</th>
                  <th className="p-4 text-center">Quizzes</th>
                  <th className="p-4 text-center">Study Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredStudents.map((stud) => (
                  <tr key={stud.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 flex items-center gap-2.5">
                      <img src={stud.avatar} alt={stud.name} className="h-8 w-8 rounded-full border bg-slate-50 object-cover" />
                      <span className="font-bold text-slate-900 dark:text-white">{stud.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{stud.email}</td>
                    <td className="p-4 max-w-xs truncate text-muted-foreground font-medium" title={stud.careerGoal}>
                      {stud.careerGoal}
                    </td>
                    <td className="p-4 text-center font-bold text-primary">{stud.completedLessons}</td>
                    <td className="p-4 text-center font-bold text-indigo-500">{stud.quizzesTaken}</td>
                    <td className="p-4 text-center font-bold text-emerald-500">{stud.studyTime}m</td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <Button onClick={() => handleOpenEdit(stud)} variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(stud.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* dialog modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Adjust Student Metrics"
      >
        <form onSubmit={onSubmit} className="space-y-4 text-left">
          {editingStudent && (
            <div className="flex items-center gap-3 border-b pb-3 dark:border-slate-800 mb-2">
              <img src={editingStudent.avatar} alt={editingStudent.name} className="h-10 w-10 rounded-full border bg-slate-50" />
              <div>
                <h4 className="font-bold text-sm leading-none">{editingStudent.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-1">{editingStudent.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Study Time (minutes)
            </label>
            <Input
              type="number"
              value={studyMinutesInput}
              onChange={(e) => setStudyMinutesInput(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="gradient" className="w-full flex justify-center" disabled={submitLoading}>
            {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
