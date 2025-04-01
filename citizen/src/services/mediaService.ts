/**
 * src/services/mediaService.ts
 *
 * Service for handling media files
 */

import { MediaAttachment } from '@/types';
import { getAuthHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Get media URL with various fallback strategies
 * 
 * @param attachment MediaAttachment object
 * @param attempt Current attempt number (0-3)
 * @returns URL string for the media
 */
export const getMediaUrl = (attachment: MediaAttachment, attempt: number = 0): string => {
  // If we've tried 3 times unsuccessfully, use placeholder
  if (attempt >= 3) return '/placeholder-image.svg';

  // 1. Try using standard filepath
  if (attempt === 0 && attachment.filepath) {
    const cleanPath = attachment.filepath.startsWith('/')
      ? attachment.filepath
      : `/${attachment.filepath}`;
    return `${API_URL}${cleanPath}`;
  }

  // 2. Try using filepath with timestamp to bypass cache
  if (attempt === 1 && attachment.filepath) {
    const cleanPath = attachment.filepath.startsWith('/')
      ? attachment.filepath
      : `/${attachment.filepath}`;
    return `${API_URL}${cleanPath}?v=${Date.now()}`;
  }

  // 3. Try using API serve endpoint
  return `${API_URL}/api/media-files/serve/${attachment.mediafileid}`;
};

/**
 * Fetch media files for an application
 * 
 * @param applicationId Application ID
 * @returns Array of media attachments
 */
export const fetchMediaFiles = async (applicationId: number): Promise<MediaAttachment[]> => {
  try {
    const response = await fetch(`${API_URL}/api/media-files/by-application/${applicationId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch media files');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching media files:', error);
    return [];
  }
}; 