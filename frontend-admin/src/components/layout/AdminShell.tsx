import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AdminShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
