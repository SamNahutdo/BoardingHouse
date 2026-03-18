import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-8xl mb-6"
        >
          🏝️
        </motion.div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have drifted away like a boat
          in Bohol's beautiful waters.
        </p>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-full"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
