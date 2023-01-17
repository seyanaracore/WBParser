import { ref } from 'vue'

/**
 * @returns object with fetch func, loading state and error state
 */

const useFetching = callback => {
  const isLoading = ref(false)
  const isError = ref(null)

  const fetching = async () => {
    try {
      isError.value = null
      isLoading.value = true
      return await callback()
    } catch (e) {
      console.error(e)

      isError.value = e.message
      return e // ability to handle an error outside the hook
    } finally {
      isLoading.value = false
    }
  }

  return [fetching, isLoading, isError]
}

export default useFetching
