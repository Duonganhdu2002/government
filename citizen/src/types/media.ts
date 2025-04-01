/**
 * Types related to media files in the application
 */

/**
 * Interface for media file data
 */
export interface MediaFile {
  mediafileid?: number;
  id?: number;
  applicationid: number;
  mimetype?: string;
  filename?: string;
  originalfilename?: string;
  filesize?: number;
  filepath?: string;
  uploaddate?: string;
  [key: string]: any;
}

/**
 * Interface for media attachment data
 */
export interface MediaAttachment {
  mediafileid: number;
  applicationid: number;
  mimetype: string;
  originalfilename: string;
  filesize?: number;
  uploaddate?: string;
  filetype?: string;
  filepath?: string;
  [key: string]: any;
} 