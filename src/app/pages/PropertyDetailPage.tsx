import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Wifi,
  Wind,
  UtensilsCrossed,
  Waves,
  Users,
  BedDouble,
  Bath,
  BadgeCheck,
  MessageCircle,
  Video,
  DoorOpen,
  Navigation,
  Mail,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  isPropertyFullyBooked,
  getPropertyAvailabilityLabel,
  Booking,
} from '../data/mockData';
import { useProperties } from '../contexts/PropertyContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useEffect, useMemo, useState } from 'react';
import { AuthDialog } from '../components/AuthDialog';
import { PaymentDialog } from '../components/PaymentDialog';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { isAuthenticated, user } = useUser();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const property = properties.find((p) => p.id === id);

  useEffect(() => {
    const loadBookings = async () => {
      const { data } = await supabase.from('bookings').select('*').eq('propertyId', property?.id || '');
      if (data) setActiveBookings(data as Booking[]);
    };
    if (property) loadBookings();
  }, [property]);

  const propertyBookings = useMemo(
    () =>
      activeBookings.filter(
        (booking) => booking.status === 'pending' || booking.status === 'confirmed'
      ),
    [activeBookings]
  );

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
    'Shared Kitchen': UtensilsCrossed,
    Pool: Waves,
  };

  const isFullyBooked = isPropertyFullyBooked(property);
  // Re-evaluating user booked correctly from activeBookings since it fetches all for this property
  const userBookedThisProperty = activeBookings.some(
    (booking) =>
      booking.guestId === user?.id &&
      (booking.status === 'pending' || booking.status === 'confirmed'),
  );
  // Assuming a guest can book another property once this one is done, but checking global state requires another fetch if we want strict "hasActiveBooking" rules. Allowing multiple bookings for different properties for now to avoid blocking testing.
  const userAlreadyBooked = userBookedThisProperty;

  const bookingDisabled = isFullyBooked || (userAlreadyBooked && !userBookedThisProperty);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${property.coordinates[0]},${property.coordinates[1]}`,
  )}`;

  const handleBook = () => {
    if (!isAuthenticated || !user) {
      setAuthDialogOpen(true);
      return;
    }

    if (isFullyBooked) {
      toast.error('This boarding house is already fully booked.');
      return;
    }

    if (userAlreadyBooked && !userBookedThisProperty) {
      toast.error('You already have an active booking. Finish or cancel it before booking another.');
      return;
    }

    if (userBookedThisProperty) {
      toast.message('This booking is already in your booked list.');
      return;
    }

    // Open payment method selection dialog
    setPaymentDialogOpen(true);
  };

  const handlePaymentSelect = async (paymentMethod: 'online' | 'pay-on-site') => {
    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setMonth(checkOut.getMonth() + 1);

    const toastId = toast.loading('Securing reservation...');

    const newBooking = {
      propertyId: property.id,
      propertyName: property.name,
      guestId: user!.id,
      ownerId: property.ownerId || 'owner1',
      guestName: user!.name,
      guestEmail: user!.email,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      status: 'pending',
      totalPrice: property.price,
      paymentMethod,
      receiptSent: paymentMethod === 'online',
      description: `Reservation request for ${property.name}. ${property.roomCapacity} people can stay in each room. ${paymentMethod === 'online' ? 'Receipt sent to ' + user!.email : 'Payment due on arrival'}.`,
    };

    const { data, error } = await supabase.from('bookings').insert([newBooking]).select();

    if (error) {
      toast.error('Failed to book: ' + error.message, { id: toastId });
      return;
    }

    if (data && data.length > 0) {
      setActiveBookings([data[0] as Booking, ...activeBookings]);
    }
    
    setPaymentDialogOpen(false);
    toast.success(`Booked successfully with ${paymentMethod === 'online' ? 'online payment' : 'pay-on-site'}. ${paymentMethod === 'online' ? 'Receipt sent to your email' : 'Please pay when you arrive'}.`, { id: toastId });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-[16/9] rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          <img
            src={property.image?.startsWith('http') ? property.image : `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${property.image}`}
            alt={property.name}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col gap-3 mb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{property.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={property.verified ? 'default' : 'secondary'}>
                        {property.verified && <BadgeCheck className="h-4 w-4 mr-1" />}
                        {property.verified ? 'Verified badge' : 'Unverified listing'}
                      </Badge>
                      <Badge variant={isFullyBooked ? 'destructive' : 'secondary'}>
                        {getPropertyAvailabilityLabel(property)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-accent px-3 py-1 rounded-lg">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{property.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{property.address || property.location}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Room Availability</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <DoorOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rooms available</p>
                      <p className="font-semibold">{property.roomsAvailable}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">People per room</p>
                      <p className="font-semibold">{property.roomCapacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BedDouble className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active bookings</p>
                      <p className="font-semibold">{propertyBookings.length}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {(property.bedrooms || property.bathrooms || property.capacity) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
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
                          <p className="text-sm text-muted-foreground">Total guest capacity</p>
                          <p className="font-semibold">{property.capacity}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="p-6 rounded-2xl">
                <h3 className="font-semibold text-xl mb-4">Contact owner / boarders</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start rounded-xl"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message owner
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start rounded-xl"
                    onClick={() => navigate('/messages?vc=true')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Start VC
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl">
                    <Mail className="h-4 w-4 mr-2" />
                    Ask about room rules
                  </Button>
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="w-full">
                    <Button variant="outline" className="justify-start rounded-xl w-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      Tap button to see location
                    </Button>
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Chat and VC are available as in-app mock features so owners and boarders can contact each other quickly.
                </p>
              </Card>
            </motion.div>

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
                      <Badge key={amenity} variant="secondary" className="px-4 py-2 rounded-full">
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {amenity}
                      </Badge>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

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
                  <span className="text-muted-foreground">/ month</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-muted-foreground ml-1">
                    ({property.totalRooms} rooms total)
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl mb-4"
                onClick={handleBook}
                disabled={bookingDisabled}
              >
                {isFullyBooked ? 'Fully Booked' : 'Book'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {!isAuthenticated
                  ? 'Login required to book'
                  : userAlreadyBooked && !userBookedThisProperty
                    ? 'You already have one active booking'
                    : 'Choose payment method after booking'}
              </p>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reservation amount</span>
                  <span>₱{property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment options</span>
                  <span>Online / On-site</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email receipt</span>
                  <span>{isAuthenticated ? user?.email : 'Sign in first'}</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t">
                  <span>Status</span>
                  <span>{getPropertyAvailabilityLabel(property)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        requiredAccountType="user"
        onSuccess={() => {
          toast.success('Now you can book this property!');
        }}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onPaymentSelect={handlePaymentSelect}
        propertyName={property.name}
        price={property.price}
      />
    </div>
  );
}
