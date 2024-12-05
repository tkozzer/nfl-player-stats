import { ref } from 'vue'

const lockCount = ref(0)
let originalPaddingRight = ''
let scrollbarWidth = 0

export function useScrollLock() {
    const lockScroll = () => {
        lockCount.value++

        if (lockCount.value === 1) {
            // Only apply scroll lock if this is the first lock
            scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
            originalPaddingRight = document.body.style.paddingRight

            document.documentElement.style.overflow = 'hidden'
            document.body.style.overflow = 'hidden'
            document.body.style.paddingRight = `${scrollbarWidth}px`
        }
    }

    const unlockScroll = () => {
        if (lockCount.value > 0) {
            lockCount.value--

            if (lockCount.value === 0) {
                // Only remove scroll lock if this is the last unlock
                document.documentElement.style.overflow = ''
                document.body.style.overflow = ''
                document.body.style.paddingRight = originalPaddingRight
            }
        }
    }

    return {
        lockScroll,
        unlockScroll
    }
} 