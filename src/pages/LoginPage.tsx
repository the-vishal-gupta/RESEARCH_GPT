import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

export function LoginPage({ onLoginSuccess, onSwitchToSignup }: LoginPageProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      onLoginSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[#4285f4]" />
            <span className="text-2xl font-normal text-[#202124]">ScholarGPT</span>
          </div>
          <h1 className="text-3xl font-bold text-[#202124] mb-2">Welcome Back</h1>
          <p className="text-[#5f6368]">Sign in to access your research papers</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-[#dadce0] p-6 shadow-sm">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#202124]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5f6368]" />
              <Input
                type="email"
                placeholder="researcher@university.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className="pl-10"
              />
            </div>
            {errors.email && <p className="text-xs text-[#d93025]">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#202124]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5f6368]" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className="pl-10"
              />
            </div>
            {errors.password && <p className="text-xs text-[#d93025]">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4285f4] hover:bg-[#1557b0] text-white font-medium py-2 rounded-lg transition-all"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p className="text-[#5f6368] text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-[#4285f4] hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Test Credentials */}
        <div className="mt-8 p-4 bg-blue-50 border border-[#c6e7ff] rounded-lg">
          <p className="text-xs text-[#1a73e8] font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-[#5f6368]">Email: demo@university.edu</p>
          <p className="text-xs text-[#5f6368]">Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
