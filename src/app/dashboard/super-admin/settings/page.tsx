
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, Database, Globe, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SystemSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings Saved",
        description: "System configuration updated successfully."
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-primary">System Settings</h1>
        <p className="text-muted-foreground">Configure global campus event management parameters.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="text-primary w-5 h-5" />
              <CardTitle>General Configuration</CardTitle>
            </div>
            <CardDescription>Basic system identifiers and public settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>System Name</Label>
                <Input defaultValue="KIIT EventSphere" />
              </div>
              <div className="space-y-2">
                <Label>Campus Domain</Label>
                <Input defaultValue="kiit.ac.in" readOnly className="bg-slate-50" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Open Registrations</Label>
                <p className="text-xs text-muted-foreground">Allow students to sign up for new accounts.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="text-accent w-5 h-5" />
              <CardTitle>Security & Access</CardTitle>
            </div>
            <CardDescription>Manage how users interact with the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Require Event Verification</Label>
                <p className="text-xs text-muted-foreground">All society events must be approved by Super Admin.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Auto-Promote Society Admins</Label>
                <p className="text-xs text-muted-foreground">Automatically link users to societies via verified emails.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="text-orange-500 w-5 h-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Automated email and alert settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Email Reminders</Label>
                <p className="text-xs text-muted-foreground">Send reminders 24 hours before events start.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Support Contact Email</Label>
              <Input placeholder="support@eventsphere.com" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="bg-primary px-8">
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
