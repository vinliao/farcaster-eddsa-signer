import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import * as ed from "@noble/ed25519";
import { useAccount, useSignMessage } from "wagmi";
import { UserRegistry } from "@standard-crypto/farcaster-js";
import { InfuraProvider } from "@ethersproject/providers";
import { useState, useEffect } from "react";

const userRegistry = new UserRegistry(
  new InfuraProvider("goerli", process.env.INFURA_API_KEY)
);

const Home: NextPage = () => {
  const edPrivateKey = ed.utils.randomPrivateKey();
  const [signerAuthorizationMessage, setSignerAuthorizationMessage] = useState<
    SignerAuthorizationMessageInterface | undefined
  >(undefined);
  interface SignerAuthorizationMessageInterface {
    fid: number;
    active: boolean;
    authorizedPublicKey: string;
    schema: string;
  }

  const { data, isSuccess, signMessage } = useSignMessage();

  useEffect(() => {
    if (isSuccess && data) {
      console.log({ message: signerAuthorizationMessage, signature: data });
      console.log(
        `DONTUSE_DEMO_EdDSA_PRIVATE_KEY: ${ed.utils.bytesToHex(edPrivateKey)}`
      );
      console.log("Note: fid value 0 means address has no fid.");
    }
  }, [isSuccess]);

  useAccount({
    async onConnect({ address, connector, isReconnected }) {
      console.log("Connected", { address, connector, isReconnected });

      if (typeof address === "string") {
        const fid = await userRegistry.getFarcasterID(address);
        const edPublicKey = await ed.getPublicKey(edPrivateKey);

        const dummyVar = {
          fid: fid.toNumber(),
          active: true,
          authorizedPublicKey: ed.utils.bytesToHex(edPublicKey),
          schema: "farcaster.xyz/schemas/v1/signer",
        };

        setSignerAuthorizationMessage(dummyVar);

        signMessage({ message: JSON.stringify(dummyVar) });
      }
    },
  });

  return (
    <div className="max-w-md mx-auto text-xl py-5 flex flex-col space-y-4 px-1">
      <p className="font-[900]">Farcaster EdDSA Signer</p>
      <span>
        {" "}
        A small demo React app to generate an EdDSA signer, which can be used to
        sign casts in the Farcaster v2 protocol.
      </span>
      <span> Steps:</span>
      <span>
        {" "}
        1. Coinbase Wallet, Rainbow Wallet, Trust Wallet, pick any of these
        mobile wallets and load your Farcaster seed phrase in it (the seed
        phrase Farcaster provided when registering)
      </span>
      <span> 2. Connect the wallet, scan QR</span>
      <span> 3. A message will appear on your mobile screen, click sign</span>
      <span> 4. Open browser console to see details</span>
      <ConnectButton />
      <span className="text-base">
        Technical details:{" "}
        <a
          className="underline break-all"
          href="https://github.com/farcasterxyz/protocol#45-signer-authorizations"
        >
          https://github.com/farcasterxyz/protocol#45-signer-authorizations
        </a>
      </span>
    </div>
  );
};

export default Home;
