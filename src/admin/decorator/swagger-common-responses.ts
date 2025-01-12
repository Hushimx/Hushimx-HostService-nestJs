import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const DefaultApiErrors = () => applyDecorators(
  ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid or missing authentication token',
  }),
  ApiResponse({
    status: 403,
    description: 'Forbidden: User does not have permission to access this resource',
  }),
  ApiResponse({
    status: 500,
    description: 'Internal Server Error: An unexpected error occurred',
  }),
);