"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  BarChart3,
  Users,
  Package,
  Utensils,
  MapPin,
  CreditCard,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Types matching your actual database schema
interface Customer {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
}

interface Item {
  id: number
  name: string
  description: string
  price: number
  category: string
  available: boolean
  created_at: string
}

interface MealSet {
  id: number
  name: string
  description: string
  price: number
  items: string[]
  available: boolean
  created_at: string
}

interface CateringService {
  id: number
  customer_name: string
  event_type: string
  event_date: string
  guest_count: number
  status: string
  location: string
  created_at: string
}

interface Location {
  id: number
  name: string
  address: string
  phone: string
  status: string
  state: string
  zip_code: string
  country: string
  created_at: string
}

interface Payment {
  id: number
  order_id: number
  amount: number
  payment_method: string
  status: string
  created_at: string
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
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [mealSets, setMealSets] = useState<MealSet[]>([])
  const [cateringServices, setCateringServices] = useState<CateringService[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isMealSetModalOpen, setIsMealSetModalOpen] = useState(false)
  const [isCateringModalOpen, setIsCateringModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" })
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, category: "", available: true })
  const [newMealSet, setNewMealSet] = useState({ name: "", description: "", price: 0, items: [], available: true })
  const [newCateringService, setNewCateringService] = useState({
    customer_name: "",
    event_type: "",
    event_date: "",
    guest_count: 0,
    status: "pending",
    location: "",
  })
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    phone: "",
    status: "active",
    state: "",
    zip_code: "",
    country: "USA",
  })
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editingMealSet, setEditingMealSet] = useState<MealSet | null>(null)
  const [editingCatering, setEditingCatering] = useState<CateringService | null>(null)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Simple notification function to replace toast
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    // Simple alert for now - can be replaced with a proper toast library later
    if (type === "error") {
      alert(`Error: ${message}`)
    } else {
      alert(`Success: ${message}`)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchCustomers(),
        fetchItems(),
        fetchMealSets(),
        fetchCateringServices(),
        fetchLocations(),
        fetchPayments(),
        loadOrders(),
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items")
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const fetchMealSets = async () => {
    try {
      const response = await fetch("/api/meal-sets")
      if (response.ok) {
        const data = await response.json()
        setMealSets(data)
      }
    } catch (error) {
      console.error("Error fetching meal sets:", error)
    }
  }

  const fetchCateringServices = async () => {
    try {
      const response = await fetch("/api/catering-services")
      if (response.ok) {
        const data = await response.json()
        setCateringServices(data)
      }
    } catch (error) {
      console.error("Error fetching catering services:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const addCustomer = async () => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      })
      if (response.ok) {
        fetchCustomers()
        setNewCustomer({ name: "", email: "", phone: "" })
        showNotification("Customer added successfully")
      }
    } catch (error) {
      console.error("Error adding customer:", error)
      showNotification("Failed to add customer", "error")
    }
  }

  const addItem = async () => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
      if (response.ok) {
        fetchItems()
        setNewItem({ name: "", description: "", price: 0, category: "", available: true })
        showNotification("Item added successfully")
      }
    } catch (error) {
      console.error("Error adding item:", error)
      showNotification("Failed to add item", "error")
    }
  }

  const addMealSet = async () => {
    try {
      const response = await fetch("/api/meal-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMealSet),
      })
      if (response.ok) {
        fetchMealSets()
        setNewMealSet({ name: "", description: "", price: 0, items: [], available: true })
        showNotification("Meal set added successfully")
      }
    } catch (error) {
      console.error("Error adding meal set:", error)
      showNotification("Failed to add meal set", "error")
    }
  }

  const addCateringService = async () => {
    try {
      const response = await fetch("/api/catering-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCateringService),
      })
      if (response.ok) {
        fetchCateringServices()
        setNewCateringService({
          customer_name: "",
          event_type: "",
          event_date: "",
          guest_count: 0,
          status: "pending",
          location: "",
        })
        showNotification("Catering service added successfully")
      }
    } catch (error) {
      console.error("Error adding catering service:", error)
      showNotification("Failed to add catering service", "error")
    }
  }

  const addLocation = async () => {
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      })
      if (response.ok) {
        fetchLocations()
        setNewLocation({
          name: "",
          address: "",
          phone: "",
          status: "active",
          state: "",
          zip_code: "",
          country: "USA",
        })
        showNotification("Location added successfully")
      }
    } catch (error) {
      console.error("Error adding location:", error)
      showNotification("Failed to add location", "error")
    }
  }

  const deleteItem = async (id: number, type: string) => {
    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        switch (type) {
          case "customers":
            fetchCustomers()
            break
          case "items":
            fetchItems()
            break
          case "meal-sets":
            fetchMealSets()
            break
          case "catering-services":
            fetchCateringServices()
            break
          case "locations":
            fetchLocations()
            break
          case "payments":
            fetchPayments()
            break
        }
        showNotification(`${type.slice(0, -1)} deleted successfully`)
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      showNotification(`Failed to delete ${type.slice(0, -1)}`, "error")
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
          showNotification("Customer updated successfully")
          await fetchCustomers()
        } else {
          throw new Error("Failed to update customer")
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error)
      showNotification("Failed to save customer", "error")
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
          showNotification("Item updated successfully")
          await fetchItems()
        } else {
          throw new Error("Failed to update item")
        }
      }
    } catch (error) {
      console.error("Error saving item:", error)
      showNotification("Failed to save item", "error")
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
          showNotification("Meal set updated successfully")
          await fetchMealSets()
        } else {
          throw new Error("Failed to update meal set")
        }
      }
    } catch (error) {
      console.error("Error saving meal set:", error)
      showNotification("Failed to save meal set", "error")
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
          showNotification("Catering service updated successfully")
          await fetchCateringServices()
        } else {
          throw new Error("Failed to update catering service")
        }
      }
    } catch (error) {
      console.error("Error saving catering service:", error)
      showNotification("Failed to save catering service", "error")
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
          showNotification("Location updated successfully")
          await fetchLocations()
        } else {
          throw new Error("Failed to update location")
        }
      }
    } catch (error) {
      console.error("Error saving location:", error)
      showNotification("Failed to save location", "error")
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
          showNotification("Payment updated successfully")
          await fetchPayments()
        } else {
          throw new Error("Failed to update payment")
        }
      }
    } catch (error) {
      console.error("Error saving payment:", error)
      showNotification("Failed to save payment", "error")
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
      mealSet.description?.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const filteredPayments = payments.filter((payment) =>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src="/images/redlogo.png" alt="Sauté & Simmer" className="h-12 w-auto mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Comprehensive catering management system</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search across all data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
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
              <Utensils className="h-4 w-4" />
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

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <CardTitle className="text-sm font-medium">Catering Events</CardTitle>
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cateringServices.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Locations</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{locations.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>Manage your customer database</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>Enter customer details below</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addCustomer}>Add Customer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers
                      .filter(
                        (customer) =>
                          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteItem(customer.id, "customers")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Location Management</CardTitle>
                    <CardDescription>Manage delivery and event locations</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Location</DialogTitle>
                        <DialogDescription>Enter location details below</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="location-name"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="address" className="text-right">
                            Address
                          </Label>
                          <Textarea
                            id="address"
                            value={newLocation.address}
                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location-phone" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="location-phone"
                            value={newLocation.phone}
                            onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="state" className="text-right">
                            State
                          </Label>
                          <Input
                            id="state"
                            value={newLocation.state}
                            onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="zip" className="text-right">
                            ZIP Code
                          </Label>
                          <Input
                            id="zip"
                            value={newLocation.zip_code}
                            onChange={(e) => setNewLocation({ ...newLocation, zip_code: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location-status" className="text-right">
                            Status
                          </Label>
                          <Select
                            value={newLocation.status}
                            onValueChange={(value) => setNewLocation({ ...newLocation, status: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addLocation}>Add Location</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
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
                    {locations
                      .filter(
                        (location) =>
                          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          location.address.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{location.address}</TableCell>
                          <TableCell>{location.phone}</TableCell>
                          <TableCell>
                            <Badge variant={location.status === "active" ? "default" : "secondary"}>
                              {location.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteItem(location.id, "locations")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catering" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Catering Services</CardTitle>
                    <CardDescription>Manage catering events and bookings</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Catering Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Catering Event</DialogTitle>
                        <DialogDescription>Enter event details below</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="customer-name" className="text-right">
                            Customer
                          </Label>
                          <Input
                            id="customer-name"
                            value={newCateringService.customer_name}
                            onChange={(e) =>
                              setNewCateringService({ ...newCateringService, customer_name: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-type" className="text-right">
                            Event Type
                          </Label>
                          <Input
                            id="event-type"
                            value={newCateringService.event_type}
                            onChange={(e) =>
                              setNewCateringService({ ...newCateringService, event_type: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-date" className="text-right">
                            Date
                          </Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newCateringService.event_date}
                            onChange={(e) =>
                              setNewCateringService({ ...newCateringService, event_date: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="guests" className="text-right">
                            Guests
                          </Label>
                          <Input
                            id="guests"
                            type="number"
                            value={newCateringService.guest_count}
                            onChange={(e) =>
                              setNewCateringService({
                                ...newCateringService,
                                guest_count: Number.parseInt(e.target.value),
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location" className="text-right">
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={newCateringService.location}
                            onChange={(e) => setNewCateringService({ ...newCateringService, location: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addCateringService}>Add Event</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
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
                    {cateringServices
                      .filter(
                        (service) =>
                          service.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.event_type.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.customer_name}</TableCell>
                          <TableCell>{service.event_type}</TableCell>
                          <TableCell>{new Date(service.event_date).toLocaleDateString()}</TableCell>
                          <TableCell>{service.guest_count}</TableCell>
                          <TableCell>
                            <Badge variant={service.status === "confirmed" ? "default" : "secondary"}>
                              {service.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{service.location}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteItem(service.id, "catering-services")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tab contents for items, sets, and payments */}
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Manage your menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Items management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meal Sets</CardTitle>
                <CardDescription>Manage your meal set combinations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Meal sets management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Track and manage payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>#{payment.order_id}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <AdminDashboard />
    </AdminAuthWrapper>
  )
}
