import { AsyncLocalStorage } from 'node:async_hooks';
import type { Logger } from 'pino';

export const requestContext = new AsyncLocalStorage<Logger>();

//requestContext là một cái hộp giữ logger riêng của request hiện tại.
