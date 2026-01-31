import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { revalidatePath } from "next/cache";
import { FileText, Phone, MapPin, BookOpen, User, Home, Info, Mail, Layout, Image as ImageIcon, Search, Database, Activity, Trophy, Users, Calendar, Download, CloudLightning } from "lucide-react";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function updateContent(formData: FormData) {
    "use server";

    // Check auth again
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return;

    const entries = Array.from(formData.entries());

    // 1. Handle File Uploads first
    const fileKeys = entries.filter(([key]) => key.startsWith("file_icon_"));
    const uploadedIcons: Record<string, string> = {};

    for (const [key, value] of fileKeys) {
        if (value instanceof File && value.size > 0) {
            const realKey = key.replace("file_icon_", "");

            // Ensure directory exists
            const uploadDir = path.join(process.cwd(), "public/icons");
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {
                // Ignore error if exists
            }

            // Save file
            const ext = path.extname(value.name);
            const filename = `${realKey}-${Date.now()}${ext}`;
            const filePath = path.join(uploadDir, filename);
            const buffer = Buffer.from(await value.arrayBuffer());

            await writeFile(filePath, buffer);
            uploadedIcons[realKey] = `/icons/${filename}`;
        }
    }

    // 2. Update Text Fields / Selects
    for (const [key, value] of entries) {
        // Skip file inputs
        if (key.startsWith("file_icon_")) continue;

        if (key.startsWith("content_") && typeof value === 'string') {
            const realKey = key.replace("content_", "");
            let valueToSave = value;

            // If this key has a newly uploaded icon, use that instead of the Select value
            if (uploadedIcons[realKey]) {
                valueToSave = uploadedIcons[realKey];
            }

            await prisma.siteContent.update({
                where: { key: realKey },
                data: { value: valueToSave }
            });
        }
    }

    revalidatePath("/");
    revalidatePath("/dashboard/content");
}

// Icon Mapping for filtering/display
const AVAILABLE_ICONS = [
    { value: 'FileText', label: 'FileText (เอกสาร/โครงการ)' },
    { value: 'Phone', label: 'Phone (โทรศัพท์/ติดต่อ)' },
    { value: 'MapPin', label: 'MapPin (หมุดแผนที่/ติดตาม)' },
    { value: 'BookOpen', label: 'BookOpen (หนังสือ/คลัง)' },
    { value: 'Search', label: 'Search (ค้นหา)' },
    { value: 'Database', label: 'Database (ฐานข้อมูล)' },
    { value: 'Activity', label: 'Activity (กิจกรรม/กราฟ)' },
    { value: 'Trophy', label: 'Trophy (รางวัล)' },
    { value: 'Users', label: 'Users (ผู้คน/ทีม)' },
    { value: 'Calendar', label: 'Calendar (ปฏิทิน)' },
    { value: 'Download', label: 'Download (ดาวน์โหลด)' },
    { value: 'CloudLightning', label: 'Cloud (ระบบ)' },
    { value: 'User', label: 'User (ผู้ใช้งาน)' },
    { value: 'Home', label: 'Home (บ้าน/หน้าหลัก)' },
    { value: 'Info', label: 'Info (ข้อมูล)' },
    { value: 'Mail', label: 'Mail (อีเมล)' },
    { value: 'Layout', label: 'Layout (เลย์เอาต์)' },
];

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

    // Define Tab Order
    const tabs = [
        { id: 'THEME', label: 'ธีม & แบนเนอร์', icon: Layout },
        { id: 'HOME_HERO', label: 'หน้าแรก', icon: Home },
        { id: 'SERVICES', label: 'บริการ', icon: FileText },
        { id: 'ABOUT', label: 'เกี่ยวกับเรา', icon: Info },
        { id: 'CONTACT', label: 'ติดต่อเรา', icon: Phone },
    ];

    // Separate Images and Theme for the first tab
    const themeItems = grouped['THEME'] || [];
    const bannerItems = grouped['IMAGES'] || [];
    const firstTabItems = [...themeItems, ...bannerItems];

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

            <form action={updateContent}>
                <Tabs defaultValue="SERVICES" className="w-full space-y-6">
                    <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur py-2 border-b">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-slate-200">
                            {tabs.map(tab => (
                                <TabsTrigger key={tab.id} value={tab.id} className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                                    <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* TAB 1: THEME & BANNER */}
                    <TabsContent value="THEME" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-blue-500" /> การตกแต่งเว็บไซต์</CardTitle>
                                <CardDescription>ตั้งค่าสีและรูปภาพหลักของเว็บไซต์</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {firstTabItems.map((item) => (
                                    <div key={item.id} className="grid w-full gap-2 p-4 rounded-lg border bg-slate-50/50">
                                        <Label htmlFor={item.key} className="text-base font-semibold text-slate-700">{item.label}</Label>
                                        {item.type === 'color' ? (
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Input
                                                        type="color"
                                                        id={`content_${item.key}`}
                                                        name={`content_${item.key}`}
                                                        defaultValue={item.value}
                                                        className="w-24 h-12 p-1 cursor-pointer rounded-lg border-2 border-slate-200"
                                                    />
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    Code: <span className="font-mono bg-white px-2 py-1 rounded border">{item.value}</span>
                                                </div>
                                            </div>
                                        ) : item.type === 'image' ? (
                                            <div className="space-y-3">
                                                <Input
                                                    id={`content_${item.key}`}
                                                    name={`content_${item.key}`}
                                                    defaultValue={item.value}
                                                    placeholder="วาง URL ของรูปภาพที่นี่ (https://...)"
                                                    className="bg-white"
                                                />
                                                {item.value && (
                                                    <div className="relative w-full h-64 bg-slate-200 rounded-lg overflow-hidden border shadow-inner group">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={item.value} alt="Preview" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
                                                            รูปภาพตัวอย่าง
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Input name={`content_${item.key}`} defaultValue={item.value} />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* DYNAMIC TABS LOOP */}
                    {tabs.slice(1).map((tab) => {
                        const items = grouped[tab.id] || [];
                        if (items.length === 0) return null;

                        return (
                            <TabsContent key={tab.id} value={tab.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <tab.icon className="w-5 h-5 text-blue-500" /> ข้อมูลส่วน: {tab.label}
                                        </CardTitle>
                                        <CardDescription>แก้ไขข้อความในส่วน {tab.label}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {items.map((item) => (
                                            <div key={item.id} className="grid w-full gap-2">
                                                <Label htmlFor={item.key} className="text-base font-semibold text-slate-700">{item.label}</Label>

                                                {item.type === 'textarea' ? (
                                                    <Textarea
                                                        id={`content_${item.key}`}
                                                        name={`content_${item.key}`}
                                                        defaultValue={item.value}
                                                        rows={4}
                                                        className="resize-y"
                                                    />
                                                ) : item.type === 'icon' ? (
                                                    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <Label className="mb-2 block text-xs text-muted-foreground uppercase tracking-wider">เลือกจากระบบ</Label>
                                                                <Select name={`content_${item.key}`} defaultValue={item.value.startsWith('/') ? '' : item.value}>
                                                                    <SelectTrigger className="w-full bg-white">
                                                                        <SelectValue placeholder="เลือกไอคอน" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {AVAILABLE_ICONS.map(icon => (
                                                                            <SelectItem key={icon.value} value={icon.value}>
                                                                                {icon.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex items-center justify-center p-2">
                                                                <span className="text-xs font-bold text-muted-foreground">หรือ</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <Label className="mb-2 block text-xs text-muted-foreground uppercase tracking-wider">อัปโหลดรูปภาพเอง</Label>
                                                                <Input
                                                                    type="file"
                                                                    name={`file_icon_${item.key}`}
                                                                    accept="image/*"
                                                                    className="bg-white file:text-blue-600 file:font-semibold"
                                                                />
                                                            </div>
                                                        </div>

                                                        {item.value.startsWith('/') && (
                                                            <div className="flex items-center gap-3 bg-blue-50 p-2 rounded border border-blue-100">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={item.value} alt="Current" className="w-8 h-8 object-cover rounded bg-white shadow-sm" />
                                                                <span className="text-sm text-blue-700">ใช้งานรูปภาพที่อัปโหลดอยู่</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Input
                                                        id={`content_${item.key}`}
                                                        name={`content_${item.key}`}
                                                        defaultValue={item.value}
                                                        className="max-w-xl"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )
                    })}
                </Tabs>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t flex justify-end container mx-auto z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <Button type="submit" size="lg" className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                        บันทึกการเปลี่ยนแปลง
                    </Button>
                </div>
            </form>
        </div>
    );
}
