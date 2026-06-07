import { createSurvey } from "@/actions/survey-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSurveyPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>创建新问卷</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSurvey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">问卷标题</Label>
              <Input
                id="title"
                name="title"
                placeholder="请输入问卷标题"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">问卷描述（可选）</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="请输入问卷描述"
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              创建并编辑题目
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
