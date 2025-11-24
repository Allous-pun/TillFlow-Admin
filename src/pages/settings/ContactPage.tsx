import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Mail, Phone, MessageSquare, MapPin, Clock, Save, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://tillflow-backend.onrender.com/api';

export default function ContactPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contactInfo, setContactInfo] = useState({
    // Email Addresses
    supportEmail: '',
    generalEmail: '',
    
    // Phone Numbers
    supportPhone: '',
    
    // Business Hours
    businessHours: {
      regularHours: {
        weekdays: '',
        saturday: '',
        sunday: ''
      },
      emergencySupport: '',
      responseTime: {
        general: '',
        urgent: ''
      }
    },
    
    // Office Locations
    offices: {
      headquarters: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      regionalOffice: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    
    // Social Media
    socialMedia: {
      twitter: '',
      linkedin: '',
      facebook: ''
    },
    
    // Display Settings
    displaySocialMedia: true,
    displayBusinessHours: true,
    displayOfficeLocations: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin privileges required to access contact settings",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }

    fetchContactConfig();
  }, [isAuthenticated, navigate, user, toast]);

  const fetchContactConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/contact/admin/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact configuration');
      }

      const data = await response.json();
      
      if (data.success) {
        setContactInfo(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch contact configuration');
      }
    } catch (error) {
      console.error('Error fetching contact config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load contact configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData = {
        supportEmail: contactInfo.supportEmail,
        salesEmail: contactInfo,
        generalEmail: contactInfo.generalEmail,
        supportPhone: contactInfo.supportPhone,
        salesPhone: contactInfo,
        businessHours: contactInfo.businessHours,
        offices: contactInfo.offices,
        socialMedia: contactInfo.socialMedia
      };

      const response = await fetch(`${API_BASE_URL}/contact/admin/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update contact configuration');
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Settings Saved",
          description: "Contact information has been updated successfully"
        });
        setIsEditing(false);
        // Refresh data to get any server-side defaults
        fetchContactConfig();
      } else {
        throw new Error(data.message || 'Failed to update contact configuration');
      }
    } catch (error) {
      console.error('Error saving contact config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save contact configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload original data
    fetchContactConfig();
    setIsEditing(false);
  };

  // Helper function to format business hours for display
  const formatBusinessHours = () => {
    const { regularHours } = contactInfo.businessHours;
    return `Monday - Friday: ${regularHours.weekdays}\nSaturday: ${regularHours.saturday}\nSunday: ${regularHours.sunday}`;
  };

  // Helper function to format response time for display
  const formatResponseTime = () => {
    const { responseTime } = contactInfo.businessHours;
    return `General: ${responseTime.general}\nUrgent: ${responseTime.urgent}`;
  };

  // Helper function to format office address
  const formatOfficeAddress = (office) => {
    return `${office.address}\n${office.city}, ${office.state} ${office.zipCode}\n${office.country}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading contact configuration...</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Contact Settings</h1>
            <p className="text-muted-foreground">
              Manage contact information displayed to users
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Contact Info
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Email Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Addresses</CardTitle>
            </div>
            <CardDescription>Primary email contacts for different departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={contactInfo.supportEmail}
                onChange={(e) => setContactInfo({ ...contactInfo, supportEmail: e.target.value })}
                disabled={!isEditing}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generalEmail">General Inquiries Email</Label>
              <Input
                id="generalEmail"
                type="email"
                value={contactInfo.generalEmail}
                onChange={(e) => setContactInfo({ ...contactInfo, generalEmail: e.target.value })}
                disabled={!isEditing}
                placeholder="info@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Phone Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <CardTitle>Phone Numbers</CardTitle>
            </div>
            <CardDescription>Primary phone contacts for different departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                type="tel"
                value={contactInfo.supportPhone}
                onChange={(e) => setContactInfo({ ...contactInfo, supportPhone: e.target.value })}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Business Hours</CardTitle>
            </div>
            <CardDescription>Operating hours and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Display Business Hours</Label>
                <p className="text-sm text-muted-foreground">Show operating hours to users</p>
              </div>
              <Switch
                checked={contactInfo.displayBusinessHours}
                onCheckedChange={(checked) => setContactInfo({ ...contactInfo, displayBusinessHours: checked })}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weekdays">Weekdays Hours</Label>
              <Input
                id="weekdays"
                value={contactInfo.businessHours.regularHours.weekdays}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  businessHours: {
                    ...contactInfo.businessHours,
                    regularHours: {
                      ...contactInfo.businessHours.regularHours,
                      weekdays: e.target.value
                    }
                  }
                })}
                disabled={!isEditing}
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM PST"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saturday">Saturday Hours</Label>
              <Input
                id="saturday"
                value={contactInfo.businessHours.regularHours.saturday}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  businessHours: {
                    ...contactInfo.businessHours,
                    regularHours: {
                      ...contactInfo.businessHours.regularHours,
                      saturday: e.target.value
                    }
                  }
                })}
                disabled={!isEditing}
                placeholder="Saturday: 10:00 AM - 4:00 PM PST"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sunday">Sunday Hours</Label>
              <Input
                id="sunday"
                value={contactInfo.businessHours.regularHours.sunday}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  businessHours: {
                    ...contactInfo.businessHours,
                    regularHours: {
                      ...contactInfo.businessHours.regularHours,
                      sunday: e.target.value
                    }
                  }
                })}
                disabled={!isEditing}
                placeholder="Sunday: Closed"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencySupport">Emergency Support</Label>
              <Input
                id="emergencySupport"
                value={contactInfo.businessHours.emergencySupport}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  businessHours: {
                    ...contactInfo.businessHours,
                    emergencySupport: e.target.value
                  }
                })}
                disabled={!isEditing}
                placeholder="24/7 for critical issues"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="generalResponse">General Response Time</Label>
              <Input
                id="generalResponse"
                value={contactInfo.businessHours.responseTime.general}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  businessHours: {
                    ...contactInfo.businessHours,
                    responseTime: {
                      ...contactInfo.businessHours.responseTime,
                      general: e.target.value
                    }
                  }
                })}
                disabled={!isEditing}
                placeholder="24 hours for general inquiries"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgentResponse">Urgent Response Time</Label>
              <Input
                id="urgentResponse"
                value={contactInfo.businessHours.responseTime.urgent}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  businessHours: {
                    ...contactInfo.businessHours,
                    responseTime: {
                      ...contactInfo.businessHours.responseTime,
                      urgent: e.target.value
                    }
                  }
                })}
                disabled={!isEditing}
                placeholder="2 hours for urgent issues"
              />
            </div>
          </CardContent>
        </Card>

        {/* Office Locations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Office Locations</CardTitle>
            </div>
            <CardDescription>Physical office addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Display Office Locations</Label>
                <p className="text-sm text-muted-foreground">Show office addresses to users</p>
              </div>
              <Switch
                checked={contactInfo.displayOfficeLocations}
                onCheckedChange={(checked) => setContactInfo({ ...contactInfo, displayOfficeLocations: checked })}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Headquarters</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hqAddress">Address</Label>
                    <Input
                      id="hqAddress"
                      value={contactInfo.offices.headquarters.address}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          headquarters: {
                            ...contactInfo.offices.headquarters,
                            address: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="123 Market Street, Suite 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hqCity">City</Label>
                    <Input
                      id="hqCity"
                      value={contactInfo.offices.headquarters.city}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          headquarters: {
                            ...contactInfo.offices.headquarters,
                            city: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hqState">State</Label>
                    <Input
                      id="hqState"
                      value={contactInfo.offices.headquarters.state}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          headquarters: {
                            ...contactInfo.offices.headquarters,
                            state: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hqZipCode">Zip Code</Label>
                    <Input
                      id="hqZipCode"
                      value={contactInfo.offices.headquarters.zipCode}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          headquarters: {
                            ...contactInfo.offices.headquarters,
                            zipCode: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="94103"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hqCountry">Country</Label>
                    <Input
                      id="hqCountry"
                      value={contactInfo.offices.headquarters.country}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          headquarters: {
                            ...contactInfo.offices.headquarters,
                            country: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold">Regional Office</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="roAddress">Address</Label>
                    <Input
                      id="roAddress"
                      value={contactInfo.offices.regionalOffice.address}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          regionalOffice: {
                            ...contactInfo.offices.regionalOffice,
                            address: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="455 Tech Boulevard"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roCity">City</Label>
                    <Input
                      id="roCity"
                      value={contactInfo.offices.regionalOffice.city}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          regionalOffice: {
                            ...contactInfo.offices.regionalOffice,
                            city: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="Austin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roState">State</Label>
                    <Input
                      id="roState"
                      value={contactInfo.offices.regionalOffice.state}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          regionalOffice: {
                            ...contactInfo.offices.regionalOffice,
                            state: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roZipCode">Zip Code</Label>
                    <Input
                      id="roZipCode"
                      value={contactInfo.offices.regionalOffice.zipCode}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          regionalOffice: {
                            ...contactInfo.offices.regionalOffice,
                            zipCode: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="78701"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roCountry">Country</Label>
                    <Input
                      id="roCountry"
                      value={contactInfo.offices.regionalOffice.country}
                      onChange={(e) => setContactInfo({ 
                        ...contactInfo, 
                        offices: {
                          ...contactInfo.offices,
                          regionalOffice: {
                            ...contactInfo.offices.regionalOffice,
                            country: e.target.value
                          }
                        }
                      })}
                      disabled={!isEditing}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Social Media</CardTitle>
            </div>
            <CardDescription>Social media handles and profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Display Social Media</Label>
                <p className="text-sm text-muted-foreground">Show social media links to users</p>
              </div>
              <Switch
                checked={contactInfo.displaySocialMedia}
                onCheckedChange={(checked) => setContactInfo({ ...contactInfo, displaySocialMedia: checked })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter Handle</Label>
              <Input
                id="twitter"
                value={contactInfo.socialMedia.twitter}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  socialMedia: {
                    ...contactInfo.socialMedia,
                    twitter: e.target.value
                  }
                })}
                disabled={!isEditing}
                placeholder="@tillflow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
              <Input
                id="linkedin"
                value={contactInfo.socialMedia.linkedin}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  socialMedia: {
                    ...contactInfo.socialMedia,
                    linkedin: e.target.value
                  }
                })}
                disabled={!isEditing}
                placeholder="https://linkedin.com/company/tillflow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook Page URL</Label>
              <Input
                id="facebook"
                value={contactInfo.socialMedia.facebook}
                onChange={(e) => setContactInfo({ 
                  ...contactInfo, 
                  socialMedia: {
                    ...contactInfo.socialMedia,
                    facebook: e.target.value
                  }
                })}
                disabled={!isEditing}
                placeholder="https://facebook.com/tillflow"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {!isEditing && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Contact Page Preview</CardTitle>
              <CardDescription>How contact information appears to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Email Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Mail className="h-5 w-5" />
                      Email Us
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Support</p>
                        <p>{contactInfo.supportEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sales</p>
                        <p>{contactInfo.salesEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">General</p>
                        <p>{contactInfo.generalEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Phone className="h-5 w-5" />
                      Call Us
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Support</p>
                        <p>{contactInfo.supportPhone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sales</p>
                        <p>{contactInfo.salesPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {contactInfo.displayBusinessHours && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="h-5 w-5" />
                      Business Hours
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <p className="text-muted-foreground">Regular Hours</p>
                        <p className="whitespace-pre-line">{formatBusinessHours()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Emergency Support</p>
                        <p>{contactInfo.businessHours.emergencySupport}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="whitespace-pre-line">{formatResponseTime()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {contactInfo.displayOfficeLocations && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 font-semibold">
                      <MapPin className="h-5 w-5" />
                      Our Offices
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <p className="font-medium mb-1">Headquarters</p>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {formatOfficeAddress(contactInfo.offices.headquarters)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Regional Office</p>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {formatOfficeAddress(contactInfo.offices.regionalOffice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {contactInfo.displaySocialMedia && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 font-semibold">
                      <MessageSquare className="h-5 w-5" />
                      Follow Us
                    </div>
                    <div className="flex gap-4 text-sm">
                      {contactInfo.socialMedia.twitter && (
                        <a 
                          href={`https://twitter.com/${contactInfo.socialMedia.twitter.replace('@', '')}`} 
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter: {contactInfo.socialMedia.twitter}
                        </a>
                      )}
                      {contactInfo.socialMedia.linkedin && (
                        <a 
                          href={contactInfo.socialMedia.linkedin} 
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      )}
                      {contactInfo.socialMedia.facebook && (
                        <a 
                          href={contactInfo.socialMedia.facebook} 
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}