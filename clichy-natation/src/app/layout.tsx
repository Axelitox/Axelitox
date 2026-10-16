import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CS Clichy 92 Natation — Club de natation à Clichy (92)",
    template: "%s · CS Clichy 92 Natation",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "natation Clichy",
    "club de natation Clichy",
    "école de natation Clichy",
    "bébés nageurs Clichy",
    "aquabike Clichy",
    "piscine Gérard Durant",
    "CS Clichy 92",
    "Hauts-de-Seine",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: "CS Clichy 92 Natation",
    description: site.description,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: site.name,
  sport: "Swimming",
  url: site.url,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.postalCode,
    addressLocality: site.address.city,
    addressCountry: site.address.country,
  },
  location: { "@type": "SportsActivityLocation", name: site.address.venue },
  sameAs: site.social.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">
        <Providers>
          <Header />
          <main id="contenu">{children}</main>
          <Footer />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
