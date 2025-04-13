"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"
import type { Question } from "@/lib/types"

interface ConditionalLogicProps {
  questions: Question[]
  currentQuestionId: string
  logic: ConditionalRule[]
  onChange: (logic: ConditionalRule[]) => void
}

export interface ConditionalRule {
  id: string
  questionId: string
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than"
  value: string
  action: "show" | "hide" | "require" | "skip_to"
  targetQuestionId?: string
}

export function ConditionalLogic({ questions, currentQuestionId, logic, onChange }: ConditionalLogicProps) {
  const [rules, setRules] = useState<ConditionalRule[]>(logic || [])

  const eligibleQuestions = questions.filter(
    (q) =>
      q.id !== currentQuestionId &&
      (q.type === "multipleChoice" || q.type === "dropdown" || q.type === "checkbox" || q.type === "linearScale"),
  )

  const targetQuestions = questions.filter((q) => q.id !== currentQuestionId)

  const addRule = () => {
    if (eligibleQuestions.length === 0) return

    const newRule: ConditionalRule = {
      id: crypto.randomUUID(),
      questionId: eligibleQuestions[0].id,
      operator: "equals",
      value: "",
      action: "show",
    }

    const updatedRules = [...rules, newRule]
    setRules(updatedRules)
    onChange(updatedRules)
  }

  const updateRule = (id: string, data: Partial<ConditionalRule>) => {
    const updatedRules = rules.map((rule) => (rule.id === id ? { ...rule, ...data } : rule))
    setRules(updatedRules)
    onChange(updatedRules)
  }

  const removeRule = (id: string) => {
    const updatedRules = rules.filter((rule) => rule.id !== id)
    setRules(updatedRules)
    onChange(updatedRules)
  }

  const getQuestionById = (id: string) => {
    return questions.find((q) => q.id === id)
  }

  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case "equals":
        return "equals"
      case "not_equals":
        return "does not equal"
      case "contains":
        return "contains"
      case "not_contains":
        return "does not contain"
      case "greater_than":
        return "is greater than"
      case "less_than":
        return "is less than"
      default:
        return operator
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "show":
        return "Show this question"
      case "hide":
        return "Hide this question"
      case "require":
        return "Make this question required"
      case "skip_to":
        return "Skip to question"
      default:
        return action
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Conditional Logic</h3>
        <Button variant="outline" size="sm" onClick={addRule} disabled={eligibleQuestions.length === 0}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {eligibleQuestions.length === 0 && rules.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add multiple choice, dropdown, or scale questions to enable conditional logic.
        </p>
      )}

      {rules.length > 0 && (
        <div className="space-y-3">
          {rules.map((rule) => {
            const sourceQuestion = getQuestionById(rule.questionId)

            return (
              <Card key={rule.id} className="overflow-visible">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>If</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <Select
                      value={rule.questionId}
                      onValueChange={(value) => updateRule(rule.id, { questionId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleQuestions.map((question) => (
                          <SelectItem key={question.id} value={question.id}>
                            {question.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Select
                        value={rule.operator}
                        onValueChange={(value) =>
                          updateRule(rule.id, {
                            operator: value as ConditionalRule["operator"],
                          })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_equals">does not equal</SelectItem>
                          {(sourceQuestion?.type === "text" || sourceQuestion?.type === "paragraph") && (
                            <>
                              <SelectItem value="contains">contains</SelectItem>
                              <SelectItem value="not_contains">does not contain</SelectItem>
                            </>
                          )}
                          {sourceQuestion?.type === "linearScale" && (
                            <>
                              <SelectItem value="greater_than">is greater than</SelectItem>
                              <SelectItem value="less_than">is less than</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      {sourceQuestion?.type === "multipleChoice" || sourceQuestion?.type === "dropdown" ? (
                        <Select value={rule.value} onValueChange={(value) => updateRule(rule.id, { value })}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourceQuestion.options?.map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          placeholder="Enter value"
                          className="flex-1"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="w-[50px]">Then</Label>
                      <Select
                        value={rule.action}
                        onValueChange={(value) =>
                          updateRule(rule.id, {
                            action: value as ConditionalRule["action"],
                            targetQuestionId: value === "skip_to" ? targetQuestions[0]?.id : undefined,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show">Show this question</SelectItem>
                          <SelectItem value="hide">Hide this question</SelectItem>
                          <SelectItem value="require">Make this question required</SelectItem>
                          <SelectItem value="skip_to">Skip to question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {rule.action === "skip_to" && (
                      <Select
                        value={rule.targetQuestionId}
                        onValueChange={(value) => updateRule(rule.id, { targetQuestionId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target question" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetQuestions.map((question) => (
                            <SelectItem key={question.id} value={question.id}>
                              {question.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
