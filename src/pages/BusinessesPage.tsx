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
  DollarSign
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

interface Business {
  id: string;
  name: string;
  type: string;
  merchant: {
    id: string;
    name: string;
    email: string;
  };
  status: 'active' | 'inactive';
  location: string;
  phone: string;
  email: string;
  registrationDate: string;
  revenue: number;
  transactions: number;
  description: string;
}

// Mock data
const mockBusinesses: Business[] = [
  {
    id: 'BUS001',
    name: 'Green Valley Cafe',
    type: 'Restaurant',
    merchant: {
      id: 'MER001',
      name: 'Sarah Johnson',
      email: 'sarah@greenvalley.com'
    },
    status: 'active',
    location: 'Lagos, Nigeria',
    phone: '+234 801 234 5678',
    email: 'contact@greenvalley.com',
    registrationDate: '2024-01-15',
    revenue: 2500000,
    transactions: 1250,
    description: 'A cozy cafe serving organic coffee and healthy meals in the heart of Lagos.'
  },
  {
    id: 'BUS002',
    name: 'TechGear Electronics',
    type: 'Retail',
    merchant: {
      id: 'MER002',
      name: 'Michael Chen',
      email: 'michael@techgear.com'
    },
    status: 'active',
    location: 'Abuja, Nigeria',
    phone: '+234 802 345 6789',
    email: 'info@techgear.com',
    registrationDate: '2024-02-20',
    revenue: 5800000,
    transactions: 890,
    description: 'Leading electronics retailer specializing in smartphones, laptops, and accessories.'
  },
  {
    id: 'BUS003',
    name: 'Fashion Hub Boutique',
    type: 'Fashion',
    merchant: {
      id: 'MER003',
      name: 'Amara Okafor',
      email: 'amara@fashionhub.com'
    },
    status: 'inactive',
    location: 'Port Harcourt, Nigeria',
    phone: '+234 803 456 7890',
    email: 'hello@fashionhub.com',
    registrationDate: '2023-11-10',
    revenue: 1200000,
    transactions: 450,
    description: 'Trendy fashion boutique offering the latest styles and accessories for modern professionals.'
  },
  {
    id: 'BUS004',
    name: 'QuickFix Auto Services',
    type: 'Automotive',
    merchant: {
      id: 'MER004',
      name: 'David Adeyemi',
      email: 'david@quickfix.com'
    },
    status: 'active',
    location: 'Ibadan, Nigeria',
    phone: '+234 804 567 8901',
    email: 'service@quickfix.com',
    registrationDate: '2024-03-05',
    revenue: 3400000,
    transactions: 680,
    description: 'Professional auto repair and maintenance services with certified technicians.'
  },
  {
    id: 'BUS005',
    name: 'FreshMart Groceries',
    type: 'Grocery',
    merchant: {
      id: 'MER005',
      name: 'Grace Nwosu',
      email: 'grace@freshmart.com'
    },
    status: 'active',
    location: 'Enugu, Nigeria',
    phone: '+234 805 678 9012',
    email: 'support@freshmart.com',
    registrationDate: '2024-01-28',
    revenue: 4200000,
    transactions: 2100,
    description: 'Your neighborhood grocery store offering fresh produce and daily essentials.'
  },
  {
    id: 'BUS006',
    name: 'Elite Fitness Center',
    type: 'Fitness',
    merchant: {
      id: 'MER006',
      name: 'John Eze',
      email: 'john@elitefitness.com'
    },
    status: 'inactive',
    location: 'Lagos, Nigeria',
    phone: '+234 806 789 0123',
    email: 'info@elitefitness.com',
    registrationDate: '2023-12-12',
    revenue: 1800000,
    transactions: 320,
    description: 'Modern fitness center with state-of-the-art equipment and professional trainers.'
  },
  {
    id: 'BUS007',
    name: 'BookWorm Library Cafe',
    type: 'Entertainment',
    merchant: {
      id: 'MER007',
      name: 'Chioma Okeke',
      email: 'chioma@bookworm.com'
    },
    status: 'active',
    location: 'Lagos, Nigeria',
    phone: '+234 807 890 1234',
    email: 'hello@bookworm.com',
    registrationDate: '2024-02-14',
    revenue: 980000,
    transactions: 540,
    description: 'A unique combination of bookstore and cafe, perfect for readers and coffee lovers.'
  },
  {
    id: 'BUS008',
    name: 'Urban Beauty Salon',
    type: 'Beauty & Wellness',
    merchant: {
      id: 'MER008',
      name: 'Fatima Bello',
      email: 'fatima@urbanbeauty.com'
    },
    status: 'active',
    location: 'Kano, Nigeria',
    phone: '+234 808 901 2345',
    email: 'booking@urbanbeauty.com',
    registrationDate: '2024-01-20',
    revenue: 1650000,
    transactions: 780,
    description: 'Premium beauty salon offering hair styling, makeup, and wellness treatments.'
  }
];

export default function BusinessesPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
    const matchesType = typeFilter === 'all' || business.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: businesses.length,
    active: businesses.filter((b) => b.status === 'active').length,
    inactive: businesses.filter((b) => b.status === 'inactive').length,
    totalRevenue: businesses.reduce((sum, b) => sum + b.revenue, 0),
  };

  // Get unique business types
  const businessTypes = Array.from(new Set(businesses.map((b) => b.type)));

  const handleToggleStatus = (business: Business) => {
    const newStatus = business.status === 'active' ? 'inactive' : 'active';
    setBusinesses(
      businesses.map((b) =>
        b.id === business.id ? { ...b, status: newStatus } : b
      )
    );
    toast({
      title: 'Status Updated',
      description: `${business.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
    });
  };

  const handleViewDetails = (business: Business) => {
    setSelectedBusiness(business);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (business: Business) => {
    setBusinessToDelete(business);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (businessToDelete) {
      setBusinesses(businesses.filter((b) => b.id !== businessToDelete.id));
      toast({
        title: 'Business Deleted',
        description: `${businessToDelete.name} has been removed from the system.`,
        variant: 'destructive',
      });
      setBusinessToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all merchant businesses on the platform
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered merchants
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
                Temporarily closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform-wide
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
                    placeholder="Search by business name, merchant, location, or type..."
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
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
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
                                <div className="font-medium">{business.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {business.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{business.merchant.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {business.merchant.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{business.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {business.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={business.status === 'active' ? 'default' : 'secondary'}
                              className={
                                business.status === 'active'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-orange-600 hover:bg-orange-700'
                              }
                            >
                              {business.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatCurrency(business.revenue)}</div>
                              <div className="text-xs text-muted-foreground">
                                {business.transactions} transactions
                              </div>
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
                                <DropdownMenuItem onClick={() => handleToggleStatus(business)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  {business.status === 'active' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(business)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Business
                                </DropdownMenuItem>
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
                  <h3 className="text-xl font-semibold">{selectedBusiness.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedBusiness.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedBusiness.type}</Badge>
                    <Badge
                      variant={selectedBusiness.status === 'active' ? 'default' : 'secondary'}
                      className={
                        selectedBusiness.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }
                    >
                      {selectedBusiness.status === 'active' ? 'Active' : 'Inactive'}
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
                        <p className="font-medium">{selectedBusiness.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Registration Date</p>
                        <p className="font-medium">{formatDate(selectedBusiness.registrationDate)}</p>
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
                        <p className="font-medium">{selectedBusiness.merchant.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Merchant Email</p>
                        <p className="font-medium">{selectedBusiness.merchant.email}</p>
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
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{selectedBusiness.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Business Email</p>
                      <p className="font-medium">{selectedBusiness.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Performance Metrics
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">{formatCurrency(selectedBusiness.revenue)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Transactions</p>
                          <p className="text-2xl font-bold">{selectedBusiness.transactions}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleToggleStatus(selectedBusiness)}
                  variant={selectedBusiness.status === 'active' ? 'outline' : 'default'}
                  className="flex-1"
                >
                  <Power className="mr-2 h-4 w-4" />
                  {selectedBusiness.status === 'active' ? 'Deactivate' : 'Activate'} Business
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteClick(selectedBusiness);
                    setIsDetailsOpen(false);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Business
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{businessToDelete?.name}</span> and remove all
              associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Business
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
