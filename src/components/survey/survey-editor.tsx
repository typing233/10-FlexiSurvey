"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateSurvey, deleteSurvey } from "@/actions/survey-actions";
import { addQuestion, updateQuestion, deleteQuestion, addSkipRule, deleteSkipRule } from "@/actions/question-actions";
import Link from "next/link";

type SkipRule = { id: string; questionId: string; condition: string; targetQuestionOrder: number };
type Question = {
  id: string; surveyId: string; type: string; title: string;
  required: boolean; order: number; options: string | null; skipRules: SkipRule[];
};
type Survey = {
  id: string; title: string; description: string | null;
  isPublished: boolean; maxResponses: number | null;
  questions: Question[]; _count: { responses: number };
};

export default function SurveyEditor({ survey: initialSurvey }: { survey: Survey }) {
  const router = useRouter();
  const [survey, setSurvey] = useState(initialSurvey);
  const [title, setTitle] = useState(survey.title);
  const [description, setDescription] = useState(survey.description || "");
  const [maxResponses, setMaxResponses] = useState(survey.maxResponses?.toString() || "");
  const [newQuestion, setNewQuestion] = useState({ type: "SINGLE_CHOICE", title: "", required: false, options: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ type: "", title: "", required: false, options: "" });
  const [skipForm, setSkipForm] = useState({ questionId: "", value: "", targetOrder: "" });

  async function handleUpdateSurvey() {
    const updated = await updateSurvey(survey.id, {
      title,
      description: description || undefined,
      maxResponses: maxResponses ? parseInt(maxResponses) : null,
    });
    setSurvey((s) => ({ ...s, ...updated }));
  }

  async function handleTogglePublish() {
    const updated = await updateSurvey(survey.id, { isPublished: !survey.isPublished });
    setSurvey((s) => ({ ...s, isPublished: updated.isPublished }));
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this survey?")) return;
    await deleteSurvey(survey.id);
    router.push("/admin/surveys");
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.title.trim()) return;
    const options = newQuestion.type !== "TEXT"
      ? newQuestion.options.split("\n").filter((o) => o.trim())
      : undefined;
    const q = await addQuestion(survey.id, {
      type: newQuestion.type,
      title: newQuestion.title,
      required: newQuestion.required,
      options,
    });
    setSurvey((s) => ({
      ...s,
      questions: [...s.questions, { ...q, skipRules: [], options: q.options }],
    }));
    setNewQuestion({ type: "SINGLE_CHOICE", title: "", required: false, options: "" });
  }

  async function handleUpdateQuestion(id: string) {
    const options = editForm.type !== "TEXT"
      ? editForm.options.split("\n").filter((o) => o.trim())
      : undefined;
    await updateQuestion(id, survey.id, {
      type: editForm.type,
      title: editForm.title,
      required: editForm.required,
      options,
    });
    setSurvey((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === id
          ? { ...q, type: editForm.type, title: editForm.title, required: editForm.required, options: options ? JSON.stringify(options) : null }
          : q
      ),
    }));
    setEditingId(null);
  }

  async function handleDeleteQuestion(id: string) {
    await deleteQuestion(id, survey.id);
    setSurvey((s) => ({ ...s, questions: s.questions.filter((q) => q.id !== id) }));
  }

  async function handleAddSkipRule(e: React.FormEvent) {
    e.preventDefault();
    if (!skipForm.questionId || !skipForm.value || !skipForm.targetOrder) return;
    const condition = JSON.stringify({ operator: "equals", value: skipForm.value });
    const rule = await addSkipRule(skipForm.questionId, survey.id, {
      condition,
      targetQuestionOrder: parseInt(skipForm.targetOrder),
    });
    setSurvey((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === skipForm.questionId ? { ...q, skipRules: [...q.skipRules, rule] } : q
      ),
    }));
    setSkipForm({ questionId: "", value: "", targetOrder: "" });
  }

  async function handleDeleteSkipRule(ruleId: string, questionId: string) {
    await deleteSkipRule(ruleId, survey.id);
    setSurvey((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, skipRules: q.skipRules.filter((r) => r.id !== ruleId) } : q
      ),
    }));
  }

  function startEditing(q: Question) {
    setEditingId(q.id);
    setEditForm({
      type: q.type,
      title: q.title,
      required: q.required,
      options: q.options ? JSON.parse(q.options).join("\n") : "",
    });
  }

  const selectedQuestionForSkip = survey.questions.find((q) => q.id === skipForm.questionId);

  return (
    <div className="space-y-6">
      {/* Survey Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Survey Settings</CardTitle>
            <div className="flex gap-2">
              <Link href={`/admin/surveys/${survey.id}/preview`}>
                <Button variant="outline" size="sm">Preview</Button>
              </Link>
              <Link href={`/admin/surveys/${survey.id}/results`}>
                <Button variant="outline" size="sm">Results</Button>
              </Link>
              <Button variant={survey.isPublished ? "secondary" : "default"} size="sm" onClick={handleTogglePublish}>
                {survey.isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Max Responses (empty = unlimited)</Label>
              <Input type="number" value={maxResponses} onChange={(e) => setMaxResponses(e.target.value)} min="1" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleUpdateSurvey} size="sm">Save Settings</Button>
          {survey.isPublished && (
            <p className="text-sm text-green-600">
              Public link: <code className="bg-gray-100 px-2 py-0.5 rounded">/s/{survey.id}</code>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({survey.questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {survey.questions.map((q) => (
            <div key={q.id} className="border rounded-lg p-4">
              {editingId === q.id ? (
                <div className="space-y-3">
                  <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  <div className="flex gap-4">
                    <Select value={editForm.type} onValueChange={(v) => v && setEditForm({ ...editForm, type: v })}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        <SelectItem value="TEXT">Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={editForm.required} onCheckedChange={(c) => setEditForm({ ...editForm, required: !!c })} />
                      Required
                    </label>
                  </div>
                  {editForm.type !== "TEXT" && (
                    <textarea
                      className="w-full border rounded p-2 text-sm"
                      rows={3}
                      placeholder="One option per line"
                      value={editForm.options}
                      onChange={(e) => setEditForm({ ...editForm, options: e.target.value })}
                    />
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdateQuestion(q.id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Q{q.order}.</span>
                      <span className="font-medium">{q.title}</span>
                      <Badge variant="outline" className="text-xs">{q.type.replace("_", " ")}</Badge>
                      {q.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                    </div>
                    {q.options && (
                      <p className="text-sm text-gray-500 mt-1">
                        Options: {JSON.parse(q.options).join(", ")}
                      </p>
                    )}
                    {q.skipRules.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {q.skipRules.map((rule) => {
                          const cond = JSON.parse(rule.condition);
                          return (
                            <div key={rule.id} className="flex items-center gap-2 text-xs text-orange-600">
                              <span>If answer = &quot;{cond.value}&quot; → Jump to Q{rule.targetQuestionOrder}</span>
                              <button onClick={() => handleDeleteSkipRule(rule.id, q.id)} className="text-red-500 hover:text-red-700">×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEditing(q)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(q.id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Separator />

          {/* Add Question Form */}
          <form onSubmit={handleAddQuestion} className="space-y-3 border-t pt-4">
            <h3 className="font-medium text-sm">Add Question</h3>
            <div className="flex gap-4">
              <Input
                className="flex-1"
                placeholder="Question text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              />
              <Select value={newQuestion.type} onValueChange={(v) => v && setNewQuestion({ ...newQuestion, type: v })}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                <Checkbox checked={newQuestion.required} onCheckedChange={(c) => setNewQuestion({ ...newQuestion, required: !!c })} />
                Required
              </label>
            </div>
            {newQuestion.type !== "TEXT" && (
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                placeholder="One option per line"
                value={newQuestion.options}
                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
              />
            )}
            <Button type="submit" size="sm">Add Question</Button>
          </form>
        </CardContent>
      </Card>

      {/* Skip Logic */}
      <Card>
        <CardHeader>
          <CardTitle>Skip Logic Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSkipRule} className="space-y-3">
            <p className="text-sm text-gray-500">Configure conditional jumps: when a specific answer is selected, skip to a target question.</p>
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <Label className="text-xs">When question</Label>
                <Select value={skipForm.questionId} onValueChange={(v) => v && setSkipForm({ ...skipForm, questionId: v, value: "" })}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Select question" /></SelectTrigger>
                  <SelectContent>
                    {survey.questions.filter((q) => q.type !== "TEXT").map((q) => (
                      <SelectItem key={q.id} value={q.id}>Q{q.order}. {q.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Answer equals</Label>
                {selectedQuestionForSkip?.options ? (
                  <Select value={skipForm.value} onValueChange={(v) => v && setSkipForm({ ...skipForm, value: v })}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent>
                      {JSON.parse(selectedQuestionForSkip.options).map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input className="w-40" value={skipForm.value} onChange={(e) => setSkipForm({ ...skipForm, value: e.target.value })} placeholder="Value" />
                )}
              </div>
              <div>
                <Label className="text-xs">Jump to Q#</Label>
                <Input
                  className="w-24"
                  type="number"
                  min="1"
                  max={survey.questions.length}
                  value={skipForm.targetOrder}
                  onChange={(e) => setSkipForm({ ...skipForm, targetOrder: e.target.value })}
                />
              </div>
              <Button type="submit" size="sm">Add Rule</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
