export default (err, req, res, next) => {
  console.error("<----Error Occured---->:", err);

  // Determine if the error is a client error or server error
  const statusCode = err.statusCode ? err.statusCode : err.message ? 400 : 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message: message,
      status: statusCode,
    },
  });
};
