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
import {
  Edit,
  Search,
  Users,
  Package,
  Utensils,
  MapPin,
  CreditCard,
  ShoppingCart,
  Layers,
  LogOut,
  Eye,
} from "lucide-react"
import { toast } from "sonner"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"
import { signOut } from "@/lib/supabase-auth"

// Types matching your actual database schema
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
  category: string
  price: number
  description: string
  status: string
  created_at: string
}

interface MealSet {
  id: number
  name: string
  type: string
  price: number
  description: string
  items: any
  comment?: string
  created_at: string
}

interface CateringService {
  id: number
  customer_id: number
  customer_name: string
  event_type: string
  event_date: string
  guest_count: number
  status: string
  location: string
  special_requests?: string
  created_at: string
  order_id?: number
  location_id?: number
  payment_method?: string
}

interface Location {
  id: number
  name: string
  address: string
  phone?: string
  status: string
  created_at: string
  state?: string
  zip_code?: string
  country: string
}

interface Payment {
  id: number
  customer_id: number
  customer_name: string
  amount: number
  transaction_id?: string
  payment_date: string
  created_at: string
  order_id?: number
  payment_method?: string
  status: string
}

interface Order {
  id: number
  customer_id?: number
  customer_name: string
  items: any[]
  total_amount: number
  status: string
  order_date: string
  created_at: string
  delivery_date?: string
  delivery_address?: string
  special_instructions?: string
  payment_method?: string
  customer_email?: string
  order_type: string
  meal_set_id?: number
  meal_set_name?: string
  event_type?: string
  event_date?: string
  contact_person?: string
  contact_number?: string
  special_requests?: string
  quantity: number
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  // Form states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editingMealSet, setEditingMealSet] = useState<MealSet | null>(null)
  const [editingCatering, setEditingCatering] = useState<CateringService | null>(null)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // View order items modal state
  const [viewingOrderItems, setViewingOrderItems] = useState<{ order: Order; mealSet: MealSet | null } | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = "/login?message=logout-success"
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

  // View order items function
  const handleViewOrderItems = async (order: Order) => {
    console.log("Viewing order:", order) // Debug log
    console.log("Order items:", order.items) // Debug log

    if (order.meal_set_id) {
      const mealSet = mealSets.find((ms) => ms.id === order.meal_set_id)
      setViewingOrderItems({ order, mealSet: mealSet || null })
    } else {
      setViewingOrderItems({ order, mealSet: null })
    }
  }

  // Render meal items function
  const renderMealItems = (items: any) => {
    if (!items) return <span className="text-gray-500">No items data</span>

    // Handle both string and object formats
    if (typeof items === "string") {
      return <span className="text-gray-600">{items}</span>
    }

    if (typeof items === "object" && items !== null) {
      return (
        <div className="space-y-2 text-sm">
          {items.am_snack && (
            <div>
              <span className="font-medium text-gray-700">AM Snack:</span>
              <span className="ml-2 text-gray-600">
                {Array.isArray(items.am_snack) ? items.am_snack.join(", ") : items.am_snack}
              </span>
            </div>
          )}
          {items.lunch && (
            <div>
              <span className="font-medium text-gray-700">Lunch:</span>
              <span className="ml-2 text-gray-600">
                {Array.isArray(items.lunch) ? items.lunch.join(", ") : items.lunch}
              </span>
            </div>
          )}
          {items.pm_snack && (
            <div>
              <span className="font-medium text-gray-700">PM Snack:</span>
              <span className="ml-2 text-gray-600">
                {Array.isArray(items.pm_snack) ? items.pm_snack.join(", ") : items.pm_snack}
              </span>
            </div>
          )}
        </div>
      )
    }

    return <span className="text-gray-500">No items data</span>
  }

  // Enhanced render order items function with better debugging and handling
  const renderOrderItems = (items: any) => {
    console.log("renderOrderItems called with:", items) // Debug log
    console.log("Type of items:", typeof items) // Debug log

    if (!items) {
      console.log("Items is null/undefined")
      return <span className="text-gray-500">No items selected</span>
    }

    const extractItemNames = (data: any): string[] => {
      console.log("extractItemNames called with:", data) // Debug log
      const names: string[] = []

      // Handle null or undefined
      if (!data) {
        console.log("Data is null/undefined")
        return names
      }

      // If data is a string, try to parse it as JSON first
      if (typeof data === "string") {
        console.log("Data is string:", data)

        // Handle empty string
        if (data.trim() === "") {
          console.log("Empty string")
          return names
        }

        try {
          const parsed = JSON.parse(data)
          console.log("Parsed JSON:", parsed)
          return extractItemNames(parsed) // Recursive call with parsed data
        } catch (e) {
          console.log("Failed to parse JSON, treating as comma-separated string")
          // If parsing fails, treat as comma-separated string
          const itemList = data
            .split(",")
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
          console.log("Comma-separated items:", itemList)
          return itemList
        }
      }

      // Handle arrays
      if (Array.isArray(data)) {
        console.log("Data is array:", data)
        data.forEach((item: any, index: number) => {
          console.log(`Array item ${index}:`, item)
          if (typeof item === "string") {
            names.push(item)
          } else if (typeof item === "object" && item !== null && item.name) {
            names.push(item.name)
          }
        })
      }
      // Handle objects (including the complex categorized format)
      else if (typeof data === "object" && data !== null) {
        console.log("Data is object:", data)

        // Handle the specific structure: {"snack":[{...}],"main":[],"side":[],"beverage":[]}
        Object.entries(data).forEach(([category, categoryItems]: [string, any]) => {
          console.log(`Category ${category}:`, categoryItems)

          if (Array.isArray(categoryItems)) {
            categoryItems.forEach((item: any, index: number) => {
              console.log(`${category} item ${index}:`, item)
              if (typeof item === "object" && item !== null && item.name) {
                names.push(item.name)
              } else if (typeof item === "string") {
                names.push(item)
              }
            })
          } else if (typeof categoryItems === "string") {
            // Handle case where category contains a string
            names.push(categoryItems)
          }
        })
      }

      console.log("Extracted names:", names)
      return names
    }

    const itemNames = extractItemNames(items)

    if (itemNames.length === 0) {
      console.log("No item names extracted")
      return (
        <div className="space-y-2">
          <span className="text-gray-500">No items selected</span>
          <div className="text-xs text-gray-400 mt-2">
            <strong>Debug info:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(items, null, 2)}
            </pre>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {itemNames.map((name, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded">
            <span className="font-medium">{name}</span>
          </div>
        ))}
      </div>
    )
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
  const handleSaveItem = async (itemData: Omit<Item, "id" | "created_at">) => {
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
  const handleSaveMealSet = async (mealSetData: Omit<MealSet, "id" | "created_at">) => {
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
  const handleSaveCateringService = async (cateringData: Omit<CateringService, "id" | "created_at">) => {
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
  const handleSaveLocation = async (locationData: Omit<Location, "id" | "created_at">) => {
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
  const handleSavePayment = async (paymentData: Omit<Payment, "id" | "created_at">) => {
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

  const handleSaveOrder = async (orderData: Omit<Order, "id" | "created_at">) => {
    try {
      if (editingOrder) {
        const response = await fetch(`/api/orders/${editingOrder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: orderData.status }),
        })
        if (response.ok) {
          toast.success("Order status updated successfully")
          await loadOrders()
        } else {
          throw new Error("Failed to update order")
        }
      }
    } catch (error) {
      console.error("Error saving order:", error)
      toast.error("Failed to save order")
    }
    setIsOrderModalOpen(false)
    setEditingOrder(null)
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

  const filteredLocations = locations.filter(
    (location) =>
      location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Helper functions for formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "preparing":
        return "outline"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      case "paid":
        return "default"
      case "active":
        return "default"
      case "available":
        return "default"
      default:
        return "secondary"
    }
  }

  // Calculate revenue properly
  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)

  const paidRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  // Use the higher of the two calculations for more accurate revenue
  const actualRevenue = Math.max(totalRevenue, paidRevenue)

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
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{items.length}</div>
                  <p className="text-xs text-muted-foreground">Available items</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter((o) => o.status !== "cancelled" && o.status !== "delivered").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Orders in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(actualRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    From {orders.filter((o) => o.status !== "cancelled").length} orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No orders found</p>
                    <p className="text-sm">Orders will appear here once customers start placing them</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 10)
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.meal_set_name || order.order_type}</div>
                                <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(order.total_amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline" onClick={() => handleViewOrderItems(order)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Dialog
                                  open={isOrderModalOpen && editingOrder?.id === order.id}
                                  onOpenChange={(open) => {
                                    setIsOrderModalOpen(open)
                                    if (!open) setEditingOrder(null)
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingOrder(order)
                                        setIsOrderModalOpen(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Order Status</DialogTitle>
                                    </DialogHeader>
                                    <OrderForm
                                      order={editingOrder}
                                      onSave={handleSaveOrder}
                                      onCancel={() => {
                                        setIsOrderModalOpen(false)
                                        setEditingOrder(null)
                                      }}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
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
                      <TableHead>Joined</TableHead>
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
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
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
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
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
                    <div className="text-2xl font-bold text-red-600 mb-4">{formatCurrency(mealSet.price)}</div>
                    <div className="mb-4">{renderMealItems(mealSet.items)}</div>
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
                      <TableHead>Location</TableHead>
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
                          <Badge variant={getStatusBadgeVariant(service.status)}>{service.status}</Badge>
                        </TableCell>
                        <TableCell>{service.location}</TableCell>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.phone}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(location.status)}>{location.status}</Badge>
                        </TableCell>
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
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell>{payment.transaction_id}</TableCell>
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

        {/* Order Items View Modal */}
        {viewingOrderItems && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Order Details - #{viewingOrderItems.order.id}</h3>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-800">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Customer:</strong> {viewingOrderItems.order.customer_name}
                    </div>
                    <div>
                      <strong>Email:</strong> {viewingOrderItems.order.customer_email}
                    </div>
                    <div>
                      <strong>Contact:</strong> {viewingOrderItems.order.contact_number}
                    </div>
                    <div>
                      <strong>Contact Person:</strong> {viewingOrderItems.order.contact_person}
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-green-800">Event Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Event Type:</strong> {viewingOrderItems.order.event_type}
                    </div>
                    <div>
                      <strong>Event Date:</strong> {viewingOrderItems.order.event_date}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {viewingOrderItems.order.quantity} persons
                    </div>
                    <div>
                      <strong>Order Type:</strong> {viewingOrderItems.order.order_type}
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                {viewingOrderItems.order.delivery_address && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-yellow-800">Delivery Information</h4>
                    <div>
                      <strong>Delivery Address:</strong>
                      <p className="text-gray-600 mt-1">{viewingOrderItems.order.delivery_address}</p>
                    </div>
                  </div>
                )}

                {/* Selected Items */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-purple-800">Selected Items</h4>
                  {renderOrderItems(viewingOrderItems.order.items)}
                </div>

                {/* Meal Set Information */}
                {viewingOrderItems.mealSet && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-red-800">Meal Set: {viewingOrderItems.mealSet.name}</h4>
                    <div className="mb-3">
                      <strong>Description:</strong> {viewingOrderItems.mealSet.description}
                    </div>
                    <div className="mb-3">
                      <strong>Type:</strong> <Badge variant="outline">{viewingOrderItems.mealSet.type}</Badge>
                    </div>
                    <div className="mb-3">
                      <strong>Meal Set Contents:</strong>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      {renderMealItems(viewingOrderItems.mealSet.items)}
                    </div>
                    {viewingOrderItems.mealSet.comment && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                        <strong className="text-red-600">Special Note:</strong>
                        <p className="text-red-600 mt-1">{viewingOrderItems.mealSet.comment}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Requests */}
                {viewingOrderItems.order.special_requests && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-orange-800">Special Requests</h4>
                    <p className="text-gray-600">{viewingOrderItems.order.special_requests}</p>
                  </div>
                )}

                {/* Payment Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-gray-800">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Payment Method:</strong> {viewingOrderItems.order.payment_method || "Not specified"}
                    </div>
                    <div>
                      <strong>Order Status:</strong>
                      <Badge variant={getStatusBadgeVariant(viewingOrderItems.order.status)} className="ml-2">
                        {viewingOrderItems.order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-2xl font-bold text-green-600">
                      Total Amount: ₱{Number(viewingOrderItems.order.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setViewingOrderItems(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
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
  onSave: (data: Omit<Item, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "snack",
    price: item?.price || 0,
    description: item?.description || "",
    status: item?.status || "available",
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
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
  onSave: (data: Omit<MealSet, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: mealSet?.name || "",
    type: mealSet?.type || "standard",
    price: mealSet?.price || 0,
    description: mealSet?.description || "",
    items: typeof mealSet?.items === "string" ? mealSet.items : JSON.stringify(mealSet?.items || {}),
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
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
        <Label htmlFor="items">Items (comma-separated or JSON)</Label>
        <Textarea
          id="items"
          value={formData.items}
          onChange={(e) => setFormData({ ...formData, items: e.target.value })}
          placeholder="e.g., Grilled Chicken, Rice, Vegetables"
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
  onSave: (data: Omit<CateringService, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    customer_id: service?.customer_id || 0,
    customer_name: service?.customer_name || "",
    event_type: service?.event_type || "",
    event_date: service?.event_date || "",
    guest_count: service?.guest_count || 0,
    status: service?.status || "pending",
    location: service?.location || "",
    special_requests: service?.special_requests || "",
    order_id: service?.order_id || undefined,
    location_id: service?.location_id || undefined,
    payment_method: service?.payment_method || "",
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
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input
          id="paymentMethod"
          value={formData.payment_method}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
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
  onSave: (data: Omit<Location, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: location?.name || "",
    address: location?.address || "",
    phone: location?.phone || "",
    status: location?.status || "active",
    state: location?.state || "",
    zip_code: location?.zip_code || "",
    country: location?.country || "Philippines",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Location Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      <div>
        <Label htmlFor="state">State/Province</Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          value={formData.zip_code}
          onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
  onSave: (data: Omit<Payment, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    customer_id: payment?.customer_id || 0,
    customer_name: payment?.customer_name || "",
    amount: payment?.amount || 0,
    transaction_id: payment?.transaction_id || "",
    payment_date: payment?.payment_date || new Date().toISOString().split("T")[0],
    order_id: payment?.order_id || undefined,
    payment_method: payment?.payment_method || "",
    status: payment?.status || "pending",
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
          onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
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
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
        <Label htmlFor="transactionId">Transaction ID</Label>
        <Input
          id="transactionId"
          value={formData.transaction_id}
          onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
        />
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
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}

function OrderForm({
  order,
  onSave,
  onCancel,
}: {
  order: Order | null
  onSave: (data: Omit<Order, "id" | "created_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    status: order?.status || "pending",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as any)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Order Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
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

