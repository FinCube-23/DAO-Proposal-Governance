import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import { Badge } from "@components/ui/badge";
import { useState } from "react";

const dummyUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    wallet: "0x1234...abcd",
    joined_at: "2024-06-01T10:15:00Z",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Member",
    status: "Pending",
    wallet: "0x5678...efgh",
    joined_at: "2024-06-10T14:30:00Z",
  },
  {
    id: 3,
    name: "Carol Lee",
    email: "carol@example.com",
    role: "Member",
    status: "Active",
    wallet: "0x9abc...wxyz",
    joined_at: "2024-07-01T09:00:00Z",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david@example.com",
    role: "Member",
    status: "Inactive",
    wallet: "0x1111...2222",
    joined_at: "2024-07-10T12:00:00Z",
  },
];

const statusColor = (status: string) =>
  status === "Active"
    ? "success"
    : status === "Pending"
    ? "warning"
    : "secondary";

const USERS_PER_PAGE = 2;

const UserList = () => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(dummyUsers.length / USERS_PER_PAGE);
  const paginatedUsers = dummyUsers.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Organization Users</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Joined At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={statusColor(user.status)}>{user.status}</Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">{user.wallet}</span>
              </TableCell>
              <TableCell>{formatDate(user.joined_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {dummyUsers.length === 0 && (
        <p className="text-center font-bold">No users found</p>
      )}
      {dummyUsers.length > USERS_PER_PAGE && (
        <Pagination className="my-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={`${
                  page === 1 && "pointer-events-none opacity-50"
                } cursor-pointer`}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  className={`cursor-pointer ${
                    page === idx + 1 ? "border-2 border-green-400" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(idx + 1);
                  }}
                  isActive={page === idx + 1}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                className={`${
                  page === totalPages && "pointer-events-none opacity-50"
                } cursor-pointer`}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default UserList;
