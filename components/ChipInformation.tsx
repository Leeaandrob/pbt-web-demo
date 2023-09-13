import styles from "../styles/ChipInformation.module.css";
import { Card, HoverCard, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function ChipInformation({
  type,
  publicKey,
  address,
}: {
  type: string;
  publicKey: string;
  address: string;
}) {
  function copy(type: "publicKey" | "address", value: string) {
    const copyType = type === "publicKey" ? "Public key" : "Address";
    navigator.clipboard.writeText(value);
    notifications.show({
      title: "Copied",
      message: `${copyType} successfully copied`,
    });
    notifications.cleanQueue();
  }
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" w={300} withBorder>
        <Text weight={500} fz="lg" className="pointer">
          {type}
        </Text>
        <Text weight={500}>Public key: </Text>
        <HoverCard width={120} shadow="md" position="bottom">
          <HoverCard.Target>
            <Text
              truncate
              className={styles.pointer}
              onClick={() => copy("publicKey", publicKey)}
            >
              {publicKey}
            </Text>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">Click to copy</Text>
          </HoverCard.Dropdown>
        </HoverCard>

        <Text weight={500}>Address: </Text>
        <HoverCard width={120} shadow="md" position="bottom">
          <HoverCard.Target>
            <Text
              truncate
              className={styles.pointer}
              onClick={() => copy("address", address)}
            >
              {address}
            </Text>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">Click to copy</Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Card>
    </>
  );
}
