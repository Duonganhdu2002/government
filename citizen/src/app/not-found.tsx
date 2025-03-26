"use client";

import "./globals.css";
import React from 'react';
import Link from 'next/link';
import { 
  Heading, 
  Text, 
  Button, 
  Container
} from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";

/**
 * 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Container className="max-w-lg w-full space-y-8 text-center">
        <div className="py-6 px-4 rounded-xl bg-gray-50">
          <Text className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-6">404 Error</Text>
          <Heading level="h1" className="text-black text-3xl md:text-4xl font-bold mb-4">Không tìm thấy trang</Heading>
          <Text className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </Text>
          <div className="flex justify-center">
            <Link href="/" className="no-underline">
              <Button size="large" className="font-medium px-6 shadow-sm">
                <ArrowLeft className="mr-2" />
                Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </div>
        <div className="pt-8 pb-4">
          <Text className="text-gray-500 text-sm">
            Bạn cần hỗ trợ? <Link href="/contact" className="text-blue-600 hover:text-blue-700 transition-colors">Liên hệ với chúng tôi</Link>
          </Text>
        </div>
      </Container>
    </div>
  );
}
