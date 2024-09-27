"use client";

import { getCurrentUserPermissions, signOut } from "@/app/(login)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/auth";
import { getErrorMessage } from "@/lib/handle-error";
import usePermissionStore from "@/store/user-permission-store";
import { CircleIcon, Home, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, setUser } = useUser();
    const router = useRouter();
    const { setCurrentUserPermissions } = usePermissionStore();

    const { setTheme } = useTheme();

    async function handleSignOut() {
        setUser(null);
        await signOut();
        router.push("/");
    }

    useEffect(() => {
        const fetchPermissions = async () => {
            if (user?.id) {
                try {
                    const result = await getCurrentUserPermissions(user.id);
                    if (result.data) {
                        setCurrentUserPermissions(result.data);
                    }
                } catch (err) {
                    toast.error(getErrorMessage(err));
                }
            }
        };

        if (user?.id) {
            fetchPermissions();
        }
    }, [user?.id, setCurrentUserPermissions]);

    return (
        <header className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <CircleIcon className="h-6 w-6 text-orange-500" />
                    <span className="ml-2 text-xl font-semibold text-gray-900">ACME</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        Pricing
                    </Link>
                    {user ? (
                        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer size-9">
                                    <AvatarImage alt={user.name || ""} />
                                    <AvatarFallback>
                                        {user.email
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="p-0">
                                <DropdownMenuItem className="w-full cursor-pointer m-1">
                                    <Link href="/dashboard" className="flex w-full items-center">
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <form action={handleSignOut} className="p-1">
                                    <button type="submit" className="flex w-full">
                                        <DropdownMenuItem className="w-full cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Sign out</span>
                                        </DropdownMenuItem>
                                    </button>
                                </form>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full">
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    )}

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:text-white" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="flex flex-col min-h-screen">
            <Header />
            {children}
        </section>
    );
}
