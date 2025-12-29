import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Simplified middleware - no auth session management needed for QRT ID system
  return NextResponse.next({ request })
}
