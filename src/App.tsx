import { RewardsHash__factory } from "./typechain";
import { getDefaultProvider } from "ethers";
import { useQueries, useQuery } from "react-query";
import axios, { AxiosError } from "axios";
import knownCycleHashes from "./cache/cycleHashes.json";
import { formatEther } from "ethers/lib/utils";
import { useState } from "react";

type CycleInfo = {
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

function getCycleHash(cycle: number, enabled = true) {
  return {
    queryKey: ["cycleHash", cycle],
    queryFn: () => contract.cycleHashes(cycle),
    enabled,
    initialData: knownCycleHashes[cycle],
  };
}

function getCycleInfo(address: string, cycleHash?: string[]) {
  return {
    queryKey: ["cycleInfo", cycleHash, address],
    queryFn: async () => {
      if (!cycleHash) throw Error();

      try {
        const { data } = await axios.get<CycleInfo>(
          `https://ipfs.tokemaklabs.xyz/ipfs/${cycleHash[1]}/${address}.json`
        );
        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return {
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

  const cycleHashes = useQueries(
    Array.from(Array((latestCycle?.toNumber() || 0) + 1).keys()).map((cycle) =>
      getCycleHash(cycle, !!latestCycle)
    )
  );

  const rewards = useQueries(
    cycleHashes.map(({ data: cycleHash }) => getCycleInfo(address, cycleHash))
  );

  const total = rewards
    .map(({ data }) => data?.summary.cycleTotal)
    .reduce((a = "0", b = "0") => (BigInt(a) + BigInt(b)).toString());

  // @ts-ignore
  window.foo = rewards;

  return (
    <div className="App">
      <header className="App-header">header</header>
      <div>
        <form
          onSubmit={(event) => {
            setAddress(event.currentTarget["address"].value);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            name="address"
            defaultValue={process.env.REACT_APP_DEFAULT_ADDRESS || ""}
          />
          <button type="submit">button</button>
        </form>
      </div>

      <div>latest cycle{latestCycle?.toNumber()}</div>

      <div>total {formatEther(total || 0)}</div>

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
            ? Array.from(Array(latestCycle.toNumber() + 1).keys())
                .reverse()
                .map((cycle) => (
                  <Row cycle={cycle} key={cycle} address={address} />
                ))
            : null}
        </tbody>
      </table>
    </div>
  );
}

function Row({ cycle, address }: { cycle: number; address: string }) {
  const { data: cycleHash } = useQuery(getCycleHash(cycle));

  const foo = useQuery<CycleInfo, AxiosError>(getCycleInfo(address, cycleHash));
  const { data: cycleInfo, isLoading } = foo;

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
