<template>
  <!-- Pinned side mascots — home pages only (gated in HubApp). They stay
       at the app root before the z-10 content column so content keeps
       painting above them; both face inward. -->
  <img
    src="/maskotkiri.png"
    alt=""
    aria-hidden="true"
    class="pointer-events-none fixed bottom-0 left-0 z-0 hidden max-h-[70vh] max-w-[16vw] w-auto -scale-x-100 select-none object-contain object-bottom xl:block"
  />
  <img
    src="/maskotkanan.png"
    alt=""
    aria-hidden="true"
    class="pointer-events-none fixed bottom-0 right-0 z-0 hidden max-h-[70vh] max-w-[16vw] w-auto select-none object-contain object-bottom xl:block"
  />
</template>
