import { AppShell, Header, Flex } from "@mantine/core";
import { ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
      {children}
    </AppShell>
  );
};

export default Layout;
