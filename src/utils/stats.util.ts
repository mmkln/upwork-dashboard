/**
 * Обчислює середнє арифметичне значення з масиву чисел.
 * @param values Масив чисел, для яких потрібно знайти середнє значення.
 * @returns Середнє значення або 0, якщо масив порожній.
 */
export const findAvg = (values: number[]): number => {
  if (values.length === 0) return 0; // Якщо масив порожній, повертаємо 0

  const total = values.reduce((sum, value) => sum + value, 0); // Сума всіх елементів
  return total / values.length; // Ділимо на кількість елементів, щоб отримати середнє
};

/**
 * Обчислює медіанне значення з масиву чисел.
 * @param values Масив чисел, для яких потрібно знайти медіанну значення.
 * @returns Середнє значення або 0, якщо масив порожній.
 */
export function findMedian(values: number[]): number {
  values.sort((a, b) => a - b);
  const middleIndex = Math.floor(values.length / 2);

  if (values.length % 2 === 0) {
    return (values[middleIndex - 1] + values[middleIndex]) / 2;
  } else {
    return values[middleIndex];
  }
}
