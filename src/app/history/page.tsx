'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Session = {
  id: string
  duration_minutes: number
  date: string
  note: string | null
  hobbies: { name: string } | null
}

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, hobbies(name)')
        .order('date', { ascending: false })
      setSessions((data as unknown as Session[]) || [])
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <Link href="/" className="text-blue-600 underline">Back</Link>
      </div>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded border p-4">
            <p className="font-semibold">{s.hobbies?.name}</p>
            <p className="text-sm text-gray-500">{s.date} — {s.duration_minutes} min</p>
            {s.note && <p className="text-sm mt-1">{s.note}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}