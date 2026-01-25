"use client"

import React from 'react'
import { ModernFolderIcon, FolderColor } from '@/components/ui/modern-folder-icon'
import { Check } from 'lucide-react'

interface ColorPickerProps {
    selectedColor: FolderColor
    onColorSelect: (color: FolderColor) => void
}

const colors: { value: FolderColor; label: string }[] = [
    { value: 'blue', label: 'Bleu' },
    { value: 'red', label: 'Rouge' },
    { value: 'green', label: 'Vert' },
    { value: 'orange', label: 'Orange' },
    { value: 'purple', label: 'Violet' },
    { value: 'yellow', label: 'Jaune' },
    { value: 'pink', label: 'Rose' },
    { value: 'gray', label: 'Gris' }
]

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
    return (
        <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Choisir une couleur</h3>
            <div className="grid grid-cols-4 gap-3">
                {colors.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onColorSelect(value)}
                        className={`
              relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
              hover:bg-slate-50 hover:scale-105
              ${selectedColor === value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 bg-white'
                            }
            `}
                        title={label}
                    >
                        <ModernFolderIcon color={value} size="small" />
                        <span className="text-xs font-medium text-slate-600">{label}</span>
                        {selectedColor === value && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
