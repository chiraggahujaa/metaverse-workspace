import prisma from "@/lib/prisma";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

const createMapSchema = z.object({
    thumbnail: z.string().url(),
    width: z.number().positive(),
    height: z.number().positive(),
    name: z.string().min(1),
    defaultElements: z.array(
        z.object({
            elementId: z.string(),
            x: z.number(),
            y: z.number(),
        })
    ),
});

const updateMapSchema = z.object({
    id: z.string(),
    thumbnail: z.string().url().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    name: z.string().min(1).optional(),
    defaultElements: z.array(
        z.object({
            elementId: z.string(),
            x: z.number(),
            y: z.number(),
        })
    ).optional(),
});

export async function POST(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const validationResult = createMapSchema.safeParse(body);

        if (!validationResult.success) {

            return NextResponse.json(
                { error: validationResult.error.format() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        const map = await prisma.map.create({
            data: {
                thumbnail: data.thumbnail,
                width: data.width,
                height: data.height,
                name: data.name,
                elements: { create: data.defaultElements },
            },
        });

        return NextResponse.json({ id: map.id }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const validationResult = updateMapSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.format() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        const map = await prisma.map.update({
            where: { id: data.id },
            data: {
                thumbnail: data.thumbnail,
                width: data.width,
                height: data.height,
                name: data.name,
                elements: data.defaultElements ? { create: data.defaultElements } : undefined,
            },
        });

        return NextResponse.json({ id: map.id }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}