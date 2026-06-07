import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SURVEY_STATUS_LABELS, SurveyStatus } from "@/lib/types";
import { deleteSurvey } from "@/actions/survey-actions";

export const dynamic = "force-dynamic";

export default async function SurveyListPage() {
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, responses: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">问卷管理</h1>
        <Link href="/admin/surveys/new">
          <Button>创建问卷</Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">
              还没有问卷
            </CardTitle>
            <CardDescription>点击右上角创建你的第一份问卷</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">
                    {survey.title}
                  </CardTitle>
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
                </div>
                <CardDescription className="line-clamp-2">
                  {survey.description || "无描述"}
                </CardDescription>
                <div className="text-xs text-muted-foreground mt-2">
                  {survey._count.questions} 题 · {survey._count.responses} 份回答
                </div>
              </CardHeader>
              <CardFooter className="gap-2 flex-wrap">
                <Link href={`/admin/surveys/${survey.id}`}>
                  <Button variant="outline" size="sm">
                    编辑
                  </Button>
                </Link>
                {survey.status === "published" && (
                  <Link href={`/s/${survey.id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      填写链接
                    </Button>
                  </Link>
                )}
                <Link href={`/admin/surveys/${survey.id}/results`}>
                  <Button variant="outline" size="sm">
                    结果
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteSurvey(survey.id);
                  }}
                >
                  <Button variant="ghost" size="sm" className="text-destructive">
                    删除
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
