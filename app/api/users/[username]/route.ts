import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { User, SafeUser } from '@/types'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const db = await getDb()

    const user = await db
      .collection<User>('users')
      .findOne(
        { username },
        { projection: { _id: 0, passwordHash: 0 } }
      )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user as SafeUser)
  } catch {
    return NextResponse.json(
      { error: 'Error fetching user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const body = await request.json()
    const db = await getDb()

    const { _id, passwordHash, ...safeUpdate } = body

    const result = await db.collection<User>('users').updateOne(
      { username },
      {
        $set: {
          ...safeUpdate,
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'User updated' })
  } catch {
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    )
  }
}