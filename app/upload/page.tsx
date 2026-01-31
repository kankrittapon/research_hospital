"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
// Note: We need to create a toast component or install sonner later. For now using window.alert or console

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    author: z.string().optional(),
    abstract: z.string().optional(),
    date: z.date({
        required_error: "A publication date is required.",
    }),
    files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
})

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            author: "",
            abstract: "",
            files: []
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("title", values.title)
            formData.append("author", values.author || "")
            formData.append("abstract", values.abstract || "")
            formData.append("date", values.date.toISOString())
            formData.append("file", values.files[0]) // Only 1 file for now

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to upload")
            }

            alert("Research uploaded successfully!")
            form.reset()
            // Redirect to dashboard
            window.location.href = "/dashboard"
        } catch (error) {
            console.error(error)
            alert("Error uploading research. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Upload Research</h1>
                    <p className="text-muted-foreground">Add new research paper or presentation to the archive.</p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/">Home</Link>
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ชื่องานวิจัย (Title)</FormLabel>
                                <FormControl>
                                    <Input placeholder="กรอกชื่องานวิจัย..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ชื่อผู้วิจัย (Author)</FormLabel>
                                <FormControl>
                                    <Input placeholder="ระบุชื่อ-นามสกุล..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="abstract"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Abstract / Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Brief summary of the research..."
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Publication Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Can add Category dropdown here later */}
                    </div>

                    <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload File</FormLabel>
                                <FormControl>
                                    <FileUpload
                                        onFilesChange={field.onChange}
                                        maxFiles={1}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Supported formats: PDF, PPTX, PPT. Max size: 50MB.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => form.reset()}>
                            Reset
                        </Button>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? "Uploading..." : "Submit Research"}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    )
}
