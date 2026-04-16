/**
 * Logs API traffic to the Node terminal (not the browser).
 * Place after express.json() so req.body is populated.
 */
export const requestLogger = (req, res, next) => {
  const MAX_LOG_LENGTH = 4000;
  const safeStringify = (value) => {
    try {
      const seen = new WeakSet();
      return JSON.stringify(
        value,
        (key, current) => {
          if (typeof current === "object" && current !== null) {
            if (seen.has(current)) return "[Circular]";
            seen.add(current);
          }
          return current;
        },
        2
      );
    } catch {
      return String(value);
    }
  };
  const formatForLog = (value) => {
    if (value === undefined) return "(empty)";
    const text = safeStringify(value);
    if (text.length <= MAX_LOG_LENGTH) return text;
    return `${text.slice(0, MAX_LOG_LENGTH)}... [truncated]`;
  };

  let responsePayload;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    responsePayload = body;
    return originalJson(body);
  };

  console.log(`[API] => ${req.method} ${req.originalUrl}`);
  console.log(`[API] request payload: ${formatForLog(req.body)}`);

  res.on("finish", () => {
    console.log(`[API] response payload: ${formatForLog(responsePayload)}`);
    console.log(
      `[API] <= ${req.method} ${req.originalUrl} status=${res.statusCode}`
    );
  });

  next();
};
