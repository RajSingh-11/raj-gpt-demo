import { useState } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useAuth } from '../hooks/useAuth';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  const displayName = user.profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 text-[var(--theme-text)] hover:bg-[var(--theme-surface)] border border-[var(--theme-surface)] h-10 px-3"
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={user.profile?.avatar_url || ''} />
            <AvatarFallback 
              className="text-xs font-semibold bg-[var(--theme-primary)] text-white"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium hidden sm:inline">{displayName}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-[var(--theme-surface)] border-[var(--theme-surface)] text-[var(--theme-text)]"
        align="end"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-[var(--theme-text)]/70">{user.email}</p>
        </div>
        
        <DropdownMenuSeparator className="bg-[var(--theme-background)]" />
        
        <DropdownMenuItem className="hover:bg-[var(--theme-background)]">
          <User size={16} className="mr-2" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem className="hover:bg-[var(--theme-background)]">
          <Settings size={16} className="mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-[var(--theme-background)]" />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="hover:bg-[var(--theme-background)] text-red-400 focus:text-red-400"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}