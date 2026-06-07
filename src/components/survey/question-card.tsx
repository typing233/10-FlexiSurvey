"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionForm } from "./question-form";
import { deleteQuestion, reorderQuestions } from "@/actions/question-actions";
import { QUESTION_TYPE_LABELS, QuestionType, QuestionOption } from "@/lib/types";

interface QuestionCardProps {
  question: {
    id: string;
    type: string;
    title: string;
    description: string;
    required: boolean;
    options: string;
    config: string;
    order: number;
  };
  surveyId: string;
  index: number;
  total: number;
  allQuestionIds: string[];
}

export function QuestionCard({
  question,
  surveyId,
  index,
  total,
  allQuestionIds,
}: QuestionCardProps) {
  const options: QuestionOption[] = JSON.parse(question.options);

  async function handleMoveUp() {
    const ids = [...allQuestionIds];
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderQuestions(surveyId, ids);
  }

  async function handleMoveDown() {
    const ids = [...allQuestionIds];
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    await reorderQuestions(surveyId, ids);
  }

  async function handleDelete() {
    if (!confirm("确定删除这道题目吗？")) return;
    await deleteQuestion(question.id, surveyId);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Q{index + 1}
              </span>
              <Badge variant="outline" className="text-xs">
                {QUESTION_TYPE_LABELS[question.type as QuestionType]}
              </Badge>
              {question.required && (
                <Badge variant="secondary" className="text-xs">
                  必填
                </Badge>
              )}
            </div>
            <h3 className="font-medium">{question.title}</h3>
            {question.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {question.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveUp}
              disabled={index === 0}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveDown}
              disabled={index === total - 1}
            >
              ↓
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {options.length > 0 && (
          <ul className="text-sm space-y-1 mb-3">
            {options.map((opt, i) => (
              <li key={opt.id} className="text-muted-foreground">
                {question.type === "single_choice" ? "○" : "☐"} {opt.text}
              </li>
            ))}
          </ul>
        )}
        {question.type === "text" && (
          <div className="text-sm text-muted-foreground italic mb-3">
            [文本输入框]
          </div>
        )}
        <div className="flex gap-2">
          <QuestionForm
            surveyId={surveyId}
            editingQuestion={question}
            trigger={
              <Button variant="outline" size="sm">
                编辑
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={handleDelete}
          >
            删除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
