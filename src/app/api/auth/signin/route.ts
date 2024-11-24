import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/bcrypt";
import { z } from 'zod';

// Zod schema for validating the input
const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
});

export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json();

        // Validate the input using Zod schema
        const validationResult = LoginSchema.safeParse(requestData);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { email, password } = validationResult.data;

        // Check if the user exists by email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json(
                { error: "User not found!" },
                { status: 404 }
            );
        }

        // Verify the password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { message: "Login successful!", user },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal server error", details: error },
            { status: 500 }
        );
    }
}