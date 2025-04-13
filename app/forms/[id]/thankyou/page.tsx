"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { getForm } from "@/lib/store"
import type { Form } from "@/lib/types"
import { getThemeStyles } from "@/components/form-builder/form-themes"

export default function ThankYouPage() {
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState<Form | null>(null)

  useEffect(() => {
    const currentForm = getForm(params.id as string)
    if (currentForm) {
      setForm(currentForm)
    }
  }, [params.id])

  const themeStyles = form ? getThemeStyles(form.theme) : { primaryColor: "#7c3aed" }
  const confirmationMessage = form?.settings?.confirmationMessage || "Thank you for completing this form."

  return (
    <div className="container mx-auto py-10 flex justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16" style={{ color: themeStyles.primaryColor as string }} />
            </div>
            <h2 className="text-2xl font-semibold">Response Submitted</h2>
            <p className="text-muted-foreground">{confirmationMessage}</p>
            <div className="pt-4 flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push(`/forms/${params.id}/view`)}>
                Submit Another Response
              </Button>
              <Button onClick={() => router.push("/")} style={{ backgroundColor: themeStyles.primaryColor as string }}>
                Return Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
