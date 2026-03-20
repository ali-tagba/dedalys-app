"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

export default function SuperadminLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { signIn, signOut } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: signInError } = await signIn(email, password, true)
            if (signInError) {
                setError(signInError.message || "Identifiants incorrects.")
                setIsLoading(false)
                return
            }

            // Success, push back to dashboard
            router.push('/superadmin')
            return
        } catch (err) {
            setError("Une erreur inattendue est survenue.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6 border-4 border-slate-900 ring-2 ring-indigo-500/50">
                        <ShieldCheck className="h-8 w-8 text-white relative bottom-0.5" />
                    </div>
                    
                    <span className="mb-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest">
                        Accès Strictement Réservé
                    </span>
                    
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Backoffice Dedalys</h2>
                    <p className="text-slate-400 text-center text-sm px-4">
                        Cette zone est exclusive aux superadministrateurs de la plateforme. Toute autre tentative de connexion sera rejetée.
                    </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-900/50 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300" htmlFor="email">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="supersuperadmin@admin.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300" htmlFor="password">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <a href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        Retour à l'application principale
                    </a>
                </div>
            </div>
        </div>
    )
}
