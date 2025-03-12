"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Heading,
  Text,
  Button,
  Badge,
} from '@medusajs/ui';
import { 
  Calendar, 
  MapPin,
  XMark,
  ExclamationCircle,
  ArrowPath
} from '@medusajs/icons';
import { fetchApplicationDetailForStaff } from '@/services/applicationService';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { getAuthHeaders } from '@/lib/api';
import PrintPreview from './PrintPreview';
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

// Status badge component
export const ApplicationStatus = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-gray-200 text-gray-900';
      case 'pending':
      case 'in_review':
      case 'submitted':
        return 'bg-gray-50 text-gray-700';
      case 'pending_additional_info':
        return 'bg-gray-100 text-gray-700';
      case 'forwarded':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Đang chờ';
      case 'in_review':
        return 'Đang xem xét';
      case 'submitted':
        return 'Đã nộp';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending_additional_info':
        return 'Cần bổ sung';
      case 'forwarded':
        return 'Đã chuyển tiếp';
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusClass()}>
      {getStatusText()}
    </Badge>
  );
};

// MediaAttachment interface
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
  onUpdateStatus?: (id: number) => void;
}

// Component MediaImage with multiple loading strategies
function MediaImage({
  attachment,
  alt,
  className
}: {
  attachment: MediaAttachment;
  alt: string;
  className?: string;
}) {
  const [loadAttempt, setLoadAttempt] = useState(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Generate URL for media based on load attempt
  const getMediaUrl = (): string => {
    // If all 3 attempts failed, use placeholder
    if (loadAttempt >= 3) return '/placeholder-image.svg';

    // 1. First try standard filepath
    if (loadAttempt === 0 && attachment.filepath) {
      const cleanPath = attachment.filepath.startsWith('/')
        ? attachment.filepath
        : `/${attachment.filepath}`;
      return `${API_URL}${cleanPath}`;
    }

    // 2. Second try filepath with timestamp to bypass cache
    if (loadAttempt === 1 && attachment.filepath) {
      const cleanPath = attachment.filepath.startsWith('/')
        ? attachment.filepath
        : `/${attachment.filepath}`;
      return `${API_URL}${cleanPath}?v=${Date.now()}`;
    }

    // 3. Third try using API serve endpoint
    return `${API_URL}/api/media-files/serve/${attachment.mediafileid}`;
  };

  return (
    <div className="w-full h-full relative">
      <img
        src={getMediaUrl()}
        alt={alt}
        className={className || "w-full h-full object-fill"}
        onError={() => {
          console.error(`Lỗi tải media (lần ${loadAttempt + 1}): ${getMediaUrl()}`);
          if (loadAttempt < 3) {
            // Try next loading strategy
            setLoadAttempt(prev => prev + 1);
          }
        }}
      />
    </div>
  );
}

export default function ApplicationDetailModal({ isOpen, onClose, applicationId, onUpdateStatus }: ApplicationDetailModalProps) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaLoadErrors, setMediaLoadErrors] = useState<{ [key: string]: boolean }>({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const fetchApplicationDetail = async () => {
    if (!applicationId) return;
    
    try {
      setLoading(true);
      setError(null);
      setMediaLoadErrors({});
      console.log(`Fetching application details for ID: ${applicationId}`);
      
      // Add a timeout to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
      
      const response = await fetchApplicationDetailForStaff(applicationId.toString());
      clearTimeout(timeoutId);
      
      console.log("Application detail response:", response);
      
      // Handle both response formats (data property or direct object)
      const applicationData = response.data || response;
      
      // If attachments aren't included in the response, check if we need to fetch them separately
      if (!applicationData.attachments && applicationData.hasmedia) {
        try {
          console.log("Fetching attachments separately...");
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
          const mediaResponse = await fetch(`${API_URL}/api/media-files/by-application/${applicationId}`, {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            credentials: 'include'
          });
          
          if (mediaResponse.ok) {
            const mediaFiles = await mediaResponse.json();
            applicationData.attachments = mediaFiles;
            console.log(`Added ${mediaFiles.length} attachments to application data`);
          }
        } catch (mediaError) {
          console.error("Error fetching attachments:", mediaError);
          // Non-critical error, continue with the application data we have
        }
      }
      
      setApplication(applicationData);
    } catch (err: any) {
      console.error('Error fetching application detail:', err);
      
      // Provide more specific error messages based on the error type
      if (err.name === 'AbortError') {
        setError('Yêu cầu đã hết thời gian chờ. Vui lòng thử lại sau.');
      } else if (err.status === 500) {
        setError('Lỗi máy chủ nội bộ (500). Vui lòng liên hệ quản trị viên.');
      } else if (err.status === 404) {
        setError('Không tìm thấy đơn với ID đã cung cấp (404).');
      } else if (err.status === 403) {
        setError('Bạn không có quyền xem chi tiết đơn này (403).');
      } else {
        setError(err.message || 'Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationDetail();
    }
  }, [isOpen, applicationId]);

  // Handle media load errors
  const handleMediaError = (mediaId: number) => {
    console.error(`Lỗi tải media với ID: ${mediaId}`);
    setMediaLoadErrors(prev => ({
      ...prev,
      [mediaId]: true
    }));
  };

  // Function to retry loading media
  const handleRetryLoadMedia = () => {
    if (!applicationId) return;

    // If there are media errors, try reloading the entire application detail
    if (Object.keys(mediaLoadErrors).length > 0) {
      fetchApplicationDetail();
    }
  };

  // Build URL for media file
  const getMediaUrl = (attachment: MediaAttachment): string => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // If filepath exists, use it (most efficient and direct access)
    if (attachment.filepath) {
      const cleanPath = attachment.filepath.startsWith('/')
        ? attachment.filepath
        : `/${attachment.filepath}`;
      return `${API_URL}${cleanPath}`;
    }

    // Fallback to API serve endpoint using mediafileid
    return `${API_URL}/api/media-files/serve/${attachment.mediafileid}`;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <Modal.Header>
          <div className="flex items-center justify-between">
            {application ? (
              <div>
                <Heading level="h2" className="text-xl font-medium">{application.title}</Heading>
                <div className="flex items-center gap-2 mt-1">
                  <Text size="small" className="text-ui-fg-subtle">Mã đơn: {application.applicationid}</Text>
                  <ApplicationStatus status={application.status} />
                </div>
              </div>
            ) : (
              <Heading level="h2" className="text-xl">Chi tiết đơn #{applicationId}</Heading>
            )}
            <div className="flex gap-2">
              {application && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowPrintPreview(true)}
                >
                  <span className="w-4 h-4 mr-1"><FileTextIcon /></span>
                  In đơn
                </Button>
              )}
              <Button variant="secondary" size="small" onClick={onClose}>
                <XMark />
              </Button>
            </div>
          </div>
        </Modal.Header>
      
        <Modal.Body className="flex flex-col px-6 py-5 gap-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner className="mr-2" />
              <Text>Đang tải dữ liệu...</Text>
            </div>
          ) : error ? (
            <div className="p-4 mb-4 bg-gray-100 border border-gray-300 text-gray-700 rounded">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <ExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <Text className="font-medium">Không thể tải thông tin chi tiết</Text>
                    <Text className="text-sm mt-1">{error}</Text>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="secondary" 
                    size="small" 
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      // Retry fetching after a short delay
                      setTimeout(fetchApplicationDetail, 1000);
                    }}
                  >
                    <ArrowPath className="w-3.5 h-3.5 mr-1" />
                    Thử lại
                  </Button>
                </div>
              </div>
            </div>
          ) : application ? (
            <div className="space-y-6 overflow-y-auto pr-2 py-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
              {/* Grid layout for basic information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <Card.Header>
                    <Heading level="h3" className="text-base">Thông tin cơ bản</Heading>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-3">
                      <div>
                        <Text className="text-gray-500 text-sm">Loại đơn</Text>
                        <Text className="font-medium">{application.applicationtypename || 'N/A'}</Text>
                      </div>
                      
                      {application.specialapplicationtypename && (
                        <div>
                          <Text className="text-gray-500 text-sm">Loại đơn đặc biệt</Text>
                          <Text className="font-medium">{application.specialapplicationtypename}</Text>
                        </div>
                      )}
                      
                      <div>
                        <Text className="text-gray-500 text-sm">Người nộp</Text>
                        <Text className="font-medium">{application.citizenname || 'N/A'}</Text>
                      </div>
                      
                      <div>
                        <Text className="text-gray-500 text-sm">Ngày nộp</Text>
                        <Text className="font-medium">{formatDateTime(application.submissiondate) || 'N/A'}</Text>
                      </div>
                      
                      <div>
                        <Text className="text-gray-500 text-sm">Hạn xử lý</Text>
                        <Text className="font-medium">{formatDate(application.duedate) || 'N/A'}</Text>
                      </div>
                      
                      <div>
                        <Text className="text-gray-500 text-sm">Cơ quan xử lý</Text>
                        <Text className="font-medium">{application.agencyname || 'N/A'}</Text>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card className="md:col-span-2">
                  <Card.Header>
                    <Heading level="h3" className="text-base">Nội dung</Heading>
                  </Card.Header>
                  <Card.Content>
                    <div className="space-y-4">
                      {application.description && (
                        <div>
                          <Text className="text-gray-500 text-sm mb-1">Mô tả</Text>
                          <div className="p-4 bg-gray-50 rounded-md">
                            <Text className="whitespace-pre-line">{application.description}</Text>
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

              {/* Attachments section */}
              {application.attachments && application.attachments.length > 0 && (
                <Card>
                  <Card.Header className="flex justify-between items-center">
                    <Heading level="h3" className="text-base">Tài liệu đính kèm</Heading>
                    
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
                    {Object.keys(mediaLoadErrors).length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                        <Text className="text-yellow-700 text-sm">
                          Có {Object.keys(mediaLoadErrors).length} tệp không tải được. Vui lòng kiểm tra kết nối mạng và thử lại.
                        </Text>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Attachments summary */}
                      <div className="mb-4 flex flex-wrap gap-3">
                        <Badge className="bg-gray-100 text-gray-800">
                          Tổng số: {application.attachments.length} tệp
                        </Badge>

                        {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('image/')).length > 0 && (
                          <Badge className="bg-gray-100 text-gray-800">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('image/')).length} ảnh
                            </span>
                          </Badge>
                        )}

                        {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('video/')).length > 0 && (
                          <Badge className="bg-gray-100 text-gray-800">
                            <span className="flex items-center gap-1">
                              <VideoIcon className="w-3 h-3" />
                              {application.attachments.filter((att: MediaAttachment) => att.mimetype?.startsWith('video/')).length} video
                            </span>
                          </Badge>
                        )}

                        {application.attachments.filter((att: MediaAttachment) => !att.mimetype?.startsWith('image/') && !att.mimetype?.startsWith('video/')).length > 0 && (
                          <Badge className="bg-gray-100 text-gray-800">
                            <span className="flex items-center gap-1">
                              <FileTextIcon className="w-3 h-3" />
                              {application.attachments.filter((att: MediaAttachment) => !att.mimetype?.startsWith('image/') && !att.mimetype?.startsWith('video/')).length} tài liệu khác
                            </span>
                          </Badge>
                        )}
                      </div>

                      {/* Attachments grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Images */}
                        {application.attachments
                          .filter((attachment: MediaAttachment) => attachment.mimetype && attachment.mimetype.startsWith('image/'))
                          .map((attachment: MediaAttachment, index: number) => (
                            <div key={`image-${index}`} className="border border-gray-200 rounded-md p-2 hover:shadow-md transition-shadow">
                              <a
                                href={getMediaUrl(attachment)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <div className="flex flex-col justify-between h-full">
                                  <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden relative">
                                    <MediaImage
                                      attachment={attachment}
                                      alt={`Tệp đính kèm ${index + 1}`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col">
                                    <hr />
                                    <Text className="text-sm text-center truncate mt-2">
                                      {attachment.originalfilename || `Ảnh ${index + 1}`}
                                    </Text>
                                    <Text className="text-xs text-gray-500 text-center">
                                      {attachment.filesize ? `${Math.round(attachment.filesize / 1024)} KB` : ''}
                                      {attachment.uploaddate ? ` • ${new Date(attachment.uploaddate).toLocaleDateString()}` : ''}
                                    </Text>
                                  </div>
                                </div>
                              </a>
                            </div>
                          ))}

                        {/* Videos */}
                        {application.attachments
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
                                      console.error(`Lỗi tải video: ${attachment.mediafileid}`);
                                      handleMediaError(attachment.mediafileid);
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
                          ))}

                        {/* Other documents */}
                        {application.attachments
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
                                </div>
                              </a>
                            </div>
                          ))}
                          
                        {/* No attachments message */}
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

              {/* Processing history section */}
              <Card>
                <Card.Header>
                  <Heading level="h3" className="text-base">Lịch sử xử lý</Heading>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    {application.processing_history && application.processing_history.length > 0 ? (
                      application.processing_history.map((history: any, index: number) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-gray-100 text-gray-800">
                              {history.status}
                            </Badge>
                            <Text className="text-sm text-gray-500">
                              {formatDateTime(history.timestamp)}
                            </Text>
                          </div>
                          <Text className="text-sm font-medium">
                            {history.staffname || 'N/A'} - {history.agencyname || 'N/A'}
                          </Text>
                          {history.comments && (
                            <Text className="text-sm mt-1">{history.comments}</Text>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="w-6 h-6 text-gray-700"><FileTextIcon /></span>
                        </div>
                        <div>
                          <Text className="font-medium">Đơn đã được nộp</Text>
                          <Text className="text-gray-500 text-sm">{formatDateTime(application.submissiondate)}</Text>
                          <Text className="text-sm mt-1">Đơn đã được nộp thành công và đang chờ xử lý.</Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          ) : (
            <Text>Không tìm thấy thông tin đơn</Text>
          )}
        </Modal.Body>
      
        <Modal.Footer>
          <div className="flex w-full justify-between">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            {application && onUpdateStatus && applicationId && (
              <Button 
                variant="primary" 
                onClick={() => {
                  onClose();
                  onUpdateStatus(applicationId);
                }}
              >
                Cập nhật trạng thái
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>

      {/* Print Preview Modal */}
      {showPrintPreview && application && (
        <PrintPreview 
          application={application} 
          onClose={() => setShowPrintPreview(false)} 
        />
      )}
    </>
  );
} 