import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedRoute({ children }) {
  const { user, ready } = useContext(UserContext);

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

  return children;
}
