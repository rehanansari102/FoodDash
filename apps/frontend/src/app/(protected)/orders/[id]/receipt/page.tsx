import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { apiGetOrder } from '@/app/lib/api'
import ReceiptClient from './ReceiptClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Receipt #${id.slice(-8).toUpperCase()} — SnapBite` }
}

export default async function ReceiptPage({ params }: Props) {
  const { id } = await params
  const token = (await cookies()).get('access_token')?.value ?? ''

  let order
  try {
    order = await apiGetOrder(token, id)
  } catch {
    notFound()
  }

  return <ReceiptClient order={order} />
}
