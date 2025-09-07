/* eslint-disable ts/no-empty-object-type */
// Custom environment variable validation utility using Zod
import { z } from 'zod';

interface EnvConfig<TServer extends z.ZodRawShape, TClient extends z.ZodRawShape> {
  server?: TServer;
  client?: TClient;
  clientPrefix?: string;
  runtimeEnv?: Record<string, string | undefined>;
  emptyStringAsUndefined?: boolean;
  onValidationError?: (error: z.ZodError) => void;
}

class EnvValidationError extends Error {
  constructor(public zodError: z.ZodError) {
    const errorMessages = zodError.issues.map(err =>
      `${err.path.join('.')}: ${err.message}`,
    );
    super(`Environment validation failed:\n${errorMessages.map(e => `  - ${e}`).join('\n')}`);
    this.name = 'EnvValidationError';
  }
}

function createEnv<
  TServer extends z.ZodRawShape = {},
  TClient extends z.ZodRawShape = {},
>(config: EnvConfig<TServer, TClient>): z.infer<z.ZodObject<TServer>> & z.infer<z.ZodObject<TClient>> {
  const {
    server = {} as TServer,
    client = {} as TClient,
    clientPrefix = '',
    runtimeEnv = {},
    emptyStringAsUndefined = false,
    onValidationError,
  } = config;

  // Process runtime environment
  const processedEnv = { ...runtimeEnv };

  if (emptyStringAsUndefined) {
    Object.keys(processedEnv).forEach((key) => {
      if (processedEnv[key] === '') {
        processedEnv[key] = undefined;
      }
    });
  }

  // Validate client prefix requirements
  if (clientPrefix) {
    Object.keys(client).forEach((key) => {
      if (!key.startsWith(clientPrefix)) {
        throw new Error(`Client environment variable "${key}" must start with "${clientPrefix}"`);
      }
    });
  }

  // Create combined schema
  const serverSchema = z.object(server);
  const clientSchema = z.object(client);
  const combinedSchema = serverSchema.merge(clientSchema);

  try {
    const result = combinedSchema.parse(processedEnv);
    return result as z.infer<z.ZodObject<TServer>> & z.infer<z.ZodObject<TClient>>;
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      if (onValidationError) {
        onValidationError(error);
      }
      throw new EnvValidationError(error);
    }
    throw error;
  }
}

// Export the main function and error class
export { createEnv, EnvValidationError };
