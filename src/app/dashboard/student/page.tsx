"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { generateEventRecommendations } from '@/ai/flows/generate-event-recommendations';
import { Calendar, MapPin, Clock, Sparkles, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Mock data for initial UI
  const upcomingEvents = [
    { id: '1', title: 'TechCon 2024', society: 'KIIT Robotics', date: '2024-10-15', venue: 'Campus 3 Auditorium' },
    { id: '2', title: 'Cultural Night', society: 'KSAC', date: '2024-10-20', venue: 'Student Activity Center' }
  ];

  useEffect(() => {
    async function fetchAI() {
      if (!user) return;
      setLoadingAi(true);
      try {
        // Mocking inputs for the GenAI flow
        const result = await generateEventRecommendations({
          studentInterests: ['tech', 'music'],
          pastEventTitles: ['Workshop 2023'],
          availableEvents: [
            { id: 'uuid-1', title: 'AI Symposium', description: 'Explore future of AI', societyName: 'ML Club', eventDate: '2024-11-01T10:00:00Z' },
            { id: 'uuid-2', title: 'Battle of Bands', description: 'Annual music competition', societyName: 'Music Soc', eventDate: '2024-11-05T18:00:00Z' }
          ]
        });
        setRecommendations(result.recommendedEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAi(false);
      }
    }
    fetchAI();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Hello, {user?.name}! 👋</h1>
          <p className="text-muted-foreground">Ready to explore some exciting campus events today?</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          Explore All Events
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
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
            <h2 className="text-xl font-bold text-primary">Recommended for You</h2>
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
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent font-semibold p-0">
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground italic col-span-full">
                Check back later for personalized event suggestions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 w-5 h-5 text-accent" />
            Your Schedule
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="flex items-center p-5 space-x-4">
                  <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl px-4 py-2 font-bold min-w-[70px]">
                    <span className="text-xs uppercase font-medium">Oct</span>
                    <span className="text-xl">{event.date.split('-')[2]}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{event.society}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {event.venue}</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> 10:00 AM</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Get Ticket</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <Users className="mr-2 w-5 h-5 text-accent" />
            Popular Societies
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {['KIIT Robotics', 'KSAC', 'Kronos', 'Qutopia'].map((soc) => (
              <Card key={soc} className="text-center p-6 bg-white hover:bg-slate-50 cursor-pointer border-primary/10 group transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {soc[0]}
                </div>
                <h4 className="font-semibold text-sm">{soc}</h4>
                <Badge variant="secondary" className="mt-2 text-[10px]">Active</Badge>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}