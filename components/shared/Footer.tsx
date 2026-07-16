import Link from "next/link";
import { Compass, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-md py-12 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-gradient">EduPilot AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering students and educators with cutting-edge AI learning companions, roadmaps, and instant doubt solvers.
            </p>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">AI Features</Link></li>
              <li><Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing Plans</Link></li>
              <li><Link href="/student/courses" className="text-muted-foreground hover:text-foreground transition-colors">Course Catalog</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">Student Signup</Link></li>
            </ul>
          </div>

          {/* AI Companion Tools */}
          <div>
            <h4 className="font-semibold text-sm mb-4">AI Companions</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/student/ai-tools?tab=chat" className="text-muted-foreground hover:text-foreground transition-colors">Chat Assistant</Link></li>
              <li><Link href="/student/ai-tools?tab=quiz" className="text-muted-foreground hover:text-foreground transition-colors">Quiz Generator</Link></li>
              <li><Link href="/student/ai-tools?tab=roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap Architect</Link></li>
              <li><Link href="/student/ai-tools?tab=doubt" className="text-muted-foreground hover:text-foreground transition-colors">Instant Doubt Solver</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Security Details</Link></li>
              <li><a href="mailto:support@edupilot.ai" className="text-muted-foreground hover:text-foreground transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-slate-800 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduPilot AI. All rights reserved.</p>
          <p>Created for House of EdTech Full Stack Assignment.</p>
        </div>
      </div>
    </footer>
  );
}
