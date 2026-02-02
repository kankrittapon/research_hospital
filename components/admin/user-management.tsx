"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Loader2, Save } from "lucide-react"

interface User {
    id: string
    name: string | null
    email: string
    role: "ADMIN" | "EDITOR" | "VIEWER"
    createdAt: string
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users")
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function updateRole(userId: string, newRole: string) {
        setUpdating(userId)
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, role: newRole })
            })

            if (res.ok) {
                // Optimistic update locally
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
                // alert("อัปเดตสิทธิ์สำเร็จ") 
                // In a real app, use Toast here. But simpler for now.
            } else {
                const err = await res.json()
                alert(err.error || "Failed to update role")
            }
        } catch (error) {
            console.error(error)
            alert("Connection failed")
        } finally {
            setUpdating(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">จัดการผู้ใช้งาน (User Management)</CardTitle>
                </div>
                <CardDescription>
                    รายชื่อผู้ใช้งานทั้งหมด และการกำหนดสิทธิ์
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ชื่อผู้ใช้</TableHead>
                                <TableHead>อีเมล</TableHead>
                                <TableHead>วันที่สมัคร</TableHead>
                                <TableHead>ระดับสิทธิ์ (Role)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || "ไม่ระบุชื่อ"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(user.createdAt).toLocaleDateString("th-TH")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Select 
                                                defaultValue={user.role} 
                                                onValueChange={(val) => updateRole(user.id, val)}
                                                disabled={updating === user.id}
                                            >
                                                <SelectTrigger className="w-[140px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">
                                                        <span className="flex items-center gap-2">
                                                            <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 h-5 px-1.5 text-[10px]">Admin</Badge>
                                                            ผู้ดูแลสูงสุด
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="EDITOR">
                                                        <span className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 h-5 px-1.5 text-[10px]">Editor</Badge>
                                                            ผู้แก้ไข
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="VIEWER">
                                                        <span className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-slate-500 h-5 px-1.5 text-[10px]">Viewer</Badge>
                                                            ผู้ดูทั่วไป
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {updating === user.id && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
