import {
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { computeAddress } from "ethers";
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import {
  WagmiConfig,
  configureChains,
  createConfig,
  useAccount,
  usePublicClient,
} from "wagmi";
import { sepolia } from "viem/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";

type ChipKeys =
  | {
      primaryPublicKeyHash: string;
      primaryPublicKeyRaw: string;
      secondaryPublicKeyHash: string;
      secondaryPublicKeyRaw: string;
      tertiaryPublicKeyHash: string | null;
      tertiaryPublicKeyRaw: string | null;
    }
  | undefined;

const Home: NextPage = () => {
  const provider = usePublicClient({
    chainId: 11155111,
  });
  const { address, isConnected } = useAccount();
  const [chipAddress, setChipAddress] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [keys, setKeys] = useState<ChipKeys | undefined>(undefined);
  const [blockNumber, setBlockNumber] = useState<bigint>(BigInt(0));

  async function scanChip() {
    setSignature(undefined);
    const chipKeys = await getPublicKeysFromScan();
    setKeys(chipKeys);
    setChipAddress(computeAddress("0x" + chipKeys?.primaryPublicKeyRaw));
  }

  async function signChip(chipKeys: ChipKeys) {
    if (chipKeys === undefined) {
      chipKeys = keys;
    }
    const recentBlockNumber = await provider.getBlockNumber();
    setBlockNumber(recentBlockNumber);
    const { hash: blockHash } = await provider.getBlock({
      blockNumber: recentBlockNumber,
    });
    const signatureScan = await getSignatureFromScan({
      chipPublicKey: chipKeys?.primaryPublicKeyRaw!,
      address: address!,
      hash: blockHash,
    });
    setSignature(signatureScan);
  }

  return (
    <>
      <Container p={0} size={600}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Link href="/">Mint</Link>
          <Link href="/" style={{ paddingLeft: "5px" }}>
            Seed Chip
          </Link>

          <Text weight={500} fz="xl">
            Chips
          </Text>
          <div>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              123
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              123
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              123
            </Card>
          </div>

          <Center>
            <Button
              variant="light"
              color="blue"
              mt="md"
              radius="md"
              onClick={() => scanChip()}
            >
              Scan Chip
            </Button>
          </Center>
        </Card>
      </Container>
    </>
  );
};

export default Home;
