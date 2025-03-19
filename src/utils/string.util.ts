// string.util.ts

/**
 * Capitalizes the first character of a string.
 * @param str The string to capitalize.
 * @returns A new string with the first character in uppercase.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param str The string to capitalize.
 * @returns A new string with each word starting with an uppercase letter.
 */
export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Converts a camelCase string to snake_case.
 * @param str The camelCase string.
 * @returns The string in snake_case.
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts a snake_case string to camelCase.
 * @param str The snake_case string.
 * @returns The string in camelCase.
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to a space-separated string.
 * @param str The camelCase string.
 * @returns The string with spaces separating words.
 */
export function camelToWords(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Вставляємо пробіл перед великою літерою після малої
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Обробляємо послідовні великі літери
    .toLowerCase(); // Перетворюємо на нижній регістр (опціонально)
}

/**
 * Converts a camelCase string to a space-separated string with each word capitalized.
 * @param str The camelCase string to convert.
 * @returns A string where each word is capitalized and separated by spaces.
 */
export function camelToCapitalizedWords(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert a space before an uppercase letter following a lowercase one
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Handle consecutive uppercase letters (e.g., "API" → "API")
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join the words back together with spaces
}

/**
 * Removes extra spaces from a string.
 * @param str The string to clean.
 * @returns A string without extra spaces.
 */
export function trimExtraSpaces(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Checks if a string is a palindrome.
 * @param str The string to check.
 * @returns true if the string is a palindrome, otherwise false.
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return cleaned === cleaned.split("").reverse().join("");
}

/**
 * Truncates a string to a specified length and adds "..." if it was longer.
 * @param str The string to truncate.
 * @param maxLength The maximum length of the string.
 * @returns The truncated string with "..." if it was longer.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Generates a random string of a specified length.
 * @param length The length of the string.
 * @returns A random string consisting of letters and numbers.
 */
export function randomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
