import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Save, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AboutPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [aboutInfo, setAboutInfo] = useState({
    companyName: 'TillFlow',
    tagline: 'Modern Payment Solutions for Your Business',
    description: 'TillFlow is a comprehensive payment platform designed to help businesses of all sizes accept payments, manage transactions, and grow their revenue. Our mission is to make payment processing simple, secure, and accessible to everyone.',
    mission: 'To empower businesses worldwide with innovative payment solutions that drive growth and success.',
    vision: 'To become the leading payment platform trusted by millions of businesses globally.',
    founded: '2020',
    headquarters: 'San Francisco, California, USA',
    website: 'https://tillflow.com',
    email: 'info@tillflow.com',
    phone: '+1 (555) 123-4567',
    address: '123 Market Street, Suite 500, San Francisco, CA 94103',
    version: '2.5.0',
    lastUpdated: '2025-01-15'
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
      description: "About information has been updated successfully"
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values in a real app
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">About TillFlow</h1>
            <p className="text-muted-foreground">
              Platform information and company details
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Information
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

        {/* Company Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Company Overview</CardTitle>
            </div>
            <CardDescription>Basic company information and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={aboutInfo.companyName}
                onChange={(e) => setAboutInfo({ ...aboutInfo, companyName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={aboutInfo.tagline}
                onChange={(e) => setAboutInfo({ ...aboutInfo, tagline: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={aboutInfo.description}
                onChange={(e) => setAboutInfo({ ...aboutInfo, description: e.target.value })}
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <Card>
          <CardHeader>
            <CardTitle>Mission & Vision</CardTitle>
            <CardDescription>Company mission statement and vision for the future</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea
                id="mission"
                value={aboutInfo.mission}
                onChange={(e) => setAboutInfo({ ...aboutInfo, mission: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vision">Vision Statement</Label>
              <Textarea
                id="vision"
                value={aboutInfo.vision}
                onChange={(e) => setAboutInfo({ ...aboutInfo, vision: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Founding and location information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  value={aboutInfo.founded}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, founded: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  value={aboutInfo.headquarters}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, headquarters: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How users can reach the company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={aboutInfo.website}
                onChange={(e) => setAboutInfo({ ...aboutInfo, website: e.target.value })}
                disabled={!isEditing}
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
                value={aboutInfo.email}
                onChange={(e) => setAboutInfo({ ...aboutInfo, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={aboutInfo.phone}
                onChange={(e) => setAboutInfo({ ...aboutInfo, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Textarea
                id="address"
                value={aboutInfo.address}
                onChange={(e) => setAboutInfo({ ...aboutInfo, address: e.target.value })}
                disabled={!isEditing}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Information */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>Version and update details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="version">Current Version</Label>
                <Input
                  id="version"
                  value={aboutInfo.version}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, version: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastUpdated">Last Updated</Label>
                <Input
                  id="lastUpdated"
                  type="date"
                  value={aboutInfo.lastUpdated}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, lastUpdated: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {!isEditing && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Public Preview</CardTitle>
              <CardDescription>How this information appears to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">{aboutInfo.companyName}</h2>
                  <p className="text-lg text-muted-foreground">{aboutInfo.tagline}</p>
                </div>
                <p className="text-center">{aboutInfo.description}</p>
                <div className="grid gap-4 md:grid-cols-2 pt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Our Mission</h3>
                    <p className="text-sm text-muted-foreground">{aboutInfo.mission}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Our Vision</h3>
                    <p className="text-sm text-muted-foreground">{aboutInfo.vision}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    <span>Founded {aboutInfo.founded}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{aboutInfo.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <span>Version {aboutInfo.version}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
