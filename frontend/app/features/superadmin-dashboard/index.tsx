import { useQuery } from '@tanstack/react-query';
import { Building2, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router';
import { superadminApis } from '@/core/services/superadmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function SuperAdminDashboard() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['superadmin-analytics'],
    queryFn: superadminApis.getAnalytics,
  });

  const totalOrganizations = analyticsData?.organizations?.total ?? 0;
  const totalUsers = analyticsData?.users?.total ?? 0;
  const totalVerifications = analyticsData?.onchain_verifications?.total ?? 0;

  const stats = [
    {
      title: 'Total Organizations',
      value: totalOrganizations,
      description: 'Registered organizations in the system',
      icon: Building2,
      link: '/organization/superadmin/organizations',
      color: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      description: 'Registered users in the system',
      icon: Users,
      link: '/organization/superadmin/users',
      color: 'text-green-600',
    },
    {
      title: 'Onchain Verifications',
      value: totalVerifications,
      description: 'Total onchain verifications processed',
      icon: ShieldCheck,
      link: '/organization/superadmin/onchain-verifications',
      color: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Navigate to different sections of the SuperAdmin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Link to="/organization/superadmin/organizations">
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">Organizations</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">View and manage all organizations</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/organization/superadmin/users">
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">Users</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">View and manage all users</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/organization/superadmin/onchain-verifications">
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">Onchain Verifications</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">View and manage verifications</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
