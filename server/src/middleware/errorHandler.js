'use strict';

const { Prisma } = require('../generated/prisma');

const PRISMA_ERRORS = {
  P2002: { status: 409, message: 'Already exists' }, // unique constraint failed
  P2025: { status: 404, message: 'Not found' }, // record to update/delete was not found
  P2003: { status: 404, message: 'Related room not found' }, // foreign key constraint failed
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_ERRORS[err.code];

    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });

      return;
    }
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

module.exports = errorHandler;
