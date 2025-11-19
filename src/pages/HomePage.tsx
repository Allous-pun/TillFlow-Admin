import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, BarChart3, Zap, Users, CreditCard, Lock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Real-time insights into your sales, revenue, and customer behavior with comprehensive dashboards."
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Payment Management",
      description: "Seamlessly process payments, manage transactions, and handle refunds across multiple channels."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Customer Management",
      description: "Build customer profiles, track purchase history, and manage loyalty programs effortlessly."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Sync",
      description: "Instant synchronization across all your devices and locations with cloud-powered infrastructure."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance to keep your data and transactions completely secure."
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Role-based Access",
      description: "Control permissions and access levels for your team members with granular security settings."
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime" },
    { number: "2M+", label: "Transactions" },
    { number: "15K+", label: "Businesses" },
    { number: "50+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TF</span>
            </div>
            <span className="text-xl font-bold text-primary">TillFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Streamline Your
              <span className="text-primary block">Business Operations</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform for modern merchants. Manage payments, inventory, customers, 
              and analytics in one powerful dashboard.
            </p>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap pt-6">
            <Link to="/signup">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Schedule Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Grow</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you manage and scale your business efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join thousands of businesses using TillFlow to streamline their operations and drive growth.
              </p>
              <div className="flex gap-4 justify-center flex-wrap pt-6">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                    Get Started Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">TF</span>
              </div>
              <span className="text-lg font-bold text-primary">TillFlow</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 TillFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}