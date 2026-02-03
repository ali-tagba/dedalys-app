"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Clock, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeTrackerProps {
    dossierId: string
    initialTime?: number // in minutes
}

export function TimeTracker({ dossierId, initialTime = 0 }: TimeTrackerProps) {
    const [elapsed, setElapsed] = useState(initialTime * 60) // in seconds
    const [isRunning, setIsRunning] = useState(false)
    const [sessionStart, setSessionStart] = useState<number | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRunning) {
            interval = setInterval(() => {
                setElapsed(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isRunning])

    const toggleTimer = () => {
        if (!isRunning) {
            setSessionStart(Date.now())
            setIsRunning(true)
        } else {
            setIsRunning(false)
            // Here we would typically save the session to the backend
            // saveTimeEntry(dossierId, (Date.now() - sessionStart!) / 1000 / 60)
            console.log("Saving session...", elapsed)
        }
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" /> Suivi du Temps
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                    <span className={cn(
                        "text-3xl font-mono font-bold tracking-wider tabular-nums transition-colors",
                        isRunning ? "text-blue-600" : "text-slate-700"
                    )}>
                        {formatTime(elapsed)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 uppercase font-medium">Temps Total</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        className={cn(
                            "w-full transition-all",
                            isRunning
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-transparent"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                        )}
                        onClick={toggleTimer}
                    >
                        {isRunning ? (
                            <>
                                <Pause className="h-4 w-4 mr-2" /> Pause
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" /> Démarrer
                            </>
                        )}
                    </Button>
                    <Button variant="outline" className="w-full text-slate-600">
                        <RotateCcw className="h-4 w-4 mr-2" /> Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
