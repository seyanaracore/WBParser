<template>
  <span class="loader">
    <span class="label">{{ msg }}</span>
    <div class="spinner-border" role="status">
      <span class="visually-hidden">{{ msg }}</span>
    </div>
  </span>
</template>

<script setup>
defineProps({
  msg: {
    type: String,
    required: false,
    default: 'Загрузка',
  },
})
</script>

<style scoped>
.loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.label {
  margin-right: 6px;
}
</style>
