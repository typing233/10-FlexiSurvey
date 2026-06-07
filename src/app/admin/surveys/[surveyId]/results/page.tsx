import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QUESTION_TYPE_LABELS, QuestionType, QuestionOption } from "@/lib/types";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: {
        orderBy: { submittedAt: "desc" },
        include: { answers: true },
      },
    },
  });

  if (!survey) notFound();

  const stats = survey.questions.map((question) => {
    const questionAnswers = survey.responses.flatMap((r) =>
      r.answers.filter((a) => a.questionId === question.id)
    );

    const options: QuestionOption[] = JSON.parse(question.options);

    if (question.type === "single_choice") {
      const distribution = options.map((opt) => ({
        ...opt,
        count: questionAnswers.filter((a) => {
          try {
            return JSON.parse(a.value) === opt.id;
          } catch {
            return false;
          }
        }).length,
      }));
      return { question, distribution, total: questionAnswers.length, type: "choice" as const };
    }

    if (question.type === "multiple_choice") {
      const distribution = options.map((opt) => ({
        ...opt,
        count: questionAnswers.filter((a) => {
          try {
            return (JSON.parse(a.value) as string[]).includes(opt.id);
          } catch {
            return false;
          }
        }).length,
      }));
      return { question, distribution, total: questionAnswers.length, type: "choice" as const };
    }

    const textAnswers = questionAnswers.map((a) => {
      try {
        return JSON.parse(a.value) as string;
      } catch {
        return a.value;
      }
    });
    return { question, textAnswers, total: questionAnswers.length, type: "text" as const };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{survey.title} - 结果</h1>
          <p className="text-muted-foreground mt-1">
            共收到 {survey.responses.length} 份回答
          </p>
        </div>
        <Link href={`/admin/surveys/${surveyId}`}>
          <Button variant="outline">返回编辑</Button>
        </Link>
      </div>

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">统计概览</TabsTrigger>
          <TabsTrigger value="raw">原始数据</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4 mt-4">
          {survey.responses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                暂无回答数据
              </CardContent>
            </Card>
          ) : (
            stats.map((stat) => (
              <Card key={stat.question.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {stat.question.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {QUESTION_TYPE_LABELS[stat.question.type as QuestionType]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.total} 条回答
                  </p>
                </CardHeader>
                <CardContent>
                  {stat.type === "choice" && (
                    <div className="space-y-2">
                      {stat.distribution.map((opt) => {
                        const pct =
                          stat.total > 0
                            ? Math.round((opt.count / stat.total) * 100)
                            : 0;
                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{opt.text}</span>
                              <span className="text-muted-foreground">
                                {opt.count} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {stat.type === "text" && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {stat.textAnswers.length === 0 ? (
                        <p className="text-muted-foreground text-sm">暂无回答</p>
                      ) : (
                        stat.textAnswers.map((text, i) => (
                          <div
                            key={i}
                            className="p-2 bg-muted rounded text-sm"
                          >
                            {text}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          {survey.responses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                暂无回答数据
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>匿名标识</TableHead>
                      <TableHead>提交时间</TableHead>
                      {survey.questions.map((q) => (
                        <TableHead key={q.id} className="min-w-[150px]">
                          {q.title}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {survey.responses.map((response, idx) => (
                      <TableRow key={response.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {response.respondentId.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(response.submittedAt).toLocaleString("zh-CN")}
                        </TableCell>
                        {survey.questions.map((q) => {
                          const answer = response.answers.find(
                            (a) => a.questionId === q.id
                          );
                          if (!answer)
                            return (
                              <TableCell key={q.id} className="text-muted-foreground">
                                -
                              </TableCell>
                            );

                          let display = "";
                          try {
                            const val = JSON.parse(answer.value);
                            if (q.type === "text") {
                              display = val;
                            } else {
                              const options: QuestionOption[] = JSON.parse(q.options);
                              if (Array.isArray(val)) {
                                display = val
                                  .map((id: string) => options.find((o) => o.id === id)?.text || id)
                                  .join(", ");
                              } else {
                                display = options.find((o) => o.id === val)?.text || val;
                              }
                            }
                          } catch {
                            display = answer.value;
                          }

                          return (
                            <TableCell key={q.id} className="text-sm">
                              {display}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
