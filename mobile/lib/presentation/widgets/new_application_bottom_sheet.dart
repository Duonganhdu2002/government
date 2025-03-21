import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

import '../../domain/entities/application_type.dart';
import '../../domain/entities/special_application_type.dart';
import '../../data/services/location_service.dart';
import '../../presentation/blocs/application/application_bloc.dart';
import '../themes/app_colors.dart';
import '../themes/app_styles.dart';
import 'loading_indicator.dart';

class NewApplicationBottomSheet extends StatefulWidget {
  final ApplicationType applicationType;
  final SpecialApplicationType? specialApplicationType;

  const NewApplicationBottomSheet({
    super.key,
    required this.applicationType,
    this.specialApplicationType,
  });

  @override
  State<NewApplicationBottomSheet> createState() =>
      _NewApplicationBottomSheetState();
}

class _NewApplicationBottomSheetState extends State<NewApplicationBottomSheet> {
  // Step tracking
  int _currentStep = 0;
  final List<String> _steps = [
    'Thông tin cơ bản',
    'Thông tin chi tiết',
    'Tài liệu đính kèm'
  ];

  // Form controllers
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  // Form values
  String? _eventDate;
  bool _hasAttachments = false;
  String? _location;
  String? _provinceCode;
  String? _districtCode;
  String? _wardCode;
  final List<File> _imageFiles = [];
  File? _videoFile;
  bool _isSubmitting = false;
  String? _errorMessage;
  bool _success = false;

  // Image picker
  final ImagePicker _picker = ImagePicker();

  // Location data
  final _locationService = LocationService();
  List<Province> _provinces = [];
  List<District> _districts = [];
  List<Ward> _wards = [];
  bool _loadingProvinces = false;
  bool _loadingDistricts = false;
  bool _loadingWards = false;
  String? _locationError;

  @override
  void initState() {
    super.initState();
    // Initialize with application type data
    if (widget.specialApplicationType != null) {
      _titleController.text = "Hồ sơ ${widget.specialApplicationType!.name}";
    } else {
      _titleController.text = "Hồ sơ ${widget.applicationType.name}";
    }

    // Load provinces when widget initializes
    _loadProvinces();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  bool _validateBasicInfo() {
    return _titleController.text.isNotEmpty;
  }

  bool _validateDetailInfo() {
    return _eventDate != null && _location != null;
  }

  // Load provinces from API
  Future<void> _loadProvinces() async {
    setState(() {
      _loadingProvinces = true;
      _locationError = null;
    });

    try {
      final provinces = await _locationService.fetchProvinces();
      setState(() {
        _provinces = provinces;
        _loadingProvinces = false;
      });
    } catch (e) {
      setState(() {
        _locationError = 'Không thể tải danh sách tỉnh/thành phố';
        _loadingProvinces = false;
      });
    }
  }

  // Load districts from API
  Future<void> _loadDistricts(String provinceCode) async {
    setState(() {
      _loadingDistricts = true;
      _districts = [];
      _wards = [];
      _districtCode = null;
      _wardCode = null;
      _locationError = null;
    });

    try {
      final districts =
          await _locationService.fetchDistrictsByProvince(provinceCode);
      setState(() {
        _districts = districts;
        _loadingDistricts = false;
      });
    } catch (e) {
      setState(() {
        _locationError = 'Không thể tải danh sách quận/huyện';
        _loadingDistricts = false;
      });
    }
  }

  // Load wards from API
  Future<void> _loadWards(String districtCode) async {
    setState(() {
      _loadingWards = true;
      _wards = [];
      _wardCode = null;
      _locationError = null;
    });

    try {
      final wards = await _locationService.fetchWardsByDistrict(districtCode);
      setState(() {
        _wards = wards;
        _loadingWards = false;
      });
    } catch (e) {
      setState(() {
        _locationError = 'Không thể tải danh sách phường/xã';
        _loadingWards = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Handle and header
              _buildHeader(),

              // Steps indicator
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: _buildStepIndicator(),
              ),

              // Scrollable form content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: _formKey,
                    child: _buildCurrentStepContent(),
                  ),
                ),
              ),

              // Bottom navigation buttons
              _buildBottomNavigation(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 1,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
            margin: const EdgeInsets.only(bottom: 8),
          ),

          // Title and close button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Nộp hồ sơ mới',
                style: AppStyles.heading2,
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      children: List.generate(_steps.length, (index) {
        final isActive = index == _currentStep;
        final isCompleted = index < _currentStep;

        return Expanded(
          child: Row(
            children: [
              // Step circle
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCompleted
                      ? AppColors.success
                      : isActive
                          ? AppColors.primary
                          : Colors.grey.shade300,
                ),
                child: Center(
                  child: isCompleted
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: isActive ? Colors.white : Colors.grey,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                ),
              ),

              // Connector line
              if (index < _steps.length - 1)
                Expanded(
                  child: Container(
                    height: 2,
                    color:
                        isCompleted ? AppColors.success : Colors.grey.shade300,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildCurrentStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildBasicInfoStep();
      case 1:
        return _buildDetailsStep();
      case 2:
        return _buildFilesStep();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildBasicInfoStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Application type info
        _buildSelectedApplicationTypeInfo(),

        const SizedBox(height: 24),

        // Title
        TextFormField(
          controller: _titleController,
          decoration: const InputDecoration(
            labelText: 'Tiêu đề hồ sơ *',
            hintText: 'Nhập tiêu đề hồ sơ',
            border: OutlineInputBorder(),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Vui lòng nhập tiêu đề';
            }
            return null;
          },
        ),

        const SizedBox(height: 16),

        // Description
        TextFormField(
          controller: _descriptionController,
          decoration: const InputDecoration(
            labelText: 'Mô tả chi tiết',
            hintText: 'Mô tả chi tiết về hồ sơ',
            border: OutlineInputBorder(),
            alignLabelWithHint: true,
          ),
          maxLines: 5,
        ),
      ],
    );
  }

  Widget _buildSelectedApplicationTypeInfo() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Loại hồ sơ đã chọn',
              style: AppStyles.subtitle1,
            ),
            const SizedBox(height: 8),
            Text(
              widget.applicationType.name,
              style: AppStyles.heading3,
            ),
            if (widget.applicationType.description.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                widget.applicationType.description,
                style: AppStyles.body2,
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.timer_outlined,
                    size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  'Thời gian xử lý: ${widget.applicationType.processingTimeLimit} ngày',
                  style: AppStyles.caption
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),

            // Special application type if selected
            if (widget.specialApplicationType != null) ...[
              const Divider(height: 24),
              Text(
                'Loại hồ sơ đặc biệt',
                style: AppStyles.subtitle1,
              ),
              const SizedBox(height: 8),
              Text(
                widget.specialApplicationType!.name,
                style: AppStyles.heading3,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.timer_outlined,
                      size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    'Thời gian xử lý: ${widget.specialApplicationType!.processingTimeLimit} ngày',
                    style: AppStyles.caption
                        .copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Event date picker
        Text(
          'Ngày diễn ra *',
          style: AppStyles.subtitle1,
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: _pickDate,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade400),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 18),
                const SizedBox(width: 8),
                Text(
                  _eventDate != null ? _eventDate! : 'Chọn ngày diễn ra',
                  style: _eventDate != null
                      ? AppStyles.body1
                      : AppStyles.body1.copyWith(color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
        if (_currentStep == 1 && _eventDate == null)
          const Padding(
            padding: EdgeInsets.only(top: 8, left: 8),
            child: Text(
              'Ngày diễn ra là thông tin bắt buộc',
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),

        const SizedBox(height: 24),

        // Location picker
        Text(
          'Địa điểm *',
          style: AppStyles.subtitle1,
        ),
        const SizedBox(height: 8),
        _buildLocationPicker(),
        if (_currentStep == 1 && _location == null)
          const Padding(
            padding: EdgeInsets.only(top: 8, left: 8),
            child: Text(
              'Địa điểm là thông tin bắt buộc',
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),

        if (_locationError != null)
          Padding(
            padding: const EdgeInsets.only(top: 8, left: 8),
            child: Text(
              _locationError!,
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
      ],
    );
  }

  Widget _buildLocationPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Province
        DropdownButtonFormField<String>(
          decoration: const InputDecoration(
            labelText: 'Tỉnh/Thành phố *',
            border: OutlineInputBorder(),
          ),
          value: _provinceCode,
          hint: const Text('Chọn tỉnh/thành phố'),
          items: _provinces.map((province) {
            return DropdownMenuItem<String>(
              value: province.code,
              child: Text(province.nameWithType),
            );
          }).toList(),
          onChanged: _loadingProvinces
              ? null
              : (value) {
                  if (value != null) {
                    setState(() {
                      _provinceCode = value;
                      _districtCode = null;
                      _wardCode = null;
                      _updateLocation();
                    });
                    _loadDistricts(value);
                  }
                },
          isExpanded: true,
        ),
        if (_loadingProvinces)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8.0),
            child: Center(child: CircularProgressIndicator()),
          ),

        const SizedBox(height: 16),

        // District
        DropdownButtonFormField<String>(
          decoration: const InputDecoration(
            labelText: 'Quận/Huyện *',
            border: OutlineInputBorder(),
          ),
          value: _districtCode,
          hint: const Text('Chọn quận/huyện'),
          items: _districts.map((district) {
            return DropdownMenuItem<String>(
              value: district.code,
              child: Text(district.nameWithType),
            );
          }).toList(),
          onChanged: _loadingDistricts || _provinceCode == null
              ? null
              : (value) {
                  if (value != null) {
                    setState(() {
                      _districtCode = value;
                      _wardCode = null;
                      _updateLocation();
                    });
                    _loadWards(value);
                  }
                },
          isExpanded: true,
        ),
        if (_loadingDistricts)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8.0),
            child: Center(child: CircularProgressIndicator()),
          ),

        const SizedBox(height: 16),

        // Ward
        DropdownButtonFormField<String>(
          decoration: const InputDecoration(
            labelText: 'Phường/Xã *',
            border: OutlineInputBorder(),
          ),
          value: _wardCode,
          hint: const Text('Chọn phường/xã'),
          items: _wards.map((ward) {
            return DropdownMenuItem<String>(
              value: ward.code,
              child: Text(ward.nameWithType),
            );
          }).toList(),
          onChanged: _loadingWards || _districtCode == null
              ? null
              : (value) {
                  if (value != null) {
                    setState(() {
                      _wardCode = value;
                      _updateLocation();
                    });
                  }
                },
          isExpanded: true,
        ),
        if (_loadingWards)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8.0),
            child: Center(child: CircularProgressIndicator()),
          ),
      ],
    );
  }

  void _updateLocation() {
    final province = _provinces.firstWhere(
      (p) => p.code == _provinceCode,
      orElse: () => Province(
        code: '',
        name: '',
        nameWithType: '',
        slug: '',
        type: '',
      ),
    );

    final district = _districts.firstWhere(
      (d) => d.code == _districtCode,
      orElse: () => District(
        code: '',
        name: '',
        nameWithType: '',
        parentCode: '',
        slug: '',
        type: '',
      ),
    );

    final ward = _wards.firstWhere(
      (w) => w.code == _wardCode,
      orElse: () => Ward(
        code: '',
        name: '',
        nameWithType: '',
        parentCode: '',
        slug: '',
        type: '',
      ),
    );

    if (_wardCode != null && _districtCode != null && _provinceCode != null) {
      _location =
          '${ward.nameWithType}, ${district.nameWithType}, ${province.nameWithType}';
    } else if (_districtCode != null && _provinceCode != null) {
      _location = '${district.nameWithType}, ${province.nameWithType}';
    } else if (_provinceCode != null) {
      _location = province.nameWithType;
    } else {
      _location = null;
    }
  }

  Widget _buildFilesStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Images section
        _buildImagesSection(),

        const SizedBox(height: 24),

        // Video section
        _buildVideoSection(),

        const SizedBox(height: 24),

        // Has attachments checkbox
        Row(
          children: [
            Checkbox(
              value: _hasAttachments,
              onChanged: (value) {
                setState(() {
                  _hasAttachments = value ?? false;
                });
              },
            ),
            Expanded(
              child: Text(
                'Tôi sẽ cung cấp thêm giấy tờ, hồ sơ kèm theo khi được yêu cầu',
                style: AppStyles.body2,
              ),
            ),
          ],
        ),

        if (_isSubmitting)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(child: LoadingIndicator()),
          ),

        if (_errorMessage != null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Text(
                _errorMessage!,
                style: TextStyle(color: Colors.red.shade800),
              ),
            ),
          ),

        if (_success)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green.shade800),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Hồ sơ đã được nộp thành công! Chúng tôi sẽ xử lý hồ sơ của bạn trong thời gian sớm nhất.',
                      style: TextStyle(color: Colors.green.shade800),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildImagesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Ảnh',
              style: AppStyles.subtitle1,
            ),
            if (_imageFiles.isNotEmpty)
              Text(
                '${_imageFiles.length}/5 ảnh',
                style: AppStyles.caption,
              ),
          ],
        ),
        const SizedBox(height: 8),
        GridView.count(
          shrinkWrap: true,
          crossAxisCount: 3,
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            // Image previews
            ..._imageFiles.asMap().entries.map((entry) {
              final index = entry.key;
              final imageFile = entry.value;

              return Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: FileImage(imageFile),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _imageFiles.removeAt(index);
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close,
                            size: 16, color: Colors.red),
                      ),
                    ),
                  ),
                ],
              );
            }),

            // Add image button (if less than 5 images)
            if (_imageFiles.length < 5)
              InkWell(
                onTap: _pickImage,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: const Center(
                    child: Icon(Icons.add_photo_alternate_outlined,
                        size: 32, color: Colors.grey),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildVideoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Video',
          style: AppStyles.subtitle1,
        ),
        const SizedBox(height: 8),
        _videoFile != null
            ? Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    image: FileImage(_videoFile!),
                    fit: BoxFit.cover,
                    opacity: 0.7,
                  ),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Icon(
                        Icons.play_circle_fill,
                        size: 48,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _videoFile = null;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.8),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close,
                              size: 20, color: Colors.red),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : InkWell(
                onTap: _pickVideo,
                child: Container(
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.videocam_outlined,
                          size: 32, color: Colors.grey.shade500),
                      const SizedBox(height: 8),
                      Text(
                        'Thêm video',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ),
      ],
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Back button (except for first step)
          _currentStep > 0
              ? TextButton(
                  onPressed: _isSubmitting ? null : _previousStep,
                  child: const Text('Quay lại'),
                )
              : const SizedBox(width: 80),

          // Step indicator text
          Text(
            'Bước ${_currentStep + 1}/${_steps.length}',
            style: AppStyles.caption,
          ),

          // Next/Submit button
          ElevatedButton(
            onPressed: _isSubmitting
                ? null
                : () {
                    if (_currentStep < _steps.length - 1) {
                      _nextStep();
                    } else {
                      _submitForm();
                    }
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: Text(
              _currentStep < _steps.length - 1 ? 'Tiếp theo' : 'Nộp hồ sơ',
            ),
          ),
        ],
      ),
    );
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  void _nextStep() {
    if (_currentStep == 0 && !_validateBasicInfo()) {
      // Show validation error
      _formKey.currentState?.validate();
      return;
    }

    if (_currentStep == 1 && !_validateDetailInfo()) {
      // Force a rebuild to show validation errors
      setState(() {});
      return;
    }

    if (_currentStep < _steps.length - 1) {
      setState(() {
        _currentStep++;
      });
    }
  }

  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        // Format the date as dd/MM/yyyy
        final day = picked.day.toString().padLeft(2, '0');
        final month = picked.month.toString().padLeft(2, '0');
        final year = picked.year.toString();
        _eventDate = '$day/$month/$year';
      });
    }
  }

  Future<void> _pickImage() async {
    try {
      // Show source selection dialog
      final ImageSource? source = await showDialog<ImageSource>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('Chọn nguồn ảnh'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.photo_library),
                  title: const Text('Thư viện'),
                  onTap: () => Navigator.pop(context, ImageSource.gallery),
                ),
                ListTile(
                  leading: const Icon(Icons.camera_alt),
                  title: const Text('Camera'),
                  onTap: () => Navigator.pop(context, ImageSource.camera),
                ),
              ],
            ),
          ),
        ),
      );

      if (source == null) return;

      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 80,
      );

      if (image != null) {
        setState(() {
          if (_imageFiles.length < 5) {
            _imageFiles.add(File(image.path));
          }
        });
      }
    } catch (e) {
      if (mounted) {
        // Handle permission denied error specifically
        if (e.toString().contains('permission') && mounted) {
          _showPermissionErrorMessage();
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi chọn ảnh: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _pickVideo() async {
    try {
      // Show source selection dialog
      final ImageSource? source = await showDialog<ImageSource>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('Chọn nguồn video'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.video_library),
                  title: const Text('Thư viện'),
                  onTap: () => Navigator.pop(context, ImageSource.gallery),
                ),
                ListTile(
                  leading: const Icon(Icons.videocam),
                  title: const Text('Camera'),
                  onTap: () => Navigator.pop(context, ImageSource.camera),
                ),
              ],
            ),
          ),
        ),
      );

      if (source == null) return;

      final XFile? video = await _picker.pickVideo(
        source: source,
        maxDuration: const Duration(minutes: 1),
      );

      if (video != null) {
        setState(() {
          _videoFile = File(video.path);
        });
      }
    } catch (e) {
      if (mounted) {
        // Handle permission denied error specifically
        if (e.toString().contains('permission') && mounted) {
          _showPermissionErrorMessage();
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi chọn video: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // Show dialog when permission is denied
  void _showPermissionErrorMessage() {
    showDialog(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Quyền truy cập bị từ chối'),
        content: const Text(
            'Vui lòng cấp quyền truy cập vào camera hoặc thư viện ảnh trong cài đặt để tiếp tục.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Show submitting indicator
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      // Prepare form data with no null values
      final Map<String, dynamic> formData = {
        'applicationTypeId': widget.applicationType.id,
      };

      // Only include specialApplicationTypeId if it exists
      if (widget.specialApplicationType != null) {
        formData['specialApplicationTypeId'] =
            widget.specialApplicationType!.id;
      }

      // Add optional fields only if they're not null
      if (_eventDate != null && _eventDate!.isNotEmpty) {
        formData['eventDate'] = _eventDate;
      }

      if (_location != null && _location!.isNotEmpty) {
        formData['location'] = _location;
      }

      formData['hasAttachments'] = _hasAttachments;

      if (_provinceCode != null) {
        final province = _provinces.firstWhere((p) => p.code == _provinceCode);
        formData['province'] = province.nameWithType;
      }

      if (_districtCode != null) {
        final district = _districts.firstWhere((d) => d.code == _districtCode);
        formData['district'] = district.nameWithType;
      }

      if (_wardCode != null) {
        final ward = _wards.firstWhere((w) => w.code == _wardCode);
        formData['ward'] = ward.nameWithType;
      }

      // Convert image files and video files to paths for attachment list
      final List<String> attachments =
          _imageFiles.map((file) => file.path).toList();
      if (_videoFile != null) {
        attachments.add(_videoFile!.path);
      }

      // Make sure we have a description (never null)
      final String description = _descriptionController.text.isNotEmpty
          ? _descriptionController.text
          : "Hồ sơ ${widget.applicationType.name}";

      print('Submitting application with data:');
      print('Title: ${_titleController.text}');
      print('Description: $description');
      print('FormData: $formData');
      print('Attachments: $attachments');

      // Dispatch event to application bloc with all files
      context.read<ApplicationBloc>().add(
            CreateApplicationEvent(
              title: _titleController.text,
              description: description,
              formData: formData,
              attachments: attachments,
            ),
          );

      // Listen for result from bloc
      final completer = Completer<bool>();
      final subscription =
          context.read<ApplicationBloc>().stream.listen((state) {
        print('Application state: $state');
        if (state is ApplicationCreatedState) {
          print('Application created successfully: ${state.application.id}');
          completer.complete(true);
        } else if (state is ApplicationErrorState) {
          print('Application creation error: ${state.message}');
          completer.complete(false);
          if (mounted) {
            setState(() {
              _errorMessage = state.message;
              _isSubmitting = false;
            });
          }
        }
      });

      // Wait for a result with timeout
      try {
        final success = await completer.future.timeout(
            const Duration(seconds: 30), // Increased timeout for file upload
            onTimeout: () {
          print('Timeout while waiting for application submission response');
          if (mounted) {
            setState(() {
              _errorMessage =
                  'Không nhận được phản hồi từ máy chủ. Vui lòng thử lại sau.';
              _isSubmitting = false;
            });
          }
          return false;
        });

        // Cancel subscription
        subscription.cancel();

        if (!mounted) return;

        if (success) {
          setState(() {
            _isSubmitting = false;
            _success = true;
          });

          // Close bottom sheet after success
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) {
              Navigator.of(context).pop();

              // Show success notification
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Hồ sơ đã được nộp thành công!'),
                  duration: Duration(seconds: 3),
                  backgroundColor: Colors.green,
                ),
              );
            }
          });
        }
      } finally {
        subscription.cancel();
      }
    } catch (e) {
      print('Exception during submission: $e');
      // Check if the widget is still mounted before updating state
      if (!mounted) return;

      // Show error
      setState(() {
        _isSubmitting = false;
        _errorMessage = 'Có lỗi xảy ra khi nộp hồ sơ: $e';
      });
    }
  }
}
