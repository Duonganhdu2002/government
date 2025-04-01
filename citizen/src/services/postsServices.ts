/**
 * src/services/postsServices.ts
 *
 * Consolidated services for posts and post categories
 */

import { getAuthHeaders } from '@/utils/auth';
import { Post, CreatePostData, PostCategory, CreatePostCategoryData } from '@/types';

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ---------- Post API Methods ----------
/**
 * Fetch all posts
 */
export const getAllPostsAPI = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch posts');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Fetch post by ID
 */
export const getPostByIdAPI = async (id: number): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Fetch posts by category ID
 */
export const getPostsByCategoryIdAPI = async (categoryId: number): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts/category/${categoryId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch posts by category');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Create a new post
 */
export const createPostAPI = async (postData: CreatePostData): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Update an existing post
 */
export const updatePostAPI = async (id: number, postData: CreatePostData): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Delete a post
 */
export const deletePostAPI = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete post');
  }

  const data = await response.json();
  return data;
};

// ---------- Post Category API Methods ----------
/**
 * Fetch all post categories
 */
export const getAllPostCategoriesAPI = async (): Promise<PostCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/post-categories`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch post categories');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Fetch post category by ID
 */
export const getPostCategoryByIdAPI = async (id: number): Promise<PostCategory> => {
  const response = await fetch(`${API_BASE_URL}/post-categories/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch post category');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Create a new post category
 */
export const createPostCategoryAPI = async (categoryData: CreatePostCategoryData): Promise<PostCategory> => {
  const response = await fetch(`${API_BASE_URL}/post-categories`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create post category');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Update an existing post category
 */
export const updatePostCategoryAPI = async (id: number, categoryData: CreatePostCategoryData): Promise<PostCategory> => {
  const response = await fetch(`${API_BASE_URL}/post-categories/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update post category');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Delete a post category
 */
export const deletePostCategoryAPI = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/post-categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete post category');
  }

  const data = await response.json();
  return data;
}; 