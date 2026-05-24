interface SecurityErrorOptions {
  code: string;
  status?: number;
  publicMessage?: string;
  details?: Record<string, unknown>;
}

export class AppSecurityError extends Error {
  code: string;
  status: number;
  publicMessage: string;
  details?: Record<string, unknown>;

  constructor(message: string, options: SecurityErrorOptions) {
    super(message);
    this.name = "AppSecurityError";
    this.code = options.code;
    this.status = options.status ?? 400;
    this.publicMessage = options.publicMessage ?? "Não foi possível processar a solicitação.";
    this.details = options.details;
  }
}

export interface SafeErrorResult {
  status: number;
  body: {
    error: {
      code: string;
      message: string;
    };
  };
}

export const toSafeErrorResult = (error: unknown): SafeErrorResult => {
  if (error instanceof AppSecurityError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.publicMessage,
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocorreu um erro inesperado.",
      },
    },
  };
};
