"use client";

import { motion } from "framer-motion";

interface Event {
  window_month: string;
  event_date: string;
  label: string;
  description: string;
  source_title?: string;
  source_url?: string;
}

interface Props {
  events: Event[];
}

export function EventCorrelation({ events }: Props) {
  return (
    <div className="relative">
      <div
        className="absolute left-[7px] top-1 bottom-1 w-px"
        style={{
          background:
            "linear-gradient(to bottom, rgba(62,230,193,0.5), rgba(255,77,94,0.5), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="space-y-3 pl-7 max-h-[440px] overflow-y-auto pr-2">
        {events.map((evt, i) => (
          <motion.div
            key={evt.event_date}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="relative group"
          >
            <span
              className="absolute -left-[24.5px] top-3 w-2 h-2 rounded-full bg-threat border border-background shadow-[0_0_8px_rgba(255,77,94,0.6)] group-hover:scale-150 transition-transform"
              aria-hidden="true"
            />
            <div className="rounded-md border border-borderc bg-black/25 p-3 group-hover:border-threat/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] tracking-[0.1em] text-threat bg-threat/10 px-1.5 py-0.5 rounded-[3px]">
                  {evt.event_date}
                </span>
                <span className="font-mono text-[10px] text-muted-2">
                  window {evt.window_month}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">{evt.label}</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">{evt.description}</p>
              {evt.source_url && (
                <a
                  href={evt.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1.5 font-mono text-[10px] tracking-[0.1em] text-primary/70 hover:text-primary transition-colors"
                >
                  SOURCE: {evt.source_title || evt.source_url} ↗
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
