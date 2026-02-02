"use server";

import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function updateContent(formData: FormData) {
    // Check auth again
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

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
    
    return { success: true };
}
