import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LogsService } from '../../logs/logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id: string } }>();

    const method = request.method;
    const url = request.url;
    const ip = request.ip || '';
    const body = (request.body || {}) as Record<string, any>;
    const user = request.user;

    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.log(
            method,
            url,
            ip,
            statusCode,
            userAgent,
            body,
            user?.id,
            duration,
          );
        },
        error: (err: unknown) => {
          const statusCode = (err as { status?: number })?.status || 500;
          const duration = Date.now() - now;

          this.log(
            method,
            url,
            ip,
            statusCode,
            userAgent,
            body,
            user?.id,
            duration,
          );
        },
      }),
    );
  }

  private log(
    method: string,
    url: string,
    ip: string,
    statusCode: number,
    userAgent: string,
    body: Record<string, any>,
    userId: string | undefined,
    duration: number,
  ) {
    // Sanitize body (remove password)
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) sanitizedBody.password = '********';

    void this.logsService.createLog({
      method,
      url,
      ip,
      statusCode,
      userAgent,
      requestBody: JSON.stringify(sanitizedBody),
      userId,
      duration,
    });
  }
}
