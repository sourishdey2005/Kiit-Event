
"use client"

import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ficName: '',
    contactEmail: '',
    description: ''
  });

  const pendingApprovals = [
    { id: '1', name: 'Sourish Kumar', email: '2205123@kiit.ac.in', society: 'KIIT Music Society', requestType: 'Admin Access' },
    { id: '2', name: 'Event: Mega Tech', email: 'admin@robotics.kiit', society: 'KIIT Robotics', requestType: 'Event Verification' },
  ];

  const globalStats = [
    { label: 'Total Students', value: '45,230', trend: '+12%', icon: UserPlus },
    { label: 'Societies', value: '54', trend: '+2', icon: ShieldCheck },
    { label: 'Ongoing Events', value: '8', trend: 'Global', icon: Activity },
    { label: 'Engagement', value: '₹1.2M', trend: '+5%', icon: BarChart2 },
  ];

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
        description: `Society admin can now sign up with ${formData.contactEmail} to manage ${formData.name}.`
      });
      setFormData({ name: '', ficName: '', contactEmail: '', description: '' });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Global Control Center</h1>
          <p className="text-muted-foreground">Monitoring campus activities and verifying credentials.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Download Logs</Button>
          <Button className="bg-accent text-white hover:bg-accent/90">Global Alert</Button>
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
                  <div className="flex items-center mt-2 text-xs text-green-600 font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.trend}
                  </div>
                </div>
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* NEW SOCIETY ADD PANEL */}
        <Card className="xl:col-span-1 shadow-md border-none border-t-4 border-accent">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <PlusCircle className="mr-2 w-5 h-5 text-accent" />
              Add New Society
            </CardTitle>
            <CardDescription>Register society and sync admin credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSociety} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Society Name</Label>
                <Input 
                  id="name" 
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
                    className="pl-10"
                    value={formData.ficName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ficName: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Society Official Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    className="pl-10"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Short Description</Label>
                <Textarea 
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button className="w-full bg-primary" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Sync Society to DB
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 shadow-md border-none overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Pending Verifications</CardTitle>
                <CardDescription>New society and event requests.</CardDescription>
              </div>
              <Badge variant="destructive">{pendingApprovals.length} Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Society</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{req.name}</span>
                        <span className="text-xs text-muted-foreground">{req.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{req.society}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.requestType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="text-green-600">
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-xl">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Database Load</span>
                <span className="text-green-600">Optimal</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[25%] bg-green-500 rounded-full" />
              </div>
            </div>
            <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
              <div className="flex items-center space-x-3 text-accent">
                <AlertCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm">Action Required</h4>
              </div>
              <p className="text-xs mt-2 text-accent-foreground/80 leading-relaxed">
                3 societies haven't updated their year-end report. System will auto-suspend them in 48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
