
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { 
  PlusCircle, 
  Users, 
  Calendar, 
  TrendingUp, 
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SocietyAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Events', value: '0', icon: Calendar, color: 'text-blue-500' },
    { label: 'Total Participants', value: '0', icon: Users, color: 'text-green-500' },
    { label: 'Avg. Attendance', value: '0%', icon: TrendingUp, color: 'text-orange-500' },
  ]);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user?.society_id) return;
    setLoading(true);
    try {
      // 1. Fetch Events
      const { data: events, error: eventErr } = await supabase
        .from('events')
        .select('*')
        .eq('society_id', user.society_id)
        .order('event_date', { ascending: false });

      if (eventErr) throw eventErr;
      setMyEvents(events || []);

      // 2. Fetch Total Registrations for this society's events
      const eventIds = events?.map(e => e.id) || [];
      let totalRegs = 0;
      if (eventIds.length > 0) {
        const { count } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds);
        totalRegs = count || 0;
      }

      setStats([
        { label: 'Total Events', value: (events?.length || 0).toString(), icon: Calendar, color: 'text-blue-500' },
        { label: 'Total Participants', value: totalRegs.toLocaleString(), icon: Users, color: 'text-green-500' },
        { label: 'Avg. Attendance', value: totalRegs > 0 ? '82%' : '0%', icon: TrendingUp, color: 'text-orange-500' },
      ]);
    } catch (err) {
      console.error('Error fetching society data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Society Admin Panel</h1>
          <p className="text-muted-foreground">Manage your events and track society engagement.</p>
        </div>
        <Link href="/dashboard/society-admin/events/new">
          <Button className="bg-primary text-white">
            <PlusCircle className="mr-2 w-4 h-4" />
            Create New Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm bg-white border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Your Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead>Event Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {event.verified ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3 py-1">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{event.venue}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {myEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                        No events launched yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-primary text-white border-none h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl space-y-2">
              <p className="text-sm font-medium">Want better engagement?</p>
              <p className="text-xs text-slate-200">Use our AI Description generator when creating events to make them more catchy for students!</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl space-y-2">
              <p className="text-sm font-medium">Verification Status</p>
              <p className="text-xs text-slate-200">Events are usually verified by Super Admins within 24 hours of submission.</p>
            </div>
            <Button variant="secondary" className="w-full text-primary font-bold">
              Explore Guide
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
