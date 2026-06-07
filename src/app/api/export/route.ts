import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const surveyId = params.get("surveyId");
  const format = params.get("format") || "csv";
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const completed = params.get("completed");

  if (!surveyId) {
    return NextResponse.json({ error: "surveyId required" }, { status: 400 });
  }

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const where: Record<string, unknown> = { surveyId };
  if (completed && completed !== "all") where.completed = completed === "true";
  if (startDate || endDate) {
    const createdAt: Record<string, Date> = {};
    if (startDate) createdAt.gte = new Date(startDate);
    if (endDate) createdAt.lte = new Date(endDate + "T23:59:59");
    where.createdAt = createdAt;
  }

  const responses = await prisma.response.findMany({
    where,
    include: { answers: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = ["#", "Respondent ID", "Submitted At", "Status", ...survey.questions.map((q) => q.title)];
  const rows = responses.map((resp, idx) => {
    const row: string[] = [
      String(idx + 1),
      resp.respondentId.slice(0, 8),
      resp.createdAt.toISOString(),
      resp.completed ? "Completed" : "Incomplete",
    ];
    for (const q of survey.questions) {
      const answer = resp.answers.find((a) => a.questionId === q.id);
      let val = answer?.value || "";
      if (answer && q.type === "MULTIPLE_CHOICE") {
        try { val = JSON.parse(answer.value).join(", "); } catch { /* keep raw */ }
      }
      row.push(val);
    }
    return row;
  });

  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${survey.title}-responses.xlsx"`,
      },
    });
  }

  // CSV
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${survey.title}-responses.csv"`,
    },
  });
}
