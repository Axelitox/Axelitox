import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { Header, MobileNav, Sidebar, Toast } from './components/Shell'
import { ReservationForm } from './components/ReservationForm'
import { CustomerModal } from './components/CustomerDetail'
import { Workspace } from './views/Workspace'
import { ReservationsView } from './views/ReservationsView'
import { CustomersView } from './views/CustomersView'
import { TeamView } from './views/TeamView'
import { AnalyticsView } from './views/AnalyticsView'
import { EditorView } from './views/EditorView'
import { SettingsView } from './views/SettingsView'

export default function App() {
  const view = useStore((s) => s.view)
  const reduced = useStore((s) => s.settings.reducedMotion)

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
  }, [reduced])

  // Échap ferme le panneau de table
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useStore.getState()
      if (e.key === 'Escape' && st.view !== 'editor' && !st.reservationDraft && !st.selectedCustomerId) st.selectTable(null, false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg text-ink">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header />
        {view === 'overview' && <Workspace variant="overview" />}
        {view === 'plan' && <Workspace variant="plan" />}
        {view === 'reservations' && <ReservationsView />}
        {view === 'customers' && <CustomersView />}
        {view === 'team' && <TeamView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'editor' && <EditorView />}
        {view === 'settings' && <SettingsView />}
      </main>
      <MobileNav />
      <ReservationForm />
      <CustomerModal />
      <Toast />
    </div>
  )
}
