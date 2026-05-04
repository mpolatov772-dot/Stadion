import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const lineTransition = {
  duration: 2,
  ease: 'easeInOut',
};

const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.18 },
};

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[32px] border border-white/8 bg-[#0A0A0A] px-5 py-8 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,255,0,0.12),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(0,194,111,0.16),transparent_28%),linear-gradient(180deg,#0A0A0A_0%,#050505_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:54px_54px] opacity-40" />

      <svg
        viewBox="0 0 1200 760"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.rect
          x="70"
          y="80"
          width="1060"
          height="600"
          rx="18"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.15 }}
          animate={{ pathLength: 1, opacity: 0.75 }}
          transition={lineTransition}
        />
        <motion.path
          d="M600 80 L600 680"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.1 }}
          animate={{ pathLength: 1, opacity: 0.75 }}
          transition={{ ...lineTransition, delay: 0.15 }}
        />
        <motion.circle
          cx="600"
          cy="380"
          r="108"
          fill="none"
          stroke="#00C26F"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.18 }}
          animate={{ pathLength: 1, opacity: 0.65 }}
          transition={{ ...lineTransition, delay: 0.3 }}
        />
        <motion.rect
          x="70"
          y="220"
          width="168"
          height="320"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.1 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ ...lineTransition, delay: 0.45 }}
        />
        <motion.rect
          x="962"
          y="220"
          width="168"
          height="320"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.1 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ ...lineTransition, delay: 0.45 }}
        />
        <motion.circle
          cx="600"
          cy="380"
          r="8"
          fill="#C8FF00"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.95 }}
          transition={{ duration: 0.45, delay: 1.2 }}
        />
      </svg>

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />

      <div className="relative z-10 flex min-h-[calc(100vh-11rem)] flex-col items-center justify-center gap-10 text-center">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="heading-font max-w-5xl text-5xl uppercase leading-[0.9] text-white sm:text-7xl lg:text-[7.5rem]"
        >
          O&apos;YINNI
          <span className="block text-[#00C26F]">BOSHQA DARAJAGA</span>
          OLIB CHIQ
        </motion.h1>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <motion.div {...buttonMotion}>
            <Link
              to="/stadiums"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#00C26F] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black"
            >
              Stadion Band Qil
            </Link>
          </motion.div>
          <motion.div {...buttonMotion}>
            <a
              href="#latest-news"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/12 bg-[#111827] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white"
            >
              Yangiliklar
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
