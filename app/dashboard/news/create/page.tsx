import { Button } from "@/components/ui/button";
import { NewsForm } from "@/components/news-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateNewsPage() {
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
                        <h1 className="text-2xl font-bold text-slate-800">เพิ่มข่าวสารใหม่</h1>
                        <p className="text-slate-500">กรอกข้อมูลข่าวสารเพื่อเผยแพร่ประชาสัมพันธ์</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <NewsForm />
                </div>
            </div>
        </div>
    );
}
