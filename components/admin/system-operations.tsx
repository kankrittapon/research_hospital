"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, ServerCog, Loader2, Zap } from "lucide-react"
import { UserManagement } from "@/components/admin/user-management"

export function SystemOperations() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isClearing, setIsClearing] = useState(false)

    async function handleSync() {
        if (!confirm("Are you sure you want to re-index all data to Meilisearch? This might take a few seconds.")) {
            return
        }

        setIsSyncing(true)
        try {
            const res = await fetch("/api/admin/sync-index", {
                method: "POST"
            })
            
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Sync failed")
            }

            const data = await res.json()
            alert(data.message || "ซ่อมแซมระบบค้นหาสำเร็จ")
        } catch (error) {
            console.error(error)
            alert("Failed to sync index")
        } finally {
            setIsSyncing(false)
        }
    }

    async function handleClearCache() {
        if (!confirm("ต้องการล้าง Cache ระบบหรือไม่? การกระทำนี้จะทำให้ข้อมูลล่าสุดแสดงผลทันที")) {
            return
        }

        setIsClearing(true)
        try {
            const res = await fetch("/api/admin/cache", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: "/" })
            })

            if (!res.ok) throw new Error("Failed")
            
            alert("ล้าง Cache สำเร็จ! ข้อมูลหน้าเว็บเป็นปัจจุบันแล้ว")
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert("เกิดข้อผิดพลาดในการล้าง Cache")
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-blue-100 bg-blue-50/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <ServerCog className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">การจัดการระบบ (System Operations)</CardTitle>
                    </div>
                    <CardDescription>
                        เครื่องมือสำหรับผู้ดูแลระบบในการจัดการข้อมูลหลังบ้าน
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Button 
                            variant="outline" 
                            onClick={handleSync} 
                            disabled={isSyncing}
                            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                        >
                            {isSyncing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            {isSyncing ? "กำลังซ่อมแซม..." : "ซ่อมแซมระบบค้นหา (Re-index)"}
                        </Button>

                        <Button 
                            variant="outline" 
                            onClick={handleClearCache} 
                            disabled={isClearing}
                            className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700"
                        >
                            {isClearing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="mr-2 h-4 w-4" />
                            )}
                            {isClearing ? "กำลังประมวลผล..." : "ล้าง Cache เว็บไซต์"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <UserManagement />
        </div>
    )
}
