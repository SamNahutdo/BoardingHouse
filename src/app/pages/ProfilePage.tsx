import { User, Mail, Phone, MapPin, Edit, Users, Clock3, BookOpenText } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useEffect, useMemo, useState } from 'react';
import { AuthDialog } from '../components/AuthDialog';
import { Booking } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { ensureSeedBookings, getStoredBookings } from '../data/bookingStorage';

export function ProfilePage() {
  const { mode, toggleMode, isAuthenticated, user } = useUser();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    ensureSeedBookings();
    const allBookings = getStoredBookings();
    const userBookings = user
      ? allBookings.filter((booking) => booking.guestEmail === user.email)
      : [];
    setBookings(userBookings);
  }, [user]);

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending'),
    [bookings],
  );

  const bookedList = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === 'pending' || booking.status === 'confirmed',
      ),
    [bookings],
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to manage your bookings and properties.
          </p>
          <Button
            onClick={() => setAuthDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Sign In / Sign Up
          </Button>
          <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Profile
        </motion.h1>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 sm:p-8 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-green-600 text-white text-2xl">
                    {getInitials(user?.name || 'User')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                      <p className="text-muted-foreground capitalize">
                        {user?.accountType === 'owner' ? 'Property Owner' : 'Guest'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>+63 912 345 6789</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Tagbilaran City, Bohol</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 rounded-2xl">
              <h3 className="font-semibold text-lg mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">Account Type</Label>
                      <p className="text-sm text-muted-foreground">
                        {mode === 'owner'
                          ? 'You can manage properties and bookings'
                          : 'You can search and book properties'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {mode === 'user' ? 'Guest' : 'Owner'}
                    </span>
                    <Switch checked={mode === 'owner'} onCheckedChange={toggleMode} />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Clock3 className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-lg">Pending books</h3>
              </div>

              {pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending books right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="rounded-xl bg-accent/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="font-medium">{booking.propertyName}</div>
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.description || 'Pending reservation awaiting completion.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <BookOpenText className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Booked list</h3>
              </div>

              {bookedList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your active bookings will appear here after you book a boarding house.
                </p>
              ) : (
                <div className="space-y-3">
                  {bookedList.map((booking) => (
                    <div key={booking.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="font-medium">{booking.propertyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {booking.paymentMethod === 'online'
                            ? 'Online payment'
                            : 'Pay on-site'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.description || 'No booking description provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
