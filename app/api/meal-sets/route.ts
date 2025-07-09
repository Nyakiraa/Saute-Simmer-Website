import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: mealSets, error } = await supabase
      .from("meal_sets")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching meal sets:", error)
      return NextResponse.json({ error: "Failed to fetch meal sets" }, { status: 500 })
    }

    return NextResponse.json(mealSets)
  } catch (error) {
    console.error("Error in GET /api/meal-sets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: mealSet, error } = await supabase.from("meal_sets").insert(body).select().single()

    if (error) {
      console.error("Error creating meal set:", error)
      return NextResponse.json({ error: "Failed to create meal set" }, { status: 500 })
    }

    return NextResponse.json(mealSet)
  } catch (error) {
    console.error("Error in POST /api/meal-sets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
