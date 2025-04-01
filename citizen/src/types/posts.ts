/**
 * Types related to posts and post categories
 */

/**
 * Interface for post data
 */
export interface Post {
  post_id: number;
  category_id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  date_created?: string;
  date_updated?: string;
  author?: string;
  status?: string;
  image_url?: string;
  views?: number;
  likes?: number;
  featured?: boolean;
}

/**
 * Interface for post creation data
 */
export interface CreatePostData {
  category_id: number;
  title: string;
  content: string;
  image_url?: string;
  featured?: boolean;
  status?: string;
}

/**
 * Interface for post category data
 */
export interface PostCategory {
  category_id: number;
  category_name: string;
  name?: string;
  description?: string;
  date_created?: string;
  date_updated?: string;
  parent_id?: number;
  order?: number;
  icon?: string;
  post_count?: number;
}

/**
 * Interface for post category creation data
 */
export interface CreatePostCategoryData {
  category_name?: string;
  name?: string;
  description?: string;
  parent_id?: number;
  order?: number;
  icon?: string;
} 