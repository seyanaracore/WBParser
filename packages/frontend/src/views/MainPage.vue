<template>
  <main class="container mt-4">
    <h3>Главная</h3>

    <div class="mt-3 bd-example">
      <button v-if="!isParsing" class="btn btn-primary" @click="startParseHandler">
        <Loader v-if="parseStarting" msg="Запуск..." />
        <span v-else>Запустить парсинг</span>
      </button>
      <button v-else class="btn btn-primary" @click="stopParsingHandler">
        <Loader v-if="parseStopping" msg="Остановка..." />
        <span v-else>Остановить парсинг</span>
      </button>
    </div>

    <table v-if="logs.length" class="table mt-5">
      <thead>
        <tr>
          <th scope="col">Логи</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, idx) in logs" :key="log.value + idx">
          <td :class="{ 'text-danger': !log.type, 'text-secondary': !!log.type }">
            {{ log.value }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <hr />
      <p>Здесь будут логи</p>
    </div>

    <Toast :message="toastMessage" @closeToast="closeToast" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import useFetching from '@/hooks/useFetching'
import WbParserService from '@/services/wb'

import Loader from '@/components/Loader.vue'
import Toast from '@/components/Toast.vue'
import useToast from '@/hooks/useToast'

const logs = ref([])
const isParsing = ref(false)
const ws = ref(null)
const [startParse, parseStarting] = useFetching(WbParserService.startParse)
const [stopParsing, parseStopping] = useFetching(WbParserService.stopParse)
const [showToast, closeToast, toastMessage] = useToast()

const connectLogsSocket = async () => {
  ws.value = await WbParserService.connectLogsSocket()

  ws.value.on('connect', () => {
    showToast('Сокет установлен')
  })

  ws.value.on('log', payload => {
    logs.value.unshift(payload)
  })
  ws.value.on('finish', data => {
    showToast('Finish')
    setTimeout(() => {
      stopParsingHandler()
    }, 200)
  })

  ws.value.on('close', () => {
    showToast('Сокет закрыт')
  })

  ws.value.on('error', () => {
    setTimeout(() => {
      ws.value.close()
    }, 100)
  })
}

const startParseHandler = async () => {
  await startParse()
  isParsing.value = true
  if (logs.value.length) logs.value = []
  if (!ws.value) connectLogsSocket()
}

const stopParsingHandler = async () => {
  if (ws.value) {
    await ws.value.close()
    ws.value = null
  }
  await stopParsing()
  isParsing.value = false
}

WbParserService.isParsing().then(res => {
  isParsing.value = res
  if (res) connectLogsSocket()
})
</script>
