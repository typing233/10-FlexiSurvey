export interface QuestionOption {
  id: string;
  text: string;
  order: number;
}

export interface QuestionConfig {
  placeholder?: string;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
}

export interface SurveySettings {
  isPublic?: boolean;
  maxResponses?: number | null;
}

export type QuestionType = "single_choice" | "multiple_choice" | "text";
export type SurveyStatus = "draft" | "published" | "closed";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "单选题",
  multiple_choice: "多选题",
  text: "文本题",
};

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: "草稿",
  published: "已发布",
  closed: "已关闭",
};

export const SURVEY_STATUS_COLORS: Record<SurveyStatus, string> = {
  draft: "secondary",
  published: "default",
  closed: "destructive",
};
