import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { orgApis } from '@/core/services/org';
import CustomPagination from '@/shared/components/custom-pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const limit = 15;

export default function OrgList() {
  const [orgList, setOrgList] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [type, setType] = useState<string>('');
  const navigate = useNavigate();

  const getAllOrgs = useMutation({
    mutationKey: ['getAllOrgs'],
    mutationFn: orgApis.getAllOrgs,
    onSuccess: (data) => {
      setOrgList(data.organizations);
      setPage(data.pagination.page);
      setTotal(data.pagination.total);
    },
    onError: (error) => {
      console.error('Get all orgs failed', error);
    },
  });

  useEffect(() => {
    getAllOrgs.mutate({
      page,
      limit,
      status: status === 'all' ? undefined : status,
      type: type === 'all' ? undefined : type,
    });
  }, [page, status, location, type]);

  if (getAllOrgs.isPending)
    return <p>Loading...</p>;
  if (getAllOrgs.isError)
    return <p>Error loading data</p>;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      <div className="flex justify-end space-x-4">
        <div className="flex items-center gap-2">
          <span className="text-xs">Filter by Status:</span>
          <Select value={status} onValueChange={value => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="register">Registered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="cancelled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Filter by Type:</span>
          <Select value={type} onValueChange={value => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="plc">PLC</SelectItem>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="inc">INC</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Membership Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orgList.map((mfs: any) => (
            <TableRow
              onClick={() => {
                navigate(`/organization/admin/organizations/${mfs.id}`);
              }}
              className="hover:bg-gray-800 hover:cursor-pointer"
              key={mfs.id}
            >
              <TableCell>{mfs.id}</TableCell>
              <TableCell>{mfs.name}</TableCell>
              <TableCell className="uppercase">{mfs.type}</TableCell>
              <TableCell>{mfs.address}</TableCell>
              <TableCell className="capitalize">
                {mfs.status}
              </TableCell>
              <TableCell>{formatDate(mfs.created_at)}</TableCell>
              <TableCell>{formatDate(mfs.updated_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {orgList.length === 0 && (
        <p className="text-center font-bold">No data found</p>
      )}

      {orgList.length > 0 && (
        <CustomPagination limit={limit} total={total} page={page} onPageChange={setPage} />
      )}
    </>
  );
}
