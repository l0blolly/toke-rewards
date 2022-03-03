import { BigNumber } from "ethers";
import { useQueries, useQuery } from "react-query";
import { formatEther } from "ethers/lib/utils";
import { Graph } from "./Graph";
import { getCycleHash, getCycleInfo } from "../App";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { orderBy } from "lodash";
import axios from "axios";
import { Formatter } from "./Formatter";

type Props = {
  latestCycle: BigNumber;
  address: string;
};

export function Totals({ latestCycle, address }: Props) {
  const { data: tokePrice } = useQuery(
    "price",
    async () => {
      const { data } = await axios.get<{ prices: { toke: number } }>(
        "https://tokemakmarketdata.s3.amazonaws.com/current.json"
      );
      return data;
    },
    {
      select: (data) => data.prices.toke,
      staleTime: 1000 * 60 * 5, // 5 min
    }
  );

  const cycleArray = Array.from(
    Array((latestCycle?.toNumber() || -1) + 1).keys()
  );

  const cycleHashes = useQueries(
    cycleArray.map((cycle) => getCycleHash(cycle, !!latestCycle))
  );

  const rewards = useQueries(
    cycleHashes.map(({ data: cycleHash }, i) =>
      getCycleInfo(address, i, cycleHash)
    )
  );

  //Not returning on loading or idle looks interesting to see the data populating
  //but is pretty bad for performance so just show nothing or loading till done
  const idleFn = ({ isIdle }: { isIdle: boolean }) => isIdle;
  const idle = cycleHashes.some(idleFn) || rewards.some(idleFn);

  if (idle) {
    return null;
  }

  const loadingFn = ({ isLoading }: { isLoading: boolean }) => isLoading;
  const loading = cycleHashes.some(loadingFn) || rewards.some(loadingFn);

  if (loading) {
    return <div>loading</div>;
  }

  const total = rewards
    .map(({ data }) => data?.summary?.cycleTotal)
    .reduce<string | bigint>((a, b = "0") => BigInt(a) + BigInt(b), "0");

  const byToken: { [k: string]: bigint } = {};

  for (let { data } of rewards) {
    const breakdowns = data?.summary.breakdown;
    if (breakdowns === undefined) continue;

    for (let { description, amount } of breakdowns) {
      byToken[description] =
        BigInt(byToken[description] || "0") + BigInt(amount);
    }
  }

  const formattedTotal = formatEther(total || 0);

  return (
    <>
      <div>
        Total Earned: <Formatter value={parseFloat(formattedTotal)} /> toke
        {tokePrice ? (
          <span style={{ marginLeft: "5px" }}>
            (
            <Formatter
              value={tokePrice * parseFloat(formattedTotal)}
              currency
            />{" "}
            at current toke price of <Formatter value={tokePrice} currency />)
          </span>
        ) : null}
      </div>

      <div style={{ width: "100%", height: "400px" }}>
        <Graph rewards={rewards.map(({ data }) => data)} />
        <div>(Click on labels to show or hide reward types)</div>
      </div>

      <h2 style={{ marginTop: "70px" }}>By Token</h2>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderBy(Object.entries(byToken), ([_, v]) => v, "desc").map(
              ([k, v]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell>{formatEther(v.toString())}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
