import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentManagerClient } from "./content-manager";

export default async function ContentManagementPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        redirect("/dashboard");
    }

    // Fetch all content grouped by section
    const contents = await prisma.siteContent.findMany({
        orderBy: { key: 'asc' }
    });

    const grouped = contents.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, typeof contents>);

    return (
        <div className="container mx-auto py-10 space-y-8 min-h-screen pb-32 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">จัดการเนื้อหาเว็บไซต์</h1>
                    <p className="text-muted-foreground">แก้ไขข้อความ ธีม และรูปภาพหน้าเว็บไซต์ (CMS)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" asChild className="shadow-sm">
                        <a href="/?preview=true" target="_blank" rel="noopener noreferrer">
                            👁️ ดูตัวอย่าง (Preview)
                        </a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="/dashboard">กลับหน้าหลัก</a>
                    </Button>
                </div>
            </div>

            <ContentManagerClient groupedContents={grouped} />
        </div>
    );
}
