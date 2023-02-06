import { ref } from 'vue'

const useToast = () => {
  const toastMessage = ref('')

  const showToast = (message = null, time = 4000) => {
    if (typeof message !== 'string') throw Error('Сообщение ожидает строку')

    toastMessage.value = message

    setTimeout(() => {
      toastMessage.value = ''
    }, time)
  }

  const closeToast = () => {
    toastMessage.value = ''
  }

  return [showToast, closeToast, toastMessage]
}

export default useToast
