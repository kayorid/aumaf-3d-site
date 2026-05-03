import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AdminShell() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Tech grid global de fundo, muito sutil */}
      <div className="fixed inset-0 bg-tech-grid opacity-30 pointer-events-none" aria-hidden />
      {/* Glow ambiente sutil no canto superior direito */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle, rgba(97,197,79,0.05) 0%, transparent 70%)',
        }}
      />

      <Sidebar />
      <div className="relative lg:pl-60 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 px-6 lg:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
