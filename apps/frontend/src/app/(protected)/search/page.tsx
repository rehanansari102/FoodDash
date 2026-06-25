import { searchRestaurants } from '@/app/actions/restaurant'
import SearchClient from './SearchClient'

interface Props {
  searchParams: Promise<{ q?: string; cuisine?: string; minRating?: string; isOpen?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams
  return { title: q ? `"${q}" — SnapBite` : 'Search — SnapBite' }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', cuisine, minRating, isOpen } = await searchParams

  const results = await searchRestaurants({
    q,
    cuisine,
    minRating: minRating ? Number(minRating) : undefined,
    isOpen: isOpen === 'true',
  })

  return (
    <SearchClient
      initialResults={results}
      query={q}
      cuisine={cuisine ?? ''}
      minRating={minRating ? Number(minRating) : 0}
      isOpen={isOpen === 'true'}
    />
  )
}
