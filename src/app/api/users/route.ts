import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const usersMetadataSchema = z.object({
    userIds: z.array(z.string().min(1, "User ID is required")),
});

// Get avatars for a list of userIds
export async function GET(req: Request) {
    try {
        const body = await req.json();
        const parseResult = usersMetadataSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });
        }

        const { userIds } = parseResult.data;

        const metadata = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, avatarId: true, avatar: true },
        });

        const avatars = await Promise.all(metadata.map(async user => {
            return {
                userId: user.id,
                imageUrl: user.avatarId ? user.avatar?.imageUrl : null,
            };
        }));

        return NextResponse.json({ avatars });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}