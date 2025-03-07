"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Loading from "../loading";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";

// Import Medusa UI components
import {
  Button,
  Text,
  Heading,
  IconButton,
  Avatar,
  Drawer,
  Kbd,
  Badge
} from "@medusajs/ui";

// Import Medusa Icons
import {
  House,
  Plus,
  Clock,
  User
} from "@medusajs/icons";

/**
 * Font configurations using Geist fonts.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Mảng chứa các ảnh đại diện mẫu (sử dụng SVG có sẵn trong public)
const sampleAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'
];

// Màu nền ngẫu nhiên cho avatar khi không có hình ảnh
const avatarBgColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-violet-500',
];

// Custom Sidebar nav components
const SidebarNav = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1 py-4">{children}</div>
);

const SidebarNavItem = ({
  children,
  href,
  icon,
  active = false,
  badge
}: {
  children: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: number;
}) => (
  <Link href={href} className="no-underline">
    <div className={`flex items-center justify-between px-4 py-2 text-sm rounded-md ${active
      ? 'bg-ui-bg-base-hover text-ui-fg-base'
      : 'text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base'
      }`}>
      <div className="flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        {children}
      </div>
      {badge !== undefined && badge > 0 && (
        <Badge>{badge}</Badge>
      )}
    </div>
  </Link>
);

/**
 * Dashboard Layout component
 * 
 * Acts as the main application layout for authenticated users.
 * This layout checks for authentication status before rendering protected pages.
 * If not authenticated, it redirects to "/login".
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Thêm trạng thái cho ảnh đại diện
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBgColor, setAvatarBgColor] = useState<string>(''); 
  
  // Chọn một ảnh đại diện và màu nền ngẫu nhiên khi component được mount
  useEffect(() => {
    if (user) {
      // Giả lập chọn avatar dựa trên id user (nếu có) hoặc một số ngẫu nhiên
      const userId = user.id || Math.floor(Math.random() * 100);
      
      // Sử dụng userId để tạo seed cố định cho mỗi user
      const avatarIndex = userId % sampleAvatars.length;
      const colorIndex = userId % avatarBgColors.length;
      
      // Chọn avatar và màu nền
      setAvatarUrl(sampleAvatars[avatarIndex]);
      setAvatarBgColor(avatarBgColors[colorIndex]);
    }
  }, [user]);

  useEffect(() => {
    // If authentication check is complete and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      // Redirect to login page
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return <Loading />;
  }

  // Don't render dashboard layout for unauthenticated users
  if (!isAuthenticated) {
    return <Loading />;
  }

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Close mobile sidebar when clicking outside of it
  const handleCloseSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    // Exact match for dashboard
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // For other routes, check if the pathname starts with the path
    // This ensures that subroutes are also highlighted
    if (path !== '/dashboard') {
      return pathname.startsWith(path);
    }
    
    return false;
  };

  // Hàm render Avatar với ảnh nếu có
  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <div className="w-9 h-9 rounded-full overflow-hidden">
          <img 
            src={avatarUrl} 
            alt={user?.name || user?.username || 'User Avatar'} 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    // Fallback với chữ cái đầu và màu nền ngẫu nhiên
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${avatarBgColor}`}>
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} bg-white min-h-screen flex flex-col`}>
      {/* Mobile Header */}
      <div className="md:hidden border-b border-ui-border-base">
        <div className="py-3 flex items-center justify-between px-4">
          <IconButton
            variant="transparent"
            size="small"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </IconButton>
          <Heading level="h3" className="text-ui-fg-base">Dịch vụ Công</Heading>
          <div className="w-8"></div> {/* Để cân bằng layout */}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Mobile Sidebar Drawer */}
        <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <Drawer.Content className="w-72 max-w-[80vw]">
            <Drawer.Header>
              <Drawer.Title>
                <Heading level="h3" className="text-ui-fg-base">Dịch vụ Công</Heading>
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col h-full pb-0">
              <SidebarNav>
                <SidebarNavItem
                  href="/dashboard"
                  icon={<House />}
                  active={isActive('/dashboard')}
                >
                  Dashboard
                </SidebarNavItem>
                <SidebarNavItem
                  href="/dashboard/applications"
                  icon={<Plus />}
                  active={isActive('/dashboard/applications')}
                >
                  Nộp hồ sơ
                </SidebarNavItem>
                <SidebarNavItem
                  href="/dashboard/history"
                  icon={<Clock />}
                  badge={3}
                  active={isActive('/dashboard/history')}
                >
                  Lịch sử
                </SidebarNavItem>
                <SidebarNavItem
                  href="/dashboard/profile"
                  icon={<User />}
                  active={isActive('/dashboard/profile')}
                >
                  Thông tin cá nhân
                </SidebarNavItem>
              </SidebarNav>

              <div className="mt-auto p-4 border-t border-ui-border-base">
                <div className="flex items-center gap-3 mb-4">
                  {renderAvatar()}
                  <div>
                    <Text size="small" weight="plus" className="text-ui-fg-base">
                      {user?.name || user?.username}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {user?.type === 'citizen' ? 'Công dân' : 'Cán bộ'}
                    </Text>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 border-r border-ui-border-base bg-white px-4">
          <div className="h-full flex flex-col">
            <div className="h-16 flex items-center px-4 border-b border-ui-border-base">
              <Heading level="h3" className="text-ui-fg-base">Dịch vụ Công</Heading>
            </div>

            <SidebarNav>
              <SidebarNavItem
                href="/dashboard"
                icon={<House />}
                active={isActive('/dashboard')}
              >
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem
                href="/dashboard/applications"
                icon={<Plus />}
                active={isActive('/dashboard/applications')}
              >
                Nộp hồ sơ
              </SidebarNavItem>
              <SidebarNavItem
                href="/dashboard/history"
                icon={<Clock />}
                badge={3}
                active={isActive('/dashboard/history')}
              >
                Lịch sử
              </SidebarNavItem>
              <SidebarNavItem
                href="/dashboard/profile"
                icon={<User />}
                active={isActive('/dashboard/profile')}
              >
                Thông tin cá nhân
              </SidebarNavItem>
            </SidebarNav>

            <div className="mt-auto p-4 border-t border-ui-border-base">
              <div className="flex items-center gap-3 mb-4">
                {renderAvatar()}
                <div>
                  <Text size="small" weight="plus" className="text-ui-fg-base">
                    {user?.name || user?.username}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {user?.type === 'citizen' ? 'Công dân' : 'Cán bộ'}
                  </Text>
                </div>
              </div>
              <Button
                variant="secondary"
                size="small"
                className="w-full"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden" onClick={handleCloseSidebar}>
          <div className="py-6 flex-1">
            <div className="px-4 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <Heading level="h1" className="text-ui-fg-base">Dashboard</Heading>
                <Kbd>Ctrl+K</Kbd>
              </div>
            </div>
            <div className="px-4">
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 