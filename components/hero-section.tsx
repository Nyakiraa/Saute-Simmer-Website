import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone, Mail } from "lucide-react"

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/home.jpg" alt="Sauté & Simmer Catering" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <Image src="/images/logo.png" alt="Sauté & Simmer" width={400} height={120} className="mx-auto mb-6" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">Exceptional Catering Services</h1>

        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          From intimate gatherings to grand celebrations, we create unforgettable culinary experiences
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
            <Phone className="mr-2 h-5 w-5" />
            Call Now: (555) 123-4567
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
            <Mail className="mr-2 h-5 w-5" />
            Get Quote
          </Button>
        </div>
      </div>
    </section>
  )
}
