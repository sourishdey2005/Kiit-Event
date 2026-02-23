
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, FileText, UserCheck, Shield, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function ApprovalsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Pending Events
      const { data: events, error: evErr } = await supabase
        .from('events')
        .select('*, societies(name)')
        .eq('verified', false)
        .order('created_at', { ascending: false });

      if (evErr) throw evErr;
      setPendingEvents(events || []);

      // Fetch Users (to manage roles)
      const { data: users, error: userErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userErr) throw userErr;
      setAllUsers(users || []);

    } catch (err: any) {
      toast({ variant: "destructive", title: "Fetch Failed", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyEvent = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ verified: status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: status ? "Event Verified" : "Event Rejected",
        description: "The society has been notified."
      });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({ title: "Role Updated", description: `User is now a ${newRole.replace('_', ' ')}.` });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Verification Queue</h1>
          <p className="text-muted-foreground">Approve or reject pending society and event requests.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="bg-white border-none p-1 h-12 mb-6">
          <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 rounded-lg font-semibold">
            <FileText className="w-4 h-4 mr-2" />
            Pending Events ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 rounded-lg font-semibold">
            <UserCheck className="w-4 h-4 mr-2" />
            User Roles ({allUsers.length})
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
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : pendingEvents.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-semibold">{ev.title}</TableCell>
                      <TableCell>{ev.societies?.name}</TableCell>
                      <TableCell>{new Date(ev.event_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50" onClick={() => handleVerifyEvent(ev.id, true)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => handleVerifyEvent(ev.id, false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && pendingEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        No pending event verification requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Manage User Permissions</CardTitle>
              <CardDescription>Directly promote users to different roles in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Set Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{user.role.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateRole(user.id, 'student')}>Student</Button>
                        <Button size="sm" variant="outline" className="text-primary" onClick={() => handleUpdateRole(user.id, 'society_admin')}>Society Admin</Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleUpdateRole(user.id, 'super_admin')}>Super Admin</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
