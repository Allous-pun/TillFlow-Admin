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
import { Bell, Send, AlertCircle, Info, AlertTriangle, CheckCircle, Search, Trash2, Eye, Play, Edit2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationAction {
  text: string;
  url: string;
  type: 'primary' | 'secondary';
  _id?: string;
  id?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'maintenance' | 'announcement' | 'alert' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  audience: 'all' | 'merchants' | 'admins';
  isActive: boolean;
  scheduledFor?: string;
  expiresAt?: string;
  status: 'draft' | 'sent' | 'scheduled';
  actions: NotificationAction[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  targetBusinesses: any[];
  isUnread?: boolean | null;
  readCount: number;
  recipients?: number;
}

interface NotificationStats {
  total: number;
  sent: number;
  scheduled: number;
  draft: number;
  totalRecipients: number;
  totalReads: number;
  readRate: number;
}

export default function NotificationsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    totalRecipients: 0,
    totalReads: 0,
    readRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'announcement' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    audience: 'all' as Notification['audience'],
    scheduledFor: '',
    actions: [] as NotificationAction[]
  });

  const [editNotification, setEditNotification] = useState({
    title: '',
    message: '',
    type: 'announcement' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    audience: 'all' as Notification['audience'],
    scheduledFor: '',
    actions: [] as NotificationAction[]
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const notificationsData = await fetchNotifications();
      await fetchStats(notificationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (): Promise<Notification[]> => {
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/notifications/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const notificationsData = data.notifications || [];
        setNotifications(notificationsData);
        return notificationsData;
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive"
      });
      setNotifications([]);
      return [];
    }
  };

  const fetchStats = async (notificationsData: Notification[]) => {
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/notifications/admin/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If stats endpoint doesn't exist, calculate from notifications
        console.warn('Stats endpoint not available, calculating from notifications');
        calculateStatsFromNotifications(notificationsData);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        calculateStatsFromNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      calculateStatsFromNotifications(notificationsData);
    }
  };

  const calculateStatsFromNotifications = (notificationsData: Notification[]) => {
    const total = notificationsData.length;
    const sent = notificationsData.filter(n => n.status === 'sent').length;
    const scheduled = notificationsData.filter(n => n.status === 'scheduled').length;
    const draft = notificationsData.filter(n => n.status === 'draft').length;
    const totalReads = notificationsData.reduce((sum, n) => sum + (n.readCount || 0), 0);
    const totalRecipients = notificationsData.reduce((sum, n) => {
      if (n.audience === 'all') return sum + 1247; // Estimated user counts
      if (n.audience === 'merchants') return sum + 986;
      return sum + 261; // admins
    }, 0);

    setStats({
      total,
      sent,
      scheduled,
      draft,
      totalRecipients,
      totalReads,
      readRate: totalRecipients > 0 ? (totalReads / totalRecipients) * 100 : 0
    });
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const requestBody = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        audience: newNotification.audience,
        actions: newNotification.actions,
        ...(newNotification.scheduledFor && { scheduledFor: newNotification.scheduledFor })
      };

      const response = await fetch('https://tillflow-backend.onrender.com/api/notifications/admin/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications([data.notification, ...notifications]);
        setCreateDialogOpen(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'announcement',
          priority: 'medium',
          audience: 'all',
          scheduledFor: '',
          actions: []
        });

        toast({
          title: "Notification Created",
          description: "Notification has been created successfully"
        });
      } else {
        throw new Error(data.message || 'Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      });
    }
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification) return;

    try {
      const requestBody = {
        title: editNotification.title,
        message: editNotification.message,
        type: editNotification.type,
        priority: editNotification.priority,
        audience: editNotification.audience,
        actions: editNotification.actions,
        ...(editNotification.scheduledFor && { scheduledFor: editNotification.scheduledFor })
      };

      const response = await fetch(`https://tillflow-backend.onrender.com/api/notifications/admin/notifications/${selectedNotification.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(notifications.map(n => 
          n.id === selectedNotification.id ? data.notification : n
        ));
        setEditDialogOpen(false);
        setSelectedNotification(null);
        
        toast({
          title: "Notification Updated",
          description: "Notification has been updated successfully"
        });
      } else {
        throw new Error(data.message || 'Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const handlePublishNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/notifications/admin/notifications/${notificationId}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, status: 'sent', isActive: true } : n
        ));
        
        toast({
          title: "Notification Published",
          description: "Notification has been published successfully"
        });
      } else {
        throw new Error(data.message || 'Failed to publish notification');
      }
    } catch (error) {
      console.error('Error publishing notification:', error);
      toast({
        title: "Error",
        description: "Failed to publish notification",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;

    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/notifications/admin/notifications/${notificationToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(notifications.filter(n => n.id !== notificationToDelete));
        setDeleteDialogOpen(false);
        setNotificationToDelete(null);
        
        toast({
          title: "Notification Deleted",
          description: "Notification has been deleted successfully"
        });
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setEditNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      audience: notification.audience,
      scheduledFor: notification.scheduledFor || '',
      actions: notification.actions || []
    });
    setEditDialogOpen(true);
  };

  const addAction = () => {
    setNewNotification({
      ...newNotification,
      actions: [...newNotification.actions, { text: '', url: '', type: 'primary' }]
    });
  };

  const updateAction = (index: number, field: string, value: string) => {
    const updatedActions = [...newNotification.actions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    setNewNotification({ ...newNotification, actions: updatedActions });
  };

  const removeAction = (index: number) => {
    const updatedActions = newNotification.actions.filter((_, i) => i !== index);
    setNewNotification({ ...newNotification, actions: updatedActions });
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance': return <AlertCircle className="h-4 w-4" />;
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'announcement': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'alert': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'info': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'scheduled': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'draft': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getRecipientCount = (audience: Notification['audience']) => {
    switch (audience) {
      case 'all': return 1247;
      case 'merchants': return 986;
      case 'admins': return 261;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

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
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
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
                      <Select value={newNotification.audience} onValueChange={(value: any) => setNewNotification({ ...newNotification, audience: value })}>
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
                  
                  {/* Actions Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Actions</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addAction}>
                        Add Action
                      </Button>
                    </div>
                    {newNotification.actions.map((action, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Button text"
                            value={action.text}
                            onChange={(e) => updateAction(index, 'text', e.target.value)}
                          />
                          <Input
                            placeholder="URL"
                            value={action.url}
                            onChange={(e) => updateAction(index, 'url', e.target.value)}
                          />
                        </div>
                        <Select 
                          value={action.type} 
                          onValueChange={(value: 'primary' | 'secondary') => updateAction(index, 'type', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateNotification}>
                    Create Notification
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
              <div className="text-2xl font-bold">{(stats.totalReads || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(stats.readRate || 0)}% read rate
              </p>
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
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No notifications found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
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
                            onClick={() => openEditDialog(notification)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {notification.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublishNotification(notification.id)}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNotificationToDelete(notification.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
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
                          {notification.audience}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By {notification.createdBy?.name || 'Unknown'}</span>
                        <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.scheduledFor && (
                          <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                        )}
                        {notification.status === 'sent' && (
                          <span>
                            {notification.readCount || 0} / {getRecipientCount(notification.audience)} read 
                            ({Math.round(((notification.readCount || 0) / getRecipientCount(notification.audience)) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedNotification.message}</p>
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
                    <p className="mt-1 text-sm">{selectedNotification.audience}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created By</Label>
                    <p className="mt-1 text-sm">{selectedNotification.createdBy?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label>Created At</Label>
                    <p className="mt-1 text-sm">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                  </div>
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
                        {selectedNotification.readCount || 0} / {getRecipientCount(selectedNotification.audience)} 
                        ({Math.round(((selectedNotification.readCount || 0) / getRecipientCount(selectedNotification.audience)) * 100)}%)
                      </p>
                    </div>
                  )}
                </div>
                {selectedNotification.actions && selectedNotification.actions.length > 0 && (
                  <div>
                    <Label>Actions</Label>
                    <div className="mt-2 space-y-2">
                      {selectedNotification.actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <Badge variant={action.type === 'primary' ? 'default' : 'outline'}>
                            {action.text}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{action.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notification</DialogTitle>
              <DialogDescription>
                Update notification details
              </DialogDescription>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Enter notification title"
                    value={editNotification.title}
                    onChange={(e) => setEditNotification({ ...editNotification, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-message">Message</Label>
                  <Textarea
                    id="edit-message"
                    placeholder="Enter notification message"
                    value={editNotification.message}
                    onChange={(e) => setEditNotification({ ...editNotification, message: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type</Label>
                    <Select value={editNotification.type} onValueChange={(value: any) => setEditNotification({ ...editNotification, type: value })}>
                      <SelectTrigger id="edit-type">
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
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select value={editNotification.priority} onValueChange={(value: any) => setEditNotification({ ...editNotification, priority: value })}>
                      <SelectTrigger id="edit-priority">
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
                    <Label htmlFor="edit-audience">Target Audience</Label>
                    <Select value={editNotification.audience} onValueChange={(value: any) => setEditNotification({ ...editNotification, audience: value })}>
                      <SelectTrigger id="edit-audience">
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
                    <Label htmlFor="edit-scheduledFor">Schedule (Optional)</Label>
                    <Input
                      id="edit-scheduledFor"
                      type="datetime-local"
                      value={editNotification.scheduledFor}
                      onChange={(e) => setEditNotification({ ...editNotification, scheduledFor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateNotification}>Update Notification</Button>
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