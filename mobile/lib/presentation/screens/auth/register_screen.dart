import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../blocs/auth/auth_bloc.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _idNumberController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _showPassword = false;
  int _areaCode = 1; // Default area code

  @override
  void dispose() {
    _fullNameController.dispose();
    _idNumberController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Đăng ký tài khoản'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => context.go(AppConstants.loginRoute),
        ),
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthenticatedState) {
            context.go(AppConstants.dashboardRoute);
          } else if (state is AuthErrorState) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          return SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      const Center(
                        child: Text(
                          'Đăng ký tài khoản công dân',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Center(
                        child: Text(
                          'Điền thông tin cá nhân để tạo tài khoản sử dụng dịch vụ công',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Information message
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.info, color: Colors.blue),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Chỉ công dân mới có thể đăng ký tài khoản. Tài khoản cán bộ được tạo bởi quản trị viên.',
                                style: TextStyle(fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Personal Information Section
                      const Text(
                        'THÔNG TIN CÁ NHÂN',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black54,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Full Name field
                      TextFormField(
                        controller: _fullNameController,
                        decoration: const InputDecoration(
                          labelText: 'Họ và tên *',
                          hintText: 'Nguyễn Văn A',
                          prefixIcon: Icon(Icons.person),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Vui lòng nhập họ và tên';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // ID Number field
                      TextFormField(
                        controller: _idNumberController,
                        decoration: const InputDecoration(
                          labelText: 'Số CMND/CCCD *',
                          hintText: '012345678901',
                          prefixIcon: Icon(Icons.badge),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Vui lòng nhập số CMND/CCCD';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Address field
                      TextFormField(
                        controller: _addressController,
                        decoration: const InputDecoration(
                          labelText: 'Địa chỉ',
                          hintText:
                              'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố',
                          prefixIcon: Icon(Icons.home),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),

                      // Contact Information Section
                      const Text(
                        'THÔNG TIN LIÊN HỆ',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black54,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Phone Number field
                      TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Số điện thoại',
                          hintText: '0912345678',
                          prefixIcon: Icon(Icons.phone),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 16),

                      // Email field
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          hintText: 'example@email.com',
                          prefixIcon: Icon(Icons.email),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            // Simple email validation
                            if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                                .hasMatch(value)) {
                              return 'Vui lòng nhập địa chỉ email hợp lệ';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Account Information Section
                      const Text(
                        'THÔNG TIN TÀI KHOẢN',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black54,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Username field
                      TextFormField(
                        controller: _usernameController,
                        decoration: const InputDecoration(
                          labelText: 'Tên đăng nhập *',
                          hintText: 'tên đăng nhập của bạn',
                          prefixIcon: Icon(Icons.account_circle),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Vui lòng nhập tên đăng nhập';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Password field
                      TextFormField(
                        controller: _passwordController,
                        decoration: InputDecoration(
                          labelText: 'Mật khẩu *',
                          hintText: '********',
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _showPassword = !_showPassword;
                              });
                            },
                          ),
                        ),
                        obscureText: !_showPassword,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Vui lòng nhập mật khẩu';
                          }
                          if (value.length < 8) {
                            return 'Mật khẩu phải có ít nhất 8 ký tự';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Confirm Password field
                      TextFormField(
                        controller: _confirmPasswordController,
                        decoration: const InputDecoration(
                          labelText: 'Xác nhận mật khẩu *',
                          hintText: '********',
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                        obscureText: !_showPassword,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Vui lòng xác nhận mật khẩu';
                          }
                          if (value != _passwordController.text) {
                            return 'Mật khẩu xác nhận không khớp';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Area Code dropdown
                      DropdownButtonFormField<int>(
                        value: _areaCode,
                        decoration: const InputDecoration(
                          labelText: 'Khu vực *',
                          prefixIcon: Icon(Icons.location_on),
                        ),
                        items: const [
                          DropdownMenuItem(value: 1, child: Text('Khu vực 1')),
                          DropdownMenuItem(value: 2, child: Text('Khu vực 2')),
                          DropdownMenuItem(value: 3, child: Text('Khu vực 3')),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _areaCode = value ?? 1;
                          });
                        },
                      ),
                      const SizedBox(height: 32),

                      // Register button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: state is AuthLoadingState
                              ? null
                              : () {
                                  if (_formKey.currentState!.validate()) {
                                    context.read<AuthBloc>().add(
                                          RegisterEvent(
                                            fullName: _fullNameController.text,
                                            identificationNumber:
                                                _idNumberController.text,
                                            address: _addressController.text,
                                            phoneNumber: _phoneController.text,
                                            email: _emailController.text,
                                            username: _usernameController.text,
                                            password: _passwordController.text,
                                            areaCode: _areaCode,
                                          ),
                                        );
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: state is AuthLoadingState
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Đăng ký'),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Login link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Đã có tài khoản?',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          TextButton(
                            onPressed: () {
                              context.go(AppConstants.loginRoute);
                            },
                            child: const Text('Đăng nhập'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
