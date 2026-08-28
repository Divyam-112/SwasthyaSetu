/**
 * Async handler wrapper to catch errors in async route handlers.
 * Eliminates the need for try-catch in every controller.
 * Usage: router.get("/", asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
