
export default function getConfig() {
  return {
    publicRuntimeConfig: {
      CHAIN_ID: "80001",
      GRAPH_PROVIDER: "https://api.thegraph.com/subgraphs/name/valist-io/valistmumbai",
      IPFS_GATEWAY: "https://gateway.valist.io",
      IPFS_HOST: "https://pin.valist.io",
      MAGIC_PUBKEY: "pk_live_631BA2340BB9ACD8",
      METATX_ENABLED: "true",
      WEB3_PROVIDER: "https://rpc.valist.io/mumbai",
    },
  };
};