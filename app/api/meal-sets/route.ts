import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: mealSets, error } = await supabase
      .from("meal_sets")
      .select("*")
      .order("type", { ascending: true })
      .order("price", { ascending: true })

    if (error) {
      console.error("Error fetching meal sets:", error)
      return NextResponse.json({ error: "Failed to fetch meal sets" }, { status: 500 })
    }

    return NextResponse.json(mealSets)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch meal sets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.type || !body.price) {
      return NextResponse.json({ error: "Name, type, and price are required" }, { status: 400 })
    }

    const { data: mealSet, error } = await supabase.from("meal_sets").insert([body]).select().single()

    if (error) {
      console.error("Error creating meal set:", error)
      return NextResponse.json({ error: "Failed to create meal set" }, { status: 500 })
    }

    return NextResponse.json(mealSet, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create meal set" }, { status: 500 })
  }
}
