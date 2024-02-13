import api from './api';
import { AxiosResponse, AxiosError } from 'axios';
import styles from './apiservice.module.css';

// src/utils/apiService.ts

// Define types for request parameters and response data
interface RequestOptions {
  params?: Record<string, any>;
}

const handleApiError = (error: AxiosError): void => {
  console.error('API Error:', error);
};

// Define types for request parameters and response data
interface RequestOptions {
  params?: Record<string, any>;
}

interface ApiResponse<T> extends AxiosResponse {
  data: T;
}

interface File {
  name: string;
}

// Define a generic function for making requests
const makeRequest = async (
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: Record<string, any>,
  options?: RequestOptions
): Promise<any> => {
  try {
    const response: ApiResponse<any> = await api[method](url, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<unknown, any>);
    throw error;
  }
};

// Define specific functions for each HTTP method
export const get = async (
  url: string,
  params?: Record<string, any>
): Promise<any> => {
  return makeRequest('get', url, undefined, { params });
};

export const post = async (
  url: string,
  data?: Record<string, any>
): Promise<any> => {
  console.log('calling post request');
  return makeRequest('post', url, data);
};

export const put = async (
  url: string,
  data?: Record<string, any>
): Promise<any> => {
  return makeRequest('put', url, data);
};

export const del = async (
  url: string,
  data?: Record<string, any>
): Promise<any> => {
  return makeRequest('delete', url, data);
};

export const patch = async (
  url: string,
  data?: Record<string, any>
): Promise<any> => {
  return makeRequest('patch', url, data);
};

export const uploadDocuments = async (
  files: File | File[]
): Promise<AxiosResponse<any>> => {
  const formData = new FormData();

  // If a single file is provided, convert it to an array
  if (!Array.isArray(files)) {
    files = [files];
  }

  files.forEach((file: File, index: number) => {
    formData.append('files', file as Blob, file.name);
  });

  const response = await api.post('/upload-documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default {
  get,
  post,
  put,
  delete: del,
  patch,
  uploadDocuments,
};

/* eslint-disable-next-line */
// export interface ApiserviceProps {}

// export function Apiservice(props: ApiserviceProps) {
//   return (
//     <div className={styles['container']}>
//       <h1>Welcome to Apiservice!</h1>
//     </div>
//   );
// }

// export default Apiservice;
