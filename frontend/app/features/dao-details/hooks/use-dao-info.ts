import type { IDaoInfo } from '@/core/api/interfaces';
import { readContract } from '@wagmi/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';

interface DaoInfoState {
  daoURI?: IDaoInfo;
  proposalCount: number;
  memberCount: number;
  proposalThreshold: number;
  version: string;
  votingPeriod: string;
  votingDelay: string;
}

interface UseDaoInfoReturn extends DaoInfoState {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const INITIAL_STATE: DaoInfoState = {
  daoURI: undefined,
  proposalCount: 0,
  memberCount: 0,
  proposalThreshold: 0,
  version: '',
  votingPeriod: '',
  votingDelay: '',
};

interface Props {
  debug?: boolean;
}

export function useDaoInfo({ debug = false }: Props): UseDaoInfoReturn {
  const [state, setState] = useState<DaoInfoState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useAccount();

  // Memoize contract address
  const contractAddress = useMemo(() =>
    env.VITE_SMART_CONTRACT_ADDRESS as any, []);

  // Debug logging
  const debugLog = useCallback((message: string, data?: any) => {
    debug && console.warn(`[useDaoInfo] ${message}`, data);
  }, []);

  // Generic contract reader with better error handling
  const readContractValue = useCallback(async (
    functionName: string,
    transform: (value: any) => any = val => val?.toString() || '',
  ) => {
    try {
      debugLog(`Reading ${functionName}...`);

      const response = await readContract(config, {
        abi: contractABI,
        address: contractAddress,
        functionName,
      });

      debugLog(`Raw response for ${functionName}:`, response);

      const result = transform(response);
      debugLog(`Transformed result for ${functionName}:`, result);

      return result;
    }
    catch (err) {
      const errorMsg = `Error reading ${functionName}: ${err instanceof Error ? err.message : 'Unknown error'}`;
      debugLog(errorMsg, err);
      throw new Error(errorMsg);
    }
  }, [contractAddress, debugLog]);

  // Individual fetch functions (like your original approach)
  const getDAOInfo = useCallback(async (): Promise<IDaoInfo | undefined> => {
    try {
      const response = await readContractValue('daoURI', (val) => {
        if (!val)
          return undefined;
        try {
          return JSON.parse(val);
        }
        catch (parseErr) {
          debugLog('JSON parse error for daoURI:', parseErr);
          return undefined;
        }
      });
      return response;
    }
    catch (err) {
      debugLog('getDAOInfo error:', err);
      return undefined;
    }
  }, [readContractValue, debugLog]);

  const getVotingPeriod = useCallback(async (): Promise<string> => {
    try {
      return await readContractValue('votingPeriod', val => val?.toString() || '0');
    }
    catch (err) {
      debugLog('getVotingPeriod error:', err);
      return '0';
    }
  }, [readContractValue, debugLog]);

  const getVotingDelay = useCallback(async (): Promise<string> => {
    try {
      return await readContractValue('votingDelay', val => val?.toString() || '0');
    }
    catch (err) {
      debugLog('getVotingDelay error:', err);
      return '0';
    }
  }, [readContractValue, debugLog]);

  const getProposalCount = useCallback(async (): Promise<number> => {
    try {
      return await readContractValue('proposalCount', val => val ? Number(val) : 0);
    }
    catch (err) {
      debugLog('getProposalCount error:', err);
      return 0;
    }
  }, [readContractValue, debugLog]);

  const getMemberCount = useCallback(async (): Promise<number> => {
    try {
      return await readContractValue('memberCount', val => val ? Number(val) : 0);
    }
    catch (err) {
      debugLog('getMemberCount error:', err);
      return 0;
    }
  }, [readContractValue, debugLog]);

  const getProposalThreshold = useCallback(async (): Promise<number> => {
    try {
      return await readContractValue('proposalThreshold', val => val ? Number(val) : 0);
    }
    catch (err) {
      debugLog('getProposalThreshold error:', err);
      return 0;
    }
  }, [readContractValue, debugLog]);

  const getVersion = useCallback(async (): Promise<string> => {
    try {
      return await readContractValue('UPGRADE_INTERFACE_VERSION', val => val?.toString() || '');
    }
    catch (err) {
      debugLog('getVersion error:', err);
      return '';
    }
  }, [readContractValue, debugLog]);

  // Main fetch function
  const fetchAllDaoData = useCallback(async (): Promise<void> => {
    debugLog('Starting fetchAllDaoData', {
      isConnected,
      address,
      contractAddress,
    });

    // Early return conditions
    if (!contractAddress) {
      setError('Contract address not found in environment variables');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      debugLog('Fetching all DAO data...');

      // Try parallel approach first
      try {
        const [daoURI, proposalCount, memberCount, proposalThreshold, version, votingPeriod, votingDelay] = await Promise.all([
          getDAOInfo(),
          getProposalCount(),
          getMemberCount(),
          getProposalThreshold(),
          getVersion(),
          getVotingPeriod(),
          getVotingDelay(),
        ]);

        const newState: DaoInfoState = {
          daoURI,
          proposalCount,
          memberCount,
          proposalThreshold,
          version,
          votingPeriod,
          votingDelay,
        };

        debugLog('All data fetched successfully:', newState);
        setState(newState);
      }
      catch (parallelError) {
        debugLog('Parallel fetch failed, trying sequential:', parallelError);

        // Fallback to sequential approach
        const newState: DaoInfoState = { ...INITIAL_STATE };

        try {
          newState.daoURI = await getDAOInfo();
        }
        catch (e) { debugLog('Sequential daoURI failed:', e); }

        try {
          newState.proposalCount = await getProposalCount();
        }
        catch (e) { debugLog('Sequential proposalCount failed:', e); }

        try {
          newState.memberCount = await getMemberCount();
        }
        catch (e) { debugLog('Sequential memberCount failed:', e); }

        try {
          newState.proposalThreshold = await getProposalThreshold();
        }
        catch (e) { debugLog('Sequential proposalThreshold failed:', e); }

        try {
          newState.version = await getVersion();
        }
        catch (e) { debugLog('Sequential version failed:', e); }

        try {
          newState.votingPeriod = await getVotingPeriod();
        }
        catch (e) { debugLog('Sequential votingPeriod failed:', e); }

        try {
          newState.votingDelay = await getVotingDelay();
        }
        catch (e) { debugLog('Sequential votingDelay failed:', e); }

        debugLog('Sequential fetch completed:', newState);
        setState(newState);
      }
    }
    catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch DAO data';
      debugLog('fetchAllDaoData error:', err);
      setError(errorMsg);
    }
    finally {
      setLoading(false);
    }
  }, [isConnected, address, contractAddress, getDAOInfo, getProposalCount, getMemberCount, getProposalThreshold, getVersion, getVotingPeriod, getVotingDelay, debugLog]);

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    debugLog('Manual refetch triggered');
    await fetchAllDaoData();
  }, [fetchAllDaoData, debugLog]);

  // Main effect
  useEffect(() => {
    debugLog('useEffect triggered', { isConnected, address, contractAddress });
    fetchAllDaoData();
  }, [fetchAllDaoData]);

  // Return memoized result
  return useMemo(() => ({
    ...state,
    loading,
    error,
    refetch,
  }), [state, loading, error, refetch]);
}
