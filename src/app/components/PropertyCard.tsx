import { motion } from 'motion/react';
import { Star, MapPin, BadgeCheck, Users } from 'lucide-react';
import {
  Property,
  getPropertyAvailabilityLabel,
  isPropertyFullyBooked,
} from '../data/mockData';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const fullyBooked = isPropertyFullyBooked(property);

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
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={property.image?.startsWith('http') ? property.image : `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${property.image}`}
            alt={property.name}
            className="w-full h-full object-cover object-center lg:group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{property.rating}</span>
          </div>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant={property.verified ? 'default' : 'secondary'}>
              {property.verified && <BadgeCheck className="h-3.5 w-3.5 mr-1" />}
              {property.verified ? 'Verified' : 'Unverified'}
            </Badge>
            {fullyBooked && <Badge variant="destructive">Fully booked</Badge>}
            {property.moveInReady && <Badge className="bg-blue-500 hover:bg-blue-600">Move-in Ready</Badge>}
            {property.studentFriendly && <Badge className="bg-purple-500 hover:bg-purple-600">Student Friendly</Badge>}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm line-clamp-1">{property.location}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {property.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Users className="h-4 w-4" />
            <span>
              {getPropertyAvailabilityLabel(property)} • {property.roomCapacity} people per room
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-green-600 dark:text-green-500">
              ₱{property.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
