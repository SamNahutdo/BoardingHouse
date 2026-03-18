import { Hero } from '../components/Hero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { StatsCard } from '../components/StatsCard';
import { DollarSign, Building2, Calendar, Star } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { ownerStats, mockProperties } from '../data/mockData';
import { motion } from 'motion/react';

export function HomePage() {
  const { mode } = useUser();

  if (mode === 'owner') {
    const ownerProperties = mockProperties.filter((p) => p.ownerId === 'owner1');

    return (
      <div className="min-h-screen bg-background">
        <Hero />

        {/* Stats Section */}
        <section className="py-12 bg-accent/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold mb-6"
            >
              Your Statistics
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        </section>

        {/* Your Properties */}
        <FeaturedProperties
          title="Your Properties"
          limit={3}
          showViewAll={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeaturedProperties limit={6} />
    </div>
  );
}
