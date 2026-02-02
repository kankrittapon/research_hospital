"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    title: string;
    code: string;
    status: 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED';
    description: string;
    createdAt: string;
}

export default function MyProjectsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    // Form
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify({ title, description: desc }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setOpen(false);
                setTitle("");
                setDesc("");
                fetchProjects(); // Refresh
            } else {
                alert("Failed to create project");
            }
        } catch (e) {
            alert("Error submitting project");
        } finally {
            setIsSubmitting(false);
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1"/>อนุมัติแล้ว</Badge>;
            case 'REJECTED': return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1"/>ถูกปฏิเสธ</Badge>;
            case 'REVIEW': return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1"/>กำลังตรวจสอบ</Badge>;
            default: return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1"/>รอการตรวจสอบ</Badge>;
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">โครงการวิจัยของฉัน</h1>
                    <p className="text-slate-500">ติดตามสถานะและประวัติการส่งโครงการ</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> ยื่นขออนุมัติโครงการใหม่</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>ยื่นขออนุมัติโครงการวิจัย</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>ชื่อโครงการ (TH/EN)</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="เช่น การศึกษาประสิทธิภาพของ..." />
                            </div>
                            <div className="space-y-2">
                                <Label>รายละเอียดสังเขป</Label>
                                <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="อธิบายวัตถุประสงค์และขอบเขตโดยย่อ..." rows={5} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                ยื่นเสนอโครงการ
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {projects.length === 0 ? (
                <Card className="text-center py-12 bg-slate-50 border-dashed">
                    <CardContent>
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">ยังไม่มีโครงการ</h3>
                        <p className="text-slate-500 mb-4">เริ่มต้นด้วยการยื่นเสนอโครงการใหม่</p>
                        <Button variant="outline" onClick={() => setOpen(true)}>สร้างโครงการแรก</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {projects.map(project => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div>
                                    <div className="text-sm text-slate-500 mb-1">{project.code}</div>
                                    <CardTitle className="text-xl font-bold text-blue-900 line-clamp-1">{project.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
                                </div>
                                {getStatusBadge(project.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-slate-400 mt-4 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> ยื่นเมื่อ {new Date(project.createdAt).toLocaleDateString('th-TH')}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
