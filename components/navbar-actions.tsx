"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarActionsProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string; // Extended type
    } | null;
}

export function NavbarActions({ user }: NavbarActionsProps) {
    if (!user) {
        return (
            <Button variant="outline" className="hidden sm:flex rounded-full" asChild>
                <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 px-2 hover:bg-slate-100">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm hidden md:block">{user.name || "ผู้ใช้งาน"}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer font-medium">
                        แดชบอร์ด
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        โปรไฟล์ส่วนตัว
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
