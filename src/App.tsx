import { RewardsHash__factory } from "./typechain";
import { BigNumber, getDefaultProvider } from "ethers";
import { useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import knownCycleHashes from "./cache/cycleHashes.json";
import { formatEther } from "ethers/lib/utils";
import { useState } from "react";

import { UserInput } from "./components/UserInput";
import { Totals } from "./components/Totals";

export type CycleInfo = {
  payload: {
    cycle: number;
    amount: string;
  };
  summary: {
    breakdown: {
      description: string;
      amount: string;
    }[];
    cycleTotal: string;
  };
};

const contract = RewardsHash__factory.connect(
  "0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6",
  getDefaultProvider()
);

export function getCycleHash(cycle: number, enabled = true) {
  return {
    queryKey: ["cycleHash", cycle],
    queryFn: () => contract.cycleHashes(cycle),
    enabled,
    initialData: knownCycleHashes[cycle],
  };
}

export function getCycleInfo(
  address: string,
  cycle: number,
  cycleHash?: string[]
) {
  return {
    queryKey: ["cycleInfo", cycleHash, address],
    queryFn: async () => {
      if (!cycleHash) throw Error();

      try {
        const { data } = await axios.get<CycleInfo>(
          `https://ipfs.tokemaklabs.xyz/ipfs/${cycleHash[1]}/${address}.json`
        );

        if (cycle === 0) {
          data.payload.cycle = 0;
          data.summary = {
            cycleTotal: data.payload.amount,
            breakdown: [
              {
                description: "DeGenesis",
                amount: data.payload.amount,
              },
            ],
          };
        }

        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return {
            payload: {
              cycle: cycle,
              amount: "0",
            },
            summary: {
              breakdown: [],
              cycleTotal: "0",
            },
          };
        }
        throw error;
      }
    },
    enabled: !!cycleHash && address !== "",
  };
}

function App() {
  const [address, setAddress] = useState("");

  const { data: latestCycle } = useQuery(
    "lastCycle",
    () => contract.latestCycleIndex(),
    { staleTime: 1000 * 60 * 60 } // 1 hour
  );

  return (
    <div className="App">
      <UserInput {...{ setAddress }} />

      {!latestCycle ? (
        <div>loading</div>
      ) : (
        <>
          <div>latest cycle {latestCycle.toNumber()}</div>

          <Totals {...{ address, latestCycle }} />

          <DetailedTable {...{ address, latestCycle }} />
        </>
      )}
    </div>
  );
}

function DetailedTable({
  latestCycle,
  address,
}: {
  latestCycle: BigNumber;
  address: string;
}) {
  const cycleArray = Array.from(
    Array((latestCycle?.toNumber() || 0) + 1).keys()
  );

  return (
    <table>
      <thead>
        <tr>
          <th>cycle</th>
          <th>token</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody>
        {latestCycle
          ? cycleArray
              .reverse()
              .map((cycle) => (
                <Row cycle={cycle} key={cycle} address={address} />
              ))
          : null}
      </tbody>
    </table>
  );
}

function Row({ cycle, address }: { cycle: number; address: string }) {
  const { data: cycleHash } = useQuery(getCycleHash(cycle));

  const { data: cycleInfo, isLoading } = useQuery<CycleInfo, AxiosError>(
    getCycleInfo(address, cycle, cycleHash)
  );

  if (isLoading) {
    return null;
  }

  return (
    <>
      {cycleInfo?.summary.breakdown
        .filter((info) => info.amount !== "0")
        .map((info) => (
          <tr key={info.description}>
            <td>{cycle}</td>
            <td>{info.description}</td>
            <td>{formatEther(info.amount)}</td>
          </tr>
        ))}
    </>
  );
}

export default App;
