import { useState, useEffect } from 'react';
import { DollarSign, Building2, Calendar, Star, TrendingUp, Users, Plus, Edit, Trash2, User, Mail, Receipt, CreditCard, FileText, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import { StatsCard } from '../components/StatsCard';
import { ownerStats, mockBookings, Booking } from '../data/mockData';
import { Property } from '../data/mockData';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useUser } from '../contexts/UserContext';
import { useProperties } from '../contexts/PropertyContext';
import { mockBookings, Booking } from '../data/mockData';
import { Property } from '../data/mockData';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
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
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../utils/supabase';

const getIcon = () => {
  if (typeof window === 'undefined') return undefined; // Avoid SSR crashes!
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    locationfound(e) {
      if (!position) { // Only set if they haven't explicitly set one already
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  useEffect(() => {
    map.locate();
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(t);
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={getIcon()}></Marker>
  );
}

export function DashboardPage() {
  const { user } = useUser();
  const { properties, loading: loadingProperties, addProperty, updateProperty, deleteProperty } = useProperties();
  const [activeTab, setActiveTab] = useState('overview');

  // Filter properties by owner
  const ownerProperties = properties.filter((p) => p.ownerId === user?.id || p.ownerId === 'owner1');

  // Properties State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Add/Edit Property State
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    capacity: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);

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

  // Dynamic Stats
  const totalEarnings = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const activeBookingsCount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      setLoadingBookings(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('ownerId', user.id)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else if (data) {
        setBookings(data as Booking[]);
      }
      setLoadingBookings(false);
    };

    fetchBookings();
  }, [user]);

  // Handlers for Add/Edit Property
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const handleEditProperty = (property: Property) => {
    setEditingPropertyId(property.id);
    setFormData({
      name: property.name,
      location: property.location,
      price: property.price.toString(),
      description: property.description || '',
      bedrooms: property.bedrooms?.toString() || '1',
      bathrooms: property.bathrooms?.toString() || '1',
      capacity: property.capacity?.toString() || '1',
      image: property.image || '/pics/default.png',
    });
    setAmenities(Array.isArray(property.amenities) ? property.amenities : []);
    setImageFile(null);
    setPreviewImage(property.image || '/pics/default.png');
    if (property.coordinates && property.coordinates.length >= 2) {
      setMapPosition(new L.LatLng(property.coordinates[0], property.coordinates[1]));
    } else {
      setMapPosition(null);
    }
    setActiveTab('add');
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct property payload
    let finalImageUrl = formData.image || '/pics/default.png';
    const toastId = toast.loading('Publishing...');

    try {
      if (imageFile) {
        // Upload to Supabase Storage
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }


    const payload: Partial<Property> = {
      name: formData.name,
      location: formData.location,
      price: Number(formData.price),
      description: formData.description,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      capacity: Number(formData.capacity),
      rating: 0, // default
      verified: false,
      roomsAvailable: 1, 
      totalRooms: 1,
      roomCapacity: Number(formData.capacity),
      coordinates: mapPosition ? [mapPosition.lat, mapPosition.lng] : [9.6469, 123.8541], // Default to Bohol if none picked
      address: formData.location,
      municipality: formData.location.split(',')[0],
      amenities: amenities,
      image: finalImageUrl,
      ownerId: user?.id || 'owner1',
    };

    if (editingPropertyId) {
      await updateProperty(editingPropertyId, payload);
      toast.success('Property updated successfully!', { id: toastId });
    } else {
      await addProperty(payload as Omit<Property, 'id'>);
      toast.success('New boarding house published!', { id: toastId });
    }
    
    // Reset form
    setEditingPropertyId(null);
    setFormData({
      name: '',
      location: '',
      price: '',
      description: '',
      bedrooms: '',
      bathrooms: '',
      capacity: '',
      image: '',
    });
    setAmenities([]);
    setImageFile(null);
    setPreviewImage('');
    setMapPosition(null);
    setActiveTab('properties');
  } catch (err: any) {
    console.error('Error publishing property:', err);
    toast.error(err?.message || 'Failed to publish property', { id: toastId });
  }
  };

  // Handlers for Properties
  const handleDeleteProperty = (id: string) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
      const success = await deleteProperty(propertyToDelete);
      if (success) {
        toast.success('Property deleted successfully!');
      } else {
        toast.error('Failed to delete property.');
      }
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return '';
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    const toastId = toast.loading('Confirming reservation...');
    const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
    if (error) {
      toast.error('Failed to update: ' + error.message, { id: toastId });
      return;
    }
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as const } : b));
    toast.success('Booking securely confirmed!', { id: toastId });
  };

  const handleRejectBooking = async (bookingId: string) => {
    const toastId = toast.loading('Rejecting reservation...');
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    if (error) {
      toast.error('Failed to update: ' + error.message, { id: toastId });
      return;
    }
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    toast.success('Booking successfully rejected', { id: toastId });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Owner Dashboard
        </motion.h1>

        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          if (val === 'add' && !editingPropertyId) {
            setFormData({
              name: '', location: '', price: '', description: '', bedrooms: '', bathrooms: '', capacity: '', image: '',
            });
            setAmenities([]);
            setEditingPropertyId(null);
            setImageFile(null);
            setPreviewImage('');
            setMapPosition(null);
          }
        }} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg py-3">
              <TrendingUp className="w-4 h-4 mr-2 hidden md:block" /> Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="rounded-lg py-3">
              <Building2 className="w-4 h-4 mr-2 hidden md:block" /> My Property
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg py-3">
              <Calendar className="w-4 h-4 mr-2 hidden md:block" /> Bookings & Guests
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-lg py-3">
              {editingPropertyId ? <Edit className="w-4 h-4 mr-2 hidden md:block" /> : <Plus className="w-4 h-4 mr-2 hidden md:block" />}
              {editingPropertyId ? 'Edit Property' : 'Add Property'}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Earnings"
                value={`₱${totalEarnings.toLocaleString()}`}
                icon={DollarSign}
                trend="+12% from last month"
                color="green"
                delay={0}
              />
              <StatsCard
                title="Active Properties"
                value={ownerProperties.length}
                icon={Building2}
                color="blue"
                delay={0.1}
              />
              <StatsCard
                title="Active Bookings"
                value={activeBookingsCount}
                icon={Calendar}
                color="purple"
                delay={0.2}
              />
              <StatsCard
                title="Average Rating"
                value={4.6} // Static for now until reviews table exists
                icon={Star}
                color="orange"
                delay={0.3}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="earnings" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
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
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px' }} />
                      <Bar dataKey="bookings" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* TAB 2: MY PROPERTIES */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Your Boarding House</h2>
              {ownerProperties.length === 0 && (
                <Button onClick={() => setActiveTab('add')} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                  <Plus className="h-4 w-4 mr-2" /> Add House
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProperties ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />) : 
                ownerProperties.map((property, index) => (
                  <motion.div key={property.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="relative group">
                    <PropertyCard property={property} onClick={() => {}} />
                    
                    <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); handleEditProperty(property); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              }
              {!loadingProperties && ownerProperties.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold mb-2">No boarding houses yet</h3>
                  <Button onClick={() => setActiveTab('add')} className="mt-4">Publish Your First Property</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: BOOKINGS */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-xl font-semibold">Guest Reservations</h2>
            <div className="space-y-4">
              {loadingBookings ? Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-6 rounded-2xl"><Skeleton className="h-20 w-full" /></Card>
              )) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground">When guests book your boarding houses, they will appear here.</p>
                </div>
              ) : bookings.map((booking, index) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="p-6 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{booking.propertyName}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>
                              <Badge variant="secondary">{booking.paymentMethod === 'online' ? 'Online Setup' : 'Pay On-Site'}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" /> 
                            <a href={`#/profile/${booking.guestId}`} className="text-sm font-medium hover:text-green-600 underline decoration-dotted underline-offset-4">
                              {booking.guestName}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" /> <span className="text-sm">{booking.guestEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" /> <span className="text-sm">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="sm:text-right space-y-2">
                          <div className="flex items-center sm:justify-end gap-2">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
                            <span className="font-semibold text-green-600 dark:text-green-500">₱{booking.totalPrice.toLocaleString()} / month</span>
                          </div>
                          <div className="flex items-center sm:justify-end gap-2 text-sm text-muted-foreground">
                            <Receipt className="h-4 w-4" />
                            <span>{booking.receiptSent ? 'System receipt sent' : 'Receipt pending'}</span>
                          </div>
                          {booking.status === 'pending' && (
                            <div className="flex items-center sm:justify-end gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleRejectBooking(booking.id)}>
                                Reject
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAcceptBooking(booking.id)}>
                                Accept
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: ADD/EDIT PROPERTY */}
          <TabsContent value="add" className="space-y-6">
            <Card className="p-6 sm:p-8 rounded-2xl">
              <form onSubmit={handleSubmitProperty} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Property Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Cozy Boarding House" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Tagbilaran, Bohol" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="price">Price per Month (₱) *</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 2500" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity per Room *</Label>
                    <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} placeholder="e.g., 4" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} placeholder="e.g., 1" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} placeholder="e.g., 1" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe rules and house features..." rows={4} className="mt-2" />
                </div>

                <div>
                  <Label>Free Amenities</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} placeholder="e.g., Free WiFi, Electricity Included" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())} />
                    <Button type="button" variant="outline" onClick={handleAddAmenity}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 bg-accent px-3 py-1 rounded-full">
                        <span className="text-sm">{amenity}</span>
                        <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Boarding House Location on Map (Click to Pin) *</Label>
                  <div className="h-[300px] w-full rounded-2xl overflow-hidden border mt-2">
                    <MapContainer
                      center={[9.8500, 124.1435]} // Bohol Center
                      zoom={10}
                      minZoom={9}
                      maxBounds={[[9.5, 123.5], [10.5, 124.8]]}
                      maxBoundsViscosity={1.0}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">Zoom in and click to drop a pin.</p>
                </div>

                <div>
                  <Label>Property Image (Optional)</Label>
                  <div className="mt-2 flex gap-4 items-center">
                    {(previewImage || formData.image) && (
                      <img src={previewImage || formData.image || ''} alt="preview" className="h-20 w-20 object-cover rounded-lg border" />
                    )}
                    <div className="flex-1">
                      <Input 
                        id="image" 
                        name="image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const objectUrl = URL.createObjectURL(file);
                            setPreviewImage(objectUrl);
                            setFormData({...formData, image: file.name});
                          }
                        }}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Choose a clear photo from your files.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                    {editingPropertyId ? 'Save Changes' : 'Publish Boarding House'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setActiveTab('properties'); setEditingPropertyId(null); }} className="rounded-xl">Cancel</Button>
                </div>
              </form>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this property? This action cannot be undone and will immediately remove it from public search.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
