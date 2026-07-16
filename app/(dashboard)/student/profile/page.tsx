"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  Target, 
  Badge, 
  Clock, 
  Calendar, 
  Save, 
  Loader2,
  CheckCircle,
  Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  careerGoal: z.string().optional(),
  skillsInput: z.string().optional(),
  avatar: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      careerGoal: "",
      skillsInput: "",
      avatar: "",
    },
  });

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) {
          const json = await res.json();
          setProfileData(json);
          setValue("name", json.name);
          setValue("careerGoal", json.careerGoal || "");
          setValue("skillsInput", json.skills.join(", "));
          setValue("avatar", json.avatar || "");
        }
      } catch (e) {
        console.error("Error fetching student profile", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: ProfileValues) => {
    setSaving(true);
    const skillsArray = data.skillsInput
      ? data.skillsInput.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          careerGoal: data.careerGoal,
          skills: skillsArray,
          avatar: data.avatar,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        
        // Notify NextAuth to update session token cache
        await updateSession({
          name: updated.name,
          avatar: updated.avatar,
        });

        toast("Profile configuration saved successfully!", "success");
      } else {
        toast("Failed to update profile settings", "error");
      }
    } catch (e) {
      toast("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPreset = (seed: string) => {
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
    setValue("avatar", newAvatar);
    toast("Avatar preset selected!", "info");
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left animate-pulse">
        <div className="h-10 w-44 rounded bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 rounded-xl bg-muted md:col-span-1" />
          <div className="h-[400px] rounded-xl bg-muted md:col-span-2" />
        </div>
      </div>
    );
  }

  const joinDate = profileData?.createdAt 
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, career targets, and study metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Widget */}
        <div className="md:col-span-1 space-y-6">
          <Card className="dark:border-slate-800">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              {profileData?.avatar ? (
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="h-24 w-24 rounded-full border bg-slate-50 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-12 w-12" />
                </div>
              )}
              
              <div>
                <h3 className="font-extrabold text-base leading-none">{profileData?.name}</h3>
                <p className="text-xs text-muted-foreground mt-2">{profileData?.email}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-violet-500 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded mt-3">
                  {profileData?.role}
                </span>
              </div>

              <hr className="w-full dark:border-slate-800" />

              <div className="w-full space-y-3.5 text-left text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-slate-400" />
                  <span>Logged {profileData?.studyTime} minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick presets for avatar */}
          <Card className="dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avatar presets</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              {["Simba", "Nala", "Mufasa", "Timon"].map((name) => (
                <button
                  key={name}
                  onClick={() => handleAvatarPreset(name)}
                  className="h-10 w-10 rounded-full border overflow-hidden bg-slate-50 hover:border-primary active:scale-95 transition-all shadow-sm flex items-center justify-center"
                  title={`Select avatar seed: ${name}`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <Card className="dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-extrabold">Edit Profile</CardTitle>
              <CardDescription className="text-xs">Configure your primary learning values.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                  <Input {...register("name")} className="bg-card/50" />
                  {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                </div>

                {/* Career Goal */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    Career Goal / Direction
                  </label>
                  <Textarea
                    {...register("careerGoal")}
                    placeholder="e.g. Become a Senior Full-Stack Engineer specializing in AI tools"
                    className="min-h-[90px] bg-card/50"
                  />
                </div>

                {/* Skills tags */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Badge className="h-3.5 w-3.5" />
                    Skills (comma-separated list)
                  </label>
                  <Input
                    {...register("skillsInput")}
                    placeholder="e.g. React, Next.js, Postgres, Tailwind"
                    className="bg-card/50"
                  />
                </div>

                {/* Avatar URL direct input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Avatar image URL</label>
                  <Input {...register("avatar")} placeholder="https://example.com/avatar.png" className="bg-card/50" />
                </div>

                {/* Active Skills Badges preview */}
                {profileData?.skills?.length > 0 && (
                  <div className="space-y-2 border-t pt-3 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Current Profile Badges</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {profileData.skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-slate-800 bg-slate-100 dark:text-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full border dark:border-slate-700/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" variant="gradient" disabled={saving} className="w-full mt-4 flex items-center justify-center gap-1.5">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
