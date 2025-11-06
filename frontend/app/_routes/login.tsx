import { MoveLeft } from 'lucide-react';
import { Link } from 'react-router';
import LoginForm from '@/features/auth/components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function Login() {
  return (
    <div className="min-h-screen flex justify-center items-center w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <Card className="w-full p-4 sm:p-6">
          <CardHeader className="flex flex-col gap-2 px-0 sm:px-6">
            <Link
              to="/"
            >
              <MoveLeft size={24} />
            </Link>
            <CardTitle className="text-xl sm:text-2xl">
              Login
            </CardTitle>
            <CardDescription className="text-sm">
              Lets login into your account first
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <LoginForm />
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?
              {' '}
              <Link
                to="/register"
                className="underline underline-offset-4"
              >
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
