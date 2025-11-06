import { MoveLeft } from 'lucide-react';
import { Link } from 'react-router';
import RegisterForm from '@/features/auth/components/register-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function Register() {
  return (
    <div className="min-h-screen flex justify-center items-center w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <Card className="w-full p-4 sm:p-6">
          <CardHeader className="flex flex-col gap-2 px-0 sm:px-6">
            <Link
              to="/"
            >
              <MoveLeft size={24} />
            </Link>
            <CardTitle className="text-xl sm:text-2xl">
              Register
            </CardTitle>
            <CardDescription className="text-sm">
              Lets create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <RegisterForm />
            <div className="mt-4 text-center text-sm">
              Already have an account?
              {' '}
              <Link to="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
