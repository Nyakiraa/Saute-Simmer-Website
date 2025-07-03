import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function AboutSection() {
  const features = [
    "Fresh, locally-sourced ingredients",
    "Customizable menu options",
    "Professional presentation",
    "Experienced culinary team",
    "Full-service event support",
    "Dietary accommodations available",
  ]

  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Sauté & Simmer</h2>
            <p className="text-lg text-muted-foreground mb-6">
              With over a decade of experience in the culinary industry, Sauté & Simmer has been creating exceptional
              dining experiences for events of all sizes. Our passion for food and commitment to excellence has made us
              a trusted name in catering services.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              From intimate dinner parties to large corporate events, we bring the same level of dedication and
              attention to detail to every occasion. Our team of skilled chefs and service professionals work together
              to ensure your event is both delicious and memorable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square relative">
                  <img src="/images/slide1.jpg" alt="Our cuisine" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square relative">
                  <img
                    src="/images/slide3.jpg"
                    alt="Professional presentation"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
