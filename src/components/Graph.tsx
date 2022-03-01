import { formatEther } from "ethers/lib/utils";

import { CycleInfo } from "../App";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  rewards: (CycleInfo | undefined)[];
};

export function Graph({ rewards }: Props) {
  const [hidden, setHidden] = useState<string[]>([]);

  const colors = [
    "#63b598",
    "#ce7d78",
    "#ea9e70",
    "#a48a9e",
    "#c6e1e8",
    "#648177",
    "#0d5ac1",
    "#f205e6",
    "#1c0365",
    "#14a9ad",
    "#4ca2f9",
    "#a4e43f",
    "#d298e2",
    "#6119d0",
    "#d2737d",
    "#c0a43c",
    "#f2510e",
    "#651be6",
    "#79806e",
    "#61da5e",
  ];

  const data = rewards.map((reward) => {
    const defaultVal = { name: reward?.payload?.cycle };
    return (
      reward?.summary.breakdown.reduce((acc, obj) => {
        return { ...acc, [obj.description]: formatEther(obj.amount) };
      }, defaultVal) || defaultVal
    );
  });

  const set = new Set<string>();

  data.forEach((obj) => {
    Object.keys(obj).forEach((key) => set.add(key));
  });
  set.delete("name");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend
          onClick={(e) => {
            if (hidden.includes(e.dataKey)) {
              hidden.splice(hidden.indexOf(e.dataKey), 1);
              setHidden([...hidden]);
            } else {
              setHidden([...hidden, e.dataKey]);
            }
          }}
        />
        {Array.from(set).map((key, i) => (
          <Area
            hide={hidden.includes(key)}
            type="monotone"
            dataKey={key}
            stackId="1"
            key={key}
            fill={colors[i]}
            stroke={colors[i]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
