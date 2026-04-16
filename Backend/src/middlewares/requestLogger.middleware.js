/**
 * Logs API traffic to the Node terminal (not the browser).
 * Place after express.json() so req.body is populated.
 */
export const requestLogger = (req, res, next) => {
  console.log(`[API] => ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(
      `[API] <= ${req.method} ${req.originalUrl} status=${res.statusCode}`
    );
  });

  next();
};
