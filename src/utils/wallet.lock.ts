export function sortWalletsForLocking(a: { id: string }, b: { id: string }) {
  return a.id < b.id ? [a, b] : [b, a];
}
