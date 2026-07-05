"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from "recharts";

interface DataPoint {
  upvote_ratio: number;
  comment_count: number;
  flair: string;
  title: string;
  author: string;
  anomaly: boolean;
}

const EXCLUDED_USER = "joeyleq";

function generateSampleData(): DataPoint[] {
  const data: DataPoint[] = [];

  // Lebanese-flaired posts with anomalously low upvote ratios
  const lebaneseAnomalies = [
    { upvote_ratio: 0.18, comment_count: 45, title: "IDF killed 3 paramedics in double-tap yesterday", author: "EmperorChaos" },
    { upvote_ratio: 0.22, comment_count: 38, title: "Footage of IDF bulldozing homes in Bint Jbeil", author: "levnon14" },
    { upvote_ratio: 0.15, comment_count: 52, title: "Why does nobody here talk about Dahiyeh doctrine?", author: "cha3bghachim" },
    { upvote_ratio: 0.25, comment_count: 28, title: "Lebanese civilians shot trying to return home", author: "victoryismind" },
    { upvote_ratio: 0.12, comment_count: 62, title: "120 Israeli hasbara war rooms documented", author: "EmperorChaos" },
    { upvote_ratio: 0.20, comment_count: 35, title: "Litani River water theft evidence", author: "levnon14" },
    { upvote_ratio: 0.28, comment_count: 22, title: "UNIFIL confirms violation by IDF forces", author: "LevantinePlantCult" },
  ];

  // Normal posts (Israeli-flaired, high engagement, normal ratios)
  const normalPosts = [
    { upvote_ratio: 0.88, comment_count: 55, title: "What do Lebanese think about normalization?", author: "DaDerpyDude", flair: "Israeli" },
    { upvote_ratio: 0.82, comment_count: 40, title: "I visited Beirut before the war, beautiful city", author: "tFighterPilot", flair: "Israeli" },
    { upvote_ratio: 0.91, comment_count: 30, title: "Sending love from Tel Aviv ❤️", author: "OptimismNeeded", flair: "Israeli" },
    { upvote_ratio: 0.85, comment_count: 48, title: "Why can't we just be friends?", author: "amazing9999", flair: "Israeli" },
    { upvote_ratio: 0.79, comment_count: 35, title: "Lebanese food is the best in the world", author: "Tamtumtam", flair: "Israeli" },
    { upvote_ratio: 0.73, comment_count: 25, title: "Question about Lebanese politics", author: "IbnEzra613", flair: "Israeli" },
    { upvote_ratio: 0.68, comment_count: 42, title: "Hezbollah doesn't represent Lebanon", author: "ConnorStreetmann", flair: "No flair" },
    { upvote_ratio: 0.76, comment_count: 18, title: "Christians in Lebanon deserve better", author: "MajorTechnology8827", flair: "No flair" },
    { upvote_ratio: 0.84, comment_count: 33, title: "Iran is destroying Lebanon from within", author: "MuskyScent972", flair: "Israeli" },
    { upvote_ratio: 0.71, comment_count: 28, title: "Lebanon should make peace with Israel", author: "Worldineatydays", flair: "No flair" },
  ];

  lebaneseAnomalies.forEach((p) => {
    if (p.author.toLowerCase() !== EXCLUDED_USER) {
      data.push({ ...p, flair: "Lebanese", anomaly: true });
    }
  });

  normalPosts.forEach((p) => {
    if (p.author.toLowerCase() !== EXCLUDED_USER) {
      data.push({ ...p, anomaly: false });
    }
  });

  // Add some scatter noise
  for (let i = 0; i < 40; i++) {
    const isLeb = Math.random() > 0.7;
    data.push({
      upvote_ratio: isLeb ? 0.3 + Math.random() * 0.4 : 0.55 + Math.random() * 0.4,
      comment_count: Math.floor(5 + Math.random() * 50),
      flair: isLeb ? "Lebanese" : (Math.random() > 0.5 ? "Israeli" : "No flair"),
      title: "",
      author: "",
      anomaly: isLeb && Math.random() > 0.6,
    });
  }

  return data;
}

export function VoteAnomaly() {
  const data = useMemo(() => generateSampleData(), []);

  const lebaneseData = data.filter((d) => d.flair === "Lebanese");
  const israeliData = data.filter((d) => d.flair === "Israeli");
  const otherData = data.filter((d) => d.flair === "No flair");

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="upvote_ratio"
            type="number"
            domain={[0, 1]}
            tick={{ fill: "#666", fontSize: 10, fontFamily: "monospace" }}
            label={{ value: "Upvote Ratio", position: "bottom", fill: "#666", fontSize: 10 }}
            axisLine={{ stroke: "#333" }}
          />
          <YAxis
            dataKey="comment_count"
            type="number"
            tick={{ fill: "#666", fontSize: 10, fontFamily: "monospace" }}
            label={{ value: "Comment Count", angle: -90, position: "insideLeft", fill: "#666", fontSize: 10 }}
            axisLine={{ stroke: "#333" }}
          />
          <ZAxis range={[30, 80]} />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,30,0.95)",
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: 8,
              fontSize: 11,
              fontFamily: "monospace",
            }}

            formatter={(value, name) => [
              typeof value === "number" ? value.toFixed(2) : String(value ?? ""),
              String(name ?? ""),
            ]} />
          <ReferenceLine
            x={0.35}
            stroke="#ef4444"
            strokeDasharray="5 3"
            label={{ value: "ANOMALY THRESHOLD", position: "top", fill: "#ef4444", fontSize: 9 }}
          />
          <Scatter name="Lebanese" data={lebaneseData} fill="#ef4444" opacity={0.7} />
          <Scatter name="Israeli" data={israeliData} fill="#3b82f6" opacity={0.7} />
          <Scatter name="No flair" data={otherData} fill="#6b7280" opacity={0.5} />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="neo-inset p-4 space-y-2">
        <p className="text-[10px] font-mono text-rose-400 mb-2">ANOMALOUS POSTS (upvote ratio &lt;0.3 with &gt;20 comments)</p>
        {data
          .filter((d) => d.anomaly && d.title && d.comment_count > 20)
          .slice(0, 5)
          .map((d, i) => (
            <div key={i} className="text-xs text-gray-300">
              <span className="text-rose-400 mr-2">●</span>
              <span className="text-gray-500">
                [{(d.upvote_ratio * 100).toFixed(0)}%]
              </span>
              <span>{d.title}</span>{" "}
              <span className="text-gray-500">— u/{d.author}</span>
            </div>
          ))}
      </div>

      <div className="flex gap-4 justify-center text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Lebanese</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Israeli</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" /> No flair</span>
      </div>
    </div>
  );
}
