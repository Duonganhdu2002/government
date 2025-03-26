"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heading, 
  Text, 
  Button, 
  IconBadge,
  Kbd
} from "@medusajs/ui";

import {
  Clock,
  Calendar,
  User,
  Plus,
  ChevronRight
} from "@medusajs/icons";

/**
 * Home page component
 */
export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section */}
      <div className="mb-20 mt-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block mb-6 bg-gray-50 px-4 py-1 rounded-full">
            <Text className="text-sm text-gray-500 font-medium">Dịch vụ hành chính công 2023</Text>
          </div>
          <Heading level="h1" className="text-black mb-6 text-3xl md:text-4xl font-bold leading-tight">
            Nền tảng dịch vụ công trực tuyến đơn giản và hiệu quả
          </Heading>
          <Text className="text-gray-600 mb-10 text-lg leading-relaxed">
            Nộp hồ sơ, theo dõi tiến độ và nhận kết quả trực tuyến. Tiết kiệm thời gian và tối ưu trải nghiệm.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="no-underline">
              <Button size="large" className="w-full sm:w-auto shadow-sm font-medium px-6">
                Bắt đầu ngay
                <ChevronRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="no-underline">
              <Button variant="transparent" size="large" className="w-full sm:w-auto border border-gray-200 font-medium px-6">
                <User className="mr-2" />
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mb-20">
        <Text size="small" className="text-gray-500 font-medium uppercase tracking-wider mb-3 text-center">Tính năng</Text>
        <Heading level="h2" className="text-black mb-10 text-center text-2xl font-bold">Giải pháp toàn diện</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl transition-all hover:shadow-md">
            <div className="mb-6">
              <IconBadge className="bg-blue-50">
                <Plus className="text-blue-600" />
              </IconBadge>
            </div>
            <Heading level="h3" className="text-black mb-3 text-lg font-medium">Nộp hồ sơ trực tuyến</Heading>
            <Text className="text-gray-600">
              Nộp hồ sơ hành chính mọi lúc, mọi nơi không cần đến trực tiếp cơ quan nhà nước.
            </Text>
          </div>
          
          <div className="p-6 bg-white rounded-xl transition-all hover:shadow-md">
            <div className="mb-6">
              <IconBadge className="bg-green-50">
                <Clock className="text-green-600" />
              </IconBadge>
            </div>
            <Heading level="h3" className="text-black mb-3 text-lg font-medium">Theo dõi tiến độ</Heading>
            <Text className="text-gray-600">
              Theo dõi trạng thái xử lý hồ sơ minh bạch, rõ ràng và cập nhật thời gian thực.
            </Text>
          </div>

          <div className="p-6 bg-white rounded-xl transition-all hover:shadow-md">
            <div className="mb-6">
              <IconBadge className="bg-purple-50">
                <Calendar className="text-purple-600" />
              </IconBadge>
            </div>
            <Heading level="h3" className="text-black mb-3 text-lg font-medium">Lịch hẹn trực tuyến</Heading>
            <Text className="text-gray-600">
              Đặt lịch hẹn trực tuyến để nhận kết quả hoặc bổ sung hồ sơ không cần chờ đợi.
            </Text>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="mb-20 py-12 px-6 bg-gray-50 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <Heading level="h3" className="text-black text-3xl font-bold mb-2">1M+</Heading>
            <Text className="text-gray-600">Người dùng</Text>
          </div>
          <div>
            <Heading level="h3" className="text-black text-3xl font-bold mb-2">24/7</Heading>
            <Text className="text-gray-600">Hỗ trợ</Text>
          </div>
          <div>
            <Heading level="h3" className="text-black text-3xl font-bold mb-2">100+</Heading>
            <Text className="text-gray-600">Dịch vụ công</Text>
          </div>
        </div>
      </div>

      {/* Guide section */}
      <div className="mb-10">
        <Text size="small" className="text-gray-500 font-medium uppercase tracking-wider mb-3">Hướng dẫn</Text>
        <Heading level="h2" className="text-black mb-8 text-2xl font-bold">Các bước thực hiện</Heading>
        
        <div className="space-y-6">
          <div className="flex items-start py-4 px-5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-medium mr-4">
              1
            </div>
            <div>
              <Heading level="h3" className="text-black mb-1 text-lg font-medium">Đăng ký tài khoản</Heading>
              <Text className="text-gray-600">Tạo tài khoản người dùng với các thông tin cá nhân cơ bản.</Text>
              <Kbd className="mt-2 text-xs">Bấm <Kbd>Đăng ký</Kbd> trên thanh điều hướng</Kbd>
            </div>
          </div>
          
          <div className="flex items-start py-4 px-5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600 font-medium mr-4">
              2
            </div>
            <div>
              <Heading level="h3" className="text-black mb-1 text-lg font-medium">Chọn dịch vụ</Heading>
              <Text className="text-gray-600">Lựa chọn dịch vụ công phù hợp với nhu cầu của bạn.</Text>
            </div>
          </div>
          
          <div className="flex items-start py-4 px-5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-600 font-medium mr-4">
              3
            </div>
            <div>
              <Heading level="h3" className="text-black mb-1 text-lg font-medium">Nộp hồ sơ</Heading>
              <Text className="text-gray-600">Điền thông tin và tải lên các tài liệu cần thiết theo hướng dẫn.</Text>
            </div>
          </div>
          
          <div className="flex items-start py-4 px-5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-600 font-medium mr-4">
              4
            </div>
            <div>
              <Heading level="h3" className="text-black mb-1 text-lg font-medium">Theo dõi và nhận kết quả</Heading>
              <Text className="text-gray-600">Kiểm tra tiến độ xử lý và nhận thông báo khi hồ sơ được giải quyết.</Text>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="mb-10 mt-16 bg-gray-900 text-white rounded-2xl p-10 text-center">
        <Heading level="h2" className="text-white mb-4 text-2xl font-bold">Bắt đầu sử dụng ngay hôm nay</Heading>
        <Text className="text-gray-300 mb-8 max-w-lg mx-auto">
          Tham gia cùng hàng triệu người dân đang sử dụng nền tảng dịch vụ công trực tuyến hiện đại.
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="no-underline">
            <Button size="large" className="w-full sm:w-auto font-medium px-6">
              Đăng ký miễn phí
            </Button>
          </Link>
          <Link href="/about" className="no-underline">
            <Button variant="transparent" size="large" className="w-full sm:w-auto font-medium px-6 text-white border border-gray-700 hover:bg-gray-800">
              Tìm hiểu thêm
              <ChevronRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 