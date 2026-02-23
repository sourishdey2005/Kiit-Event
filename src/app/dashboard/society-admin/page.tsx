"use client"

import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { generateEventDescription } from '@/ai/flows/generate-event-description';
import { useAuth } from '@/components/auth/auth-provider';

export default function SocietyAdminDashboard() {
  const { user } = useAuth();
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const stats = [
    { label: 'Total Events', value: '12', icon: Calendar, color: 'text-blue-500' },
    { label: 'Total Participants', value: '1,240', icon: Users, color: 'text-green-500' },
    { label: 'Avg. Attendance', value: '85%', icon: TrendingUp, color: 'text-orange-500' },
  ];

  const myEvents = [
    { id: '1', title: 'Annual Hackathon', date: '2024-11-20', status: 'verified', attendees: 450 },
    { id: '2', title: 'Tech Workshop', date: '2024-12-05', status: 'pending', attendees: 0 },
    { id: '3', title: 'Winter Fest Night', date: '2024-12-15', status: 'verified', attendees: 1200 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Society Admin Panel</h1>
          <p className="text-muted-foreground">Manage your events and track society engagement.</p>
        </div>
        <Button className="bg-primary text-white">
          <PlusCircle className="mr-2 w-4 h-4" />
          Create New Event
        </Button>
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
            <Button variant="ghost" size="sm" className="text-primary font-semibold">View All</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead>Event Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-muted-foreground">{event.date}</TableCell>
                    <TableCell>
                      {event.status === 'verified' ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3 py-1">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{event.attendees}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              <p className="text-sm font-medium">QR Check-in System</p>
              <p className="text-xs text-slate-200">Remember to download your event QR scanner app for volunteers to track attendance live.</p>
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