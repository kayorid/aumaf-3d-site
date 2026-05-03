import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMe } from '../api/use-me'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

export function AuthGuard() {
  const location = useLocation()
  const { isLoading, isError, data } = useMe()

  if (isLoading) return <LoadingScreen />

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
