## About the Project

I received a couple of [arx's HaLo Chips](https://arx.org/) back in January to conduct a research how actually a physical backed tokens can be done as [EIP-5791](https://eips.ethereum.org/EIPS/eip-5791) was just dropped 3 months before.

I don't hear much about the project and so I decided to contribute a little to the project. This project is highly inspired by [PBT](https://github.com/chiru-labs/PBT) itself.

The flow to mint the token itself is actually pretty simple.

1. Seed the chip
2. Generate signature
3. Mint
4. ???
5. Profit

This repository is intended only as a demo, the code (both the contract and the frontend) need a lot of adjustment before it is ready to ship to the production.

## Getting Started

### Environment Variables Set Up

There are two ways to set up the environment variables. As you may see, the repository is a combination of Next.js and Foundry project. You can choose whether you'd run only the Next.js, smart contract (with Foundry), or both.

#### Next.js

The essential environment variables for Next.js project are `NEXT_PUBLIC_CONTRACT_ADDRESS` for deployed contract address and `NEXT_PUBLIC_WALLET_CONNECT_PROJECTID`. It should have `NEXT_PUBLIC_` prefix otherwise it won't accessible to the browser.
You can use your own contract address or or the one I deployed on Sepolia at `0x3b09Ba02807d628533ca39e491bCbcFf264ba5C8`.

#### Foundry

On the contrary, the environment variables for the smart contract is pretty straightforward. There's `PRIVATE_KEY` to deploy the smart contract, `ETHERSCAN_API_KEY` to verify the smart contract on Etherscan, and `SEPOLIA_RPC_URL`.

Put them all in `.env` file and you're good.

### Running the Website

After installing the dependencies with `npm install`, you can run the development server with:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Testings

As of now there's no test cases for the Next.js, but you can test the smart contract with `forge test`.

## Contributing

Contributing is very welcome. You can fork the repository, give the changes on your end, and open a pull request.
