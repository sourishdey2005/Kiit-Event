
"use client"

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/dashboard/event-card';
import { Search, Filter, Calendar as CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import { supabase, CampusEvent } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';

export default function EventsDiscovery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Partial<CampusEvent>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('verified', true)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Sync Error", description: "Failed to load events." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: string, eventTitle: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([{ user_id: user.id, event_id: eventId }]);
      
      if (error) {
        if (error.code === '23505') {
          toast({ title: "Already Registered", description: "You have already secured a spot for this event." });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Registration Success!",
        description: `You have successfully registered for ${eventTitle}. Check 'My Tickets' for your entry pass.`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to Register", description: err.message });
    }
  };

  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Discover Events</h1>
          <p className="text-muted-foreground">Find and register for the best campus activities.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 bg-white border-none shadow-sm focus-visible:ring-primary/20" 
          placeholder="Search for hackathons, workshops, fests..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onRegister={() => handleRegister(event.id!, event.title || '')} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="p-4 bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-primary text-white p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-3">Can't decide where to go?</h2>
          <p className="text-slate-200 mb-6 leading-relaxed">
            Use the student dashboard to see AI-powered recommendations tailored just for you.
          </p>
          <Link href="/dashboard/student">
            <Button variant="secondary" className="font-bold text-primary">
              Check Recommendations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
