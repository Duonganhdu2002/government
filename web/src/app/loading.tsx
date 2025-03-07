import React from "react";
import { Container, Text, Heading } from "@medusajs/ui";

/**
 * Loading component displayed during navigation or data fetching
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Container className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ui-fg-interactive mb-4"></div>
        <Heading level="h2" className="text-black">Đang tải...</Heading>
        <Text className="text-ui-fg-subtle mt-2 text-center">Vui lòng đợi trong giây lát</Text>
      </Container>
    </div>
  );
} 