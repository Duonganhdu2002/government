/**
 * src/services/postCategoriesService.ts
 *
 * Module định nghĩa các hàm gọi API cho các thao tác liên quan đến danh mục bài viết
 */
import { apiClient } from '@/utils/api';
import { POST_ENDPOINTS } from '@/resources/apiEndpoints';
import { 
  PostCategory, 
  CreatePostCategoryData 
} from '@/types';

/**
 * Lấy tất cả danh mục bài viết
 */
export const fetchPostCategories = async (): Promise<PostCategory[]> => {
  return await apiClient.get(POST_ENDPOINTS.CATEGORIES);
};

/**
 * Lấy danh mục bài viết theo ID
 */
export const fetchPostCategoryById = async (id: number): Promise<PostCategory> => {
  return await apiClient.get(`${POST_ENDPOINTS.CATEGORIES}/${id}`);
};

/**
 * Tạo danh mục bài viết mới
 */
export const createPostCategory = async (categoryData: CreatePostCategoryData): Promise<PostCategory> => {
  return await apiClient.post(POST_ENDPOINTS.CATEGORIES, categoryData);
};

/**
 * Cập nhật danh mục bài viết
 */
export const updatePostCategory = async (id: number, categoryData: CreatePostCategoryData): Promise<PostCategory> => {
  return await apiClient.put(`${POST_ENDPOINTS.CATEGORIES}/${id}`, categoryData);
};

/**
 * Xóa danh mục bài viết
 */
export const deletePostCategory = async (id: number): Promise<{ message: string }> => {
  return await apiClient.delete(`${POST_ENDPOINTS.CATEGORIES}/${id}`);
};
