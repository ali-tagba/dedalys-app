"use client"

import React, { useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit2, Palette, Trash2 } from 'lucide-react'
import { ColorPicker } from './color-picker'
import { FolderColor } from '@/components/ui/modern-folder-icon'

interface FolderContextMenuProps {
    children: React.ReactNode
    onRename: () => void
    onColorChange: (color: FolderColor) => void
    onDelete?: () => void
    currentColor: FolderColor
}

export function FolderContextMenu({
    children,
    onRename,
    onColorChange,
    onDelete,
    currentColor
}: FolderContextMenuProps) {
    const [open, setOpen] = useState(false)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem onClick={onRename} className="cursor-pointer">
                    <Edit2 className="mr-2 h-4 w-4" />
                    <span>Renommer</span>
                </DropdownMenuItem>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Changer la couleur</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                        <ColorPicker
                            selectedColor={currentColor}
                            onColorSelect={(color) => {
                                onColorChange(color)
                                setOpen(false)
                            }}
                        />
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {onDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Supprimer</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
