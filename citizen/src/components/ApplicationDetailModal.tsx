"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Heading, 
  Text, 
  Button, 
  Badge
} from '@medusajs/ui';
import { ChevronLeft, Calendar, MapPin } from '@medusajs/icons';
import { fetchApplicationById } from '@/services/applicationService';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import Modal from './Modal';

// Custom icons
interface IconProps {
  className?: string;
}

const FileTextIcon = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ImageIcon = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = ({ className = "" }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="10" y1="8" x2="10" y2="16" />
    <line x1="14" y1="8" x2="14" y2="16" />
  </svg>
);

// Custom Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardPartProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>{children}</div>;
};

Card.Header = ({ children, className = "" }: CardPartProps) => {
  return <div className={`px-4 py-3 border-b border-gray-200 bg-gray-50 ${className}`}>{children}</div>;
};

Card.Content = ({ children, className = "" }: CardPartProps) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

// Spinner component
interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className = "" }: SpinnerProps) => (
  <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 ${className}`}></div>
);

// Hàm để lấy status badge dựa trên trạng thái của đơn
const getStatusBadge = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'submitted':
      return <Badge color="blue">Đã nộp</Badge>;
    case 'processing':
      return <Badge color="orange">Đang xử lý</Badge>;
    case 'completed':
      return <Badge color="green">Hoàn thành</Badge>;
    case 'rejected':
      return <Badge color="red">Từ chối</Badge>;
    default:
      return <Badge color="grey">{status}</Badge>;
  }
};

// Định nghĩa kiểu cho attachment
interface MediaAttachment {
  mediafileid: number;
  applicationid: number;
  mimetype: string;
  originalfilename: string;
  filesize?: number;
  uploaddate?: string;
  filetype?: string;
  filepath?: string;
  [key: string]: any;
}

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number | null;
}

// Custom ImageWithFallback component
function ImageWithFallback({
  src,
  fallbackSrc = '/placeholder-image.svg',
  alt,
  onError,
  ...rest
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  onError?: (error: Error) => void;
  [x: string]: any;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...rest}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
          if (onError) {
            onError(new Error(`Failed to load image: ${src}`));
          }
        }
      }}
    />
  );
}

// Component FallbackImage sử dụng thẻ img thông thường thay vì Next/Image
function FallbackImage({ 
  src, 
  alt, 
  attachment,
  className,
  onError
}: { 
  src: string; 
  alt: string; 
  attachment: MediaAttachment;
  className?: string;
  onError?: () => void;
}) {
  // State để theo dõi xem đã thử tải bao nhiêu lần
  const [loadAttempt, setLoadAttempt] = useState(0);
  
  // Tạo URL dựa vào số lần thử
  const getUrlForAttempt = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // 1. Thử dùng filepath chuẩn
    if (loadAttempt === 0 && attachment.filepath) {
      const cleanPath = attachment.filepath.startsWith('/') 
        ? attachment.filepath 
        : `/${attachment.filepath}`;
      return `${API_URL}${cleanPath}`;
    }
    
    // 2. Thử dùng direct URL với timestamp để bypass cache
    if (loadAttempt === 1 && attachment.filepath) {
      const cleanPath = attachment.filepath.startsWith('/') 
        ? attachment.filepath 
        : `/${attachment.filepath}`;
      return `${API_URL}${cleanPath}?v=${Date.now()}`;
    }
    
    // 3. Thử dùng API serve
    if (loadAttempt === 2) {
      return `${API_URL}/api/media-files/serve/${attachment.mediafileid}`;
    }
    
    // 4. Fallback to placeholder
    return '/placeholder-image.svg';
  };

  const currentUrl = loadAttempt <= 2 ? getUrlForAttempt() : '/placeholder-image.svg';
  
  return (
    <Image 
      src={currentUrl} 
      alt={alt} 
      className={className || "w-full h-full object-contain"} 
      onError={(e) => {
        console.error(`Lỗi tải ảnh (lần ${loadAttempt + 1}): ${currentUrl}`);
        
        if (loadAttempt < 3) {
          // Thử tải lại với chiến lược khác
          setLoadAttempt(prev => prev + 1);
        } else {
          // Đã thử đủ cách, sử dụng placeholder
          if (onError) onError();
        }
      }} 
    />
  );
}

// Component Image cải tiến
function OptionalImage({
  attachment,
  alt,
  className
}: {
  attachment: MediaAttachment;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  
  // Tạo URL từ attachment
  const imageUrl = (() => {
    // Dùng NEXT_PUBLIC_API_URL từ môi trường hoặc mặc định là localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Đường dẫn đầy đủ từ filepath
    if (attachment.filepath) {
      // Đảm bảo filepath bắt đầu với /
      const cleanPath = attachment.filepath.startsWith('/') 
        ? attachment.filepath 
        : `/${attachment.filepath}`;
        
      return `${API_URL}${cleanPath}`;
    }
    
    // Fallback: Dùng mediafileid nếu không có filepath
    return `${API_URL}/api/media-files/serve/${attachment.mediafileid}`;
  })();
  
  if (error) {
    return (
      <Image 
        src="/placeholder-image.svg" 
        alt={alt} 
        className={className || "w-full h-full object-contain"} 
      />
    );
  }

  return (
    <FallbackImage 
      src={imageUrl}
      alt={alt}
      attachment={attachment}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default function ApplicationDetailModal({ isOpen, onClose, applicationId }: ApplicationDetailModalProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaLoadErrors, setMediaLoadErrors] = useState<{[key: string]: boolean}>({});
  
  const fetchApplicationDetail = async () => {
    if (!applicationId) return;
    
    try {
      setLoading(true);
      setError(null);
      setMediaLoadErrors({});
      console.log(`Fetching application details for ID: ${applicationId}`);
      const data = await fetchApplicationById(applicationId.toString());
      setApplication(data);
    } catch (err: any) {
      console.error('Failed to fetch application details:', err);
      setError(err?.message || 'Không thể tải thông tin chi tiết của đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isOpen || !applicationId) return;
    fetchApplicationDetail();
  }, [isOpen, applicationId]);
  
  // Debug: Log thông tin chi tiết về attachments khi có
  useEffect(() => {
    if (application?.attachments && application.attachments.length > 0) {
      console.log(`Có ${application.attachments.length} tệp đính kèm:`);
      application.attachments.forEach((att: MediaAttachment, index: number) => {
        console.log(`Tệp ${index + 1}:`, { 
          id: att.mediafileid,
          type: att.mimetype || att.filetype,
          name: att.originalfilename,
          filepath: att.filepath
        });
        console.log(`URL cho tệp ${index + 1}:`, getMediaUrl(att));
      });
    }
  }, [application?.attachments]);
  
  // Xử lý lỗi tải media
  const handleMediaError = (mediaId: number, mediaType: 'image' | 'video') => {
    console.error(`Lỗi tải ${mediaType} với ID: ${mediaId}`);
    setMediaLoadErrors(prev => ({
      ...prev,
      [mediaId]: true
    }));
  };
  
  // Hàm tải lại tệp đính kèm
  const handleRetryLoadMedia = () => {
    if (!applicationId) return;
    
    // Nếu có lỗi tải media, thử tải lại toàn bộ chi tiết đơn
    if (Object.keys(mediaLoadErrors).length > 0) {
      fetchApplicationDetail();
    }
  };

  // Xây dựng URL cho media file
  const getMediaUrl = (attachment: MediaAttachment): string => {
    // Dùng NEXT_PUBLIC_API_URL từ môi trường hoặc mặc định là localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Đường dẫn đầy đủ từ filepath
    if (attachment.filepath) {
      // Đảm bảo filepath bắt đầu với /
      const cleanPath = attachment.filepath.startsWith('/') 
        ? attachment.filepath 
        : `/${attachment.filepath}`;
        
      const fullUrl = `${API_URL}${cleanPath}`;
      console.log(`Image URL via filepath: ${fullUrl}`);
      return fullUrl;
    }
    
    // Fallback: Dùng mediafileid nếu không có filepath
    const fallbackUrl = `${API_URL}/api/media-files/serve/${attachment.mediafileid}`;
    console.log(`Image URL via mediafileid: ${fallbackUrl}`);
    return fallbackUrl;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl mx-auto">
      <Modal.Header className="px-6 py-5">
        {application ? (
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2">{application.title}</Heading>
              <div className="flex items-center gap-2 mt-1">
                <Text size="small" className="text-ui-fg-subtle">Mã đơn: {application.applicationid}</Text>
                {getStatusBadge(application.status)}
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="small"
              disabled={true}
            >
              <span className="w-4 h-4 mr-1"><FileTextIcon /></span>
              In đơn
            </Button>
          </div>
        ) : (
          <Heading level="h2">Chi tiết đơn</Heading>
        )}
      </Modal.Header>
      
      <Modal.Body className="px-6 py-5">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner className="mr-2" />
            <Text>Đang tải dữ liệu...</Text>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <Text className="text-red-600">{error}</Text>
          </div>
        ) : !application ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <Text className="text-yellow-700">Không tìm thấy thông tin đơn.</Text>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <Card.Header>
                  <Heading level="h3">Thông tin cơ bản</Heading>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <div>
                      <Text className="text-gray-500 text-sm">Loại đơn</Text>
                      <Text className="font-medium">{application.applicationtypename}</Text>
                    </div>
                    
                    {application.specialapplicationtypename && (
                      <div>
                        <Text className="text-gray-500 text-sm">Loại đơn đặc biệt</Text>
                        <Text className="font-medium">{application.specialapplicationtypename}</Text>
                      </div>
                    )}
                    
                    <div>
                      <Text className="text-gray-500 text-sm">Ngày nộp</Text>
                      <Text className="font-medium">{formatDateTime(application.submissiondate)}</Text>
                    </div>
                    
                    <div>
                      <Text className="text-gray-500 text-sm">Hạn xử lý</Text>
                      <Text className="font-medium">{formatDate(application.duedate)}</Text>
                    </div>
                  </div>
                </Card.Content>
              </Card>
              
              <Card className="md:col-span-2">
                <Card.Header>
                  <Heading level="h3">Nội dung</Heading>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    {application.description && (
                      <div>
                        <Text className="text-gray-500 text-sm mb-1">Mô tả</Text>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <Text>{application.description}</Text>
                        </div>
                      </div>
                    )}
                    
                    {application.eventdate && (
                      <div className="flex items-center gap-2 mt-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Text>Ngày diễn ra: {formatDate(application.eventdate)}</Text>
                      </div>
                    )}
                    
                    {application.location && (
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <Text>Địa điểm: {application.location}</Text>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
            
            {application.hasmedia && (
              <Card className="mt-6">
                <Card.Header className="flex justify-between items-center">
                  <Heading level="h3">Tài liệu đính kèm</Heading>
                  
                  {/* Nút tải lại nếu có lỗi tải media */}
                  {Object.keys(mediaLoadErrors).length > 0 && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleRetryLoadMedia}
                    >
                      Tải lại tệp
                    </Button>
                  )}
                </Card.Header>
                <Card.Content>
                  {/* Hiển thị thông báo nếu có lỗi tải media */}
                  {Object.keys(mediaLoadErrors).length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                      <Text className="text-yellow-700 text-sm">
                        Có {Object.keys(mediaLoadErrors).length} tệp không tải được. Vui lòng kiểm tra kết nối mạng và thử lại.
                      </Text>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Thống kê tệp đính kèm */}
                    {application.attachments && application.attachments.length > 0 ? (
                      <div className="mb-4 flex flex-wrap gap-3">
                        <Badge color="blue">
                          Tổng số: {application.attachments.length} tệp
                        </Badge>
                        
                        {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('image/')).length > 0 && (
                          <Badge color="green">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('image/')).length} ảnh
                            </span>
                          </Badge>
                        )}
                        
                        {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('video/')).length > 0 && (
                          <Badge color="purple">
                            <span className="flex items-center gap-1">
                              <VideoIcon className="w-3 h-3" />
                              {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('video/')).length} video
                            </span>
                          </Badge>
                        )}
                        
                        {application.attachments.filter((att: MediaAttachment) => !att.mimetype?.startsWith('image/') && !att.mimetype?.startsWith('video/')).length > 0 && (
                          <Badge color="grey">
                            <span className="flex items-center gap-1">
                              <FileTextIcon className="w-3 h-3" />
                              {application.attachments.filter((att: MediaAttachment) => !att.mimetype?.startsWith('image/') && !att.mimetype?.startsWith('video/')).length} tài liệu khác
                            </span>
                          </Badge>
                        )}
                      </div>
                    ) : null}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Hiển thị ảnh đính kèm */}
                      {application.attachments && application.attachments.length > 0 ? (
                        application.attachments
                          .filter((attachment: MediaAttachment) => attachment.mimetype && attachment.mimetype.startsWith('image/'))
                          .map((attachment: MediaAttachment, index: number) => (
                            <div key={`image-${index}`} className="border border-gray-200 rounded-md p-2 hover:shadow-md transition-shadow">
                              <a 
                                href={getMediaUrl(attachment)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden relative">
                                  <OptionalImage 
                                    attachment={attachment}
                                    alt={`Tệp đính kèm ${index + 1}`} 
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <Text className="text-sm text-center truncate">
                                    {attachment.originalfilename || `Ảnh ${index + 1}`}
                                  </Text>
                                  <Text className="text-xs text-gray-500 text-center">
                                    {attachment.filesize ? `${Math.round(attachment.filesize / 1024)} KB` : ''}
                                    {attachment.uploaddate ? ` • ${new Date(attachment.uploaddate).toLocaleDateString()}` : ''}
                                  </Text>
                                </div>
                              </a>
                            </div>
                          ))
                      ) : null}
                      
                      {/* Hiển thị video đính kèm */}
                      {application.attachments && application.attachments.length > 0 ? (
                        application.attachments
                          .filter((attachment: MediaAttachment) => attachment.mimetype && attachment.mimetype.startsWith('video/'))
                          .map((attachment: MediaAttachment, index: number) => (
                            <div key={`video-${index}`} className="border border-gray-200 rounded-md p-2 hover:shadow-md transition-shadow">
                              <a 
                                href={getMediaUrl(attachment)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                                  <video
                                    src={getMediaUrl(attachment)}
                                    controls
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      console.error(`Lỗi tải video: ${attachment.mediafileid}, đường dẫn: ${attachment.filepath}`);
                                      // Đánh dấu lỗi tải
                                      handleMediaError(attachment.mediafileid, 'video');
                                      // Hiển thị icon thay thế
                                      const target = e.target as HTMLVideoElement;
                                      const parent = target.parentElement;
                                      if (parent) {
                                        target.style.display = 'none';
                                        const iconDiv = document.createElement('div');
                                        iconDiv.className = 'flex justify-center items-center w-full h-full bg-gray-100';
                                        iconDiv.innerHTML = `<span class="w-10 h-10 text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="10" y1="8" x2="10" y2="16" /><line x1="14" y1="8" x2="14" y2="16" /></svg>
                                        </span>`;
                                        parent.appendChild(iconDiv);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <Text className="text-sm text-center truncate">
                                    {attachment.originalfilename || `Video ${index + 1}`}
                                  </Text>
                                  <Text className="text-xs text-gray-500 text-center">
                                    {attachment.filesize ? `${Math.round(attachment.filesize / 1024)} KB` : ''}
                                    {attachment.uploaddate ? ` • ${new Date(attachment.uploaddate).toLocaleDateString()}` : ''}
                                  </Text>
                                </div>
                              </a>
                            </div>
                          ))
                      ) : null}
                      
                      {/* Hiển thị tài liệu khác */}
                      {application.attachments && application.attachments.length > 0 ? (
                        application.attachments
                          .filter((attachment: MediaAttachment) => 
                            attachment.mimetype && 
                            !attachment.mimetype.startsWith('image/') && 
                            !attachment.mimetype.startsWith('video/')
                          )
                          .map((attachment: MediaAttachment, index: number) => (
                            <div key={`doc-${index}`} className="border border-gray-200 rounded-md p-2 hover:shadow-md transition-shadow">
                              <a 
                                href={getMediaUrl(attachment)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <div className="flex justify-center items-center h-36 bg-gray-100 rounded mb-2">
                                  <span className="w-10 h-10 text-gray-400"><FileTextIcon /></span>
                                </div>
                                <div className="flex flex-col">
                                  <Text className="text-sm text-center truncate">
                                    {attachment.originalfilename || `Tài liệu ${index + 1}`}
                                  </Text>
                                  <Text className="text-xs text-gray-500 text-center">
                                    {attachment.filesize ? `${Math.round(attachment.filesize / 1024)} KB` : ''}
                                    {attachment.uploaddate ? ` • ${new Date(attachment.uploaddate).toLocaleDateString()}` : ''}
                                  </Text>
                                  <Text className="text-xs text-gray-500 text-center">{getMediaUrl(attachment)}</Text>
                                </div>
                              </a>
                            </div>
                          ))
                      ) : null}
                      
                      {/* Hiển thị thông báo nếu không có tài liệu đính kèm */}
                      {!application.attachments || application.attachments.length === 0 ? (
                        <div className="col-span-full text-center py-8">
                          <Text className="text-gray-500">Không có tài liệu đính kèm</Text>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}
            
            <Card className="mt-6">
              <Card.Header>
                <Heading level="h3">Lịch sử xử lý</Heading>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="w-6 h-6 text-blue-700"><FileTextIcon /></span>
                    </div>
                    <div>
                      <Text className="font-medium">Đơn đã được nộp</Text>
                      <Text className="text-gray-500 text-sm">{formatDateTime(application.submissiondate)}</Text>
                      <Text className="text-sm mt-1">Đơn của bạn đã được nộp thành công và đang chờ xử lý.</Text>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="px-6 py-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
} 