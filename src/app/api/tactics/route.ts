import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tactic from '@/models/Tactic';

export async function GET() {
    try {
        await dbConnect();
        const tactics = await Tactic.find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ tactics });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const tactic = await Tactic.create(body);
        return NextResponse.json(tactic, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
