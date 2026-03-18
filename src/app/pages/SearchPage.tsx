import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'motion/react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { mockProperties, Property } from '../data/mockData';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      filterProperties();
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, priceRange, minRating]);

  const filterProperties = () => {
    let filtered = mockProperties;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Rating filter
    filtered = filtered.filter((p) => p.rating >= minRating);

    setFilteredProperties(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    setLoading(true);
  };

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  const resetFilters = () => {
    setPriceRange([0, 5000]);
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-6"
          >
            Search Properties
          </motion.h1>

          <div className="flex gap-2 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search location, property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search results</SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}
                    </label>
                    <Slider
                      min={0}
                      max={5000}
                      step={100}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-2"
                    />
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Minimum Rating: {minRating.toFixed(1)}
                    </label>
                    <Slider
                      min={0}
                      max={5}
                      step={0.1}
                      value={[minRating]}
                      onValueChange={(val) => setMinRating(val[0])}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              {filteredProperties.length} propert
              {filteredProperties.length === 1 ? 'y' : 'ies'} found
            </motion.p>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            : filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => handlePropertyClick(property.id)}
                  />
                </motion.div>
              ))}
        </div>

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                resetFilters();
              }}
            >
              Clear All
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
