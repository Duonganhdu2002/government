/**
 * src/store/core/storeConfig.ts
 *
 * Core Redux store configuration with proper TypeScript typing and persistence setup.
 */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';

// Import reducers from specialized slice files
import { userReducer } from '../slices/userSlice';
import { contentReducer } from '../slices/contentSlice';
import { categoryReducer } from '../slices/categorySlice';

/**
 * Configure redux-persist with environment checking
 * Use dynamic import to avoid importing localStorage on server
 */
const persistConfig = {
  key: 'root',
  storage: (() => {
    // Check if window exists (client-side)
    if (typeof window !== 'undefined') {
      // Only import storage when on client
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
  whitelist: ['user', 'category'],
};

/**
 * Root reducer combining all slice reducers
 */
const rootReducer = combineReducers({
  user: userReducer,
  category: categoryReducer,
  content: contentReducer
});

/**
 * Persisted reducer with proper configuration
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configured Redux store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Ignore some serializable checks for redux-persist
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/**
 * Persistor for store
 */
export const persistor = persistStore(store);

/**
 * RootState type derived from store
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch type used for typed dispatching
 */
export type AppDispatch = typeof store.dispatch; 