import { NextResponse } from 'next/server';
import { versionStore } from '@/lib/versioning/versionStore';
import { z } from 'zod';

const RollbackRequestSchema = z.object({
    id: z.number().int().positive('ID must be a positive integer')
});

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const parseResult = RollbackRequestSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
        }

        const { id } = parseResult.data;
        const version = versionStore.rollback(id);

        if (!version) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        return NextResponse.json({ version });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
