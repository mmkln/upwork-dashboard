export interface UpworkJob {
  id: string;
  average_rate: number | null;
  description: string;
  client_industry: string | null;
  client_rating: number | null;
  country: string;
  experience: string;
  hourly_rates: number[] | null;
  skills: string[];
  title: string;
  total_spent: number | null;
  fixed_price: number | null;
  created_at: string;
  status: JobStatus;
}

export enum JobExperience {
  Entry = "Entry level",
  Intermediate = "Intermediate",
  Expert = "Expert",
}

export enum JobStatus {
  Draft = "draft", // Чернетка заявки, ще не подана
  Submitted = "submitted", // Заявка подана
  Interview = "interview", // Запрошення на інтерв'ю
  OfferReceived = "offerReceived", // Отримана пропозиція від клієнта
  OfferAccepted = "offerAccepted", // Пропозиція прийнята
  InProgress = "inProgress", // Завдання в процесі виконання
  Completed = "completed", // Завдання завершене
  Closed = "closed", // Завдання закрите (неважливо завершене чи ні)
  Declined = "declined", // Заявка відхилена
  Withdrawn = "withdrawn", // Заявка знята самим фрілансером
}
