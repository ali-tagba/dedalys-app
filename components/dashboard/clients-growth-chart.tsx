"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"

const data = [
    { name: "Jan", total: 12 },
    { name: "Fév", total: 18 },
    { name: "Mar", total: 25 },
    { name: "Avr", total: 32 },
    { name: "Mai", total: 45 },
    { name: "Juin", total: 53 },
]

export function ClientsGrowthChart() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-md bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Users className="h-5 w-5 text-blue-600" />
                    Évolution du Portefeuille
                </CardTitle>
                <CardDescription>Croissance mensuelle des nouveaux clients</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="total"
                            fill="#2563EB"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
