"use client"

import { BannerImageUpload } from "@/components/form-builder/banner-image-upload"
import { FormSettings } from "@/components/form-builder/form-settings"
import { getTemplateById } from "@/components/form-builder/form-templates"
import { getThemeStyles } from "@/components/form-builder/form-themes"
import { QuestionCard } from "@/components/form-builder/question-card"
import { ShareFormDialog } from "@/components/form-builder/share-form-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { duplicateQuestion, moveQuestion, saveForm } from "@/lib/store"
import type { Form, Question, QuestionType } from "@/lib/types"
import { ChevronDown, Eye, PlusCircle, Save, SettingsIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"

export default function NewFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")

  const [form, setForm] = useState<Form>({
    id: uuidv4(),
    title: "Untitled Form",
    description: "",
    questions: [],
    createdAt: Date.now(),
    theme: "default",
    headerImage: null,
  })

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  const dragRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load template if specified
    if (templateId) {
      const template = getTemplateById(templateId)
      if (template && template.questions.length > 0) {
        setForm((prev) => ({
          ...prev,
          title: template.name,
          description: template.description,
          questions: template.questions.map((question) => ({
            ...question,
            type: question.type as QuestionType,
            required: question.required ?? false, // Ensure required is always boolean
            id: question.id ?? uuidv4(), // Ensure id exists
            title: question.title ?? "", // Ensure title exists
          })),
        }))
      }
    }

    // Add user ID if logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        userId: currentUser.id,
      }))
    }
  }, [templateId])

  const addQuestion = (type = "text") => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: type as any,
      title: "",
      required: false,
    }

    // Initialize specific question types with default values
    if (type === "linearScale") {
      newQuestion.scaleMin = 1
      newQuestion.scaleMax = 5
    } else if (type === "grid") {
      newQuestion.rows = ["Row 1"]
      newQuestion.columns = ["Column 1"]
    } else if (type === "multipleChoice" || type === "checkbox" || type === "dropdown") {
      newQuestion.options = ["Option 1"]
    }

    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    })

    // Set the new question as active
    setActiveQuestionId(newQuestion.id)

    // Scroll to the new question
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  const updateQuestion = (id: string, data: Partial<Question>) => {
    setForm({
      ...form,
      questions: form.questions.map((q) => (q.id === id ? { ...q, ...data } : q)),
    })
  }

  const removeQuestion = (id: string) => {
    setForm({
      ...form,
      questions: form.questions.filter((q) => q.id !== id),
    })

    if (activeQuestionId === id) {
      setActiveQuestionId(null)
    }
  }

  const duplicateQuestionHandler = (id: string) => {
    setForm({
      ...form,
      questions: duplicateQuestion(form.questions, id),
    })
  }

  const updateForm = (data: Partial<Form>) => {
    setForm({
      ...form,
      ...data,
      updatedAt: Date.now(),
    })
  }

  const saveFormHandler = () => {
    // Save to local storage
    const updatedForm = {
      ...form,
      updatedAt: Date.now(),
    }
    saveForm(updatedForm)

    toast({
      title: "Form saved successfully",
      description: "Your form has been saved and is ready to share.",
    })

    // Redirect to forms list
    router.push("/forms")
  }

  const handleDragStart = (index: number) => {
    setDraggedQuestionIndex(index)
  }

  const handleDragOver = (index: number) => {
    if (draggedQuestionIndex === null) return
    if (dropTargetIndex === index) return

    setDropTargetIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedQuestionIndex !== null && dropTargetIndex !== null) {
      setForm({
        ...form,
        questions: moveQuestion(form.questions, draggedQuestionIndex, dropTargetIndex),
      })
    }

    setDraggedQuestionIndex(null)
    setDropTargetIndex(null)
  }

  const themeStyles = getThemeStyles(form.theme)

  return (
    <div
      className="min-h-screen pb-20"
      style={
        {
          "--primary-color": themeStyles.primaryColor,
          "--accent-color": themeStyles.accentColor,
        } as any
      }
    >
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex-1">
            <Input
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Form Title"
              className="text-xl font-bold border-none px-0 focus-visible:ring-0 max-w-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" asChild>
              <a href={`/forms/${form.id}/preview`} target="_blank" rel="noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
            <ShareFormDialog formId={form.id} formTitle={form.title} />
            <Button onClick={saveFormHandler}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`space-y-6 ${showSettings ? "md:col-span-2" : "md:col-span-3"}`}>
          <Card
            className="relative overflow-hidden"
            style={{
              borderTopWidth: "8px",
              borderTopColor: themeStyles.primaryColor as string,
            }}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Banner image upload */}
                <BannerImageUpload
                  currentImage={form.headerImage || null}
                  onImageChange={(image) => updateForm({ headerImage: image })}
                />

                <Input
                  value={form.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                  placeholder="Form Title"
                  className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
                />
                <Textarea
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Form Description"
                  className="resize-none border-none px-0 focus-visible:ring-0"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {form.questions.map((question, index) => (
              <div
                key={question.id}
                ref={index === draggedQuestionIndex ? dragRef : null}
                className={`
                  transition-all duration-200
                  ${index === dropTargetIndex && draggedQuestionIndex !== null ? "transform translate-y-2" : ""}
                `}
                onDragOver={() => handleDragOver(index)}
              >
                <QuestionCard
                  question={question} // Ensure only one 'question' attribute is present
                  index={index}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                  duplicateQuestion={duplicateQuestionHandler}
                  isActive={activeQuestionId === question.id}
                  onActivate={() => setActiveQuestionId(question.id)}
                  onDragStart={() => handleDragStart(index)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => addQuestion()} variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  More question types
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose question type</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Button variant="outline" onClick={() => addQuestion("text")} className="justify-start">
                    <span className="mr-2">Aa</span>
                    Short Answer
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("paragraph")} className="justify-start">
                    <span className="mr-2">¶</span>
                    Paragraph
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("multipleChoice")} className="justify-start">
                    <span className="mr-2">○</span>
                    Multiple Choice
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("checkbox")} className="justify-start">
                    <span className="mr-2">☐</span>
                    Checkboxes
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("dropdown")} className="justify-start">
                    <span className="mr-2">▼</span>
                    Dropdown
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("linearScale")} className="justify-start">
                    <span className="mr-2">⚖️</span>
                    Linear Scale
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("grid")} className="justify-start">
                    <span className="mr-2">▦</span>
                    Multiple Choice Grid
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("date")} className="justify-start">
                    <span className="mr-2">📅</span>
                    Date
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("time")} className="justify-start">
                    <span className="mr-2">🕒</span>
                    Time
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("fileUpload")} className="justify-start">
                    <span className="mr-2">📎</span>
                    File Upload
                  </Button>
                  <Button variant="outline" onClick={() => addQuestion("section")} className="justify-start col-span-2">
                    <span className="mr-2">§</span>
                    Section Break
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {showSettings && (
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <FormSettings form={form} updateForm={updateForm} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
