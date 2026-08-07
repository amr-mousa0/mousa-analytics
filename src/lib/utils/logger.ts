export interface LogContext {
  requestId?: string;
  correlationId?: string;
  jobId?: string;
  [key: string]: any;
}

export class Logger {
  private static formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      requestId: context?.requestId || 'N/A',
      correlationId: context?.correlationId || 'N/A',
      jobId: context?.jobId || 'N/A',
      ...context
    };
    return JSON.stringify(payload);
  }

  public static info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('INFO', message, context));
  }

  public static warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  public static error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('ERROR', message, context));
  }

  public static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }
}
