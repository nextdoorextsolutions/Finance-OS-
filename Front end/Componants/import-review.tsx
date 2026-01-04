"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category: string
  isDuplicate: boolean
}

export function ImportReview() {
  const [dragActive, setDragActive] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [fileName, setFileName] = useState<string>("")

  // Simple duplicate detection: check if similar transaction exists (same amount, similar date, similar description)
  const detectDuplicates = (newTransactions: Transaction[]): Transaction[] => {
    const existingTransactions: Transaction[] = [
      // Mock existing transactions for demonstration
      {
        id: "existing-1",
        date: "2026-01-15",
        description: "Coffee Shop",
        amount: -4.5,
        category: "Food",
        isDuplicate: false,
      },
      {
        id: "existing-2",
        date: "2026-01-18",
        description: "Gas Station",
        amount: -45.0,
        category: "Transport",
        isDuplicate: false,
      },
    ]

    return newTransactions.map((transaction) => {
      const isDupe = existingTransactions.some(
        (existing) =>
          Math.abs(existing.amount - transaction.amount) < 0.01 &&
          Math.abs(new Date(existing.date).getTime() - new Date(transaction.date).getTime()) <
            2 * 24 * 60 * 60 * 1000 && // within 2 days
          existing.description.toLowerCase().includes(transaction.description.toLowerCase().split(" ")[0]),
      )
      return { ...transaction, isDuplicate: isDupe }
    })
  }

  const parseCSV = (text: string): Transaction[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const transactions = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim())
      return {
        id: `trans-${Date.now()}-${index}`,
        date: values[headers.indexOf("date")] || "",
        description: values[headers.indexOf("description")] || values[headers.indexOf("merchant")] || "",
        amount: Number.parseFloat(values[headers.indexOf("amount")] || "0"),
        category: values[headers.indexOf("category")] || "Uncategorized",
        isDuplicate: false,
      }
    })

    return detectDuplicates(transactions)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "text/csv") {
      handleFile(file)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsedTransactions = parseCSV(text)
      setTransactions(parsedTransactions)
      // Auto-approve non-duplicates
      const nonDuplicateIds = parsedTransactions.filter((t) => !t.isDuplicate).map((t) => t.id)
      setApprovedIds(new Set(nonDuplicateIds))
    }
    reader.readAsText(file)
  }

  const toggleApprove = (id: string, isDuplicate: boolean) => {
    if (isDuplicate) return // Don't allow toggling duplicates
    setApprovedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleImport = () => {
    const approvedTransactions = transactions.filter((t) => approvedIds.has(t.id))
    console.log("[v0] Importing transactions:", approvedTransactions)
    // Here you would send to your backend/database
    alert(`Importing ${approvedTransactions.length} transactions!`)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border glass-card">
        <CardHeader>
          <CardTitle>Import Transactions</CardTitle>
          <CardDescription>Upload a CSV file to review and import transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? "border-primary bg-primary/10 glow-lime"
                : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="csv-upload"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sidebar flex items-center justify-center glow-green">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {dragActive ? "Drop your CSV file here" : "Drag and drop your CSV file"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </div>
              {fileName && (
                <Badge variant="secondary" className="gap-2 bg-primary/20 text-primary border-primary/30">
                  <FileText className="w-3 h-3" />
                  {fileName}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card className="border-border glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Detected Transactions</CardTitle>
                <CardDescription>
                  Review and approve transactions before importing ({approvedIds.size} of {transactions.length}{" "}
                  approved)
                </CardDescription>
              </div>
              <Button
                onClick={handleImport}
                disabled={approvedIds.size === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-lime font-semibold"
              >
                Import Selected ({approvedIds.size})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Approve
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={`border-b border-border/30 transition-all ${
                        transaction.isDuplicate ? "bg-chart-4/15 hover:bg-chart-4/25" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={approvedIds.has(transaction.id)}
                          disabled={transaction.isDuplicate}
                          onChange={() => toggleApprove(transaction.id, transaction.isDuplicate)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed accent-primary"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm font-mono text-muted-foreground">{transaction.date}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">{transaction.description}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs bg-muted/50">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-base font-bold">
                        <span className={transaction.amount < 0 ? "text-chart-5" : "text-chart-1"}>
                          {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {transaction.isDuplicate ? (
                          <Badge variant="outline" className="gap-1.5 border-chart-4/30 text-chart-4 bg-chart-4/10">
                            <AlertTriangle className="w-3 h-3" />
                            Duplicate
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1.5 border-chart-1/30 text-chart-1 bg-chart-1/10">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
