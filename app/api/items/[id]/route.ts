import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { data: item, error } = await supabase.from("items").select("*").eq("id", Number.parseInt(id)).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      console.error("Error fetching item:", error)
      return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const supabase = createServerClient()

    const { data: item, error } = await supabase
      .from("items")
      .update(body)
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      console.error("Error updating item:", error)
      return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = createServerClient()

    const { error } = await supabase.from("items").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting item:", error)
      return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
