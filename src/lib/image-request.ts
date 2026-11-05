/** Cheap rejection before metadata reads. Versions remain opaque and are compared by each route. */
export function hasImageVersion(url: URL) {
  const version = url.searchParams.get("v");
  return version !== null && version.length > 0 && version.length <= 128;
}
