"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { 
  ShieldCheck, 
  AlertCircle, 
  BarChart2, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const pendingApprovals = [
    { id: '1', name: 'Sourish Kumar', email: '2205123@kiit.ac.in', society: 'KIIT Music Society', requestType: 'Admin Access' },
    { id: '2', name: 'Event: Mega Tech', email: 'admin@robotics.kiit', society: 'KIIT Robotics', requestType: 'Event Verification' },
  ];

  const globalStats = [
    { label: 'Total Registered Students', value: '45,230', trend: '+12%', icon: UserPlus },
    { label: 'Active Societies', value: '54', trend: '+2', icon: ShieldCheck },
    { label: 'Ongoing Events', value: '8', trend: 'Global', icon: Activity },
    { label: 'Revenue Generated', value: '₹1.2M', trend: '+5%', icon: BarChart2 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Global Control Center</h1>
          <p className="text-muted-foreground">Monitoring all campus activities and verifying society credentials.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">Download Audit Logs</Button>
          <Button className="bg-accent text-white hover:bg-accent/90">Global Emergency Alert</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-2 text-xs text-green-600 font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {stat.trend}
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
        <Card className="xl:col-span-2 shadow-md border-none overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Pending Verifications</CardTitle>
                <CardDescription>Actions required for new societies and events.</CardDescription>
              </div>
              <Badge variant="destructive" className="px-3">{pendingApprovals.length} Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">Entity</TableHead>
                  <TableHead>Society/Department</TableHead>
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
                      <Badge variant="outline" className="font-normal">{req.requestType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50">
                          <CheckCircle className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 bg-slate-50/30 text-center">
              <Button variant="link" className="text-sm text-primary">View All Verification Requests</Button>
            </div>
          </CardContent>
        </Card>

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
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Email Queue</span>
                <span>45/m</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-primary rounded-full" />
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