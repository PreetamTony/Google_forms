// Simulated authentication functions for demo purposes
// In a real application, these would connect to a backend service

// Simulated user database
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123", // In a real app, this would be hashed
  },
]

// Simulate a delay for API calls
const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 800))

// Authenticate a user
export const authenticateUser = async (email: string, password: string): Promise<boolean> => {
  await simulateDelay()

  // For demo purposes, accept the demo credentials or check against our "database"
  if (email === "demo@example.com" && password === "demo123") {
    // Store user info in localStorage (in a real app, this would be a secure HTTP-only cookie)
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: "1",
        name: "Demo User",
        email: "demo@example.com",
      }),
    )
    return true
  }

  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
      }),
    )
    return true
  }

  return false
}

// Register a new user
export const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
  await simulateDelay()

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    return false
  }

  // In a real app, we would hash the password and store in a database
  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
  }

  users.push(newUser)
  return true
}

// Log out a user
export const logoutUser = async (): Promise<void> => {
  await simulateDelay()
  localStorage.removeItem("currentUser")
}

// Get the current user
export const getCurrentUser = (): { id: string; name: string; email: string } | null => {
  if (typeof window === "undefined") return null

  const userJson = localStorage.getItem("currentUser")
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

// Check if a user is logged in
export const isLoggedIn = (): boolean => {
  return !!getCurrentUser()
}

// Reset password (simulated)
export const resetPassword = async (email: string): Promise<boolean> => {
  await simulateDelay()

  // In a real app, we would send an email with a reset link
  // For demo purposes, we'll just return true if the email exists
  return users.some((u) => u.email === email)
}
