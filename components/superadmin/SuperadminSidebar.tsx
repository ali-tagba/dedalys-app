"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    ShieldCheck,
    UsersRound,
    Settings,
    LogOut,
    DatabaseBackup
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navigation = [
    { name: "Tableau de Bord", href: "/superadmin", icon: ShieldCheck },
    { name: "Cabinets (Espaces)", href: "/superadmin/espaces", icon: UsersRound },
    { name: "Sauvegardes", href: "/superadmin/backups", icon: DatabaseBackup },
    { name: "Paramètres API", href: "/superadmin/parametres", icon: Settings },
]

export function SuperadminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, signOut } = useAuth()

    const userEmail = user?.email || "Superadmin"
    const userInitials = userEmail.substring(0, 2).toUpperCase()

    const handleLogout = async () => {
        await signOut()
        router.replace('/auth')
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <ShieldCheck className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Dedalys</h1>
                        <p className="text-xs text-indigo-400 font-medium tracking-wide">SUPERADMIN</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-indigo-600/20 text-indigo-400 shadow-sm ring-1 ring-indigo-500/30"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{userEmail}</p>
                        <p className="text-xs text-slate-400 truncate">
                            {user ? "Connecté" : "Non connecté"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
                >
                    <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
                    Se déconnecter
                </button>
            </div>
        </div>
    )
}
