import { Geist, Geist_Mono, Barlow_Condensed, Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ArcanePaintDefs } from "./components/arcane";

// Fonts de l'ancienne identité — conservées pour les pages qui ne sont pas encore
// refaites (ARAM Missions, Codename), afin d'éviter toute régression visuelle.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonts du nouveau design (Arcane.kit) — utilisées via les primitives `Ac*`.
// Chargées en weight unique pour limiter le CLS et la bande passante mobile.
const bebas = Bebas_Neue({
  variable: "--ac-font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const barlow = Barlow_Condensed({
  variable: "--ac-font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});
const inter = Inter({
  variable: "--ac-font-inter",
  subsets: ["latin"],
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  variable: "--ac-font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          bebas.variable,
          barlow.variable,
          inter.variable,
          jetbrains.variable,
          "antialiased",
        ].join(" ")}
      >
        {/* Filtres SVG du design system — doivent exister partout pour que
            n'importe quel composant Ac* puisse y référer. Hors du flux,
            zéro impact layout. */}
        <ArcanePaintDefs />
        {children}
      </body>
    </html>
  );
}
