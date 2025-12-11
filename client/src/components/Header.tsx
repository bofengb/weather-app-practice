import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/Avatar';
import SettingsDialog from '@/components/SettingsDialog';
import { Cloud, History, Star, LogOut, Map, LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/weather', label: 'Weather', icon: Cloud },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/history', label: 'History', icon: History },
  { path: '/favorites', label: 'Favorites', icon: Star },
];

export default function Header() {
  const context = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!context) {
    throw new Error('Header must be used within UserContextProvider');
  }

  const { user, setUser } = context;

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
        {/* Logo */}
        <Link to="/weather" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:block text-lg font-semibold text-gray-900">
            WeatherApp
          </span>
        </Link>

        {/* Navigation - centered */}
        <nav className="flex flex-1 items-center justify-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                data-testid={`nav-${label.toLowerCase()}`}
                className={`flex items-center gap-1.5 rounded-lg px-2 sm:px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-full transition-transform hover:scale-110 hover:ring-2 hover:ring-primary/50 z-2000"
          >
            <Avatar name={user?.username || 'U'} size="sm" />
            {/* <span className="hidden lg:block text-sm font-medium text-gray-700">
              {user?.username}
            </span> */}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
