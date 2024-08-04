class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

class BadRequestError extends CustomError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

class InternalServerError extends CustomError {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}

// Error Handling Middleware
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
  });

  next();
}

export {
  CustomError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
  errorHandler,
};
