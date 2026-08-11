import type { Metadata } from "next";
import { SupportExperience } from "@/components/support/SupportExperience";

export const metadata: Metadata = {
  title: "Fund the Counter-Signal",
  description:
    "Support ZIOPSYOP's independent Lebanese research exposing and debunking Israel's propaganda apparatus.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <SupportExperience />;
}
