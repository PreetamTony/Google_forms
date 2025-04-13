"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { PlusCircle, ExternalLink, BarChart, Trash2, Copy, Calendar, Clock } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { getForms, deleteForm, saveForm } from "@/lib/store"
import type { Form } from "@/lib/types"
import { getThemeStyles } from "@/components/form-builder/form-themes"

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load forms from local storage
    const storedForms = getForms()
    setForms(storedForms)
    setLoading(false)
  }, [])

  const handleDeleteForm = (id: string) => {
    // Remove form from local storage
    deleteForm(id)

    // Update state
    setForms(forms.filter((form) => form.id !== id))

    toast({
      title: "Form deleted",
      description: "The form has been permanently deleted.",
    })
  }

  const handleDuplicateForm = (form: Form) => {
    const newForm = {
      ...form,
      id: crypto.randomUUID(),
      title: `${form.title} (Copy)`,
      createdAt: Date.now(),
    }

    saveForm(newForm)
    setForms([...forms, newForm])

    toast({
      title: "Form duplicated",
      description: "A copy of the form has been created.",
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getResponseCount = (formId: string) => {
    const responses = JSON.parse(localStorage.getItem(`responses_${formId}`) || "[]")
    return responses.length
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Forms</h1>
          <Link href="/forms/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Form
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <h2 className="text-xl font-semibold mb-2">No forms yet</h2>
              <p className="text-muted-foreground mb-6">Create your first form to get started</p>
              <Link href="/forms/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Form
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => {
              const themeStyles = getThemeStyles(form.theme)
              const responseCount = getResponseCount(form.id)

              return (
                <Card key={form.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: themeStyles.primaryColor as string }}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{form.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {responseCount} {responseCount === 1 ? "response" : "responses"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Created on {formatDate(form.createdAt)}
                    </CardDescription>
                    {form.updatedAt && (
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Updated on {formatDate(form.updatedAt)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-6 line-clamp-2">{form.description || "No description"}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/forms/${form.id}/view`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/forms/${form.id}/responses`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <BarChart className="mr-2 h-4 w-4" />
                          Responses
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateForm(form)}
                      className="text-muted-foreground"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the form and all of its
                            responses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteForm(form.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
