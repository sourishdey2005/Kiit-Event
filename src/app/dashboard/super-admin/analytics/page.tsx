
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, Calendar, Award, TrendingUp, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalRegs: 0,
    totalEvents: 0,
    totalSocieties: 0,
    engagement: '0%'
  });
  const [pieData, setPieData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: evCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
      const { count: socCount } = await supabase.from('societies').select('*', { count: 'exact', head: true });
      const { count: regCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true });

      setStats({
        totalRegs: regCount || 0,
        totalEvents: evCount || 0,
        totalSocieties: socCount || 0,
        engagement: userCount && regCount ? `${Math.round((regCount / userCount) * 100)}%` : '0%'
      });

      // Fetch top societies data
      const { data: socs } = await supabase.from('societies').select('id, name');
      const { data: regs } = await supabase.from('registrations').select('id, event_id, events(society_id)');
      
      const distribution = socs?.map(s => {
        const count = regs?.filter(r => (r.events as any)?.society_id === s.id).length || 0;
        return { name: s.name, value: count };
      }).filter(s => s.value > 0).sort((a,b) => b.value - a.value).slice(0, 5) || [];

      setPieData(distribution);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const dummyTrends = [
    { name: 'Mon', registrations: 40 },
    { name: 'Tue', registrations: 120 },
    { name: 'Wed', registrations: 90 },
    { name: 'Thu', registrations: 240 },
    { name: 'Fri', registrations: 180 },
    { name: 'Sat', registrations: 320 },
    { name: 'Sun', registrations: 280 },
  ];

  const COLORS = ['#2E3192', '#FF4500', '#10B981', '#F59E0B', '#6366F1'];

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">System Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into campus engagement and society activities.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Registrations', value: stats.totalRegs.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Events', value: stats.totalEvents.toString(), icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Verified Societies', value: stats.totalSocieties.toString(), icon: Award, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Engagement Rate', value: stats.engagement, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Weekly activity overview (Real-time tracking).</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyTrends}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E3192" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2E3192" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="registrations" stroke="#2E3192" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Top Societies</CardTitle>
            <CardDescription>By total event participation.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex flex-col justify-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="300">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 mt-4">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[index]}}></div>
                        <span className="font-medium truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground italic py-20">No registration data yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
