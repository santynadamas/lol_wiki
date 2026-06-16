import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { UserAchievement } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const db = await getDb()
    const filter = userId ? { userId } : {}
    const achievements = await db
      .collection<UserAchievement>('userAchievements')
      .find(filter, { projection: { _id: 0 } })
      .sort({ unlockedAt: -1 })
      .toArray()
    return NextResponse.json(achievements)
  } catch {
    return NextResponse.json({ error: 'Error fetching achievements' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: UserAchievement = await request.json()
    const db = await getDb()
    const existing = await db.collection<UserAchievement>('userAchievements')
      .findOne({ userId: body.userId, type: body.type })

    if (existing) {
      return NextResponse.json({ error: 'Achievement already unlocked' }, { status: 409 })
    }

    const result = await db.collection<UserAchievement>('userAchievements').insertOne({
      ...body,
      unlockedAt: body.unlockedAt || new Date().toISOString()
    })

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error creating achievement' }, { status: 500 })
  }
}