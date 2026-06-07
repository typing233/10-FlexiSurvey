"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitResponse } from "@/actions/response-actions";

type SkipRule = { id: string; condition: string; targetQuestionOrder: number };
type Question = {
  id: string; type: string; title: string;
  required: boolean; order: number; options: string | null; skipRules: SkipRule[];
};
type Survey = {
  id: string; title: string; description: string | null;
  questions: Question[];
};

export default function SurveyPreview({ survey, isPreview = false }: { survey: Survey; isPreview?: boolean }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const visibleQuestions = useMemo(() => {
    const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
    const visible: Question[] = [];
    let i = 0;

    while (i < sortedQuestions.length) {
      const q = sortedQuestions[i];
      visible.push(q);

      const answer = answers[q.id];
      if (answer && q.skipRules.length > 0) {
        let jumped = false;
        for (const rule of q.skipRules) {
          const cond = JSON.parse(rule.condition);
          let matches = false;
          if (q.type === "MULTIPLE_CHOICE") {
            const selected = tryParseArray(answer);
            matches = selected.includes(cond.value);
          } else {
            matches = answer === cond.value;
          }
          if (matches) {
            const targetIdx = sortedQuestions.findIndex((sq) => sq.order >= rule.targetQuestionOrder);
            if (targetIdx > i) {
              i = targetIdx;
              jumped = true;
              break;
            }
          }
        }
        if (!jumped) i++;
      } else {
        i++;
      }
    }
    return visible;
  }, [survey.questions, answers]);

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleMultiChoice = useCallback((questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = tryParseArray(prev[questionId] || "[]");
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: JSON.stringify(next) };
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPreview) {
      alert("This is a preview. Submission is disabled.");
      return;
    }

    for (const q of visibleQuestions) {
      if (q.required) {
        const ans = answers[q.id];
        if (!ans || ans === "[]") {
          setError(`Please answer: "${q.title}"`);
          return;
        }
      }
    }

    setSubmitting(true);
    setError("");
    try {
      const answerData = visibleQuestions
        .filter((q) => answers[q.id] && answers[q.id] !== "[]")
        .map((q) => ({ questionId: q.id, value: answers[q.id] }));
      await submitResponse(survey.id, answerData);
      router.push(`/s/${survey.id}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{survey.title}</CardTitle>
          {survey.description && <CardDescription>{survey.description}</CardDescription>}
        </CardHeader>
      </Card>

      {visibleQuestions.map((q) => (
        <Card key={q.id} className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {q.type === "SINGLE_CHOICE" && q.options && (
                <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswer(q.id, v)}>
                  {JSON.parse(q.options).map((opt: string) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                      <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.type === "MULTIPLE_CHOICE" && q.options && (
                <div className="space-y-2">
                  {JSON.parse(q.options).map((opt: string) => {
                    const selected = tryParseArray(answers[q.id] || "[]");
                    return (
                      <div key={opt} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${q.id}-${opt}`}
                          checked={selected.includes(opt)}
                          onCheckedChange={() => toggleMultiChoice(q.id, opt)}
                        />
                        <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "TEXT" && (
                <Input
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Your answer"
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {isPreview ? "Submit (Preview)" : submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}

function tryParseArray(val: string): string[] {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
