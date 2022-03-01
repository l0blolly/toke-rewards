import { BigNumber } from "ethers";
import { useQueries } from "react-query";
import { formatEther } from "ethers/lib/utils";
import { Graph } from "./Graph";
import { getCycleHash, getCycleInfo } from "../App";

type Props = {
  latestCycle: BigNumber;
  address: string;
};

export function Totals({ latestCycle, address }: Props) {
  const cycleArray = Array.from(
    Array((latestCycle?.toNumber() || -1) + 1).keys()
  );

  const cycleHashes = useQueries(
    cycleArray.map((cycle) => getCycleHash(cycle, !!latestCycle))
  );

  const rewards = useQueries(
    cycleHashes.map(({ data: cycleHash }, i) =>
      getCycleInfo(address, cycleHash, i)
    )
  );

  const idleFn = ({ isIdle }: { isIdle: boolean }) => isIdle;
  const idle = cycleHashes.some(idleFn) || rewards.some(idleFn);

  if (idle) {
    return <div>Waiting for user input</div>;
  }

  const loadingFn = ({ isLoading }: { isLoading: boolean }) => isLoading;
  const loading = cycleHashes.some(loadingFn) || rewards.some(loadingFn);

  if (loading) {
    return <div>loading</div>;
  }

  const total = rewards
    .map(({ data }) => data?.summary.cycleTotal)
    .reduce((a = "0", b = "0") => (BigInt(a) + BigInt(b)).toString(), "0");

  return (
    <>
      <div>total {formatEther(total || 0)}</div>
      <div style={{ width: "1000px", height: "400px" }}>
        <Graph rewards={rewards.map(({ data }) => data)} />
      </div>
    </>
  );
}
