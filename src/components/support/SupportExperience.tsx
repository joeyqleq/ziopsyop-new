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
  ExternalLink,
  Eye,
  Radio,
  ScanSearch,
  Server,
  WalletCards,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { TracedCard } from "@/components/fx/TracedCard";
import { AsciiSignalField } from "@/components/support/AsciiSignalField";
import { trackEvent } from "@/lib/analytics";

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

function PaymentLink({
  label,
  href,
  note,
}: {
  label: string;
  href: string;
  note: string;
}) {
  return (
    <TracedCard traceColor="var(--archive)" className="group flex h-full flex-col p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded border border-archive/30 bg-archive/10 text-archive">
          <WalletCards size={18} />
        </span>
        <span className="font-mono text-[8px] tracking-[0.24em] text-muted-2">US PAYMENT RAIL</span>
      </div>
      <h2 className="mt-8 font-mono text-xl font-semibold tracking-[0.08em] text-foreground">{label}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("support_payment_open", { method: label.toLowerCase() })}
        className="mt-auto inline-flex min-h-11 items-center justify-between border-t border-borderc pt-5 font-mono text-[10px] tracking-[0.2em] text-archive transition-colors group-hover:text-foreground"
      >
        OPEN {label.toUpperCase()}
        <ExternalLink size={13} />
      </a>
    </TracedCard>
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
        <h2 className="mt-2 font-mono text-lg font-semibold tracking-[0.08em] text-foreground">{network}</h2>
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
          <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.32em] text-archive">
            <span className="h-px w-10 bg-archive/70" />
            INDEPENDENT // UNFUNDED // LEBANON
          </div>
          <h1 className="mt-7 max-w-4xl font-mono text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl md:text-7xl">
            FUND THE
            <span className="mt-2 block text-archive">COUNTER-SIGNAL</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Help keep an independent Lebanese forensic project online, investigating, and building evidence against Israel&apos;s propaganda apparatus.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#methods"
              className="inline-flex min-h-11 items-center gap-2 rounded border border-archive bg-archive px-5 font-mono text-[10px] font-semibold tracking-[0.18em] text-background transition-colors hover:bg-foreground"
            >
              SUPPORT THE WORK <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center rounded border border-borderc bg-background/50 px-5 font-mono text-[10px] tracking-[0.18em] text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              WHO IS BEHIND THIS
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
                I built ZIOPSYOP for one reason: to expose, dismantle, and debunk Israel&apos;s propaganda about Lebanon, the resistance, and the wars Israel wages while insisting on its own moral innocence.
              </p>
              <p>
                This is my personal contribution—built from Lebanon, from the heart, and without a party, NGO, government, state actor, sponsor, or editorial board behind it.
              </p>
              <p>
                The finished site hides the real cost: thousands of agent and AI API calls, model experimentation, vision-model training, hosting, databases, infrastructure, source gathering, watching and classifying hours of footage, cross-referencing records, writing, designing, and manually checking what the machines could not. The bill is measurable. The effort honestly is not.
              </p>
              <p className="border-l border-archive/55 pl-5 text-foreground">
                If this work helped you see through Israel&apos;s information apparatus—and you want me to keep building investigations like it—you are welcome to help keep the counter-signal alive.
              </p>
            </div>
          </article>

          <aside>
            <p className="font-mono text-[9px] tracking-[0.3em] text-muted-2">WHAT SUPPORT CARRIES</p>
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

        <section className="mt-20 border border-archive/25 bg-archive/[0.035] p-6 md:p-8" aria-labelledby="lebanon-access">
          <div className="grid gap-5 md:grid-cols-[180px_1fr]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] text-archive">PAYMENT ACCESS</p>
              <h2 id="lebanon-access" className="mt-2 font-mono text-lg font-semibold text-foreground">WHY A US INTERMEDIARY?</h2>
            </div>
            <div className="space-y-4 text-sm leading-6 text-muted">
              <p>
                Lebanon is effectively excluded from many major payment rails. Stripe, PayPal, Payoneer, and similar providers do not give me a workable Lebanese onboarding and receiving route.
              </p>
              <p>
                For Ko-fi and PayPal, a trusted person in the United States receives the contribution and transfers it to me. Crypto is received directly. This is personal support for independent research, not a charitable donation, and no tax receipt is issued.
              </p>
            </div>
          </div>
        </section>

        <section id="methods" className="scroll-mt-24 pt-20" aria-labelledby="support-methods">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-archive">02 // SUPPORT CHANNELS</p>
              <h2 id="support-methods" className="mt-3 font-mono text-2xl font-semibold text-foreground md:text-3xl">CHOOSE A ROUTE</h2>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-muted">No account is required for the crypto routes. Always verify the full address shown beside the QR before sending.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <PaymentLink label="Ko-fi" href="https://ko-fi.com/poi5on" note="One-time support through the project Ko-fi page. Received by the trusted US intermediary and forwarded to Lebanon." />
            <PaymentLink label="PayPal" href="https://www.paypal.me/joeyq2" note="Direct PayPal support through the US receiving account, then transferred to me in Lebanon." />
            <CryptoCard network="TRON" standard="USDT // TRC-20" address={TRON_ADDRESS} qr="/images/support/qr-tron.png" />
            <CryptoCard network="POLYGON" standard="USDT // POLYGON" address={POLYGON_ADDRESS} qr="/images/support/qr-polygon.png" />
          </div>
        </section>

        <section className="mt-20 text-center">
          <Radio size={18} className="mx-auto text-archive" />
          <p className="mx-auto mt-4 max-w-xl font-mono text-xs leading-relaxed tracking-[0.1em] text-muted">
            NO SPONSORS. NO EDITORIAL BOARD. NO INSTITUTIONAL BUFFER. JUST THE WORK—AND THE PEOPLE WHO CHOOSE TO KEEP IT ALIVE.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
