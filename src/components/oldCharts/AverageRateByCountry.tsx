import React from "react";
import { UpworkJob } from "../../models";
import { ValueByCategoryChart, CategoryValueItem } from "../charts";
import Card from "../ui/Card";
import {COUNTRY_LABELS} from "../../utils";

interface AverageRateByCountryProps {
    jobs: UpworkJob[];
    limit?: number;
}

const roundToSignificant = (num: number): number => {
    if (num <= 0 || Number.isNaN(num)) return 10;
    if (num < 10) return 10;
    const power = Math.pow(10, Math.floor(Math.log10(num)));
    return Math.ceil(num / power) * power;
};

const AverageRateByCountry: React.FC<AverageRateByCountryProps> = ({
                                                                       jobs,
                                                                       limit,
                                                                   }) => {
    const countryData = jobs.reduce(
        (
            acc: {
                [code: string]: { totalRate: number; count: number };
            },
            job,
        ) => {
            const code = (job as any).country_code || null;
            if (!code || job.average_rate == null) {
                return acc;
            }

            if (!acc[code]) {
                acc[code] = {
                    totalRate: Number(job.average_rate),
                    count: 1,
                };
            } else {
                acc[code].totalRate += Number(job.average_rate);
                acc[code].count += 1;
            }

            return acc;
        },
        {},
    );

    // перетворюємо в масив
    let data: CategoryValueItem[] = Object.keys(countryData).map((code) => {
        const avg =
            countryData[code].totalRate / Math.max(countryData[code].count, 1);
        return {
            label: COUNTRY_LABELS[code] || code,
            value: Number(avg.toFixed(2)),
            count: countryData[code].count, // якщо тобі треба потім фільтрувати
        };
    });

    const sortedData = data.sort((a, b) => b.value - a.value);
    const limitedData = limit ? sortedData.slice(0, limit) : sortedData;

    const maxRate = roundToSignificant(
        limitedData.length
            ? Math.max(...limitedData.map((item) => item.value))
            : 0,
    );

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-8">
                    Client Rate by Country (avg.)
                </h2>
                <div className="overflow-scroll h-[21.5rem]">
                    <ValueByCategoryChart
                        data={limitedData}
                        maxValue={maxRate}
                        minValue={0}
                        labelSuffix="$"
                    />
                </div>
            </div>
        </Card>
    );
};

export default AverageRateByCountry;
