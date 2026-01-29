import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only allow admins to update others, or players to update themselves
        if (session.user.role !== "admin" && session.user.id !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { name, image } = await request.json();
        await connectDB();

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { name, image } },
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Prevent deleting yourself
        if (session.user.id === id) {
            return NextResponse.json({ error: "Du kannst deinen eigenen Account nicht löschen" }, { status: 400 });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Benutzer gelöscht' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
