import { motion } from 'framer-motion';

export default function SectionHeader({ eyebrow, title, copy, action, inverse = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45 }}
      className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div className="max-w-3xl">
        {eyebrow && <p className="mini-badge mb-4">{eyebrow}</p>}
        <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${inverse ? 'text-white' : 'text-slate-950 dark:text-white'}`}>{title}</h2>
        {copy && (
          <p className={`mt-3 text-base font-medium leading-7 ${inverse ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
            {copy}
          </p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
