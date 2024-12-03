import prisma from "@/lib/prisma";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';

const createAvatarSchema = z.object({
    imageUrl: z.string().url(),
    name: z.string().min(1),
});

const updateAvatarSchema = z.object({
    id: z.string().min(1),
    imageUrl: z.string().url(),
    name: z.string().min(1),
});

export async function GET() {
    try {
        const avatars = await prisma.avatar.findMany();

        return NextResponse.json({ avatars });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json("Unauthorized", { status: 403 });
    }

    try {
        const body = await req.json();
        const result = createAvatarSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(result.error.errors, { status: 400 });
        }

        const avatar = await prisma.avatar.create({
            data: result.data,
        });

        return NextResponse.json({ avatarId: avatar.id }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(error.message, { status: 400 });
    }
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json("Unauthorized", { status: 403 });
    }

    try {
        const body = await req.json();
        const result = updateAvatarSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(result.error.errors, { status: 400 });
        }

        const avatar = await prisma.avatar.update({
            where: { id: result.data.id },
            data: result.data,
        });

        return NextResponse.json({ avatarId: avatar.id }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(error.message, { status: 400 });
    }
}