import {
  AlignLeft,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Clock,
  FileUp,
  Grid,
  List,
  SplitSquareVertical,
  Type,
} from "lucide-react"

export const questionTypes = [
  {
    id: "text",
    label: "Short Answer",
    icon: <Type className="h-4 w-4" />,
    description: "Short answer text",
  },
  {
    id: "paragraph",
    label: "Paragraph",
    icon: <AlignLeft className="h-4 w-4" />,
    description: "Long answer text",
  },
  {
    id: "multipleChoice",
    label: "Multiple Choice",
    icon: <Check className="h-4 w-4" />,
    description: "Choose one option",
  },
  {
    id: "checkbox",
    label: "Checkboxes",
    icon: <CheckSquare className="h-4 w-4" />,
    description: "Choose multiple options",
  },
  {
    id: "dropdown",
    label: "Dropdown",
    icon: <ChevronDown className="h-4 w-4" />,
    description: "Choose from a list",
  },
  {
    id: "linearScale",
    label: "Linear Scale",
    icon: <List className="h-4 w-4" />,
    description: "Rate on a scale",
  },
  {
    id: "grid",
    label: "Multiple Choice Grid",
    icon: <Grid className="h-4 w-4" />,
    description: "Grid of choices",
  },
  {
    id: "date",
    label: "Date",
    icon: <Calendar className="h-4 w-4" />,
    description: "Date picker",
  },
  {
    id: "time",
    label: "Time",
    icon: <Clock className="h-4 w-4" />,
    description: "Time picker",
  },
  {
    id: "fileUpload",
    label: "File Upload",
    icon: <FileUp className="h-4 w-4" />,
    description: "Upload files",
  },
  {
    id: "section",
    label: "Section",
    icon: <SplitSquareVertical className="h-4 w-4" />,
    description: "Add a section break",
  },
]

export const getQuestionTypeInfo = (type: string) => {
  return questionTypes.find((qt) => qt.id === type) || questionTypes[0]
}
