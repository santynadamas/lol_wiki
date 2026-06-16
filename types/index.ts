import { ObjectId } from 'mongodb'

// ─── Champion ────────────────────────────────────────────────────────────────

export interface ChampionImage {
  full: string; url: string; sprite: string; group: string
  x: number; y: number; w: number; h: number
}
export interface ChampionInfo { attack: number; defense: number; magic: number; difficulty: number }
export interface ChampionStats {
  hp: number; hpperlevel: number; mp: number; mpperlevel: number; movespeed: number
  armor: number; armorperlevel: number; spellblock: number; spellblockperlevel: number
  attackrange: number; hpregen: number; hpregenperlevel: number; mpregen: number
  mpregenperlevel: number; crit: number; critperlevel: number; attackdamage: number
  attackdamageperlevel: number; attackspeedperlevel: number; attackspeed: number
}
export interface Champion {
  _id?: string; version: string; id: string; key: string; name: string; title: string
  blurb: string; info: ChampionInfo; image: ChampionImage; tags: string[]; partype: string
  stats: ChampionStats
}

// ─── Champion Tiers ───────────────────────────────────────────────────────────

export interface TierStats { winRate: number; pickRate: number; banRate: number; matches: number }
export interface TierMeta { damageType: string; resourceType: string; tags: string[] }
export interface ChampionTier {
  _id: string; patch: string; championId: string; championName: string; championImage: string
  role: string; tier: 'S' | 'A' | 'B' | 'C' | 'D'; stats: TierStats; meta: TierMeta
}

// ─── Build ────────────────────────────────────────────────────────────────────

export interface BuildProfile { damage_type: string; uses_mana: boolean; resource_type: string }
export interface RecommendedBuild { items: string[]; playstyle: string; item_images: Record<string, string> }
export interface Build {
  _id?: string; id: string; name: string; profile: BuildProfile
  recommended_build: RecommendedBuild; champion_image: string
}

// ─── Skin ─────────────────────────────────────────────────────────────────────

export interface SkinImages { splash: string; loading: string; tile: string }
export interface Skin {
  _id?: string; skinId: string; championId: string; championKey: string; championName: string
  skinNum: number; skinName: string; isBaseSkin: boolean; images: SkinImages; chromas: string[]
  releaseDate: string | null; rarity: string | null; createdAt: string
}

// ─── Ability ──────────────────────────────────────────────────────────────────

export interface AbilityImage { full: string; url: string }
export interface Ability {
  _id?: string; champion_id: string; champion_name: string; slot: 'P' | 'Q' | 'W' | 'E' | 'R'
  name: string; description: string; image: AbilityImage; cooldown: number[]; cost: number[]
  range: number[]; maxrank: number
}

// ─── Item ─────────────────────────────────────────────────────────────────────

export interface ItemStat { type: string; value?: number; passive?: string }
export interface Item {
  _id?: string; name: string; category: string; cost: number; amount_percentage: number
  formula: string; image: string; stats: ItemStat[]
}

// ─── Rune ─────────────────────────────────────────────────────────────────────

export interface RuneImage { full: string; url: string; sprite: string; group: string; x: number; y: number; w: number; h: number }
export interface RuneInfo { isrune: boolean; tier: string; type: string }
export interface Rune {
  _id?: string; id: string; name: string; description: string; version: string
  image: RuneImage; rune: RuneInfo; stats: Record<string, number>; tags: string[]
}

// ─── Summoner Spell ───────────────────────────────────────────────────────────

export interface SummonerSpell {
  _id?: string
  name: string
  description: string
  cooldown: number
  icon: string
  gameModes: string[]
  key: string
}

// ─── Patch Notes ──────────────────────────────────────────────────────────────

export interface PatchHighlightSkin { name: string; image: string }
export interface PatchChampionChangeEntry { stat: string; before: string | number; after: string | number }
export interface PatchChampionChangeSection {
  section: string; abilityName?: string; abilityImage?: string; entries: PatchChampionChangeEntry[]
}
export interface PatchChampionChange {
  championId: string; championName: string; image: string
  changeType: 'buff' | 'nerf' | 'adjustment'; summary: string; changes: PatchChampionChangeSection[]
}
export interface PatchItemChange {
  itemId: number; itemName: string; image: string; changeType: 'buff' | 'nerf' | 'adjustment'
  changes: Array<{ stat?: string; before?: string; after?: string; description?: string }>
}
export interface PatchRuneChange {
  runeName: string; image: string; changeType: 'buff' | 'nerf' | 'adjustment'
  changes: Array<{ stat: string; before: string; after: string }>
}
export interface PatchSystemChange {
  title: string; image: string
  changes: Array<{ stat: string; before: string; after: string }>
}
export interface PatchNotes {
  _id?: string; version: string; title: string; releaseDate: string
  header: { bannerImage: string; author: string; subtitle: string }
  highlights: { image: string; featuredSkins: PatchHighlightSkin[] }
  championChanges: PatchChampionChange[]
  itemChanges: PatchItemChange[]
  runeChanges: PatchRuneChange[]
  systemChanges: PatchSystemChange[]
  skins: Array<{ name: string; champion: string; splashImage: string; skinTile: string }>
  bugFixes: string[]
  aram: { championChanges: Array<{ championId: string; championName: string; image: string; changes: PatchChampionChangeEntry[] }> }
  arena: { guestOfHonor: Array<{ name: string; image: string; title: string }> }
  stats: { buffedChampions: number; nerfedChampions: number; adjustedChampions: number; changedItems: number; bugFixes: number }
  createdAt: string; updatedAt: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string; bio: string; avatar: string; favoriteRole: string
  favoriteChampion: string; region: string
}
export interface RiotAccount { gameName: string; tagLine: string; puuid: string | null; linked: boolean }
export interface UserFavorites { champions: string[]; skins: string[]; items: number[] }
export interface UserSettings { theme: string; language: string; notifications: boolean }
export interface UserStats { buildsCreated: number; likesReceived: number }
export interface User {
  _id?: string; username: string; email: string; passwordHash: string
  profile: UserProfile; riotAccount: RiotAccount; favorites: UserFavorites
  settings: UserSettings; stats: UserStats; roles: string[]
  isVerified: boolean; isBanned: boolean; lastLogin: string; createdAt: string; updatedAt: string
}
export type SafeUser = Omit<User, 'passwordHash'>

// ─── User Builds ─────────────────────────────────────────────────────────────

export interface UserBuild {
  _id?: string; userId: string; championId: string; championImage: string
  title: string; description: string; patch: string; items: number[]
  runes: { primary: string; secondary: string }; summonerSpells: string[]
  likes: number; views: number; isPublic: boolean; createdAt: string; updatedAt: string
}

// ─── User Achievements ───────────────────────────────────────────────────────

export interface UserAchievement {
  _id?: string; userId: string; type: string; title: string; description: string
  icon: string; unlockedAt: string
}

// ─── User Sessions ───────────────────────────────────────────────────────────

export interface UserSession {
  _id?: string; userId: string; device: string; ipAddress: string
  refreshTokenHash: string; expiresAt: string; createdAt: string
}

// ─── Page Props ───────────────────────────────────────────────────────────────

export interface HomePageProps {
  champions: Champion[]; tiers: ChampionTier[]; builds: Build[]; skins: Skin[]
  abilities: Ability[]; items: Item[]; runes: Rune[]
}
