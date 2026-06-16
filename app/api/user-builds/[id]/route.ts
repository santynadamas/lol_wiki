import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { UserBuild } from '@/types'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()

    const build = await db
      .collection<UserBuild>('userBuilds')
      .findOne({ _id: new ObjectId(id) as any })

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    await db.collection<UserBuild>('userBuilds').updateOne(
      { _id: new ObjectId(id) as any },
      { $inc: { views: 1 } }
    )

    return NextResponse.json({ ...build, _id: build._id?.toString() })
  } catch {
    return NextResponse.json({ error: 'Error fetching build' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const db = await getDb()

    const { _id, ...update } = body

    const result = await db.collection<UserBuild>('userBuilds').updateOne(
      { _id: new ObjectId(id) as any },
      {
        $set: {
          ...update,
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Build updated' })
  } catch {
    return NextResponse.json({ error: 'Error updating build' }, { status: 500 })
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()

    const result = await db
      .collection<UserBuild>('userBuilds')
      .deleteOne({ _id: new ObjectId(id) as any })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Build deleted' })
  } catch {
    return NextResponse.json({ error: 'Error deleting build' }, { status: 500 })
  }
}