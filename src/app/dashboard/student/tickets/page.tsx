
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QRPlaceholder } from '@/components/ui/qr-placeholder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Download, Share2 } from 'lucide-react';

export default function StudentTickets() {
  const registeredEvents = [
    {
      id: 'reg-1',
      title: 'Annual Tech Hackathon',
      date: '2024-11-20',
      time: '10:00 AM',
      venue: 'Campus 6 Auditorium',
      society: 'KIIT Robotics',
      qrValue: 'TICKET-HACK-KIIT-2024-X892',
      status: 'upcoming'
    },
    {
      id: 'reg-2',
      title: 'Workshop: AI & Ethics',
      date: '2024-10-15',
      time: '02:00 PM',
      venue: 'Online - MS Teams',
      society: 'KIIT AI Society',
      qrValue: 'TICKET-AIETH-KIIT-2024-A112',
      status: 'attended'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Entry Passes</h1>
        <p className="text-muted-foreground">Your registered events and QR codes for entry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {registeredEvents.map((item) => (
          <Card key={item.id} className="overflow-hidden border-none shadow-md flex flex-col md:flex-row bg-white">
            <div className="w-full md:w-64 p-6 bg-slate-50 flex flex-col items-center justify-center border-r border-dashed border-slate-200">
              <QRPlaceholder value={item.qrValue} />
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
                    <Badge variant={item.status === 'upcoming' ? 'default' : 'secondary'} className="mb-2">
                      {item.status.toUpperCase()}
                    </Badge>
                    <h3 className="text-2xl font-bold text-primary">{item.title}</h3>
                    <p className="text-sm font-medium text-accent">{item.society}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    {new Date(item.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    {item.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    {item.venue}
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

      {registeredEvents.length === 0 && (
        <Card className="p-20 text-center border-dashed border-2 bg-transparent">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold">No active tickets</h3>
          <p className="text-muted-foreground mb-6">Register for some events to see your tickets here.</p>
          <Button className="bg-primary">Browse Events</Button>
        </Card>
      )}
    </div>
  );
}
