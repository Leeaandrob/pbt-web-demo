import abi from "../abi/abi.json";
import ChipInformation from "@/components/ChipInformation";
import { Button, Center, Flex, Group, ScrollArea, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { IconCheck, IconCircleCheck, IconX } from "@tabler/icons-react";
import { computeAddress } from "ethers";
import type { NextPage } from "next";
import Link from "next/link";
import {
  getPublicKeysFromScan,
  getSignatureFromScan,
} from "pbt-chip-client/kong";
import { useState } from "react";
import { BaseError } from "viem";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";

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
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [keys, setKeys] = useState<ChipKeys | undefined>(undefined);
  const [blockNumber, setBlockNumber] = useState<bigint>(BigInt(0));

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    refetch,
  } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi.abi,
    functionName: "mintChip",
    args: [signature, blockNumber],
  });
  const { data, error, isError, reset, write: mint } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function scanChip() {
    setSignature(undefined);
    setBlockNumber(BigInt(0));
    const chipKeys = await getPublicKeysFromScan();
    setKeys(chipKeys);
  }

  async function signChip() {
    const recentBlockNumber = await provider.getBlockNumber();
    setBlockNumber(recentBlockNumber - BigInt(10));
    const { hash: blockHash } = await provider.getBlock({
      blockNumber: recentBlockNumber - BigInt(10),
    });
    const signatureScan = await getSignatureFromScan({
      chipPublicKey: keys?.primaryPublicKeyRaw!,
      address: address!,
      hash: blockHash,
    });
    setSignature(signatureScan);
  }

  function parseErrorMessage(error: BaseError): string | undefined {
    if (error.message.includes("UnauthorizedToMint")) {
      return "Seed the chip first";
    }
    if (error.message.includes("User rejected the request")) {
      return "Operation cancelled";
    }
    if (error.message.includes("ChipHasBeenMinted")) {
      return "Chip has been minted";
    }
  }

  if (isPrepareError && prepareError instanceof BaseError) {
    const errorMessage = parseErrorMessage(prepareError);
    notifications.show({
      id: "error",
      color: "red",
      icon: <IconX />,
      title: "Error on minting",
      message: errorMessage,
      autoClose: 2000,
      withCloseButton: true,
    });
    // refetch();
  }

  if (isError && error instanceof BaseError) {
    const errorMessage = parseErrorMessage(error);
    notifications.show({
      id: "error",
      color: "red",
      icon: <IconX />,
      title: "Error on minting",
      message: errorMessage,
      autoClose: 2000,
      withCloseButton: true,
    });
    reset();
  }

  if (isLoading) {
    notifications.show({
      id: "tx",
      loading: true,
      title: "Minting the token",
      message: "",
      autoClose: false,
      withCloseButton: false,
    });
  }

  if (isSuccess) {
    notifications.update({
      id: "tx",
      color: "teal",
      title: "Token minted",
      message: (
        <>
          Check the transaction at
          <Link href={`https://sepolia.etherscan.io/tx/${data?.hash}`}>
            {" "}
            {`https://sepolia.etherscan.io/tx/${data?.hash}`}
          </Link>
        </>
      ),
      icon: <IconCheck size="1rem" />,
      autoClose: 2000,
    });
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
      <ScrollArea mt={10} h={keys === undefined ? 0 : 190}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "sm", sm: "lg" }}
          justify={{ base: "center" }}
          align={{ base: "center" }}
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
          color={keys === undefined ? "blue" : "green"}
          leftIcon={keys === undefined ? "" : <IconCircleCheck />}
          mt="md"
          radius="md"
          onClick={() => scanChip()}
        >
          {keys === undefined ? "Scan Chip" : "Re-scan Chip"}
        </Button>
      </Center>
      <Text weight={500} fz="xl">
        Mint
      </Text>
      <Center>
        <Group>
          <Button
            disabled={keys === undefined}
            color={signature === undefined ? "blue" : "green"}
            leftIcon={signature === undefined ? "" : <IconCircleCheck />}
            variant="light"
            mt="md"
            radius="md"
            onClick={isConnected ? signChip : openConnectModal}
          >
            {signature === undefined ? "Check Validity" : "Re-check Validity"}
          </Button>
          <Button
            disabled={signature === undefined}
            variant="light"
            color="blue"
            mt="md"
            radius="md"
            onClick={mint}
          >
            Mint
          </Button>
        </Group>
      </Center>
    </>
  );
};

export default Home;
