import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_CONFIG } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create a client with the user's session
    const supabaseAuth = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if user is admin
    const allowedAdmins = ["ecbathan@gbox.adnu.edu.ph", "rabad@gbox.adnu.edu.ph", "charnepomuceno@gbox.adnu.edu.ph"]
    const isAdmin = allowedAdmins.includes(user.email || "")

    const supabase = createServerClient()
    let query = supabase.from("catering_services").select("*").order("created_at", { ascending: false })

    // If not admin, filter by user's orders
    if (!isAdmin) {
      // Filter by customer email or name that matches the user
      query = query.or(`customer_name.eq.${user.user_metadata?.full_name || user.email},customer_name.eq.${user.email}`)
    }

    const { data: cateringServices, error } = await query

    if (error) {
      console.error("Error fetching catering services:", error)
      return NextResponse.json({ error: "Failed to fetch catering services" }, { status: 500 })
    }

    return NextResponse.json({
      orders: cateringServices,
      isAdmin,
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
