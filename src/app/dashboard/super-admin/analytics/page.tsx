
"use client"

import React from 'react';
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
import { Users, Calendar, Award, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsDashboard() {
  const data = [
    { name: 'Oct 01', registrations: 400, events: 2 },
    { name: 'Oct 05', registrations: 1200, events: 5 },
    { name: 'Oct 10', registrations: 900, events: 3 },
    { name: 'Oct 15', registrations: 2400, events: 8 },
    { name: 'Oct 20', registrations: 1800, events: 4 },
    { name: 'Oct 25', registrations: 3200, events: 12 },
    { name: 'Oct 30', registrations: 2800, events: 7 },
  ];

  const societyPerformance = [
    { name: 'Robotics', value: 4500 },
    { name: 'KSAC', value: 3800 },
    { name: 'Kronos', value: 3200 },
    { name: 'Qutopia', value: 2100 },
    { name: 'Music Soc', value: 1800 },
  ];

  const COLORS = ['#2E3192', '#FF4500', '#10B981', '#F59E0B', '#6366F1'];

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
          { label: 'Total Registrations', value: '42,500', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Events', value: '1,240', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Verified Societies', value: '54', icon: Award, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Engagement Rate', value: '78%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
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
            <CardDescription>Number of students registering for events over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
            <ResponsiveContainer width="100%" height="300">
              <PieChart>
                <Pie
                  data={societyPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {societyPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {societyPerformance.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[index]}}></div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Society Engagement Distribution</CardTitle>
          <CardDescription>Comparing event frequency across departments.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="events" fill="#FF4500" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
