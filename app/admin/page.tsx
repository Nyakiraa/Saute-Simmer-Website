"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, MapPin } from "lucide-react"

// Simple notification function to replace toast
const showNotification = (message: string, type: "success" | "error" = "success") => {
  alert(`${type.toUpperCase()}: ${message}`)
}

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
}

interface Item {
  id: number
  name: string
  category: string
  price: number
  description?: string
  created_at: string
}

interface MealSet {
  id: number
  name: string
  type: string
  price: number
  description?: string
  created_at: string
}

interface Order {
  id: number
  customer_name: string
  customer_email?: string
  total_amount: number
  status: string
  order_type: string
  meal_set_name?: string
  quantity: number
  order_date: string
  created_at: string
}

interface Location {
  id: number
  name: string
  address: string
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

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [mealSets, setMealSets] = useState<MealSet[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" })
  const [newItem, setNewItem] = useState({ name: "", category: "", price: 0, description: "" })
  const [newMealSet, setNewMealSet] = useState({ name: "", type: "", price: 0, description: "" })
  const [newLocation, setNewLocation] = useState({ name: "", address: "" })
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchCustomers(),
        fetchItems(),
        fetchMealSets(),
        fetchOrders(),
        fetchLocations(),
        fetchPayments(),
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      showNotification("Error loading dashboard data", "error")
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

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      })

      if (response.ok) {
        showNotification("Customer created successfully")
        setNewCustomer({ name: "", email: "", phone: "" })
        fetchCustomers()
      } else {
        throw new Error("Failed to create customer")
      }
    } catch (error) {
      showNotification("Error creating customer", "error")
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })

      if (response.ok) {
        showNotification("Item created successfully")
        setNewItem({ name: "", category: "", price: 0, description: "" })
        fetchItems()
      } else {
        throw new Error("Failed to create item")
      }
    } catch (error) {
      showNotification("Error creating item", "error")
    }
  }

  const handleCreateMealSet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/meal-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMealSet),
      })

      if (response.ok) {
        showNotification("Meal set created successfully")
        setNewMealSet({ name: "", type: "", price: 0, description: "" })
        fetchMealSets()
      } else {
        throw new Error("Failed to create meal set")
      }
    } catch (error) {
      showNotification("Error creating meal set", "error")
    }
  }

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      })

      if (response.ok) {
        showNotification("Location created successfully")
        setNewLocation({ name: "", address: "" })
        fetchLocations()
      } else {
        throw new Error("Failed to create location")
      }
    } catch (error) {
      showNotification("Error creating location", "error")
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showNotification("Item deleted successfully")
        fetchItems()
      } else {
        throw new Error("Failed to delete item")
      }
    } catch (error) {
      showNotification("Error deleting item", "error")
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        showNotification("Order status updated successfully")
        fetchOrders()
      } else {
        throw new Error("Failed to update order status")
      }
    } catch (error) {
      showNotification("Error updating order status", "error")
    }
  }

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
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your catering business operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(orders.reduce((sum, order) => sum + order.total_amount, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="meal-sets">Meal Sets</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell className="capitalize">{order.order_type}</TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone || "N/A"}</TableCell>
                          <TableCell>{formatDate(customer.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCustomer} className="space-y-4">
                    <div>
                      <Label htmlFor="customer-name">Name</Label>
                      <Input
                        id="customer-name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-email">Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">Phone</Label>
                      <Input
                        id="customer-phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Menu Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="capitalize">{item.category}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
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

              <Card>
                <CardHeader>
                  <CardTitle>Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateItem} className="space-y-4">
                    <div>
                      <Label htmlFor="item-name">Name</Label>
                      <Input
                        id="item-name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-category">Category</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main Course</SelectItem>
                          <SelectItem value="side">Side Dish</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="item-price">Price</Label>
                      <Input
                        id="item-price"
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-description">Description</Label>
                      <Textarea
                        id="item-description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meal Sets Tab */}
          <TabsContent value="meal-sets">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Meal Sets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealSets.map((mealSet) => (
                        <TableRow key={mealSet.id}>
                          <TableCell>{mealSet.name}</TableCell>
                          <TableCell className="capitalize">{mealSet.type}</TableCell>
                          <TableCell>{formatCurrency(mealSet.price)}</TableCell>
                          <TableCell>{formatDate(mealSet.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Meal Set</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateMealSet} className="space-y-4">
                    <div>
                      <Label htmlFor="mealset-name">Name</Label>
                      <Input
                        id="mealset-name"
                        value={newMealSet.name}
                        onChange={(e) => setNewMealSet({ ...newMealSet, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mealset-type">Type</Label>
                      <Select
                        value={newMealSet.type}
                        onValueChange={(value) => setNewMealSet({ ...newMealSet, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mealset-price">Price</Label>
                      <Input
                        id="mealset-price"
                        type="number"
                        step="0.01"
                        value={newMealSet.price}
                        onChange={(e) => setNewMealSet({ ...newMealSet, price: Number.parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mealset-description">Description</Label>
                      <Textarea
                        id="mealset-description"
                        value={newMealSet.description}
                        onChange={(e) => setNewMealSet({ ...newMealSet, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Meal Set
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>{location.name}</TableCell>
                          <TableCell>{location.address}</TableCell>
                          <TableCell>{formatDate(location.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateLocation} className="space-y-4">
                    <div>
                      <Label htmlFor="location-name">Name</Label>
                      <Input
                        id="location-name"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-address">Address</Label>
                      <Textarea
                        id="location-address"
                        value={newLocation.address}
                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
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
                        <TableCell>#{payment.id}</TableCell>
                        <TableCell>#{payment.order_id}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
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
