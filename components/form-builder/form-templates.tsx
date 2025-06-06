export const formTemplates = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    icon: "File",
    questions: [],
  },
  {
    id: "contact",
    name: "Contact Information",
    description: "Collect contact details",
    icon: "UserCircle",
    questions: [
      {
        id: "name",
        type: "text",
        title: "Name",
        required: true,
      },
      {
        id: "email",
        type: "text",
        title: "Email",
        required: true,
      },
      {
        id: "phone",
        type: "text",
        title: "Phone Number",
        required: false,
      },
      {
        id: "address",
        type: "paragraph",
        title: "Address",
        required: false,
      },
    ],
  },
  {
    id: "event",
    name: "Event Registration",
    description: "Plan events and gatherings",
    icon: "Calendar",
    questions: [
      {
        id: "name",
        type: "text",
        title: "Full Name",
        required: true,
      },
      {
        id: "email",
        type: "text",
        title: "Email Address",
        required: true,
      },
      {
        id: "attending",
        type: "multipleChoice",
        title: "Will you be attending?",
        required: true,
        options: ["Yes", "No", "Maybe"],
      },
      {
        id: "guests",
        type: "dropdown",
        title: "Number of guests",
        required: false,
        options: ["0", "1", "2", "3", "4", "5+"],
      },
      {
        id: "dietary",
        type: "checkbox",
        title: "Dietary Restrictions",
        required: false,
        options: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "None"],
      },
    ],
  },
  {
    id: "feedback",
    name: "Customer Feedback",
    description: "Collect user opinions",
    icon: "MessageSquare",
    questions: [
      {
        id: "satisfaction",
        type: "linearScale",
        title: "How satisfied are you with our service?",
        required: true,
        scaleMin: 1,
        scaleMax: 5,
        minLabel: "Very Dissatisfied",
        maxLabel: "Very Satisfied",
      },
      {
        id: "recommend",
        type: "linearScale",
        title: "How likely are you to recommend us to a friend?",
        required: true,
        scaleMin: 0,
        scaleMax: 10,
        minLabel: "Not at all likely",
        maxLabel: "Extremely likely",
      },
      {
        id: "improvements",
        type: "paragraph",
        title: "What could we do to improve?",
        required: false,
      },
      {
        id: "features",
        type: "checkbox",
        title: "Which features do you value the most?",
        required: false,
        options: ["Ease of use", "Customer support", "Features", "Price", "Reliability"],
      },
    ],
  },
  {
    id: "survey",
    name: "Customer Survey",
    description: "Comprehensive feedback form",
    icon: "ClipboardList",
    questions: [
      {
        id: "age",
        type: "dropdown",
        title: "Age",
        required: true,
        options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
      },
      {
        id: "gender",
        type: "multipleChoice",
        title: "Gender",
        required: true,
        options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      },
      {
        id: "usage",
        type: "multipleChoice",
        title: "How often do you use our product?",
        required: true,
        options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"],
      },
      {
        id: "section1",
        type: "section",
        title: "Product Feedback",
      },
      {
        id: "ratings",
        type: "grid",
        title: "Please rate the following aspects of our product",
        required: true,
        rows: ["Ease of use", "Features", "Design", "Customer support", "Value for money"],
        columns: ["Poor", "Fair", "Good", "Very good", "Excellent"],
      },
      {
        id: "improvements",
        type: "paragraph",
        title: "What improvements would you suggest?",
        required: false,
      },
    ],
  },
  {
    id: "rsvp",
    name: "RSVP",
    description: "Event response form",
    icon: "PartyPopper",
    questions: [
      {
        id: "name",
        type: "text",
        title: "Full Name",
        required: true,
      },
      {
        id: "attending",
        type: "multipleChoice",
        title: "Will you be attending?",
        required: true,
        options: ["Yes, I'll be there!", "Sorry, I can't make it"],
      },
      {
        id: "guests",
        type: "dropdown",
        title: "Number of guests (including yourself)",
        required: true,
        options: ["1", "2", "3", "4"],
      },
      {
        id: "dietary",
        type: "paragraph",
        title: "Any dietary requirements?",
        required: false,
      },
    ],
  },
]

export const getTemplateById = (id: string) => {
  return formTemplates.find((template) => template.id === id) || formTemplates[0]
}
