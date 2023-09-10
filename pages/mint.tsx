import {
  Button,
  Card,
  Center,
  Container,
  Flex,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { computeAddress } from "ethers";
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import { useAccount, useConnect, usePublicClient } from "wagmi";
import ChipInformation from "@/components/ChipInformation";

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
  const { openConnectModal } = useConnectModal();

  const provider = usePublicClient({
    chainId: 11155111,
  });
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [chipAddress, setChipAddress] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [keys, setKeys] = useState<ChipKeys | undefined>(undefined);
  const [blockNumber, setBlockNumber] = useState<bigint>(BigInt(0));

  async function scanChip() {
    setKeys({
      primaryPublicKeyHash:
        "0x25e0bbb8c9e50e300aed9c056d8ed1c7067b53d7c9ad6021fea099b9261fe346",
      primaryPublicKeyRaw:
        "0437ffa75e89387951c032673e0bf972f825570f7372535bafac06733370d3f039888b13a4138f6ffc9a912356f2803c59e86e5efc78c88e672074e26afb3face9",
      secondaryPublicKeyHash:
        "0x14013d660459deda7a913b056345e781a6ad92a6fc953e433966efadc4979027",
      secondaryPublicKeyRaw:
        "041159b096ad64bcec6db863fb1a34250e9f84e649e27a265c136e9dfa5d5c2d9fc3be6aa3b167773d17d150932231eb3966f1c5f0ab36e37eac87f4fd03c53b67",
      tertiaryPublicKeyHash: null,
      tertiaryPublicKeyRaw: null,
    });
    // setSignature(undefined);
    // const chipKeys = await getPublicKeysFromScan();
    // setKeys(chipKeys);
    // setChipAddress(computeAddress("0x" + chipKeys?.primaryPublicKeyRaw));
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

  async function connected() {
    console.log("connected");
  }

  return (
    <>
      <Text weight={500} fz="xl">
        Chips
      </Text>
      {keys === undefined && <Text align="center">No chip</Text>}
      <ScrollArea mt={10}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "sm", sm: "lg" }}
          justify={{ sm: "center" }}
        >
          {keys?.primaryPublicKeyHash && (
            <ChipInformation
              type="Primary"
              publicKey={keys.primaryPublicKeyHash}
              address={computeAddress("0x" + keys?.primaryPublicKeyRaw)}
            />
          )}
          {keys?.secondaryPublicKeyHash && (
            <ChipInformation
              type="Secondary"
              publicKey={keys.secondaryPublicKeyHash}
              address={computeAddress("0x" + keys?.secondaryPublicKeyRaw)}
            />
          )}
          {keys?.tertiaryPublicKeyHash && (
            <ChipInformation
              type="Tertiary"
              publicKey={keys.tertiaryPublicKeyHash}
              address={computeAddress("0x" + keys?.tertiaryPublicKeyRaw)}
            />
          )}
        </Flex>
      </ScrollArea>

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
      <Text weight={500} fz="xl">
        Mint
      </Text>
      <Center>
        <Button
          variant="light"
          color="blue"
          mt="md"
          radius="md"
          onClick={isConnected ? connected : openConnectModal}
        >
          Mint
        </Button>
      </Center>
    </>
  );
};

export default Home;
