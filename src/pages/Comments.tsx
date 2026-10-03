import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'

interface Comment {
  id: string
  content: string
  createdAt: string
  post: { id: string; title: string }
  author: { id: string; name: string | null }
}

interface Page {
  data: { comments: Comment[]; pagination: { totalPages: number } }
}

export default function Comments() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<{ id: string; content: string } | null>(null)

  const { data, error, isLoading } = useQuery({
    queryKey: ['comments', page],
    queryFn: () => apiFetch<Page>(`/api/comments?page=${page}`).then((r) => r.data),
  })

  const refetch = () => qc.invalidateQueries({ queryKey: ['comments'] })
  const save = useMutation({
    mutationFn: (c: { id: string; content: string }) =>
      apiFetch(`/api/comments/${c.id}`, { method: 'PATCH', body: JSON.stringify({ content: c.content }) }),
    onSuccess: () => {
      setEditing(null)
      refetch()
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/comments/${id}`, { method: 'DELETE' }),
    onSuccess: refetch,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">{error.message}</p>

  return (
    <div className="flex flex-col gap-3">
      {data?.comments.map((c) => (
        <div key={c.id} className="rounded border p-3 text-sm">
          <p className="mb-2 text-gray-500">
            {c.author.name ?? 'Anonymous'} on {c.post.title}, {new Date(c.createdAt).toLocaleString()}
          </p>
          {editing?.id === c.id ? (
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ id: c.id, content: e.target.value })}
              className="w-full rounded border p-2"
            />
          ) : (
            <p>{c.content}</p>
          )}
          <div className="mt-2 space-x-2">
            {editing?.id === c.id ? (
              <>
                <button onClick={() => save.mutate(editing)} className="rounded border px-2 py-1">Save</button>
                <button onClick={() => setEditing(null)} className="rounded border px-2 py-1">Cancel</button>
              </>
            ) : (
              <button
                onClick={() => setEditing({ id: c.id, content: c.content })}
                className="rounded border px-2 py-1"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => confirm('Delete this comment and its replies?') && remove.mutate(c.id)}
              className="rounded border px-2 py-1 text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {data?.comments.length === 0 && <p>No comments.</p>}
      <div className="flex items-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">
          Prev
        </button>
        <span>
          {page} / {data?.pagination.totalPages || 1}
        </span>
        <button
          disabled={page >= (data?.pagination.totalPages ?? 1)}
          onClick={() => setPage(page + 1)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
