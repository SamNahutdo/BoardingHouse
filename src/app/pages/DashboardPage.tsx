import { DollarSign, Building2, Calendar, Star, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { StatsCard } from '../components/StatsCard';
import { ownerStats, mockBookings } from '../data/mockData';
import { Card } from '../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DashboardPage() {
  // Mock earnings data
  const earningsData = [
    { month: 'Jan', earnings: 12000 },
    { month: 'Feb', earnings: 15000 },
    { month: 'Mar', earnings: 18000 },
  ];

  // Mock bookings data
  const bookingsData = [
    { month: 'Jan', bookings: 8 },
    { month: 'Feb', bookings: 10 },
    { month: 'Mar', bookings: 12 },
  ];

  const recentBookings = mockBookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Dashboard
        </motion.h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Earnings"
            value={`₱${ownerStats.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            trend="+12% from last month"
            color="green"
            delay={0}
          />
          <StatsCard
            title="Active Properties"
            value={ownerStats.activeProperties}
            icon={Building2}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Active Bookings"
            value={ownerStats.activeBookings}
            icon={Calendar}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            title="Average Rating"
            value={ownerStats.averageRating}
            icon={Star}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
                <h3 className="font-semibold text-lg">Earnings Overview</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Bookings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                <h3 className="font-semibold text-lg">Bookings Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="hsl(var(--chart-2))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <h3 className="font-semibold text-lg">Recent Bookings</h3>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-accent/50"
                >
                  <div>
                    <p className="font-medium">{booking.propertyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guestName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-500">
                      ₱{booking.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
