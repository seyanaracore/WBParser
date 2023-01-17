<template lang="">
	<div>
		<b-form @submit="onSubmit" @reset="onReset" class="settings">
			<b-form-group
        :id="'input-group-' + idx"
				class="param"
        :label-for="'input-' + idx"
        :label="settingKey + ':'"
				v-for="(settingKey, idx) in Object.keys(data.settings)"
				:key="idx"
      >
        <b-form-input
          :id="'input-' + idx"
          v-model="data.settings[settingKey]"
        ></b-form-input>
      </b-form-group>
		</b-form>
		<!-- <Loader /> -->
	</div>
</template>

<script setup>
import useFetching from '@/hooks/useFetching'
import WbParserService from '@/services/wb'
import Loader from '@/components/Loader'

import { reactive } from 'vue'

const data = reactive({
	settings: null
})

const fetchSettings = async () => {
	const settings = await WbParserService.getSettings()

	data.settings = settings
}

const [getSettings, isLoading, isError] = useFetching(fetchSettings)

getSettings()
</script>

<style>
.param {
	display: flex;
}
</style>