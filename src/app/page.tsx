"use client"

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Shield, Users, ArrowRight, Loader2 } from 'lucide-react';

function LandingContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "Welcome back!", description: "Logged in successfully." });
      } else {
        if (!name) {
          toast({ variant: "destructive", title: "Missing Name", description: "Please enter your name for registration." });
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, name);
        if (result.needsVerification) {
          toast({ 
            title: "Registration successful!", 
            description: "Please check your email to verify your account before logging in.",
          });
          // Switch to login view after successful signup request
          setIsLogin(true);
        } else {
          toast({ title: "Account created!", description: "Welcome to KIIT EventSphere." });
        }
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: error.message || "Please check your credentials and try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Events Redefined for KIIT
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary leading-tight">
            KIIT <span className="text-accent">EventSphere</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            The ultimate smart campus event and society management system. Stay updated, register instantly, and manage societies like a pro.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 p-2 bg-accent/10 rounded-lg text-accent">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Verified Events</h4>
                <p className="text-sm text-muted-foreground">Only approved university events.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Society Hub</h4>
                <p className="text-sm text-muted-foreground">Connect with all campus societies.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <Card className="w-full max-w-md glass-card border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Join the Community'}</CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Access your personalized event dashboard' 
                  : 'Register using your @kiit.ac.in email'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Sourish Kumar" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">KIIT Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@kiit.ac.in" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button className="w-full h-11 text-lg font-medium" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Register'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsLogin(!isLogin)}
                    disabled={loading}
                    className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="mt-20 text-muted-foreground text-sm">
        © {new Date().getFullYear()} KIIT University. Smart Campus Project.
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
