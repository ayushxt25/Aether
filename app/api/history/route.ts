import { NextResponse } from 'next/server';
import { versionStore } from '@/lib/versioning/versionStore';

export async function GET() {
    try {
        const history = versionStore.getHistory();
        return NextResponse.json({ history });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
