import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../lib/auth'

const link = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-semibold underline' : 'hover:underline'

export default function Layout() {
  const { user, logout } = useAuth()
  return (
    <main className="mx-auto max-w-5xl p-4">
      <header className="mb-6 flex items-center gap-4 border-b pb-3">
        <NavLink to="/" end className={link}>Posts</NavLink>
        <NavLink to="/posts/new" className={link}>New post</NavLink>
        <NavLink to="/comments" className={link}>Comments</NavLink>
        <span className="ml-auto text-sm">{user?.email}</span>
        <button onClick={logout} className="rounded border px-3 py-1 text-sm">Logout</button>
      </header>
      <Outlet />
    </main>
  )
}
