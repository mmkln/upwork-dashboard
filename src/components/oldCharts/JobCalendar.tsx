import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from "date-fns";
import { UpworkJob } from "../../models";
import { isToday } from "../../utils";

interface JobCalendarProps {
  jobs: UpworkJob[];
  month: Date; // поточний місяць для відображення
}

// Функція для генерації інтенсивності кольору на основі кількості задач
const getColorIntensity = (
  jobCount: number,
  isToday: boolean = false,
): string => {
  if (isToday) {
    if (jobCount === 0) return "text-orange-200 bg-orange-50 border-orange-50"; // Немає задач
    if (jobCount <= 5) return "text-orange-300 bg-orange-100 border-orange-100"; // 1-5 задач
    if (jobCount <= 12)
      return "text-orange-400 bg-orange-200 border-orange-200"; // 5-12 задач
    if (jobCount <= 20)
      return "text-orange-500 bg-orange-300 border-orange-300"; // 12-20 задач
    if (jobCount <= 30)
      return "text-orange-600 bg-orange-400 border-orange-400"; // 20-30 задач
    return "text-orange-700 bg-orange-500 border-orange-500"; // Більше 30 задач
  }
  if (jobCount === 0) return "text-gray-200 bg-gray-50 border-gray-50"; // Немає задач
  if (jobCount <= 5) return "text-blue-300 bg-blue-100 border-blue-100"; // 1-5 задач
  if (jobCount <= 12) return "text-blue-400 bg-blue-200 border-blue-200"; // 5-12 задач
  if (jobCount <= 20) return "text-blue-500 bg-blue-300 border-blue-300"; // 12-20 задач
  if (jobCount <= 30) return "text-blue-600 bg-blue-400 border-blue-400"; // 20-30 задач
  return "text-blue-700 bg-blue-500 border-blue-500"; // Більше 30 задач
};

const JobCalendar: React.FC<JobCalendarProps> = ({ jobs, month }) => {
  // Генеруємо дати для поточного місяця
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start, end });

  // Підраховуємо кількість задач для кожного дня
  const jobCountPerDay: { [key: string]: number } = jobs.reduce(
    (acc: { [key: string]: number }, job) => {
      const jobDate = format(new Date(job.created_at), "yyyy-MM-dd");
      if (!acc[jobDate]) {
        acc[jobDate] = 1;
      } else {
        acc[jobDate] += 1;
      }
      return acc;
    },
    {},
  );

  // Додаємо дні для попереднього та наступного місяця, щоб заповнити сітку календаря
  const leadingDays = Array.from({ length: getDay(start) }).map((_, index) => (
    <div key={`leading-${index}`} className="w-7 h-7"></div>
  ));

  const trailingDays = Array.from({ length: 6 - getDay(end) }).map(
    (_, index) => <div key={`trailing-${index}`} className="w-7 h-7"></div>,
  );

  return (
    <div className="bg-white p-6 rounded-3xl shadow w-72">
      <h2 className="text-lg font-semibold mb-4">
        {format(month, "MMMM, yyyy")}
      </h2>
      <div className="grid grid-cols-7 gap-1.5">
        {/* Відображаємо назви днів тижня */}
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="text-center font-bold text-gray-300">
            {day}
          </div>
        ))}

        {/* Відображаємо дні з початку місяця */}
        {leadingDays}

        {/* Відображаємо активні дні місяця */}
        {daysInMonth.map((day) => {
          const formattedDay = format(day, "yyyy-MM-dd");
          const jobCount = jobCountPerDay[formattedDay] || 0;
          const isDayToday = isToday(day);

          const colorClass = getColorIntensity(jobCount, isDayToday);

          return (
            <div className="flex justify-center">
              <div
                key={formattedDay}
                className={`relative group/day w-7 h-7 flex items-center justify-center rounded-lg border-2 hover:outline outline-2 outline-inherit cursor-pointer ${colorClass}`}
              >
                <span className="text-base font-medium">
                  {format(day, "d")}
                </span>
                <div className="hidden group-hover/day:flex w-max absolute bottom-8 bg-white border border-gray-200 rounded-xl px-2 py-1 text-gray-800">
                  {jobCount} {jobCount > 1 ? "Jobs" : "Job"}
                </div>
              </div>
            </div>
          );
        })}

        {/* Додаємо порожні дні після місяця */}
        {trailingDays}
      </div>
    </div>
  );
};

export default JobCalendar;
