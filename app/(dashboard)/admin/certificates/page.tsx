"use client";

import React from "react";
import { 
  Plus, 
  Award, 
  Trash2, 
  Search, 
  Loader2, 
  Download, 
  ShieldCheck, 
  CheckCircle, 
  User 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
}

interface Certificate {
  id: string;
  certificateId: string;
  userId: string;
  courseId: string;
  user: { name: string; email: string };
  course: { title: string };
  issuedAt: string;
}

export default function ManageCertificates() {
  const { toast } = useToast();

  const [students, setStudents] = React.useState<Student[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  // Issue form state
  const [selectedStudentId, setSelectedStudentId] = React.useState("");
  const [selectedCourseId, setSelectedCourseId] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      const [studentsRes, coursesRes, certsRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/certificates"),
      ]);

      if (studentsRes.ok && coursesRes.ok && certsRes.ok) {
        setStudents(await studentsRes.json());
        setCourses(await coursesRes.json());
        setCertificates(await certsRes.json());
      }
    } catch (e) {
      toast("Error loading certificates registry", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenIssue = () => {
    if (students.length > 0) setSelectedStudentId(students[0].id);
    if (courses.length > 0) setSelectedCourseId(courses[0].id);
    setModalOpen(true);
  };

  const onIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;
    setSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudentId,
          courseId: selectedCourseId,
        }),
      });

      if (res.ok) {
        toast("Certificate issued successfully!", "success");
        setModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        toast(err.error || "Failed to issue certificate", "error");
      }
    } catch (e) {
      toast("Certificate generation error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRevokeCertificate = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this certificate? This action is permanent.")) return;
    try {
      const res = await fetch(`/api/admin/certificates?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Certificate revoked", "success");
        loadData();
      }
    } catch (e) {
      toast("Failed to revoke certificate", "error");
    }
  };

  // Filter based on search
  const filteredCertificates = certificates.filter((cert) => {
    const matchUser = cert.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      cert.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCourse = cert.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchId = cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchUser || matchCourse || matchId;
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
            <Award className="h-6 w-6 text-primary" />
            Certificates Registry
          </h1>
          <p className="text-xs text-muted-foreground">Manage platform credentials, generate completion certificates, and verify serial codes.</p>
        </div>
        <Button onClick={handleOpenIssue} variant="gradient" className="flex items-center gap-1.5 font-bold h-9 text-xs shadow-md">
          <Plus className="h-4 w-4" /> Issue Certificate
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student, course, or serial ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card/60"
        />
      </div>

      {/* Registry Table */}
      {filteredCertificates.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
          <Award className="h-10 w-10 mx-auto opacity-45 mb-2" />
          <h3 className="font-extrabold text-sm">No certificates issued</h3>
          <p className="text-xs text-muted-foreground">Issue a certificate manually using the control deck above.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto border rounded-xl dark:border-slate-800 bg-card/60 backdrop-blur-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b dark:border-slate-800 font-bold uppercase text-[9px] text-muted-foreground tracking-wider">
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Course Completion</th>
                <th className="px-5 py-3.5 font-mono">Serial Certificate ID</th>
                <th className="px-5 py-3.5">Issued Date</th>
                <th className="px-5 py-3.5">Verify Status</th>
                <th className="px-5 py-3.5 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} className="border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="px-5 py-4">
                    <p className="font-bold flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {cert.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 pl-4.5">{cert.user.email}</p>
                  </td>
                  <td className="px-5 py-4 font-bold">{cert.course.title}</td>
                  <td className="px-5 py-4 font-mono font-bold text-primary tracking-wider">
                    {cert.certificateId}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold text-[10px]">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      onClick={() => handleRevokeCertificate(cert.id)}
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 text-rose-500 hover:bg-rose-50/50"
                      title="Revoke certificate"
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

      {/* Manual Issue Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Issue Student Certificate">
        <form onSubmit={onIssueSubmit} className="space-y-4 text-left">
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
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue Certificate"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
