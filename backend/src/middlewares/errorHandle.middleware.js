import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import createHttpError from 'http-errors';

const errorHandler = (error, req, res, next) => {
  if (error instanceof PrismaClientKnownRequestError) {
    res.status(400).json({ message: 'Prisma Client Error: ' + error });
    return;
  }

  if (createHttpError.isHttpError(error)) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
