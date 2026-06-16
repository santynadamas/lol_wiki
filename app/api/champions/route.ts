import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { Champion } from '@/types'

export async function GET() {
  try {
    const db = await getDb()
    const champions = await db
      .collection<Champion>('champions')
      .find({}, { projection: { _id: 0 } })
      .toArray()

    return NextResponse.json(champions)
  } catch {
    return NextResponse.json({ error: 'Error fetching champions' }, { status: 500 })
  }
}