import { getDb } from '@/lib/mongodb'
import type { SummonerSpell } from '@/types'
import SummonerSpellsView from './SummonerSpellsView'

export const dynamic = 'force-dynamic'

export default async function SummonerSpellsPage() {
  try {
    const db = await getDb()
    const spells = await db
      .collection<SummonerSpell>('summonerSpells')
      .find({}, { projection: { _id: 0 } })
      .toArray()
    return <SummonerSpellsView spells={JSON.parse(JSON.stringify(spells))} />
  } catch {
    return <SummonerSpellsView spells={[]} />
  }
}
