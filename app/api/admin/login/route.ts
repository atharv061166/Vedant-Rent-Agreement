import { NextResponse } from "next/server"

// Admin credentials - in production, store these in environment variables
// For now, using environment variables with fallback defaults
const ADMIN_USERID = process.env.ADMIN_USERID || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userid, password } = body

    if (!userid || !password) {
      return NextResponse.json(
        { success: false, error: "User ID and password are required" },
        { status: 400 }
      )
    }

    // Validate credentials
    if (userid === ADMIN_USERID && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid user ID or password" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
