import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function isAdmin(req: Request): Promise<boolean> {
    const session = await getServerSession(authOptions);
    console.log('session', session);
    return session?.user?.role === "admin";
}
