/**
 * Logs API traffic to the Node terminal (not the browser).
 * Place after express.json() so req.body is populated.
 */
export const requestLogger = (req, res, next) => {
  const body =
    req.body &&
    typeof req.body === "object" &&
    Object.keys(req.body).length > 0
      ? req.body
      : undefined;

  console.log(`[API] => ${req.method} ${req.originalUrl}`, {
    query: Object.keys(req.query || {}).length ? req.query : undefined,
    body,
  });

  const origJson = res.json.bind(res);
  res.json = (payload) => {
    console.log(
      `[API] <= ${req.method} ${req.originalUrl} status=${res.statusCode}`,
      payload
    );
    return origJson(payload);
  };

  next();
};
