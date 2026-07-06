import { NextResponse } from 'next/server';

export type ApiErrorCode =
    | 'BAD_REQUEST'
    | 'VALIDATION_ERROR'
    | 'AI_PROVIDER_ERROR'
    | 'VERSION_NOT_FOUND'
    | 'INTERNAL_ERROR';

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: ApiErrorCode;
        message: string;
    };
}

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json<ApiSuccessResponse<T>>(
        {
            success: true,
            data,
        },
        { status }
    );
}

export function errorResponse(code: ApiErrorCode, message: string, status = 500) {
    return NextResponse.json<ApiErrorResponse>(
        {
            success: false,
            error: {
                code,
                message,
            },
        },
        { status }
    );
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'Something went wrong.';
}