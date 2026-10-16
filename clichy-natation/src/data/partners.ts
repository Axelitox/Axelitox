/**
 * Partenaires affichés sur le site d'origine (bandeau partenaires).
 * Non relevés lors de l'audit (site inaccessible) : à compléter avec les logos
 * officiels déposés dans public/images/partenaires/. Ne rien inventer.
 */
export type Partner = { name: string; logo: string; href: string };

export const partners: Partner[] = [];
