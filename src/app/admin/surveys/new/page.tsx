"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSurvey } from "@/actions/survey-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const survey = await createSurvey(title, description || undefined);
    router.push(`/admin/surveys/${survey.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create New Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter survey title"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter survey description"
          />
        </div>
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Creating..." : "Create Survey"}
        </Button>
      </form>
    </div>
  );
}
