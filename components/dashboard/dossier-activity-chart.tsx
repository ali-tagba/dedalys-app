"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

const audienceData = [
    { name: "Jan", audiences: 4 },
    { name: "Fév", audiences: 7 },
    { name: "Mar", audiences: 5 },
    { name: "Avr", audiences: 12 },
    { name: "Mai", audiences: 8 },
    { name: "Juin", audiences: 15 },
]

export function DossierActivityChart() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-md bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Activité Judiciaire
                </CardTitle>
                <CardDescription>Nombre d'audiences par mois</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={audienceData}>
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
                        />
                        <Tooltip
                            cursor={{ stroke: '#f1f5f9' }}
                            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="audiences"
                            stroke="#ea580c"
                            strokeWidth={3}
                            dot={{ fill: '#ea580c', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
