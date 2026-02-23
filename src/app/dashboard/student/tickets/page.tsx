
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QRPlaceholder } from '@/components/ui/qr-placeholder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Download, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';

export default function StudentTickets() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, events(*, societies(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setRegistrations(data || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, [user]);

  if (loading) {
    return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Entry Passes</h1>
        <p className="text-muted-foreground">Your registered events and QR codes for entry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {registrations.map((item) => (
          <Card key={item.id} className="overflow-hidden border-none shadow-md flex flex-col md:flex-row bg-white">
            <div className="w-full md:w-64 p-6 bg-slate-50 flex flex-col items-center justify-center border-r border-dashed border-slate-200">
              <QRPlaceholder value={`TICKET-${item.event_id}-${user?.id?.slice(0, 5)}`} />
              <div className="mt-4 flex space-x-2">
                <Button size="icon" variant="outline" className="rounded-full w-8 h-8">
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full w-8 h-8">
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            
            <CardContent className="flex-1 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant={new Date(item.events.event_date) > new Date() ? 'default' : 'secondary'} className="mb-2">
                      {new Date(item.events.event_date) > new Date() ? 'UPCOMING' : 'PAST'}
                    </Badge>
                    <h3 className="text-2xl font-bold text-primary">{item.events.title}</h3>
                    <p className="text-sm font-medium text-accent">{item.events.societies?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    {new Date(item.events.event_date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    {new Date(item.events.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    {item.events.venue}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-primary">Instructions:</span> Please present this QR code at the registration desk. Ensure your student ID is available for physical verification.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {registrations.length === 0 && (
        <Card className="p-20 text-center border-dashed border-2 bg-transparent">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold">No active tickets</h3>
          <p className="text-muted-foreground mb-6">Register for some events to see your tickets here.</p>
          <Link href="/dashboard/student/events">
            <Button className="bg-primary">Browse Events</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
