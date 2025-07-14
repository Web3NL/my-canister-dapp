import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter(),
    alias: {
      $declarations: '../declarations',
      '@web3nl/my-canister-dashboard': '../my-canister-dapp-js/my-canister-dashboard-js/dist',
    },
  },
};
