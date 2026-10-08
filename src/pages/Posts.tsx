import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'

interface Post {
  id: string
  title: string
  published: boolean
  updatedAt: string
  _count: { comments: number }
}

export default function Posts() {
  const qc = useQueryClient()
  const { data, error, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () =>
      apiFetch<{ data: { posts: Post[] } }>('/api/posts?status=all&limit=100').then((r) => r.data.posts),
  })

  const refetch = () => qc.invalidateQueries({ queryKey: ['posts'] })
  const toggle = useMutation({
    mutationFn: (p: Post) =>
      apiFetch(`/api/posts/${p.id}`, { method: 'PATCH', body: JSON.stringify({ published: !p.published }) }),
    onSuccess: refetch,
  })
  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/posts/${id}`, { method: 'DELETE' }),
    onSuccess: refetch,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">{error.message}</p>

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b">
          <th className="py-2">Title</th>
          <th>Status</th>
          <th>Comments</th>
          <th>Updated</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {data?.map((p) => (
          <tr key={p.id} className="border-b">
            <td className="py-2">{p.title}</td>
            <td>
              <span className={p.published ? 'text-green-700' : 'text-amber-700'}>
                {p.published ? 'Published' : 'Draft'}
              </span>
            </td>
            <td>{p._count.comments}</td>
            <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
            <td className="space-x-2 text-right">
              <button onClick={() => toggle.mutate(p)} className="rounded border px-2 py-1">
                {p.published ? 'Unpublish' : 'Publish'}
              </button>
              <Link to={`/posts/${p.id}/edit`} className="rounded border px-2 py-1">Edit</Link>
              <button
                onClick={() => confirm(`Delete "${p.title}"?`) && remove.mutate(p.id)}
                className="rounded border px-2 py-1 text-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
