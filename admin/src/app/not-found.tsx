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

/**
 * 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Container className="max-w-md w-full space-y-8 text-center">
        <div>
          <Heading level="h1" className="text-9xl font-extrabold text-ui-fg-interactive">404</Heading>
          <Heading level="h2" className="mt-6 text-3xl text-black font-bold">Không tìm thấy trang</Heading>
          <Text className="mt-2 text-ui-fg-subtle">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </Text>
        </div>
        <div className="mt-8">
          <Link href="/" className="no-underline">
            <Button variant="primary" className="w-full sm:w-auto">
              Quay lại trang chủ
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
