<script lang="ts">
  import { BusyScreen, Toasts } from '@dfinity/gix-components';
</script>

<BusyScreen />
<Toasts position="top" />

<slot />

<style lang="scss" global>
  @import '../../../../node_modules/@dfinity/gix-components/dist/styles/global.scss';
</style>
