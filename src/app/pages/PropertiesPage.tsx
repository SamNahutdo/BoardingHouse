import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { mockProperties } from '../data/mockData';
import { Button } from '../components/ui/button';

export function PropertiesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Filter properties owned by the current owner
  const ownerProperties = mockProperties.filter((p) => p.ownerId === 'owner1');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold"
          >
            Your Properties
          </motion.h1>
          <Button
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-full"
            onClick={() => navigate('/add-property')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            : ownerProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => handlePropertyClick(property.id)}
                  />
                </motion.div>
              ))}
        </div>

        {/* Empty State */}
        {!loading && ownerProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first property
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              onClick={() => navigate('/add-property')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
