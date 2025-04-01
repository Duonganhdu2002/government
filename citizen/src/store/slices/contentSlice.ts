/**
 * src/store/slices/contentSlice.ts
 *
 * Redux slice for managing content posts
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, CreatePostData } from '@/types';
import {
  getAllPostsAPI,
  getPostByIdAPI,
  getPostsByCategoryIdAPI,
  createPostAPI,
  updatePostAPI,
  deletePostAPI,
} from '@/services/postsServices';

// Posts State Interface
export interface PostsState {
  posts: Post[];
  selectedPost: Post | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: PostsState = {
  posts: [],
  selectedPost: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>('content/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    const data = await getAllPostsAPI();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchPostById = createAsyncThunk<
  Post,
  number,
  { rejectValue: string }
>('content/fetchPostById', async (id, { rejectWithValue }) => {
  try {
    const data = await getPostByIdAPI(id);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchPostsByCategoryId = createAsyncThunk<
  Post[],
  number,
  { rejectValue: string }
>('content/fetchPostsByCategoryId', async (categoryId, { rejectWithValue }) => {
  try {
    const data = await getPostsByCategoryIdAPI(categoryId);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createPost = createAsyncThunk<
  Post,
  CreatePostData,
  { rejectValue: string }
>('content/createPost', async (postData, { rejectWithValue }) => {
  try {
    const data = await createPostAPI(postData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updatePost = createAsyncThunk<
  Post,
  { id: number; postData: CreatePostData },
  { rejectValue: string }
>('content/updatePost', async ({ id, postData }, { rejectWithValue }) => {
  try {
    const data = await updatePostAPI(id, postData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deletePost = createAsyncThunk<
  { message: string; id: number },
  number,
  { rejectValue: string }
>('content/deletePost', async (id, { rejectWithValue }) => {
  try {
    const response = await deletePostAPI(id);
    return { message: response.message, id };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Content Slice
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearSelectedPost(state) {
      state.selectedPost = null;
    },
  },
  extraReducers: (builder) => {
    // fetch all posts
    builder.addCase(fetchPosts.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchPosts.fulfilled,
      (state, action: PayloadAction<Post[]>) => {
        state.status = 'succeeded';
        state.posts = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to fetch posts';
    });

    // fetch post by ID
    builder.addCase(fetchPostById.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchPostById.fulfilled,
      (state, action: PayloadAction<Post>) => {
        state.status = 'succeeded';
        state.selectedPost = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchPostById.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to fetch post';
    });

    // fetch posts by category id
    builder.addCase(fetchPostsByCategoryId.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchPostsByCategoryId.fulfilled,
      (state, action: PayloadAction<Post[]>) => {
        state.status = 'succeeded';
        state.posts = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchPostsByCategoryId.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload ||
        action.error.message ||
        'Failed to fetch posts by category';
    });

    // create post
    builder.addCase(createPost.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      createPost.fulfilled,
      (state, action: PayloadAction<Post>) => {
        state.status = 'succeeded';
        state.posts.push(action.payload);
        state.error = null;
      }
    );
    builder.addCase(createPost.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to create post';
    });

    // update post
    builder.addCase(updatePost.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      updatePost.fulfilled,
      (state, action: PayloadAction<Post>) => {
        state.status = 'succeeded';
        state.posts = state.posts.map((post: Post) =>
          post.post_id === action.payload.post_id ? action.payload : post
        );
        if (state.selectedPost && state.selectedPost.post_id === action.payload.post_id) {
          state.selectedPost = action.payload;
        }
        state.error = null;
      }
    );
    builder.addCase(updatePost.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to update post';
    });

    // delete post
    builder.addCase(deletePost.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      deletePost.fulfilled,
      (state, action: PayloadAction<{ message: string; id: number }>) => {
        state.status = 'succeeded';
        state.posts = state.posts.filter(
          (post: Post) => post.post_id !== action.payload.id
        );
        if (state.selectedPost && state.selectedPost.post_id === action.payload.id) {
          state.selectedPost = null;
        }
        state.error = null;
      }
    );
    builder.addCase(deletePost.rejected, (state, action) => {
      state.status = 'failed';
      state.error =
        action.payload || action.error.message || 'Failed to delete post';
    });
  },
});

// Export actions and reducer
export const { clearSelectedPost } = contentSlice.actions;
export const contentReducer = contentSlice.reducer; 