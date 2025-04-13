<script setup>
import Header from '@/components/layout/Header.vue';
</script>

<template>
  <Header />
  <router-view></router-view>
</template>

<style lang="scss">
@import '@/assets/scss/main.scss';

#app {
  padding-top: 60px; // Header için boşluk bırakıyoruz
}
</style>

<!-- Stiller main.css'de tanımlanmıştır -->
