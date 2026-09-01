type LogContext = Record<string, unknown>

const format = (scope: string, message: string, context?: LogContext) => ({
  scope: `framewire:${scope}`,
  message,
  ...(context ? { context } : {}),
  timestamp: new Date().toISOString(),
})

export const logger = {
  info(scope: string, message: string, context?: LogContext) {
    if (import.meta.env.DEV) console.info(format(scope, message, context))
  },
  warn(scope: string, message: string, context?: LogContext) {
    console.warn(format(scope, message, context))
  },
  error(scope: string, message: string, error?: unknown, context?: LogContext) {
    console.error(format(scope, message, { ...context, error: error instanceof Error ? error.message : String(error) }))
  },
}
