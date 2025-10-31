import React from "react";
import { UpworkJob } from "../../models";
import { ValueByCategoryChart, CategoryValueItem } from "../charts";
import { Card } from "../ui";
import { COUNTRY_LABELS } from "../../utils";

interface JobsByCountryProps {
    jobs: UpworkJob[];
    limit?: number;
}

const roundToSignificant = (num: number): number => {
    if (num < 10) return 10;
    const power = Math.pow(10, Math.floor(Math.log10(num)));
    return Math.ceil(num / power) * power;
};

const JobsByCountry: React.FC<JobsByCountryProps> = ({ jobs, limit }) => {
    const countryData = jobs.reduce(
        (acc: { [key: string]: { count: number } }, job) => {
            const code =
                job.country_code ||
                (job.country ? job.country.toUpperCase() : "ZZ");

            if (!acc[code]) {
                acc[code] = { count: 1 };
            } else {
                acc[code].count += 1;
            }
            return acc;
        },
        {},
    );

    const data: CategoryValueItem[] = Object.keys(countryData).map((code) => ({
        label: COUNTRY_LABELS[code] || code,
        value: countryData[code].count,
    }));

    const sortedData = data.sort((a, b) => b.value - a.value);
    const limitedData = limit ? sortedData.slice(0, limit) : sortedData;

    const maxRate = roundToSignificant(
        Math.max(...limitedData.map((item) => item.value), 0),
    );

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-8">Jobs by Country</h2>

                <div className="overflow-scroll h-[21.5rem]">
                    <ValueByCategoryChart
                        data={limitedData}
                        maxValue={maxRate}
                        minValue={0}
                    />
                </div>
            </div>
        </Card>
    );
};

export default JobsByCountry;
