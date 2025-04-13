"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formThemes } from "./form-themes"
import type { Form } from "@/lib/types"
import { Settings, Palette, ImageIcon, Mail, Lock, BarChart, MessageSquare, Clock } from "lucide-react"

interface FormSettingsProps {
  form: Form
  updateForm: (data: Partial<Form>) => void
}

export function FormSettings({ form, updateForm }: FormSettingsProps) {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="responses">
            <BarChart className="h-4 w-4 mr-2" />
            Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={form.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Form Description</Label>
              <Input
                id="form-description"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="collect-email">Collect email addresses</Label>
                <p className="text-xs text-muted-foreground">Require respondents to sign in</p>
              </div>
              <Switch
                id="collect-email"
                checked={form.settings?.collectEmail || false}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      collectEmail: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="limit-responses">Limit to one response</Label>
                <p className="text-xs text-muted-foreground">Respondents can only submit once</p>
              </div>
              <Switch
                id="limit-responses"
                checked={form.settings?.limitOneResponse || false}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      limitOneResponse: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-progress">Show progress bar</Label>
                <p className="text-xs text-muted-foreground">Display progress through form sections</p>
              </div>
              <Switch
                id="show-progress"
                checked={form.settings?.showProgressBar || false}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      showProgressBar: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="confirmation-message">Confirmation message</Label>
                <p className="text-xs text-muted-foreground">Show custom message after submission</p>
              </div>
              <Switch
                id="confirmation-message"
                checked={!!form.settings?.confirmationMessage}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      confirmationMessage: checked ? "Thank you for your response!" : "",
                    },
                  })
                }
              />
            </div>

            {form.settings?.confirmationMessage && (
              <div>
                <Input
                  value={form.settings.confirmationMessage}
                  onChange={(e) =>
                    updateForm({
                      settings: {
                        ...form.settings,
                        confirmationMessage: e.target.value,
                      },
                    })
                  }
                  placeholder="Thank you for your response!"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 pt-4">
          <div>
            <Label className="mb-3 block">Theme</Label>
            <div className="grid grid-cols-4 gap-3">
              {formThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`
                    border rounded-md p-2 cursor-pointer transition-all
                    ${form.theme === theme.id ? "ring-2 ring-primary" : "hover:border-primary/50"}
                  `}
                  onClick={() => updateForm({ theme: theme.id })}
                >
                  <div className="h-12 rounded-sm mb-1.5" style={{ backgroundColor: theme.primaryColor }} />
                  <p className="text-xs font-medium text-center">{theme.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Header Image</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <div className="flex justify-center mb-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Drag and drop an image, or click to select</p>
              <Button variant="outline" size="sm">
                Upload Image
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="custom-font">Custom Font</Label>
              <p className="text-xs text-muted-foreground">Change the form font</p>
            </div>
            <div className="w-[180px]">
              <select
                id="custom-font"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={form.settings?.font || "default"}
                onChange={(e) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      font: e.target.value,
                    },
                  })
                }
              >
                <option value="default">Default</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
                <option value="handwriting">Handwriting</option>
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <Label>Email notifications</Label>
              </div>
              <Switch
                checked={form.settings?.emailNotifications || false}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      emailNotifications: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <Label>Response summary</Label>
              </div>
              <Switch
                checked={form.settings?.showSummary || false}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      showSummary: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <Label>Restrict to signed-in users</Label>
              </div>
              <Switch
                checked={form.settings?.restrictedAccess || false}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      restrictedAccess: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <Label>Set deadline</Label>
              </div>
              <Switch
                checked={!!form.settings?.deadline}
                onCheckedChange={(checked) =>
                  updateForm({
                    settings: {
                      ...form.settings,
                      deadline: checked ? new Date().toISOString() : undefined,
                    },
                  })
                }
              />
            </div>

            {form.settings?.deadline && (
              <div>
                <Input
                  type="datetime-local"
                  value={
                    form.settings.deadline.split("T")[0] + "T" + form.settings.deadline.split("T")[1].substring(0, 5)
                  }
                  onChange={(e) =>
                    updateForm({
                      settings: {
                        ...form.settings,
                        deadline: new Date(e.target.value).toISOString(),
                      },
                    })
                  }
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
