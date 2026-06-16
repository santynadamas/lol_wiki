import ChampionWiki from '@/components/ChampionWiki'
import { getDb } from '@/lib/mongodb'
import type { Champion, ChampionTier, Build, Skin, Ability, Item, Rune } from '@/types'


export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const db = await getDb()
    const [champions, tiers, builds, skins, abilities, items, runes] = await Promise.all([
      db.collection<Champion>('champions').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection<ChampionTier>('tiers').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection<Build>('builds').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection<Skin>('skins').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection<Ability>('abilities').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection<Item>('items').find({}, { projection: { _id: 0 } }).toArray(),
      db.collection<Rune>('runes').find({}, { projection: { _id: 0 } }).toArray(),
    ])

    const props = {
      champions: JSON.parse(JSON.stringify(champions)),
      tiers: JSON.parse(JSON.stringify(tiers)),
      builds: JSON.parse(JSON.stringify(builds)),
      skins: JSON.parse(JSON.stringify(skins)),
      abilities: JSON.parse(JSON.stringify(abilities)),
      items: JSON.parse(JSON.stringify(items)),
      runes: JSON.parse(JSON.stringify(runes)),
    }
    return <ChampionWiki {...props} />
  } catch {
    return (
      <ChampionWiki
        champions={[]} tiers={[]} builds={[]} skins={[]}
        abilities={[]} items={[]} runes={[]}
      />
    )
  }
}
