import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QuestionForm } from "@/components/survey/question-form";
import { QuestionCard } from "@/components/survey/question-card";
import { publishSurvey, closeSurvey } from "@/actions/survey-actions";
import { SURVEY_STATUS_LABELS, SurveyStatus } from "@/lib/types";
import { SurveyTitleEditor } from "@/components/survey/survey-title-editor";

export default async function SurveyEditorPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
    },
  });

  if (!survey) notFound();

  const allQuestionIds = survey.questions.map((q) => q.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant={
                survey.status === "published"
                  ? "default"
                  : survey.status === "closed"
                  ? "destructive"
                  : "secondary"
              }
            >
              {SURVEY_STATUS_LABELS[survey.status as SurveyStatus]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {survey._count.responses} 份回答
            </span>
          </div>
          <SurveyTitleEditor survey={survey} />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/admin/surveys/${surveyId}/preview`}>
            <Button variant="outline">预览</Button>
          </Link>
          {survey.status === "draft" && (
            <form
              action={async () => {
                "use server";
                await publishSurvey(surveyId);
              }}
            >
              <Button>发布</Button>
            </form>
          )}
          {survey.status === "published" && (
            <>
              <form
                action={async () => {
                  "use server";
                  await closeSurvey(surveyId);
                }}
              >
                <Button variant="destructive">关闭</Button>
              </form>
              <Link href={`/s/${surveyId}`} target="_blank">
                <Button variant="outline">填写链接</Button>
              </Link>
            </>
          )}
          <Link href={`/admin/surveys/${surveyId}/results`}>
            <Button variant="outline">查看结果</Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            题目 ({survey.questions.length})
          </h2>
          <QuestionForm surveyId={surveyId} />
        </div>

        {survey.questions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">还没有题目，点击上方按钮添加</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {survey.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                surveyId={surveyId}
                index={index}
                total={survey.questions.length}
                allQuestionIds={allQuestionIds}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
