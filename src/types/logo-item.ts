export type LogoSetKey = 'companies' | 'movies' | 'countries' | 'sports'

export interface LogoItem {
  name: string
  id?: string | number // Optional ID for items that need it (like sports teams)
  imageUrl: string
  eliminated: boolean
}

export interface LogoList {
  id: string
  name: string
  fetchItems: () => Promise<LogoItem[]>
}

export interface LogoSet {
  id: LogoSetKey
  name: string
  lists: LogoList[]
}
