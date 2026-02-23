
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Mail, User, Loader2, Search, Trash2, AlertCircle, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SocietyManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [societies, setSocieties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ficName: '',
    contactEmail: ''
  });

  const fetchSocieties = async () => {
    setFetching(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('societies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        if (supabaseError.code === '42501') {
          setError('Permission denied. Please run the "Bypass-Friendly" SQL script in your Supabase SQL Editor.');
          return;
        }
        throw new Error(supabaseError.message);
      }
      setSocieties(data || []);
    } catch (err: any) {
      console.error('Fetch Societies Error:', err);
      setError(err.message || 'Failed to sync with database.');
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
      const { error: supabaseError } = await supabase
        .from('societies')
        .insert([{
          name: formData.name,
          description: formData.description,
          fic_name: formData.ficName,
          contact_email: formData.contactEmail
        }]);

      if (supabaseError) throw new Error(supabaseError.message);

      toast({
        title: "Society Added!",
        description: `${formData.name} is now live in the system.`
      });
      
      setFormData({ name: '', description: '', ficName: '', contactEmail: '' });
      fetchSocieties();
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

  const deleteSociety = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase.from('societies').delete().eq('id', id);
      if (supabaseError) throw new Error(supabaseError.message);
      toast({ title: "Deleted", description: "Society removed." });
      fetchSocieties();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Failed", description: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Society Management</h1>
          <p className="text-muted-foreground">Manage campus organizations and their Faculty-in-Charge.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSocieties} disabled={fetching}>
          <Database className={`w-4 h-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
          Sync Live
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Sync Issue</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Register Society</CardTitle>
            <CardDescription>Setup a new society profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Society Name</Label>
                <Input 
                  placeholder="e.g. KIIT Music Society" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Faculty-in-Charge</Label>
                <Input 
                  placeholder="Prof. Name" 
                  value={formData.ficName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ficName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Official Email</Label>
                <Input 
                  type="email"
                  placeholder="society@kiit.ac.in" 
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Goals and vision..." 
                  className="min-h-[80px]"
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

        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg">Society Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/10">
                <TableRow>
                  <TableHead>Details</TableHead>
                  <TableHead>FIC</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetching ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : societies.map((soc) => (
                  <TableRow key={soc.id}>
                    <TableCell>
                      <div className="font-semibold">{soc.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{soc.description}</div>
                    </TableCell>
                    <TableCell className="text-sm">{soc.fic_name}</TableCell>
                    <TableCell className="text-sm text-primary">{soc.contact_email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSociety(soc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!fetching && societies.length === 0 && !error && (
                  <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No societies found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
