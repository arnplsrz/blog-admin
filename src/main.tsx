import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { AuthProvider, ProtectedRoute } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Posts from './pages/Posts'
import PostForm from './pages/PostForm'
import Comments from './pages/Comments'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Posts />} />
                <Route path="posts/new" element={<PostForm />} />
                <Route path="posts/:id/edit" element={<PostForm />} />
                <Route path="comments" element={<Comments />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
