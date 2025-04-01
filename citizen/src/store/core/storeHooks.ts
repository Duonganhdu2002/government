/**
 * src/store/core/storeHooks.ts
 *
 * Provides typed hooks for using Redux state and dispatch more safely.
 * These hooks should be used instead of plain useDispatch and useSelector for proper TypeScript support.
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './storeConfig';

/**
 * Use this typed dispatch hook instead of plain useDispatch
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Use this typed selector hook instead of plain useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 