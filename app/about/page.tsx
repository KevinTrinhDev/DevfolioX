// app/about/page.tsx
import type { Metadata } from "next";
import { aboutConfig } from "@/config/aboutConfig";
import { AboutPage } from "@/components/sections/AboutPage";

export const metadata: Metadata = {
  title: `About | ${aboutConfig.displayName ?? aboutConfig.handle}`,
  description: aboutConfig.roleLine,
};

export default function Page() {
  return <AboutPage />;
}
