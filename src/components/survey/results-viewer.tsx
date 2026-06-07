"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getResponses } from "@/actions/response-actions";

type Question = { id: string; title: string; type: string; order: number; options: string | null };
type Survey = { id: string; title: string; questions: Question[] };
type Answer = { questionId: string; value: string; question: { title: string } };
type Response = { id: string; respondentId: string; completed: boolean; createdAt: string; answers: Answer[] };

export default function ResultsViewer({ survey }: { survey: Survey }) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [completedFilter, setCompletedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  async function loadResponses() {
    setLoading(true);
    const filters: { startDate?: string; endDate?: string; completed?: boolean } = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (completedFilter !== "all") filters.completed = completedFilter === "true";
    const data = await getResponses(survey.id, filters);
    setResponses(data as unknown as Response[]);
    setLoading(false);
  }

  useEffect(() => { loadResponses(); }, []);

  async function handleExport(format: "csv" | "xlsx") {
    const params = new URLSearchParams({ surveyId: survey.id, format });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (completedFilter !== "all") params.set("completed", completedFilter);
    window.open(`/api/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Results: {survey.title}</h1>
        <Badge variant="secondary">{responses.length} responses</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={completedFilter} onValueChange={(v) => setCompletedFilter(v || "all")}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={loadResponses}>Apply</Button>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>Export CSV</Button>
              <Button size="sm" variant="outline" onClick={() => handleExport("xlsx")}>Export Excel</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : responses.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No responses found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    {survey.questions.sort((a, b) => a.order - b.order).map((q) => (
                      <TableHead key={q.id} className="min-w-[150px]">{q.title}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((resp, idx) => (
                    <TableRow key={resp.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">{resp.respondentId.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{new Date(resp.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={resp.completed ? "default" : "secondary"}>
                          {resp.completed ? "Done" : "Partial"}
                        </Badge>
                      </TableCell>
                      {survey.questions.sort((a, b) => a.order - b.order).map((q) => {
                        const answer = resp.answers.find((a) => a.questionId === q.id);
                        let display = answer?.value || "-";
                        if (answer && q.type === "MULTIPLE_CHOICE") {
                          try { display = JSON.parse(answer.value).join(", "); } catch { /* keep raw */ }
                        }
                        return <TableCell key={q.id} className="text-sm">{display}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
