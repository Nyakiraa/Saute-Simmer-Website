"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const galleryItems = [
    {
      src: "/images/slide1.jpg",
      alt: "Fresh salads and glazed meats",
      category: "appetizers",
    },
    {
      src: "/images/slide2.jpg",
      alt: "Cheesy casseroles and gratins",
      category: "mains",
    },
    {
      src: "/images/slide3.jpg",
      alt: "Variety of prepared dishes",
      category: "mains",
    },
    {
      src: "/images/mixmatch.jpg",
      alt: "Mixed catering selection",
      category: "buffet",
    },
    {
      src: "/images/mealsets.jpg",
      alt: "Elegant rolled meats and wraps",
      category: "appetizers",
    },
  ]

  const categories = [
    { id: "all", label: "All" },
    { id: "appetizers", label: "Appetizers" },
    { id: "mains", label: "Main Courses" },
    { id: "buffet", label: "Buffet Style" },
  ]

  const filteredItems =
    selectedCategory === "all" ? galleryItems : galleryItems.filter((item) => item.category === selectedCategory)

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Culinary Gallery</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore our diverse menu offerings and see the quality that sets us apart.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square">
                <Image
                  src={item.src || "/placeholder.svg"}
                  alt={item.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
