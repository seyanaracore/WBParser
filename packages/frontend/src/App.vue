<template>
  <div id="app">
    <b-nav tabs small>
      <b-nav-item :active="page" @click="page=true">Main</b-nav-item>
      <b-nav-item :active="!page" @click="page=false">Settings</b-nav-item>
    </b-nav>
    <main>
      <KeepAlive>
        <MainPage v-if="page"/>
        <SettingsPage v-else />
      </KeepAlive>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MainPage from "./views/MainPage.vue"
import SettingsPage from "./views/SettingsPage.vue"

const page = ref(true)
</script>

<style>

</style>
