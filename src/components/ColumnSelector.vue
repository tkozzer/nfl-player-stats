<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Customize Columns</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="column-section">
            <div class="section-header" @click="toggleAvailableColumns">
              <h3>Available Columns</h3>
              <button class="toggle-button" :class="{ 'is-expanded': showAvailableColumns }">
                {{ showAvailableColumns ? '▼' : '▶' }}
              </button>
            </div>
            <div v-show="showAvailableColumns">
              <div class="column-list">
                <label v-for="header in allHeaders" :key="header.key" class="column-item" :title="header.tooltip || header.label">
                  <input
                    type="checkbox"
                    :checked="selectedColumns.includes(header.key)"
                    @change="toggleColumn(header.key)"
                  >
                  <span>{{ header.isCustom ? (header.displayName || header.label) : header.key }}</span>
                  <div v-if="isCustomColumn(header.key)" class="custom-column-actions">
                    <button 
                      class="edit-custom" 
                      @click.stop="editCustomColumn(header.key)"
                      title="Edit custom column">
                      ✎
                    </button>
                    <button 
                      class="delete-custom" 
                      @click.stop="deleteCustomColumn(header.key)"
                      title="Delete custom column">
                      ×
                    </button>
                  </div>
                </label>
              </div>
              <div class="column-actions">
                <button @click="selectAll">Select All</button>
                <button @click="deselectAll">Deselect All</button>
                <button @click="resetToDefault">Reset to Default</button>
                <button 
                  @click="showSelectPresetModal = true"
                  @contextmenu.prevent="showPresetsModal = true"
                >Select Preset</button>
              </div>
            </div>
          </div>

          <div class="custom-column-creator">
            <div class="section-header" @click="toggleCustomColumn">
              <h3>Create Custom Column</h3>
              <button class="toggle-button" :class="{ 'is-expanded': showCustomColumn }">
                {{ showCustomColumn ? '▼' : '▶' }}
              </button>
            </div>
            <div v-show="showCustomColumn" class="custom-column-form">
              <div class="form-row">
                <input 
                  v-model="newColumnName" 
                  placeholder="Column Name"
                  class="custom-input"
                >
                <select v-model="columnFormat" class="format-select">
                  <option value="decimal">Decimal (0.123)</option>
                  <option value="percent">Percentage (12.3%)</option>
                  <option value="rate">Rate (12.3)</option>
                </select>
              </div>
              <div class="form-row">
                <input 
                  :value="columnTooltip"
                  @input="handleTooltipChange"
                  placeholder="Tooltip (defaults to column name if empty)"
                  class="custom-input tooltip-input"
                >
              </div>
              <div class="expression-builder">
                <div class="expression-preview">
                  Expression: <span class="preview-text">{{ expressionPreview }}</span>
                  <div class="preview-result" v-if="previewValue !== null">
                    Preview: {{ formatValue(previewValue) }}
                  </div>
                </div>
                <div class="expression-controls">
                  <select v-model="selectedColumn" class="custom-select">
                    <option value="">Select Column</option>
                    <option v-for="header in numericHeaders" 
                            :key="header.key" 
                            :value="header.key">
                      {{ header.label }}
                    </option>
                  </select>
                  <div class="operator-buttons">
                    <button 
                      v-for="op in operators" 
                      :key="op.symbol"
                      @click="addOperator(op.symbol)"
                      class="operator-btn"
                      :title="op.description"
                    >
                      {{ op.symbol }}
                    </button>
                  </div>
                  <button @click="addOpenParenthesis" class="operator-btn">(</button>
                  <button @click="addCloseParenthesis" class="operator-btn">)</button>
                  <button @click="addSelectedColumn" class="add-btn" :disabled="!selectedColumn">
                    Add Column
                  </button>
                  <button @click="clearExpression" class="clear-btn">
                    Clear
                  </button>
                </div>
              </div>
              <div class="form-actions">
                <button 
                  @click="createCustomColumn" 
                  :disabled="!canCreateColumn"
                  class="create-button"
                >
                  {{ editingColumn ? 'Update Column' : 'Create Column' }}
                </button>
                <button 
                  @click="clearCustomColumnForm"
                  class="clear-form-button"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>

          <div class="filters-section">
            <div class="section-header" @click="toggleFilters">
              <h3>Column Filters</h3>
              <button class="toggle-button" :class="{ 'is-expanded': showFilters }">
                {{ showFilters ? '▼' : '▶' }}
              </button>
            </div>
            <div v-show="showFilters" class="section-content">
              <div class="filters-description">
                Set minimum values for columns to filter the data
              </div>
              <div class="filters-controls">
                <select v-model="selectedFilterColumn" class="filter-select">
                  <option value="">Select a column to filter</option>
                  <option 
                    v-for="header in availableFilterColumns" 
                    :key="header.key" 
                    :value="header">
                    {{ header.label }}
                  </option>
                </select>
                <button 
                  @click="addColumnFilter" 
                  :disabled="!selectedFilterColumn"
                  class="add-filter-btn">
                  Add Filter
                </button>
                <button 
                  @click="clearAllFilters" 
                  :disabled="!hasActiveFilters"
                  class="clear-filters-btn">
                  Clear All
                </button>
              </div>
              <div class="active-filters">
                <div 
                  v-for="column in activeFilterColumns" 
                  :key="column.key" 
                  class="filter-row">
                  <span class="filter-label">{{ column.label }}</span>
                  <template v-if="isTextColumn(column.key)">
                    <div class="multi-select-container">
                      <div 
                        v-for="value in getUniqueValues(column.key)" 
                        :key="value"
                        class="multi-select-option"
                        @click="handleMultiSelect(column.key, value)"
                      >
                        <span class="option-text">{{ value }}</span>
                        <span v-if="isValueSelected(column.key, value)" class="checkmark">✓</span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <input 
                      :type="getInputType(column)"
                      :step="getInputStep(column)"
                      :value="columnFilters[column.key]"
                      @input="updateFilter(column.key, $event.target.value)"
                      class="filter-input"
                      min="0"
                      :pattern="numericColumnTypes[column.key] === 'integer' ? '[0-9]*' : '[0-9]*[.]?[0-9]*'"
                      placeholder="Min value"
                    >
                  </template>
                  <button 
                    @click="removeFilter(column.key)"
                    class="remove-filter-btn"
                    title="Remove filter">
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="primary" @click="saveChanges">Save Changes</button>
        </div>
      </div>
    </div>
  </Teleport>
  <DefaultPresetsModal
    v-model="showPresetsModal"
    :current-columns="selectedColumns"
    :all-headers="allHeaders"
    @load-preset="loadPreset"
  />
  <SelectPresetModal
    v-model="showSelectPresetModal"
    @load-preset="loadPreset"
    @manage-presets="openPresetsManager"
  />
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import DefaultPresetsModal from './DefaultPresetsModal.vue'
import SelectPresetModal from './SelectPresetModal.vue'
import { useScrollLock } from '../composables/useScrollLock'
import { defaultVisibleColumnsByPosition } from '../config/tableHeaders'

export default {
  name: 'ColumnSelector',
  components: {
    DefaultPresetsModal,
    SelectPresetModal
  },
  props: {
    modelValue: Boolean,
    headers: {
      type: Array,
      required: true
    },
    initialSelection: {
      type: Array,
      required: true
    },
    customColumns: {
      type: Array,
      default: () => []
    },
    columnFilters: {
      type: Object,
      required: true
    },
    stats: {
      type: Array,
      default: () => []
    },
    isTextColumn: {
      type: Function,
      required: true
    },
    getUniqueValues: {
      type: Function,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue', 'save', 'custom-column-created', 'custom-column-deleted', 'custom-column-updated', 'filter-updated'],
  setup(props, { emit }) {
    const { lockScroll, unlockScroll } = useScrollLock()
    const selectedColumns = ref([...props.initialSelection])
    const newColumnName = ref('')
    const columnTooltip = ref('')
    const selectedColumn = ref('')
    const expression = ref([])
    const showFilters = ref(false)
    const columnFormat = ref('decimal')
    const selectedFilterColumn = ref('')
    const activeFilterColumns = ref([])
    const showCustomColumn = ref(false)
    const showPresetsModal = ref(false)
    const showSelectPresetModal = ref(false)
    const originalColumnState = ref(null)
    const editingColumn = ref(null)
    const showAvailableColumns = ref(true)

    // Watch for changes in initialSelection prop
    watch(() => props.initialSelection, (newSelection) => {
      selectedColumns.value = [...newSelection]
    })

    // Watch for modal opening to sync selected columns
    watch(() => props.modelValue, (isOpen) => {
      if (isOpen) {
        selectedColumns.value = [...props.initialSelection]
      }
    })

    const resetToDefault = () => {
      if (props.position && defaultVisibleColumnsByPosition[props.position]) {
        selectedColumns.value = [...defaultVisibleColumnsByPosition[props.position]]
      }
    }

    const operators = [
      { symbol: '+', description: 'Add' },
      { symbol: '-', description: 'Subtract' },
      { symbol: '*', description: 'Multiply' },
      { symbol: '/', description: 'Divide' }
    ]

    const numericHeaders = computed(() => {
      return props.headers.filter(header => {
        return !['Name (Team)'].includes(header.key)
      })
    })

    const allHeaders = computed(() => {
      return [...props.headers, ...props.customColumns]
    })

    const expressionPreview = computed(() => {
      return expression.value.join(' ') || 'No expression yet'
    })

    const areArraysEqual = (arr1, arr2) => {
      if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
      if (arr1.length !== arr2.length) return false;
      return arr1.every((val, index) => val === arr2[index]);
    };

    const editCustomColumn = (column) => {
      // Find the custom column
      const customCol = props.customColumns.find(col => col.key === column)
      if (customCol) {
        console.log('Starting edit of custom column:', {
          original: customCol,
          key: column
        })
        // Store original state
        originalColumnState.value = {
          label: customCol.displayName || customCol.label,
          tooltip: customCol.tooltip === null ? '' : (customCol.tooltip || ''),
          expression: [...customCol.expression],
          format: customCol.format || 'decimal'
        }
        console.log('Stored original state:', originalColumnState.value)
        
        // Set up edit mode
        newColumnName.value = customCol.displayName || customCol.label
        columnTooltip.value = customCol.tooltip === null ? '' : (customCol.tooltip || '')
        expression.value = [...customCol.expression]
        columnFormat.value = customCol.format || 'decimal'
        showCustomColumn.value = true
        editingColumn.value = column
        
        console.log('Set up edit mode with:', {
          name: newColumnName.value,
          tooltip: columnTooltip.value,
          expression: expression.value,
          format: columnFormat.value,
          originalState: originalColumnState.value
        })
      }
    }

    const handleTooltipChange = (e) => {
      const newValue = e.target.value
      columnTooltip.value = newValue
      console.log('Tooltip changed via handler:', {
        newValue,
        originalTooltip: originalColumnState.value?.tooltip,
        hasChanged: newValue !== originalColumnState.value?.tooltip
      })
    }

    const canCreateColumn = computed(() => {
      if (editingColumn.value) {
        if (!originalColumnState.value) {
          console.log('No original state found for editing')
          return false
        }

        // Check if any changes were made from the original state
        const currentName = newColumnName.value.trim()
        const currentTooltip = columnTooltip.value
        const originalName = originalColumnState.value.label
        const originalTooltip = originalColumnState.value.tooltip

        const hasNameChange = currentName !== originalName
        const hasExpressionChange = !areArraysEqual(expression.value, originalColumnState.value.expression)
        const hasFormatChange = columnFormat.value !== originalColumnState.value.format
        const hasTooltipChange = currentTooltip !== originalTooltip

        console.log('Checking for changes:', {
          hasNameChange,
          hasExpressionChange,
          hasFormatChange,
          hasTooltipChange,
          currentState: {
            name: currentName,
            tooltip: currentTooltip,
            expression: expression.value,
            format: columnFormat.value
          },
          originalState: {
            name: originalName,
            tooltip: originalTooltip,
            expression: originalColumnState.value.expression,
            format: originalColumnState.value.format
          }
        })

        // For editing, only require that something has changed and the expression is valid
        const canUpdate = (hasNameChange || hasExpressionChange || hasFormatChange || hasTooltipChange) &&
               expression.value.length > 0 &&
               isValidExpression()
               
        console.log('Can update:', canUpdate, 'hasTooltipChange:', hasTooltipChange)
        return canUpdate
      }

      // For new columns, enable as soon as there's a valid expression and name is valid
      return expression.value.length > 0 && 
             isValidExpression() && 
             !allHeaders.value.some(h => h.label === newColumnName.value.trim())
    })

    const isValidExpression = () => {
      try {
        const expr = expression.value.join(' ')
        if (!expr) return false

        // Check for balanced parentheses
        let parenCount = 0
        for (const char of expr) {
          if (char === '(') parenCount++
          if (char === ')') parenCount--
          if (parenCount < 0) return false
        }
        if (parenCount !== 0) return false

        // Split into tokens and remove empty strings
        const tokens = expr.split(' ').filter(t => t)
        if (tokens.length === 0) return false

        const operators = ['+', '-', '*', '/']

        // Check first and last tokens
        if (operators.includes(tokens[0]) || operators.includes(tokens[tokens.length - 1])) {
          return false
        }

        // Check for valid operator placement and consecutive operators
        for (let i = 0; i < tokens.length; i++) {
          const isOperator = operators.includes(tokens[i])
          const prevIsOperator = i > 0 && operators.includes(tokens[i - 1])
          const nextIsOperator = i < tokens.length - 1 && operators.includes(tokens[i + 1])

          // Don't allow consecutive operators
          if (isOperator && (prevIsOperator || nextIsOperator)) {
            return false
          }

          // Don't allow operator after open parenthesis or before close parenthesis
          if (isOperator && (
              (i > 0 && tokens[i - 1] === '(') || 
              (i < tokens.length - 1 && tokens[i + 1] === ')')
          )) {
            return false
          }
        }

        // Try evaluating with sample data
        const sampleData = props.stats[0]
        if (sampleData) {
          const testExpr = tokens.map(token => {
            if (!['+', '-', '*', '/', '(', ')'].includes(token)) {
              const value = parseFloat(sampleData[token])
              return isNaN(value) ? 0 : value
            }
            return token
          }).join(' ')

          // Test if expression can be evaluated
          const result = Function(`'use strict'; return (${testExpr})`)()
          if (!isFinite(result)) return false
        }

        return true
      } catch {
        return false
      }
    }

    const addSelectedColumn = () => {
      if (selectedColumn.value) {
        expression.value.push(selectedColumn.value)
        selectedColumn.value = ''
      }
    }

    const addOperator = (operator) => {
      if (expression.value.length > 0 && 
          !['+', '-', '*', '/', '('].includes(expression.value[expression.value.length - 1])) {
        expression.value.push(operator)
      }
    }

    const addOpenParenthesis = () => {
      if (expression.value.length === 0 || 
          ['+', '-', '*', '/', '('].includes(expression.value[expression.value.length - 1])) {
        expression.value.push('(')
      }
    }

    const addCloseParenthesis = () => {
      const openCount = expression.value.filter(x => x === '(').length
      const closeCount = expression.value.filter(x => x === ')').length
      if (openCount > closeCount && 
          !['+', '-', '*', '/', '('].includes(expression.value[expression.value.length - 1])) {
        expression.value.push(')')
      }
    }

    const clearExpression = () => {
      expression.value = []
      selectedColumn.value = ''
    }

    const evaluateExpression = (expr, values) => {
      try {
        const result = Function(`'use strict'; return (${expr})`)()
        return isFinite(result) ? result : null
      } catch {
        return null
      }
    }

    const previewValue = computed(() => {
      if (expression.value.length === 0) return null

      // Get the first row of stats for preview
      const sampleData = props.stats[0]
      if (!sampleData) return null

      const expr = expression.value.map(token => {
        if (!['+', '-', '*', '/', '(', ')'].includes(token)) {
          const value = parseFloat(sampleData[token])
          return isNaN(value) ? 0 : value
        }
        return token
      }).join(' ')

      return evaluateExpression(expr, sampleData)
    })

    const formatValue = (value) => {
      if (value === null) return ''
      
      switch (columnFormat.value) {
        case 'percent':
          return `${(value * 100).toFixed(1)}%`
        case 'rate':
          return value.toFixed(1)
        default: // decimal
          return value.toFixed(3)
      }
    }

    const isCustomColumn = (key) => {
      return props.customColumns.some(col => col.key === key)
    }

    const createCustomColumn = () => {
      if (!canCreateColumn.value) return

      const columnKey = editingColumn.value || `custom_${Date.now()}`
      const customColumn = {
        key: columnKey,
        label: newColumnName.value.trim(),
        displayName: newColumnName.value.trim(),
        tooltip: columnTooltip.value.trim() || null,
        expression: expression.value,
        format: columnFormat.value,
        isCustom: true
      }

      if (editingColumn.value) {
        // Update existing column
        emit('custom-column-updated', editingColumn.value, customColumn)
      } else {
        // Create new column
        emit('custom-column-created', customColumn)
        if (!selectedColumns.value.includes(columnKey)) {
          selectedColumns.value.push(columnKey)
        }
      }

      // Reset form and original state
      newColumnName.value = ''
      columnTooltip.value = ''
      expression.value = []
      columnFormat.value = 'decimal'
      editingColumn.value = null
      originalColumnState.value = null
      showCustomColumn.value = false
    }

    const deleteCustomColumn = (key) => {
      emit('custom-column-deleted', key)
      const index = selectedColumns.value.indexOf(key)
      if (index !== -1) {
        selectedColumns.value.splice(index, 1)
      }
    }

    const closeModal = () => {
      emit('update:modelValue', false)
    }

    const toggleColumn = (key) => {
      const index = selectedColumns.value.indexOf(key)
      if (index === -1) {
        selectedColumns.value.push(key)
      } else {
        selectedColumns.value.splice(index, 1)
      }
    }

    const selectAll = () => {
      selectedColumns.value = allHeaders.value.map(h => h.key)
    }

    const deselectAll = () => {
      selectedColumns.value = []
    }

    const saveChanges = () => {
      emit('save', selectedColumns.value)
      closeModal()
    }

    const updateFilter = (column, value) => {
      const columnType = numericColumnTypes[column]
      let numValue = value === '' ? '' : parseFloat(value)
      
      if (numValue !== '') {
        if (columnType === 'integer') {
          numValue = Math.floor(numValue)
        } else {
          // For decimal values, round to 1 decimal place
          numValue = Math.round(numValue * 10) / 10
        }
      }
      
      emit('filter-updated', column, numValue)
    }

    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }

    const availableFilterColumns = computed(() => {
      return numericHeaders.value.filter(header => 
        !activeFilterColumns.value.some(col => col.key === header.key)
      )
    })

    const hasActiveFilters = computed(() => {
      return activeFilterColumns.value.length > 0
    })

    const addColumnFilter = () => {
      if (!selectedFilterColumn.value) return
      
      if (!activeFilterColumns.value.find(col => col.key === selectedFilterColumn.value.key)) {
        activeFilterColumns.value.push(selectedFilterColumn.value)
        // Initialize with empty value based on column type
        if (props.isTextColumn(selectedFilterColumn.value.key)) {
          emit('filter-updated', selectedFilterColumn.value.key, [])
        }
      }
      selectedFilterColumn.value = ''
    }

    const removeFilter = (column) => {
      // Remove from active filters list
      const index = activeFilterColumns.value.findIndex(col => col.key === column)
      if (index !== -1) {
        activeFilterColumns.value.splice(index, 1)
      }
      
      // Emit the appropriate clear value based on column type
      if (props.isTextColumn(column)) {
        emit('filter-updated', column, [])
      } else {
        emit('filter-updated', column, '')
      }
    }

    const clearAllFilters = () => {
      // Clear all active filters
      activeFilterColumns.value = []
      
      // Clear each filter with appropriate empty value
      Object.keys(props.columnFilters).forEach(column => {
        if (props.isTextColumn(column)) {
          emit('filter-updated', column, [])
        } else {
          emit('filter-updated', column, '')
        }
      })
    }

    const numericColumnTypes = {
      'RK': 'integer',  // Rank
      'GP': 'integer',  // Games Played
      'REC': 'integer', // Receptions
      'YDS': 'decimal', // Reception Yards
      'Y/R': 'decimal', // Yards Per Reception
      'YBC': 'decimal', // Yards Before Catch
      'YBC/R': 'decimal', // Yards Before Catch Per Reception
      'AIR': 'decimal', // Air Yards
      'AIR/R': 'decimal', // Air Yards Per Reception
      'YAC': 'decimal', // Yards After Catch
      'YAC/R': 'decimal', // Yards After Catch Per Reception
      'YACON': 'decimal', // Yards After Contact
      'YACON/R': 'decimal', // Yards After Contact Per Reception
      'BRKTKL': 'integer', // Broken Tackles
      'TGT': 'integer', // Reception Targets
      'TGT%': 'decimal', // % Of Team Targets
      'CATCHABLE': 'integer', // Catchable Passes
      'DROP': 'integer', // Dropped Passes
      'RTG': 'decimal', // Rating
      'RZ TGT': 'integer', // Red Zone Targets
      '10+ YDS': 'integer', // Receptions Of 10+ Yards
      '20+ YDS': 'integer', // Receptions Of 20+ Yards
      '30+ YDS': 'integer', // Receptions Of 30+ Yards
      '40+ YDS': 'integer', // Receptions Of 40+ Yards
      '50+ YDS': 'integer', // Receptions Of 50+ Yards
      'LNG': 'integer'  // Longest Reception
    }

    const getInputType = (column) => {
      return 'number'
    }

    const getInputStep = (column) => {
      const columnType = numericColumnTypes[column.key]
      return columnType === 'integer' ? '1' : '0.1'
    }

    // Initialize active filters from existing column filters
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        activeFilterColumns.value = numericHeaders.value.filter(header => 
          props.columnFilters[header.key] !== undefined && 
          props.columnFilters[header.key] !== ''
        )
      }
    })

    const toggleCustomColumn = () => {
      showCustomColumn.value = !showCustomColumn.value
    }

    const handleMultiSelect = (column, value) => {
      const currentFilters = props.columnFilters[column] || []
      const isCurrentlySelected = isValueSelected(column, value)
      
      // Toggle the selection
      const newSelection = isCurrentlySelected
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value]
      
      emit('filter-updated', column, newSelection)
    }

    const isValueSelected = (column, value) => {
      return props.columnFilters[column] && props.columnFilters[column].includes(value)
    }

    // Define default columns that will be shown when the app first starts
    const defaultColumns = [
      'Name',    // This will be displayed as 'Player'
      'Team',
      'G',
      'REC',
      'YDS',
      'Y/R',
      'YAC',
      'TGT',
      'DROP',
      'LNG'
    ]

    const loadPreset = (columns) => {
      selectedColumns.value = [...columns]
    }

    // Handle body scroll lock
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        lockScroll()
      } else {
        unlockScroll()
      }
    })

    // Cleanup when component is unmounted
    onUnmounted(() => {
      unlockScroll()
    })

    const openPresetsManager = () => {
      showPresetsModal.value = true
    }

    const toggleAvailableColumns = () => {
      showAvailableColumns.value = !showAvailableColumns.value
    }

    const clearCustomColumnForm = () => {
      newColumnName.value = ''
      columnTooltip.value = ''
      expression.value = []
      columnFormat.value = 'decimal'
      selectedColumn.value = ''
      editingColumn.value = null
      originalColumnState.value = null
    }

    return {
      selectedColumns,
      showPresetsModal,
      showSelectPresetModal,
      showAvailableColumns,
      toggleAvailableColumns,
      closeModal,
      toggleColumn,
      selectAll,
      deselectAll,
      resetToDefault,
      saveChanges,
      loadPreset,
      openPresetsManager,
      newColumnName,
      selectedColumn,
      expression,
      expressionPreview,
      numericHeaders,
      allHeaders,
      operators,
      canCreateColumn,
      createCustomColumn,
      clearCustomColumnForm,
      isCustomColumn,
      deleteCustomColumn,
      addSelectedColumn,
      addOperator,
      addOpenParenthesis,
      addCloseParenthesis,
      clearExpression,
      columnFilters: computed(() => props.columnFilters),
      updateFilter,
      showFilters,
      toggleFilters,
      columnFormat,
      formatValue,
      previewValue,
      selectedFilterColumn,
      activeFilterColumns,
      availableFilterColumns,
      hasActiveFilters,
      addColumnFilter,
      removeFilter,
      clearAllFilters,
      getInputType,
      getInputStep,
      numericColumnTypes,
      showCustomColumn,
      toggleCustomColumn,
      handleMultiSelect,
      isValueSelected,
      editCustomColumn,
      editingColumn,
      handleTooltipChange,
      columnTooltip
    }
  }
}
</script>

<style scoped>
.modal-overlay {
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
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-primary);
}

.modal-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
  border: 2px solid var(--bg-primary);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-secondary);
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
}

.column-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.column-section h3 {
  margin-top: 0;
  color: var(--text-primary);
}

.custom-column-creator {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.custom-column-creator .section-header {
  margin: -0.5rem;
}

.custom-column-creator h3 {
  margin-top: 0;
  color: var(--text-primary);
}

.custom-column-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expression-builder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.expression-preview {
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
  color: var(--text-primary);
}

.preview-text {
  font-family: monospace;
  color: var(--link-color);
}

.expression-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.operator-buttons {
  display: flex;
  gap: 0.25rem;
}

.custom-input,
.custom-select,
.filter-select,
.filter-input,
.format-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.custom-input:focus,
.custom-select:focus,
.filter-select:focus,
.filter-input:focus,
.format-select:focus {
  outline: none;
  border-color: var(--link-color);
  box-shadow: 0 0 0 1px var(--link-color);
}

.custom-input::placeholder,
.filter-input::placeholder {
  color: var(--text-secondary);
}

/* Style the select dropdown options */
.custom-select option,
.filter-select option,
.format-select option {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
}

.filter-input {
  width: 100px;
  text-align: right;
  direction: rtl;
}

/* Style number input spinners */
.filter-input::-webkit-outer-spin-button,
.filter-input::-webkit-inner-spin-button {
  opacity: 1;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 2px;
  margin-right: 2px;
}

.filter-input::-webkit-inner-spin-button {
  appearance: none;
  background-color: var(--bg-primary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 0l3 4H3l3-4zM6 12L3 8h6l-3 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  width: 16px;
  height: 16px;
  position: relative;
  opacity: 0.8;
}

/* Light mode version */
:root[data-theme="light"] .filter-input::-webkit-inner-spin-button {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000000' d='M6 0l3 4H3l3-4zM6 12L3 8h6l-3 4z'/%3E%3C/svg%3E");
}

.filter-input::-webkit-inner-spin-button:hover {
  opacity: 1;
  background-color: var(--hover-bg);
}

/* Firefox */
.filter-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.operator-btn {
  padding: 0.5rem;
  min-width: 2rem;
  font-size: 1rem;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: var(--link-color);
  color: white;
  border: none;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: var(--header-bg);
  color: var(--text-primary);
}

.create-button {
  padding: 0.5rem 1rem;
  background: var(--link-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-button:not(:disabled):hover {
  background: var(--link-hover-color);
}

.column-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.column-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  user-select: none;
}

.column-item:hover {
  background: var(--header-hover);
}

.column-item input[type="checkbox"] {
  margin-right: 8px;
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-radius: 3px;
  background-color: var(--bg-primary);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.column-item input[type="checkbox"]:checked {
  background-color: var(--link-color);
  border-color: var(--link-color);
}

.column-item input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 12px;
  left: 2px;
  top: -1px;
}

.column-item input[type="checkbox"]:hover {
  border-color: var(--link-color);
}

.column-item input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--link-color);
}

.column-item span {
  flex: 1;
}

.custom-column-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.edit-custom,
.delete-custom {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: color 0.2s;
}

.edit-custom:hover {
  color: var(--text-primary);
}

.delete-custom:hover {
  color: #ff4444;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  background: var(--header-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

button:hover:not(:disabled) {
  background: var(--header-hover);
}

button.primary {
  background: var(--link-color);
  color: white;
  border: none;
}

button.primary:hover {
  background: var(--link-hover-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.section-header:hover {
  background: var(--hover-bg);
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.toggle-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.toggle-button.is-expanded {
  transform: rotate(0deg);
}

.toggle-button:not(.is-expanded) {
  transform: rotate(-90deg);
}

.section-content {
  margin-top: 1rem;
}

.filters-section {
  margin: 2rem 0;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.filters-description {
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.filters-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.filter-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  max-height: 120px;
  overflow-y: auto;
}

.filter-select option {
  padding: 4px;
}

.filter-select option:checked {
  background: var(--header-bg);
  color: var(--text-primary);
}

.add-filter-btn {
  padding: 0.5rem 1rem;
  background: var(--link-color);
  color: white;
  border: none;
  border-radius: 4px;
}

.add-filter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background: var(--header-bg);
  color: var(--text-primary);
}

.clear-filters-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.active-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  position: relative;
}

.filter-label {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.remove-filter-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}

.remove-filter-btn:hover {
  color: #ff4444;
  background: var(--hover-bg);
}

.custom-input {
  width: 50%;
}

.custom-select {
  width: 150px;
}

.form-row {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.multi-select-container {
  flex: 1;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-primary);
}

.multi-select-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.multi-select-container::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.multi-select-container::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
  border: 2px solid var(--bg-primary);
}

.multi-select-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-secondary);
}

.multi-select-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  color: var(--text-primary);
}

.multi-select-option:hover {
  background: var(--header-hover);
}

.multi-select-option .option-text {
  flex: 1;
}

.multi-select-option .checkmark {
  color: var(--text-primary);
  margin-left: 8px;
}

.tooltip-input {
  width: 100%;
}

.column-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.column-actions button {
  flex: 1;
  white-space: nowrap;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.clear-form-button {
  padding: 0.5rem 1rem;
  background: var(--header-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.clear-form-button:hover {
  background: var(--header-hover);
}
</style> 