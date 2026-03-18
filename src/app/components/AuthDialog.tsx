import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { User, Home } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
  requiredAccountType?: 'user' | 'owner';
  onSuccess?: () => void;
}

export function AuthDialog({ 
  open, 
  onOpenChange, 
  defaultTab = 'login',
  requiredAccountType,
  onSuccess 
}: AuthDialogProps) {
  const { login, signup } = useUser();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [accountType, setAccountType] = useState<'user' | 'owner'>(requiredAccountType || 'user');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const success = await login(loginEmail, loginPassword, accountType);
      
      if (success) {
        toast.success(`Welcome back! Logged in as ${accountType}`);
        onOpenChange(false);
        resetForms();
        onSuccess?.();
      } else {
        toast.error('Invalid credentials. Please check your email, password, and account type.');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSignupLoading(true);

    try {
      const success = await signup(signupEmail, signupPassword, signupName, accountType);
      
      if (success) {
        toast.success(`Account created successfully! Welcome, ${signupName}`);
        onOpenChange(false);
        resetForms();
        onSuccess?.();
      } else {
        toast.error('Email already exists. Please login instead.');
      }
    } catch (error) {
      toast.error('An error occurred during signup');
    } finally {
      setSignupLoading(false);
    }
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to BOHOL Board</DialogTitle>
          <DialogDescription>
            {requiredAccountType === 'owner' 
              ? 'Sign up or log in as an owner to manage your properties'
              : 'Sign up or log in to book your perfect boarding house'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Account Type Selection */}
          {!requiredAccountType && (
            <div className="mt-4">
              <Label className="text-sm mb-2 block">Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setAccountType('user')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    accountType === 'user' 
                      ? 'border-green-600 bg-green-50 dark:bg-green-950' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">User</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setAccountType('owner')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    accountType === 'owner' 
                      ? 'border-green-600 bg-green-50 dark:bg-green-950' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span className="text-sm font-medium">Owner</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={signupLoading}
              >
                {signupLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
