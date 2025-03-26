import React from "react";
import { Container, Text, Heading } from "@medusajs/ui";

/**
 * Loading component displayed during navigation or data fetching
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Container className="flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-gray-100"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-2 border-blue-600 animate-spin"></div>
        </div>
        <Heading level="h2" className="text-black mt-6 text-lg font-medium">Đang tải</Heading>
        <Text className="text-gray-500 mt-2 text-center text-sm">Vui lòng đợi trong giây lát</Text>
      </Container>
    </div>
  );
} 