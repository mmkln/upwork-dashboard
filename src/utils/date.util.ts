import { isSameDay } from "date-fns";

/**
 * Перевіряє, чи є передана дата сьогоднішньою.
 * @param date Дата, яку потрібно перевірити.
 * @returns true, якщо дата є сьогоднішньою, false в іншому випадку.
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};
