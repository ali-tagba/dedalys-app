"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

type AuthMode = "login" | "signup" | "forgot"

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { signIn, signOut, resetPassword, user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            const redirectTo = searchParams?.get('redirectTo') || '/'
            router.replace(redirectTo)
        }
    }, [user, authLoading, router, searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        const { error } = await signIn(email, password, false)
        if (error) {
            if (error.message === "Invalid login credentials") {
                setError("Email ou mot de passe incorrect.")
            } else if (error.message === "Email not confirmed") {
                setError("Veuillez confirmer votre adresse email avant de vous connecter.")
            } else {
                setError(error.message || "Une erreur est survenue. Veuillez réessayer.")
            }
            setLoading(false)
        } else {
            const redirectTo = searchParams?.get('redirectTo') || '/'
            router.replace(redirectTo)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.")
            return
        }
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({ email, password })
        setLoading(false)
        if (error) {
            setError(error.message === "User already registered"
                ? "Un compte avec cet email existe déjà. Essayez de vous connecter."
                : "Erreur lors de la création du compte: " + error.message)
        } else if (data.session) {
            // Auto-confirmed (e.g. email confirmation disabled in Supabase) → redirect
            const redirectTo = searchParams?.get('redirectTo') || '/'
            router.replace(redirectTo)
        } else {
            setSuccess("Compte créé ! Vérifiez votre boîte email pour confirmer votre inscription.")
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        const { error } = await resetPassword(email)
        setLoading(false)
        if (error) {
            setError("Erreur lors de l'envoi de l'email. Vérifiez l'adresse saisie.")
        } else {
            setSuccess("Un email de réinitialisation a été envoyé à " + email)
        }
    }

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode)
        setError("")
        setSuccess("")
        setPassword("")
        setConfirmPassword("")
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (user) return null

    return (
        <div className="min-h-screen flex bg-white overflow-hidden">
            {/* ─── Left Panel — Branding ─── */}
            <div className="hidden lg:flex flex-col justify-between w-[52%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-900 p-12 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-24 translate-y-24" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
                        <span className="text-blue-700 font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>D</span>
                    </div>
                    <span className="text-white font-semibold text-xl tracking-wide">Dedalys</span>
                </div>

                {/* Central headline */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-light text-white leading-tight">
                            La gestion<br />
                            <span className="font-semibold">juridique</span><br />
                            réinventée.
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
                            Solution complète pour cabinets d'avocats et directions juridiques en Afrique francophone.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {["Gestion des dossiers", "CRM Clients", "Suivi des audiences", "Facturation"].map((f) => (
                            <div key={f} className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white text-sm border border-white/20">{f}</div>
                        ))}
                    </div>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 space-y-3">
                    <p className="text-white/90 text-sm leading-relaxed italic">
                        "Dedalys nous a permis de centraliser toute notre gestion et d'améliorer notre suivi client considérablement."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">KD</div>
                        <div>
                            <p className="text-white text-sm font-medium">Maître K. Diallo</p>
                            <p className="text-blue-200 text-xs">Cabinet Diallo & Associés, Abidjan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right Panel — Auth Form ─── */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16 py-12">
                {/* Mobile logo */}
                <div className="lg:hidden mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">D</span>
                    </div>
                    <span className="text-slate-900 font-semibold text-lg">Dedalys</span>
                </div>

                <div className="w-full max-w-sm">
                    {mode === "forgot" ? (
                        /* ── Forgot Password ── */
                        <div className="space-y-8">
                            <div>
                                <button onClick={() => switchMode("login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                    Retour à la connexion
                                </button>
                                <h2 className="text-2xl font-semibold text-slate-900">Mot de passe oublié</h2>
                                <p className="text-slate-500 text-sm mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                            </div>
                            {success ? (
                                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-4 rounded-xl flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">check_circle</span>
                                    <div><p className="font-semibold">Email envoyé !</p><p className="text-green-600 mt-0.5">{success}</p></div>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-5">
                                    {error && <ErrorBanner msg={error} />}
                                    <EmailField value={email} onChange={setEmail} />
                                    <SubmitButton loading={loading} label="Envoyer le lien" icon="send" />
                                </form>
                            )}
                        </div>
                    ) : (
                        /* ── Login / Signup ── */
                        <div className="space-y-8">
                            {/* Tab switcher */}
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                                    {mode === "login" ? "Bon retour 👋" : "Créer un compte 🚀"}
                                </h2>
                                <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 gap-1">
                                    <button
                                        id="tab-login"
                                        onClick={() => switchMode("login")}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === "login" ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Se connecter
                                    </button>
                                    <button
                                        id="tab-signup"
                                        onClick={() => switchMode("signup")}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === "signup" ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        S'inscrire
                                    </button>
                                </div>
                            </div>

                            {success ? (
                                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-4 rounded-xl flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">check_circle</span>
                                    <div><p className="font-semibold">Inscription réussie !</p><p className="text-green-600 mt-1">{success}</p></div>
                                </div>
                            ) : (
                                <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-5">
                                    {error && <ErrorBanner msg={error} />}

                                    <EmailField value={email} onChange={setEmail} />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                                            {mode === "login" && (
                                                <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                                    Oublié ?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={mode === "signup" ? "Min. 8 caractères" : "••••••••"}
                                                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {mode === "signup" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock_check</span>
                                                <input
                                                    id="confirm-password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirmez votre mot de passe"
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <SubmitButton
                                        loading={loading}
                                        label={mode === "login" ? "Se connecter" : "Créer mon compte"}
                                        icon={mode === "login" ? "login" : "person_add"}
                                    />
                                </form>
                            )}
                        </div>
                    )}
                </div>

                <p className="mt-auto pt-8 text-xs text-slate-400 text-center">
                    © {new Date().getFullYear()} Dedalys — Tous droits réservés
                </p>
            </div>
        </div>
    )
}

// ─── Small reusable sub-components ───
function ErrorBanner({ msg }: { msg: string }) {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
            {msg}
        </div>
    )
}

function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Adresse email</label>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                <input
                    id="email"
                    type="email"
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
            </div>
        </div>
    )
}

function SubmitButton({ loading, label, icon }: { loading: boolean; label: string; icon: string }) {
    return (
        <button
            id="auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200"
        >
            {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Chargement...</>
            ) : (
                <><span className="material-symbols-outlined text-[18px]">{icon}</span>{label}</>
            )}
        </button>
    )
}
