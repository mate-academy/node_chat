import { Prisma } from '@prisma/client';

// Known Prisma error codes → HTTP responses.
// https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: 'A record with this value already exists' },
  P2025: { status: 404, message: 'Record not found' },
  P2003: { status: 404, message: 'Related record not found' },
};

// Centralized error-handling middleware.
// Express recognizes it as an error handler because it takes 4 arguments
// (error, req, res, next). It must be registered AFTER all routes.
export function errorHandler(error, req, res, next) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERROR_MAP[error.code];

    if (mapped) {
      return res.status(mapped.status).json({ error: mapped.message });
    }
  }

  // eslint-disable-next-line no-console
  console.error(error);
  res.status(500).json({ error: 'Something went wrong' });
}
