import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { UserBuild } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const championId = searchParams.get('championId')
    const isPublic = searchParams.get('public')

    const db = await getDb()

    const filter: Record<string, unknown> = {}

    if (userId) filter.userId = userId
    if (championId) filter.championId = championId
    if (isPublic === 'true') filter.isPublic = true

    const builds = await db
      .collection<UserBuild>('userBuilds')
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(builds)
  } catch {
    return NextResponse.json({ error: 'Error fetching builds' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: UserBuild = await request.json()
    const db = await getDb()

    const now = new Date().toISOString()

    const newBuild: UserBuild = {
      ...body,
      likes: 0,
      views: 0,
      createdAt: now,
      updatedAt: now
    }

    const result = await db.collection<UserBuild>('userBuilds').insertOne(newBuild)

    return NextResponse.json(
      { insertedId: result.insertedId },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Error creating build' }, { status: 500 })
  }
}