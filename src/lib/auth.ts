import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/bcrypt";
import { z } from "zod";

const credentialsSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called with credentials:", credentials);

                // Validate credentials using Zod
                const parsedCredentials = credentialsSchema.safeParse(credentials);
                if (!parsedCredentials.success) {
                    const errorMessage = parsedCredentials.error.errors.map(err => err.message).join(', ');
                    throw new Error(errorMessage);
                }

                const user = await prisma.user.findUnique({
                    where: { email: parsedCredentials.data.email },
                });

                if (!user) {
                    throw new Error('No user found with the provided email');
                }

                const isValid = await verifyPassword(parsedCredentials.data.password, user.password);
                if (!isValid) {
                    throw new Error('The password you entered is incorrect. Please try again.');
                }

                return { id: user.id, email: user.email, role: user.role, username: user.username, name: user.username, avatarId: user.avatarId };
            },
        }),
    ],
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: 'jwt' as 'jwt',
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user?: any }) {
            console.log("JWT callback called with token:", token, "and user:", user);
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.username = user.username;
                token.name = user.name;
                token.avatarId = user.avatarId;
            }
            console.log('Updated token:', token);
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            console.log("Session callback called with session:", session, "and token:", token);
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.username = token.username;
                session.user.name = token.name;
                session.user.avatarId = token.avatarId;
            }
            return session;
        },
        async redirect({ url, baseUrl }: { url: any, baseUrl: any }) {
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export async function isAdmin(): Promise<boolean> {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "Admin";
}