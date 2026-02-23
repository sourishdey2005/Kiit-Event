
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Mail, User, Loader2, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SocietyManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [societies, setSocieties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ficName: '',
    contactEmail: ''
  });

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSocieties(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('societies')
        .insert([{
          name: formData.name,
          description: formData.description,
          fic_name: formData.ficName,
          contact_email: formData.contactEmail
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Society Added!",
        description: `${formData.name} has been successfully registered. The Society Admin can now register with the email ${formData.contactEmail}.`
      });
      
      setFormData({ name: '', description: '', ficName: '', contactEmail: '' });
      fetchSocieties();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSociety = async (id: string) => {
    if (!confirm('Are you sure you want to delete this society?')) return;
    
    try {
      const { error } = await supabase.from('societies').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Society record removed successfully." });
      fetchSocieties();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Society Management</h1>
          <p className="text-muted-foreground">Add campus societies and assign their Faculty-in-Charge (FIC).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-md h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 w-5 h-5 text-accent" />
              Register New Society
            </CardTitle>
            <CardDescription>Enter the official details for the new society.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Society Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. KIIT Robotics Society" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ficName">Faculty-in-Charge (FIC)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="ficName" 
                    placeholder="Prof. Sourish Kumar" 
                    className="pl-10"
                    value={formData.ficName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ficName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Official Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="contactEmail" 
                    type="email"
                    placeholder="robotics@kiit.ac.in" 
                    className="pl-10"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Society admins will use this email to log in.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Society Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="A brief about the society's goals..." 
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button className="w-full bg-primary" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                Register Society
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <CardTitle>Society Directory</CardTitle>
            <CardDescription>All registered societies on EventSphere.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead>Society Details</TableHead>
                  <TableHead>FIC</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetching ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : societies.map((soc) => (
                  <TableRow key={soc.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{soc.name}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{soc.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{soc.fic_name || 'Not Set'}</TableCell>
                    <TableCell className="text-sm font-medium text-primary underline">{soc.contact_email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deleteSociety(soc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!fetching && societies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No societies registered. Add your first society!
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
