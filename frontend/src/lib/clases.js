export function cx(...clases) {
  return clases.filter(Boolean).join(' ');
}
