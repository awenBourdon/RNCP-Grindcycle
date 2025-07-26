import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/server/types/api';
import { HTTP_STATUS, API_MESSAGES } from '@/lib/server/config/constants';

export class ResponseHelper {
  static success<T>(
    data: T,
    message?: string,
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    return NextResponse.json(response, { status });
  }

  static successMessage(
    message: string,
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: ApiResponse = {
      success: true,
      message,
    };
    return NextResponse.json(response, { status });
  }

  static error(
    error: string,
    status: number = HTTP_STATUS.BAD_REQUEST,
    details?: string[]
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error,
      ...(details && { details }),
    };
    return NextResponse.json(response, { status });
  }

  static serverError(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.SERVER_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  static notFound(message?: string): NextResponse {
    return this.error(message || API_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  static unauthorized(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.UNAUTHORIZED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  static forbidden(message?: string): NextResponse {
    return this.error(message || API_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  static redirect(url: string, permanent: boolean = false): NextResponse {
    const status = permanent ? 301 : 302;
    return NextResponse.redirect(url, status);
  }

  static withHeaders<T>(
    data: T,
    headers: Record<string, string>,
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response = NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}
