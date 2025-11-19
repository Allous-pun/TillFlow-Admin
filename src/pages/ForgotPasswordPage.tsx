import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast({
        title: 'Success',
        description: 'Password reset link sent to your email',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">TillFlow</h1>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>
              {isSubmitted 
                ? 'Check your email for the reset link'
                : 'Enter your email to receive a password reset link'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to
                  </p>
                  <p className="text-sm font-medium mt-1">{email}</p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Try another email
                  </Button>
                  <Link to="/login">
                    <Button variant="default" className="w-full">
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            )}

            {!isSubmitted && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Remember your password? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
