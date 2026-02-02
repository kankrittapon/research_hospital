import { Button } from "@/components/ui/button";
import { NewsForm } from "@/components/news-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

interface EditNewsPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
    const { id } = await params;
    
    const newsItem = await prisma.news.findUnique({
        where: { id },
    });

    if (!newsItem) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="container mx-auto max-w-3xl space-y-6">
                
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/news">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">แก้ไขข่าวสาร</h1>
                        <p className="text-slate-500">ปรับปรุงข้อมูลข่าว: {newsItem.title}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <NewsForm initialData={newsItem} isEditing={true} />
                </div>
            </div>
        </div>
    );
}
