import React, { useRef, useState, useEffect } from 'react';
import { Text, Heading, Button, Container } from '@medusajs/ui';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { useAppSelector } from '@/store/hooks';
import Modal from './Modal';

// Interface for media attachments
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

// Interface for the application data
interface ApplicationData {
  applicationid: number;
  title: string;
  description?: string;
  status: string;
  submissiondate: string;
  duedate?: string;
  applicationtypename: string;
  specialapplicationtypename?: string;
  eventdate?: string;
  location?: string;
  citizenname?: string;
  citizenid?: string;
  citizenemail?: string;
  citizenphone?: string;
  citizenaddress?: string;
  attachments?: MediaAttachment[];
  [key: string]: any;
}

interface PrintPreviewProps {
  application: ApplicationData;
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ application, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  // Get user information from Redux store using the typed hook
  const { user } = useAppSelector((state) => state.auth);
  const [scale, setScale] = useState<number>(0.85);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const containerHeight = window.innerHeight * 0.8;
      const contentHeight = 1123; // Height of A4 in px (297mm)
      
      if (contentHeight > containerHeight) {
        const newScale = Math.min(containerHeight / contentHeight, 0.85);
        setScale(newScale);
      } else {
        setScale(0.85);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle print action
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${application.title || 'In đơn'}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.5;
            color: #333;
          }
          .container {
            max-width: 21cm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            text-align: center;
          }
          .header-top-left, .header-top-right {
            width: 40%;
          }
          .header-bottom {
            text-align: center;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 14px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .header-date {
            font-style: italic;
            text-align: right;
            margin: 20px 0;
          }
          .document-title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            text-transform: uppercase;
          }
          .app-id {
            font-size: 14px;
            margin-bottom: 20px;
            text-align: center;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .field {
            margin-bottom: 10px;
          }
          .field-label {
            font-weight: bold;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 45%;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 60px;
          }
          .signature-date {
            font-style: italic;
            margin-bottom: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-pending {
            background-color: #fff3cd;
            color: #856404;
          }
          .status-approved {
            background-color: #d4edda;
            color: #155724;
          }
          .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
          }
          .status-processing {
            background-color: #cce5ff;
            color: #004085;
          }
          .stamp {
            position: relative;
          }
          .stamp:after {
            content: "";
            display: block;
            width: 100px;
            height: 100px;
            border: 5px solid transparent;
            position: absolute;
            top: -30px;
            right: 0;
            opacity: 0.1;
            border-radius: 50%;
          }
          .indent {
            padding-left: 20px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <div class="header-top-left">
                <div class="title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div class="subtitle">Độc lập - Tự do - Hạnh phúc</div>
                <div>--------------</div>
              </div>
              <div class="header-top-right">
                <div class="title">Mẫu đơn số: ${application.applicationid}</div>
                <div>(Ban hành kèm theo Nghị định số 01/2022/ND-CP)</div>
              </div>
            </div>
          </div>
          
          <div class="header-date">
            ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/')}
          </div>
          
          <div class="document-title">
            ${application.title || 'ĐƠN ĐĂNG KÝ'}
          </div>

          <div class="section">
            <div class="section-title">Kính gửi: ${application.agencyname || 'Cơ quan chức năng'}</div>
            <div class="field">
              <p>Người nộp đơn: <strong>${application.citizenname || ''}</strong></p>
              <p>Số CCCD/CMND: <strong>${application.citizenid || ''}</strong></p>
              <p>Địa chỉ: <strong>${application.citizenaddress || ''}</strong></p>
              <p>Số điện thoại: <strong>${application.citizenphone || ''}</strong></p>
              <p>Email: <strong>${application.citizenemail || ''}</strong></p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">NỘI DUNG ĐƠN</div>
            <div class="field">
              <p>Loại đơn: <strong>${application.applicationtypename || ''}</strong></p>
              ${application.specialapplicationtypename ? `
              <p>Loại đơn đặc biệt: <strong>${application.specialapplicationtypename}</strong></p>
              ` : ''}
              <p>Ngày nộp: <strong>${formatDateTime(application.submissiondate)}</strong></p>
              ${application.duedate ? `
              <p>Hạn xử lý: <strong>${formatDate(application.duedate)}</strong></p>
              ` : ''}
              <p>Trạng thái: <strong>${getStatusText(application.status)}</strong></p>
              <p>Cơ quan xử lý: <strong>${application.agencyname || 'N/A'}</strong></p>
            </div>
          </div>

          ${application.description ? `
          <div class="section">
            <div class="section-title">MÔ TẢ CHI TIẾT</div>
            <div class="field indent">
              ${application.description}
            </div>
          </div>
          ` : ''}

          ${application.eventdate || application.location ? `
          <div class="section">
            <div class="section-title">THÔNG TIN SỰ KIỆN</div>
            ${application.eventdate ? `
            <div class="field">
              <span class="field-label">Ngày diễn ra:</span> ${formatDate(application.eventdate)}
            </div>
            ` : ''}
            ${application.location ? `
            <div class="field">
              <span class="field-label">Địa điểm:</span> ${application.location}
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${application.attachments && application.attachments.length > 0 ? `
          <div class="section">
            <div class="section-title">TÀI LIỆU ĐÍNH KÈM</div>
            <ul>
              ${application.attachments.map((attachment, index) => 
                `<li>${attachment.originalfilename || `Tài liệu ${index + 1}`} ${
                  attachment.filesize ? `(${Math.round(attachment.filesize / 1024)} KB)` : ''
                }</li>`
              ).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="section">
            <p>
              Đơn đăng ký này đã được nộp vào hệ thống và đang được xử lý. Nhân viên có thể thêm ý kiến xử lý và cập nhật trạng thái đơn dựa trên các quy định hiện hành.
            </p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-title">XÁC NHẬN CỦA CƠ QUAN</div>
              <div class="stamp"></div>
            </div>
            <div class="signature-box">
              <div class="signature-date">Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
              <div class="signature-title">NGƯỜI NỘP ĐƠN</div>
              <div><strong>${application.citizenname || ''}</strong></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Give time for styles to be applied before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    // For now, we'll just use the print functionality 
    // as most browsers allow saving as PDF from the print dialog
    handlePrint();
  };

  // Helper function to get status text in Vietnamese
  const getStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'in_review':
        return 'Đang xem xét';
      case 'submitted':
        return 'Đã nộp';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'pending_additional_info':
        return 'Cần bổ sung';
      case 'forwarded':
        return 'Đã chuyển tiếp';
      default:
        return status || 'Chờ xử lý';
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header className="p-4 flex justify-between items-center bg-white z-30">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-600" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
          </div>
          <Heading level="h3">Xem trước đơn</Heading>
        </div>
        <div>
          <Button variant="secondary" size="small" onClick={onClose} aria-label="Đóng">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
      </Modal.Header>
      
      {/* Controls for scaling */}
      <div className="bg-blue-50 p-3 border-y border-blue-100 flex items-center justify-between z-20">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <Text className="text-blue-700 text-sm">Sử dụng các nút dưới đây để in hoặc xuất file PDF.</Text>
        </div>
        <div className="flex items-center">
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
            className="mr-2"
            title="Thu nhỏ"
            aria-label="Thu nhỏ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Button>
          <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md" aria-live="polite" aria-atomic="true">{Math.round(scale * 100)}%</span>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => setScale(prev => Math.min(prev + 0.1, 1.5))}
            className="ml-2"
            title="Phóng to"
            aria-label="Phóng to"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Preview content */}
      <Modal.Body className="p-0 flex-grow flex flex-col justify-between items-center bg-gray-100 overflow-hidden">
        <div className="w-full h-full flex justify-center items-start overflow-auto pt-10 pb-10 px-6 scrollbar-hide">
          <div 
            ref={contentRef}
            className="bg-white shadow-xl border border-gray-200 mx-auto transition-shadow hover:shadow-2xl rounded-lg"
            style={{ 
              minHeight: '29.7cm', 
              width: '21cm',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              padding: '3rem',
              marginBottom: '3rem',
              marginTop: '2rem'
            }}
            tabIndex={0}
            aria-label="Bản xem trước đơn"
          >
            {/* Header */}
            <div className="flex justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="text-center w-2/5">
                <Heading level="h3" className="uppercase font-bold mb-1 text-base">Cộng hòa xã hội chủ nghĩa Việt Nam</Heading>
                <Text className="mb-2 text-sm">Độc lập - Tự do - Hạnh phúc</Text>
                <div className="text-center text-sm">--------------</div>
              </div>
              <div className="text-center w-2/5">
                <Text className="font-bold text-sm">Mẫu đơn số: {application.applicationid}</Text>
                <Text className="text-xs">(Ban hành kèm theo Nghị định số 01/2022/ND-CP)</Text>
              </div>
            </div>

            <div className="text-right italic mb-6 text-sm">
              Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <Heading level="h3" className="uppercase font-bold text-lg">
                {application.title || 'Đơn đăng ký'}
              </Heading>
            </div>

            {/* Kính gửi */}
            <div className="mb-6">
              <Heading level="h3" className="font-bold mb-3">Kính gửi: {application.agencyname || 'Cơ quan chức năng'}</Heading>
              <div className="space-y-2">
                <div>
                  <Text>Người nộp đơn: <span className="font-semibold">{application.citizenname || ''}</span></Text>
                </div>
                <div>
                  <Text>Số CCCD/CMND: <span className="font-semibold">{application.citizenid || ''}</span></Text>
                </div>
                <div>
                  <Text>Địa chỉ: <span className="font-semibold">{application.citizenaddress || ''}</span></Text>
                </div>
                <div>
                  <Text>Số điện thoại: <span className="font-semibold">{application.citizenphone || ''}</span></Text>
                </div>
                <div>
                  <Text>Email: <span className="font-semibold">{application.citizenemail || ''}</span></Text>
                </div>
              </div>
            </div>

            {/* Basic information */}
            <div className="mb-6">
              <Heading level="h3" className="uppercase font-bold mb-3">Nội dung đơn</Heading>
              <div className="space-y-2">
                <div>
                  <Text>Loại đơn: <span className="font-semibold">{application.applicationtypename}</span></Text>
                </div>
                {application.specialapplicationtypename && (
                  <div>
                    <Text>Loại đơn đặc biệt: <span className="font-semibold">{application.specialapplicationtypename}</span></Text>
                  </div>
                )}
                <div>
                  <Text>Ngày nộp: <span className="font-semibold">{formatDateTime(application.submissiondate)}</span></Text>
                </div>
                {application.duedate && (
                  <div>
                    <Text>Hạn xử lý: <span className="font-semibold">{formatDate(application.duedate)}</span></Text>
                  </div>
                )}
                <div>
                  <Text>Trạng thái: <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusClass(application.status)}`}>
                    {getStatusText(application.status)}
                  </span></Text>
                </div>
                <div>
                  <Text>Cơ quan xử lý: <span className="font-semibold">{application.agencyname || 'N/A'}</span></Text>
                </div>
              </div>
            </div>

            {/* Description */}
            {application.description && (
              <div className="mb-6">
                <Heading level="h3" className="uppercase font-bold mb-3">Mô tả chi tiết</Heading>
                <div className="p-3 bg-gray-50 rounded-md">
                  <Text>{application.description}</Text>
                </div>
              </div>
            )}

            {/* Event information */}
            {(application.eventdate || application.location) && (
              <div className="mb-6">
                <Heading level="h3" className="uppercase font-bold mb-3">Thông tin sự kiện</Heading>
                <div className="space-y-2">
                  {application.eventdate && (
                    <div>
                      <Text className="font-semibold inline-block mr-2">Ngày diễn ra:</Text>
                      <Text className="inline-block">{formatDate(application.eventdate)}</Text>
                    </div>
                  )}
                  {application.location && (
                    <div>
                      <Text className="font-semibold inline-block mr-2">Địa điểm:</Text>
                      <Text className="inline-block">{application.location}</Text>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            {application.attachments && application.attachments.length > 0 && (
              <div className="mb-6">
                <Heading level="h3" className="uppercase font-bold mb-3">Tài liệu đính kèm</Heading>
                <ul className="list-disc pl-5 space-y-1">
                  {application.attachments.map((attachment, index) => (
                    <li key={index}>
                      <Text>
                        {attachment.originalfilename || `Tài liệu ${index + 1}`}
                        {attachment.filesize && (
                          <span className="text-gray-500 ml-1">
                            ({Math.round(attachment.filesize / 1024)} KB)
                          </span>
                        )}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cam kết - Staff version */}
            <div className="mb-8">
              <Text className="text-sm">
                Đơn này đã được nộp vào hệ thống và đang được xử lý bởi nhân viên có thẩm quyền. Quá trình xử lý tuân thủ theo các quy định hiện hành của cơ quan.
              </Text>
            </div>

            {/* Signature section */}
            <div className="mt-16 grid grid-cols-2 gap-4">
              <div className="text-center">
                <Text className="font-semibold mb-24">XÁC NHẬN CỦA CƠ QUAN</Text>
              </div>
              <div className="text-center">
                <Text className="italic mb-4">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</Text>
                <Text className="font-semibold mb-24">NGƯỜI NỘP ĐƠN</Text>
                <Text className="font-semibold">{application.citizenname || ''}</Text>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      
      {/* Footer with action buttons */}
      <Modal.Footer className="p-4 flex justify-end gap-2 bg-white z-30 border-t mt-auto">
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Đóng
        </Button>
        <Button
          variant="secondary"
          onClick={handleExportPDF}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <polyline points="12 18 8 18 8 14"></polyline>
            <polyline points="16 14 12 18 16 22"></polyline>
          </svg>
          Xuất PDF
        </Button>
        <Button
          variant="primary"
          onClick={handlePrint}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          In đơn
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Helper function to get status class for styling
const getStatusClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'submitted':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'in_review':
    case 'forwarded':
      return 'bg-blue-100 text-blue-800';
    case 'pending_additional_info':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default PrintPreview; 