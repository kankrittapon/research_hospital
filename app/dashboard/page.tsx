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
import { FileText, Trash2, ExternalLink, Plus } from "lucide-react";
import { DeleteButton } from "@/components/delete-button"; // client component for delete action

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Only Admin and Editor can access
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
        return (
            <div className="container mx-auto p-10 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-muted-foreground mt-2">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <Button asChild className="mt-4"><Link href="/">กลับหน้าแรก</Link></Button>
            </div>
        )
    }

    const researches = await prisma.research.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="container mx-auto max-w-6xl space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-500">จัดการข้อมูลงานวิจัยทั้งหมด ({researches.length} รายการ)</p>
                    </div>
                    <div className="flex gap-3">
                        {session.user.role === 'ADMIN' && (
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                                <Link href="/dashboard/content">จัดการหน้าเว็บ</Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/">กลับหน้าแรก</Link>
                        </Button>
                        <Button asChild className="shadow-md">
                            <Link href="/upload"><Plus className="mr-2 h-4 w-4" /> เพิ่มงานวิจัยใหม่</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>รายการงานวิจัย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">วันที่</TableHead>
                                    <TableHead>ชื่องานวิจัย</TableHead>
                                    <TableHead>ปี/เดือน</TableHead>
                                    <TableHead className="text-right">ไฟล์</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {researches.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            ยังไม่มีข้อมูลงานวิจัย
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    researches.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {new Date(item.publicationDate).toLocaleDateString('th-TH')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{item.abstract}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {item.year}/{item.month}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={item.filePath} target="_blank" rel="noopener noreferrer">
                                                        <FileText className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeleteButton id={item.id} />
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
