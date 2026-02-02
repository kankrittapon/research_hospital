import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash2 } from "lucide-react";

export default async function NewsDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
        return (
            <div className="container mx-auto p-10 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <Button asChild className="mt-4"><Link href="/dashboard">กลับ Dashboard</Link></Button>
            </div>
        )
    }

    const newsList = await prisma.news.findMany({
        orderBy: { updatedAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="container mx-auto max-w-6xl space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">จัดการข่าวสาร</h1>
                        <p className="text-slate-500">รายการข่าวสารทั้งหมด ({newsList.length} รายการ)</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">กลับ Dashboard</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard/news/create"><Plus className="mr-2 h-4 w-4" /> เพิ่มข่าวใหม่</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>รายการข่าวสาร</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">วันที่เผยแพร่</TableHead>
                                    <TableHead>หัวข้อข่าว</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {newsList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                            ยังไม่มีข่าวสาร
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    newsList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {new Date(item.publishDate).toLocaleDateString('th-TH')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.title}
                                            </TableCell>
                                            <TableCell>
                                                {item.published ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                        เผยแพร่แล้ว
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                        รอเผยแพร่
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/dashboard/news/edit/${item.id}`}>
                                                            <Edit className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
