"use client";

import React from "react";
import Link from "next/link";
import "../globals.css";
import { 
  Container, 
  Button, 
  Text,
  Heading,
  DropdownMenu 
} from "@medusajs/ui";
import { 
  House, 
  User,
  SquaresPlus,
  ChevronDown
} from "@medusajs/icons";

/**
 * Public Layout
 * Wraps public pages like homepage, about, contact, etc.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <Container className="py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="no-underline">
              <Heading level="h1" className="text-black text-xl font-medium flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Dịch vụ Công
              </Heading>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="no-underline">
                <Text className="text-gray-700 hover:text-black transition-colors">Trang chủ</Text>
              </Link>
              <Link href="/login" className="no-underline">
                <Text className="text-gray-700 hover:text-black transition-colors">Đăng nhập</Text>
              </Link>
              <Link href="/register" className="no-underline">
                <Button variant="secondary" size="small" className="font-medium">
                  Đăng ký
                </Button>
              </Link>
            </div>
            
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="transparent" size="small" className="text-black">
                    Menu
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="bg-white shadow-md rounded-md p-1 border-none min-w-[160px]">
                  <DropdownMenu.Item className="py-2 px-3 hover:bg-gray-50 rounded-sm transition-colors">
                    <Link href="/" className="flex items-center gap-2 text-gray-700 no-underline w-full">
                      <House className="h-4 w-4" /> Trang chủ
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="py-2 px-3 hover:bg-gray-50 rounded-sm transition-colors">
                    <Link href="/login" className="flex items-center gap-2 text-gray-700 no-underline w-full">
                      <User className="h-4 w-4" /> Đăng nhập
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="py-2 px-3 hover:bg-gray-50 rounded-sm transition-colors">
                    <Link href="/register" className="flex items-center gap-2 text-gray-700 no-underline w-full">
                      <SquaresPlus className="h-4 w-4" /> Đăng ký
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-grow bg-white">
        <Container className="py-6">
          {children}
        </Container>
      </main>

      <footer className="bg-gray-50">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
            <Text size="small" className="text-gray-500">
              © 2023 Cổng thông tin dịch vụ công
            </Text>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-500 hover:text-gray-700 text-xs no-underline transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700 text-xs no-underline transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-700 text-xs no-underline transition-colors">
                Liên hệ
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
} 