/**
 * src/store/postCategoriesSlice.ts
 *
 * This module defines the Redux slice for managing post categories.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PostCategory,
  CreatePostCategoryData,
  getAllPostCategoriesAPI,
  getPostCategoryByIdAPI,
  createPostCategoryAPI,
  updatePostCategoryAPI,
  deletePostCategoryAPI,
} from '@/services/postCategoriesService';

interface PostCategoriesState {
  categories: PostCategory[];
  selectedCategory: PostCategory | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PostCategoriesState = {
  categories: [],
  selectedCategory: null,
  status: 'idle',
  error: null,
};

export const fetchPostCategories = createAsyncThunk<
  PostCategory[],
  void,
  { rejectValue: string }
>('postCategories/fetchPostCategories', async (_, { rejectWithValue }) => {
  try {
    const data = await getAllPostCategoriesAPI();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchPostCategoryById = createAsyncThunk<
  PostCategory,
  number,
  { rejectValue: string }
>('postCategories/fetchPostCategoryById', async (id, { rejectWithValue }) => {
  try {
    const data = await getPostCategoryByIdAPI(id);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createPostCategory = createAsyncThunk<
  PostCategory,
  CreatePostCategoryData,
  { rejectValue: string }
>('postCategories/createPostCategory', async (postCategoryData, { rejectWithValue }) => {
  try {
    const data = await createPostCategoryAPI(postCategoryData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updatePostCategory = createAsyncThunk<
  PostCategory,
  { id: number; postCategoryData: CreatePostCategoryData },
  { rejectValue: string }
>('postCategories/updatePostCategory', async ({ id, postCategoryData }, { rejectWithValue }) => {
  try {
    const data = await updatePostCategoryAPI(id, postCategoryData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deletePostCategory = createAsyncThunk<
  { message: string; id: number },
  number,
  { rejectValue: string }
>('postCategories/deletePostCategory', async (id, { rejectWithValue }) => {
  try {
    const response = await deletePostCategoryAPI(id);
    return { message: response.message, id };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const postCategoriesSlice = createSlice({
  name: 'postCategories',
  initialState,
  reducers: {
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    // fetch all post categories
    builder.addCase(fetchPostCategories.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchPostCategories.fulfilled,
      (state, action: PayloadAction<PostCategory[]>) => {
        state.status = 'succeeded';
        state.categories = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchPostCategories.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to fetch post categories';
    });

    // fetch post category by ID
    builder.addCase(fetchPostCategoryById.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchPostCategoryById.fulfilled,
      (state, action: PayloadAction<PostCategory>) => {
        state.status = 'succeeded';
        state.selectedCategory = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchPostCategoryById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to fetch post category';
    });

    // create post category
    builder.addCase(createPostCategory.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      createPostCategory.fulfilled,
      (state, action: PayloadAction<PostCategory>) => {
        state.status = 'succeeded';
        state.categories.push(action.payload);
        state.error = null;
      }
    );
    builder.addCase(createPostCategory.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to create post category';
    });

    // update post category
    builder.addCase(updatePostCategory.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      updatePostCategory.fulfilled,
      (state, action: PayloadAction<PostCategory>) => {
        state.status = 'succeeded';
        state.categories = state.categories.map((cat) =>
          cat.category_id === action.payload.category_id ? action.payload : cat
        );
        if (state.selectedCategory && state.selectedCategory.category_id === action.payload.category_id) {
          state.selectedCategory = action.payload;
        }
        state.error = null;
      }
    );
    builder.addCase(updatePostCategory.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to update post category';
    });

    // delete post category
    builder.addCase(deletePostCategory.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      deletePostCategory.fulfilled,
      (state, action: PayloadAction<{ message: string; id: number }>) => {
        state.status = 'succeeded';
        state.categories = state.categories.filter(
          (cat) => cat.category_id !== action.payload.id
        );
        if (state.selectedCategory && state.selectedCategory.category_id === action.payload.id) {
          state.selectedCategory = null;
        }
        state.error = null;
      }
    );
    builder.addCase(deletePostCategory.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to delete post category';
    });
  },
});

export const { clearSelectedCategory } = postCategoriesSlice.actions;
export default postCategoriesSlice.reducer;
