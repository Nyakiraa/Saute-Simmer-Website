import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: items, error } = await supabase.from("items").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching items:", error)
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error in GET /api/items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: item, error } = await supabase.from("items").insert(body).select().single()

    if (error) {
      console.error("Error creating item:", error)
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error in POST /api/items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
