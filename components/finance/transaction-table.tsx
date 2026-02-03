"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const transactions = [
    {
        id: "INV001",
        client: "Emma Laurent",
        amount: "350.00",
        status: "Paid",
        date: "2024-01-15",
    },
    {
        id: "INV002",
        client: "Cabinet Dupont",
        amount: "1,200.00",
        status: "Pending",
        date: "2024-01-18",
    },
    {
        id: "INV003",
        client: "Jean Martin",
        amount: "850.00",
        status: "Overdue",
        date: "2024-01-10",
    },
    {
        id: "INV004",
        client: "Sofia Davis",
        amount: "450.00",
        status: "Paid",
        date: "2024-01-20",
    },
    {
        id: "INV005",
        client: "TechSolutions SAS",
        amount: "2,500.00",
        status: "Paid",
        date: "2024-01-22",
    },
]

export function TransactionTable() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Transactions Récentes</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Facture</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell>{invoice.client}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            invoice.status === "Paid" ? "default" :
                                                invoice.status === "Pending" ? "secondary" : "destructive"
                                        }
                                    >
                                        {invoice.status === "Paid" ? "Payé" :
                                            invoice.status === "Pending" ? "En attente" : "Retard"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{invoice.amount}€</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
