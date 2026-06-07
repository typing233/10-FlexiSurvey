"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createQuestion, updateQuestion } from "@/actions/question-actions";
import { QuestionType, QuestionOption, QUESTION_TYPE_LABELS } from "@/lib/types";

interface QuestionFormProps {
  surveyId: string;
  editingQuestion?: {
    id: string;
    type: string;
    title: string;
    description: string;
    required: boolean;
    options: string;
    config: string;
  };
  trigger?: React.ReactNode;
}

export function QuestionForm({ surveyId, editingQuestion, trigger }: QuestionFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QuestionType>(
    (editingQuestion?.type as QuestionType) || "single_choice"
  );
  const [title, setTitle] = useState(editingQuestion?.title || "");
  const [description, setDescription] = useState(editingQuestion?.description || "");
  const [required, setRequired] = useState(editingQuestion?.required ?? true);
  const [options, setOptions] = useState<QuestionOption[]>(
    editingQuestion ? JSON.parse(editingQuestion.options) : [
      { id: crypto.randomUUID(), text: "", order: 0 },
      { id: crypto.randomUUID(), text: "", order: 1 },
    ]
  );
  const [submitting, setSubmitting] = useState(false);

  const needsOptions = type === "single_choice" || type === "multiple_choice";

  function addOption() {
    setOptions([
      ...options,
      { id: crypto.randomUUID(), text: "", order: options.length },
    ]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  }

  function updateOptionText(id: string, text: string) {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    if (needsOptions && options.some((o) => !o.text.trim())) return;

    setSubmitting(true);
    try {
      const data = {
        type,
        title: title.trim(),
        description: description.trim(),
        required,
        options: needsOptions ? options : [],
        config: {},
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, surveyId, data);
      } else {
        await createQuestion(surveyId, data);
      }

      setOpen(false);
      if (!editingQuestion) {
        setTitle("");
        setDescription("");
        setType("single_choice");
        setOptions([
          { id: crypto.randomUUID(), text: "", order: 0 },
          { id: crypto.randomUUID(), text: "", order: 1 },
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={<span />}>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>添加题目</DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "编辑题目" : "添加题目"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>题目类型</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>题目标题</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入题目标题"
            />
          </div>

          <div className="space-y-2">
            <Label>题目说明（可选）</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充说明"
              rows={2}
            />
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label>选项</Label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground w-6">
                      {idx + 1}.
                    </span>
                    <Input
                      value={opt.text}
                      onChange={(e) => updateOptionText(opt.id, e.target.value)}
                      placeholder={`选项 ${idx + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(opt.id)}
                      disabled={options.length <= 2}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                + 添加选项
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="required"
              checked={required}
              onCheckedChange={(v) => setRequired(v === true)}
            />
            <Label htmlFor="required" className="text-sm">
              必填
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="w-full"
          >
            {submitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
