import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { apiFetch } from '../lib/api'

interface Post {
  title: string
  content: string
  published: boolean
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block', 'link'],
    ['clean'],
  ],
}

export default function PostForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [error, setError] = useState('')

  const { data } = useQuery({
    queryKey: ['post', id],
    queryFn: () => apiFetch<{ post: Post }>(`/api/posts/${id}`).then((r) => r.post),
    enabled: !!id,
  })

  useEffect(() => {
    if (data) {
      setTitle(data.title)
      setContent(data.content)
      setPublished(data.published)
    }
  }, [data])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch(id ? `/api/posts/${id}` : '/api/posts', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify({ title, content, published }),
      })
      await qc.invalidateQueries({ queryKey: ['posts'] })
      await qc.invalidateQueries({ queryKey: ['post', id] })
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">{id ? 'Edit post' : 'New post'}</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="rounded border p-2"
      />
      <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="self-start rounded bg-black px-4 py-2 text-white">Save</button>
    </form>
  )
}
