export const errorHandler = (err, req, res, next) => {
  console.error(err); // server console me error log

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    result: null,
  });
};
