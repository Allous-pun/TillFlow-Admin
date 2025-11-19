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
import { Mail, Phone, MessageSquare, MapPin, Clock, Save, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contactInfo, setContactInfo] = useState({
    // General Contact
    supportEmail: 'support@tillflow.com',
    salesEmail: 'sales@tillflow.com',
    generalEmail: 'info@tillflow.com',
    supportPhone: '+1 (555) 123-4567',
    salesPhone: '+1 (555) 123-4568',
    
    // Business Hours
    businessHours: 'Monday - Friday: 9:00 AM - 6:00 PM PST\nSaturday: 10:00 AM - 4:00 PM PST\nSunday: Closed',
    emergencySupport: '24/7 for critical issues',
    
    // Office Locations
    headquarters: '123 Market Street, Suite 500\nSan Francisco, CA 94103\nUnited States',
    regionalOffice: '456 Tech Boulevard\nAustin, TX 78701\nUnited States',
    
    // Social Media
    twitter: '@tillflow',
    linkedin: 'company/tillflow',
    facebook: 'tillflow',
    
    // Other
    responseTime: '24 hours for general inquiries\n2 hours for urgent issues',
    displaySocialMedia: true,
    displayBusinessHours: true,
    displayOfficeLocations: true
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Contact information has been updated successfully"
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
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
              <Label htmlFor="salesEmail">Sales Email</Label>
              <Input
                id="salesEmail"
                type="email"
                value={contactInfo.salesEmail}
                onChange={(e) => setContactInfo({ ...contactInfo, salesEmail: e.target.value })}
                disabled={!isEditing}
                placeholder="sales@example.com"
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
            <div className="space-y-2">
              <Label htmlFor="salesPhone">Sales Phone</Label>
              <Input
                id="salesPhone"
                type="tel"
                value={contactInfo.salesPhone}
                onChange={(e) => setContactInfo({ ...contactInfo, salesPhone: e.target.value })}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4568"
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
              <Label htmlFor="businessHours">Regular Business Hours</Label>
              <Textarea
                id="businessHours"
                value={contactInfo.businessHours}
                onChange={(e) => setContactInfo({ ...contactInfo, businessHours: e.target.value })}
                disabled={!isEditing}
                rows={4}
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencySupport">Emergency Support Hours</Label>
              <Input
                id="emergencySupport"
                value={contactInfo.emergencySupport}
                onChange={(e) => setContactInfo({ ...contactInfo, emergencySupport: e.target.value })}
                disabled={!isEditing}
                placeholder="24/7 for critical issues"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseTime">Expected Response Time</Label>
              <Textarea
                id="responseTime"
                value={contactInfo.responseTime}
                onChange={(e) => setContactInfo({ ...contactInfo, responseTime: e.target.value })}
                disabled={!isEditing}
                rows={2}
                placeholder="24 hours for general inquiries"
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
          <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Textarea
                id="headquarters"
                value={contactInfo.headquarters}
                onChange={(e) => setContactInfo({ ...contactInfo, headquarters: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regionalOffice">Regional Office</Label>
              <Textarea
                id="regionalOffice"
                value={contactInfo.regionalOffice}
                onChange={(e) => setContactInfo({ ...contactInfo, regionalOffice: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
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
                value={contactInfo.twitter}
                onChange={(e) => setContactInfo({ ...contactInfo, twitter: e.target.value })}
                disabled={!isEditing}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                value={contactInfo.linkedin}
                onChange={(e) => setContactInfo({ ...contactInfo, linkedin: e.target.value })}
                disabled={!isEditing}
                placeholder="company/companyname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook Page</Label>
              <Input
                id="facebook"
                value={contactInfo.facebook}
                onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                disabled={!isEditing}
                placeholder="pagename"
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
                        <p className="whitespace-pre-line">{contactInfo.businessHours}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Emergency Support</p>
                        <p>{contactInfo.emergencySupport}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="whitespace-pre-line">{contactInfo.responseTime}</p>
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
                        <p className="text-muted-foreground whitespace-pre-line">{contactInfo.headquarters}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Regional Office</p>
                        <p className="text-muted-foreground whitespace-pre-line">{contactInfo.regionalOffice}</p>
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
                      <a href={`https://twitter.com/${contactInfo.twitter.replace('@', '')}`} className="text-primary hover:underline">
                        Twitter: {contactInfo.twitter}
                      </a>
                      <a href={`https://linkedin.com/${contactInfo.linkedin}`} className="text-primary hover:underline">
                        LinkedIn
                      </a>
                      <a href={`https://facebook.com/${contactInfo.facebook}`} className="text-primary hover:underline">
                        Facebook
                      </a>
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
