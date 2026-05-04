import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

export function LiveTicker({ items }) {
  const marqueeItems = [...items, ...items];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07090f] p-4 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex shrink-0 items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00FF87]/12 text-[#00FF87] shadow-[0_0_18px_rgba(0,255,135,0.18)]">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#8cffc2]">Live scores</p>
            <h2 className="heading-font text-2xl uppercase text-white">Matchday Ticker</h2>
          </div>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03]">
          <div className="goalx-marquee flex w-max items-center gap-4 px-4 py-4">
            {marqueeItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex min-w-[280px] items-center justify-between gap-4 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">{item.league}</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {item.home} <span className="text-[#00FF87]">{item.score}</span> {item.away}
                  </p>
                </div>
                <span className="rounded-full border border-[#00FF87]/20 bg-[#00FF87]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#8cffc2]">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
