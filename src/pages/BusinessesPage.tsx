import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  MoreVertical,
  Eye,
  Power,
  Trash2,
  CheckCircle2,
  XCircle,
  Store,
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';

// Updated interface to match API response
interface Business {
  id: string;
  businessName: string;
  shortCode: string;
  businessType: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: Business[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function BusinessesPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [businessToActivate, setBusinessToActivate] = useState<Business | null>(null);
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchBusinesses();
    }
  }, [isAuthenticated, navigate]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://tillflow-backend.onrender.com/api/business/admin/all?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Please login again',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch businesses: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setBusinesses(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load businesses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBusinesses();
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.owner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (business.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      business.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.shortCode.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && business.isActive) ||
      (statusFilter === 'inactive' && !business.isActive);

    const matchesType = typeFilter === 'all' || business.industry === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: businesses.length,
    active: businesses.filter((b) => b.isActive).length,
    inactive: businesses.filter((b) => !b.isActive).length,
  };

  // Get unique business industries
  const businessIndustries = Array.from(new Set(businesses.map((b) => b.industry)));

  const handleActivateBusiness = async (business: Business) => {
    setBusinessToActivate(business);
    setActivateDialogOpen(true);
  };

  const handleActivateConfirm = async () => {
    if (!businessToActivate || !token) return;

    try {
      const response = await fetch(
        `https://tillflow-backend.onrender.com/api/business/admin/activate/${businessToActivate.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerEmail: businessToActivate.owner.email,
            adminSecretKey: adminSecretKey,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to activate business: ${response.status}`);
      }

      if (data.success) {
        // Update local state
        setBusinesses(businesses.map(b => 
          b.id === businessToActivate.id ? { ...b, isActive: true } : b
        ));
        
        toast({
          title: 'Business Activated',
          description: `${businessToActivate.businessName} has been activated successfully.`,
        });
        
        setActivateDialogOpen(false);
        setAdminSecretKey('');
        setBusinessToActivate(null);
      } else {
        throw new Error(data.message || 'Failed to activate business');
      }
    } catch (error) {
      console.error('Error activating business:', error);
      toast({
        title: 'Activation Failed',
        description: error instanceof Error ? error.message : 'Failed to activate business',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (business: Business) => {
    setSelectedBusiness(business);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLocationString = (business: Business) => {
    if (!business.location) return 'N/A';
    const { city, country } = business.location;
    return [city, country].filter(Boolean).join(', ') || 'N/A';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading businesses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all merchant businesses on the platform
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered businesses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently operating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Temporarily deactivated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Businesses</CardTitle>
                <CardDescription>
                  {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by business name, merchant, location, industry, or shortcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {businessIndustries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Businesses Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Short Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Store className="h-12 w-12 mb-2 opacity-50" />
                            <p className="font-medium">No businesses found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBusinesses.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{business.businessName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {business.contactEmail}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{business.owner.fullName}</div>
                              <div className="text-sm text-muted-foreground">
                                {business.owner.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{business.industry}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-muted rounded text-sm">
                              {business.shortCode}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{business.businessType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={business.isActive ? 'default' : 'secondary'}
                              className={
                                business.isActive
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-orange-600 hover:bg-orange-700'
                              }
                            >
                              {business.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(business.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(business)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {!business.isActive && (
                                  <DropdownMenuItem onClick={() => handleActivateBusiness(business)}>
                                    <Power className="mr-2 h-4 w-4" />
                                    Activate Business
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogDescription>
              Complete information about this business
            </DialogDescription>
          </DialogHeader>
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Business Header */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedBusiness.businessName}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedBusiness.industry}</Badge>
                    <Badge variant="secondary">{selectedBusiness.businessType}</Badge>
                    <Badge
                      variant={selectedBusiness.isActive ? 'default' : 'secondary'}
                      className={
                        selectedBusiness.isActive
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }
                    >
                      {selectedBusiness.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Business Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Business ID</p>
                        <p className="font-medium">{selectedBusiness.id}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium">{getLocationString(selectedBusiness)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Registered Date</p>
                        <p className="font-medium">{formatDate(selectedBusiness.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Short Code</p>
                        <code className="font-medium bg-muted px-2 py-1 rounded">
                          {selectedBusiness.shortCode}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Merchant Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Merchant Name</p>
                        <p className="font-medium">{selectedBusiness.owner.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Merchant Email</p>
                        <p className="font-medium">{selectedBusiness.owner.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Merchant Phone</p>
                        <p className="font-medium">{selectedBusiness.owner.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Business Phone</p>
                      <p className="font-medium">{selectedBusiness.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Business Email</p>
                      <p className="font-medium">{selectedBusiness.contactEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!selectedBusiness.isActive && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleActivateBusiness(selectedBusiness)}
                    className="flex-1"
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Activate Business
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activate Business Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Business</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to activate <span className="font-semibold">{businessToActivate?.businessName}</span>.
              Please confirm the owner's email and provide the admin secret key to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Owner Email</label>
              <Input
                value={businessToActivate?.owner.email || ''}
                disabled
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This email must match the business owner's registered email
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Secret Key</label>
              <Input
                type="password"
                value={adminSecretKey}
                onChange={(e) => setAdminSecretKey(e.target.value)}
                placeholder="Enter admin secret key"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for security verification
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setAdminSecretKey('');
                setBusinessToActivate(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivateConfirm}
              disabled={!adminSecretKey}
            >
              Activate Business
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}