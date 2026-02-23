
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, FileText, UserCheck, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ApprovalsManager() {
  const { toast } = useToast();
  
  const [pendingEvents, setPendingEvents] = useState([
    { id: 'ev-1', title: 'Code Rush 2024', society: 'KIIT Robotics', date: '2024-11-20', requester: 'Admin Robot' },
    { id: 'ev-2', title: 'Musical Symphony', society: 'KIIT Music', date: '2024-12-05', requester: 'Harmony Soul' }
  ]);

  const [pendingAdmins, setPendingAdmins] = useState([
    { id: 'adm-1', name: 'Sourish Kumar', email: '2205123@kiit.ac.in', society: 'KSAC', dept: 'CS' },
    { id: 'adm-2', name: 'Anita Roy', email: '2205567@kiit.ac.in', society: 'Kronos', dept: 'IT' }
  ]);

  const handleApprove = (type: 'event' | 'admin', id: string) => {
    if (type === 'event') {
      setPendingEvents(prev => prev.filter(ev => ev.id !== id));
    } else {
      setPendingAdmins(prev => prev.filter(adm => adm.id !== id));
    }
    toast({
      title: "Approved!",
      description: `Verification request ${id} has been processed.`,
    });
  };

  const handleReject = (type: 'event' | 'admin', id: string) => {
    if (type === 'event') {
      setPendingEvents(prev => prev.filter(ev => ev.id !== id));
    } else {
      setPendingAdmins(prev => prev.filter(adm => adm.id !== id));
    }
    toast({
      variant: "destructive",
      title: "Rejected",
      description: `Verification request ${id} has been denied.`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Verification Queue</h1>
        <p className="text-muted-foreground">Approve or reject pending society and event requests.</p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="bg-white border-none p-1 h-12 mb-6">
          <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 rounded-lg font-semibold">
            <FileText className="w-4 h-4 mr-2" />
            Events ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 rounded-lg font-semibold">
            <UserCheck className="w-4 h-4 mr-2" />
            Society Admins ({pendingAdmins.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Event Verification Requests</CardTitle>
              <CardDescription>Verify event details before they go live for students.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Title</TableHead>
                    <TableHead>Society</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEvents.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-semibold">{ev.title}</TableCell>
                      <TableCell>{ev.society}</TableCell>
                      <TableCell>{ev.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="text-primary">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50" onClick={() => handleApprove('event', ev.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => handleReject('event', ev.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No pending event verification requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Society Admin Access Requests</CardTitle>
              <CardDescription>Grant dashboard access to approved student society leads.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Requested Society</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAdmins.map((adm) => (
                    <TableRow key={adm.id}>
                      <TableCell className="font-semibold">{adm.name}</TableCell>
                      <TableCell className="text-muted-foreground">{adm.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">{adm.society}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50" onClick={() => handleApprove('admin', adm.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => handleReject('admin', adm.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingAdmins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        No pending admin access requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-primary text-white border-none">
          <CardContent className="pt-6 flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-200">Current System Trust Level</p>
              <h3 className="text-2xl font-bold">100% Secure</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6 flex items-center space-x-4">
            <div className="p-3 bg-accent/5 text-accent rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Approval Time</p>
              <h3 className="text-2xl font-bold">2.4 Hours</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
