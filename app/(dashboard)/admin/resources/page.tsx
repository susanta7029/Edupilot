"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Plus, Edit2, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  type: string;
  courseId: string;
  course: { title: string };
}

interface Course {
  id: string;
  title: string;
}

const resourceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  fileUrl: z.string().url("Please enter a valid URL"),
  type: z.string().min(1, "Please choose a resource type"),
  courseId: z.string().min(1, "Please select a course link"),
});

type ResourceValues = z.infer<typeof resourceSchema>;

export default function ManageResources() {
  const { toast } = useToast();

  const [resources, setResources] = React.useState<Resource[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ResourceValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { title: "", fileUrl: "", type: "pdf", courseId: "" },
  });

  const loadData = React.useCallback(async () => {
    try {
      const [resList, courseList] = await Promise.all([
        fetch("/api/admin/resources"),
        fetch("/api/admin/courses"),
      ]);

      if (resList.ok && courseList.ok) {
        setResources(await resList.json());
        setCourses(await courseList.json());
      }
    } catch (e) {
      toast("Error loading assets list", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingResource(null);
    reset({ title: "", fileUrl: "", type: "pdf", courseId: courses[0]?.id || "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setValue("title", res.title);
    setValue("fileUrl", res.fileUrl);
    setValue("type", res.type);
    setValue("courseId", res.courseId);
    setModalOpen(true);
  };

  const onSubmit = async (data: ResourceValues) => {
    setSubmitLoading(true);
    try {
      const method = editingResource ? "PUT" : "POST";
      const body = editingResource ? { id: editingResource.id, ...data } : data;

      const res = await fetch("/api/admin/resources", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast(editingResource ? "Resource updated" : "Resource created", "success");
        setModalOpen(false);
        loadData();
      } else {
        toast("Failed to save resource", "error");
      }
    } catch (e) {
      toast("Connection error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource link?")) return;
    try {
      const res = await fetch("/api/admin/resources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast("Resource link deleted", "success");
        loadData();
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Platform Resources
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Upload supplemental reading decks, PDF notes, and references.</p>
        </div>
        <Button onClick={handleOpenCreate} variant="gradient" className="flex items-center gap-1.5" disabled={courses.length === 0}>
          <Plus className="h-4.5 w-4.5" />
          Add Resource
        </Button>
      </div>

      {loading ? (
        <div className="h-44 bg-muted animate-pulse rounded-xl" />
      ) : resources.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto opacity-45 mb-2" />
          <p className="text-sm font-bold">No supplemental links uploaded.</p>
          <p className="text-xs mt-1">Deploy courses first, then click &ldquo;Add Resource&rdquo; above.</p>
        </Card>
      ) : (
        <Card className="dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800 font-bold uppercase text-muted-foreground text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Assigned Course</th>
                  <th className="p-4">Target Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{res.title}</td>
                    <td className="p-4">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                        {res.type}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">{res.course.title}</td>
                    <td className="p-4">
                      <a
                        href={res.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        Visit Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button onClick={() => handleOpenEdit(res)} variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(res.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700">
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
        title={editingResource ? "Edit Resource Attachment" : "Upload Supplementary Resource"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Resource Title</label>
            <Input {...register("title")} placeholder="e.g. Supplementary Notes on DB Index Sharding" />
            {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Link / File URL</label>
            <Input {...register("fileUrl")} placeholder="https://example.com/notes.pdf" />
            {errors.fileUrl && <p className="text-xs text-rose-500">{errors.fileUrl.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Linked Course</label>
            <Select
              {...register("courseId")}
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
            />
            {errors.courseId && <p className="text-xs text-rose-500">{errors.courseId.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Format Type</label>
            <Select
              {...register("type")}
              options={[
                { value: "pdf", label: "PDF Document" },
                { value: "link", label: "Web Link" },
                { value: "video", label: "External Lecture Video" },
              ]}
            />
          </div>

          <Button type="submit" variant="gradient" className="w-full flex justify-center" disabled={submitLoading}>
            {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingResource ? "Save Resource" : "Upload Resource"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
