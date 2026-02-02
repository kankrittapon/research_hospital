"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    imageUrl: z.string().optional(),
    published: z.boolean(),
    publishDate: z.date(),
})

interface NewsFormProps {
    initialData?: {
        id: string;
        title: string;
        content: string;
        imageUrl?: string | null;
        published: boolean;
        publishDate: Date | string;
    };
    isEditing?: boolean;
}

export function NewsForm({ initialData, isEditing = false }: NewsFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            content: initialData?.content || "",
            imageUrl: initialData?.imageUrl || "",
            published: initialData?.published ?? true,
            publishDate: initialData?.publishDate ? new Date(initialData.publishDate) : new Date(),
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const url = isEditing && initialData 
                ? `/api/news/${initialData.id}` 
                : "/api/news"
            
            const method = isEditing ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Failed to save news")
            }

            router.push("/dashboard/news")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Error saving news. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
                
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>หัวข้อข่าว (Title)</FormLabel>
                            <FormControl>
                                <Input placeholder="ใส่หัวข้อข่าวที่น่าสนใจ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ลิงก์รูปภาพ (Image URL)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>ใส่ URL ของรูปภาพสำหรับแสดงผล (ถ้ามี)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>เนื้อหาข่าว (Content)</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="รายละเอียดข่าว..." 
                                    className="min-h-[200px]"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-6">
                    <FormField
                        control={form.control}
                        name="publishDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>วันที่เผยแพร่</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] pl-3 text-left font-normal",
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
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        เผยแพร่ทันที
                                    </FormLabel>
                                    <FormDescription>
                                        หากไม่เลือก ข่าวจะถูกซ่อนไว้ (Draft)
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "บันทึกการแก้ไข" : "สร้างข่าวใหม่"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
