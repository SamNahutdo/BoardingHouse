import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';
import { mockProperties } from '../data/mockData';
import { Button } from './ui/button';

interface FeaturedPropertiesProps {
  title?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function FeaturedProperties({
  title = 'Featured Properties',
  limit,
  showViewAll = true,
}: FeaturedPropertiesProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState(mockProperties);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const displayedProperties = limit ? properties.slice(0, limit) : properties;

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold"
          >
            {title}
          </motion.h2>
          {showViewAll && limit && (
            <Button
              variant="ghost"
              className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400"
              onClick={() => navigate('/search')}
            >
              View All
            </Button>
          )}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: limit || 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            : displayedProperties.map((property, index) => (
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
        {!loading && displayedProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
