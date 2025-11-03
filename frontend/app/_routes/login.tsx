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
    <div className="h-screen flex justify-center items-center w-full">
      <div className="flex flex-col gap-6">
        <Card className="w-[28rem] p-6">
          <CardHeader className="flex flex-col gap-2">
            <Link
              to="/"
            >
              <MoveLeft size={24} />
            </Link>
            <CardTitle className="text-2xl">
              Login
            </CardTitle>
            <CardDescription>
              Lets login into your account first
            </CardDescription>
          </CardHeader>
          <CardContent>
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
