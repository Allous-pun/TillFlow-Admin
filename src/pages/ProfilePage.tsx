// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Loader2, User, Mail, Phone, Shield, Key } from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  verified: boolean;
  profileCompleted: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile>({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    verified: false,
    profileCompleted: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('https://tillflow-backend.onrender.com/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch profile');
        }

        if (data.user) {
          setProfileData(data.user);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token, toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://tillflow-backend.onrender.com/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Manage your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Role</span>
                  <span className="text-sm text-muted-foreground capitalize">{profileData.role}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Verification Status</span>
                  <span className={`text-sm ${profileData.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {profileData.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profile Completed</span>
                  <span className={`text-sm ${profileData.profileCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                    {profileData.profileCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User ID</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {user.id.slice(-8)}
                  </span>
                </div>

                {profileData.lastLogin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Login</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(profileData.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {profileData.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(profileData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}