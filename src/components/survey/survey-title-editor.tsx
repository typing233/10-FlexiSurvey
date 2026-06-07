"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSurvey } from "@/actions/survey-actions";

interface SurveyTitleEditorProps {
  survey: {
    id: string;
    title: string;
    description: string;
  };
}

export function SurveyTitleEditor({ survey }: SurveyTitleEditorProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(survey.title);
  const [description, setDescription] = useState(survey.description);

  async function handleSave() {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    await updateSurvey(survey.id, formData);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div
        className="cursor-pointer group"
        onClick={() => setEditing(true)}
      >
        <h1 className="text-2xl font-bold group-hover:text-primary">
          {survey.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {survey.description || "点击编辑描述"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-bold"
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="问卷描述"
        rows={2}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          保存
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setTitle(survey.title);
            setDescription(survey.description);
            setEditing(false);
          }}
        >
          取消
        </Button>
      </div>
    </div>
  );
}
