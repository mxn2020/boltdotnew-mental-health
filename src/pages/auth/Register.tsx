// src/pages/auth/Register.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth, PrivacyLevel } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  privacyLevel: z.enum(['email', 'enhanced'] as const),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      privacyLevel: 'email'
    }
  });

  const privacyLevel = watch('privacyLevel');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password, data.privacyLevel);
      
      if (error) {
        setError('root', { message: error.message });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">MindfulSpace</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">
            Start your mental health journey with privacy and compassion
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Choose Your Privacy Level</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Privacy Level Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Privacy Level
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="email"
                      {...register('privacyLevel')}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">Email Registration</span>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Encrypted email for crisis intervention and data recovery. 
                        Your email is never shared or used for marketing.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="enhanced"
                      {...register('privacyLevel')}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Enhanced Profile</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Optional emergency contact for comprehensive crisis support. 
                        All information remains encrypted and private.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                helperText="Used only for account security and crisis intervention"
              />

              {/* Password */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={errors.password?.message}
                  helperText="Minimum 8 characters"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-teal-600 hover:text-teal-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-teal-600 hover:text-teal-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}

              {/* Error Message */}
              {errors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Privacy Notice */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div className="text-sm text-teal-800">
                    <p className="font-medium mb-1">Your Privacy is Protected</p>
                    <p>
                      All your mental health data is encrypted end-to-end. 
                      We cannot access your personal information, and you can delete 
                      your account and all data at any time.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>
          
          <Link to="/anonymous">
            <Button variant="outline" className="w-full">
              Continue Anonymously
            </Button>
          </Link>
          <p className="text-xs text-gray-500">
            Use all features without providing any personal information
          </p>
        </div>
      </div>
    </div>
  );
}