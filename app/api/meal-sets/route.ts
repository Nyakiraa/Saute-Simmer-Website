import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: mealSets, error } = await supabase
      .from("meal_sets")
      .select("*")
      .order("type", { ascending: false })
      .order("price", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch meal sets" }, { status: 500 })
    }

    return NextResponse.json(mealSets || [])
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()

    // Validate required fields
    const { name, type, price } = body

    if (!name || !type || !price) {
      return NextResponse.json({ error: "Missing required fields: name, type, price" }, { status: 400 })
    }

    // Insert the meal set
    const { data: mealSet, error: mealSetError } = await supabase
      .from("meal_sets")
      .insert({
        name,
        type,
        price: Number(price),
        description: body.description || null,
        comment: body.comment || null,
        items: body.items || null,
      })
      .select()
      .single()

    if (mealSetError) {
      console.error("Meal set creation error:", mealSetError)
      return NextResponse.json({ error: "Failed to create meal set" }, { status: 500 })
    }

    return NextResponse.json(mealSet, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
