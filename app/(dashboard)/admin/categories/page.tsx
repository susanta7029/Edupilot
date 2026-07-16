"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FolderTree, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { courses: number };
}

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
});

type CategoryValues = z.infer<typeof categorySchema>;

export default function ManageCategories() {
  const { toast } = useToast();
  
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  const loadCategories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json);
      }
    } catch (e) {
      toast("Error loading categories", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    reset({ name: "", slug: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setValue("name", cat.name);
    setValue("slug", cat.slug);
    setValue("description", cat.description || "");
    setModalOpen(true);
  };

  const onSubmit = async (data: CategoryValues) => {
    setSubmitLoading(true);
    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory 
        ? { id: editingCategory.id, ...data }
        : data;

      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast(
          editingCategory ? "Category updated successfully!" : "Category created successfully!",
          "success"
        );
        setModalOpen(false);
        loadCategories();
      } else {
        const err = await res.json();
        toast(err.error || "Failed to save category", "error");
      }
    } catch (e) {
      toast("Connection error", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All associated courses will be deleted!")) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast("Category deleted", "success");
        loadCategories();
      } else {
        toast("Failed to delete category", "error");
      }
    } catch (e) {
      toast("Connection error", "error");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            Curriculum Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Classify your courses into clean target tracks.</p>
        </div>
        <Button onClick={handleOpenCreate} variant="gradient" className="flex items-center gap-1">
          <Plus className="h-4.5 w-4.5" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="h-44 bg-muted animate-pulse rounded-xl" />
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FolderTree className="h-10 w-10 mx-auto opacity-40 mb-2" />
          <p className="text-sm font-bold">No categories exist.</p>
          <p className="text-xs mt-1">Click the button above to build your first taxonomy.</p>
        </Card>
      ) : (
        <Card className="dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800 font-bold uppercase text-muted-foreground text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Courses count</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                    <td className="p-4 font-mono text-[11px] text-muted-foreground">{cat.slug}</td>
                    <td className="p-4 max-w-xs truncate text-muted-foreground">{cat.description || "—"}</td>
                    <td className="p-4 text-center font-bold text-primary">{cat._count.courses}</td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button onClick={() => handleOpenEdit(cat)} variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(cat.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-700">
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
        title={editingCategory ? "Edit Category Details" : "Create New Category"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Category Name</label>
            <Input
              {...register("name")}
              placeholder="e.g. Artificial Intelligence"
              onChange={(e) => {
                setValue("name", e.target.value);
                // Auto generate slug
                if (!editingCategory) {
                  setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }
              }}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">URL Slug</label>
            <Input {...register("slug")} placeholder="e.g. artificial-intelligence" />
            {errors.slug && <p className="text-xs text-rose-500">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <Textarea {...register("description")} placeholder="Provide background context on this field of study..." />
          </div>

          <Button type="submit" variant="gradient" className="w-full flex justify-center" disabled={submitLoading}>
            {submitLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingCategory ? (
              "Save Category"
            ) : (
              "Create Category"
            )}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
