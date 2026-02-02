"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Phone, MapPin, BookOpen, User, Home, Info, Mail, Layout, Image as ImageIcon, Search, Database, Activity, Trophy, Users, Calendar, Download, CloudLightning, Loader2, CheckCircle, Save, Menu } from "lucide-react";
import { updateContent } from "./actions";

// Icon Mapping
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

export function ContentManagerClient({ groupedContents }: { groupedContents: any }) {
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);

    // Tab Data - Refined Structure
    const tabs = [
        { id: 'HOME_GROUP', label: 'หน้าแรก & ธีม', icon: Layout },
        { id: 'SERVICES', label: 'บริการ', icon: FileText },
        { id: 'ABOUT', label: 'เกี่ยวกับเรา', icon: Info },
        { id: 'CONTACT', label: 'ติดต่อเรา', icon: Phone },
    ];

    // Merge contents for Home Group
    const themeItems = groupedContents['THEME'] || [];
    const bannerItems = groupedContents['IMAGES'] || [];
    const homeItems = groupedContents['HOME_HERO'] || [];
    const navItems = groupedContents['NAV'] || [];
    
    // Sort NAV items to be in logical order if needed (or rely on DB order)
    // DB order was: home, about, repo, news, services, download, contact. 
    // We can just render them as is.

    const homeGroupItems = {
        theme: [...themeItems, ...bannerItems],
        hero: homeItems,
        nav: navItems
    };

    // About Group
    const aboutItems = groupedContents['ABOUT'] || [];

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                await updateContent(formData);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการบันทึก");
            }
        });
    }

    // Helper to render an item input
    const renderItem = (item: any) => (
        <div key={item.id} className="grid w-full gap-2 p-4 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-colors">
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
                    <p className="text-xs text-muted-foreground">แนะนำให้ใช้รูปจาก Unsplash หรือวาง Direct URL</p>
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
            ) : item.type === 'textarea' ? (
                <div>
                    <Textarea
                        id={`content_${item.key}`}
                        name={`content_${item.key}`}
                        defaultValue={item.value}
                        rows={4}
                        className="resize-y"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">ดึงมุมขวาล่างเพื่อขยายขนาดกล่องข้อความ</p>
                </div>
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
    );

    return (
        <div className="relative">
             {/* Toast Notification */}
             {showToast && (
                <div className="fixed top-24 right-8 z-50 animate-in fade-in slide-in-from-right-10 duration-300">
                    <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
                        <CheckCircle className="h-6 w-6" />
                        <div>
                            <h4 className="font-bold text-lg">บันทึกข้อมูลสำเร็จ!</h4>
                            <p className="text-green-100 text-sm">ข้อมูลหน้าเว็บไซต์ถูกอัปเดตเรียบร้อยแล้ว</p>
                        </div>
                    </div>
                </div>
            )}

            <form action={handleSubmit}>
                <Tabs defaultValue="HOME_GROUP" className="w-full space-y-6">
                    <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur py-2 border-b">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-slate-200">
                            {tabs.map(tab => (
                                <TabsTrigger key={tab.id} value={tab.id} className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                                    <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* TAB 1: HOME GROUP (Theme, Hero, Nav) */}
                    <TabsContent value="HOME_GROUP" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. Theme & Banner */}
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-blue-500" /> ตกแต่ง & แบนเนอร์ (Theme & Banner)</CardTitle>
                                <CardDescription>ตั้งค่าสีและรูปภาพหลักของเว็บไซต์</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {homeGroupItems.theme.map((item: any) => renderItem(item))}
                            </CardContent>
                        </Card>

                        {/* 2. Hero Text */}
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Home className="w-5 h-5 text-blue-500" /> ข้อความหน้าแรก (Hero Text)</CardTitle>
                                <CardDescription>ข้อความต้อนรับขนาดใหญ่บนหน้าแรก</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {homeGroupItems.hero.map((item: any) => renderItem(item))}
                            </CardContent>
                        </Card>

                         {/* 3. Navigation Menu */}
                         <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Menu className="w-5 h-5 text-blue-500" /> เมนูนำทาง (Navigation Menu)</CardTitle>
                                <CardDescription>ข้อความบนแถบเมนูหลัก</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {homeGroupItems.nav.map((item: any) => renderItem(item))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: ABOUT (Enhanced) */}
                    <TabsContent value="ABOUT" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-500" /> ข้อมูล "เกี่ยวกับเรา"
                                </CardTitle>
                                <CardDescription>จัดการข้อความ รูปภาพ และลิงก์ในส่วนเกี่ยวกับเรา</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {aboutItems.map((item: any) => renderItem(item))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: SERVICES (Grouped) */}
                    <TabsContent value="SERVICES" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {[1, 2, 3, 4].map((num) => {
                            const prefix = `service_${num}`;
                            // Filter items for this service
                            const serviceItems = (groupedContents['SERVICES'] || []).filter((item: any) => item.key.startsWith(prefix));
                            
                            // Sort order: Title, Desc, Detail, URL, Image, Icon
                            const sortedItems = serviceItems.sort((a: any, b: any) => {
                                const order = ['title', 'desc', 'detail', 'url', 'image', 'icon'];
                                const typeA = a.key.replace(`${prefix}_`, '');
                                const typeB = b.key.replace(`${prefix}_`, '');
                                return order.indexOf(typeA) - order.indexOf(typeB);
                            });

                            if (serviceItems.length === 0) return null;

                            return (
                                <Card key={num} className="border-l-4 border-l-blue-500 shadow-sm">
                                    <CardHeader className="bg-slate-50 border-b pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                                                {num}
                                            </div>
                                            บริการที่ {num}
                                        </CardTitle>
                                        <CardDescription>แก้ไขข้อมูลบริการลำดับที่ {num}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        {sortedItems.map((item: any) => renderItem(item))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </TabsContent>

                    {/* DYNAMIC TABS LOOP (Other dynamic tabs if any) */}
                    {tabs.slice(1).filter(t => t.id !== 'ABOUT' && t.id !== 'SERVICES' && t.id !== 'HOME_GROUP').map((tab) => {
                        const items = groupedContents[tab.id] || [];
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
                                        {items.map((item: any) => renderItem(item))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )
                    })}
                </Tabs>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t flex justify-end container mx-auto z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <Button type="submit" size="lg" disabled={isPending} className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] gap-2">
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                บันทึกการเปลี่ยนแปลง
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
