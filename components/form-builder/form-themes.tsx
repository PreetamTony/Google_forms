export const formThemes = [
  {
    id: "default",
    name: "Default",
    primaryColor: "#7c3aed", // Violet
    accentColor: "#e0e7ff", // Light violet
    headerImage: null,
  },
  {
    id: "blue",
    name: "Ocean",
    primaryColor: "#2563eb", // Blue
    accentColor: "#dbeafe", // Light blue
    headerImage: null,
  },
  {
    id: "green",
    name: "Forest",
    primaryColor: "#059669", // Green
    accentColor: "#d1fae5", // Light green
    headerImage: null,
  },
  {
    id: "red",
    name: "Ruby",
    primaryColor: "#dc2626", // Red
    accentColor: "#fee2e2", // Light red
    headerImage: null,
  },
  {
    id: "orange",
    name: "Sunset",
    primaryColor: "#ea580c", // Orange
    accentColor: "#ffedd5", // Light orange
    headerImage: null,
  },
  {
    id: "pink",
    name: "Blossom",
    primaryColor: "#db2777", // Pink
    accentColor: "#fce7f3", // Light pink
    headerImage: null,
  },
  {
    id: "gray",
    name: "Minimal",
    primaryColor: "#4b5563", // Gray
    accentColor: "#f3f4f6", // Light gray
    headerImage: null,
  },
  {
    id: "dark",
    name: "Night",
    primaryColor: "#1f2937", // Dark gray
    accentColor: "#374151", // Medium gray
    headerImage: null,
  },
]

export const getThemeById = (id: string) => {
  return formThemes.find((theme) => theme.id === id) || formThemes[0]
}

export const getThemeStyles = (themeId: string) => {
  const theme = getThemeById(themeId)

  return {
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    headerImage: theme.headerImage,
  }
}
