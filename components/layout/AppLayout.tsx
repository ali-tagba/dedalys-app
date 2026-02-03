import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            {/* Sidebar - Fixed width, strictly anchored */}
            <div className="hidden lg:block w-[280px] flex-shrink-0 border-r border-slate-200 bg-white z-20">
                <Sidebar />
            </div>

            {/* Mobile Nav - visible only on small screens */}
            <MobileNav />

            {/* Main Content - Flex grow, rigid container for pages */}
            <main className="flex-1 h-full min-h-0 w-full relative">
                {children}
            </main>
        </div>
    )
}
