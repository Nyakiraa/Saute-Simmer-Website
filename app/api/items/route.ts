import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: items, error } = await supabase
      .from("items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }

    return NextResponse.json(items || [])
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
    const { name, category, price } = body

    if (!name || !category || !price) {
      return NextResponse.json({ error: "Missing required fields: name, category, price" }, { status: 400 })
    }

    // Insert the item
    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        name,
        category,
        price: Number(price),
        description: body.description || null,
        status: body.status || "available",
      })
      .select()
      .single()

    if (itemError) {
      console.error("Item creation error:", itemError)
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
