"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react"

interface FinanceKPIProps {
    title: string
    value: string
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    icon?: React.ReactNode
    className?: string
}

export function FinanceKPI({ title, value, trend, icon, className }: FinanceKPIProps) {
    return (
        <Card className={cn("card-hover", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon || <DollarSign className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className={cn("text-xs flex items-center mt-1", trend.positive ? "text-green-600" : "text-red-600")}>
                        {trend.positive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                        <span className="font-medium">{Math.abs(trend.value)}%</span>
                        <span className="text-muted-foreground ml-1">{trend.label}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
