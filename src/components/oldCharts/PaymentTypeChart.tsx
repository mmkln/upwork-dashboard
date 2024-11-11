import React, { PureComponent } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { UpworkJob } from "../../models"; // Переконайтеся, що шлях правильний

interface PaymentTypeChartProps {
  jobs: UpworkJob[];
}

interface PaymentDataItem {
  name: string;
  value: number;
  percentage: string;
}

const COLORS = ["#4ADE80", "#60A5FA", "#D1D5DB"]; // Tailwind зелений, синій та сірий

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

class PaymentTypeChart extends PureComponent<PaymentTypeChartProps> {
  static demoUrl =
    "https://codesandbox.io/s/pie-chart-with-customized-label-dlhhj";

  getPaymentData = (): PaymentDataItem[] => {
    const { jobs } = this.props;
    let fixed = 0;
    let hourly = 0;
    let unspecified = 0;

    jobs.forEach((job) => {
      if (job.fixed_price !== null) {
        fixed += 1;
      } else if (job.hourly_rates && job.hourly_rates.length > 0) {
        hourly += 1;
      } else {
        unspecified += 1;
      }
    });

    const total = fixed + hourly + unspecified;

    return [
      {
        name: "Fixed Price",
        value: fixed,
        percentage: total ? ((fixed / total) * 100).toFixed(2) : "0.00",
      },
      {
        name: "Hourly Rate",
        value: hourly,
        percentage: total ? ((hourly / total) * 100).toFixed(2) : "0.00",
      },
      {
        name: "Unspecified",
        value: unspecified,
        percentage: total ? ((unspecified / total) * 100).toFixed(2) : "0.00",
      },
    ];
  };

  render() {
    const paymentData = this.getPaymentData();

    return (
      <div className="bg-white p-8 rounded-3xl shadow w-full">
        <h2 className="text-lg font-semibold">Співвідношення типів оплати</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={paymentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {paymentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} Jobs`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default PaymentTypeChart;
