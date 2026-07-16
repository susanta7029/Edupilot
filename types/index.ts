import { User, Course, Lesson, Category, Resource, Progress, Bookmark } from "@prisma/client";

export interface CourseWithDetails extends Course {
  category: Category;
  lessons: Lesson[];
  resources: Resource[];
}

export interface StudentWithProgress extends User {
  progress: Progress[];
  bookmarks: Bookmark[];
}

export interface RoadmapStep {
  title: string;
  desc: string;
  duration: string;
  status: "pending" | "current" | "completed";
}

export interface RoadmapData {
  title: string;
  steps: RoadmapStep[];
}

export interface AIChatMessage {
  role: "user" | "model";
  content: string;
}

export interface LessonWithStatus extends Lesson {
  completed?: boolean;
  bookmarked?: boolean;
}
