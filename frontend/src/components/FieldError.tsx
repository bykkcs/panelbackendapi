import React from 'react'
import { ApiFieldError } from '../utils/api'

export function FieldError({ error }: { error?: ApiFieldError }) {
  if (!error) return null
  const tooltip = [error.code, error.validation, error.path?.join('.')]
    .filter(Boolean)
    .join(' | ')
  return (
    <div className="text-red-600 text-sm flex items-center gap-1">
      <span title={tooltip}>⚠</span>
      {error.message}
    </div>
  )
}
