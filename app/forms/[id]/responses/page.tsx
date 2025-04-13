"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getForm, getResponses } from "@/lib/store"
import type { Form, FormResponse, Question } from "@/lib/types"
import { ArrowLeft, Download, BarChart2, FileText, Loader2 } from "lucide-react"
import { getThemeStyles } from "@/components/form-builder/form-themes"

export default function ResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("summary")

  useEffect(() => {
    // Load form from local storage
    const currentForm = getForm(params.id as string)

    if (currentForm) {
      setForm(currentForm)

      // Load responses
      const formResponses = getResponses(params.id as string)
      setResponses(formResponses)
    }

    setLoading(false)
  }, [params.id])

  const downloadResponses = () => {
    if (!form) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add headers
    const headers = ["Timestamp", ...form.questions.filter((q) => q.type !== "section").map((q) => q.title)]
    csvContent += headers.join(",") + "\r\n"

    // Add rows
    responses.forEach((response) => {
      const timestamp = new Date(response.createdAt).toLocaleString()
      const row = [
        `"${timestamp}"`,
        ...form.questions
          .filter((q) => q.type !== "section")
          .map((question) => {
            const value = response.responses[question.id]
            if (Array.isArray(value)) {
              return `"${value.join(", ")}"`
            } else if (typeof value === "object" && value !== null) {
              // Handle grid responses
              const gridValues = Object.values(value).join(", ")
              return `"${gridValues}"`
            }
            return `"${value || ""}"`
          }),
      ]
      csvContent += row.join(",") + "\r\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${form.title} - Responses.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getResponseSummary = (question: Question) => {
    if (!responses.length) return null

    const allResponses = responses.map((r) => r.responses[question.id])

    if (question.type === "multipleChoice" || question.type === "dropdown") {
      const counts: Record<string, number> = {}
      allResponses.forEach((response) => {
        if (response) {
          counts[response as string] = (counts[response as string] || 0) + 1
        }
      })
      return counts
    }

    if (question.type === "checkbox") {
      const counts: Record<string, number> = {}
      allResponses.forEach((response) => {
        if (Array.isArray(response)) {
          response.forEach((option) => {
            counts[option] = (counts[option] || 0) + 1
          })
        }
      })
      return counts
    }

    if (question.type === "linearScale") {
      const counts: Record<string, number> = {}
      allResponses.forEach((response) => {
        if (response) {
          counts[response as string] = (counts[response as string] || 0) + 1
        }
      })
      return counts
    }

    return null
  }

  const renderSummaryChart = (question: Question, summary: Record<string, number> | null) => {
    if (!summary) return null

    const total = Object.values(summary).reduce((sum, count) => sum + count, 0)
    const themeStyles = form ? getThemeStyles(form.theme) : { primaryColor: "#7c3aed" }

    return (
      <div className="space-y-2 mt-4">
        {Object.entries(summary).map(([option, count]) => {
          const percentage = Math.round((count / total) * 100)
          return (
            <div key={option} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{option}</span>
                <span>
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: themeStyles.primaryColor,
                  }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Loading responses...</p>
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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{form.title} - Responses</h1>
          </div>

          <Button
            onClick={downloadResponses}
            disabled={responses.length === 0}
            style={{ backgroundColor: themeStyles.primaryColor as string }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              {responses.length} {responses.length === 1 ? "response" : "responses"} received
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No responses yet</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary" className="flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Individual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  {form.questions
                    .filter((q) => q.type !== "section")
                    .map((question) => {
                      const summary = getResponseSummary(question)

                      return (
                        <Card key={question.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{question.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {summary ? (
                              renderSummaryChart(question, summary)
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {question.type === "text" || question.type === "paragraph" ? (
                                  <div className="space-y-2">
                                    {responses.slice(0, 5).map((response, index) => (
                                      <div key={index} className="p-2 bg-muted/50 rounded">
                                        {response.responses[question.id] || "(No response)"}
                                      </div>
                                    ))}
                                    {responses.length > 5 && (
                                      <p className="text-xs text-muted-foreground text-right">
                                        + {responses.length - 5} more responses
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  "No summary available for this question type"
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                </TabsContent>

                <TabsContent value="individual">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        {form.questions
                          .filter((q) => q.type !== "section")
                          .map((question) => (
                            <TableHead key={question.id}>{question.title}</TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(response.createdAt).toLocaleString()}</TableCell>
                          {form.questions
                            .filter((q) => q.type !== "section")
                            .map((question) => (
                              <TableCell key={question.id}>
                                {Array.isArray(response.responses[question.id])
                                  ? (response.responses[question.id] as string[]).join(", ")
                                  : typeof response.responses[question.id] === "object" &&
                                      response.responses[question.id] !== null
                                    ? Object.values(response.responses[question.id] as Record<string, string>).join(
                                        ", ",
                                      )
                                    : (response.responses[question.id] as string) || "-"}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
