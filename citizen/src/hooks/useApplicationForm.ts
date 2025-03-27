import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  ApplicationType, 
  SpecialApplicationType, 
  UploadedFile,
  ApplicationFormData
} from '@/types/application';
import { 
  fetchApplicationTypes as fetchTypes, 
  fetchSpecialApplicationTypes as fetchSpecialTypes,
  createApplication,
  uploadMediaFiles,
  submitApplicationWithFiles
} from '@/services/applicationService';
import { 
  fetchProvinces,
  fetchDistrictsByProvince,
  fetchWardsByDistrict,
  Province,
  District,
  Ward
} from '@/services/locationService';
import { createUploadedFile, validateImageFile, validateVideoFile, revokeFilePreviews } from '@/utils/fileUtils';

/**
 * Sample application types for fallback
 */
const sampleTypes: ApplicationType[] = [
  {
    applicationtypeid: 1,
    typename: "Đăng ký khai sinh",
    description: "Đăng ký khai sinh cho trẻ em mới sinh tại Việt Nam hoặc trẻ em có quốc tịch Việt Nam sinh ra ở nước ngoài.",
    processingtimelimit: 5
  },
  {
    applicationtypeid: 2,
    typename: "Cấp mới căn cước công dân",
    description: "Cấp mới thẻ căn cước công dân cho công dân từ đủ 14 tuổi trở lên.",
    processingtimelimit: 7
  },
  {
    applicationtypeid: 3,
    typename: "Đăng ký kết hôn",
    description: "Đăng ký kết hôn giữa công dân Việt Nam với nhau hoặc với người nước ngoài.",
    processingtimelimit: 10
  },
  {
    applicationtypeid: 4,
    typename: "Xin giấy phép xây dựng",
    description: "Cấp giấy phép xây dựng mới, sửa chữa, cải tạo công trình dân dụng và công nghiệp.",
    processingtimelimit: 15
  }
];

/**
 * Hook xử lý form đơn
 */
export const useApplicationForm = (onSuccess?: (applicationId: number) => void, onClose?: () => void) => {
  const { user } = useAuth();
  
  // Refs cho các input file
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // States cho form và dữ liệu
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [specialApplicationTypes, setSpecialApplicationTypes] = useState<SpecialApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSpecialTypes, setLoadingSpecialTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // States cho upload files
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [uploadErrors, setUploadErrors] = useState<{images?: string, video?: string}>({});
  
  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedWardCode, setSelectedWardCode] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);
  
  // Form states
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [selectedSpecialTypeId, setSelectedSpecialTypeId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasAttachments, setHasAttachments] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [activeStep, setActiveStep] = useState('basic');

  // Hiển thị chi tiết loại hồ sơ được chọn
  const selectedType = applicationTypes.find(type => type.applicationtypeid === selectedTypeId);
  const selectedSpecialType = specialApplicationTypes.find(type => type.specialapplicationtypeid === selectedSpecialTypeId);
  const selectedProvince = provinces.find(province => province.code === selectedProvinceCode);
  const selectedDistrict = districts.find(district => district.code === selectedDistrictCode);
  const selectedWard = wards.find(ward => ward.code === selectedWardCode);

  // Cleanup preview URLs khi unmount
  useEffect(() => {
    return () => {
      // Revoke object URLs to avoid memory leaks
      revokeFilePreviews(images);
      if (video) URL.revokeObjectURL(video.preview);
    };
  }, []);

  // Fetch danh sách loại hồ sơ
  const handleFetchApplicationTypes = async () => {
    try {
      setLoadingTypes(true);
      setError('');
      const data = await fetchTypes();
      setApplicationTypes(data);
    } catch (err) {
      console.error('Error in handleFetchApplicationTypes:', err);
      setError('Không thể tải danh sách loại hồ sơ. Vui lòng thử lại sau.');
      setApplicationTypes(sampleTypes);
    } finally {
      setLoadingTypes(false);
    }
  };

  // Fetch danh sách loại hồ sơ đặc biệt khi chọn loại hồ sơ
  const handleFetchSpecialApplicationTypes = async (applicationTypeId: number) => {
    try {
      setLoadingSpecialTypes(true);
      const data = await fetchSpecialTypes(applicationTypeId);
      setSpecialApplicationTypes(data);
    } catch (err) {
      console.error('Error in handleFetchSpecialApplicationTypes:', err);
      setSpecialApplicationTypes([]);
    } finally {
      setLoadingSpecialTypes(false);
    }
  };

  // Cập nhật useEffect để fetch special types khi chọn loại đơn
  useEffect(() => {
    if (selectedTypeId !== '') {
      handleFetchSpecialApplicationTypes(Number(selectedTypeId));
      setSelectedSpecialTypeId(''); // Reset selected special type
    } else {
      setSpecialApplicationTypes([]);
      setSelectedSpecialTypeId('');
    }
  }, [selectedTypeId]);

  // Fetch provinces on initial load
  useEffect(() => {
    handleFetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      handleFetchDistricts(selectedProvinceCode);
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setWards([]);
    } else {
      setDistricts([]);
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setWards([]);
    }
  }, [selectedProvinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      handleFetchWards(selectedDistrictCode);
      setSelectedWardCode('');
    } else {
      setWards([]);
      setSelectedWardCode('');
    }
  }, [selectedDistrictCode]);

  // Update location string when selections change
  useEffect(() => {
    let locationString = '';
    
    if (selectedWard && selectedDistrict && selectedProvince) {
      locationString = `${selectedWard.name_with_type}, ${selectedDistrict.name_with_type}, ${selectedProvince.name_with_type}`;
    } else if (selectedDistrict && selectedProvince) {
      locationString = `${selectedDistrict.name_with_type}, ${selectedProvince.name_with_type}`;
    } else if (selectedProvince) {
      locationString = selectedProvince.name_with_type;
    }
    
    setLocation(locationString);
  }, [selectedProvinceCode, selectedDistrictCode, selectedWardCode, selectedProvince, selectedDistrict, selectedWard]);

  // Fetch provinces data
  const handleFetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      setError('');
      const data = await fetchProvinces();
      if (data && data.length > 0) {
        setProvinces(data);
      } else {
        console.warn('No provinces data returned from API');
        setError('Không thể tải danh sách tỉnh/thành phố. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
      setError('Đã xảy ra lỗi khi tải danh sách tỉnh/thành phố.');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch districts by province
  const handleFetchDistricts = async (provinceCode: string) => {
    try {
      setLoadingDistricts(true);
      setError('');
      const data = await fetchDistrictsByProvince(provinceCode);
      if (data && data.length > 0) {
        setDistricts(data);
      } else {
        console.warn(`No districts data returned for province code: ${provinceCode}`);
      }
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError('Đã xảy ra lỗi khi tải danh sách quận/huyện.');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch wards by district
  const handleFetchWards = async (districtCode: string) => {
    try {
      setLoadingWards(true);
      setError('');
      const data = await fetchWardsByDistrict(districtCode);
      if (data && data.length > 0) {
        setWards(data);
      } else {
        console.warn(`No wards data returned for district code: ${districtCode}`);
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
      setError('Đã xảy ra lỗi khi tải danh sách phường/xã.');
    } finally {
      setLoadingWards(false);
    }
  };

  // Xử lý upload ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    // Kiểm tra số lượng ảnh đã upload
    if (images.length + e.target.files.length > 5) {
      setUploadErrors(prev => ({ ...prev, images: 'Chỉ được upload tối đa 5 ảnh' }));
      return;
    }
    
    const newImages: UploadedFile[] = [];
    let hasError = false;
    
    Array.from(e.target.files).forEach(file => {
      const error = validateImageFile(file);
      
      if (error) {
        setUploadErrors(prev => ({ ...prev, images: error }));
        hasError = true;
        return;
      }
      
      newImages.push(createUploadedFile(file));
    });
    
    if (!hasError && newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      setUploadErrors(prev => ({ ...prev, images: undefined }));
    }
    
    // Reset input value để có thể upload cùng một file nhiều lần
    e.target.value = '';
  };
  
  // Xử lý upload video
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    const error = validateVideoFile(file);
    
    if (error) {
      setUploadErrors(prev => ({ ...prev, video: error }));
      return;
    }
    
    setVideo(createUploadedFile(file));
    setUploadErrors(prev => ({ ...prev, video: undefined }));
    
    // Reset input value
    e.target.value = '';
  };
  
  // Xóa ảnh đã upload
  const removeImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };
  
  // Xóa video đã upload
  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
  };
  
  // Thay đổi bước trong form
  const handleStepChange = (value: string) => {
    setActiveStep(value);
  };

  // Validate form thông tin cơ bản
  const validateBasicInfo = () => {
    if (selectedTypeId === '' || !title.trim()) {
      return false;
    }
    // Chỉ kiểm tra loại đơn đặc biệt nếu có dữ liệu và có ít nhất một loại
    if (specialApplicationTypes.length > 0 && selectedSpecialTypeId === '') {
      return false;
    }
    return true;
  };
  
  // Validate form thông tin chi tiết
  const validateDetailInfo = () => {
    if (!eventDate || !location.trim()) {
      return false;
    }
    return true;
  };

  // Xác định trạng thái hoàn thành cho từng bước
  const basicInfoStatus = validateBasicInfo() ? 'completed' : 'in-progress';
  const detailInfoStatus = validateDetailInfo() ? 'completed' : activeStep === 'details' ? 'in-progress' : 'not-started';
  const filesStatus = activeStep === 'files' ? 'in-progress' : 'not-started';

  // Reset form
  const resetForm = () => {
    setSelectedTypeId('');
    setSelectedSpecialTypeId('');
    setSpecialApplicationTypes([]);
    setTitle('');
    setDescription('');
    setHasAttachments(false);
    setFormError('');
    setError('');
    setSuccess(false);
    setImages([]);
    setVideo(null);
    setUploadErrors({});
    setEventDate('');
    setLocation('');
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setActiveStep('basic');
    handleFetchApplicationTypes();
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate toàn bộ form
    if (!validateBasicInfo() || !validateDetailInfo()) {
      setFormError('Vui lòng điền đầy đủ tất cả thông tin bắt buộc');
      return;
    }
    
    // Chuẩn bị dữ liệu form
    const applicationData: ApplicationFormData = {
      // citizenid sẽ được lấy từ token nên không cần gửi
      applicationtypeid: selectedTypeId,
      specialapplicationtypeid: selectedSpecialTypeId || null,
      title,
      description,
      submissiondate: new Date().toISOString(),
      status: 'Submitted',
      hasmedia: (images.length > 0 || video !== null),
      eventdate: eventDate,
      location,
      // Thêm trường duedate (mặc định 7 ngày sau ngày nộp)
      duedate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
    };

    try {
      setIsSubmitting(true);
      setFormError('');
      
      // Lấy các file gốc từ state images và video
      const imageFiles = images.map(img => img.file);
      const videoFile = video ? video.file : null;
      
      // Gọi API để tạo đơn và upload files cùng lúc
      const result = await submitApplicationWithFiles(
        applicationData,
        imageFiles,
        videoFile
      );
      
      // Lấy applicationId từ response
      const applicationId = result.application.applicationid;
      
      // Hiển thị thông báo thành công
      setSuccess(true);
      
      // Gọi callback onSuccess nếu có
      if (onSuccess && applicationId) {
        onSuccess(applicationId);
      }
      
      // Tự động đóng popup sau 2 giây nếu có callback onClose
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000); // 2 giây
      }
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Không thể nộp hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // States
    applicationTypes,
    specialApplicationTypes,
    selectedType,
    selectedSpecialType,
    loadingTypes,
    loadingSpecialTypes,
    isSubmitting,
    error,
    formError,
    success,
    images,
    video,
    uploadErrors,
    selectedTypeId,
    selectedSpecialTypeId,
    title,
    description,
    hasAttachments,
    eventDate,
    location,
    activeStep,
    basicInfoStatus,
    detailInfoStatus,
    filesStatus,
    
    // Location states
    provinces,
    districts,
    wards,
    selectedProvinceCode,
    selectedDistrictCode,
    selectedWardCode,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    
    // Refs
    imageInputRef,
    videoInputRef,
    
    // Actions
    setSelectedTypeId,
    setSelectedSpecialTypeId,
    setTitle,
    setDescription,
    setHasAttachments,
    setEventDate,
    setLocation,
    setSelectedProvinceCode,
    setSelectedDistrictCode,
    setSelectedWardCode,
    handleFetchProvinces,
    handleFetchDistricts,
    handleFetchWards,
    handleFetchApplicationTypes,
    handleImageUpload,
    handleVideoUpload,
    removeImage,
    removeVideo,
    handleStepChange,
    handleSubmit,
    resetForm,
    validateBasicInfo,
    validateDetailInfo
  };
}; 