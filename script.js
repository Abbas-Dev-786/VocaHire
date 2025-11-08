import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
  apiKey: "",
  entitySecret: "",
});

async function main() {
  // e702a96b-b321-5d04-b234-6983f3687c92
  //   const ws = await circleDeveloperSdk.createWalletSet({
  //     name: "Entity WalletSet A",
  //   });

  //   console.log("Created wallet set:", ws);

  const response = await circleDeveloperSdk.createWallets({
    accountType: "SCA",
    blockchains: ["ARC-TESTNET"],
    count: 1,
    walletSetId: "e702a96b-b321-5d04-b234-6983f3687c92",
  });

  console.log("Created wallets:", response.data.createdWallets.wallets[0]);
}

/*
{
      id: 'dec2b500-14ca-54a7-a52b-3f30de1ba476',
      state: 'LIVE',
      walletSetId: 'e702a96b-b321-5d04-b234-6983f3687c92',
      custodyType: 'DEVELOPER',
      address: '0xd8f3c0dc8e5bcff7152d3475a0b1ac7cf42a38b4',
      blockchain: 'ARC-TESTNET',
      accountType: 'SCA',
      updateDate: '2025-11-08T07:11:14Z',
      createDate: '2025-11-08T07:11:14Z',
      scaCore: 'circle_6900_singleowner_v3'
    }
*/

main();
