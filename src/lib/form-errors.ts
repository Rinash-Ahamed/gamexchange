/** Clear only the edited field; authoritative validation still runs on submit. */
export function clearEditedField(errors: Record<string, string[] | undefined>, name: string) {
  if (!(name in errors)) return errors;
  const next = { ...errors };
  delete next[name];
  return next;
}
