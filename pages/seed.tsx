import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Text,
  Flex,
  ActionIcon,
} from "@mantine/core";
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
      <Flex key={index} direction={{ base: "row" }} align="center" wrap="wrap">
        <TextInput
          withAsterisk
          placeholder="0x"
          style={{ marginTop: "5px", width: "1200px" }}
          styles={{
            rightSection: {
              width: "64px",
              justifyContent: "end",
              marginRight: "5px",
            },
          }}
          rightSection={
            <>
              {form.values.chipAddresses.length - index === 1 && (
                <ActionIcon
                  color="blue"
                  onClick={() =>
                    form.insertListItem("chipAddresses", { chipAddress: "" })
                  }
                >
                  <IconPlus size={15} />
                </ActionIcon>
              )}
              {form.values.chipAddresses.length !== 1 && (
                <ActionIcon
                  color="red"
                  onClick={() => form.removeListItem("chipAddresses", index)}
                >
                  <IconTrash size={15} />
                </ActionIcon>
              )}
            </>
          }
          {...form.getInputProps(`chipAddresses.${index}.chipAddress`)}
        />
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
          <Button color="blue" type="submit">
            Submit
          </Button>
        </Group>
      </form>
    </>
  );
}
