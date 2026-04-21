import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, User, Home, Search, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useUser } from '../contexts/UserContext';
import { Badge } from '../components/ui/badge';

export function TutorialPage() {
  const { mode } = useUser();
  const [activeTab, setActiveTab] = useState(mode === 'owner' ? 'owner' : 'guest');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-4 bg-green-100 text-green-700 rounded-full mb-6 dark:bg-green-900/30 dark:text-green-400"
        >
          <BookOpen className="h-8 w-8" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold mb-4"
        >
          How to Use BOHOL Board
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground"
        >
          Watch this video guide to help you get the most out of the system.
        </motion.p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="guest" className="rounded-lg py-3">
            <User className="h-5 w-5 mr-2" /> For Boarders 
          </TabsTrigger>
          <TabsTrigger value="owner" className="rounded-lg py-3">
            <Home className="h-5 w-5 mr-2" /> For Owners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guest" className="space-y-8 mt-8 flex justify-center">
          <div className="w-full max-w-4xl aspect-video bg-black/5 rounded-2xl overflow-hidden border border-muted relative group flex items-center justify-center">
             <video 
               autoPlay 
               loop 
               muted 
               className="w-full h-full object-cover"
             >
                <source src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/vids/IPTboarders.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
             </video>
          </div>
        </TabsContent>

        <TabsContent value="owner" className="space-y-8 mt-8 flex justify-center">
          <div className="w-full max-w-4xl aspect-video bg-black/5 rounded-2xl overflow-hidden border border-muted relative group flex items-center justify-center">
             <video 
               autoPlay 
               loop 
               muted 
               className="w-full h-full object-cover"
             >
                <source src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/vids/IPTowners.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
             </video>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TutorialStep({ 
  stepNumber, 
  title, 
  description, 
  imagePlaceholderText, 
  icon,
  reverse = false 
}: { 
  stepNumber: number; 
  title: string; 
  description: string; 
  imagePlaceholderText: string;
  icon: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col md:flex-row gap-8 lg:gap-16 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-green-600 bg-green-50 dark:bg-green-950/20 text-green-600 font-bold text-xl shrink-0">
            {stepNumber}
          </div>
          <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed pl-16">
          {description}
        </p>
      </div>

      <div className="flex-1 w-full relative">
        {/* Placeholder styling for images */}
        <div className="aspect-[4/3] w-full rounded-2xl bg-accent border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center p-8 text-center text-muted-foreground overflow-hidden shadow-xl">
           <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-green-500/5 mix-blend-overlay"></div>
           <div className="w-20 h-20 mb-6 bg-background rounded-full flex items-center justify-center shadow-sm">
             {icon}
           </div>
           <p className="font-medium text-lg mb-2">Image Placement</p>
           <p className="text-sm opacity-70 max-w-sm">{imagePlaceholderText}</p>
        </div>
      </div>
    </motion.div>
  );
}
