<template>
	<span class="loader">
		<span class="label">{{ msg }}</span>
		<b-spinner />
	</span>
</template>

<script setup>
defineProps({
	msg: {
		type: String,
		required: false,
		default: 'Загрузка'
	}
})
</script>

<style scoped>
.loader {
	display: inline-flex;
	align-items: center;
}
.label {
	margin-right: 6px;
}
</style>