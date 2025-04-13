"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { getForm, saveResponse } from "@/lib/store"
import { getThemeStyles } from "@/components/form-builder/form-themes"
import type { Form, Question, FormResponse } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export default function ViewFormPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formResponse, setFormResponse] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState<Question[][]>([])
  const [visibleQuestions, setVisibleQuestions] = useState<Set<string>>(new Set())
  const [requiredQuestions, setRequiredQuestions] = useState<Set<string>>(new Set())
  const [userEmail, setUserEmail] = useState<string>("")
  const [formExpired, setFormExpired] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load form from local storage
    const currentForm = getForm(params.id as string)

    if (currentForm) {
      setForm(currentForm)

      // Check if form has expired
      if (currentForm.settings?.deadline) {
        const deadline = new Date(currentForm.settings.deadline)
        if (deadline < new Date()) {
          setFormExpired(true)
        }
      }

      // Split questions into pages based on section breaks
      const formPages: Question[][] = [[]]
      let currentPageIndex = 0

      currentForm.questions.forEach((question) => {
        if (question.type === "section") {
          formPages.push([question])
          currentPageIndex++
        } else {
          formPages[currentPageIndex].push(question)
        }
      })

      setPages(formPages)

      // Initialize visible questions (all questions are visible by default)
      const initialVisibleQuestions = new Set<string>()
      const initialRequiredQuestions = new Set<string>()

      currentForm.questions.forEach((question) => {
        initialVisibleQuestions.add(question.id)
        if (question.required) {
          initialRequiredQuestions.add(question.id)
        }
      })

      setVisibleQuestions(initialVisibleQuestions)
      setRequiredQuestions(initialRequiredQuestions)
    }

    // Get user email if logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUserEmail(currentUser.email)
    }

    setLoading(false)
  }, [params.id])

  // Process conditional logic when responses change
  useEffect(() => {
    if (!form) return

    const newVisibleQuestions = new Set<string>(visibleQuestions)
    const newRequiredQuestions = new Set<string>()

    // First, add all questions that are required by default
    form.questions.forEach((question) => {
      if (question.required) {
        newRequiredQuestions.add(question.id)
      }
    })

    // Then process conditional logic
    form.questions.forEach((question) => {
      if (!question.conditionalLogic || question.conditionalLogic.length === 0) return

      // Process each rule
      question.conditionalLogic.forEach((rule) => {
        const sourceQuestion = form.questions.find((q) => q.id === rule.questionId)
        if (!sourceQuestion) return

        const response = formResponse[rule.questionId]
        let conditionMet = false

        // Check if condition is met
        switch (rule.operator) {
          case "equals":
            conditionMet = response === rule.value
            break
          case "not_equals":
            conditionMet = response !== rule.value
            break
          case "contains":
            conditionMet = Array.isArray(response)
              ? response.includes(rule.value)
              : String(response).includes(rule.value)
            break
          case "not_contains":
            conditionMet = Array.isArray(response)
              ? !response.includes(rule.value)
              : !String(response).includes(rule.value)
            break
          case "greater_than":
            conditionMet = Number(response) > Number(rule.value)
            break
          case "less_than":
            conditionMet = Number(response) < Number(rule.value)
            break
        }

        // Apply action if condition is met
        if (conditionMet) {
          switch (rule.action) {
            case "show":
              newVisibleQuestions.add(question.id)
              break
            case "hide":
              newVisibleQuestions.delete(question.id)
              break
            case "require":
              newRequiredQuestions.add(question.id)
              break
            case "skip_to":
              // This will be handled during navigation
              break
          }
        }
      })
    })

    setVisibleQuestions(newVisibleQuestions)
    setRequiredQuestions(newRequiredQuestions)
  }, [form, formResponse])

  const handleInputChange = (questionId: string, value: any) => {
    setFormResponse({
      ...formResponse,
      [questionId]: value,
    })

    // Clear error if field is filled
    if (errors[questionId] && value) {
      const newErrors = { ...errors }
      delete newErrors[questionId]
      setErrors(newErrors)
    }
  }

  const handleCheckboxChange = (questionId: string, optionValue: string, checked: boolean) => {
    const currentValues = (formResponse[questionId] as string[]) || []

    let newValues: string[]
    if (checked) {
      newValues = [...currentValues, optionValue]
    } else {
      newValues = currentValues.filter((v) => v !== optionValue)
    }

    setFormResponse({
      ...formResponse,
      [questionId]: newValues,
    })

    // Clear error if at least one checkbox is selected
    if (errors[questionId] && newValues.length > 0) {
      const newErrors = { ...errors }
      delete newErrors[questionId]
      setErrors(newErrors)
    }
  }

  const handleDateChange = (questionId: string, date: Date | undefined) => {
    setFormResponse({
      ...formResponse,
      [questionId]: date ? date.toISOString() : null,
    })

    if (errors[questionId] && date) {
      const newErrors = { ...errors }
      delete newErrors[questionId]
      setErrors(newErrors)
    }
  }

  const handleGridChange = (questionId: string, rowIndex: number, value: string) => {
    const currentValues = (formResponse[questionId] as Record<number, string>) || {}

    setFormResponse({
      ...formResponse,
      [questionId]: {
        ...currentValues,
        [rowIndex]: value,
      },
    })

    if (errors[questionId]) {
      const newErrors = { ...errors }
      delete newErrors[questionId]
      setErrors(newErrors)
    }
  }

  const validateCurrentPage = () => {
    const newErrors: { [key: string]: boolean } = {}
    const currentQuestions = pages[currentPage].filter((q) => visibleQuestions.has(q.id))

    currentQuestions.forEach((question) => {
      if (requiredQuestions.has(question.id) && question.type !== "section") {
        const response = formResponse[question.id]

        if (
          response === undefined ||
          response === null ||
          (Array.isArray(response) && response.length === 0) ||
          (typeof response === "string" && response.trim() === "") ||
          (question.type === "grid" && Object.keys(response || {}).length < (question.rows?.length || 0))
        ) {
          newErrors[question.id] = true
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const goToNextPage = () => {
    if (!validateCurrentPage()) return

    // Check for skip logic
    if (form) {
      for (const question of form.questions) {
        if (!question.conditionalLogic) continue

        for (const rule of question.conditionalLogic) {
          if (rule.action !== "skip_to") continue

          const sourceQuestion = form.questions.find((q) => q.id === rule.questionId)
          if (!sourceQuestion) continue

          const response = formResponse[rule.questionId]
          let conditionMet = false

          // Check if condition is met
          switch (rule.operator) {
            case "equals":
              conditionMet = response === rule.value
              break
            case "not_equals":
              conditionMet = response !== rule.value
              break
            // Add other operators as needed
          }

          if (conditionMet && rule.targetQuestionId) {
            // Find the page containing the target question
            let targetPageIndex = -1

            for (let i = 0; i < pages.length; i++) {
              if (pages[i].some((q) => q.id === rule.targetQuestionId)) {
                targetPageIndex = i
                break
              }
            }

            if (targetPageIndex !== -1 && targetPageIndex > currentPage) {
              setCurrentPage(targetPageIndex)
              setErrors({})

              // Scroll to top of form
              if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: "smooth" })
              }

              return
            }
          }
        }
      }
    }

    // Normal navigation if no skip logic applies
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
      setErrors({})

      // Scroll to top of form
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const calculateScore = () => {
    if (!form?.settings?.quizMode) return { score: 0, maxScore: 0 }

    let score = 0
    let maxScore = 0

    form.questions.forEach((question) => {
      if (question.points === undefined) return

      maxScore += question.points

      // For multiple choice and dropdown questions
      if (
        (question.type === "multipleChoice" || question.type === "dropdown") &&
        formResponse[question.id] === question.options?.[0]
      ) {
        score += question.points
      }

      // For checkbox questions (partial credit)
      if (question.type === "checkbox" && Array.isArray(formResponse[question.id])) {
        const selectedOptions = formResponse[question.id] as string[]
        const correctOptions = question.options?.slice(0, Math.ceil(question.options.length / 2)) || []

        let correctCount = 0
        selectedOptions.forEach((option) => {
          if (correctOptions.includes(option)) {
            correctCount++
          }
        })

        if (correctCount > 0) {
          const partialScore = (correctCount / correctOptions.length) * question.points
          score += partialScore
        }
      }
    })

    return { score: Math.round(score), maxScore }
  }

  const handleSubmit = async () => {
    if (!validateCurrentPage()) return

    // Validate all required fields
    const newErrors: { [key: string]: boolean } = {}

    if (form) {
      form.questions
        .filter((q) => visibleQuestions.has(q.id))
        .forEach((question) => {
          if (requiredQuestions.has(question.id) && question.type !== "section") {
            const response = formResponse[question.id]

            if (
              response === undefined ||
              response === null ||
              (Array.isArray(response) && response.length === 0) ||
              (typeof response === "string" && response.trim() === "") ||
              (question.type === "grid" && Object.keys(response || {}).length < (question.rows?.length || 0))
            ) {
              newErrors[question.id] = true
            }
          }
        })
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check if email collection is required
    if (form?.settings?.collectEmail && !userEmail) {
      toast({
        title: "Email required",
        description: "Please sign in to submit this form",
        variant: "destructive",
      })

      // Redirect to login
      router.push(`/auth/login?redirect=/forms/${params.id}/view`)
      return
    }

    setSubmitting(true)

    try {
      // Calculate score for quiz mode
      const { score, maxScore } = form?.settings?.quizMode ? calculateScore() : { score: 0, maxScore: 0 }

      // Save response to local storage
      const newResponse: FormResponse = {
        id: uuidv4(),
        formId: form!.id,
        responses: formResponse,
        createdAt: Date.now(),
        respondentEmail: userEmail || undefined,
        score: form?.settings?.quizMode ? score : undefined,
        maxScore: form?.settings?.quizMode ? maxScore : undefined,
      }

      saveResponse(form!.id, newResponse)

      toast({
        title: "Response submitted successfully",
        description: form?.settings?.confirmationMessage || "Thank you for completing this form.",
      })

      // Redirect to thank you page
      setTimeout(() => {
        router.push(`/forms/${params.id}/thankyou${form?.settings?.quizMode ? `?score=${score}&max=${maxScore}` : ""}`)
      }, 1500)
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: "Please try again later.",
        variant: "destructive",
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Loading form...</p>
        </div>
      </div>
    )
  }

  if (formExpired) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold">Form Expired</h2>
              <p className="text-muted-foreground">This form is no longer accepting responses.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Form Not Found</h2>
              <p className="text-muted-foreground">The form you're looking for doesn't exist or has been removed.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const themeStyles = getThemeStyles(form.theme)
  const currentQuestions = pages[currentPage].filter((q) => visibleQuestions.has(q.id))
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage === pages.length - 1
  const progressPercentage = ((currentPage + 1) / pages.length) * 100

  return (
    <div
      className="min-h-screen bg-muted/30 py-8"
      style={
        {
          "--primary-color": themeStyles.primaryColor,
          "--accent-color": themeStyles.accentColor,
        } as any
      }
      ref={formRef}
    >
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {form.settings?.showProgressBar && pages.length > 1 && (
            <div className="w-full bg-muted rounded-full h-2.5 mb-4">
              <div
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: themeStyles.primaryColor,
                }}
              ></div>
            </div>
          )}

          <Card
            className="overflow-hidden"
            style={{
              borderTopWidth: "8px",
              borderTopColor: themeStyles.primaryColor as string,
            }}
          >
            <CardHeader>
              {form.headerImage && (
                <div className="mb-4 -mt-6 -mx-6">
                  <img
                    src={form.headerImage || "/placeholder.svg"}
                    alt="Form header"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <CardTitle className="text-2xl">{form.title}</CardTitle>
              {form.description && <CardDescription className="text-base">{form.description}</CardDescription>}
              {currentPage > 0 && currentQuestions[0]?.type === "section" && (
                <div className="mt-2 pt-2 border-t">
                  <h3 className="text-lg font-medium">{currentQuestions[0].title}</h3>
                  {currentQuestions[0].description && (
                    <p className="text-muted-foreground">{currentQuestions[0].description}</p>
                  )}
                </div>
              )}

              {form.settings?.collectEmail && !userEmail && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-md">
                  <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    This form requires you to sign in before submitting.
                  </p>
                </div>
              )}
            </CardHeader>
          </Card>

          {currentQuestions.map((question) => {
            // Skip section headers as they're shown in the card header
            if (question.type === "section") return null

            return (
              <Card key={question.id} className={errors[question.id] ? "border-red-500" : ""}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-1">
                      <h3 className="font-medium">
                        {question.title}
                        {requiredQuestions.has(question.id) && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {form.settings?.quizMode && question.points !== undefined && (
                        <span className="ml-auto text-sm text-muted-foreground">
                          {question.points} {question.points === 1 ? "point" : "points"}
                        </span>
                      )}
                    </div>

                    {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}

                    {question.type === "text" && (
                      <Input
                        value={(formResponse[question.id] as string) || ""}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder="Your answer"
                        className={errors[question.id] ? "border-red-500" : ""}
                      />
                    )}

                    {question.type === "paragraph" && (
                      <Textarea
                        value={(formResponse[question.id] as string) || ""}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder="Your answer"
                        className={errors[question.id] ? "border-red-500" : ""}
                      />
                    )}

                    {question.type === "multipleChoice" && (
                      <RadioGroup
                        value={(formResponse[question.id] as string) || ""}
                        onValueChange={(value) => handleInputChange(question.id, value)}
                        className="space-y-2"
                      >
                        {question.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
                            <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "checkbox" && (
                      <div className="space-y-2">
                        {question.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question.id}-option-${index}`}
                              checked={((formResponse[question.id] as string[]) || []).includes(option)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(question.id, option, checked as boolean)
                              }
                            />
                            <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "dropdown" && (
                      <Select
                        value={(formResponse[question.id] as string) || ""}
                        onValueChange={(value) => handleInputChange(question.id, value)}
                      >
                        <SelectTrigger className={errors[question.id] ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options?.map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {question.type === "linearScale" && (
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>{question.minLabel || question.scaleMin}</span>
                          <span>{question.maxLabel || question.scaleMax}</span>
                        </div>
                        <div className="pt-4">
                          <RadioGroup
                            value={(formResponse[question.id] as string) || ""}
                            onValueChange={(value) => handleInputChange(question.id, value)}
                            className="flex justify-between"
                          >
                            {Array.from({ length: (question.scaleMax || 5) - (question.scaleMin || 0) + 1 }).map(
                              (_, i) => {
                                const value = String((question.scaleMin || 0) + i)
                                return (
                                  <div key={i} className="flex flex-col items-center gap-2">
                                    <RadioGroupItem value={value} id={`${question.id}-scale-${i}`} />
                                    <Label htmlFor={`${question.id}-scale-${i}`} className="text-sm">
                                      {value}
                                    </Label>
                                  </div>
                                )
                              },
                            )}
                          </RadioGroup>
                        </div>
                      </div>
                    )}

                    {question.type === "grid" && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left p-2"></th>
                              {question.columns?.map((column, colIndex) => (
                                <th key={colIndex} className="text-center p-2 text-sm font-medium">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {question.rows?.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-t">
                                <td className="text-left p-2 text-sm">{row}</td>
                                {question.columns?.map((column, colIndex) => (
                                  <td key={colIndex} className="text-center p-2">
                                    <RadioGroup
                                      value={
                                        ((formResponse[question.id] as Record<number, string>) || {})[rowIndex] || ""
                                      }
                                      onValueChange={(value) => handleGridChange(question.id, rowIndex, value)}
                                      className="flex justify-center"
                                    >
                                      <RadioGroupItem
                                        value={column}
                                        id={`${question.id}-row-${rowIndex}-col-${colIndex}`}
                                        className="mx-auto"
                                      />
                                    </RadioGroup>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {question.type === "date" && (
                      <DatePicker
                        date={formResponse[question.id] ? new Date(formResponse[question.id] as string) : undefined}
                        setDate={(date) => handleDateChange(question.id, date)}
                      />
                    )}

                    {question.type === "time" && (
                      <Input
                        type="time"
                        value={(formResponse[question.id] as string) || ""}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className={errors[question.id] ? "border-red-500 w-40" : "w-40"}
                      />
                    )}

                    {question.type === "fileUpload" && (
                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                        <Input
                          type="file"
                          className="hidden"
                          id={`file-${question.id}`}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleInputChange(question.id, e.target.files[0].name)
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById(`file-${question.id}`)?.click()}
                        >
                          Upload file
                        </Button>
                        {formResponse[question.id] && (
                          <p className="mt-2 text-sm">{formResponse[question.id] as string}</p>
                        )}
                      </div>
                    )}

                    {errors[question.id] && <p className="text-sm text-red-500">This is a required question</p>}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex justify-between">
            {!isFirstPage && (
              <Button variant="outline" onClick={goToPreviousPage}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            <div className="ml-auto">
              {!isLastPage ? (
                <Button onClick={goToNextPage}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
