
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { 
  ShieldCheck, 
  AlertCircle, 
  BarChart2, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  Activity,
  ArrowUpRight,
  PlusCircle,
  Mail,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    societies: 0,
    ongoingEvents: 0,
    totalRegistrations: 0
  });
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    ficName: '',
    contactEmail: '',
    description: ''
  });

  const fetchData = async () => {
    setFetching(true);
    try {
      // 1. Fetch Students Count
      const { count: studentCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // 2. Fetch Societies Count
      const { count: societyCount } = await supabase
        .from('societies')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch Active Events Count
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      // 4. Fetch Total Registrations
      const { count: regCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      setStats({
        students: studentCount || 0,
        societies: societyCount || 0,
        ongoingEvents: eventCount || 0,
        totalRegistrations: regCount || 0
      });

      // 5. Fetch Pending Event Verifications
      const { data: events } = await supabase
        .from('events')
        .select('*, societies(name)')
        .eq('verified', false)
        .order('created_at', { ascending: false });

      setPendingEvents(events || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Database Sync Issues",
        description: "Ensure you have run the Master SQL code in your Supabase dashboard."
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('societies')
        .insert([{
          name: formData.name,
          fic_name: formData.ficName,
          contact_email: formData.contactEmail,
          description: formData.description
        }]);

      if (error) throw error;

      toast({
        title: "Society Registered",
        description: `Successfully added ${formData.name}. Society admin can now register with their email.`
      });
      setFormData({ name: '', ficName: '', contactEmail: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEvent = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ verified: status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: status ? "Event Verified" : "Event Rejected",
        description: "Live status has been updated for all students."
      });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    }
  };

  const globalStats = [
    { label: 'Total Students', value: stats.students.toLocaleString(), trend: 'Active', icon: UserPlus, color: 'text-blue-500' },
    { label: 'Registered Societies', value: stats.societies.toString(), trend: 'Global', icon: ShieldCheck, color: 'text-green-500' },
    { label: 'Verified Events', value: stats.ongoingEvents.toString(), trend: 'Live', icon: Activity, color: 'text-orange-500' },
    { label: 'Total Engagement', value: stats.totalRegistrations.toLocaleString(), trend: 'Signups', icon: BarChart2, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Global Control Center</h1>
          <p className="text-muted-foreground">Real-time monitoring of campus activities.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchData} disabled={fetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div className={`flex items-center mt-2 text-xs font-medium ${stat.color}`}>
                    <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.trend}
                  </div>
                </div>
                <div className={`p-2 bg-slate-50 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-1 shadow-md border-none border-t-4 border-accent">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <PlusCircle className="mr-2 w-5 h-5 text-accent" />
              Register Society
            </CardTitle>
            <CardDescription>Setup a new society and its admin contact.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSociety} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Society Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Robotics Society"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fic">Faculty-in-Charge (FIC)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="fic" 
                    placeholder="Prof. Name"
                    className="pl-10"
                    value={formData.ficName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ficName: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="society@kiit.ac.in"
                    className="pl-10"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Admins register with this email to get access.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Goals & Description</Label>
                <Textarea 
                  id="desc"
                  placeholder="Society mission..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button className="w-full bg-primary" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Add to Database
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 shadow-md border-none overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Verification Requests</CardTitle>
                <CardDescription>Event requests awaiting live approval.</CardDescription>
              </div>
              <Badge variant={pendingEvents.length > 0 ? "destructive" : "secondary"}>
                {pendingEvents.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead>Event Details</TableHead>
                  <TableHead>Organizing Society</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetching ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : pendingEvents.length > 0 ? (
                  pendingEvents.map((req) => (
                    <TableRow key={req.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{req.title}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{req.venue}</span>
                        </div>
                      </TableCell>
                      <TableCell>{req.societies?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{new Date(req.event_date).toLocaleDateString()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleVerifyEvent(req.id, true)}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleVerifyEvent(req.id, false)}
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                      No pending requests. Everything is up to date!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
