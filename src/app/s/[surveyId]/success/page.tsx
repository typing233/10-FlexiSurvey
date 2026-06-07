import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">提交成功</h1>
          <p className="text-muted-foreground mb-6">
            感谢你的参与！你的回答已经成功提交。
          </p>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
