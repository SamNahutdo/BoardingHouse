import { Link, useLocation } from 'react-router';
import { X, Home, Map, Search, User, Building2, Calendar, LayoutDashboard, PlusCircle, Users, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../contexts/UserContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { useState } from 'react';
import { AuthDialog } from './AuthDialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { mode, toggleMode, isAuthenticated, user, logout } = useUser();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const userMenuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const ownerMenuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/properties', label: 'Properties', icon: Building2 },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/add-property', label: 'Add Property', icon: PlusCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const menuItems = mode === 'user' ? userMenuItems : ownerMenuItems;

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    onClose();
  };

  const handleAuthClick = () => {
    setAuthDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-background border-r z-50 shadow-xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/" onClick={handleLinkClick} className="font-bold text-xl">
                  <span className="text-green-600 dark:text-green-500">BOHOL</span> Board
                </Link>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              {isAuthenticated && (
                <div className="p-4 border-b bg-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium text-sm">
                      {mode === 'user' ? 'Guest Mode' : 'Owner Mode'}
                    </span>
                  </div>
                  <Switch checked={mode === 'owner'} onCheckedChange={toggleMode} />
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <Link to={item.path} onClick={handleLinkClick}>
                          <motion.div
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                              isActive(item.path)
                                ? 'bg-green-600 text-white dark:bg-green-500'
                                : 'hover:bg-accent'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </motion.div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Auth Button */}
                <div className="mt-4 pt-4 border-t">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={handleAuthClick}
                    >
                      <LogIn className="h-5 w-5 mr-3" />
                      Login / Sign Up
                    </Button>
                  )}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  © 2026 BOHOL Board. All rights reserved.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
    </>
  );
}