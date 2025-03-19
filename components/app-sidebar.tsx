"use client";

import { Database, Home, LineChart, Sparkles, Target } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "./ui/sidebar";
import { SidebarUserProfile } from "./sidebar-user-profile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";

export function AppSidebar() {
  const pathname = usePathname();

  const { data } = useSession();

  const user = {
    name: data?.user?.name,
    email: data?.user?.email,
    image: data?.user?.image,
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },
    {
      title: "Trading Strategies",
      icon: Target,
      path: "/strategies",
    },
    {
      title: "AI insights",
      icon: Sparkles,
      path: "/ai-insights",
    },
    {
      title: "Upgrade plan",
      icon: LineChart,
      path: "/upgrade-plan",
    },
  ];

  return (
    <Sidebar collapsible="icon" className="text-sidebar-foreground">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Database className="size-4" />
                </div>
                <span className="font-semibold">TRAID</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.path}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarUserProfile user={user} />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
