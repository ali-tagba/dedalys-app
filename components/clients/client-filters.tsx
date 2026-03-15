"use client"

// Imports removed

interface ClientFiltersProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    typeFilter: "ALL" | "PERSONNE_MORALE" | "PERSONNE_PHYSIQUE"
    setTypeFilter: (type: "ALL" | "PERSONNE_MORALE" | "PERSONNE_PHYSIQUE") => void
}

export function ClientFilters({
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
}: ClientFiltersProps) {
    return (
        <div className="h-12 px-8 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            {/* Segmented Control */}
            <div className="flex h-full">
                {[
                    { label: "Tous", value: "ALL" },
                    { label: "Entreprises", value: "PERSONNE_MORALE" },
                    { label: "Particuliers", value: "PERSONNE_PHYSIQUE" }
                ].map((filter) => {
                    const isActive = typeFilter === filter.value;
                    return (
                        <button
                            key={filter.value}
                            onClick={() => setTypeFilter(filter.value as any)}
                            className={`
                                h-full px-1 mr-6 text-sm font-medium border-b-2 transition-colors focus:outline-none
                                ${isActive
                                    ? "border-slate-900 text-slate-900"
                                    : "border-transparent text-slate-500 hover:text-slate-900"}
                            `}
                        >
                            {filter.label}
                        </button>
                    )
                })}
            </div>

            {/* Search */}
            <div className="relative group w-64">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[18px] group-focus-within:text-blue-600 transition-colors">
                    search
                </span>
                <input
                    type="text"
                    placeholder="Rechercher (Cmd+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 text-sm bg-transparent border-none focus:ring-0 placeholder-slate-400 text-slate-900 font-sans focus:outline-none"
                />
            </div>
        </div>
    )
}
