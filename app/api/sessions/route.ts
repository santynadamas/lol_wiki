import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { UserSession } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const db = await getDb()

    const sessions = await db
      .collection<UserSession>('userSessions')
      .find(
        {
          userId,
          expiresAt: { $gt: new Date().toISOString() }
        },
        {
          projection: { _id: 0, refreshTokenHash: 0 }
        }
      )
      .toArray()

    return NextResponse.json(sessions)
  } catch {
    return NextResponse.json({ error: 'Error fetching sessions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: UserSession = await request.json()
    const db = await getDb()

    const result = await db.collection<UserSession>('userSessions').insertOne({
      ...body,
      createdAt: body.createdAt || new Date().toISOString()
    })

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error creating session' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const db = await getDb()

    const result = await db
      .collection<UserSession>('userSessions')
      .deleteMany({ userId })

    return NextResponse.json({ deleted: result.deletedCount })
  } catch {
    return NextResponse.json({ error: 'Error deleting sessions' }, { status: 500 })
  }
}