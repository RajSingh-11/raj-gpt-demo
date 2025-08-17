import ThemeSwitcher from './ThemeSwitcher';
import EssentialMenu from './EssentialMenu';
import UserMenu from './UserMenu.tsx';

export default function Header() {
  return (
    <header className="glass border-b border-white/10 p-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="avatar avatar-md">
            <span className="text-lg font-bold">R</span>
          </div>
          <h1 className="text-xl font-bold text-gradient">
            RAJGPT
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <EssentialMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}