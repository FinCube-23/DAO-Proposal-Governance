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
    <div className="h-screen flex justify-center items-center w-full">
      <div className="flex flex-col gap-6">
        <Card className="w-[32rem] p-6">
          <CardHeader className="flex flex-col gap-2">
            <Link
              to="/"
            >
              <MoveLeft size={24} />
            </Link>
            <CardTitle className="text-2xl">
              Register
            </CardTitle>
            <CardDescription>
              Lets create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
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
