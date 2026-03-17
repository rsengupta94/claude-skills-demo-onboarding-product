/**
 * Error Message Component
 * Reusable error display with optional retry action
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Try Again'
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col gap-3">
          <p>{message}</p>
          {onRetry && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2"
              >
                {retryText}
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default ErrorMessage;
