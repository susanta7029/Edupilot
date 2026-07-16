"use client";

import React from "react";
import { 
  Users, 
  BookOpen, 
  Sparkles, 
  CheckSquare, 
  TrendingUp, 
  Crown,
  Award,
  BookMarked,
  Activity,
  FileText,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  metrics: {
    totalStudents: number;
    totalCourses: number;
    totalLessons: number;
    totalCertificates: number;
    totalAssignments: number;
    totalQuizzes: number;
    activeEnrollments: number;
    completionRate: number;
    dailyActiveUsers: number;
  };
  monthlyEnrollments: any[];
  coursePopularity: any[];
  studentProgress: any[];
  quizScores: any[];
  recentStudents: any[];
  recentCourses: any[];
  recentCertificates: any[];
  recentAIUsage: any[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          toast("Failed to load back-office metrics", "error");
        }
      } catch (e) {
        toast("Connection error", "error");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 w-44 rounded bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[320px] rounded-xl bg-muted" />
          <div className="h-[320px] rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  const COLORS = ["#8b5cf6", "#6366f1", "#10b981", "#f43f5e", "#f59e0b"];
  const metrics = data?.metrics;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight">Admin Overview</h1>
        <p className="text-xs text-muted-foreground">Monitor platform registration metrics, lessons completed, and AI API credits usage.</p>
      </div>

      {/* Metric Cards Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.totalStudents}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-500 flex items-center justify-center border border-violet-100/50 dark:border-violet-900/30 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Courses */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Courses</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.totalCourses}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active Enrollments */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Enrollments</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.activeEnrollments.toLocaleString()}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Lessons */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Lessons</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.totalLessons}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/30 shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Certificates Issued */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Certificates Issued</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.totalCertificates}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center border border-amber-100/50 dark:border-amber-900/30 shadow-sm">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assignments</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.totalAssignments}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center border border-rose-100/50 dark:border-rose-900/30 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completion Rate</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.completionRate}%</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 flex items-center justify-center border border-cyan-100/50 dark:border-cyan-900/30 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Daily Active Users */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Daily Active Users</p>
              <h3 className="text-2xl font-black mt-1">{metrics?.dailyActiveUsers}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-500 flex items-center justify-center border border-teal-100/50 dark:border-teal-900/30 shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Graphics */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Enrollments Area Chart */}
          <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Monthly Enrollments</CardTitle>
              <CardDescription className="text-xs">Timeline growth index of enrolled student seats.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyEnrollments || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                  <XAxis dataKey="month" className="text-[10px] font-bold" />
                  <YAxis className="text-[10px] font-bold" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Popularity Bar Chart */}
          <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Top Courses by Enrollment</CardTitle>
              <CardDescription className="text-xs">Total registered student metrics by syllabus topic.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.coursePopularity || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                  <XAxis dataKey="name" className="text-[9px] font-bold" />
                  <YAxis className="text-[10px] font-bold" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {(data?.coursePopularity || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quiz Scores bar */}
          <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Average Quiz Scores (%)</CardTitle>
              <CardDescription className="text-xs">Syllabus test scores across student cohorts.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.quizScores || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                  <XAxis dataKey="name" className="text-[9px] font-bold" />
                  <YAxis className="text-[10px] font-bold" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student Progress Chart */}
          <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
            <CardHeader className="text-left pb-2">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Syllabus Progress Buckets</CardTitle>
              <CardDescription className="text-xs">Distribution of cohort completion percentages.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.studentProgress || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/40" />
                  <XAxis dataKey="name" className="text-[9px] font-bold" />
                  <YAxis className="text-[10px] font-bold" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                  <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Logs (Split grids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card className="dark:border-slate-800 bg-card/50">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5" />
              Recently Registered Students
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col border-t dark:border-slate-800">
              {(data?.recentStudents || []).map((student, idx) => (
                <div key={idx} className="flex justify-between items-center px-5 py-3 border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <div className="text-left truncate flex-1 pr-4">
                    <p className="text-xs font-bold truncate">{student.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{student.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently Created Courses */}
        <Card className="dark:border-slate-800 bg-card/50">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5" />
              Recently Created Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col border-t dark:border-slate-800">
              {(data?.recentCourses || []).map((course, idx) => (
                <div key={idx} className="flex justify-between items-center px-5 py-3 border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <div className="text-left truncate flex-1 pr-4">
                    <p className="text-xs font-bold truncate">{course.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">Instructor: {course.instructor}</p>
                  </div>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded capitalize shrink-0">
                    {course.level}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest Certificates */}
        <Card className="dark:border-slate-800 bg-card/50">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5" />
              Latest Certificates Issued
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col border-t dark:border-slate-800">
              {(data?.recentCertificates || []).map((cert, idx) => (
                <div key={idx} className="flex justify-between items-center px-5 py-3 border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <div className="text-left truncate flex-1 pr-4">
                    <p className="text-xs font-bold truncate">{cert.user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{cert.course.title}</p>
                  </div>
                  <span className="text-[10px] text-indigo-500 font-bold font-mono shrink-0">
                    {cert.certificateId}
                  </span>
                </div>
              ))}
              {(data?.recentCertificates || []).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-6">No certificates issued yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest AI Usage */}
        <Card className="dark:border-slate-800 bg-card/50">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5" />
              Latest AI Assistant Queries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col border-t dark:border-slate-800">
              {(data?.recentAIUsage || []).map((usage, idx) => (
                <div key={idx} className="flex justify-between items-center px-5 py-3 border-b last:border-b-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <div className="text-left truncate flex-1 pr-4">
                    <p className="text-xs font-bold truncate">{usage.user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">Prompt: &ldquo;{usage.message}&rdquo;</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                    {new Date(usage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {(data?.recentAIUsage || []).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-6">No AI requests logged in this session.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
