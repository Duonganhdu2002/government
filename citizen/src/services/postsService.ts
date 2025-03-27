/**
 * src/services/postsService.ts
 *
 * Module định nghĩa các hàm gọi API cho các thao tác liên quan đến bài viết
 */
import { apiClient } from '@/utils/api';
import { POST_ENDPOINTS } from '@/resources/apiEndpoints';
import { Post, CreatePostData } from '@/types';

/**
 * Lấy tất cả bài viết
 */
export const fetchPosts = async (): Promise<Post[]> => {
  return await apiClient.get(POST_ENDPOINTS.LIST);
};

/**
 * Lấy bài viết theo ID
 */
export const fetchPostById = async (id: number): Promise<Post> => {
  return await apiClient.get(POST_ENDPOINTS.DETAIL(id));
};

/**
 * Lấy bài viết theo danh mục
 */
export const fetchPostsByCategory = async (categoryId: number): Promise<Post[]> => {
  return await apiClient.get(`${POST_ENDPOINTS.LIST}?category_id=${categoryId}`);
};

/**
 * Tạo bài viết mới
 */
export const createPost = async (postData: CreatePostData): Promise<Post> => {
  return await apiClient.post(POST_ENDPOINTS.LIST, postData);
};

/**
 * Cập nhật bài viết
 */
export const updatePost = async (id: number, postData: Partial<CreatePostData>): Promise<Post> => {
  return await apiClient.put(POST_ENDPOINTS.DETAIL(id), postData);
};

/**
 * Xóa bài viết
 */
export const deletePost = async (id: number): Promise<{ message: string }> => {
  return await apiClient.delete(POST_ENDPOINTS.DETAIL(id));
};
