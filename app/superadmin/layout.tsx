"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar"
import { Menu } from "lucide-react"
import { useState } from "react"

import { supabase } from "@/lib/supabase"
import { api } from "@/lib/api"

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isSuperadmin, setIsSuperadmin] = useState<boolean | null>(null)

    const isLoginPage = pathname === "/superadmin/login"

    useEffect(() => {
        if (!loading && user) {
            // Check superadmin status dynamically via Backend API (bypasses RLS issues)
            api.get('https://dedalys-civ-dedalys-api.hf.space/api/v1/utilisateurs/me')
                .then((res) => {
                    const status = res.data?.is_superadmin === true;
                    setIsSuperadmin(status);

                    if (isLoginPage && status) {
                        router.replace("/superadmin")
                    } else if (!isLoginPage && !status) {
                        router.replace("/") // Reject normal users
                    }
                })
                .catch(() => {
                    setIsSuperadmin(false)
                    if (!isLoginPage) {
                        router.replace("/")
                    }
                })
        } else if (!loading && !user) {
            setIsSuperadmin(false)
            if (!isLoginPage) {
                router.replace("/superadmin/login")
            }
        }
    }, [user, loading, router, isLoginPage])

    // Wait until verification is complete
    if (loading || isSuperadmin === null || (!user && !isLoginPage)) {
         return (
             <div className="min-h-screen flex items-center justify-center bg-slate-900">
                 <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600" />
             </div>
         )
    }

    // For the login page, render without sidebar
    if (isLoginPage) {
        return <div className="min-h-screen bg-slate-900">{children}</div>
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
            {/* Sidebar Desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0 w-[280px] z-20">
                <SuperadminSidebar />
            </div>

            {/* Mobile Nav Topbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="text-white font-bold tracking-tight">Superadmin</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute top-0 left-0 bottom-0 w-[280px]" onClick={e => e.stopPropagation()}>
                        <SuperadminSidebar />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0 h-full overflow-y-auto lg:pt-0 pt-16 flex flex-col bg-slate-100/50">
                {children}
            </main>
        </div>
    )
}
