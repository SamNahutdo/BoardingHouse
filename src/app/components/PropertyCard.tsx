import { motion } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import { Property } from '../data/mockData';
import { Card } from './ui/card';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className="overflow-hidden cursor-pointer group border rounded-2xl"
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{property.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span className="text-sm line-clamp-1">{property.location}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-green-600 dark:text-green-500">
              ₱{property.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/ night</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
