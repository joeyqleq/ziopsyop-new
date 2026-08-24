"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Cpu,
  Database,
  Eye,
  Radio,
  ScanSearch,
  Server,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { TracedCard } from "@/components/fx/TracedCard";
import { AsciiSignalField } from "@/components/support/AsciiSignalField";
import { trackEvent } from "@/lib/analytics";
import { BrandedText } from "@/components/BrandedText";

const TRON_ADDRESS = "TLQro76K8ASUKvenz3fiyCSM5N4uGwK1ho";
const POLYGON_ADDRESS = "0x12081a23789f0034638B102b53056334564eE678";

const COSTS = [
  { icon: Cpu, label: "AI agents and API calls" },
  { icon: Eye, label: "Vision-model training" },
  { icon: Server, label: "Hosting and infrastructure" },
  { icon: Database, label: "Databases and source storage" },
  { icon: ScanSearch, label: "Footage review and manual analysis" },
  { icon: Radio, label: "Research, writing, and verification" },
];

function CopyButton({ value, network }: { value: string; network: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    trackEvent("support_crypto_copy", { network });
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-10 items-center gap-2 rounded border border-archive/30 px-3 font-mono text-[9px] tracking-[0.16em] text-archive transition-colors hover:border-archive/70 hover:bg-archive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-archive"
      aria-label={`Copy ${network} wallet address`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "COPIED" : "COPY ADDRESS"}
    </button>
  );
}

function CryptoCard({
  network,
  standard,
  address,
  qr,
}: {
  network: string;
  standard: string;
  address: string;
  qr: string;
}) {
  return (
    <TracedCard traceColor="var(--archive)" className="grid h-full gap-5 p-5 sm:grid-cols-[132px_1fr] md:p-6">
      <div className="relative mx-auto aspect-square w-[132px] overflow-hidden rounded border border-archive/25 bg-white p-2">
        <Image src={qr} alt={`${network} wallet QR code`} fill sizes="132px" className="object-contain p-2" />
      </div>
      <div className="min-w-0 self-center">
        <p className="font-mono text-[8px] tracking-[0.24em] text-muted-2">CRYPTO // DIRECT</p>
        <h2 aria-label={network} className="mt-2 font-mono text-lg font-semibold tracking-[0.08em] text-foreground">
          <BrandedText text={network} />
        </h2>
        <p className="mt-1 font-mono text-[9px] tracking-[0.18em] text-archive">{standard}</p>
        <p className="mt-4 break-all font-mono text-[10px] leading-relaxed text-muted" title={address}>
          {address}
        </p>
        <div className="mt-4">
          <CopyButton value={address} network={network} />
        </div>
      </div>
    </TracedCard>
  );
}

export function SupportExperience() {
  return (
    <PageShell backdrop="none">
      <section className="relative flex min-h-[72svh] items-center overflow-hidden border-b border-borderc px-4 pb-20 pt-28 md:px-6">
        <AsciiSignalField />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_58%_46%,transparent_0,rgba(6,6,8,0.18)_34%,rgba(6,6,8,0.92)_78%)]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative z-10 mx-auto w-full max-w-5xl"
        >
          <div aria-label="INDEPENDENT // UNFUNDED // LEBANON" className="flex items-center gap-3 font-mono text-[9px] tracking-[0.32em] text-archive">
            <span className="h-px w-10 bg-archive/70" />
            <BrandedText text="INDEPENDENT // UNFUNDED // LEBANON" />
          </div>
          <h1 aria-label="FUND THE COUNTER-SIGNAL" className="mt-7 max-w-4xl font-mono text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl md:text-7xl">
            <BrandedText text="FUND THE" />
            <span className="mt-2 block text-archive"><BrandedText text="COUNTER-SIGNAL" /></span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Help keep an independent Lebanese forensic project online, investigating, and building evidence against Israel&apos;s propaganda apparatus.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#methods"
              aria-label="SUPPORT THE WORK"
              className="inline-flex min-h-11 items-center gap-2 rounded border border-archive bg-archive px-5 font-mono text-[10px] font-semibold tracking-[0.18em] text-background transition-colors hover:bg-foreground"
            >
              <BrandedText text="SUPPORT THE WORK" /> <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="/about"
              aria-label="WHO IS BEHIND THIS"
              className="inline-flex min-h-11 items-center rounded border border-borderc bg-background/50 px-5 font-mono text-[10px] tracking-[0.18em] text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <BrandedText text="WHO IS BEHIND THIS" />
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <section className="grid gap-10 lg:grid-cols-[1.45fr_0.8fr] lg:gap-16" aria-labelledby="why-support">
          <article>
            <p className="font-mono text-[9px] tracking-[0.3em] text-archive">01 // WHY THIS EXISTS</p>
            <h2 id="why-support" className="mt-4 max-w-3xl font-mono text-2xl font-semibold leading-tight text-foreground md:text-3xl">
              A personal contribution to exposing, dismantling, and debunking Israel&apos;s propaganda.
            </h2>
            <div className="mt-7 space-y-5 text-[15px] leading-7 text-muted">
              <p>
                I built ZIOPSYOP for one reason: to expose, dismantle, and debunk Israel&apos;s propaganda
                about Lebanon, the resistance, and the wars it wages while insisting on its own moral innocence.
                This is personal. Israel has killed my people — not metaphorically.
              </p>
              <p>
                In the last year alone, Israel has killed over{" "}
                <strong className="text-foreground">200 journalists</strong> and more than{" "}
                <strong className="text-foreground">1,000 healthcare workers</strong> across Lebanon and Gaza —
                a documented, systematic targeting of the people whose job is to bear witness and to save lives.
                These are not collateral casualties. They are a pattern.
              </p>
              <p>
                I want to continue this AI-powered resistance for as long as I can. Running it costs real money:
                thousands of AI API calls, model experimentation, vision processing, infrastructure,
                databases, source gathering, and manual verification. The bill is measurable. The motivation is not negotiable.
              </p>
              <p className="border-l border-archive/55 pl-5 text-foreground">
                If this work helped you see through the apparatus — and you want me to keep building — you are
                welcome to help keep the counter-signal alive. I am grateful for any support, in any form.
              </p>
              <p>
                A note on security: I cannot associate my identity with PayPal, Ko-fi, or any traceable
                payment rail without compromising my operational security. If you want to support this work,
                crypto is the clean route. Alternatively — and this matters just as much — drop me a message
                through the contact form. The connection is end-to-end encrypted. Even a word of solidarity
                costs nothing and means everything.
              </p>
            </div>
          </article>

          <aside>
            <p aria-label="WHAT SUPPORT CARRIES" className="font-mono text-[9px] tracking-[0.3em] text-muted-2">
              <BrandedText text="WHAT SUPPORT CARRIES" />
            </p>
            <div className="mt-4 divide-y divide-borderc border-y border-borderc">
              {COSTS.map(({ icon: Icon, label }, index) => (
                <div key={label} className="flex items-center gap-3 py-3.5">
                  <span className="font-mono text-[8px] tabular-nums text-muted-2">{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={14} className="text-archive" />
                  <span className="text-xs text-muted">{label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="methods" className="scroll-mt-24 pt-20" aria-labelledby="support-methods">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-archive">02 // SUPPORT CHANNELS</p>
              <h2 id="support-methods" aria-label="CHOOSE A ROUTE" className="mt-3 font-mono text-2xl font-semibold text-foreground md:text-3xl">
                <BrandedText text="CHOOSE A ROUTE" />
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-muted">No account is required for the crypto routes. Always verify the full address shown beside the QR before sending.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <CryptoCard network="TRON" standard="USDT // TRC-20" address={TRON_ADDRESS} qr="/images/support/qr-tron.png" />
            <CryptoCard network="POLYGON" standard="USDT // POLYGON" address={POLYGON_ADDRESS} qr="/images/support/qr-polygon.png" />
          </div>
        </section>

        <section className="mt-20 text-center">
          <Radio size={18} className="mx-auto text-archive" />
          <p aria-label="NO SPONSORS. NO EDITORIAL BOARD. NO INSTITUTIONAL BUFFER. JUST THE WORK—AND THE PEOPLE WHO CHOOSE TO KEEP IT ALIVE." className="mx-auto mt-4 max-w-xl font-mono text-xs leading-relaxed tracking-[0.1em] text-muted">
            <BrandedText text="NO SPONSORS. NO EDITORIAL BOARD. NO INSTITUTIONAL BUFFER. JUST THE WORK—AND THE PEOPLE WHO CHOOSE TO KEEP IT ALIVE." />
          </p>
        </section>
      </div>
    </PageShell>
  );
}
