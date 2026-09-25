'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Hobby = {
  id: string
  name: string
}

type Session = {
  id: string
  hobby_id: string
  duration_minutes: number
}

export default function Dashboard() {
  const [hobbies, setHobbies] = useState<Hobby[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [newHobby, setNewHobby] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: hobbiesData } = await supabase
        .from('hobbies')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')

      setHobbies(hobbiesData || [])
      setSessions(sessionsData || [])
      setLoading(false)
    }
    load()
  }, [router])

  const addHobby = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHobby.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('hobbies')
      .insert({ name: newHobby, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      setHobbies([data, ...hobbies])
      setNewHobby('')
    }
  }

  const totalMinutes = (hobbyId: string) =>
    sessions
      .filter((s) => s.hobby_id === hobbyId)
      .reduce((sum, s) => sum + s.duration_minutes, 0)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Hobbies</h1>
        <button onClick={signOut} className="text-sm text-gray-500 underline">
          Sign out
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <Link href="/add" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Log Session
        </Link>
        <Link href="/history" className="rounded bg-gray-200 px-4 py-2">
          View History
        </Link>
      </div>

      <form onSubmit={addHobby} className="mb-6 flex gap-2">
        <input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="New hobby name (e.g. Guitar)"
          className="flex-1 rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white">
          Add
        </button>
      </form>

      <div className="space-y-3">
        {hobbies.length === 0 && (
          <p className="text-gray-500">No hobbies yet. Add one above!</p>
        )}
        {hobbies.map((hobby) => (
          <div key={hobby.id} className="rounded border p-4">
            <p className="font-semibold">{hobby.name}</p>
            <p className="text-sm text-gray-500">
              Total: {totalMinutes(hobby.id)} minutes
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}