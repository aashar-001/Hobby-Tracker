'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Hobby = { id: string; name: string }

export default function AddSession() {
  const [hobbies, setHobbies] = useState<Hobby[]>([])
  const [hobbyId, setHobbyId] = useState('')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('hobbies').select('*')
      setHobbies(data || [])
      if (data && data.length > 0) setHobbyId(data[0].id)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !hobbyId) return

    await supabase.from('sessions').insert({
      hobby_id: hobbyId,
      user_id: user.id,
      duration_minutes: parseInt(duration),
      date,
      note,
    })

    router.push('/')
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Log a Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={hobbyId}
          onChange={(e) => setHobbyId(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        >
          {hobbies.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white">
          Save Session
        </button>
      </form>
    </div>
  )
}