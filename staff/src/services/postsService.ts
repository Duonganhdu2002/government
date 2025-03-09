/**
 * src/services/postsService.ts
 *
 * This module defines functions to call the posts endpoints.
 * It uses the NEXT_PUBLIC_API_URL environment variable.
 */

import { getAuthHeaders } from '@/lib/api';

export interface Post {
  post_id: number;
  category_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  category_id: number;
  title: string;
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllPostsAPI = async (): Promise<Post[]> => {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch posts");
  }
  return await response.json();
};

export const getPostByIdAPI = async (
  id: number
): Promise<Post> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch post");
  }
  return await response.json();
};

export const getPostsByCategoryIdAPI = async (
  categoryId: number
): Promise<Post[]> => {
  const response = await fetch(`${API_URL}/api/posts/category/${categoryId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch posts by category");
  }
  return await response.json();
};

export const createPostAPI = async (
  data: CreatePostData
): Promise<Post> => {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create post");
  }
  return await response.json();
};

export const updatePostAPI = async (
  id: number,
  data: CreatePostData
): Promise<Post> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update post");
  }
  return await response.json();
};

export const deletePostAPI = async (
  id: number
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete post");
  }
  return await response.json();
};
