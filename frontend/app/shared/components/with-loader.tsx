interface Props {
  children: React.ReactNode;
  isLoading: boolean;
  fallback?: React.ReactNode;
}

export default function WithLoader({ children, isLoading, fallback }: Props) {
  return (
    <div>
      {isLoading ? fallback || <div className="w-full h-full">Loading...</div> : children}
    </div>
  );
}
