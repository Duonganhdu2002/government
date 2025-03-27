/**
 * src/store/store.ts
 * 
 * Cấu hình Redux store với redux-persist để lưu trữ trạng thái
 */

import { configureStore, combineReducers, Middleware, Store } from '@reduxjs/toolkit';
import authReducer from './authSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
  Persistor,
  Storage
} from 'redux-persist';

/**
 * Interface mở rộng cho storage adapter phù hợp với redux-persist
 */
interface StorageAdapter extends Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Class quản lý storage adapter cho redux-persist
 */
class StorageService {
  /**
   * Tạo storage adapter phù hợp với môi trường
   */
  public static create(): StorageAdapter {
    // Kiểm tra xem đang ở client hay server
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      console.log('Using browser localStorage for redux-persist');
      const storage = require('redux-persist/lib/storage').default;
      return storage;
    }
    
    console.log('Using memory storage fallback for redux-persist on server');
    return {
      getItem: (key: string) => Promise.resolve(null),
      setItem: (key: string, value: string) => Promise.resolve(),
      removeItem: (key: string) => Promise.resolve()
    };
  }
}

/**
 * Interface cho root state
 */
export interface RootState {
  auth: ReturnType<typeof authReducer>;
}

/**
 * Class quản lý store Redux
 */
class AppStore {
  private static instance: AppStore;
  private readonly reduxStore: Store;
  private readonly persistor: Persistor;
  
  /**
   * Constructor khởi tạo Redux store và persistor
   */
  private constructor() {
    // Cấu hình redux-persist
    const persistConfig: PersistConfig<RootState> = {
      key: 'root',
      storage: StorageService.create(),
      whitelist: ['auth'],
    };
    
    // Kết hợp các reducers
    const rootReducer = combineReducers({
      auth: authReducer,
    });
    
    // Tạo persisted reducer
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    
    // Cấu hình store
    this.reduxStore = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }),
    });
    
    // Khởi tạo persistor
    this.persistor = persistStore(this.reduxStore);
  }
  
  /**
   * Lấy instance của AppStore (Singleton pattern)
   */
  public static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }
  
  /**
   * Lấy Redux store
   */
  public getStore(): Store {
    return this.reduxStore;
  }
  
  /**
   * Lấy Redux persistor
   */
  public getPersistor(): Persistor {
    return this.persistor;
  }
}

// Khởi tạo và export store và persistor
const appStore = AppStore.getInstance();
export const store = appStore.getStore();
export const persistor = appStore.getPersistor();

// Export các type cần thiết
export type AppDispatch = typeof store.dispatch;
