"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LayoutDashboard, Upload, Settings, Menu, DollarSign, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ImportReview } from "@/components/import-review"

interface Bill {
  id: string | number
  name: string
  dueDate: string
  amount: number
  status: string
}

interface ChartDataPoint {
  date: string
  balance: number
  isPast?: boolean
}

interface DashboardMetrics {
  safe_to_spend: number
  total_balance: number
  pending_bills_total: number
  buffer_target: number
  upcoming_bills: Bill[]
  burn_down_chart: { date: string; balance: number }[]
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://127.0.0.1:8000/api/dashboard/')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: DashboardMetrics = await response.json()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data. Please ensure the backend is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const safeToSpend = dashboardData?.safe_to_spend ?? 0
  const totalBalance = dashboardData?.total_balance ?? 0
  const pendingBillsTotal = dashboardData?.pending_bills_total ?? 0
  const bufferTarget = dashboardData?.buffer_target ?? 0
  const upcomingBills = dashboardData?.upcoming_bills ?? []
  
  const projectionData: ChartDataPoint[] = dashboardData?.burn_down_chart.map((point, index) => ({
    date: point.date,
    balance: point.balance,
    isPast: index < 3
  })) ?? []

  const safeToSpendColor = safeToSpend > 500 ? "text-chart-1" : safeToSpend < 200 ? "text-chart-5" : "text-chart-4"

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r border-sidebar-border bg-sidebar flex flex-col overflow-hidden relative`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-lime">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-sidebar-foreground">FinanceOS</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant={activeNav === "dashboard" ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                activeNav === "dashboard" ? "bg-sidebar-accent text-primary font-semibold" : "text-sidebar-foreground"
              }`}
              onClick={() => setActiveNav("dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button
              variant={activeNav === "upload" ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                activeNav === "upload" ? "bg-sidebar-accent text-primary font-semibold" : "text-sidebar-foreground"
              }`}
              onClick={() => setActiveNav("upload")}
            >
              <Upload className="w-4 h-4 mr-3" />
              Upload
            </Button>
            <Button
              variant={activeNav === "settings" ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                activeNav === "settings" ? "bg-sidebar-accent text-primary font-semibold" : "text-sidebar-foreground"
              }`}
              onClick={() => setActiveNav("settings")}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground">Last synced</div>
          <div className="text-sm text-sidebar-foreground font-medium">2 minutes ago</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-accent"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-balance">Financial Overview</h1>
                <p className="text-xs text-muted-foreground">Real-time insights and projections</p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-lime font-semibold">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Loading dashboard...</div>
                <div className="text-sm text-muted-foreground">Fetching data from backend</div>
              </div>
            </div>
          )}
          {error && (
            <Card className="border-border glass-card border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">Make sure Django backend is running on http://127.0.0.1:8000</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && (
            activeNav === "upload" ? (
            <ImportReview />
          ) : activeNav === "settings" ? (
            <Card className="border-border glass-card">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your finance dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-1 border-border glass-card relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 to-transparent pointer-events-none" />
                  <CardHeader className="relative">
                    <CardDescription className="text-muted-foreground text-xs uppercase tracking-wider">
                      Balance
                    </CardDescription>
                    <CardTitle className="text-sm font-medium text-foreground/80">Safe to Spend</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-sm text-foreground/60">$</span>
                      <span className={`text-6xl font-bold ${safeToSpendColor} text-glow`}>{safeToSpend}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-6">
                      {safeToSpend > 500 ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
                          <span className="text-chart-1 font-medium">Healthy balance</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-chart-5" />
                          <span className="text-chart-5">Budget carefully</span>
                        </>
                      )}
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Balance</span>
                        <span className="font-semibold font-mono">${totalBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending Bills</span>
                        <span className="font-semibold text-chart-5 font-mono">-${pendingBillsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Buffer</span>
                        <span className="font-semibold text-chart-4 font-mono">-${bufferTarget.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-border glass-card relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-transparent to-chart-2/5 pointer-events-none" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-foreground">Cashflow Runway</CardTitle>
                        <CardDescription className="text-muted-foreground">8-week balance projection</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-muted/50 border-primary/30 text-primary font-mono">
                        60 days
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <ChartContainer
                      config={{
                        balance: {
                          label: "Balance",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[280px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                              <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            opacity={0.2}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickFormatter={(value) => `$${value}`}
                            tickLine={false}
                            axisLine={false}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, opacity: 0.3 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={3}
                            fill="url(#balanceGradient)"
                            dot={(props) => {
                              const { cx, cy, payload } = props
                              if (!payload) return null
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={5}
                                  fill="hsl(var(--chart-1))"
                                  stroke="hsl(var(--background))"
                                  strokeWidth={2}
                                  className={payload.isPast === false ? "opacity-60" : ""}
                                />
                              )
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border glass-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">Upcoming Bills</CardTitle>
                      <CardDescription className="text-muted-foreground">Next 30 days</CardDescription>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Badge variant="secondary" className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                        {upcomingBills.filter((b) => b.status === "paid").length} Paid
                      </Badge>
                      <Badge variant="outline" className="border-chart-4/30 text-chart-4 bg-chart-4/10">
                        {upcomingBills.filter((b) => b.status === "pending").length} Pending
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {upcomingBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-sidebar flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{bill.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">Due {bill.dueDate}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xl font-bold font-mono">${bill.amount.toFixed(2)}</div>
                          </div>
                          <Badge
                            variant={bill.status === "paid" ? "secondary" : "outline"}
                            className={
                              bill.status === "paid"
                                ? "bg-chart-2/20 text-chart-2 border-chart-2/30 px-4 py-1"
                                : "border-chart-4/30 text-chart-4 bg-chart-4/10 px-4 py-1"
                            }
                          >
                            {bill.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )
          )}
        </main>
      </div>
    </div>
  )
}
