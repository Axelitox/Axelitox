import { Button } from "./ui";
import { Reveal } from "./Reveal";

export function RegistrationBand() {
  return (
    <section className="bg-signal px-6 py-20 text-center text-ink md:py-28">
      <Reveal y={12}>
        <p className="text-[17px] font-semibold md:text-[21px]">Inscriptions 2026/2027</p>
        <h2 className="display-xl mt-2">Prêt à plonger ?</h2>
        <p className="subhead mx-auto mt-4 max-w-xl">
          Retrouvez les modalités d&apos;inscription et rejoignez le CS Clichy 92 Natation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Button href="/inscriptions" variant="ink" size="lg">
            S&apos;inscrire
          </Button>
          <Button href="/planning-tarifs" variant="outline-dark" size="lg">
            Voir le planning
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
