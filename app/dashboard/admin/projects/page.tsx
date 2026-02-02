"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface Project {
    id: string;
    title: string;
    code: string;
    status: string;
    description: string;
    createdAt: string;
    owner: {
        name: string;
        email: string;
    };
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateStatus(id: string, status: string) {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                // Optimistic update
                setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
            }
        } catch (e) {
            alert("Update failed");
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredProjects = projects.filter(p => {
        if (filter === "ALL") return true;
        return p.status === filter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-500">อนุมัติ</Badge>;
            case 'REJECTED': return <Badge className="bg-red-500">ปฏิเสธ</Badge>;
            case 'REVIEW': return <Badge className="bg-yellow-500">กำลังตรวจ</Badge>;
            default: return <Badge variant="secondary">รอตรวจสอบ</Badge>;
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">ทั้่งหมด {projects.length} โครงการ</h2>
                    <p className="text-muted-foreground">จัดการและตรวจสอบสถานะโครงการวิจัย</p>
                </div>
                <div className="flex gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="สถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">ทั้งหมด</SelectItem>
                            <SelectItem value="PENDING">รอตรวจสอบ</SelectItem>
                            <SelectItem value="REVIEW">กำลังตรวจ</SelectItem>
                            <SelectItem value="APPROVED">อนุมัติแล้ว</SelectItem>
                            <SelectItem value="REJECTED">ปฏิเสธ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">รหัส</TableHead>
                            <TableHead>ชื่อโครงการ</TableHead>
                            <TableHead>ผู้เสนอ</TableHead>
                            <TableHead>วันที่ส่ง</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-mono text-xs">{project.code}</TableCell>
                                <TableCell className="font-medium">
                                    <div className="line-clamp-1" title={project.title}>{project.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">{project.description}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{project.owner.name || "Unknown"}</span>
                                        <span className="text-xs text-muted-foreground">{project.owner.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(project.createdAt).toLocaleDateString('th-TH')}</TableCell>
                                <TableCell>{getStatusBadge(project.status)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {updatingId === project.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(project.id, 'APPROVED')} title="อนุมัติ">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-yellow-600 border-yellow-200 hover:bg-yellow-50" onClick={() => updateStatus(project.id, 'REVIEW')} title="ส่งเข้าตรวจสอบ">
                                                    <Clock className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(project.id, 'REJECTED')} title="ปฏิเสธ">
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
