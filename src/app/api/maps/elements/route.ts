import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const mapElementSchema = z.object({
    mapId: z.string().min(1, 'Map ID is required'),
    elementId: z.string().min(1, 'Element ID is required'),
    x: z.number().int().min(0, 'X coordinate must be a non-negative integer'),
    y: z.number().int().min(0, 'Y coordinate must be a non-negative integer'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validationResult = mapElementSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: validationResult.error.format()
                },
                { status: 400 }
            );
        }

        const { mapId, elementId, x, y } = validationResult.data;

        const elementExists = await prisma.mapElements.findFirst({
            where: {
                elementId,
                mapId,
                x,
                y
            },
        });

        if (elementExists) {
            return NextResponse.json(
                { error: 'Element already exists in the specified map' },
                { status: 409 }
            );
        }

        const mapElement = await prisma.mapElements.create({
            data: {
                mapId,
                elementId,
                x,
                y,
            },
        });

        return NextResponse.json(
            { message: 'Element added to map successfully', mapElement },
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

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = {
            mapId: searchParams.get('mapId'),
            elementId: searchParams.get('elementId'),
            x: parseInt(searchParams.get('x') || '0', 10),
            y: parseInt(searchParams.get('y') || '0', 10),
        };

        const validationResult = mapElementSchema.safeParse(queryParams);

        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
        }

        const { mapId, elementId, x, y } = validationResult.data;

        const elementExists = await prisma.mapElements.findFirst({
            where: {
                mapId,
                elementId,
                x,
                y,
            },
        });

        if (!elementExists) {
            return NextResponse.json({ error: 'Element or Map not found' }, { status: 404 });
        }

        await prisma.mapElements.deleteMany({
            where: {
                mapId,
                elementId,
                x,
                y,
            },
        });

        return NextResponse.json({ message: 'Element deleted from map successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting element from map:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            name: error instanceof Error ? error.name : 'Unknown error type'
        });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}