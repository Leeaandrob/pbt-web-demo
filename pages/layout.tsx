import { AppShell, Header, Flex, Card, Container } from "@mantine/core";
import { ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Flex
            gap="md"
            justify="flex-end"
            align="center"
            direction="row"
            wrap="wrap"
          >
            <ConnectButton
              accountStatus={"address"}
              chainStatus={"none"}
              showBalance={false}
            />
          </Flex>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <Container p={0} size={600}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Link href="/mint">Mint</Link>
          <Link href="/seed" style={{ paddingLeft: "5px" }}>
            Seed Chip
          </Link>
          {children}
        </Card>
      </Container>
    </AppShell>
  );
};

export default Layout;
