"use client";

import { motion } from "framer-motion";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { StrikeTaxonomy } from "./StrikeTaxonomy";
import { DoubleTapPattern } from "./DoubleTapPattern";
import { IHLComplianceMatrix } from "./IHLComplianceMatrix";
import { CampaignTimeline } from "./CampaignTimeline";
import { CostROI } from "./CostROI";
import { HardwareAttrition } from "./HardwareAttrition";
import { AdmissionGap } from "./AdmissionGap";
import { DestructionAudit } from "./DestructionAudit";
import { MethodologySection } from "./MethodologySection";
import type { BattlefieldData } from "./BattlefieldSections";

function Act({ number, title, summary }: { number: string; title: string; summary: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="border-t border-borderc/60 pt-10"
    >
      <p className="font-mono text-[10px] tracking-[0.35em] text-primary/60">ACT {number}</p>
      <h2 className="mt-2 font-mono text-xl font-bold tracking-[0.15em] text-foreground uppercase md:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{summary}</p>
    </motion.header>
  );
}

/**
 * The evidence-first Part II cut. The full exhibit archive remains in the
 * repository; this live sequence keeps one chart per analytical job.
 */
export function BattlefieldCoreSections({ data }: { data: BattlefieldData }) {
  return (
    <div className="space-y-8">
      <MethodologySection />

      <Act
        number="I"
        title="Targeting and conduct"
        summary="Establish who was targeted, then test the documented conduct against the same legal framework."
      />
      <ChartFrame
        exhibit="EX-17"
        title="STRIKE TAXONOMY — TARGET CLASSIFICATION"
        subtitle="All confirmed Hezbollah strikes, classified by target type."
        classification="STRIKE LOG"
        commentary={{
          reads: "Confirmed strikes grouped by the class of target hit.",
          means: "The distribution establishes the targeting baseline before legal or moral claims are evaluated.",
          puzzle: "This is the factual layer against which the information campaign is tested.",
        }}
      >
        <StrikeTaxonomy data={data.taxonomy} />
      </ChartFrame>

      <ChartFrame
        exhibit="EX-20"
        title="THE DOUBLE-TAP DOCTRINE"
        subtitle="Documented incidents in which first responders were struck after arriving at an initial strike."
        accent="var(--threat)"
        classification="INCIDENT PATTERN"
      >
        <DoubleTapPattern data={data.doubleTap} />
      </ChartFrame>

      <ChartFrame
        exhibit="EX-22"
        title="IHL COMPLIANCE MATRIX"
        subtitle="A principle-by-principle legal audit with the underlying evidence in one place."
        accent="var(--archive)"
        classification="LEGAL AUDIT"
      >
        <IHLComplianceMatrix data={data.ihl} />
      </ChartFrame>

      <Act
        number="II"
        title="Sequence and destruction"
        summary="Connect events over time, then measure the physical outcome using independently verified destruction data."
      />
      <ChartFrame
        exhibit="EX-23"
        title="CAMPAIGN TIMELINE"
        subtitle="Political, military, battlefield and civilian events on one shared chronology."
        accent="var(--viz-blue)"
        classification="CHRONOLOGY"
      >
        <CampaignTimeline data={data.timeline} />
      </ChartFrame>

      <ChartFrame
        exhibit="EX-32"
        title="NOWHERE TO RETURN — SATELLITE-VERIFIED DESTRUCTION"
        subtitle="Village-level destruction verified through Amnesty evidence and satellite analysis."
        accent="var(--threat)"
        classification="DESTRUCTION AUDIT"
      >
        <DestructionAudit data={data.destruction} />
      </ChartFrame>

      <Act
        number="III"
        title="Cost, attrition and admission"
        summary="Close with three distinct tests: economic exchange, documented hardware loss and the gap between independent records and official admissions."
      />
      <ChartFrame
        exhibit="EX-24b"
        title="COST ROI — RETURN PER WEAPON"
        subtitle="Unit cost against estimated value destroyed, on a logarithmic scale."
        classification="ECONOMIC"
      >
        <CostROI data={data.costROI} />
      </ChartFrame>

      <ChartFrame
        exhibit="EX-25"
        title="IDF HARDWARE ATTRITION"
        subtitle="Documented equipment losses by class, shown by value or unit count."
        accent="var(--threat)"
        classification="BATTLE DAMAGE"
      >
        <HardwareAttrition data={data.hardware} />
      </ChartFrame>

      <ChartFrame
        exhibit="EX-27b"
        title="ADMISSION GAP — MULTI-SOURCE VERIFICATION"
        subtitle="Independent records compared with official claims; unlike denominators are kept visibly separate."
        accent="var(--threat)"
        classification="CROSS-REFERENCE"
      >
        <AdmissionGap data={data.admissionGap} />
      </ChartFrame>
    </div>
  );
}
