<template>
  <div id="app">
    <nav class="nav small nav-tabs">
      <a class="nav-link" :class="{active: page}" href="#" @click="page=true">Main</a>
      <a class="nav-link" :class="{active: !page}" href="#" @click="page=false">Settings</a>
    </nav>

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
