import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { Property } from '../data/mockData';

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  addProperty: (property: Omit<Property, 'id'>) => Promise<boolean>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<boolean>;
  deleteProperty: (id: string) => Promise<boolean>;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('properties').select('*');
    if (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } else if (data) {
      const parsedData = data.map(item => {
        let parsedAmenities = item.amenities;
        if (typeof item.amenities === 'string') {
          try {
            parsedAmenities = JSON.parse(item.amenities);
          } catch(e) {
            parsedAmenities = [];
          }
        }
        let parsedCoordinates = item.coordinates;
        if (typeof item.coordinates === 'string') {
          try {
            parsedCoordinates = JSON.parse(item.coordinates);
          } catch(e) {
            parsedCoordinates = [0,0];
          }
        }
        return {
          ...item,
          amenities: parsedAmenities,
          coordinates: parsedCoordinates
        };
      });
      setProperties(parsedData as Property[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (property: Omit<Property, 'id'>) => {
    const id = `property-${Date.now()}`;
    const newProperty = { ...property, id };
    
    // Ensure arrays are stringified if the table relies on text types
    const propertyForDb = { ...newProperty };
    if (Array.isArray(propertyForDb.amenities)) {
      (propertyForDb as any).amenities = JSON.stringify(propertyForDb.amenities);
    }
    if (Array.isArray(propertyForDb.coordinates)) {
      (propertyForDb as any).coordinates = JSON.stringify(propertyForDb.coordinates);
    }

    const { error } = await supabase.from('properties').insert([propertyForDb]);
    
    if (error) {
      console.error('Error adding property:', error);
      return false;
    }
    
    setProperties([...properties, newProperty as Property]);
    return true;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const dbUpdates = { ...updates };
    if (Array.isArray(dbUpdates.amenities)) {
      (dbUpdates as any).amenities = JSON.stringify(dbUpdates.amenities);
    }
    if (Array.isArray(dbUpdates.coordinates)) {
      (dbUpdates as any).coordinates = JSON.stringify(dbUpdates.coordinates);
    }

    const { error } = await supabase.from('properties').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating property:', error);
      return false;
    }
    
    setProperties(properties.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error('Error deleting property:', error);
      return false;
    }
    setProperties(properties.filter(p => p.id !== id));
    return true;
  };

  return (
    <PropertyContext.Provider value={{
      properties,
      loading,
      addProperty,
      updateProperty,
      deleteProperty,
      refreshProperties: fetchProperties
    }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
