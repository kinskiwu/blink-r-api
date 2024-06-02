import morgan from 'morgan';
import { logger } from '../../config/winston';

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export const morganMiddleware = morgan('combined', { stream });
