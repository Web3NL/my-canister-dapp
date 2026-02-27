export function formatDate(timestampSeconds: bigint): string {
  const date = new Date(Number(timestampSeconds) * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
