import { NextResponse } from 'next/server';
import { versionStore } from '@/lib/versioning/versionStore';

export async function POST(req: Request) {
    try {
        const { id } = await req.json();
        const version = versionStore.rollback(id);

        if (!version) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        return NextResponse.json({ version });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
