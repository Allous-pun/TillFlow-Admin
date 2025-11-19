import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  CreditCard,
  Building2,
  Bell,
  TrendingUp,
  Activity,
  DollarSign,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  // Mock statistics data
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      description: 'Active merchants & admins',
    },
    {
      title: 'Active Tokens',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: CreditCard,
      description: 'Tokens in circulation',
    },
    {
      title: 'Businesses',
      value: '856',
      change: '+23.1%',
      trend: 'up',
      icon: Building2,
      description: 'Registered businesses',
    },
    {
      title: 'Active Merchants',
      value: '2,156',
      change: '+15.3%',
      trend: 'up',
      icon: UserCheck,
      description: 'Currently active',
    },
  ];

  // Recent activities mock data
  const recentActivities = [
    { id: 1, type: 'user', message: 'New merchant registered: John Doe', time: '5 mins ago' },
    { id: 2, type: 'token', message: 'Token TK-8923 created', time: '12 mins ago' },
    { id: 3, type: 'business', message: 'Business "Coffee Shop" activated', time: '1 hour ago' },
    { id: 4, type: 'notification', message: 'Maintenance announcement sent', time: '2 hours ago' },
    { id: 5, type: 'user', message: 'User account deactivated', time: '3 hours ago' },
  ];

  // Quick actions
  const quickActions = [
    { title: 'Manage Users', href: '/dashboard/users', icon: Users, color: 'text-blue-600' },
    { title: 'Create Token', href: '/dashboard/tokenization', icon: CreditCard, color: 'text-green-600' },
    { title: 'View Businesses', href: '/dashboard/businesses', icon: Building2, color: 'text-purple-600' },
    { title: 'Send Notification', href: '/dashboard/notifications', icon: Bell, color: 'text-orange-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`flex items-center text-xs font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activity */}
          <Card className="col-span-full lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions on your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {activity.type === 'user' && <Users className="h-4 w-4 text-primary" />}
                      {activity.type === 'token' && <CreditCard className="h-4 w-4 text-primary" />}
                      {activity.type === 'business' && <Building2 className="h-4 w-4 text-primary" />}
                      {activity.type === 'notification' && <Bell className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activities
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto justify-start p-4 transition-all hover:shadow-md"
                      onClick={() => navigate(action.href)}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${action.color}`} />
                      <span className="font-medium">{action.title}</span>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">All Systems Operational</p>
                  <p className="text-xs text-muted-foreground">Last checked: Just now</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">API Status</p>
                  <p className="text-xs text-muted-foreground">Response time: 45ms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
