import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section data-header="dark" className="flex min-h-[80svh] items-end bg-ink pb-24 pt-40 text-white">
      <div className="container-x">
        <p className="eyebrow text-signal">Erreur 404</p>
        <h1 className="display-xl mt-6">
          Hors
          <br />
          bassin<span className="text-signal">.</span>
        </h1>
        <p className="mt-8 max-w-md text-white/70">Cette page n&apos;existe pas ou a été déplacée lors de la refonte du site.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/" icon="right">Retour à l&apos;accueil</Button>
          <Button href="/planning-tarifs" variant="outline-light">Planning & tarifs</Button>
        </div>
      </div>
    </section>
  );
}
