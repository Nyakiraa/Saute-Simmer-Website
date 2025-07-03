import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Utensils, Calendar, Award } from "lucide-react"

export function ServicesSection() {
  const services = [
    {
      icon: <Users className="h-8 w-8 text-red-600" />,
      title: "Corporate Events",
      description: "Professional catering for business meetings, conferences, and corporate gatherings.",
    },
    {
      icon: <Utensils className="h-8 w-8 text-red-600" />,
      title: "Wedding Catering",
      description: "Make your special day perfect with our elegant wedding catering services.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-red-600" />,
      title: "Private Parties",
      description: "Intimate celebrations and private events with personalized menu options.",
    },
    {
      icon: <Award className="h-8 w-8 text-red-600" />,
      title: "Special Occasions",
      description: "Birthdays, anniversaries, and milestone celebrations made memorable.",
    },
  ]

  return (
    <section id="services" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We provide comprehensive catering services for all types of events, ensuring every occasion is memorable and
            delicious.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
