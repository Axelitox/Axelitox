import { Button } from "./ui";
import { RevealLines, Reveal } from "./Reveal";

export function RegistrationBand() {
  return (
    <section data-header="light" className="bg-signal py-24 text-ink md:py-36">
      <div className="container-x grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-ink" />
            Inscriptions 2026/2027
          </p>
          <h2 className="display-xl mt-8">
            <RevealLines lines={["Prêt à", "plonger ?"]} />
          </h2>
        </div>
        <Reveal delay={0.15} className="md:col-span-4">
          <p className="text-lg leading-relaxed">
            Retrouvez les modalités d&apos;inscription et rejoignez le CS Clichy 92 Natation.
          </p>
          <Button href="/inscriptions" variant="ink" size="lg" icon="right" className="mt-8 w-full sm:w-auto">
            S&apos;inscrire
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
