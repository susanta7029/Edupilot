"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Flame, 
  Clock, 
  Bookmark, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Play, 
  Award,
  BookOpen,
  User,
  Star,
  Users as UsersIcon,
  Sparkle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";

interface DashboardData {
  streak: number;
  studyTime: number;
  bookmarkCount: number;
  savedNotesCount: number;
  overallProgressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  courseProgress: any[];
  nextLesson: {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    order: number;
    totalLessons: number;
  } | null;
  achievements: any[];
  careerGoal: string;
  skills: string[];
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load dashboard statistics", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className="h-44 w-full rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-44 rounded bg-muted animate-pulse" />
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-10 w-32 rounded bg-muted animate-pulse" />
            <div className="h-80 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const courseList = data?.courseProgress || [];
  const nextLesson = data?.nextLesson;
  const achievements = data?.achievements || [];

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.user?.name || "Learner"}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 font-light max-w-xl">
              Track your profile targets. Your current goal: <span className="font-bold underline">{data?.careerGoal || "Senior Full-Stack Engineer"}</span>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 shadow-sm border border-amber-100/50 dark:border-amber-900/30">
              <Flame className="h-6 w-6 fill-current animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Daily Streak</p>
              <h3 className="text-2xl font-black mt-0.5">{data?.streak} Days</h3>
            </div>
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Study Time</p>
              <h3 className="text-2xl font-black mt-0.5">{data?.studyTime ? formatTime(data.studyTime) : "0m"}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Saved Notes */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 shadow-sm border border-rose-100/50 dark:border-rose-900/30">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saved Notes</p>
              <h3 className="text-2xl font-black mt-0.5">{data?.savedNotesCount} Notes</h3>
            </div>
          </CardContent>
        </Card>

        {/* Bookmarks / Completions */}
        <Card className="hover:scale-[1.01] transition-transform dark:border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 shadow-sm border border-emerald-100/50 dark:border-emerald-900/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed Lessons</p>
              <h3 className="text-2xl font-black mt-0.5">{data?.completedLessonsCount} / {data?.overallProgressPercent}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PART 10: Continue Learning Highlight Card */}
      {nextLesson && (
        <Card className="border-l-4 border-l-primary overflow-hidden shadow dark:border-slate-800">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1 w-full text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Continue Learning
              </span>
              <h3 className="text-lg font-extrabold">{nextLesson.title}</h3>
              <p className="text-xs text-muted-foreground">
                Lesson {nextLesson.order} of {nextLesson.totalLessons} &bull; {nextLesson.courseTitle}
              </p>
              <div className="flex items-center gap-3 pt-1 w-full sm:max-w-md">
                <Progress value={Math.round((nextLesson.order / nextLesson.totalLessons) * 100)} className="h-2 flex-1" />
                <span className="text-xs font-bold text-muted-foreground shrink-0">
                  {Math.round((nextLesson.order / nextLesson.totalLessons) * 100)}%
                </span>
              </div>
            </div>
            <Link href={`/student/courses/${nextLesson.courseId}?lesson=${nextLesson.id}`} className="shrink-0 w-full md:w-auto">
              <Button variant="gradient" className="w-full flex items-center justify-center gap-1.5 font-bold shadow-md">
                <Play className="h-4 w-4 fill-current" />
                Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Main Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Courses progress list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Active Curricula
            </h2>
            <Link href="/student/courses" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
              Browse Catalog
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {courseList.length === 0 ? (
              <Card className="dark:border-slate-800">
                <CardContent className="p-8 text-center flex flex-col items-center gap-2">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                  <h4 className="font-bold text-sm">No active courses yet</h4>
                  <p className="text-xs text-muted-foreground">Select a category and enroll in your first course.</p>
                  <Link href="/student/courses" className="mt-2">
                    <Button variant="gradient" size="sm">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              courseList.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row">
                    {course.thumbnail && (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="h-32 sm:w-44 w-full object-cover shrink-0" 
                      />
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-left">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[9px] font-bold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {course.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                            {course.totalLessons} Lessons &bull; {course.duration}
                          </span>
                        </div>
                        <h3 className="font-bold text-base leading-snug">{course.title}</h3>
                        
                        {/* Instructor & Level info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {course.instructor}
                          </span>
                          <span>&bull;</span>
                          <span className="capitalize">{course.level}</span>
                        </div>
                      </div>

                      {/* Progress and Action Button */}
                      <div className="flex items-center gap-4 border-t pt-3 dark:border-slate-800">
                        <div className="flex-1 flex items-center gap-3">
                          <Progress value={course.progressPercent} className="h-2 flex-1" />
                          <span className="text-xs font-bold shrink-0">{course.progressPercent}%</span>
                        </div>
                        <Link href={`/student/courses/${course.id}`}>
                          <Button size="sm" variant={course.progressPercent > 0 ? "outline" : "gradient"} className="h-8 px-4 text-xs font-semibold flex items-center gap-1">
                            {course.progressPercent > 0 ? "Study" : "Enroll"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right column: Achievements & AI helper widget */}
        <div className="space-y-6">
          {/* AI Helper Quick Access widget */}
          <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden border-0 shadow-lg">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 h-24 w-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
            <CardHeader className="pb-2 text-left">
              <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-indigo-400">
                <Sparkles className="h-4 w-4" />
                AI Learning Copilot
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Instant study tools powered by Google Gemini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <Link href="/student/ai-tools?tab=chat" className="block">
                <Button size="sm" className="w-full justify-start text-xs border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200">
                  💬 Chat Assistant
                </Button>
              </Link>
              <Link href="/student/ai-tools?tab=quiz" className="block">
                <Button size="sm" className="w-full justify-start text-xs border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200">
                  🎯 Generate Quiz
                </Button>
              </Link>
              <Link href="/student/ai-tools?tab=roadmap" className="block">
                <Button size="sm" className="w-full justify-start text-xs border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200">
                  🗺️ Build Career Roadmap
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Achievements widget */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </h2>
            <Card className="dark:border-slate-800">
              <CardContent className="p-4 flex flex-col gap-3">
                {achievements.map((ach) => (
                  <div key={ach.id} className="flex items-start gap-3 p-2.5 rounded-lg border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <span className="text-2xl shrink-0 leading-none">{ach.icon}</span>
                    <div className="text-left">
                      <h4 className="text-xs font-bold leading-none">{ach.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
