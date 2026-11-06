import axios from 'axios';

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? 'Could not reach the server';
  }
  return 'Something went wrong';
}