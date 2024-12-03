import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const spaceElementSchema = z.object({
    elementId: z.string().min(1, 'Element ID is required'),
    spaceId: z.string().min(1, 'Space ID is required'),
    x: z.number().int().min(0, 'X coordinate must be a non-negative integer'),
    y: z.number().int().min(0, 'Y coordinate must be a non-negative integer'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validationResult = spaceElementSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: validationResult.error.format()
                },
                { status: 400 }
            );
        }

        const { elementId, spaceId, x, y } = validationResult.data;

        const elementExists = await prisma.spaceElements.findFirst({
            where: {
                elementId,
                spaceId,
                x,
                y
            },
        });

        if (elementExists) {
            return NextResponse.json(
                { error: 'Element already exists in the specified space' },
                { status: 409 }
            );
        }

        const element = await prisma.spaceElements.create({
            data: {
                elementId,
                spaceId,
                x,
                y,
            },
        });

        return NextResponse.json(
            { message: 'Element added to space successfully', element },
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
            elementId: searchParams.get('elementId'),
            spaceId: searchParams.get('spaceId'),
            x: parseInt(searchParams.get('x') || '0', 10),
            y: parseInt(searchParams.get('y') || '0', 10),
        };

        const validationResult = spaceElementSchema.safeParse(queryParams);

        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
        }

        const { elementId, spaceId, x, y } = validationResult.data;

        const elementExists = await prisma.spaceElements.findFirst({
            where: {
                elementId,
                spaceId,
                x,
                y
            },
        });

        if (!elementExists) {
            return NextResponse.json({ error: 'Element or Space not found' }, { status: 404 });
        }

        await prisma.spaceElements.deleteMany({
            where: {
                elementId,
                spaceId,
            },
        });

        return NextResponse.json({ message: 'Element deleted from space successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting element from space:', error);
        return NextResponse.json({ error: 'Unable to delete element from space. Please try again later.' }, { status: 500 });
    }
}