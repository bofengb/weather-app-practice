import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserContext } from '@/context/UserContext';
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
} from '@/lib/validations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Avatar from '@/components/Avatar';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps): JSX.Element {
  const context = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  if (!context) {
    throw new Error('SettingsDialog must be used within UserContextProvider');
  }

  const { user, setUser } = context;

  // profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { username: user?.username || '' },
  });

  // password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    setIsLoading(true);
    try {
      const { data: response } = await axios.patch(
        '/api/v1/auth/profile',
        data
      );
      // update context with new username
      setUser((prev) =>
        prev ? { ...prev, username: response.username } : prev
      );
      toast.success('Profile updated');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await axios.patch('/api/v1/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account settings</DialogDescription>
        </DialogHeader>

        {/* avatar display */}
        <div className="flex justify-center py-2 sm:py-4">
          <Avatar
            name={user?.username || 'U'}
            size="md"
            className="sm:h-16 sm:w-16 sm:text-2xl"
          />
        </div>

        {/* tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
        </div>

        {/* profile tab */}
        {activeTab === 'profile' && (
          <form
            onSubmit={profileForm.handleSubmit(onUpdateProfile)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...profileForm.register('username')}
                placeholder="Your username"
              />
              {profileForm.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}

        {/* password tab */}
        {activeTab === 'password' && (
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword')}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
