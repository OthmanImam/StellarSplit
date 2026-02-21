import { NavLink } from "react-router";
import { ROUTES } from "../constants/routes";
import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { NotificationBell } from "./Notifications";

export default function Navbar() {
  return (
    <nav 
      className="flex justify-between items-center w-full mb-10 flex-wrap gap-4"
      aria-label="Main navigation"
    >
      <div className="flex gap-4" role="navigation" aria-label="Primary navigation">
        {ROUTES.map((route) => (
          <NavLink
            to={route.to}
            className={({ isActive }) => (
              isActive 
                ? "text-[var(--color-primary)] font-semibold" 
                : "text-[var(--color-text)] hover:text-[var(--color-primary)]"
            )}
            key={route.label}
          >
            {route.label}
          </NavLink>
        ))}
      </div>
      <a 
        href="https://github.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
      >
        GitHub
      </a>
      <div className="flex gap-3 items-center" role="navigation" aria-label="User controls">
        <NotificationBell />
        <LanguageSelector />
        <ThemeToggle />
        <WalletButton>Connect Wallet</WalletButton>
      </div>
    </nav>
  );
}
