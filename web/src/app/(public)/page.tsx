"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Heading, 
  Text, 
  Button, 
  Container, 
  IconBadge
} from "@medusajs/ui";

import {
  Clock,
  Calendar,
  User,
  Plus
} from "@medusajs/icons";

/**
 * Home page component
 */
export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section */}
      <div className="mb-16">
        <div className="text-center">
          <Heading level="h1" className="text-black mb-4 text-2xl md:text-3xl font-bold">
            Cổng dịch vụ công trực tuyến
          </Heading>
          <Text className="text-gray-600 mb-8 max-w-3xl mx-auto">
            Nơi cung cấp các dịch vụ hành chính công cho người dân và doanh nghiệp. 
            Giải quyết thủ tục nhanh chóng, thuận tiện và minh bạch.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="no-underline">
              <Button variant="secondary" className="w-full sm:w-auto border border-gray-200">
                <User className="mr-2" />
                Đăng ký tài khoản
              </Button>
            </Link>
            <Link href="/login" className="no-underline">
              <Button variant="transparent" className="w-full sm:w-auto border border-gray-200">
                <Plus className="mr-2" />
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mb-16">
        <Heading level="h2" className="text-black mb-8 text-center">Các tính năng chính</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-100 rounded">
            <div className="pb-0 text-center mb-1">
              <IconBadge className="mx-auto mb-4">
                <Plus />
              </IconBadge>
              <Heading level="h3" className="text-black">Nộp hồ sơ trực tuyến</Heading>
            </div>
            <div>
              <Text className="text-gray-500 text-center">
                Nộp hồ sơ hành chính mọi lúc, mọi nơi không cần đến trực tiếp cơ quan nhà nước.
              </Text>
            </div>
          </div>
          
          <div className="p-6 bg-white border border-gray-100 rounded">
            <div className="pb-0 text-center mb-1">
              <IconBadge className="mx-auto mb-4">
                <Clock />
              </IconBadge>
              <Heading level="h3" className="text-black">Theo dõi tiến độ</Heading>
            </div>
            <div>
              <Text className="text-gray-500 text-center">
                Theo dõi trạng thái xử lý hồ sơ minh bạch, rõ ràng và cập nhật thời gian thực.
              </Text>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded">
            <div className="pb-0 text-center mb-1">
              <IconBadge className="mx-auto mb-4">
                <Calendar />
              </IconBadge>
              <Heading level="h3" className="text-black">Lịch hẹn trực tuyến</Heading>
            </div>
            <div>
              <Text className="text-gray-500 text-center">
                Đặt lịch hẹn trực tuyến để nhận kết quả hoặc bổ sung hồ sơ không cần chờ đợi.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Guide section */}
      <div className="p-8 border border-gray-100 rounded">
        <div className="pb-6">
          <Heading level="h2" className="text-black">Hướng dẫn sử dụng</Heading>
        </div>
        <div>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-black border border-gray-200 mr-4 text-sm font-medium">
                1
              </div>
              <div>
                <Heading level="h3" className="text-black">Đăng ký tài khoản</Heading>
                <Text className="text-gray-500">Tạo tài khoản người dùng với các thông tin cá nhân cơ bản.</Text>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-black border border-gray-200 mr-4 text-sm font-medium">
                2
              </div>
              <div>
                <Heading level="h3" className="text-black">Chọn dịch vụ</Heading>
                <Text className="text-gray-500">Lựa chọn dịch vụ công phù hợp với nhu cầu của bạn.</Text>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-black border border-gray-200 mr-4 text-sm font-medium">
                3
              </div>
              <div>
                <Heading level="h3" className="text-black">Nộp hồ sơ</Heading>
                <Text className="text-gray-500">Điền thông tin và tải lên các tài liệu cần thiết theo hướng dẫn.</Text>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-black border border-gray-200 mr-4 text-sm font-medium">
                4
              </div>
              <div>
                <Heading level="h3" className="text-black">Theo dõi và nhận kết quả</Heading>
                <Text className="text-gray-500">Kiểm tra tiến độ xử lý và nhận thông báo khi hồ sơ được giải quyết.</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 