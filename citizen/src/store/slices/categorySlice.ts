/**
 * src/store/slices/categorySlice.ts
 *
 * Redux slice for managing content categories
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostCategory, CreatePostCategoryData } from '@/types';
import {
  getAllPostCategoriesAPI,
  getPostCategoryByIdAPI,
  createPostCategoryAPI,
  updatePostCategoryAPI,
  deletePostCategoryAPI,
} from '@/services/postsServices';

// Category State Interface
export interface CategoryState {
  categories: PostCategory[];
  selectedCategory: PostCategory | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk<
  PostCategory[],
  void,
  { rejectValue: string }
>('category/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const data = await getAllPostCategoriesAPI();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchCategoryById = createAsyncThunk<
  PostCategory,
  number,
  { rejectValue: string }
>('category/fetchCategoryById', async (id, { rejectWithValue }) => {
  try {
    const data = await getPostCategoryByIdAPI(id);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createCategory = createAsyncThunk<
  PostCategory,
  CreatePostCategoryData,
  { rejectValue: string }
>('category/createCategory', async (categoryData, { rejectWithValue }) => {
  try {
    const data = await createPostCategoryAPI(categoryData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateCategory = createAsyncThunk<
  PostCategory,
  { id: number; categoryData: CreatePostCategoryData },
  { rejectValue: string }
>('category/updateCategory', async ({ id, categoryData }, { rejectWithValue }) => {
  try {
    const data = await updatePostCategoryAPI(id, categoryData);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteCategory = createAsyncThunk<
  { message: string; id: number },
  number,
  { rejectValue: string }
>('category/deleteCategory', async (id, { rejectWithValue }) => {
  try {
    const response = await deletePostCategoryAPI(id);
    return { message: response.message, id };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Category Slice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    // fetch all categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchCategories.fulfilled,
      (state, action: PayloadAction<PostCategory[]>) => {
        state.status = 'succeeded';
        state.categories = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to fetch categories';
    });

    // fetch category by ID
    builder.addCase(fetchCategoryById.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      fetchCategoryById.fulfilled,
      (state, action: PayloadAction<PostCategory>) => {
        state.status = 'succeeded';
        state.selectedCategory = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchCategoryById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to fetch category';
    });

    // create category
    builder.addCase(createCategory.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      createCategory.fulfilled,
      (state, action: PayloadAction<PostCategory>) => {
        state.status = 'succeeded';
        state.categories.push(action.payload);
        state.error = null;
      }
    );
    builder.addCase(createCategory.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to create category';
    });

    // update category
    builder.addCase(updateCategory.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      updateCategory.fulfilled,
      (state, action: PayloadAction<PostCategory>) => {
        state.status = 'succeeded';
        state.categories = state.categories.map((cat: PostCategory) =>
          cat.category_id === action.payload.category_id ? action.payload : cat
        );
        if (state.selectedCategory && state.selectedCategory.category_id === action.payload.category_id) {
          state.selectedCategory = action.payload;
        }
        state.error = null;
      }
    );
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to update category';
    });

    // delete category
    builder.addCase(deleteCategory.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      deleteCategory.fulfilled,
      (state, action: PayloadAction<{ message: string; id: number }>) => {
        state.status = 'succeeded';
        state.categories = state.categories.filter(
          (cat: PostCategory) => cat.category_id !== action.payload.id
        );
        if (state.selectedCategory && state.selectedCategory.category_id === action.payload.id) {
          state.selectedCategory = null;
        }
        state.error = null;
      }
    );
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || action.error.message || 'Failed to delete category';
    });
  },
});

// Export actions and reducer
export const { clearSelectedCategory } = categorySlice.actions;
export const categoryReducer = categorySlice.reducer; 