/** Read only explicitly allowed fields, never arbitrary submitted properties. */
export function formText(data: FormData, key: string) {
  return String(data.get(key) ?? "");
}

export function formTextFields<const Keys extends readonly string[]>(data: FormData, keys: Keys) {
  return Object.fromEntries(keys.map((key) => [key, formText(data, key)])) as Record<Keys[number], string>;
}

export function formFile(data: FormData, key: string) {
  const file = data.get(key);
  return file instanceof File && file.size > 0 ? file : undefined;
}
