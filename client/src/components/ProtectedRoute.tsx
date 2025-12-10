import { useContext, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('ProtectedRoute must be used within UserContextProvider');
  }

  const { user, ready } = context;

  // Two-phase check:
  // Phase 1: Not ready yet -> show skeleton (prevents flash of login page)
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Phase 2: Ready but no user -> actually not authenticated, redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
