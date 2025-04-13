"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getForm } from "@/lib/store"
import type { Form } from "@/lib/types"
import { getThemeStyles } from "@/components/form-builder/form-themes"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function PreviewFormPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load form from local storage
    const currentForm = getForm(params.id as string)

    if (currentForm) {
      setForm(currentForm)
    }

    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Loading form preview...</p>
        </div>
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
              <Button className="mt-4" onClick={() => router.push("/forms")}>
                Return to Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const themeStyles = getThemeStyles(form.theme)

  return (
    <div
      className="min-h-screen bg-muted/30 py-8"
      style={
        {
          "--primary-color": themeStyles.primaryColor,
          "--accent-color": themeStyles.accentColor,
        } as any
      }
    >
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
            <p className="text-sm text-muted-foreground">Preview Mode</p>
          </div>

          <Card
            className="overflow-hidden"
            style={{
              borderTopWidth: "8px",
              borderTopColor: themeStyles.primaryColor as string,
            }}
          >
            <CardHeader>
              <CardTitle className="text-2xl">{form.title}</CardTitle>
              {form.description && <CardDescription className="text-base">{form.description}</CardDescription>}
            </CardHeader>
          </Card>

          {form.questions.map((question) => {
            if (question.type === "section") {
              return (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{question.title}</CardTitle>
                    {question.description && <CardDescription>{question.description}</CardDescription>}
                  </CardHeader>
                </Card>
              )
            }

            return (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-1">
                      <h3 className="font-medium">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                    </div>

                    {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}

                    <div className="opacity-50 pointer-events-none">
                      {/* Placeholder for question inputs */}
                      {question.type === "text" && <div className="h-10 bg-muted rounded-md"></div>}

                      {question.type === "paragraph" && <div className="h-24 bg-muted rounded-md"></div>}

                      {question.type === "multipleChoice" && (
                        <div className="space-y-2">
                          {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full bg-muted"></div>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === "checkbox" && (
                        <div className="space-y-2">
                          {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded bg-muted"></div>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === "dropdown" && <div className="h-10 bg-muted rounded-md"></div>}

                      {question.type === "linearScale" && (
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>{question.minLabel || question.scaleMin}</span>
                            <span>{question.maxLabel || question.scaleMax}</span>
                          </div>
                          <div className="flex justify-between">
                            {Array.from({ length: (question.scaleMax || 5) - (question.scaleMin || 0) + 1 }).map(
                              (_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-muted"></div>
                                  <span className="text-sm">{(question.scaleMin || 0) + i}</span>
                                </div>
                              ),
                            )}
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
                                      <div className="h-4 w-4 rounded-full bg-muted mx-auto"></div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {question.type === "date" && <div className="h-10 bg-muted rounded-md"></div>}

                      {question.type === "time" && <div className="h-10 w-40 bg-muted rounded-md"></div>}

                      {question.type === "fileUpload" && (
                        <div className="border-2 border-dashed rounded-md p-6 text-center">
                          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex justify-end">
            <Button disabled style={{ backgroundColor: themeStyles.primaryColor as string }}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
