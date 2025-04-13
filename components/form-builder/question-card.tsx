"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, GripVertical, MoreHorizontal, Trash2, Settings, Plus, ImageIcon } from "lucide-react"
import { getQuestionTypeInfo } from "./question-types"
import type { Question } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: Question
  index: number
  updateQuestion: (id: string, data: Partial<Question>) => void
  removeQuestion: (id: string) => void
  duplicateQuestion: (id: string) => void
  isActive: boolean
  onActivate: () => void
  onDragStart: () => void
}

export function QuestionCard({
  question,
  index,
  updateQuestion,
  removeQuestion,
  duplicateQuestion,
  isActive,
  onActivate,
  onDragStart,
}: QuestionCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const questionType = getQuestionTypeInfo(question.type)

  const addOption = () => {
    const options = [...(question.options || []), ""]
    updateQuestion(question.id, { options })
  }

  const updateOption = (index: number, value: string) => {
    const options = [...(question.options || [])]
    options[index] = value
    updateQuestion(question.id, { options })
  }

  const removeOption = (index: number) => {
    const options = [...(question.options || [])]
    options.splice(index, 1)
    updateQuestion(question.id, { options })
  }

  const updateRowOption = (index: number, value: string) => {
    const rows = [...(question.rows || [])]
    rows[index] = value
    updateQuestion(question.id, { rows })
  }

  const addRowOption = () => {
    const rows = [...(question.rows || []), ""]
    updateQuestion(question.id, { rows })
  }

  const removeRowOption = (index: number) => {
    const rows = [...(question.rows || [])]
    rows.splice(index, 1)
    updateQuestion(question.id, { rows })
  }

  const updateColumnOption = (index: number, value: string) => {
    const columns = [...(question.columns || [])]
    columns[index] = value
    updateQuestion(question.id, { columns })
  }

  const addColumnOption = () => {
    const columns = [...(question.columns || []), ""]
    updateQuestion(question.id, { columns })
  }

  const removeColumnOption = (index: number) => {
    const columns = [...(question.columns || [])]
    columns.splice(index, 1)
    updateQuestion(question.id, { columns })
  }

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 group",
        isActive ? "border-primary shadow-md" : "hover:border-muted-foreground/20",
      )}
      onClick={onActivate}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
        onMouseDown={onDragStart}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <CardContent className="p-6 pl-10">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Input
                value={question.title}
                onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                placeholder={`Question ${index + 1}`}
                className="font-medium border-none px-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => e.stopPropagation()}
              />
              {question.description && (
                <Textarea
                  value={question.description}
                  onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                  placeholder="Description (optional)"
                  className="mt-2 border-none px-0 text-sm text-muted-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    {questionType.icon}
                    {questionType.label}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="end">
                  <div className="grid gap-1 p-2">{getQuestionTypeInfo("text").label}</div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => updateQuestion(question.id, { description: question.description ? "" : " " })}
                  >
                    {question.description ? "Remove" : "Add"} description
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAdvanced(!showAdvanced)}>
                    {showAdvanced ? "Hide" : "Show"} advanced options
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => duplicateQuestion(question.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removeQuestion(question.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Question type specific options */}
          {(question.type === "multipleChoice" || question.type === "checkbox" || question.type === "dropdown") && (
            <div className="space-y-2 pl-4">
              {(question.options || []).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <div className="w-4">
                    {question.type === "multipleChoice" && <div className="h-4 w-4 rounded-full border border-input" />}
                    {question.type === "checkbox" && <div className="h-4 w-4 rounded border border-input" />}
                    {question.type === "dropdown" && (
                      <span className="text-xs text-muted-foreground">{optionIndex + 1}.</span>
                    )}
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeOption(optionIndex)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addOption} className="ml-6">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          )}

          {question.type === "linearScale" && (
            <div className="space-y-4 pl-4">
              <div className="flex items-center gap-4">
                <div className="w-20">
                  <Label>Min value</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={question.scaleMin || 0}
                    onChange={(e) => updateQuestion(question.id, { scaleMin: Number.parseInt(e.target.value) })}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="w-20">
                  <Label>Max value</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={question.scaleMax || 5}
                    onChange={(e) => updateQuestion(question.id, { scaleMax: Number.parseInt(e.target.value) })}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Min label (optional)</Label>
                  <Input
                    value={question.minLabel || ""}
                    onChange={(e) => updateQuestion(question.id, { minLabel: e.target.value })}
                    placeholder="e.g., Not at all likely"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex-1">
                  <Label>Max label (optional)</Label>
                  <Input
                    value={question.maxLabel || ""}
                    onChange={(e) => updateQuestion(question.id, { maxLabel: e.target.value })}
                    placeholder="e.g., Extremely likely"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="pt-2">
                <Slider
                  defaultValue={[question.scaleMax ? question.scaleMax / 2 : 2.5]}
                  max={question.scaleMax || 5}
                  min={question.scaleMin || 0}
                  step={1}
                  disabled
                />
              </div>
            </div>
          )}

          {question.type === "grid" && (
            <div className="space-y-4 pl-4">
              <div>
                <Label className="mb-2 block">Rows</Label>
                {(question.rows || []).map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2 mb-2">
                    <Input
                      value={row}
                      onChange={(e) => updateRowOption(rowIndex, e.target.value)}
                      placeholder={`Row ${rowIndex + 1}`}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeRowOption(rowIndex)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addRowOption}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </Button>
              </div>
              <div>
                <Label className="mb-2 block">Columns</Label>
                {(question.columns || []).map((column, columnIndex) => (
                  <div key={columnIndex} className="flex items-center gap-2 mb-2">
                    <Input
                      value={column}
                      onChange={(e) => updateColumnOption(columnIndex, e.target.value)}
                      placeholder={`Column ${columnIndex + 1}`}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColumnOption(columnIndex)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addColumnOption}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Column
                </Button>
              </div>
            </div>
          )}

          {question.type === "date" && (
            <div className="pl-4">
              <DatePicker date={undefined} setDate={() => {}} />
            </div>
          )}

          {question.type === "time" && (
            <div className="pl-4 flex gap-2">
              <Input type="time" className="w-40" onClick={(e) => e.stopPropagation()} />
            </div>
          )}

          {question.type === "fileUpload" && (
            <div className="pl-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <div className="flex justify-center mb-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Respondents will be able to upload files here</p>
              </div>
            </div>
          )}

          {question.type === "section" && (
            <div className="pl-4">
              <div className="border-t-2 my-2" />
              <p className="text-sm text-muted-foreground">This section break will create a new page in the form</p>
            </div>
          )}

          {/* Advanced options */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Settings className="h-3.5 w-3.5" />
                Advanced options
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`required-${question.id}`} className="text-sm">
                    Required question
                  </Label>
                  <Switch
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                  />
                </div>

                {question.type !== "section" && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`description-${question.id}`} className="text-sm">
                      Show description
                    </Label>
                    <Switch
                      id={`description-${question.id}`}
                      checked={!!question.description}
                      onCheckedChange={(checked) => updateQuestion(question.id, { description: checked ? " " : "" })}
                    />
                  </div>
                )}

                {(question.type === "text" || question.type === "paragraph") && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`validation-${question.id}`} className="text-sm">
                      Response validation
                    </Label>
                    <Tabs defaultValue="none" className="w-[180px]">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="none">None</TabsTrigger>
                        <TabsTrigger value="number">Number</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
