export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof Error) {
    return res.status(error.status || 500).send({
      message: error.message,
    });
  }

  res.status(500).send({
    message: 'Server error',
  });
};
