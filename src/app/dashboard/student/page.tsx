
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { generateEventRecommendations } from '@/ai/flows/generate-event-recommendations';
import { Calendar, MapPin, Clock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [upcomingRegistrations, setUpcomingRegistrations] = useState<any[]>([]);
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Fetch Registrations
        const { data: regs } = await supabase
          .from('registrations')
          .select('*, events(*, societies(name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        setUpcomingRegistrations(regs || []);

        // 2. Fetch Societies
        const { data: socs } = await supabase
          .from('societies')
          .select('*')
          .limit(4);
        setSocieties(socs || []);

        // 3. Fetch Recommendations (GenAI)
        setLoadingAi(true);
        const { data: availableEvents } = await supabase
          .from('events')
          .select('*, societies(name)')
          .eq('verified', true)
          .limit(10);

        if (availableEvents && availableEvents.length > 0) {
          const result = await generateEventRecommendations({
            studentInterests: ['tech', 'cultural', 'coding'], // Ideally from profile
            pastEventTitles: regs?.map(r => r.events.title) || [],
            availableEvents: availableEvents.map(e => ({
              id: e.id,
              title: e.title,
              description: e.description,
              societyName: e.societies?.name || 'Society',
              eventDate: e.event_date
            }))
          });
          setRecommendations(result.recommendedEvents);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoadingAi(false);
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading && !upcomingRegistrations.length) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Hello, {user?.name}! 👋</h1>
          <p className="text-muted-foreground">Ready to explore some exciting campus events today?</p>
        </div>
        <Link href="/dashboard/student/events">
          <Button className="bg-accent hover:bg-accent/90">
            Explore All Events
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* AI Recommendations */}
      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-primary rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-primary">AI Suggestions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingAi ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse bg-white/50 h-32 border-dashed"></Card>
              ))
            ) : recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <Card key={rec.eventId} className="glass-card border-white/40 hover:scale-[1.02] transition-transform">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-primary mb-2">Event Suggestion</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {rec.reason}
                    </p>
                    <Link href="/dashboard/student/events">
                      <Button variant="ghost" size="sm" className="text-accent hover:text-accent font-semibold p-0">
                        View Details →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground italic col-span-full">
                Register for more events to get better recommendations!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 w-5 h-5 text-accent" />
            Your Registered Events
          </h2>
          <div className="space-y-4">
            {upcomingRegistrations.length > 0 ? upcomingRegistrations.map((reg) => (
              <Card key={reg.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="flex items-center p-5 space-x-4">
                  <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl px-4 py-2 font-bold min-w-[70px]">
                    <span className="text-xs uppercase font-medium">
                      {new Date(reg.events.event_date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl">{new Date(reg.events.event_date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{reg.events.title}</h3>
                    <p className="text-xs text-muted-foreground">{reg.events.societies?.name}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {reg.events.venue}</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(reg.events.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <Link href="/dashboard/student/tickets">
                    <Button variant="outline" size="sm">Ticket</Button>
                  </Link>
                </div>
              </Card>
            )) : (
              <Card className="p-8 text-center border-dashed">
                <p className="text-muted-foreground">You haven't registered for any events yet.</p>
              </Card>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Users className="mr-2 w-5 h-5 text-accent" />
            Explore Societies
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {societies.map((soc) => (
              <Card key={soc.id} className="text-center p-6 bg-white hover:bg-slate-50 cursor-pointer border-primary/10 group transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-bold">
                  {soc.name[0]}
                </div>
                <h4 className="font-semibold text-sm truncate">{soc.name}</h4>
                <Badge variant="secondary" className="mt-2 text-[10px]">Active</Badge>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
