import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UpworkJob } from "../models";

interface ClientRatingVsAverageRateChartProps {
  jobs: UpworkJob[];
}

const ClientRatingVsAverageRateChart: React.FC<
  ClientRatingVsAverageRateChartProps
> = ({ jobs }) => {
  // Фільтруємо дані для відображення тільки робіт, у яких є рейтинг клієнта і середня ставка
  const data = jobs
    .filter((job) => job.client_rating !== null && job.average_rate !== null)
    .map((job) => ({
      clientRating: job.client_rating,
      averageRate: Number(job.average_rate),
    }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Client Rating vs. Average Rate
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="clientRating"
            name="Client Rating"
            domain={[0, 5]}
            tickCount={6}
            label={{
              value: "Client Rating",
              position: "insideBottomRight",
              offset: 0,
            }}
          />
          <YAxis
            type="number"
            dataKey="averageRate"
            name="Average Rate"
            label={{
              value: "Average Rate ($)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter
            name="Client Rating vs. Average Rate"
            data={data}
            fill="#8884d8"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClientRatingVsAverageRateChart;
