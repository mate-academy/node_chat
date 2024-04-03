export const errorMiddleware = (error, req, res, next) => {
  res.statusCode = 500;

  res.send({
    message: 'Server error',
  });
};
