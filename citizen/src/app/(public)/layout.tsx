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
  SquaresPlus
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
      <header className="bg-white border-b border-gray-100">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="no-underline">
              <Heading level="h1" className="text-black">Dịch vụ Công</Heading>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link href="/" className="no-underline">
                <Button variant="transparent" size="small">
                  <House className="mr-2 text-black" />
                  <Text className="text-black">Trang chủ</Text>
                </Button>
              </Link>
              <Link href="/login" className="no-underline">
                <Button variant="transparent" size="small">
                  <User className="mr-2 text-black" />
                  <Text className="text-black">Đăng nhập</Text>
                </Button>
              </Link>
              <Link href="/register" className="no-underline">
                <Button variant="secondary" size="small" className="border border-gray-200">
                  <SquaresPlus className="mr-2" />
                  Đăng ký
                </Button>
              </Link>
            </div>
            
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="transparent" size="small" className="text-black border border-gray-200">
                    Menu
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="bg-white border border-gray-200">
                  <DropdownMenu.Item asChild>
                    <Link href="/" className="flex items-center gap-2 text-black">
                      <House /> Trang chủ
                    </Link>
                  </DropdownMenu.Item>
                  <hr className="bg-gray-100" />
                  <DropdownMenu.Item asChild>
                    <Link href="/login" className="flex items-center gap-2 text-black">
                      <User /> Đăng nhập
                    </Link>
                  </DropdownMenu.Item>
                  <hr className="bg-gray-100" />
                  <DropdownMenu.Item asChild>
                    <Link href="/register" className="flex items-center gap-2 text-black">
                      <SquaresPlus /> Đăng ký
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

      <footer className="bg-gray-50 border-t border-gray-100">
        <Container className="py-6">
          <Text size="small" className="text-gray-500 text-center">
            © 2023 Cổng thông tin dịch vụ công. Bảo lưu mọi quyền.
          </Text>
        </Container>
      </footer>
    </div>
  );
} 