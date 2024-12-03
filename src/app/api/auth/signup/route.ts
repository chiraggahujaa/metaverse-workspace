import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Zod schema for validating the input
const SignupSchema = z.object({
    email: z.string().email('Invalid email format'),
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: z.enum(['User', 'Admin']),
});

// Handle POST request
export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json();

        // Validate the input using Zod schema
        const validationResult = SignupSchema.safeParse(requestData);

        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map(err => err.message).join(", ");
            return NextResponse.json(
                { error: errorMessages },
                { status: 400 }
            );
        }
        const { email, username, password, role } = validationResult.data;

        // Check if the user already exists by email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Check if the user already exists by username
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username is already taken' },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role,
            },
        });

        return NextResponse.json(
            { message: 'User created successfully', user: { id: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role } },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
