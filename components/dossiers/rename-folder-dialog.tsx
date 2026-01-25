"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RenameFolderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentName: string
    onRename: (newName: string) => Promise<void>
}

export function RenameFolderDialog({
    open,
    onOpenChange,
    currentName,
    onRename
}: RenameFolderDialogProps) {
    const [newName, setNewName] = useState(currentName)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRename = async () => {
        if (!newName.trim()) {
            setError("Le nom ne peut pas être vide")
            return
        }

        if (newName === currentName) {
            onOpenChange(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            await onRename(newName.trim())
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du renommage")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Renommer le dossier</DialogTitle>
                    <DialogDescription>
                        Entrez un nouveau nom pour ce dossier
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom du dossier</Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value)
                                setError(null)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename()
                                }
                            }}
                            placeholder="Nom du dossier"
                            className={error ? "border-red-500" : ""}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={handleRename}
                        disabled={isLoading}
                    >
                        {isLoading ? "Renommage..." : "Renommer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
