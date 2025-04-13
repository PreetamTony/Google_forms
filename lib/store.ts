import type { Form, FormResponse, Question } from "./types"

// Helper functions to work with localStorage
export const getForms = (): Form[] => {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("forms") || "[]")
}

export const getForm = (id: string): Form | null => {
  const forms = getForms()
  return forms.find((form) => form.id === id) || null
}

export const saveForm = (form: Form): void => {
  if (typeof window === "undefined") return
  const forms = getForms()
  const existingIndex = forms.findIndex((f) => f.id === form.id)

  if (existingIndex >= 0) {
    forms[existingIndex] = form
  } else {
    forms.push(form)
  }

  localStorage.setItem("forms", JSON.stringify(forms))
}

export const deleteForm = (id: string): void => {
  if (typeof window === "undefined") return
  const forms = getForms()
  localStorage.setItem("forms", JSON.stringify(forms.filter((form) => form.id !== id)))
  localStorage.removeItem(`responses_${id}`)
}

export const getResponses = (formId: string): FormResponse[] => {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(`responses_${formId}`) || "[]")
}

export const saveResponse = (formId: string, response: FormResponse): void => {
  if (typeof window === "undefined") return
  const responses = getResponses(formId)
  localStorage.setItem(`responses_${formId}`, JSON.stringify([...responses, response]))
}

export const duplicateQuestion = (questions: Question[], questionId: string): Question[] => {
  const questionIndex = questions.findIndex((q) => q.id === questionId)
  if (questionIndex === -1) return questions

  const question = questions[questionIndex]
  const newQuestion = {
    ...question,
    id: crypto.randomUUID(),
    title: `${question.title} (Copy)`,
  }

  const newQuestions = [...questions]
  newQuestions.splice(questionIndex + 1, 0, newQuestion)
  return newQuestions
}

export const moveQuestion = (questions: Question[], fromIndex: number, toIndex: number): Question[] => {
  if (fromIndex === toIndex) return questions

  const newQuestions = [...questions]
  const [removed] = newQuestions.splice(fromIndex, 1)
  newQuestions.splice(toIndex, 0, removed)

  return newQuestions
}
