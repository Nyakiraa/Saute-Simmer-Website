import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: mealSet, error } = await supabase.from("meal_sets").select("*").eq("id", Number.parseInt(id)).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Meal set not found" }, { status: 404 })
      }
      console.error("Error fetching meal set:", error)
      return NextResponse.json({ error: "Failed to fetch meal set" }, { status: 500 })
    }

    return NextResponse.json(mealSet)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch meal set" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: mealSet, error } = await supabase
      .from("meal_sets")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Meal set not found" }, { status: 404 })
      }
      console.error("Error updating meal set:", error)
      return NextResponse.json({ error: "Failed to update meal set" }, { status: 500 })
    }

    return NextResponse.json(mealSet)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update meal set" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("meal_sets").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting meal set:", error)
      return NextResponse.json({ error: "Failed to delete meal set" }, { status: 500 })
    }

    return NextResponse.json({ message: "Meal set deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete meal set" }, { status: 500 })
  }
}
