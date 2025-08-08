import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Loader2, Eye, EyeOff } from 'lucide-react';
import { LoginRequest, LoginResponse } from '@shared/api';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.username, formData.password);
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fresh-green/5 via-fresh-lime/5 to-fresh-yellow/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 bg-fresh-green rounded-full">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-fresh-green to-fresh-lime bg-clip-text text-transparent">
              Minh Phát
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-4">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  className="h-11"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Username:</strong> admin</div>
                <div><strong>Password:</strong> admin123</div>
              </div>
            </div>

            {/* Back to Site */}
            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Minh Phát Store
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
