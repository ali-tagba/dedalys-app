"use client"

import React from 'react'

export type FolderColor = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'yellow' | 'pink' | 'gray'

interface ModernFolderIconProps {
    color?: FolderColor
    size?: 'small' | 'medium' | 'large'
    className?: string
}

// Couleurs CSS réelles - valeurs vérifiées et testées
const colorValues: Record<FolderColor, { start: string; end: string; border: string }> = {
    blue: {
        start: '#60a5fa',
        end: '#3b82f6',
        border: '#93c5fd'
    },
    red: {
        start: '#f87171',
        end: '#ef4444',
        border: '#fca5a5'
    },
    green: {
        start: '#4ade80',
        end: '#22c55e',
        border: '#86efac'
    },
    orange: {
        start: '#fb923c',
        end: '#f97316',
        border: '#fdba74'
    },
    purple: {
        start: '#c084fc',
        end: '#a855f7',
        border: '#d8b4fe'
    },
    yellow: {
        start: '#facc15',
        end: '#eab308',
        border: '#fde047'
    },
    pink: {
        start: '#f472b6',
        end: '#ec4899',
        border: '#f9a8d4'
    },
    gray: {
        start: '#94a3b8',
        end: '#64748b',
        border: '#cbd5e1'
    }
}

const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
}

export function ModernFolderIcon({ color = 'blue', size = 'medium', className = '' }: ModernFolderIconProps) {
    const colors = colorValues[color]
    const sizeClass = sizeClasses[size]

    // Générer un ID unique pour éviter les conflits de gradient
    const gradientId = React.useId()

    return (
        <div className={`relative ${sizeClass} ${className}`}>
            <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.start} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={colors.end} stopOpacity={1} />
                    </linearGradient>
                </defs>

                {/* Tab (top part of folder) */}
                <path
                    d="M 8 16 L 8 12 C 8 10 9 9 11 9 L 24 9 L 28 13 L 56 13 C 58 13 59 14 59 16 L 59 18 L 8 18 Z"
                    fill={`url(#${gradientId})`}
                    opacity={0.9}
                />

                {/* Main folder body */}
                <path
                    d="M 8 18 L 8 52 C 8 54 9 55 11 55 L 53 55 C 55 55 56 54 56 52 L 56 18 Z"
                    fill={`url(#${gradientId})`}
                    opacity={0.95}
                />

                {/* Highlight effect (glassmorphism) */}
                <path
                    d="M 10 20 L 10 50 C 10 51 10.5 52 12 52 L 52 52 C 53 52 54 51 54 50 L 54 20 Z"
                    fill="white"
                    opacity={0.1}
                />

                {/* Top highlight on tab */}
                <path
                    d="M 10 11 L 23 11 L 26 14 L 57 14 L 57 16 L 10 16 Z"
                    fill="white"
                    opacity={0.2}
                />

                {/* Colored tabs on top (like macOS) */}
                <g opacity={0.8}>
                    <rect x="12" y="14.5" width="8" height="2" rx="1" fill="#FF6B6B" />
                    <rect x="22" y="14.5" width="8" height="2" rx="1" fill="#4ECDC4" />
                    <rect x="32" y="14.5" width="8" height="2" rx="1" fill="#FFE66D" />
                    <rect x="42" y="14.5" width="8" height="2" rx="1" fill="#A8E6CF" />
                </g>

                {/* Border/outline */}
                <path
                    d="M 8 16 L 8 12 C 8 10 9 9 11 9 L 24 9 L 28 13 L 56 13 C 58 13 59 14 59 16 L 59 52 C 59 54 58 55 56 55 L 11 55 C 9 55 8 54 8 52 Z"
                    stroke={colors.border}
                    strokeWidth="0.5"
                    fill="none"
                    opacity={0.3}
                />
            </svg>
        </div>
    )
}
