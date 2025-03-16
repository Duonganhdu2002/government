import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import postCategoriesReducer from './postCategoriesSlice';
import postsReduccer from './postsSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
// Không import storage trực tiếp
// import storage from 'redux-persist/lib/storage';

// Log môi trường hiện tại
console.log('Redux store initialization - isClient:', typeof window !== 'undefined' ? 'Client' : 'Server');

// Cấu hình redux-persist với kiểm tra môi trường
// Sử dụng dynamic import để tránh việc import localStorage trên server
const persistConfig = {
  key: 'root',
  storage: (() => {
    // Kiểm tra xem window có tồn tại không (client-side)
    if (typeof window !== 'undefined') {
      // Chỉ import storage khi ở phía client
      console.log('Using browser localStorage for redux-persist');
      const storage = require('redux-persist/lib/storage').default;
      return storage;
    }
    console.log('Using memory storage fallback for redux-persist on server');
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  })(),
  whitelist: ['auth', 'postCategories'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  postCategories: postCategoriesReducer,
  posts: postsReduccer
  // Các reducer khác...
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Bỏ qua một số cảnh báo serializable của redux-persist
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
