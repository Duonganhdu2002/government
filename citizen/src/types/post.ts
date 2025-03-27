/**
 * src/types/post.ts
 * 
 * Định nghĩa kiểu dữ liệu cho bài viết, danh mục và các thành phần liên quan
 */

import { UserModels } from './auth';
import { ApiModels } from './common';

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến bài viết
 */
export namespace PostModels {
  /**
   * Trạng thái của bài viết
   */
  export enum Status {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
  }
  
  /**
   * Danh mục bài viết
   */
  export interface Category {
    readonly category_id: number;
    readonly categoryId?: number; // Tương thích với cả hai kiểu đặt tên
    readonly name: string;
    readonly description?: string;
    readonly created_at?: string;
    readonly createdAt?: string; // Tương thích với cả hai kiểu đặt tên
    readonly created_by?: number;
    readonly createdBy?: number; // Tương thích với cả hai kiểu đặt tên
    readonly icon?: string;
    readonly slug?: string;
    readonly post_count?: number;
    readonly postCount?: number; // Tương thích với cả hai kiểu đặt tên
  }
  
  /**
   * Bài viết
   */
  export interface Post {
    readonly post_id: number;
    readonly postId?: number; // Tương thích với cả hai kiểu đặt tên
    readonly title: string;
    readonly content: string;
    readonly summary?: string;
    readonly image_url?: string;
    readonly imageUrl?: string; // Tương thích với cả hai kiểu đặt tên
    readonly status: string;
    readonly category_id: number;
    readonly categoryId?: number; // Tương thích với cả hai kiểu đặt tên
    readonly category?: Category;
    readonly author_id?: number;
    readonly authorId?: number; // Tương thích với cả hai kiểu đặt tên
    readonly author?: UserModels.Base;
    readonly created_at: string;
    readonly createdAt?: string; // Tương thích với cả hai kiểu đặt tên
    readonly updated_at?: string;
    readonly updatedAt?: string; // Tương thích với cả hai kiểu đặt tên
    readonly published_at?: string;
    readonly publishedAt?: string; // Tương thích với cả hai kiểu đặt tên
    readonly views?: number;
    readonly likes?: number;
    readonly tags?: string[];
    readonly is_featured?: boolean;
    readonly isFeatured?: boolean; // Tương thích với cả hai kiểu đặt tên
    readonly comments_count?: number;
    readonly commentsCount?: number; // Tương thích với cả hai kiểu đặt tên
    readonly slug?: string;
  }
  
  /**
   * Dữ liệu để tạo danh mục bài viết mới
   */
  export interface CreateCategoryData {
    readonly name: string;
    readonly description?: string;
    readonly icon?: string;
  }
  
  /**
   * Dữ liệu để tạo bài viết mới
   */
  export interface CreatePostData {
    readonly title: string;
    readonly content: string;
    readonly summary?: string;
    readonly image_url?: string;
    readonly status?: string;
    readonly category_id: number;
    readonly tags?: string[];
    readonly is_featured?: boolean;
  }
  
  /**
   * Phản hồi khi lấy danh sách danh mục
   */
  export interface CategoryListResponse extends ApiModels.Response<Category[]> {
    readonly meta?: ApiModels.PaginationMeta;
  }
  
  /**
   * Phản hồi khi lấy danh sách bài viết
   */
  export interface PostListResponse extends ApiModels.Response<Post[]> {
    readonly meta?: ApiModels.PaginationMeta;
  }
  
  /**
   * Dữ liệu để cập nhật bài viết
   */
  export interface UpdatePostData {
    readonly title?: string;
    readonly content?: string;
    readonly summary?: string;
    readonly image_url?: string;
    readonly status?: string;
    readonly category_id?: number;
    readonly tags?: string[];
    readonly is_featured?: boolean;
  }
}

/**
 * Lớp tiện ích xử lý bài viết
 */
export class PostUtility {
  /**
   * Lấy URL slug từ tiêu đề bài viết
   */
  public static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữự]/g, '')
      .replace(/[àáảãạăắằẳẵặâấầẩẫậ]/g, 'a')
      .replace(/[èéẻẽẹêếềểễệ]/g, 'e')
      .replace(/[đ]/g, 'd')
      .replace(/[ìíỉĩị]/g, 'i')
      .replace(/[òóỏõọôốồổỗộơớờởỡợ]/g, 'o')
      .replace(/[ùúủũụưứừửữự]/g, 'u')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  /**
   * Kiểm tra xem bài viết có đang là bản nháp không
   */
  public static isDraft(status: string): boolean {
    return status.toLowerCase() === PostModels.Status.DRAFT.toLowerCase();
  }
  
  /**
   * Kiểm tra xem bài viết đã được xuất bản chưa
   */
  public static isPublished(status: string): boolean {
    return status.toLowerCase() === PostModels.Status.PUBLISHED.toLowerCase();
  }
  
  /**
   * Kiểm tra xem bài viết đã được lưu trữ chưa
   */
  public static isArchived(status: string): boolean {
    return status.toLowerCase() === PostModels.Status.ARCHIVED.toLowerCase();
  }
  
  /**
   * Tạo tóm tắt từ nội dung bài viết
   */
  public static generateSummary(content: string, maxLength: number = 150): string {
    // Loại bỏ các thẻ HTML
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Cắt theo độ dài tối đa
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // Đảm bảo không cắt giữa từ
    let summary = plainText.substring(0, maxLength);
    const lastSpaceIndex = summary.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      summary = summary.substring(0, lastSpaceIndex);
    }
    
    return `${summary}...`;
  }
}

// Exports tương thích với code cũ
export type PostCategory = PostModels.Category;
export type Post = PostModels.Post;
export type CreatePostCategoryData = PostModels.CreateCategoryData;
export type CreatePostData = PostModels.CreatePostData;
export type PostCategoryListResponse = PostModels.CategoryListResponse;
export type PostListResponse = PostModels.PostListResponse;
export type UpdatePostData = PostModels.UpdatePostData; 