import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Bell, Send, AlertCircle, Info, AlertTriangle, CheckCircle, Search, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'maintenance' | 'announcement' | 'alert' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: 'all' | 'merchants' | 'admins';
  status: 'draft' | 'sent' | 'scheduled';
  scheduledFor?: string;
  sentAt?: string;
  sentBy: string;
  recipients: number;
  readCount: number;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Scheduled System Maintenance',
    message: 'We will be performing system maintenance on January 15, 2025, from 2:00 AM to 4:00 AM UTC. Some services may be temporarily unavailable during this time.',
    type: 'maintenance',
    priority: 'high',
    targetAudience: 'all',
    status: 'sent',
    sentAt: '2025-01-10T10:30:00',
    sentBy: 'Admin Support',
    recipients: 1247,
    readCount: 1089
  },
  {
    id: 'notif-2',
    title: 'New Feature: Multi-Currency Support',
    message: 'Exciting news! We have launched multi-currency support. Merchants can now accept payments in USD, EUR, GBP, and more. Check your dashboard to configure your preferred currencies.',
    type: 'announcement',
    priority: 'medium',
    targetAudience: 'merchants',
    status: 'sent',
    sentAt: '2025-01-08T14:15:00',
    sentBy: 'Product Team',
    recipients: 986,
    readCount: 823
  },
  {
    id: 'notif-3',
    title: 'Security Alert: Password Policy Update',
    message: 'To enhance security, we have updated our password policy. All users are required to update their passwords to meet the new requirements within 7 days.',
    type: 'alert',
    priority: 'critical',
    targetAudience: 'all',
    status: 'sent',
    sentAt: '2025-01-05T09:00:00',
    sentBy: 'Security Team',
    recipients: 1247,
    readCount: 1201
  },
  {
    id: 'notif-4',
    title: 'Q1 Platform Updates',
    message: 'Get ready for exciting updates coming in Q1 2025, including enhanced analytics, improved mobile app, and new payment methods.',
    type: 'info',
    priority: 'low',
    targetAudience: 'all',
    status: 'scheduled',
    scheduledFor: '2025-01-20T08:00:00',
    sentBy: 'Marketing Team',
    recipients: 1247,
    readCount: 0
  },
  {
    id: 'notif-5',
    title: 'API Rate Limit Increase',
    message: 'Good news for developers! We have increased API rate limits by 50% to support growing businesses. No action needed on your part.',
    type: 'announcement',
    priority: 'medium',
    targetAudience: 'merchants',
    status: 'sent',
    sentAt: '2025-01-03T11:45:00',
    sentBy: 'Technical Team',
    recipients: 986,
    readCount: 654
  }
];

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'announcement' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    targetAudience: 'all' as Notification['targetAudience'],
    scheduledFor: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive"
      });
      return;
    }

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      ...newNotification,
      status: newNotification.scheduledFor ? 'scheduled' : 'sent',
      sentAt: newNotification.scheduledFor ? undefined : new Date().toISOString(),
      sentBy: 'Current Admin',
      recipients: newNotification.targetAudience === 'all' ? 1247 : 
                  newNotification.targetAudience === 'merchants' ? 986 : 261,
      readCount: 0
    };

    setNotifications([notification, ...notifications]);
    setCreateDialogOpen(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      targetAudience: 'all',
      scheduledFor: ''
    });

    toast({
      title: "Notification Created",
      description: newNotification.scheduledFor ? "Notification scheduled successfully" : "Notification sent successfully"
    });
  };

  const handleDeleteNotification = () => {
    if (notificationToDelete) {
      setNotifications(notifications.filter(n => n.id !== notificationToDelete));
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed"
      });
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance': return <AlertCircle className="h-4 w-4" />;
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'announcement': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'alert': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'info': return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'scheduled': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'draft': return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    totalRecipients: notifications.reduce((sum, n) => sum + (n.status === 'sent' ? n.readCount : 0), 0)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications & Announcements</h1>
            <p className="text-muted-foreground">
              Send maintenance alerts, announcements, and communications
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Compose a notification to send to your users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter notification message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newNotification.type} onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newNotification.priority} onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={newNotification.targetAudience} onValueChange={(value: any) => setNewNotification({ ...newNotification, targetAudience: value })}>
                      <SelectTrigger id="audience">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="merchants">Merchants Only</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Schedule (Optional)</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={newNotification.scheduledFor}
                      onChange={(e) => setNewNotification({ ...newNotification, scheduledFor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateNotification}>
                  {newNotification.scheduledFor ? 'Schedule' : 'Send'} Notification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNotificationToDelete(notification.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                      <Badge variant="outline">
                        {notification.targetAudience}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {notification.sentBy}</span>
                      {notification.sentAt && (
                        <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                      )}
                      {notification.scheduledFor && (
                        <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                      )}
                      {notification.status === 'sent' && (
                        <span>{notification.readCount} / {notification.recipients} read</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <p className="mt-1 font-semibold">{selectedNotification.title}</p>
                </div>
                <div>
                  <Label>Message</Label>
                  <p className="mt-1 text-sm">{selectedNotification.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Badge variant="outline" className={`mt-1 ${getTypeColor(selectedNotification.type)}`}>
                      {selectedNotification.type}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline" className={`mt-1 ${getPriorityColor(selectedNotification.priority)}`}>
                      {selectedNotification.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant="outline" className={`mt-1 ${getStatusColor(selectedNotification.status)}`}>
                      {selectedNotification.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <p className="mt-1 text-sm">{selectedNotification.targetAudience}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sent By</Label>
                    <p className="mt-1 text-sm">{selectedNotification.sentBy}</p>
                  </div>
                  {selectedNotification.sentAt && (
                    <div>
                      <Label>Sent At</Label>
                      <p className="mt-1 text-sm">{new Date(selectedNotification.sentAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedNotification.scheduledFor && (
                    <div>
                      <Label>Scheduled For</Label>
                      <p className="mt-1 text-sm">{new Date(selectedNotification.scheduledFor).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedNotification.status === 'sent' && (
                    <div>
                      <Label>Read Rate</Label>
                      <p className="mt-1 text-sm">
                        {selectedNotification.readCount} / {selectedNotification.recipients} 
                        ({Math.round((selectedNotification.readCount / selectedNotification.recipients) * 100)}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Notification</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this notification? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteNotification}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
