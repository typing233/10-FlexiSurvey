"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionOption } from "@/lib/types";

interface QuestionRendererProps {
  question: {
    id: string;
    type: string;
    title: string;
    description: string;
    required: boolean;
    options: string;
  };
  value: string | string[];
  onChange: (questionId: string, value: string | string[]) => void;
  index: number;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  index,
  disabled = false,
}: QuestionRendererProps) {
  const options: QuestionOption[] = JSON.parse(question.options);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">
          <span className="text-muted-foreground mr-1">{index + 1}.</span>
          {question.title}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {question.description}
          </p>
        )}
      </div>

      {question.type === "single_choice" && (
        <RadioGroup
          value={value as string}
          onValueChange={(v) => onChange(question.id, v)}
          disabled={disabled}
        >
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} />
              <Label
                htmlFor={`${question.id}-${opt.id}`}
                className="font-normal cursor-pointer"
              >
                {opt.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {options.map((opt) => {
            const selected = (value as string[]) || [];
            return (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${opt.id}`}
                  checked={selected.includes(opt.id)}
                  disabled={disabled}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...selected, opt.id]
                      : selected.filter((id) => id !== opt.id);
                    onChange(question.id, newValue);
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${opt.id}`}
                  className="font-normal cursor-pointer"
                >
                  {opt.text}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {question.type === "text" && (
        <Input
          value={value as string}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder="请输入你的回答"
          disabled={disabled}
        />
      )}
    </div>
  );
}
