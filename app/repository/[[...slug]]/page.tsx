import prisma from "@/lib/db";
import Link from "next/link";
import { Folder, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function RepositoryPage(
    props: {
        params: Promise<{ slug?: string[] }>
    }
) {
    const params = await props.params;
    const slug = params.slug || [];
    const depth = slug.length;

    // Breadcrumbs Logic
    const breadcrumbs = [
        { label: "หน้าแรก", href: "/" },
        { label: "คลังงานวิจัย", href: "/repository" },
        ...slug.map((item, index) => {
            const href = `/repository/${slug.slice(0, index + 1).join("/")}`;
            return { label: item, href };
        })
    ];

    let content;
    let title;
    let items = [];
    let isTable = false;

    // --- LEVEL 0: ROOT (YEARS) ---
    if (depth === 0) {
        title = "ปีของงานวิจัย (พ.ศ.)";
        // Get distinct years
        const years = await prisma.research.findMany({
            select: { year: true },
            distinct: ['year'],
            orderBy: { year: 'desc' },
        });

        items = years.map(y => ({
            yearLabel: (y.year + 543).toString(), // Convert to Thai Year
            yearValue: y.year.toString(),
            href: `/repository/${y.year}`,
            type: 'folder'
        }));
    }
    // --- LEVEL 1: YEAR (FILES LIST) ---
    else if (depth === 1) {
        const year = parseInt(slug[0]);
        if (isNaN(year)) return notFound();

        title = `งานวิจัยปี พ.ศ. ${year + 543}`;
        isTable = true;

        // Fetch all researches for this year
        items = await prisma.research.findMany({
            where: { year: year },
            orderBy: { publicationDate: 'desc' }
        });

    } else {
        return notFound(); // Only support 2 levels now
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-8 font-sans">
            <div className="container mx-auto max-w-6xl">
                {/* Header & Breadcrumbs */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={crumb.href} className="flex items-center gap-2">
                                {idx > 0 && <ChevronRight className="h-4 w-4" />}
                                <Link
                                    href={crumb.href}
                                    className={`hover:text-blue-600 transition-colors ${idx === breadcrumbs.length - 1 ? "font-semibold text-slate-900" : ""}`}
                                >
                                    {crumb.label}
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
                        <Button variant="outline" asChild>
                            <Link href="/">กลับหน้าแรก</Link>
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {items.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground bg-white rounded-xl border border-dashed">
                        ไม่พบข้อมูล
                    </div>
                ) : (
                    <>
                        {!isTable ? (
                            /* Folder View (Years) */
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {items.map((item: any, idx: number) => (
                                    <Link key={idx} href={item.href}>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col items-center gap-3 text-center">
                                            <div className="p-4 rounded-full bg-amber-50 text-amber-500">
                                                <Folder className="h-10 w-10" />
                                            </div>
                                            <span className="font-bold text-lg text-slate-700">{item.yearLabel}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* Table View (Files) */
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
                                            <TableHead className="w-[40%]">ชื่อบทความ</TableHead>
                                            <TableHead className="w-[30%]">ชื่อ-นามสกุล</TableHead>
                                            <TableHead className="text-center">วัน/เดือน/ปี (พ.ศ.)</TableHead>
                                            <TableHead className="text-right">ดาวน์โหลด</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item: any, idx: number) => {
                                            const date = new Date(item.publicationDate);
                                            const thaiDate = date.toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            });

                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                                >
                                                    <TableCell className="text-center font-medium text-slate-500">
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <a href={item.filePath} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 hover:text-blue-600 block">
                                                            {item.title}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {item.author || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center text-slate-600">
                                                        {thaiDate}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                                                            <a href={item.filePath} target="_blank" rel="noopener noreferrer">
                                                                <FileText className="h-4 w-4 mr-2" /> เปิดไฟล์
                                                            </a>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
