"use client";

import React from "react";
import { 
  Settings, 
  Database, 
  Sparkles, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Layout,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  platformName: string;
  platformLogo: string;
  platformTheme: string;
  platformEmailSupport: string;
  dbStatus: string;
  geminiStatus: string;
}

export default function PlatformSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<SettingsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Form states
  const [platformName, setPlatformName] = React.useState("");
  const [platformLogo, setPlatformLogo] = React.useState("");
  const [supportEmail, setSupportEmail] = React.useState("");
  const [emailTemplate, setEmailTemplate] = React.useState("default");

  const loadSettings = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const json = await res.json();
        setSettings(json);
        setPlatformName(json.platformName);
        setPlatformLogo(json.platformLogo);
        setSupportEmail(json.platformEmailSupport);
        if (isRefresh) toast("Status checks re-evaluated", "success");
      }
    } catch (e) {
      toast("Error loading platform configurations", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName,
          platformLogo,
          platformEmailSupport: supportEmail,
          emailTemplate,
        }),
      });

      if (res.ok) {
        toast("Platform settings updated successfully", "success");
      } else {
        toast("Failed to save settings", "error");
      }
    } catch (e) {
      toast("Request error", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const dbConnected = settings?.dbStatus?.includes("Healthy") || false;
  const geminiActive = settings?.geminiStatus?.includes("Active") || false;

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 w-44 rounded bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Platform Settings
        </h1>
        <p className="text-xs text-muted-foreground">Configure global branding configurations, evaluate database health, and test Gemini status flags.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: General Branding Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
            <CardHeader className="text-left pb-3">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layout className="h-4.5 w-4.5" />
                General Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform Title</label>
                    <Input
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Logo Symbol</label>
                    <Input
                      value={platformLogo}
                      onChange={(e) => setPlatformLogo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support Email Address</label>
                    <Input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform Theme Preset</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled
                      defaultValue="violet"
                    >
                      <option value="violet">Violet Indigo Gradient (Default)</option>
                      <option value="blue">Slate Emerald Theme</option>
                      <option value="emerald">Cyberpunk Dark Theme</option>
                    </select>
                  </div>
                </div>

                {/* Email Announcements templates */}
                <div className="space-y-1 pt-2 border-t dark:border-slate-800">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-4 w-4 text-primary" />
                    Mail Notification templates
                  </label>
                  <select
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1.5"
                  >
                    <option value="default">Default Announcement template</option>
                    <option value="announcement">New Course Launch template</option>
                    <option value="assignment">Assignment Deadline Reminder template</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2 border-t dark:border-slate-800">
                  <Button type="submit" variant="gradient" className="w-full sm:w-auto text-xs" disabled={saveLoading}>
                    {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Connections Diagnostics check */}
        <div className="md:col-span-1 space-y-6">
          <Card className="dark:border-slate-800 bg-card/60 backdrop-blur-md">
            <CardHeader className="text-left pb-3 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Diagnostics</CardTitle>
                <CardDescription className="text-[10px]">Real-time system health checks.</CardDescription>
              </div>
              <Button
                onClick={() => loadSettings(true)}
                size="icon"
                variant="outline"
                className="h-8 w-8 text-muted-foreground"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-left">
              {/* PostgreSQL status */}
              <div className="p-3.5 border rounded-lg dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex items-start gap-3">
                <div className={`p-2 rounded shrink-0 ${dbConnected ? "bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-500" : "bg-rose-100/50 dark:bg-rose-950/20 text-rose-500"}`}>
                  <Database className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold leading-none">PostgreSQL Database</h4>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug truncate">{settings?.dbStatus}</p>
                </div>
              </div>

              {/* Gemini API Status */}
              <div className="p-3.5 border rounded-lg dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex items-start gap-3">
                <div className={`p-2 rounded shrink-0 ${geminiActive ? "bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-500" : "bg-amber-100/50 dark:bg-amber-950/20 text-amber-500"}`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold leading-none">Google Gemini API</h4>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug truncate">{settings?.geminiStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
