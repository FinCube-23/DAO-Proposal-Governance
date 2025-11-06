import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { orgApis } from '@/core/services/org';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';

const defaultTheme = {
  key: '#9CDCFE',
  string: '#CE9178',
  number: '#B5CEA8',
  boolean: '#569CD6',
  null: '#569CD6',
  undefined: '#569CD6',
  function: '#DCDCAA',
  symbol: '#DCDCAA',
  date: '#B5CEA8',
  punctuation: '#D4D4D4',
  text: '#D4D4D4',
};

function JsonRenderer({
  data,
  depth = 0,
  theme = defaultTheme,
}: {
  data: any;
  depth?: number;
  theme?: typeof defaultTheme;
}) {
  const getValueType = (value: any) => {
    if (value === null)
      return 'null';
    if (Array.isArray(value))
      return 'array';
    if (typeof value === 'object')
      return 'object';
    if (typeof value === 'number')
      return 'number';
    if (typeof value === 'boolean')
      return 'boolean';
    if (typeof value === 'function')
      return 'function';
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value))
        return 'date';
      if (/^0x[a-fA-F0-9]+$/.test(value))
        return 'hex';
    }
    return typeof value;
  };

  const renderValue = (value: any) => {
    const type = getValueType(value);

    switch (type) {
      case 'string':
        return (
          <span style={{ color: theme.string }}>{JSON.stringify(value)}</span>
        );
      case 'number':
        return <span style={{ color: theme.number }}>{value}</span>;
      case 'boolean':
        return <span style={{ color: theme.boolean }}>{value.toString()}</span>;
      case 'null':
        return <span style={{ color: theme.null }}>null</span>;
      case 'date':
        return (
          <>
            <span style={{ color: theme.string }}>{JSON.stringify(value)}</span>
            <span style={{ color: theme.text, marginLeft: '8px' }}>
              (
              {new Date(value).toLocaleString()}
              )
            </span>
          </>
        );
      case 'hex':
        return (
          <span style={{ color: theme.string }}>
            {JSON.stringify(value)}
            <span style={{ color: theme.text, marginLeft: '8px' }}>(hex)</span>
          </span>
        );
      default:
        return (
          <span style={{ color: theme.text }}>{JSON.stringify(value)}</span>
        );
    }
  };

  if (typeof data !== 'object' || data === null) {
    return renderValue(data);
  }

  if (Array.isArray(data)) {
    return (
      <span>
        <span style={{ color: theme.punctuation }}>[</span>
        <div style={{ marginLeft: `${depth * 20}px` }}>
          {data.map((item, index) => (
            <div key={index}>
              <JsonRenderer data={item} depth={depth + 1} theme={theme} />
              {index < data.length - 1 && (
                <span style={{ color: theme.punctuation }}>,</span>
              )}
            </div>
          ))}
        </div>
        <span style={{ color: theme.punctuation }}>]</span>
      </span>
    );
  }

  return (
    <span>
      <span style={{ color: theme.punctuation }}>{'{'}</span>
      <div style={{ marginLeft: `${depth * 20}px` }}>
        <div className="ml-4">
          {Object.entries(data).map(([key, value], index, array) => (
            <div key={key}>
              <span style={{ color: theme.key }}>{JSON.stringify(key)}</span>
              <span style={{ color: theme.punctuation }}>: </span>
              <JsonRenderer data={value} depth={depth + 1} theme={theme} />
              {index < array.length - 1 && (
                <span style={{ color: theme.punctuation }}>,</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <span style={{ color: theme.punctuation }}>{'}'}</span>
    </span>
  );
}

function MFSDetails() {
  const { id } = useParams();
  const [mfs, setMFS] = useState<any>(null);
  const getMFS = useMutation({
    mutationKey: ['getMFS', id],
    mutationFn: orgApis.getOrg,
    onSuccess: (data) => {
      // console.log('Fetched MFS data:', data);
      setMFS(data);
    },
    onError: (error) => {
      console.error('Get MFS failed', error);
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    getMFS.mutate(Number(id));
  }, [id]);

  if (getMFS.isPending)
    return <div>Loading...</div>;
  if (getMFS.isError)
    return <div>Error loading MFS details</div>;
  if (!mfs)
    return <div>MFS not found</div>;

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
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate('/organization/admin/organizations')} className="mb-6">
        Back
      </Button>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{mfs.name}</h1>
              <p className="text-gray-500">
                {mfs.type}
                {' '}
                •
                {mfs.address}
              </p>
            </div>
            <Badge variant={mfs.status === 'approved' ? 'success' : 'warning'}>
              {mfs.status === 'approved' ? 'Approved' : 'Pending'}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="font-bold">General Information</Label>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">ID:</span>
                    {' '}
                    {mfs.id}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>
                    {' '}
                    {mfs.email}
                  </p>
                  <p>
                    <span className="font-medium">Legal Entity Identifier:</span>
                    {' '}
                    {mfs.legal_entity_identifier}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    {' '}
                    <Badge variant={mfs.status === 'approved' ? 'success' : 'warning'}>
                      {mfs.status}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Active:</span>
                    {' '}
                    <Badge variant={mfs.is_active ? 'success' : 'destructive'}>
                      {mfs.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="font-bold">Native Currency</Label>
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Currency:</span>
                    {' '}
                    {mfs.native_currency}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="font-bold">On-chain Verifications</Label>
                <div className="mt-2">
                  {mfs.onchain_verifications && mfs.onchain_verifications.length > 0
                    ? (
                        <div className="space-y-2">
                          {mfs.onchain_verifications.map((verification: any, index: number) => (
                            <div key={index} className="border rounded p-3">
                              <p>
                                <span className="font-medium">Type:</span>
                                {' '}
                                {verification.type || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium">Status:</span>
                                {' '}
                                <Badge variant={verification.status === 'verified' ? 'success' : 'warning'}>
                                  {verification.status || 'N/A'}
                                </Badge>
                              </p>
                              <p>
                                <span className="font-medium">Transaction Hash:</span>
                                {' '}
                                {verification.transaction_hash
                                  ? (
                                      <a
                                        className="hover:underline text-blue-300"
                                        target="_blank"
                                        href={`${import.meta.env.VITE_TRX_EXPLORER}${verification.transaction_hash}`}
                                        rel="noreferrer"
                                      >
                                        {verification.transaction_hash}
                                      </a>
                                    )
                                  : (
                                      'N/A'
                                    )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    : (
                        <p className="text-muted-foreground">No verifications found</p>
                      )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Created At:</span>
                    {' '}
                    {formatDate(mfs.created_at)}
                  </p>
                  <p>
                    <span className="font-medium">Updated At:</span>
                    {' '}
                    {formatDate(mfs.updated_at)}
                  </p>
                </div>
              </div>
              <Separator />
              <Card className="p-5">
                <div>
                  <Label className="font-bold">Organization Admin</Label>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">Admin ID:</span>
                      {' '}
                      {mfs.organization_admin.id}
                    </p>
                    <p>
                      <span className="font-medium">Full Name:</span>
                      {' '}
                      {mfs.organization_admin.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Phone Number:</span>
                      {' '}
                      {mfs.organization_admin.phone_number}
                    </p>
                    <p className="break-all">
                      <span className="font-medium">Wallet Address:</span>
                      {' '}
                      {mfs.organization_admin.wallet_address}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {mfs.certificate && (
            <div className="mt-4">
              <a
                href={mfs.certificate}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Certificate
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default MFSDetails;
