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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, UserCheck, UserX, Trash2, Eye, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Real user data type based on your MongoDB model
type User = {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'merchant';
  verified: boolean;
  profileCompleted: boolean;
  phoneNumber?: string;
  lastLogin?: string;
  createdAt: string;
  businesses?: Array<{
    _id: string;
    businessName: string;
    mpesaShortCode: string;
    businessType: string;
    isActive: boolean;
  }>;
};

type UserStats = {
  totalUsers: number;
  activeUsers: number;
  merchants: number;
  admins: number;
  verifiedUsers: number;
};

export default function UsersPage() {
  const { isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    merchants: 0,
    admins: 0,
    verifiedUsers: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUsers();
      fetchUserStats();
    }
  }, [isAuthenticated, navigate]);

  // Fetch all users from backend
  const fetchUsers = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('https://tillflow-backend.onrender.com/api/users/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      if (data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/users/admin/users/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user stats');
      }

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error: any) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.businesses?.some(business => 
            business.businessName.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => 
        statusFilter === 'active' ? user.verified : !user.verified
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, users]);

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'merchant') => {
    if (!token) return;
    
    try {
      setIsActionLoading(true);
      const response = await fetch(`https://tillflow-backend.onrender.com/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user role');
      }

      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${newRole}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !token) return;
    
    try {
      setIsActionLoading(true);
      
      const response = await fetch(`https://tillflow-backend.onrender.com/api/users/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      setUsers(users.filter((u) => u._id !== selectedUser._id));
      
      toast({
        title: 'User Deleted',
        description: `${selectedUser.fullName} has been removed from the system.`,
      });
      
      setShowDeleteDialog(false);
      setSelectedUser(null);
      
      fetchUserStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewDetails = async (user: User) => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://tillflow-backend.onrender.com/api/users/admin/users/${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user details');
      }

      setSelectedUser(data.user);
      setShowDetailsDialog(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user details',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLastActive = (user: User) => {
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
    return 'Never';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage merchants and administrators across the platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.totalUsers || users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verified Users</CardDescription>
              <CardTitle className="text-3xl">
                {stats.verifiedUsers || users.filter((u) => u.verified).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Merchants</CardDescription>
              <CardTitle className="text-3xl">
                {stats.merchants || users.filter((u) => u.role === 'merchant').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Admins</CardDescription>
              <CardTitle className="text-3xl">
                {stats.admins || users.filter((u) => u.role === 'admin').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Search, filter, and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or business..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="merchant">Merchants</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Verified</SelectItem>
                  <SelectItem value="inactive">Not Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <p className="text-muted-foreground">Loading users...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.verified ? 'default' : 'secondary'}
                            className={
                              user.verified
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-yellow-500 hover:bg-yellow-600'
                            }
                          >
                            {user.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.phoneNumber || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getLastActive(user)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isActionLoading}>
                                {isActionLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(user)}
                                disabled={isActionLoading}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {user.role === 'merchant' && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(user._id, 'admin')}
                                  disabled={isActionLoading}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              {user.role === 'admin' && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(user._id, 'merchant')}
                                  disabled={isActionLoading}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Make Merchant
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(user)}
                                className="text-destructive focus:text-destructive"
                                disabled={isActionLoading}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user account
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base font-medium">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedUser.verified ? 'default' : 'secondary'}
                    className={
                      selectedUser.verified
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }
                  >
                    {selectedUser.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                {selectedUser.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base">{selectedUser.phoneNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profile Completed
                  </p>
                  <Badge variant={selectedUser.profileCompleted ? 'default' : 'secondary'}>
                    {selectedUser.profileCompleted ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Joined Date
                  </p>
                  <p className="text-base">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Active
                  </p>
                  <p className="text-base">{getLastActive(selectedUser)}</p>
                </div>
              </div>
              
              {selectedUser.businesses && selectedUser.businesses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Businesses</p>
                  <div className="space-y-2">
                    {selectedUser.businesses.map((business) => (
                      <div key={business._id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{business.businessName}</p>
                            <p className="text-sm text-muted-foreground">
                              {business.businessType} • {business.mpesaShortCode}
                            </p>
                          </div>
                          <Badge variant={business.isActive ? 'default' : 'secondary'}>
                            {business.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="text-sm">
                You are about to delete <strong>{selectedUser.fullName}</strong> (
                {selectedUser.email}).
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedUser(null);
              }}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={isActionLoading}
            >
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}