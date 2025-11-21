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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit2, 
  Key, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Copy,
  Eye,
  EyeOff,
  Users,
  DollarSign,
  RefreshCw,
  Zap,
  BarChart3,
  Sparkles,
  Globe,
  Building,
  Trash2,
  Play,
  Pause,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Real token plan interface matching your backend
interface TokenPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  formattedDuration: string;
  features: string[];
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  updatedAt: string;
}

// Token interface matching your backend
interface Token {
  id: string;
  tokenValue: string;
  plan: TokenPlan;
  business?: any;
  price: number;
  formattedPrice: string;
  transactionLimit: number;
  revenueLimit: number;
  transactionsUsed: number;
  revenueUsed: number;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  isActive: boolean;
  usagePercentage: number;
  daysRemaining: number | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function TokenizationPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plans, setPlans] = useState<TokenPlan[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [isCreateTokenDialogOpen, setIsCreateTokenDialogOpen] = useState(false);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [isEditTokenDialogOpen, setIsEditTokenDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeletePlanDialogOpen, setIsDeletePlanDialogOpen] = useState(false);
  const [isDeleteTokenDialogOpen, setIsDeleteTokenDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TokenPlan | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({});

  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    duration: 7,
    features: [] as string[],
    isPublic: true,
  });

  const [tokenFormData, setTokenFormData] = useState({
    planId: '',
    price: 0,
    transactionLimit: 100,
    revenueLimit: 0,
  });

  const [editTokenFormData, setEditTokenFormData] = useState({
    price: 0,
    transactionLimit: 100,
    revenueLimit: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchTokens(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/tokens/admin/plans', {
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
        setPlans(data.plans);
      } else {
        throw new Error(data.message || 'Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch token plans",
        variant: "destructive",
      });
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/tokens/admin/tokens', {
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
        setTokens(data.tokens || []);
      } else {
        throw new Error(data.message || 'Failed to fetch tokens');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tokens",
        variant: "destructive",
      });
      setTokens([]);
    }
  };

  // Filter tokens - now using real tokens data
  const filteredTokens = tokens.filter(token => {
    const businessName = token.business?.businessName || 'Unassigned';
    const matchesSearch = businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.tokenValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || token.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics - updated with real data
  const stats = {
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.isActive).length,
    totalTokens: tokens.length,
    activeTokens: tokens.filter(t => t.status === 'active').length,
    expiredTokens: tokens.filter(t => t.status === 'expired').length,
    totalRevenue: tokens.reduce((sum, token) => sum + (token.price || 0), 0) / 100,
    totalTransactions: tokens.reduce((sum, token) => sum + token.transactionsUsed, 0),
  };

  // Create token plan
  const handleCreatePlan = async () => {
    if (!planFormData.name || !planFormData.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/tokens/admin/plans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPlans([data.plan, ...plans]);
        setIsCreatePlanDialogOpen(false);
        setPlanFormData({ 
          name: '', 
          description: '', 
          duration: 7, 
          features: [], 
          isPublic: true 
        });
        
        toast({
          title: "Plan Created",
          description: `${data.plan.name} has been created successfully`,
        });
      } else {
        throw new Error(data.message || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    }
  };

  // Update token plan
  const handleUpdatePlan = async () => {
    if (!selectedPlan || !planFormData.name || !planFormData.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPlans(plans.map(plan => 
          plan.id === selectedPlan.id ? data.plan : plan
        ));
        setIsEditPlanDialogOpen(false);
        setSelectedPlan(null);
        setPlanFormData({ 
          name: '', 
          description: '', 
          duration: 7, 
          features: [], 
          isPublic: true 
        });
        
        toast({
          title: "Plan Updated",
          description: "Plan details have been updated successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    }
  };

  // Delete token plan
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/plans/${selectedPlan.id}`, {
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
        setPlans(plans.filter(plan => plan.id !== selectedPlan.id));
        setIsDeletePlanDialogOpen(false);
        setSelectedPlan(null);
        
        toast({
          title: "Plan Deleted",
          description: `${selectedPlan.name} has been deleted successfully`,
        });
      } else {
        throw new Error(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  // Create token from plan
  const handleCreateToken = async () => {
    if (!tokenFormData.planId) {
      toast({
        title: "Validation Error",
        description: "Please select a plan",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/tokens/admin/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Add the new token to the tokens list
        setTokens([data.token, ...tokens]);
        setIsCreateTokenDialogOpen(false);
        setTokenFormData({
          planId: '',
          price: 0,
          transactionLimit: 100,
          revenueLimit: 0,
        });
        
        toast({
          title: "Token Created",
          description: "Token has been created successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to create token');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Error",
        description: "Failed to create token",
        variant: "destructive",
      });
    }
  };

  // Update token
  const handleUpdateToken = async () => {
    if (!selectedToken) {
      toast({
        title: "Validation Error",
        description: "No token selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/tokens/${selectedToken.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editTokenFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTokens(tokens.map(token => 
          token.id === selectedToken.id ? data.token : token
        ));
        setIsEditTokenDialogOpen(false);
        setSelectedToken(null);
        setEditTokenFormData({
          price: 0,
          transactionLimit: 100,
          revenueLimit: 0,
        });
        
        toast({
          title: "Token Updated",
          description: "Token details have been updated successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to update token');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      toast({
        title: "Error",
        description: "Failed to update token",
        variant: "destructive",
      });
    }
  };

  // Activate token
  const handleActivateToken = async (tokenId: string) => {
    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/tokens/${tokenId}/activate`, {
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
        setTokens(tokens.map(token => 
          token.id === tokenId ? { ...token, isActive: true, status: 'active' } : token
        ));
        
        toast({
          title: "Token Activated",
          description: "Token has been activated successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to activate token');
      }
    } catch (error) {
      console.error('Error activating token:', error);
      toast({
        title: "Error",
        description: "Failed to activate token",
        variant: "destructive",
      });
    }
  };

  // Deactivate token
  const handleDeactivateToken = async (tokenId: string) => {
    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/tokens/${tokenId}/deactivate`, {
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
        setTokens(tokens.map(token => 
          token.id === tokenId ? { ...token, isActive: false, status: 'suspended' } : token
        ));
        
        toast({
          title: "Token Deactivated",
          description: "Token has been deactivated successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to deactivate token');
      }
    } catch (error) {
      console.error('Error deactivating token:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate token",
        variant: "destructive",
      });
    }
  };

  // Delete token
  const handleDeleteToken = async () => {
    if (!selectedToken) return;

    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/tokens/${selectedToken.id}`, {
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
        setTokens(tokens.filter(token => token.id !== selectedToken.id));
        setIsDeleteTokenDialogOpen(false);
        setSelectedToken(null);
        
        toast({
          title: "Token Deleted",
          description: "Token has been deleted successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to delete token');
      }
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: "Error",
        description: "Failed to delete token",
        variant: "destructive",
      });
    }
  };

  // Toggle plan status
  const togglePlanStatus = async (plan: TokenPlan) => {
    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/tokens/admin/plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPlans(plans.map(p => 
          p.id === plan.id ? data.plan : p
        ));
        
        toast({
          title: `Plan ${!plan.isActive ? 'Activated' : 'Deactivated'}`,
          description: `${plan.name} is now ${!plan.isActive ? 'active' : 'inactive'}`,
        });
      } else {
        throw new Error(data.message || 'Failed to update plan status');
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive",
      });
    }
  };

  // Open create token dialog
  const openCreateTokenDialog = (plan?: TokenPlan) => {
    if (plan) {
      setTokenFormData({
        planId: plan.id,
        price: 0,
        transactionLimit: 100,
        revenueLimit: 0,
      });
    } else {
      setTokenFormData({
        planId: '',
        price: 0,
        transactionLimit: 100,
        revenueLimit: 0,
      });
    }
    setIsCreateTokenDialogOpen(true);
  };

  // Open edit plan dialog
  const openEditPlanDialog = (plan: TokenPlan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      features: plan.features,
      isPublic: plan.isPublic,
    });
    setIsEditPlanDialogOpen(true);
  };

  // Open edit token dialog
  const openEditTokenDialog = (token: Token) => {
    setSelectedToken(token);
    setEditTokenFormData({
      price: token.price,
      transactionLimit: token.transactionLimit,
      revenueLimit: token.revenueLimit,
    });
    setIsEditTokenDialogOpen(true);
  };

  // Open delete plan dialog
  const openDeletePlanDialog = (plan: TokenPlan) => {
    setSelectedPlan(plan);
    setIsDeletePlanDialogOpen(true);
  };

  // Open delete token dialog
  const openDeleteTokenDialog = (token: Token) => {
    setSelectedToken(token);
    setIsDeleteTokenDialogOpen(true);
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
  const getStatusBadge = (status: Token['status'], isActive: boolean) => {
    if (!isActive) {
      return <Badge className="bg-slate-500/10 text-slate-700 border-slate-500/20 hover:bg-slate-500/20"><Pause className="h-3 w-3 mr-1" />Inactive</Badge>;
    }

    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'suspended':
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      case 'revoked':
        return <Badge className="bg-slate-500/10 text-slate-700 border-slate-500/20 hover:bg-slate-500/20"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get plan status badge
  const getPlanStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge> :
      <Badge className="bg-slate-500/10 text-slate-700 border-slate-500/20 hover:bg-slate-500/20"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
  };

  // Mask token
  const maskToken = (token: string, tokenId: string) => {
    if (showToken[tokenId]) {
      return token;
    }
    return token.substring(0, 8) + '•••••••••••••••••';
  };

  // Refresh data
  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Refreshing",
      description: "Data is being refreshed",
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tokenization</h1>
            <p className="text-slate-600 mt-1">Manage token plans and create tokens</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setIsCreatePlanDialogOpen(true)} className="sm:w-auto bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Plans</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPlans}</p>
                  <p className="text-xs text-emerald-600 mt-1">{stats.activePlans} active</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Key className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tokens</p>
                  <p className="text-2xl font-bold text-violet-600 mt-1">{stats.totalTokens}</p>
                  <div className="flex gap-2 text-xs mt-1">
                    <span className="text-emerald-600">{stats.activeTokens} active</span>
                    <span className="text-rose-600">{stats.expiredTokens} expired</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-violet-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">KES {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.totalTransactions} transactions</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Rate</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {stats.totalTokens > 0 ? Math.round((stats.activeTokens / stats.totalTokens) * 100) : 0}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Token activation rate</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Plans Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Token Plans</CardTitle>
                <CardDescription>Create and manage token plans</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => openCreateTokenDialog()} variant="outline" className="md:w-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Token
                </Button>
                <Button onClick={() => setIsCreatePlanDialogOpen(true)} className="md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <Key className="h-12 w-12 opacity-20" />
                          <p className="font-medium">No plans created yet</p>
                          <p className="text-sm">Create your first token plan to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="text-slate-900">{plan.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan.formattedDuration}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {plan.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {plan.features.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{plan.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPlanStatusBadge(plan.isActive)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCreateTokenDialog(plan)}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <Sparkles className="h-4 w-4 mr-1" />
                              Create Token
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPlanDialog(plan)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlanStatus(plan)}
                              className={plan.isActive ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"}
                            >
                              {plan.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeletePlanDialog(plan)}
                              className="text-rose-600 hover:text-rose-700"
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

        {/* Tokens Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Tokens</CardTitle>
                <CardDescription>Manage created tokens</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search tokens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-[250px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Transaction Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                              {maskToken(token.tokenValue, token.id)}
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
                              onClick={() => copyToken(token.tokenValue)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                            {token.plan.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {token.formattedPrice}
                        </TableCell>
                        <TableCell>
                          {token.transactionLimit === 0 ? 'Unlimited' : token.transactionLimit.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(token.status, token.isActive)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{token.transactionsUsed}/{token.transactionLimit === 0 ? '∞' : token.transactionLimit}</span>
                              <span>{token.usagePercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  token.usagePercentage >= 90 ? 'bg-rose-500' :
                                  token.usagePercentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${token.usagePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(token.createdAt).toLocaleDateString()}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditTokenDialog(token)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {token.isActive ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeactivateToken(token.id)}
                                className="text-amber-600 hover:text-amber-700"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActivateToken(token.id)}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteTokenDialog(token)}
                              className="text-rose-600 hover:text-rose-700"
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

      {/* Create Plan Dialog */}
      <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Token Plan</DialogTitle>
            <DialogDescription>
              Create a new token plan for generating tokens
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 7-Day Free Trial"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this plan includes"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={planFormData.duration}
                onChange={(e) => setPlanFormData({ ...planFormData, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditPlanDialogOpen} onOpenChange={setIsEditPlanDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Token Plan</DialogTitle>
            <DialogDescription>
              Update plan details and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Plan Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., 7-Day Free Trial"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe what this plan includes"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (days) *</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                value={planFormData.duration}
                onChange={(e) => setPlanFormData({ ...planFormData, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Confirmation Dialog */}
      <Dialog open={isDeletePlanDialogOpen} onOpenChange={setIsDeletePlanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the plan "{selectedPlan?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Token Dialog */}
      <Dialog open={isCreateTokenDialogOpen} onOpenChange={setIsCreateTokenDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Token</DialogTitle>
            <DialogDescription>
              Create a new token from an existing plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Select Plan *</Label>
              <Select value={tokenFormData.planId} onValueChange={(value) => setTokenFormData({ ...tokenFormData, planId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.filter(plan => plan.isActive).map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.formattedDuration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="100"
                  value={tokenFormData.price}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionLimit">Transaction Limit</Label>
                <Input
                  id="transactionLimit"
                  type="number"
                  min="0"
                  placeholder="0 for unlimited"
                  value={tokenFormData.transactionLimit}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, transactionLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenueLimit">Revenue Limit (KES)</Label>
              <Input
                id="revenueLimit"
                type="number"
                min="0"
                placeholder="0 for unlimited"
                value={tokenFormData.revenueLimit}
                onChange={(e) => setTokenFormData({ ...tokenFormData, revenueLimit: parseInt(e.target.value) || 0 })}
              />
            </div>

            {tokenFormData.planId && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Selected Plan Details:</p>
                {(() => {
                  const selectedPlan = plans.find(p => p.id === tokenFormData.planId);
                  return selectedPlan ? (
                    <div className="text-sm text-slate-600 mt-1">
                      <p>• Name: {selectedPlan.name}</p>
                      <p>• Duration: {selectedPlan.formattedDuration}</p>
                      <p>• Description: {selectedPlan.description}</p>
                      <p>• Features: {selectedPlan.features.join(', ') || 'None'}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTokenDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateToken} 
              disabled={!tokenFormData.planId}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Token Dialog */}
      <Dialog open={isEditTokenDialogOpen} onOpenChange={setIsEditTokenDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Token</DialogTitle>
            <DialogDescription>
              Update token details and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (KES)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="100"
                  value={editTokenFormData.price}
                  onChange={(e) => setEditTokenFormData({ ...editTokenFormData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-transactionLimit">Transaction Limit</Label>
                <Input
                  id="edit-transactionLimit"
                  type="number"
                  min="0"
                  placeholder="0 for unlimited"
                  value={editTokenFormData.transactionLimit}
                  onChange={(e) => setEditTokenFormData({ ...editTokenFormData, transactionLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-revenueLimit">Revenue Limit (KES)</Label>
              <Input
                id="edit-revenueLimit"
                type="number"
                min="0"
                placeholder="0 for unlimited"
                value={editTokenFormData.revenueLimit}
                onChange={(e) => setEditTokenFormData({ ...editTokenFormData, revenueLimit: parseInt(e.target.value) || 0 })}
              />
            </div>

            {selectedToken && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Current Token Details:</p>
                <div className="text-sm text-slate-600 mt-1">
                  <p>• Plan: {selectedToken.plan.name}</p>
                  <p>• Current Price: {selectedToken.formattedPrice}</p>
                  <p>• Current Transaction Limit: {selectedToken.transactionLimit === 0 ? 'Unlimited' : selectedToken.transactionLimit}</p>
                  <p>• Current Revenue Limit: {selectedToken.revenueLimit === 0 ? 'Unlimited' : `KES ${(selectedToken.revenueLimit / 100).toLocaleString()}`}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTokenDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateToken}>Update Token</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Token Confirmation Dialog */}
      <Dialog open={isDeleteTokenDialogOpen} onOpenChange={setIsDeleteTokenDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Token</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this token? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTokenDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteToken}>
              Delete Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Token Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Token Details</DialogTitle>
            <DialogDescription>
              Complete information about this token
            </DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-600">Token</Label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-3 py-2 rounded font-mono flex-1 break-all">
                    {selectedToken.tokenValue}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToken(selectedToken.tokenValue)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Plan</Label>
                  <p className="font-medium">{selectedToken.plan.name}</p>
                  <p className="text-sm text-slate-500">{selectedToken.plan.description}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Status</Label>
                  <div>{getStatusBadge(selectedToken.status, selectedToken.isActive)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Price</Label>
                  <p className="font-medium">{selectedToken.formattedPrice}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Transaction Limit</Label>
                  <p className="font-medium">
                    {selectedToken.transactionLimit === 0 ? 'Unlimited' : selectedToken.transactionLimit.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Usage</Label>
                  <p className="text-sm">
                    {selectedToken.transactionsUsed} / {selectedToken.transactionLimit === 0 ? 'Unlimited' : selectedToken.transactionLimit} transactions
                  </p>
                  <p className="text-sm text-slate-500">{selectedToken.usagePercentage}% used</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Revenue Limit</Label>
                  <p className="font-medium">
                    {selectedToken.revenueLimit === 0 ? 'Unlimited' : `KES ${(selectedToken.revenueLimit / 100).toLocaleString()}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Created</Label>
                  <p className="text-sm">{new Date(selectedToken.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Days Remaining</Label>
                  <p className="text-sm font-medium">{selectedToken.daysRemaining || 'N/A'} days</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}