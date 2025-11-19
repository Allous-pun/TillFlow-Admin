import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MessageSquare, Star, Search, Trash2, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Feedback {
  id: string;
  userName: string;
  userEmail: string;
  userRole: 'merchant' | 'admin';
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'resolved' | 'closed';
  rating?: number;
  submittedAt: string;
  respondedAt?: string;
  response?: string;
}

const mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
    userRole: 'merchant',
    subject: 'Payment processing delay',
    message: 'I noticed that payment processing takes longer than expected during peak hours. Could this be optimized?',
    category: 'improvement',
    priority: 'medium',
    status: 'reviewed',
    rating: 4,
    submittedAt: '2025-01-15T10:30:00',
    respondedAt: '2025-01-15T14:20:00',
    response: 'Thank you for your feedback. We are working on optimizing our payment processing infrastructure.'
  },
  {
    id: 'fb-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@example.com',
    userRole: 'merchant',
    subject: 'Export feature not working',
    message: 'When I try to export transaction data to CSV, I get an error message. This happens consistently.',
    category: 'bug',
    priority: 'high',
    status: 'resolved',
    rating: 5,
    submittedAt: '2025-01-14T09:15:00',
    respondedAt: '2025-01-14T16:45:00',
    response: 'This bug has been fixed in the latest update. Please refresh your browser and try again.'
  },
  {
    id: 'fb-3',
    userName: 'Michael Brown',
    userEmail: 'mbrown@example.com',
    userRole: 'merchant',
    subject: 'Request for multi-language support',
    message: 'It would be great to have the platform available in Spanish and French to serve our international customers better.',
    category: 'feature',
    priority: 'low',
    status: 'pending',
    rating: 4,
    submittedAt: '2025-01-13T11:00:00'
  },
  {
    id: 'fb-4',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@example.com',
    userRole: 'admin',
    subject: 'Dashboard loading speed',
    message: 'The admin dashboard takes a while to load all the data. Could we implement lazy loading or pagination?',
    category: 'improvement',
    priority: 'medium',
    status: 'pending',
    submittedAt: '2025-01-12T15:30:00'
  },
  {
    id: 'fb-5',
    userName: 'David Wilson',
    userEmail: 'dwilson@example.com',
    userRole: 'merchant',
    subject: 'How to set up recurring payments?',
    message: 'I need help setting up recurring payments for subscription-based services. The documentation is not clear on this.',
    category: 'question',
    priority: 'medium',
    status: 'reviewed',
    submittedAt: '2025-01-11T13:45:00',
    respondedAt: '2025-01-11T16:00:00',
    response: 'Please refer to our updated documentation on recurring payments, or schedule a call with our support team.'
  }
];

export default function FeedbackPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(mockFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const filteredFeedback = feedbackList.filter((fb) => {
    const matchesSearch = fb.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fb.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fb.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || fb.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || fb.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRespond = () => {
    if (!selectedFeedback || !responseText) {
      toast({
        title: "Validation Error",
        description: "Response message is required",
        variant: "destructive"
      });
      return;
    }

    setFeedbackList(feedbackList.map(fb => 
      fb.id === selectedFeedback.id 
        ? { ...fb, status: 'reviewed', response: responseText, respondedAt: new Date().toISOString() }
        : fb
    ));

    setResponseText('');
    setViewDialogOpen(false);
    toast({
      title: "Response Sent",
      description: "Your response has been sent to the user"
    });
  };

  const handleStatusChange = (feedbackId: string, newStatus: Feedback['status']) => {
    setFeedbackList(feedbackList.map(fb =>
      fb.id === feedbackId ? { ...fb, status: newStatus } : fb
    ));
    toast({
      title: "Status Updated",
      description: `Feedback marked as ${newStatus}`
    });
  };

  const handleDeleteFeedback = () => {
    if (feedbackToDelete) {
      setFeedbackList(feedbackList.filter(fb => fb.id !== feedbackToDelete));
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
      toast({
        title: "Feedback Deleted",
        description: "The feedback has been removed"
      });
    }
  };

  const getCategoryColor = (category: Feedback['category']) => {
    switch (category) {
      case 'bug': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'feature': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'improvement': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'question': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'other': return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'reviewed': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'resolved': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'closed': return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: Feedback['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  const stats = {
    total: feedbackList.length,
    pending: feedbackList.filter(fb => fb.status === 'pending').length,
    reviewed: feedbackList.filter(fb => fb.status === 'reviewed').length,
    resolved: feedbackList.filter(fb => fb.status === 'resolved').length,
    avgRating: (feedbackList.filter(fb => fb.rating).reduce((sum, fb) => sum + (fb.rating || 0), 0) / 
                feedbackList.filter(fb => fb.rating).length).toFixed(1)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground">
            Review and respond to user feedback and suggestions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
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
                  placeholder="Search feedback..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bug">Bug Reports</SelectItem>
                  <SelectItem value="feature">Feature Requests</SelectItem>
                  <SelectItem value="improvement">Improvements</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>User Feedback</CardTitle>
            <CardDescription>
              Showing {filteredFeedback.length} of {feedbackList.length} feedback items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <div key={feedback.id} className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{feedback.subject}</h3>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: feedback.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {feedback.message}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getCategoryColor(feedback.category)}>
                          {feedback.category}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(feedback.status)}>
                          {getStatusIcon(feedback.status)}
                          <span className="ml-1">{feedback.status}</span>
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(feedback.priority)}>
                          {feedback.priority}
                        </Badge>
                        <Badge variant="outline">
                          {feedback.userRole}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{feedback.userName} • {feedback.userEmail}</span>
                        <span>{new Date(feedback.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setResponseText(feedback.response || '');
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={feedback.status}
                        onValueChange={(value: any) => handleStatusChange(feedback.id, value)}
                      >
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFeedbackToDelete(feedback.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View/Respond Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>View feedback and add response</DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User</Label>
                    <p className="mt-1 text-sm">{selectedFeedback.userName}</p>
                    <p className="text-xs text-muted-foreground">{selectedFeedback.userEmail}</p>
                  </div>
                  <div>
                    <Label>Submitted</Label>
                    <p className="mt-1 text-sm">{new Date(selectedFeedback.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <p className="mt-1 font-semibold">{selectedFeedback.subject}</p>
                </div>
                <div>
                  <Label>Message</Label>
                  <p className="mt-1 text-sm">{selectedFeedback.message}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getCategoryColor(selectedFeedback.category)}>
                    {selectedFeedback.category}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(selectedFeedback.priority)}>
                    {selectedFeedback.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedFeedback.status)}>
                    {selectedFeedback.status}
                  </Badge>
                </div>
                {selectedFeedback.response && (
                  <div>
                    <Label>Previous Response</Label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded">{selectedFeedback.response}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Responded at: {selectedFeedback.respondedAt ? new Date(selectedFeedback.respondedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response to the user..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button onClick={handleRespond}>Send Response</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this feedback? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFeedback}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
