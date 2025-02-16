import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { spaceName: string } }) {
    const { spaceName } = await params;

    try {
        const space = await prisma.space.findFirst({
            where : {name : spaceName},
            select: {
                id: true,
                name: true,
                width: true,
                height: true,
                thumbnail: true,
            },
        });

        if(!space || !space.id) {
            return NextResponse.json({ error: 'Space not found' }, { status: 404 });
        }

        const formattedSpace = {
            id: space.id,
            name: space.name,
            dimensions: `${space.width}x${space.height}`,
            thumbnail: space.thumbnail || null,
        }

        return NextResponse.json({ space: formattedSpace }, { status: 200 });
    } catch (error) {
        console.error('Error fetching spaces:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
