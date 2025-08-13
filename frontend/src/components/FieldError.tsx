import React from 'react';
import { ApiFieldError } from '../utils/api';

export function FieldError({ error }: { error?: ApiFieldError }) {
  if (!error) return null;
  return <div className="text-xs text-red-600 mt-1">{error.message}</div>;
}
