import { User, Mail, Phone, MapPin, Edit, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useState } from 'react';
import { AuthDialog } from '../components/AuthDialog';

export function ProfilePage() {
  const { mode, toggleMode, isAuthenticated, user } = useUser();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Show login prompt if not authenticated
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
          <AuthDialog 
            open={authDialogOpen} 
            onOpenChange={setAuthDialogOpen}
          />
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Profile
        </motion.h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 sm:p-8 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-green-600 text-white text-2xl">
                    {getInitials(user?.name || 'User')}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
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

          {/* Account Type Toggle */}
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

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 rounded-2xl">
              <h3 className="font-semibold text-lg mb-4">
                {mode === 'owner' ? 'Owner Statistics' : 'Guest Statistics'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mode === 'owner' ? (
                  <>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                        3
                      </p>
                      <p className="text-sm text-muted-foreground">Properties</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                        12
                      </p>
                      <p className="text-sm text-muted-foreground">Bookings</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                        4.7
                      </p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                        156
                      </p>
                      <p className="text-sm text-muted-foreground">Reviews</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                        8
                      </p>
                      <p className="text-sm text-muted-foreground">Bookings</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                        5
                      </p>
                      <p className="text-sm text-muted-foreground">Reviews</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                        3
                      </p>
                      <p className="text-sm text-muted-foreground">Favorites</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/50">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                        2
                      </p>
                      <p className="text-sm text-muted-foreground">Wishlist</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}