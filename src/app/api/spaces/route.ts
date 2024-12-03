import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const CreateSpaceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    dimensions: z.string().regex(/^\d+x\d+$/, 'Dimensions Format: widthxheight (e.g., 100x200)'),
    mapId: z.string().min(1, 'Map ID is required'),
});

export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const validationResult = CreateSpaceSchema.safeParse(body);

        if (!validationResult.success) {
            // console.error('Validation errors:', validationResult.error.format());
            return NextResponse.json(
                { 
                    error: 'Validation failed', 
                    details: validationResult.error.format() 
                }, 
                { status: 400 }
            );
        }

        const { name, dimensions, mapId } = validationResult.data;
        const [width, height] = dimensions.split('x').map(Number);

        const existingSpace = await prisma.space.findFirst({
            where: { name },
        });

        const existingMapId = await prisma.space.findFirst({
            where: { mapId },
        });

        if (existingSpace) {
            return NextResponse.json(
                { error: `A space with the name "${name}" already exists` },
                { status: 400 }
            );
        }
        
        if (existingMapId) {
            return NextResponse.json(
                { error: `A space with the mapId "${mapId}" already exists` },
                { status: 400 }
            );
        }

        const space = await prisma.space.create({
            data: { 
                name, 
                width, 
                height, 
                mapId
            },
        });

        return NextResponse.json(
            { message: 'Space created successfully', space: { id: space.id, name: space.name, dimensions: `${space.width}x${space.height}`, mapId: space.mapId } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Full error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            name: error instanceof Error ? error.name : 'Unknown error type'
        });
        return NextResponse.json(
            { 
                error: 'Internal server error', 
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }, 
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const spaces = await prisma.space.findMany({
            select: {
                id: true,
                name: true,
                width: true,
                height: true,
                thumbnail: true,
            },
        });

        const formattedSpaces = spaces.map((space: any) => ({
            id: space.id,
            name: space.name,
            dimensions: `${space.width}x${space.height}`,
            thumbnail: space.thumbnail || null,
        }));

        return NextResponse.json({ spaces: formattedSpaces }, { status: 200 });
    } catch (error) {
        console.error('Error fetching spaces:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const spaceId = searchParams.get('id');

        if (!spaceId) {
            return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
        }

        await prisma.space.delete({ where: { id: spaceId } });

        return NextResponse.json({ message: 'Space deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting space:', error);        
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}