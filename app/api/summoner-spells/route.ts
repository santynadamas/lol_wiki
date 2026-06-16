import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { SummonerSpell } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameMode = searchParams.get('mode')
    const db = await getDb()

    const filter = gameMode ? { gameModes: gameMode } : {}

    const spells = await db
      .collection<SummonerSpell>('summonerSpells')
      .find(filter, { projection: { _id: 0 } })
      .toArray()

    return NextResponse.json(spells)
  } catch {
    return NextResponse.json(
      { error: 'Error fetching summoner spells' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await getDb()

    const result = await db
      .collection<SummonerSpell>('summonerSpells')
      .insertOne(body)

    return NextResponse.json(
      { insertedId: result.insertedId },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Error creating summoner spell' },
      { status: 500 }
    )
  }
}