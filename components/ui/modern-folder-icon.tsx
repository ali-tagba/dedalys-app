"use client"

import React from 'react'

export type FolderColor = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'yellow' | 'pink' | 'gray'

interface ModernFolderIconProps {
    color?: FolderColor
    size?: 'small' | 'medium' | 'large'
    className?: string
}

const colorStyles: Record<FolderColor, { gradient: string; border: string; shadow: string }> = {
    blue: {
        gradient: 'from-blue-400 to-blue-500',
        border: 'border-blue-300',
        shadow: 'shadow-blue-200/50'
    },
    red: {
        gradient: 'from-red-400 to-red-500',
        border: 'border-red-300',
        shadow: 'shadow-red-200/50'
    },
    green: {
        gradient: 'from-green-400 to-green-500',
        border: 'border-green-300',
        shadow: 'shadow-green-200/50'
    },
    orange: {
        gradient: 'from-orange-400 to-orange-500',
        border: 'border-orange-300',
        shadow: 'shadow-orange-200/50'
    },
    purple: {
        gradient: 'from-purple-400 to-purple-500',
        border: 'border-purple-300',
        shadow: 'shadow-purple-200/50'
    },
    yellow: {
        gradient: 'from-yellow-400 to-yellow-500',
        border: 'border-yellow-300',
        shadow: 'shadow-yellow-200/50'
    },
    pink: {
        gradient: 'from-pink-400 to-pink-500',
        border: 'border-pink-300',
        shadow: 'shadow-pink-200/50'
    },
    gray: {
        gradient: 'from-slate-400 to-slate-500',
        border: 'border-slate-300',
        shadow: 'shadow-slate-200/50'
    }
}

const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
}

export function ModernFolderIcon({ color = 'blue', size = 'medium', className = '' }: ModernFolderIconProps) {
    const styles = colorStyles[color]
    const sizeClass = sizeClasses[size]

    return (
        <div className={`relative ${sizeClass} ${className}`}>
            {/* Folder SVG with modern gradient */}
            <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                <defs>
                    <linearGradient id={`folder-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" className={`${styles.gradient.split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" stopOpacity="0.9" />
                        <stop offset="100%" className={`${styles.gradient.split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
                    </linearGradient>

                    {/* Glassmorphism effect */}
                    <filter id={`glass-${color}`}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                        <feComponentTransfer>
                            <feFuncA type="discrete" tableValues="0.8" />
                        </feComponentTransfer>
                    </filter>
                </defs>

                {/* Tab (top part of folder) */}
                <path
                    d="M 8 16 L 8 12 C 8 10 9 9 11 9 L 24 9 L 28 13 L 56 13 C 58 13 59 14 59 16 L 59 18 L 8 18 Z"
                    fill={`url(#folder-gradient-${color})`}
                    className="opacity-90"
                />

                {/* Main folder body */}
                <path
                    d="M 8 18 L 8 52 C 8 54 9 55 11 55 L 53 55 C 55 55 56 54 56 52 L 56 18 Z"
                    fill={`url(#folder-gradient-${color})`}
                    className="opacity-95"
                />

                {/* Highlight effect (glassmorphism) */}
                <path
                    d="M 10 20 L 10 50 C 10 51 10.5 52 12 52 L 52 52 C 53 52 54 51 54 50 L 54 20 Z"
                    fill="white"
                    className="opacity-10"
                />

                {/* Top highlight on tab */}
                <path
                    d="M 10 11 L 23 11 L 26 14 L 57 14 L 57 16 L 10 16 Z"
                    fill="white"
                    className="opacity-20"
                />

                {/* Colored tabs on top (like macOS) */}
                <g className="opacity-80">
                    <rect x="12" y="14.5" width="8" height="2" rx="1" fill="#FF6B6B" />
                    <rect x="22" y="14.5" width="8" height="2" rx="1" fill="#4ECDC4" />
                    <rect x="32" y="14.5" width="8" height="2" rx="1" fill="#FFE66D" />
                    <rect x="42" y="14.5" width="8" height="2" rx="1" fill="#A8E6CF" />
                </g>

                {/* Border/outline */}
                <path
                    d="M 8 16 L 8 12 C 8 10 9 9 11 9 L 24 9 L 28 13 L 56 13 C 58 13 59 14 59 16 L 59 52 C 59 54 58 55 56 55 L 11 55 C 9 55 8 54 8 52 Z"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                    className={`${styles.border.replace('border-', 'text-')} opacity-30`}
                />
            </svg>
        </div>
    )
}
