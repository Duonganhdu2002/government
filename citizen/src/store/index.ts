/**
 * src/store/index.ts
 *
 * Central entry point for Redux store exports
 */

// Re-export store configuration
export { 
  store, 
  persistor,
  type RootState,
  type AppDispatch 
} from './core/storeConfig';

// Re-export typed hooks
export { 
  useAppDispatch, 
  useAppSelector 
} from './core/storeHooks';

// Re-export content-related actions and selectors
export {
  fetchPosts,
  fetchPostById,
  fetchPostsByCategoryId,
  createPost,
  updatePost,
  deletePost,
  clearSelectedPost
} from './slices/contentSlice';

// Re-export category-related actions and selectors
export {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  clearSelectedCategory
} from './slices/categorySlice';

// Re-export user authentication actions and selectors
export {
  setLoading,
  setError,
  setUser,
  login,
  logout,
  updateUserProfile
} from './slices/userSlice'; 