import { AppShell, Header, Flex, Card, Container, Anchor } from "@mantine/core";
import { ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const router = useRouter();
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
          <Anchor
            component={Link}
            href="/mint"
            style={{ textDecoration: "none" }}
            c={router.asPath === "/mint" ? "dimmed" : ""}
          >
            Mint
          </Anchor>
          <Anchor
            component={Link}
            href="/seed"
            style={{ paddingLeft: "5px", textDecoration: "none" }}
            c={router.asPath === "/seed" ? "dimmed" : ""}
          >
            Seed Chip
          </Anchor>
          {children}
        </Card>
      </Container>
    </AppShell>
  );
};

export default Layout;
