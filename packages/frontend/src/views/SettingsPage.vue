<template>
  <div class="d-flex flex-column mt-4 container">
    <Loader v-if="isLoadingSettings || isLoadingConstants" msg="Загрузка..." />

    <div v-else>
      <form @submit="onSubmitSettings" @reset="onResetSettings" class="settings">
        <h3>Настройки</h3>

        <div
          class="input-group input-group mt-2"
          v-for="settingKey in Object.keys(data.settings)"
          :key="settingKey"
        >
          <span
            class="input-group-text"
            id="inputGroup-sizing"
            v-tooltip.top-center="data.settings[settingKey].description"
          >
            {{ data.settings[settingKey].name }}
          </span>
          <input
            v-if="settingKey !== 'sorting'"
            :type="SETTINGS_NUMBERS_VALUE.includes(settingKey) ? 'number' : 'text'"
            :max="
              (settingKey === 'productsCountPerPage' &&
                data.constants.PRODUCTS_PER_PAGE_MAX?.value) ||
              (settingKey === 'includePrevProducts' && 1)
            "
            :min="settingKey === 'includePrevProducts' && 0"
            class="form-control"
            placeholder="Все"
            v-model="data.settings[settingKey].value"
          />
          <select v-else class="form-select" v-model="data.settings[settingKey].value">
            <option v-for="sortingType in data.constants.SORTING_TYPES.value" :key="sortingType">
              {{ sortingType }}
            </option>
          </select>
        </div>

        <div class="mt-3 d-flex">
          <button class="btn btn-success" type="submit">Сохранить</button>
          <button class="btn btn-danger ms-2" type="reset">Сброс</button>
        </div>
      </form>

      <form @submit="onSubmitConstants" @reset="onResetConstants" class="constants mt-4 pb-4">
        <h3>Константы</h3>

        <div
          class="input-group input-group mt-2"
          v-for="constantKey in Object.keys(data.constants)"
          :key="constantKey"
        >
          <span
            class="input-group-text"
            id="inputGroup-sizing"
            v-tooltip.top-center="data.constants[constantKey].description"
          >
            {{ data.constants[constantKey].name }}
          </span>
          <input
            v-if="constantKey !== 'SORTING_TYPES'"
            :type="typeof data.constants[constantKey].value === 'number' ? 'number' : 'text'"
            class="form-control"
            v-model="data.constants[constantKey].value"
          />
          <input v-else type="text" class="form-control" v-model="sortingTypes" />
        </div>

        <div class="mt-3 d-flex">
          <button class="btn btn-success" type="submit">Сохранить</button>
          <button class="btn btn-danger ms-2" type="reset">Сброс</button>
        </div>
      </form>
    </div>
    <Toast @closeToast="closeToast" :message="toastMessage" />
  </div>
</template>

<script setup>
import useFetching from '@/hooks/useFetching'
import WbParserService from '@/services/wb'
import Loader from '@/components/Loader'

import { reactive, computed } from 'vue'
import Toast from '@/components/Toast.vue'
import useToast from '@/hooks/useToast'

const [showToast, closeToast, toastMessage] = useToast()

const SETTINGS_NUMBERS_VALUE = [
  'initialIterationPage',
  'pagesHandlingCount',
  'productsCountPerPage',
  'includePrevProducts',
]

const sortingTypes = computed({
  get() {
    return data.constants.SORTING_TYPES.value.join(',')
  },
  set(val) {
    data.constants.SORTING_TYPES.value = val.split(',')
  },
})
/**
 * @import('../services/wb.js')
 * @type {UnwrapNestedRefs<{settings: Settings, constants: Constants}>}
 */
const data = reactive({
  settings: {},
  constants: {},
})

const fetchSettings = async () => {
  data.settings = await WbParserService.getSettings()
}
const fetchConstants = async () => {
  data.constants = await WbParserService.getConstants()
}

const onSubmitSettings = async e => {
  e.preventDefault()

  try {
    await WbParserService.setSettings(data.settings)
    showToast('Настройки установлены')
  } catch (e) {
    showToast(e.message)
  }
}
const onSubmitConstants = async e => {
  e.preventDefault()

  try {
    await WbParserService.setConstants(data.constants)
    showToast('Константы установлены')
  } catch (e) {
    showToast(e.message)
  }
}

const onResetSettings = async e => {
  e.preventDefault()

  try {
    data.settings = await WbParserService.restoreSettings()
    showToast('Настройки восстановлены')
  } catch (e) {
    showToast('Ошибка восстановления настроек')
  }
}
const onResetConstants = async e => {
  e.preventDefault()

  try {
    data.constants = await WbParserService.restoreConstants()
    showToast('Константы восстановлены')
  } catch (e) {
    showToast('Ошибка восстановления констант')
  }
}
const [getSettings, isLoadingSettings] = useFetching(fetchSettings)
const [getConstants, isLoadingConstants] = useFetching(fetchConstants)

try {
  getSettings()
  getConstants()
} catch (e) {
  showToast(e.message)
}
</script>

<style lang="scss">
.tooltip {
  z-index: 10000;

  display: block !important;

  max-width: 250px;

  .tooltip-inner {
    padding: 4px 8px;

    line-height: 1.5;
    color: white;

    opacity: 1;
    background: black;
    border-radius: 4px;
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;

    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;

    transition: opacity 0.15s;
  }
}
</style>
