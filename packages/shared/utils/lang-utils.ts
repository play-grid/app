export function containsArabic(text: string): boolean {
  return /\p{Script=Arabic}/u.test(text);
}
