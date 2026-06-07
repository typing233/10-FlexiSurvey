import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionRenderer } from "@/components/survey/question-renderer";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!survey) notFound();

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-center justify-between">
        <span className="text-sm text-yellow-800 font-medium">
          预览模式 — 此页面仅用于查看问卷效果，提交功能已禁用
        </span>
        <Link href={`/admin/surveys/${surveyId}`}>
          <Button variant="outline" size="sm">
            返回编辑
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          {survey.description && (
            <p className="text-muted-foreground mt-2">{survey.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {survey.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <QuestionRenderer
                  question={question}
                  value={question.type === "multiple_choice" ? [] : ""}
                  onChange={() => {}}
                  index={index}
                  disabled
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button className="w-full" disabled>
            提交问卷（预览模式）
          </Button>
        </div>
      </div>
    </div>
  );
}
