import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Key, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock token data
interface Token {
  id: string;
  name: string;
  token: string;
  type: 'API' | 'Access' | 'Integration' | 'Payment';
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  description: string;
  lastUsed?: string;
  usageCount: number;
}

const mockTokens: Token[] = [
  {
    id: '1',
    name: 'Payment Gateway API',
    token: 'tk_live_51MxT2KLkdIyHRiDq8Zv',
    type: 'Payment',
    status: 'active',
    createdAt: '2024-01-15',
    expiresAt: '2025-01-15',
    createdBy: 'admin@tillflow.com',
    description: 'Primary payment processing API key',
    lastUsed: '2024-01-20',
    usageCount: 1247
  },
  {
    id: '2',
    name: 'Merchant Integration',
    token: 'tk_test_49NdF8PLmkIyQRjEr5Yw',
    type: 'Integration',
    status: 'active',
    createdAt: '2024-01-18',
    expiresAt: '2024-07-18',
    createdBy: 'admin@tillflow.com',
    description: 'Merchant dashboard integration token',
    lastUsed: '2024-01-21',
    usageCount: 856
  },
  {
    id: '3',
    name: 'Legacy Access Token',
    token: 'tk_prod_38KcG7NLjhIxPRkDs4Xw',
    type: 'Access',
    status: 'expired',
    createdAt: '2023-06-10',
    expiresAt: '2024-01-10',
    createdBy: 'admin@tillflow.com',
    description: 'Old access token for legacy systems',
    usageCount: 523
  },
  {
    id: '4',
    name: 'API Webhooks',
    token: 'tk_live_62OxU3MLndJyISjFt6Zx',
    type: 'API',
    status: 'active',
    createdAt: '2024-01-12',
    expiresAt: '2025-01-12',
    createdBy: 'admin@tillflow.com',
    description: 'Webhook notification system',
    lastUsed: '2024-01-21',
    usageCount: 2341
  },
  {
    id: '5',
    name: 'Test Environment',
    token: 'tk_test_71PyV4NMoeKzJTkGu7Ay',
    type: 'Integration',
    status: 'inactive',
    createdAt: '2024-01-19',
    expiresAt: '2024-04-19',
    createdBy: 'admin@tillflow.com',
    description: 'Testing and development token',
    usageCount: 145
  },
];

export default function TokenizationPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    name: '',
    type: 'API' as Token['type'],
    description: '',
    expiresAt: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Filter tokens
  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || token.status === statusFilter;
    const matchesType = typeFilter === 'all' || token.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    total: tokens.length,
    active: tokens.filter(t => t.status === 'active').length,
    inactive: tokens.filter(t => t.status === 'inactive').length,
    expired: tokens.filter(t => t.status === 'expired').length,
  };

  // Generate random token
  const generateToken = () => {
    const prefix = formData.type === 'Payment' ? 'tk_live' : 
                   formData.type === 'API' ? 'tk_api' : 
                   formData.type === 'Access' ? 'tk_acc' : 'tk_int';
    const random = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
    return `${prefix}_${random}`;
  };

  // Create token
  const handleCreate = () => {
    if (!formData.name || !formData.expiresAt) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newToken: Token = {
      id: String(tokens.length + 1),
      name: formData.name,
      token: generateToken(),
      type: formData.type,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: formData.expiresAt,
      createdBy: user?.email || 'admin@tillflow.com',
      description: formData.description,
      usageCount: 0,
    };

    setTokens([newToken, ...tokens]);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', type: 'API', description: '', expiresAt: '' });
    
    toast({
      title: "Token Created",
      description: `${newToken.name} has been created successfully`,
    });
  };

  // Update token
  const handleUpdate = () => {
    if (!selectedToken || !formData.name || !formData.expiresAt) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setTokens(tokens.map(token => 
      token.id === selectedToken.id 
        ? { 
            ...token, 
            name: formData.name,
            type: formData.type,
            description: formData.description,
            expiresAt: formData.expiresAt,
          }
        : token
    ));
    
    setIsEditDialogOpen(false);
    setSelectedToken(null);
    setFormData({ name: '', type: 'API', description: '', expiresAt: '' });
    
    toast({
      title: "Token Updated",
      description: "Token details have been updated successfully",
    });
  };

  // Delete token
  const handleDelete = () => {
    if (!selectedToken) return;

    setTokens(tokens.filter(token => token.id !== selectedToken.id));
    setIsDeleteDialogOpen(false);
    setSelectedToken(null);
    
    toast({
      title: "Token Deleted",
      description: "The token has been permanently deleted",
      variant: "destructive",
    });
  };

  // Toggle token status
  const toggleTokenStatus = (token: Token) => {
    const newStatus = token.status === 'active' ? 'inactive' : 'active';
    setTokens(tokens.map(t => 
      t.id === token.id ? { ...t, status: newStatus } : t
    ));
    
    toast({
      title: `Token ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      description: `${token.name} is now ${newStatus}`,
    });
  };

  // Open edit dialog
  const openEditDialog = (token: Token) => {
    setSelectedToken(token);
    setFormData({
      name: token.name,
      type: token.type,
      description: token.description,
      expiresAt: token.expiresAt,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (token: Token) => {
    setSelectedToken(token);
    setIsDeleteDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (token: Token) => {
    setSelectedToken(token);
    setIsViewDialogOpen(true);
  };

  // Copy token to clipboard
  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Copied!",
      description: "Token copied to clipboard",
    });
  };

  // Toggle token visibility
  const toggleTokenVisibility = (tokenId: string) => {
    setShowToken(prev => ({ ...prev, [tokenId]: !prev[tokenId] }));
  };

  // Get status badge
  const getStatusBadge = (status: Token['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-500/10 text-slate-700 border-slate-500/20 hover:bg-slate-500/20"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'expired':
        return <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
    }
  };

  // Get type badge
  const getTypeBadge = (type: Token['type']) => {
    const colors = {
      API: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      Access: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
      Integration: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      Payment: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    };
    return <Badge variant="outline" className={colors[type]}>{type}</Badge>;
  };

  // Mask token
  const maskToken = (token: string, tokenId: string) => {
    if (showToken[tokenId]) {
      return token;
    }
    return token.substring(0, 8) + '•••••••••••••••••';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tokenization</h1>
          <p className="text-slate-600 mt-1">Manage API tokens, access keys, and integrations</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tokens</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-slate-500/10 flex items-center justify-center">
                  <Key className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Inactive</p>
                  <p className="text-2xl font-bold text-slate-600 mt-1">{stats.inactive}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-slate-500/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Expired</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{stats.expired}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-rose-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Token Management</CardTitle>
                <CardDescription>Create, update, and manage your API tokens</CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Token
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tokens by name, token, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Access">Access</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tokens Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <Key className="h-12 w-12 opacity-20" />
                          <p className="font-medium">No tokens found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="text-slate-900">{token.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{token.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                              {maskToken(token.token, token.id)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => toggleTokenVisibility(token.id)}
                            >
                              {showToken[token.id] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToken(token.token)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(token.type)}</TableCell>
                        <TableCell>{getStatusBadge(token.status)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {token.createdAt}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {token.expiresAt}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(token)}
                            >
                              View
                            </Button>
                            {token.status !== 'expired' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTokenStatus(token)}
                                >
                                  {token.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(token)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(token)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Token Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Token</DialogTitle>
            <DialogDescription>
              Generate a new API token or access key for integrations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Payment Gateway API"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Token Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as Token['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Access">Access</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of token usage"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date *</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Token</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Token Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Token</DialogTitle>
            <DialogDescription>
              Update token details and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Token Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Payment Gateway API"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Token Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as Token['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Access">Access</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of token usage"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiresAt">Expiration Date *</Label>
              <Input
                id="edit-expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Token</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Token Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token Details</DialogTitle>
            <DialogDescription>
              Complete information about this token
            </DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-600">Name</Label>
                <p className="font-medium">{selectedToken.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Token</Label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-3 py-2 rounded font-mono flex-1 break-all">
                    {selectedToken.token}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToken(selectedToken.token)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Type</Label>
                  <div>{getTypeBadge(selectedToken.type)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Status</Label>
                  <div>{getStatusBadge(selectedToken.status)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Description</Label>
                <p className="text-sm">{selectedToken.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Created</Label>
                  <p className="text-sm">{selectedToken.createdAt}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Expires</Label>
                  <p className="text-sm">{selectedToken.expiresAt}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Created By</Label>
                <p className="text-sm">{selectedToken.createdBy}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Usage Count</Label>
                  <p className="text-sm font-medium">{selectedToken.usageCount.toLocaleString()} requests</p>
                </div>
                {selectedToken.lastUsed && (
                  <div className="space-y-2">
                    <Label className="text-slate-600">Last Used</Label>
                    <p className="text-sm">{selectedToken.lastUsed}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Token?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedToken?.name}"? This action cannot be undone
              and will immediately invalidate the token across all systems.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
