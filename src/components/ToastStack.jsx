import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastStack() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="glass-panel rounded-3xl p-4"
          >
            <div className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-glow">
                {toast.tone === 'mint' ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
              </span>
              <span>
                <span className="block text-sm font-black text-slate-950 dark:text-white">{toast.title}</span>
                <span className="mt-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{toast.body}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
