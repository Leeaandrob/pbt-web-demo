import { TextInput, Checkbox, Button, Group, Text, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";

export default function Seed() {
  const form = useForm({
    initialValues: {
      chipAddresses: [{ chipAddress: "" }],
    },
  });

  const fields = form.values.chipAddresses.map((_, index) => (
    <>
      <Flex
        key={index}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: "sm", sm: "lg" }}
        justify={{ sm: "left" }}
        align="center"
      >
        <TextInput
          withAsterisk
          placeholder="0x"
          style={{ marginTop: "5px", width: "1200px" }}
          {...form.getInputProps(`chipAddresses.${index}.chipAddress`)}
        />
        {form.values.chipAddresses.length - index === 1 && (
          <Button
            onClick={() =>
              form.insertListItem("chipAddresses", { chipAddress: "" })
            }
          >
            <IconPlus size={15} />
          </Button>
        )}
        {form.values.chipAddresses.length !== 1 && (
          <Button
            color="red"
            onClick={() => form.removeListItem("chipAddresses", index)}
          >
            <IconTrash size={15} />
          </Button>
        )}
      </Flex>
    </>
  ));

  return (
    <>
      <Text fz="xl" fw={500} style={{ marginBottom: "15px" }}>
        Seed Chip Addresses
      </Text>
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        {fields}
        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </>
  );
}
