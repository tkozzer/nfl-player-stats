<template>
  <Teleport to="body">
    <div v-if="modelValue" class="presets-modal-overlay" @click="closeModal">
      <div class="presets-modal-content" @click.stop>
        <div class="modal-header">
          <h2>Manage Default Presets</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="save-preset">
            <input 
              v-model="presetName" 
              placeholder="Enter preset name"
              class="preset-input"
            >
          </div>

          <div class="column-selection">
            <h3>Select Columns for Preset</h3>
            <div class="column-list">
              <label v-for="header in allHeaders" :key="header.key" class="column-item" :title="header.tooltip || header.label">
                <input
                  type="checkbox"
                  :checked="selectedPresetColumns.includes(header.key)"
                  @change="toggleColumn(header.key)"
                >
                <span>{{ header.isCustom ? (header.displayName || header.label) : header.key }}</span>
              </label>
            </div>
            <div class="selection-actions">
              <button @click="selectAllColumns" class="action-button">Select All</button>
              <button @click="deselectAllColumns" class="action-button">Deselect All</button>
              <button 
                @click="savePreset" 
                :disabled="!canSavePreset"
                class="save-button"
              >
                Save as New Preset
              </button>
            </div>
          </div>

          <div class="saved-presets">
            <h3>Saved Presets</h3>
            <div v-if="savedPresets.length === 0" class="no-presets">
              No saved presets
            </div>
            <div v-else class="presets-list">
              <div 
                v-for="preset in savedPresets" 
                :key="preset.name" 
                class="preset-item"
              >
                <div class="preset-info">
                  <span class="preset-name">{{ preset.name }}</span>
                  <div class="preset-columns-list">
                    <span 
                      v-for="column in preset.columns.slice(0, 3)" 
                      :key="column" 
                      class="preset-column-tag"
                      :title="getColumnLabel(column)"
                    >
                      {{ column }}
                    </span>
                    <span 
                      v-if="preset.columns.length > 3" 
                      class="more-columns"
                      :title="preset.columns.slice(3).map(col => getColumnLabel(col)).join(', ')"
                    >
                      +{{ preset.columns.length - 3 }} more
                    </span>
                  </div>
                </div>
                <div class="preset-actions">
                  <button 
                    @click="loadPreset(preset)"
                    class="load-button"
                    title="Load this preset"
                  >
                    Load
                  </button>
                  <button 
                    @click="deletePreset(preset.name)"
                    class="delete-button"
                    title="Delete this preset"
                  >
                    Delete
                  </button>
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
  name: 'DefaultPresetsModal',
  props: {
    modelValue: Boolean,
    currentColumns: {
      type: Array,
      required: true
    },
    allHeaders: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue', 'load-preset'],
  setup(props, { emit }) {
    const { lockScroll, unlockScroll } = useScrollLock()
    const presetName = ref('')
    const savedPresets = ref([])
    const selectedPresetColumns = ref([...props.currentColumns])

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
      // Reset the form
      presetName.value = ''
      selectedPresetColumns.value = [...props.currentColumns]
    }

    const toggleColumn = (key) => {
      const index = selectedPresetColumns.value.indexOf(key)
      if (index === -1) {
        selectedPresetColumns.value.push(key)
      } else {
        selectedPresetColumns.value.splice(index, 1)
      }
    }

    const selectAllColumns = () => {
      selectedPresetColumns.value = props.allHeaders.map(h => h.key)
    }

    const deselectAllColumns = () => {
      selectedPresetColumns.value = []
    }

    const canSavePreset = computed(() => {
      return presetName.value.trim() !== '' && 
             selectedPresetColumns.value.length > 0 &&
             !savedPresets.value.some(p => p.name === presetName.value.trim())
    })

    const savePreset = () => {
      const newPreset = {
        name: presetName.value.trim(),
        columns: [...selectedPresetColumns.value]
      }

      savedPresets.value = [...savedPresets.value, newPreset]
      localStorage.setItem('columnPresets', JSON.stringify(savedPresets.value))
      presetName.value = ''
      selectedPresetColumns.value = [...props.currentColumns]
    }

    const loadPreset = (preset) => {
      emit('load-preset', preset.columns)
      closeModal()
    }

    const deletePreset = (presetName) => {
      savedPresets.value = savedPresets.value.filter(p => p.name !== presetName)
      localStorage.setItem('columnPresets', JSON.stringify(savedPresets.value))
    }

    // Get column label from key
    const getColumnLabel = (key) => {
      const header = props.allHeaders.find(h => h.key === key)
      return header ? (header.tooltip || header.label) : key
    }

    return {
      presetName,
      savedPresets,
      selectedPresetColumns,
      closeModal,
      savePreset,
      loadPreset,
      deletePreset,
      toggleColumn,
      selectAllColumns,
      deselectAllColumns,
      canSavePreset,
      getColumnLabel
    }
  }
}
</script>

<style scoped>
.presets-modal-overlay {
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

.presets-modal-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
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

.save-preset {
  margin-bottom: 1rem;
}

.preset-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.column-selection {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.column-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-primary);
}

.column-list::-webkit-scrollbar {
  width: 8px;
}

.column-list::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.column-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

.column-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-secondary);
}

.column-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
}

.column-item:hover {
  background: var(--header-hover);
}

.column-item input[type="checkbox"] {
  margin-right: 8px;
}

.selection-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background: var(--header-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.save-button {
  padding: 0.5rem 1rem;
  background: var(--link-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.saved-presets {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.no-presets {
  color: var(--text-secondary);
  text-align: center;
  padding: 1rem;
}

.presets-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 4px;
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

.preset-actions {
  display: flex;
  gap: 0.5rem;
}

.load-button,
.delete-button {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.load-button {
  background: var(--link-color);
  color: white;
  border: none;
}

.delete-button {
  background: var(--header-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.delete-button:hover {
  color: #ff4444;
}
</style> 