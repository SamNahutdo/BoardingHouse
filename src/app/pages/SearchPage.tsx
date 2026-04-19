import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'motion/react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { Property } from '../data/mockData';
import { useProperties } from '../contexts/PropertyContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';

export function SearchPage() {
  const { properties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [priceRange, setPriceRange] = useState([0, 8000]);
  const [minRating, setMinRating] = useState(0);

  const [requireMoveInReady, setRequireMoveInReady] = useState(false);
  const [requireStudentFriendly, setRequireStudentFriendly] = useState(false);
  const [requireNearSchool, setRequireNearSchool] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      filterProperties();
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, priceRange, minRating, properties, requireMoveInReady, requireStudentFriendly, requireNearSchool]);

  const filterProperties = () => {
    let filtered = properties;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.location.toLowerCase().includes(normalizedQuery) ||
          p.municipality.toLowerCase().includes(normalizedQuery) ||
          p.address?.toLowerCase().includes(normalizedQuery) ||
          p.description?.toLowerCase().includes(normalizedQuery) ||
          p.amenities?.some((amenity) => amenity.toLowerCase().includes(normalizedQuery)),
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    filtered = filtered.filter((p) => p.rating >= minRating);

    if (requireMoveInReady) filtered = filtered.filter((p) => p.moveInReady);
    if (requireStudentFriendly) filtered = filtered.filter((p) => p.studentFriendly);
    if (requireNearSchool) filtered = filtered.filter((p) => p.nearSchool);

    setFilteredProperties(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
    setLoading(true);
  };

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  const resetFilters = () => {
    setPriceRange([0, 8000]);
    setMinRating(0);
    setRequireMoveInReady(false);
    setRequireStudentFriendly(false);
    setRequireNearSchool(false);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-6"
          >
            Search Boarding Houses
          </motion.h1>

          <div className="flex gap-2 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search house, municipality, address, or description"
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
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Price Range
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                       <Input 
                         type="number" 
                         value={priceRange[0]} 
                         onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                         placeholder="Min"
                       />
                       <span>-</span>
                       <Input 
                         type="number" 
                         value={priceRange[1]} 
                         onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                         placeholder="Max"
                       />
                    </div>
                  </div>

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

                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Student Filters</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Move-in Ready (Bed, WiFi, Tab...)</span>
                      <Switch checked={requireMoveInReady} onCheckedChange={setRequireMoveInReady} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Student-Friendly (Curfews, Visitors...)</span>
                      <Switch checked={requireStudentFriendly} onCheckedChange={setRequireStudentFriendly} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Near School / Walking Distance</span>
                      <Switch checked={requireNearSchool} onCheckedChange={setRequireNearSchool} />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              {filteredProperties.length} boarding house
              {filteredProperties.length === 1 ? '' : 's'} found
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
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

        {!loading && filteredProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No boarding houses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search, price, rating, or description terms.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
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
