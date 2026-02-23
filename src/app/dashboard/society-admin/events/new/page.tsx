
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Users, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateEventDescription } from '@/ai/flows/generate-event-description';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';

export default function CreateEvent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    limit: '100',
    description: '',
    keywords: ''
  });

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.keywords) {
      toast({
        variant: "destructive",
        title: "Incomplete details",
        description: "Please provide an event name and some keywords to help the AI."
      });
      return;
    }

    setGeneratingAi(true);
    try {
      const result = await generateEventDescription({
        eventName: formData.title,
        textInput: formData.keywords,
        eventDate: formData.date,
        eventVenue: formData.venue,
        eventTime: formData.time
      });
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({
        title: "AI Description Generated!",
        description: "Review the generated content in the description box."
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Could not generate description. Please try again."
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.society_id) return;
    
    setLoading(true);
    try {
      const eventDateTime = `${formData.date}T${formData.time}:00Z`;
      
      const { error } = await supabase
        .from('events')
        .insert([{
          title: formData.title,
          description: formData.description,
          venue: formData.venue,
          event_date: eventDateTime,
          max_limit: parseInt(formData.limit),
          society_id: user.society_id,
          created_by: user.id,
          verified: false // Awaiting Super Admin
        }]);

      if (error) throw error;

      toast({
        title: "Event Submitted!",
        description: "Your event has been sent to Super Admin for verification."
      });
      router.push('/dashboard/society-admin');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Launch Failed",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Create New Event</h1>
        <p className="text-muted-foreground">Fill in the details to launch your campus event.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Annual Tech Symposium" 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="date" 
                      type="date" 
                      className="pl-10" 
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="venue" 
                      placeholder="e.g. Campus 3 Auditorium" 
                      className="pl-10" 
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Participation Limit</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="limit" 
                      type="number" 
                      className="pl-10" 
                      value={formData.limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden border-t-4 border-accent">
            <CardHeader className="bg-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-accent flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI Description Generator
                  </CardTitle>
                  <CardDescription>Let AI write a compelling description for you.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords / Short Outline</Label>
                <Textarea 
                  id="keywords" 
                  placeholder="e.g. Coding contest, 24 hours, cash prizes, free snacks"
                  className="min-h-[100px]"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                onClick={handleAiGenerate}
                disabled={generatingAi}
              >
                {generatingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating your story...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Engaging Description
                  </>
                )}
              </Button>

              <div className="space-y-2 pt-4">
                <Label htmlFor="description">Event Description</Label>
                <Textarea 
                  id="description" 
                  className="min-h-[250px]" 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Poster</CardTitle>
              <CardDescription>Upload an eye-catching event poster.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-4 hover:border-primary transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (Max 5MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white border-none shadow-xl">
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <h4 className="font-bold text-lg">Almost Done!</h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Your event will be submitted for verification. Super Admins usually approve within 24 hours.
                </p>
              </div>
              <Button type="submit" className="w-full bg-white text-primary hover:bg-slate-100 font-bold h-12" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Launch Event Request"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
