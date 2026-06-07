"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionRenderer } from "./question-renderer";
import { submitResponse } from "@/actions/response-actions";

interface SurveyFillFormProps {
  surveyId: string;
  questions: {
    id: string;
    type: string;
    title: string;
    description: string;
    required: boolean;
    options: string;
  }[];
}

export function SurveyFillForm({ surveyId, questions }: SurveyFillFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const question of questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          setError(`请回答必填题目: ${question.title}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await submitResponse(surveyId, answers);
    } catch (err: unknown) {
      if (err instanceof Error && "digest" in err) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <QuestionRenderer
                question={question}
                value={answers[question.id] || (question.type === "multiple_choice" ? [] : "")}
                onChange={handleChange}
                index={index}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "提交中..." : "提交问卷"}
        </Button>
      </div>
    </form>
  );
}
