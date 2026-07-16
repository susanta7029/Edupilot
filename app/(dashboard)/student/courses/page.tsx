"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Compass, BookOpen, Layers, Star, Users as UsersIcon, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  categoryId: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  enrolledCount: number;
  lessonsCount: number;
  progressPercent: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || ""; // e.g. "bookmarked"

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (activeCategory) queryParams.append("category", activeCategory);
      if (initialFilter) queryParams.append("filter", initialFilter);

      const res = await fetch(`/api/student/courses?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Error loading courses list", e);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, initialFilter]);

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          {initialFilter === "bookmarked" ? "Bookmarked Lessons" : "Course Catalog"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {initialFilter === "bookmarked" 
            ? "Your saved curriculum bookmarks and quick reference materials."
            : "Enroll in structured bootcamps and learn with modular lesson tracks."}
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/60"
          />
        </div>

        {/* Category Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="shrink-0 text-xs"
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0 text-xs"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground dark:border-slate-800">
          <Compass className="h-12 w-12 mx-auto opacity-45 mb-2" />
          <h3 className="font-extrabold text-base">No courses found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try adjusting your search criteria or choosing a different category to explore available options.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all dark:border-slate-800">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-44 w-full object-cover shrink-0"
                  />
                )}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[9px] font-bold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {course.category}
                      </span>
                      
                      {/* Rating details */}
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {course.rating.toFixed(1)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base leading-snug line-clamp-1">
                      {course.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>

                    {/* Instructor, Duration, Level */}
                    <div className="flex flex-col gap-2 pt-2 border-t dark:border-slate-800 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          {course.instructor}
                        </span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 shrink-0" />
                          {course.lessonsCount} Lessons
                        </span>
                      </div>

                      {/* Students enrolled */}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                        <UsersIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{course.enrolledCount.toLocaleString()} enrolled</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar and enroll/study button */}
                  <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                    {course.progressPercent > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                          <span>Progress</span>
                          <span>{course.progressPercent}%</span>
                        </div>
                        <Progress value={course.progressPercent} className="h-1.5" />
                      </div>
                    )}
                    <Link href={`/student/courses/${course.id}`} className="block">
                      <Button className="w-full text-xs h-9 font-bold" variant={course.progressPercent > 0 ? "outline" : "default"}>
                        {course.progressPercent > 0 ? "Continue Learning" : "Enroll Now"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
