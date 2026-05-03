import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { AdminShell } from '@/components/layout/AdminShell'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { PostsListPage } from '@/features/posts/pages/PostsListPage'
import { PostEditorPage } from '@/features/posts/pages/PostEditorPage'
import { NotFoundPage } from '@/components/layout/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/posts', element: <PostsListPage /> },
          { path: '/posts/new', element: <PostEditorPage /> },
          { path: '/posts/:id', element: <PostEditorPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
