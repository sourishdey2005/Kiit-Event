"use client"

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { CampusEvent } from '@/lib/supabase';

interface EventCardProps {
  event: Partial<CampusEvent>;
  onRegister?: () => void;
}

export function EventCard({ event, onRegister }: EventCardProps) {
  const isSoldOut = event.max_limit ? false : true; // Simplified for placeholder logic

  return (
    <Card className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 w-full">
        <Image 
          src={event.poster || `https://picsum.photos/seed/${event.id}/800/600`}
          alt={event.title || 'Event'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          data-ai-hint="event poster"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none shadow-sm">
            {event.verified ? 'Verified' : 'Reviewing'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-primary truncate leading-tight group-hover:text-accent transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {event.description || 'Join us for this amazing campus event and build great memories!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-accent" />
            {new Date(event.event_date || Date.now()).toLocaleDateString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-accent" />
            {event.venue || 'Campus Hall'}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 mr-1.5 text-accent" />
            {event.max_limit || 200} spots
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Ticket className="w-3.5 h-3.5 mr-1.5 text-accent" />
            Free Entry
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button 
          onClick={onRegister}
          className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl"
          disabled={isSoldOut}
        >
          {isSoldOut ? 'Sold Out' : 'Register Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}