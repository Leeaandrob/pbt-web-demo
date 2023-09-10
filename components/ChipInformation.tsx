import { Card, HoverCard, Popover, Text } from "@mantine/core";

export default function ChipInformation({
  type,
  publicKey,
  address,
}: {
  type: string;
  publicKey: string;
  address: string;
}) {
  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" w={300} withBorder>
        <Text weight={500} fz="lg">
          {type}
        </Text>
        <Text weight={500}>Public key: </Text>
        <HoverCard width={120} shadow="md" position="bottom">
          <HoverCard.Target>
            <Text truncate>{publicKey}</Text>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">Click to copy</Text>
          </HoverCard.Dropdown>
        </HoverCard>
        <Text weight={500}>Address: </Text>
        <Text truncate>{address}</Text>
      </Card>
    </>
  );
}
