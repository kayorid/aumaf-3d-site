import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { AdminShell } from '@/components/layout/AdminShell'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { PostsListPage } from '@/features/posts/pages/PostsListPage'
import { PostEditorPage } from '@/features/posts/pages/PostEditorPage'
import { LeadsListPage } from '@/features/leads/pages/LeadsListPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { UsersListPage } from '@/features/users/pages/UsersListPage'
import { UserDetailPage } from '@/features/users/pages/UserDetailPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { BotyioConfigPage } from '@/features/integrations/pages/BotyioConfigPage'
import { MediaLibraryPage } from '@/features/media/pages/MediaLibraryPage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
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
          { path: '/categories', element: <CategoriesPage /> },
          { path: '/leads', element: <LeadsListPage /> },
          { path: '/perfil', element: <ProfilePage /> },
          { path: '/usuarios', element: <UsersListPage /> },
          { path: '/usuarios/:id', element: <UserDetailPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/integrations/botyio', element: <BotyioConfigPage /> },
          { path: '/media', element: <MediaLibraryPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
