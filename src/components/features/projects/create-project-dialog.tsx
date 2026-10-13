"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProject } from "@/lib/api/projects";
import { createProjectSchema } from "@/lib/types/project";
export function CreateProjectDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const parsed = createProjectSchema.safeParse({
      name: data.get("name"),
      owner: data.get("owner"),
      description: data.get("description"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createProject(parsed.data);
      toast.success("Project created");
      setOpen(false);
      onCreated();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create project";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) {
          setOpen(value);
          setError("");
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Give your next initiative a home in the workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium"
            >
              Project name
            </label>
            <Input
              id="project-name"
              name="name"
              required
              minLength={3}
              maxLength={80}
              placeholder="e.g. Customer onboarding"
              disabled={saving}
            />
          </div>
          <div>
            <label
              htmlFor="project-owner"
              className="mb-2 block text-sm font-medium"
            >
              Owner
            </label>
            <Input
              id="project-owner"
              name="owner"
              required
              minLength={2}
              maxLength={80}
              placeholder="Team or person"
              disabled={saving}
            />
          </div>
          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <Input
              id="project-description"
              name="description"
              maxLength={500}
              placeholder="What will this project achieve?"
              disabled={saving}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
