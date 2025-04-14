"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Copy, Link, Mail, QrCode, Share2, CheckCircle } from "lucide-react"
import QRCode from "react-qr-code"

interface ShareFormDialogProps {
  formId: string
  formTitle: string
}

export function ShareFormDialog({ formId, formTitle }: ShareFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("link")
  const [copied, setCopied] = useState(false)
  const [shareSettings, setShareSettings] = useState({
    access: "anyone",
    allowEdits: false,
    requireLogin: false,
    notifyOnSubmission: false,
    expiresAt: "",
  })

  const [shareUrl, setShareUrl] = useState('')

  // Use useEffect to access window only on the client side
  useEffect(() => {
    setShareUrl(`${window.location.origin}/forms/${formId}/view`)
  }, [formId])

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const emailInput = document.getElementById("share-email") as HTMLInputElement
    const email = emailInput.value

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the email via an API
    toast({
      title: "Form shared",
      description: `Form has been shared with ${email}`,
    })

    emailInput.value = ""
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share "{formTitle}"</DialogTitle>
          <DialogDescription>Choose how you want to share this form with others</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="flex items-center gap-1">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR Code</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button size="icon" onClick={handleCopyLink}>
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-base">Who can access</Label>
                <RadioGroup
                  value={shareSettings.access}
                  onValueChange={(value) => setShareSettings({ ...shareSettings, access: value })}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anyone" id="anyone" />
                    <Label htmlFor="anyone">Anyone with the link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific">Specific people only</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="require-login">Require login</Label>
                  <Switch
                    id="require-login"
                    checked={shareSettings.requireLogin}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, requireLogin: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-submission">Notify on submission</Label>
                  <Switch
                    id="notify-submission"
                    checked={shareSettings.notifyOnSubmission}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, notifyOnSubmission: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires-at">Expires at (optional)</Label>
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={shareSettings.expiresAt}
                  onChange={(e) => setShareSettings({ ...shareSettings, expiresAt: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 py-4">
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-email">Email address</Label>
                <Input id="share-email" type="email" placeholder="name@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-message">Message (optional)</Label>
                <Input id="share-message" placeholder="Add a note..." />
              </div>

              <Button type="submit" className="w-full">
                Send Invitation
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qrcode" className="py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={shareUrl} size={200} />
              </div>
              <p className="text-sm text-muted-foreground text-center">Scan this QR code to access the form</p>
              <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
