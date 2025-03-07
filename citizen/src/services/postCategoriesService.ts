/**
 * src/services/postCategoriesService.ts
 *
 * This module defines functions to call the post categories endpoints.
 * It uses the NEXT_PUBLIC_API_URL environment variable.
 */

import { getAuthHeaders } from '@/utils/authHeaders';

export interface PostCategory {
  category_id: number;
  category_name: string;
  description?: string;
}

export interface CreatePostCategoryData {
  category_name: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllPostCategoriesAPI = async (): Promise<PostCategory[]> => {
  const response = await fetch(`${API_URL}/api/post-categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch post categories");
  }
  return await response.json();
};

export const getPostCategoryByIdAPI = async (
  id: number
): Promise<PostCategory> => {
  const response = await fetch(`${API_URL}/api/post-categories/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch post category");
  }
  return await response.json();
};

export const createPostCategoryAPI = async (
  data: CreatePostCategoryData
): Promise<PostCategory> => {
  const response = await fetch(`${API_URL}/api/post-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create post category");
  }
  return await response.json();
};

export const updatePostCategoryAPI = async (
  id: number,
  data: CreatePostCategoryData
): Promise<PostCategory> => {
  const response = await fetch(`${API_URL}/api/post-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update post category");
  }
  return await response.json();
};

export const deletePostCategoryAPI = async (
  id: number
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/post-categories/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete post category");
  }
  return await response.json();
};
