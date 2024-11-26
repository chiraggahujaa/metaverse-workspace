import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const updateAvatarSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    avatarId: z.string().min(1, "Avatar ID is required"),
});

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { userId, avatarId } = updateAvatarSchema.parse(body);

        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatarId },
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
