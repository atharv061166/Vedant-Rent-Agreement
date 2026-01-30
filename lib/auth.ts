// Admin authentication utilities

export interface AdminCredentials {
  userid: string
  password: string
}

export async function validateAdminCredentials(credentials: AdminCredentials): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Authentication error:", error)
    return false
  }
}

export function setAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_authenticated", "true")
    localStorage.setItem("admin_session_time", Date.now().toString())
  }
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_session_time")
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  
  const authenticated = localStorage.getItem("admin_authenticated")
  const sessionTime = localStorage.getItem("admin_session_time")
  
  if (!authenticated || authenticated !== "true" || !sessionTime) {
    return false
  }
  
  // Session expires after 24 hours
  const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const now = Date.now()
  const sessionStart = parseInt(sessionTime, 10)
  
  if (now - sessionStart > SESSION_DURATION) {
    clearAdminSession()
    return false
  }
  
  return true
}
