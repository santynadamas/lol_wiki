import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { PatchNotes } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const version = searchParams.get('version')
    const db = await getDb()
    const filter = version ? { version } : {}

    const patches = await db
      .collection<PatchNotes>('patchNotes')
      .find(filter, { projection: { _id: 0 } })
      .sort({ releaseDate: -1 })
      .toArray()

    return NextResponse.json(patches)
  } catch {
    return NextResponse.json({ error: 'Error fetching patch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: PatchNotes = await request.json()
    const db = await getDb()

    const existing = await db
      .collection<PatchNotes>('patchNotes')
      .findOne({ version: body.version })

    if (existing) {
      await db
        .collection<PatchNotes>('patchNotes')
        .replaceOne({ version: body.version }, body)

      return NextResponse.json({
        message: 'Patch updated',
        version: body.version
      })
    }

    const result = await db.collection<PatchNotes>('patchNotes').insertOne(body)

    return NextResponse.json(
      {
        insertedId: result.insertedId,
        version: body.version
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Error saving patch notes' }, { status: 500 })
  }
}