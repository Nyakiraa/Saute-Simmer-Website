"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Search, Users, Package, Utensils, MapPin, CreditCard, ShoppingCart, Layers, LogOut } from "lucide-react"
import { toast } from "sonner"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"
import { signOut } from "@/lib/supabase-auth"

// Types
interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  created_at: string
}

interface Item {
  id: number
  name: string
  category: "snack" | "main" | "side" | "beverage"
  price: number
  description: string
  status: "available" | "unavailable"
}

interface MealSet {
  id: number
  name: string
  type: "premium" | "standard" | "basic"
  price: number
  description: string
  items: Item[]
  comment?: string
}

interface CateringService {
  id: number
  customer_id: number
  customer_name: string
  event_type: string
  event_date: string
  guest_count: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  location: string
  special_requests?: string
}

interface Location {
  id: number
  address: string
  date_of_service: string
  start_time: string
  end_time: string
}

interface Payment {
  id: number
  customer_id: number
  customer_name: string
  amount: number
  payment_method: "cash" | "bank" | "gcash" | "credit"
  status: "paid" | "pending" | "cancelled" | "refunded"
  payment_date: string
  notes?: string
}

interface Order {
  id: number
  customer_id: number
  customer_name: string
  items: Item[]
  total_amount: number
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled"
  order_date: string
}

function AdminDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState("overview")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [mealSets, setMealSets] = useState<MealSet[]>([])
  const [cateringServices, setCateringServices] = useState<CateringService[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isMealSetModalOpen, setIsMealSetModalOpen] = useState(false)
  const [isCateringModalOpen, setIsCateringModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Form states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editingMealSet, setEditingMealSet] = useState<MealSet | null>(null)
  const [editingCatering, setEditingCatering] = useState<CateringService | null>(null)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadCustomers(),
        loadItems(),
        loadMealSets(),
        loadCateringServices(),
        loadLocations(),
        loadPayments(),
        loadOrders(),
      ])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error loading customers:", error)
    }
  }

  const loadItems = async () => {
    try {
      const response = await fetch("/api/items")
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Error loading items:", error)
    }
  }

  const loadMealSets = async () => {
    try {
      const response = await fetch("/api/meal-sets")
      if (response.ok) {
        const data = await response.json()
        setMealSets(data)
      }
    } catch (error) {
      console.error("Error loading meal sets:", error)
    }
  }

  const loadCateringServices = async () => {
    try {
      const response = await fetch("/api/catering-services")
      if (response.ok) {
        const data = await response.json()
        setCateringServices(data)
      }
    } catch (error) {
      console.error("Error loading catering services:", error)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error loading locations:", error)
    }
  }

  const loadPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error loading payments:", error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    }
  }

  // CRUD Operations for Customers
  const handleSaveCustomer = async (customerData: Omit<Customer, "id" | "created_at">) => {
    try {
      if (editingCustomer) {
        const response = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        })
        if (response.ok) {
          toast.success("Customer updated successfully")
          await loadCustomers()
        } else {
          throw new Error("Failed to update customer")
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error)
      toast.error("Failed to save customer")
    }
    setIsCustomerModalOpen(false)
    setEditingCustomer(null)
  }

  // CRUD Operations for Items
  const handleSaveItem = async (itemData: Omit<Item, "id">) => {
    try {
      if (editingItem) {
        const response = await fetch(`/api/items/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        })
        if (response.ok) {
          toast.success("Item updated successfully")
          await loadItems()
        } else {
          throw new Error("Failed to update item")
        }
      }
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("Failed to save item")
    }
    setIsItemModalOpen(false)
    setEditingItem(null)
  }

  // CRUD Operations for Meal Sets
  const handleSaveMealSet = async (mealSetData: Omit<MealSet, "id">) => {
    try {
      if (editingMealSet) {
        const response = await fetch(`/api/meal-sets/${editingMealSet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mealSetData),
        })
        if (response.ok) {
          toast.success("Meal set updated successfully")
          await loadMealSets()
        } else {
          throw new Error("Failed to update meal set")
        }
      }
    } catch (error) {
      console.error("Error saving meal set:", error)
      toast.error("Failed to save meal set")
    }
    setIsMealSetModalOpen(false)
    setEditingMealSet(null)
  }

  // CRUD Operations for Catering Services
  const handleSaveCateringService = async (cateringData: Omit<CateringService, "id">) => {
    try {
      if (editingCatering) {
        const response = await fetch(`/api/catering-services/${editingCatering.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cateringData),
        })
        if (response.ok) {
          toast.success("Catering service updated successfully")
          await loadCateringServices()
        } else {
          throw new Error("Failed to update catering service")
        }
      }
    } catch (error) {
      console.error("Error saving catering service:", error)
      toast.error("Failed to save catering service")
    }
    setIsCateringModalOpen(false)
    setEditingCatering(null)
  }

  // CRUD Operations for Locations
  const handleSaveLocation = async (locationData: Omit<Location, "id">) => {
    try {
      if (editingLocation) {
        const response = await fetch(`/api/locations/${editingLocation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        })
        if (response.ok) {
          toast.success("Location updated successfully")
          await loadLocations()
        } else {
          throw new Error("Failed to update location")
        }
      }
    } catch (error) {
      console.error("Error saving location:", error)
      toast.error("Failed to save location")
    }
    setIsLocationModalOpen(false)
    setEditingLocation(null)
  }

  // CRUD Operations for Payments
  const handleSavePayment = async (paymentData: Omit<Payment, "id">) => {
    try {
      if (editingPayment) {
        const response = await fetch(`/api/payments/${editingPayment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        })
        if (response.ok) {
          toast.success("Payment updated successfully")
          await loadPayments()
        } else {
          throw new Error("Failed to update payment")
        }
      }
    } catch (error) {
      console.error("Error saving payment:", error)
      toast.error("Failed to save payment")
    }
    setIsPaymentModalOpen(false)
    setEditingPayment(null)
  }

  // Filter functions
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredMealSets = mealSets.filter(
    (mealSet) =>
      mealSet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mealSet.type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCateringServices = cateringServices.filter(
    (service) =>
      service.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.event_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredLocations = locations.filter((location) =>
    location.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPayments = payments.filter(
    (payment) =>
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredOrders = orders.filter(
    (order) =>
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/redlogo.png" alt="Saute and Simmer Logo" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-4xl font-bold text-red-800 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Comprehensive catering management system</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search across all data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="sets" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Sets
            </TabsTrigger>
            <TabsTrigger value="catering" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Catering
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{items.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.filter((o) => o.status !== "cancelled").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱
                    {payments
                      .filter((p) => p.status === "paid")
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>₱{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.order_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customer Management</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>
                          <Dialog
                            open={isCustomerModalOpen && editingCustomer?.id === customer.id}
                            onOpenChange={(open) => {
                              setIsCustomerModalOpen(open)
                              if (!open) setEditingCustomer(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCustomer(customer)
                                  setIsCustomerModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Customer</DialogTitle>
                              </DialogHeader>
                              <CustomerForm
                                customer={editingCustomer}
                                onSave={handleSaveCustomer}
                                onCancel={() => {
                                  setIsCustomerModalOpen(false)
                                  setEditingCustomer(null)
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Item Management</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>₱{item.price}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "available" ? "default" : "secondary"}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <Dialog
                            open={isItemModalOpen && editingItem?.id === item.id}
                            onOpenChange={(open) => {
                              setIsItemModalOpen(open)
                              if (!open) setEditingItem(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item)
                                  setIsItemModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Item</DialogTitle>
                              </DialogHeader>
                              <ItemForm
                                item={editingItem}
                                onSave={handleSaveItem}
                                onCancel={() => {
                                  setIsItemModalOpen(false)
                                  setEditingItem(null)
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meal Sets Tab */}
          <TabsContent value="sets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meal Set Management</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMealSets.map((mealSet) => (
                <Card key={mealSet.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{mealSet.name}</CardTitle>
                        <Badge variant={mealSet.type === "premium" ? "default" : "secondary"}>{mealSet.type}</Badge>
                      </div>
                      <Dialog
                        open={isMealSetModalOpen && editingMealSet?.id === mealSet.id}
                        onOpenChange={(open) => {
                          setIsMealSetModalOpen(open)
                          if (!open) setEditingMealSet(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingMealSet(mealSet)
                              setIsMealSetModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Meal Set</DialogTitle>
                          </DialogHeader>
                          <MealSetForm
                            mealSet={editingMealSet}
                            items={items}
                            onSave={handleSaveMealSet}
                            onCancel={() => {
                              setIsMealSetModalOpen(false)
                              setEditingMealSet(null)
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{mealSet.description}</p>
                    <div className="text-2xl font-bold text-red-600 mb-4">₱{mealSet.price}</div>
                    {mealSet.comment && <p className="text-sm text-gray-500">{mealSet.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Catering Services Tab */}
          <TabsContent value="catering" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Catering Services</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCateringServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.customer_name}</TableCell>
                        <TableCell>{service.event_type}</TableCell>
                        <TableCell>{service.event_date}</TableCell>
                        <TableCell>{service.guest_count}</TableCell>
                        <TableCell>
                          <Badge variant={service.status === "confirmed" ? "default" : "secondary"}>
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={isCateringModalOpen && editingCatering?.id === service.id}
                            onOpenChange={(open) => {
                              setIsCateringModalOpen(open)
                              if (!open) setEditingCatering(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCatering(service)
                                  setIsCateringModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Service</DialogTitle>
                              </DialogHeader>
                              <CateringServiceForm
                                service={editingCatering}
                                customers={customers}
                                onSave={handleSaveCateringService}
                                onCancel={() => {
                                  setIsCateringModalOpen(false)
                                  setEditingCatering(null)
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Location Management</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.date_of_service}</TableCell>
                        <TableCell>{location.start_time}</TableCell>
                        <TableCell>{location.end_time}</TableCell>
                        <TableCell>
                          <Dialog
                            open={isLocationModalOpen && editingLocation?.id === location.id}
                            onOpenChange={(open) => {
                              setIsLocationModalOpen(open)
                              if (!open) setEditingLocation(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingLocation(location)
                                  setIsLocationModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Location</DialogTitle>
                              </DialogHeader>
                              <LocationForm
                                location={editingLocation}
                                onSave={handleSaveLocation}
                                onCancel={() => {
                                  setIsLocationModalOpen(false)
                                  setEditingLocation(null)
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Management</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "paid" ? "default" : "secondary"}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>{payment.payment_date}</TableCell>
                        <TableCell>
                          <Dialog
                            open={isPaymentModalOpen && editingPayment?.id === payment.id}
                            onOpenChange={(open) => {
                              setIsPaymentModalOpen(open)
                              if (!open) setEditingPayment(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPayment(payment)
                                  setIsPaymentModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Payment</DialogTitle>
                              </DialogHeader>
                              <PaymentForm
                                payment={editingPayment}
                                customers={customers}
                                onSave={handleSavePayment}
                                onCancel={() => {
                                  setIsPaymentModalOpen(false)
                                  setEditingPayment(null)
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Customer Form Component
function CustomerForm({
  customer,
  onSave,
  onCancel,
}: {
  customer: Customer | null
  onSave: (data: Omit<Customer, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

// Item Form Component
function ItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: Item | null
  onSave: (data: Omit<Item, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || ("snack" as const),
    price: item?.price || 0,
    description: item?.description || "",
    status: item?.status || ("available" as const),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="snack">Snack</SelectItem>
            <SelectItem value="main">Main Course</SelectItem>
            <SelectItem value="side">Side Dish</SelectItem>
            <SelectItem value="beverage">Beverage</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="price">Price (₱)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

// Meal Set Form Component
function MealSetForm({
  mealSet,
  items,
  onSave,
  onCancel,
}: {
  mealSet: MealSet | null
  items: Item[]
  onSave: (data: Omit<MealSet, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: mealSet?.name || "",
    type: mealSet?.type || ("standard" as const),
    price: mealSet?.price || 0,
    description: mealSet?.description || "",
    items: mealSet?.items || [],
    comment: mealSet?.comment || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Set Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="price">Price (₱)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="comment">Additional Notes</Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

function CateringServiceForm({
  service,
  customers,
  onSave,
  onCancel,
}: {
  service: CateringService | null
  customers: Customer[]
  onSave: (data: Omit<CateringService, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    customer_id: service?.customer_id || 0,
    customer_name: service?.customer_name || "",
    event_type: service?.event_type || "",
    event_date: service?.event_date || "",
    guest_count: service?.guest_count || 0,
    status: service?.status || ("pending" as const),
    location: service?.location || "",
    special_requests: service?.special_requests || "",
  })

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === Number.parseInt(customerId))
    setFormData({
      ...formData,
      customer_id: Number.parseInt(customerId),
      customer_name: customer?.name || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customer">Customer</Label>
        <Select value={formData.customer_id.toString()} onValueChange={handleCustomerChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="eventType">Event Type</Label>
        <Input
          id="eventType"
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="eventDate">Event Date</Label>
        <Input
          id="eventDate"
          type="date"
          value={formData.event_date}
          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="guestCount">Guest Count</Label>
        <Input
          id="guestCount"
          type="number"
          value={formData.guest_count}
          onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Textarea
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea
          id="specialRequests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

function LocationForm({
  location,
  onSave,
  onCancel,
}: {
  location: Location | null
  onSave: (data: Omit<Location, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    address: location?.address || "",
    date_of_service: location?.date_of_service || "",
    start_time: location?.start_time || "",
    end_time: location?.end_time || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="dateOfService">Date of Service</Label>
        <Input
          id="dateOfService"
          type="date"
          value={formData.date_of_service}
          onChange={(e) => setFormData({ ...formData, date_of_service: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="time"
          value={formData.end_time}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

function PaymentForm({
  payment,
  customers,
  onSave,
  onCancel,
}: {
  payment: Payment | null
  customers: Customer[]
  onSave: (data: Omit<Payment, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    customer_id: payment?.customer_id || 0,
    customer_name: payment?.customer_name || "",
    amount: payment?.amount || 0,
    payment_method: payment?.payment_method || ("cash" as const),
    status: payment?.status || ("pending" as const),
    payment_date: payment?.payment_date || "",
    notes: payment?.notes || "",
  })

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === Number.parseInt(customerId))
    setFormData({
      ...formData,
      customer_id: Number.parseInt(customerId),
      customer_name: customer?.name || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customer">Customer</Label>
        <Select value={formData.customer_id.toString()} onValueChange={handleCustomerChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Amount (₱)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={formData.payment_method}
          onValueChange={(value: any) => setFormData({ ...formData, payment_method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="gcash">GCash</SelectItem>
            <SelectItem value="credit">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input
          id="paymentDate"
          type="date"
          value={formData.payment_date}
          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <AdminDashboard />
    </AdminAuthWrapper>
  )
}
