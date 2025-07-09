"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, User, CreditCard, CheckCircle } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  type: "item" | "meal_set"
}

interface Location {
  id: number
  name: string
  address: string
  phone: string
  status: string
}

export default function OrderDetailsPage() {
  const searchParams = useSearchParams()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [orderId, setOrderId] = useState<string>("")

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Order Details
  const [orderDetails, setOrderDetails] = useState({
    orderType: "delivery",
    deliveryAddress: "",
    deliveryDate: "",
    deliveryTime: "",
    specialInstructions: "",
    locationId: "",
    paymentMethod: "cash",
  })

  // Event Details (for catering)
  const [eventDetails, setEventDetails] = useState({
    eventType: "",
    guestCount: 1,
    eventLocation: "",
  })

  useEffect(() => {
    // Parse order items from URL params
    const itemsParam = searchParams.get("items")
    if (itemsParam) {
      try {
        const items = JSON.parse(decodeURIComponent(itemsParam))
        setOrderItems(items)
      } catch (error) {
        console.error("Error parsing order items:", error)
      }
    }

    // Fetch available locations
    fetchLocations()
  }, [searchParams])

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.filter((loc: Location) => loc.status === "active"))
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        order_type: orderDetails.orderType,
        delivery_address: orderDetails.deliveryAddress,
        delivery_date: orderDetails.deliveryDate,
        delivery_time: orderDetails.deliveryTime,
        special_instructions: orderDetails.specialInstructions,
        location_id: orderDetails.locationId ? Number.parseInt(orderDetails.locationId) : null,
        payment_method: orderDetails.paymentMethod,
        total_amount: calculateTotal(),
        items: orderItems,
        event_details: orderDetails.orderType === "catering" ? eventDetails : null,
      }

      console.log("Submitting order:", orderData)

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        setOrderId(result.id)
        setOrderSubmitted(true)
        console.log("Order submitted successfully:", result)
      } else {
        const error = await response.json()
        console.error("Error submitting order:", error)
        alert("Failed to submit order. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Failed to submit order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
              <CardDescription>Your order has been successfully submitted and is being processed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-lg font-semibold">#{orderId}</p>
              </div>
              <p className="text-gray-600">We'll send you updates about your order via email and SMS.</p>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
                <Button variant="outline" onClick={() => (window.location.href = "/orders")}>
                  View My Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your selected items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Type */}
            <Card>
              <CardHeader>
                <CardTitle>Order Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={orderDetails.orderType}
                  onValueChange={(value) => setOrderDetails({ ...orderDetails, orderType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="catering">Catering Event</SelectItem>
                  </SelectContent>
                </Select>

                {orderDetails.orderType === "delivery" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        value={orderDetails.deliveryAddress}
                        onChange={(e) => setOrderDetails({ ...orderDetails, deliveryAddress: e.target.value })}
                        placeholder="Enter your full delivery address"
                        required
                      />
                    </div>
                  </div>
                )}

                {orderDetails.orderType === "pickup" && locations.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Pickup Location *</Label>
                    <Select
                      value={orderDetails.locationId}
                      onValueChange={(value) => setOrderDetails({ ...orderDetails, locationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pickup location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.name} - {location.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {orderDetails.orderType === "catering" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventType">Event Type</Label>
                      <Input
                        id="eventType"
                        value={eventDetails.eventType}
                        onChange={(e) => setEventDetails({ ...eventDetails, eventType: e.target.value })}
                        placeholder="e.g., Wedding, Corporate Event, Birthday Party"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestCount">Number of Guests</Label>
                      <Input
                        id="guestCount"
                        type="number"
                        min="1"
                        value={eventDetails.guestCount}
                        onChange={(e) =>
                          setEventDetails({ ...eventDetails, guestCount: Number.parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventLocation">Event Location</Label>
                      <Textarea
                        id="eventLocation"
                        value={eventDetails.eventLocation}
                        onChange={(e) => setEventDetails({ ...eventDetails, eventLocation: e.target.value })}
                        placeholder="Enter the event venue address"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      <CalendarDays className="w-4 h-4 inline mr-1" />
                      {orderDetails.orderType === "catering" ? "Event Date" : "Delivery Date"} *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={orderDetails.deliveryDate}
                      onChange={(e) => setOrderDetails({ ...orderDetails, deliveryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {orderDetails.orderType === "catering" ? "Event Time" : "Delivery Time"}
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={orderDetails.deliveryTime}
                      onChange={(e) => setOrderDetails({ ...orderDetails, deliveryTime: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={orderDetails.paymentMethod}
                  onValueChange={(value) => setOrderDetails({ ...orderDetails, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash on Delivery</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={orderDetails.specialInstructions}
                  onChange={(e) => setOrderDetails({ ...orderDetails, specialInstructions: e.target.value })}
                  placeholder="Any special requests or dietary requirements..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitOrder}
              disabled={loading || !customerInfo.name || !customerInfo.email || !orderDetails.deliveryDate}
              className="w-full"
              size="lg"
            >
              {loading ? "Submitting Order..." : `Place Order - $${calculateTotal().toFixed(2)}`}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
