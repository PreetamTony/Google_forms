import type { ConditionalRule } from "@/components/form-builder/conditional-logic"

export type QuestionType =
  | "text"
  | "paragraph"
  | "multipleChoice"
  | "checkbox"
  | "dropdown"
  | "linearScale"
  | "grid"
  | "date"
  | "time"
  | "fileUpload"
  | "section"

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: string[]
  rows?: string[]
  columns?: string[]
  scaleMin?: number
  scaleMax?: number
  minLabel?: string
  maxLabel?: string
  validation?: string
  conditionalLogic?: ConditionalRule[]
  points?: number // For quiz mode
}

export interface FormSettings {
  collectEmail?: boolean
  limitOneResponse?: boolean
  showProgressBar?: boolean
  confirmationMessage?: string
  emailNotifications?: boolean
  showSummary?: boolean
  restrictedAccess?: boolean
  deadline?: string
  font?: string
  quizMode?: boolean
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
}

export interface Form {
  id: string
  title: string
  description: string
  questions: Question[]
  createdAt: number
  updatedAt?: number
  theme: string
  settings?: FormSettings
  headerImage?: string | null
  userId?: string
}

export interface FormResponse {
  id: string
  formId: string
  responses: Record<string, any>
  createdAt: number
  respondentEmail?: string
  score?: number // For quiz mode
  maxScore?: number // For quiz mode
}

export interface User {
  id: string
  name: string
  email: string
}
