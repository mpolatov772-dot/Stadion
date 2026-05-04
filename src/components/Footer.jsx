import { Instagram, Send, Twitch, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import brandMark from '../assets/brand-mark.svg';

const footerLinks = [
  { label: 'Stadionlar', to: '/stadiums' },
  { label: 'Statistika', to: '/statistics' },
  { label: 'Do\'kon', to: '/store' },
  { label: 'Dashboard', to: '/dashboard' },
];

const socialLinks = [
  { label: 'Instagram', icon: Instagram },
  { label: 'Telegram', icon: Send },
  { label: 'YouTube', icon: Youtube },
  { label: 'Twitch', icon: Twitch },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="overflow-hidden rounded-[36px] border border-white/10 bg-[#05070c] px-6 py-8 shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:px-8 lg:px-10"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-3">
            <img src={brandMark} alt="GoalX logo" className="h-14 w-auto" />
            <div>
              <p className="heading-font text-3xl uppercase text-white">GoalX</p>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Play louder. Book smarter.</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            Premium football booking, live editorial energy, and next-gen matchday discovery for Uzbekistan and beyond.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:min-w-[420px]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#8cffc2]">Navigate</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 hover:border-[#00FF87]/30 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#8cffc2]">Social</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 hover:border-[#00FF87]/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
