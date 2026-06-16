import { getDb } from '@/lib/mongodb'
import type { PatchNotes } from '@/types'
import PatchNotesView from './PatchNotesView'

export const dynamic = 'force-dynamic'

export default async function PatchNotesPage() {
  try {
    const db = await getDb()
    const patches = await db
      .collection<PatchNotes>('patchNotes')
      .find({}, { projection: { _id: 0 } })
      .sort({ releaseDate: -1 })
      .toArray()
    return <PatchNotesView patches={JSON.parse(JSON.stringify(patches))} />
  } catch {
    return <PatchNotesView patches={[]} />
  }
}
