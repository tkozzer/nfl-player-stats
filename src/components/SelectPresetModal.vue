<template>
  <Teleport to="body">
    <div v-if="modelValue" class="select-preset-overlay" @click="closeModal">
      <div class="select-preset-content" @click.stop>
        <div class="modal-header">
          <h2>Select Preset</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="!hasPresets" class="no-presets">
            <p>No presets found. Create a preset to quickly switch between different column layouts.</p>
            <button @click="openPresetsManager" class="create-preset-button">
              Create Preset
            </button>
          </div>
          <div v-else class="presets-list">
            <div 
              v-for="preset in savedPresets" 
              :key="preset.name" 
              class="preset-item"
              @click="loadPreset(preset)"
            >
              <div class="preset-info">
                <span class="preset-name">{{ preset.name }}</span>
                <div class="preset-columns-list">
                  <span 
                    v-for="column in preset.columns.slice(0, 3)" 
                    :key="column" 
                    class="preset-column-tag"
                  >
                    {{ column }}
                  </span>
                  <span v-if="preset.columns.length > 3" class="more-columns">
                    +{{ preset.columns.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useScrollLock } from '../composables/useScrollLock'

export default {
  name: 'SelectPresetModal',
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue', 'load-preset', 'manage-presets'],
  setup(props, { emit }) {
    const { lockScroll, unlockScroll } = useScrollLock()
    const savedPresets = ref([])

    const hasPresets = computed(() => savedPresets.value.length > 0)

    // Load saved presets from localStorage on mount
    onMounted(() => {
      loadPresets()
    })

    // Handle body scroll lock
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        lockScroll()
        loadPresets() // Reload presets when modal opens
      } else {
        unlockScroll()
      }
    })

    const loadPresets = () => {
      const stored = localStorage.getItem('columnPresets')
      if (stored) {
        savedPresets.value = JSON.parse(stored)
      }
    }

    // Cleanup when component is unmounted
    onUnmounted(() => {
      unlockScroll()
    })

    const closeModal = () => {
      emit('update:modelValue', false)
    }

    const loadPreset = (preset) => {
      emit('load-preset', preset.columns)
      closeModal()
    }

    const openPresetsManager = () => {
      closeModal()
      emit('manage-presets')
    }

    return {
      savedPresets,
      hasPresets,
      closeModal,
      loadPreset,
      openPresetsManager
    }
  }
}
</script>

<style scoped>
.select-preset-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.select-preset-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-primary);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-secondary);
}

.no-presets {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.create-preset-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--link-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-preset-button:hover {
  background: var(--link-hover-color);
}

.presets-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-item {
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.preset-item:hover {
  background: var(--header-hover);
}

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-name {
  font-weight: 500;
  color: var(--text-primary);
}

.preset-columns-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  max-width: 100%;
  overflow: hidden;
}

.preset-column-tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.more-columns {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.25rem 0;
}
</style> 