"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { useAuth } from "@/lib/auth-context"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, loading } = useAuth()

    // On auth pages, render children directly — no sidebar, no auth check
    const isAuthPage = pathname?.startsWith('/auth')

    useEffect(() => {
        // Once auth state is resolved and user is not logged in, redirect to /auth
        if (!isAuthPage && !loading && !user) {
            router.replace(`/auth?redirectTo=${encodeURIComponent(pathname || '/')}`)
        }
    }, [user, loading, isAuthPage, pathname, router])

    // On auth pages (/auth/*) always show without sidebar
    if (isAuthPage) {
        return <>{children}</>
    }

    // While loading auth state, show a clean spinner (prevents flash)
    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0 w-[280px] border-r border-slate-200 bg-white z-20">
                <Sidebar />
            </div>

            {/* Mobile Nav */}
            <MobileNav />

            {/* Main Content — overflow-hidden here so children can define their own scroll */}
            <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
                {children}
            </main>
        </div>
    )
}
