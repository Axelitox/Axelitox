import { Download, RefreshCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button, Card, Field, Input, Segmented, Select, Toggle, useTwoStep } from '../components/ui'

const Row = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-6 border-t border-line/60 py-3.5 first:border-0">
    <div>
      <div className="text-[13px] font-medium">{title}</div>
      {desc && <div className="text-xs text-muted">{desc}</div>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
)

export function SettingsView() {
  const s = useStore((st) => st.settings)
  const update = useStore((st) => st.updateSettings)
  const a = useStore.getState()
  const confirmReset = useTwoStep()

  const exportJson = () => {
    const st = useStore.getState()
    const data = {
      exportedAt: new Date().toISOString(),
      layout: st.layout,
      tables: st.tables,
      reservations: st.reservations,
      customers: st.customers,
      staff: st.staff,
      sessions: st.sessions,
      settings: st.settings,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const el = document.createElement('a')
    el.href = url
    el.download = `tableflow-export-${new Date().toISOString().slice(0, 10)}.json`
    el.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 pb-24 lg:px-6 lg:pb-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Card className="p-5">
          <h2 className="mb-3 text-base font-semibold">Établissement</h2>
          <Field label="Nom du restaurant">
            <Input value={s.restaurantName} onChange={(e) => update({ restaurantName: e.target.value })} />
          </Field>
        </Card>

        <Card className="px-5 py-2">
          <h2 className="pt-3 text-base font-semibold">Service</h2>
          <Row title="Fenêtre « réservée »" desc="Minutes avant l’heure de réservation où la table apparaît réservée sur le plan.">
            <Select className="w-28" value={s.reservationWindowMin} onChange={(e) => update({ reservationWindowMin: Number(e.target.value) })}>
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </Select>
          </Row>
          <Row title="Durée de réservation par défaut" desc="Créneau bloqué pour chaque nouvelle réservation.">
            <Select className="w-28" value={s.defaultDuration} onChange={(e) => update({ defaultDuration: Number(e.target.value) })}>
              {[60, 75, 90, 105, 120, 150].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </Select>
          </Row>
          <Row title="Nettoyage après libération" desc="Une table libérée passe « à nettoyer » avant de redevenir disponible.">
            <Toggle label="Nettoyage après libération" checked={s.cleanAfterRelease} onChange={(v) => update({ cleanAfterRelease: v })} />
          </Row>
          <Row title="Profil d’utilisation" desc="Le profil serveur masque les coordonnées et les notes internes des clients.">
            <Segmented
              value={s.role}
              onChange={(role) => update({ role })}
              options={[
                { value: 'manager', label: 'Responsable' },
                { value: 'server', label: 'Serveur' },
              ]}
            />
          </Row>
        </Card>

        <Card className="px-5 py-2">
          <h2 className="pt-3 text-base font-semibold">Affichage 3D</h2>
          <Row title="Qualité graphique" desc="« Haute » active l’occlusion ambiante et des ombres plus fines.">
            <Segmented
              value={s.quality}
              onChange={(quality) => update({ quality })}
              options={[
                { value: 'high', label: 'Haute' },
                { value: 'balanced', label: 'Équilibrée' },
              ]}
            />
          </Row>
          <Row title="Mouvements réduits" desc="Désactive les transitions de caméra et les animations.">
            <Toggle label="Mouvements réduits" checked={s.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
          </Row>
          <Row title="Étiquettes des tables" desc="Badges flottants au-dessus des tables.">
            <Toggle label="Étiquettes des tables" checked={s.showBadges} onChange={(v) => update({ showBadges: v })} />
          </Row>
        </Card>

        <Card className="px-5 py-2">
          <h2 className="pt-3 text-base font-semibold">Vie du restaurant</h2>
          <Row title="Personnages animés" desc="Serveurs, cuisiniers et clients dans la scène, synchronisés avec le service.">
            <Toggle label="Personnages animés" checked={s.showCharacters} onChange={(v) => update({ showCharacters: v })} />
          </Row>
          <Row title="Densité d’animation" desc="Nombre de serveurs et de cuisiniers animés, rythme des allées et venues.">
            <Segmented
              value={s.lifeDensity}
              onChange={(lifeDensity) => update({ lifeDensity })}
              options={[
                { value: 'calm', label: 'Calme' },
                { value: 'normal', label: 'Normale' },
                { value: 'lively', label: 'Animée' },
              ]}
            />
          </Row>
          <p className="pb-3 text-xs text-muted">
            Avec « Mouvements réduits », les personnages restent immobiles : convives assis, équipe à son poste.
          </p>
        </Card>

        <Card className="px-5 py-2">
          <h2 className="pt-3 text-base font-semibold">Données</h2>
          <Row title="Stockage" desc="Les données sont enregistrées dans le stockage local de ce navigateur (aucun serveur). Le code est structuré pour une future migration vers Supabase.">
            <span className="text-xs text-muted">localStorage</span>
          </Row>
          <Row title="Exporter les données" desc="Télécharger un fichier JSON (plan, réservations, clients).">
            <Button size="sm" variant="outline" onClick={exportJson}>
              <Download size={13} /> Exporter
            </Button>
          </Row>
          <Row title="Réinitialiser la démonstration" desc="Recharge Maison Rouge avec un service du midi en cours. Efface vos modifications.">
            <Button size="sm" variant="danger" onClick={() => confirmReset.run('reset', a.resetDemo)}>
              <RefreshCcw size={13} /> {confirmReset.armed ? 'Confirmer' : 'Réinitialiser'}
            </Button>
          </Row>
        </Card>
      </div>
    </div>
  )
}
