export function withMongoId(value) {
  if (Array.isArray(value)) return value.map((item) => withMongoId(item));
  if (!value || typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "id") {
      out._id = v;
    } else {
      out[k] = withMongoId(v);
    }
  }
  return out;
}
