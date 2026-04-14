import { useState, useEffect } from 'react';
import { Calendar, User, DollarSign, Mail, Receipt, CreditCard, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Booking } from '../data/mockData';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useUser } from '../contexts/UserContext';
import { AuthDialog } from '../components/AuthDialog';
import { Button } from '../components/ui/button';
import { ensureSeedBookings, getStoredBookings } from '../data/bookingStorage';

export function BookingsPage() {
  const { isAuthenticated, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    ensureSeedBookings();

    const timer = setTimeout(() => {
      const allBookings = getStoredBookings();
      const userBookings = user
        ? allBookings.filter((booking) => booking.guestEmail === user.email)
        : [];
      setBookings(userBookings);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return '';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">📘</div>
          <h2 className="text-2xl font-bold mb-4">Sign in to view your bookings</h2>
          <p className="text-muted-foreground mb-6">
            Your booked list, payment details, and reservation receipts will appear here.
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Booked List
        </motion.h1>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 rounded-2xl">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))
          ) : bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground">
                When you book a boarding house, it will appear here with payment and receipt details.
              </p>
            </motion.div>
          ) : (
            bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{booking.propertyName}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            <Badge variant="secondary">
                              {booking.paymentMethod === 'online'
                                ? 'Online payment'
                                : 'Pay on-site'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{booking.guestName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{booking.guestEmail || user?.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right space-y-2">
                        <div className="flex items-center sm:justify-end gap-2">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
                          <span className="font-semibold text-green-600 dark:text-green-500">
                            ₱{booking.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center sm:justify-end gap-2 text-sm text-muted-foreground">
                          <Receipt className="h-4 w-4" />
                          <span>{booking.receiptSent ? 'Receipt sent to email' : 'Receipt pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-accent/40 p-4">
                        <div className="flex items-center gap-2 font-medium mb-2">
                          <CreditCard className="h-4 w-4" />
                          Payment setup
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.paymentMethod === 'online'
                            ? 'Reservation will be paid online and email confirmation is enabled.'
                            : 'You can proceed directly to the boarding house and settle on-site.'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-accent/40 p-4">
                        <div className="flex items-center gap-2 font-medium mb-2">
                          <FileText className="h-4 w-4" />
                          Booking description
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
