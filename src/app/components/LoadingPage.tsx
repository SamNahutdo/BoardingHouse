import { motion } from 'motion/react';

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="text-6xl mb-4"
        >
          🏝️
        </motion.div>
        <h2 className="text-xl font-semibold">
          <span className="text-green-600 dark:text-green-500">BOHOL</span> Board
        </h2>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </motion.div>
    </div>
  );
}
