import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import Layout from "./layout";
import {
  WagmiConfig,
  configureChains,
  createConfig,
  mainnet,
  sepolia,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, sepolia],
    [publicProvider()],
  );

  const { connectors } = getDefaultWallets({
    appName: "Paradigma NFT",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECTID as string,
    chains,
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
  });

  return (
    <>
      <Head>
        <title>PBT</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <ColorSchemeProvider
        colorScheme={"dark"}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme }}
        >
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains}>
              <Layout>
                <Notifications limit={1} />
                <Component {...pageProps} />
              </Layout>
            </RainbowKitProvider>
          </WagmiConfig>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
