"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'
import { UploadCloud, File, FileText, X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface FileUploadProps {
    onFilesChange: (files: File[]) => void
    maxFiles?: number
    accept?: Record<string, string[]>
    className?: string
}

export function FileUpload({ onFilesChange, maxFiles = 1, accept, className }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // If not multiple, replace files
        const newFiles = maxFiles === 1 ? acceptedFiles : [...files, ...acceptedFiles]

        if (newFiles.length > maxFiles) {
            // Handle max files logic if needed, simplifed for now
            const sliced = newFiles.slice(0, maxFiles);
            setFiles(sliced)
            onFilesChange(sliced)
        } else {
            setFiles(newFiles)
            onFilesChange(newFiles)
        }
    }, [files, maxFiles, onFilesChange])

    const removeFile = (fileToRemove: File) => {
        const updatedFiles = files.filter(file => file !== fileToRemove)
        setFiles(updatedFiles)
        onFilesChange(updatedFiles)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        accept: accept || {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/vnd.ms-powerpoint': ['.ppt']
        }
    })

    return (
        <div className={cn("w-full space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                )}
            >
                <input {...getInputProps()} />
                <div className="bg-muted p-4 rounded-full mb-4">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                    {isDragActive ? "Drop files here" : "Click to upload or drag and drop"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    PDF, PPTX or PPT (Max 50MB)
                </p>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                            <div className="flex items-center space-x-3">
                                <div className="bg-primary/10 p-2 rounded-md">
                                    {file.type.includes('pdf') ? (
                                        <FileText className="h-5 w-5 text-primary" />
                                    ) : (
                                        <File className="h-5 w-5 text-orange-500" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(file)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
