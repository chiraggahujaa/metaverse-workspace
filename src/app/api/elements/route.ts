import prisma from "@/lib/prisma";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const createElementSchema = z.object({
  imageUrl: z.string().url(),
  width: z.number().positive(),
  height: z.number().positive(),
  static: z.boolean(),
});

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json("Unauthorized", { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createElementSchema.parse(body);

    const element = await prisma.element.create({
      data,
    });

    return NextResponse.json({ id: element.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 400 });
  }
}

const updateElementSchema = z.object({
  id: z.string(),
  imageUrl: z.string().url().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  static: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json("Unauthorized", { status: 403 });
  }

  try {
    const body = await req.json();
    const data = updateElementSchema.parse(body);

    const element = await prisma.element.update({
      where: { id: data.id },
      data: {
        imageUrl: data.imageUrl,
        width: data.width,
        height: data.height,
        static: data.static,
      },
    });

    return NextResponse.json({ id: element.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 400 });
  }
}
