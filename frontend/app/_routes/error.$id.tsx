import { AlertTriangle, Clock, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export default function ErrorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Get error details based on ID
  const getErrorDetails = (errorId: string) => {
    switch (errorId) {
      case '401':
        return {
          title: 'Session Expired',
          message: 'Your session has expired. Please login again to continue.',
          description: 'For security reasons, we automatically log you out after a period of inactivity.',
          icon: <LogIn className="h-16 w-16 text-orange-500" />,
          redirectTo: '/login',
          redirectText: 'Login Page',
        };
      case '403':
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          description: 'Please contact your administrator if you believe this is an error.',
          icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
          redirectTo: '/login',
          redirectText: 'Login Page',
        };
      case '404':
        return {
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist.',
          description: 'It might have been moved, deleted, or you entered the wrong URL.',
          icon: <AlertTriangle className="h-16 w-16 text-yellow-500" />,
          redirectTo: '/',
          redirectText: 'Home Page',
        };
      case '500':
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end.',
          description: 'We\'re working to fix this issue. Please try again later.',
          icon: <AlertTriangle className="h-16 w-16 text-red-600" />,
          redirectTo: '/login',
          redirectText: 'Login Page',
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred.',
          description: 'Please try again or contact support if the problem persists.',
          icon: <AlertTriangle className="h-16 w-16 text-gray-500" />,
          redirectTo: '/login',
          redirectText: 'Login Page',
        };
    }
  };

  const errorDetails = getErrorDetails(id || '500');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(errorDetails.redirectTo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, errorDetails.redirectTo]);

  const handleManualRedirect = () => {
    navigate(errorDetails.redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="h-screen flex justify-center items-center">

        <Card>
          <CardContent>
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="animate-bounce">
                {errorDetails.icon}
              </div>
            </div>

            {/* Error Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {errorDetails.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
                {errorDetails.message}
              </p>
              <p className="text-sm text-muted-foreground">
                {errorDetails.description}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Auto-redirecting in</span>
              </div>
              <div className="text-4xl font-bold text-blue-500">
                {countdown}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redirecting to
                {' '}
                {errorDetails.redirectText}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-3">
              <Button
                onClick={handleManualRedirect}
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Go to
                {' '}
                {errorDetails.redirectText}
                {' '}
                Now
              </Button>
            </div>

            {/* Error Code */}
            <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Error Code:
                {' '}
                {id || 'UNKNOWN'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
