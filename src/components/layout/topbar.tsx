"use client";
import { Building2, ChevronDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth-actions";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/core/lib/store";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  // const user = useAuthStore((state) => state.user);
  const [user, setUser] = useState<any>();
  const logout = useAuthStore((state) => state.logout);
  // const router = useRouter() // Not needed if server action redirects

  // if (!user) return null;

  const handleLogout = async () => {
    logout(); // Clear local store immediately
    await logoutAction();
  };
  useEffect(() => {
    async () => {
      const session = await auth();
      setUser(session?.user);
    };
  }, []);
  return (
    /* Modern topbar with glass effect and gradient */
    <div className="h-16 border-b border-border/30 bg-card/50 backdrop-blur-xl flex items-end justify-between px-4 lg:px-8 lg:ml-72 shadow-lg shadow-black/20">
      {/* Right side - Theme Toggle and User Menu */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/40 transition-all duration-300 border border-transparent hover:border-border/30">
              <Avatar className="w-9 h-9 border border-primary/30">
                <AvatarImage
                  src={"/placeholder.svg"}
                  alt={(user?.name as string) || ""}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/40 to-primary/20 text-primary-foreground">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-border/30 bg-card/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 cursor-pointer hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
