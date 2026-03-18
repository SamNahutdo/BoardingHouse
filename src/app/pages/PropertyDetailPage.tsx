import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Star, MapPin, Wifi, Wind, UtensilsCrossed, Waves, Users, BedDouble, Bath } from 'lucide-react';
import { motion } from 'motion/react';
import { mockProperties } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useState } from 'react';
import { AuthDialog } from '../components/AuthDialog';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">Property not found</h2>
          <p className="text-muted-foreground mb-4">
            The property you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const amenityIcons: { [key: string]: any } = {
    WiFi: Wifi,
    'Air Conditioning': Wind,
    Kitchen: UtensilsCrossed,
    Pool: Waves,
  };

  const handleReserve = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
    } else {
      toast.success('Booking confirmed! Check your bookings page.');
      // In a real app, you would create a booking here
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-[16/9] rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{property.name}</h1>
                <div className="flex items-center gap-1 bg-accent px-3 py-1 rounded-lg">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{property.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{property.location}</span>
              </div>
            </motion.div>

            {/* Property Details */}
            {(property.bedrooms || property.bathrooms || property.capacity) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 rounded-2xl">
                  <h3 className="font-semibold mb-4">Property Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Guests</p>
                          <p className="font-semibold">{property.capacity}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Description */}
            {property.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold text-xl mb-3">About this place</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </motion.div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="font-semibold text-xl mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="px-4 py-2 rounded-full"
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {amenity}
                      </Badge>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 rounded-2xl sticky top-24 border-2">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-500">
                    ₱{property.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-muted-foreground ml-1">
                    (24 reviews)
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl mb-4"
                onClick={handleReserve}
              >
                Reserve
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {isAuthenticated ? "You won't be charged yet" : "Login required to book"}
              </p>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₱{property.price.toLocaleString()} × 3 nights
                  </span>
                  <span>₱{(property.price * 3).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span>₱{Math.round(property.price * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t">
                  <span>Total</span>
                  <span>
                    ₱
                    {(property.price * 3 + Math.round(property.price * 0.15)).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        requiredAccountType="user"
        onSuccess={() => {
          toast.success('Now you can book this property!');
        }}
      />
    </div>
  );
}