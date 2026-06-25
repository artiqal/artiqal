import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Home, ClipboardList } from "lucide-react";
import { Logo } from "./Logo";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || user?.email || "?")
    .split(/[ @]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <header
      className="sticky top-0 z-30 app-glass-header"
      data-testid="app-header"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="header-logo">
          <Logo size={40} />
          <span className="font-display font-bold text-lg tracking-tight lowercase">artiqal</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="font-display" data-testid="header-hub-link">
                <Home className="w-4 h-4 mr-2" /> Hub
              </Button>
            </Link>
            <Link to="/sessions" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="font-display" data-testid="header-sessions-link">
                <ClipboardList className="w-4 h-4 mr-2" /> Sessions
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="user-menu-trigger"
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-zinc-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
                >
                  <Avatar className="w-7 h-7">
                    {user.picture ? <AvatarImage src={user.picture} alt={user.name} /> : null}
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{user.name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-xs text-zinc-500">Signed in as</div>
                  <div className="truncate">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="logout-button"
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="font-display" data-testid="header-hub-link">
                <Home className="w-4 h-4 mr-2" /> Hub
              </Button>
            </Link>
            <Link to="/sessions">
              <Button variant="ghost" size="sm" className="font-display" data-testid="header-sessions-link">
                <ClipboardList className="w-4 h-4 mr-2" /> Sessions
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
