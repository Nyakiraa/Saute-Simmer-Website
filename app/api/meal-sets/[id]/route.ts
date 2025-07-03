import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const id = params.id

    const { data, error } = await supabase
      .from("meal_sets")
      .update({
        name: body.name,
        type: body.type,
        price: body.price,
        description: body.description,
        items: body.items,
        comment: body.comment,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating meal set:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
