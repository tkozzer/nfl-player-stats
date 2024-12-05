<template>
  <div class="stats-container">
    <div class="top-controls">
      <div class="current-sort" v-if="sortKey !== 'Rank'">
        Sorted by {{ findHeaderLabel(sortKey) }} ({{ sortOrder === 'desc' ? 'highest' : 'lowest' }} first)
      </div>
      <button class="customize-button" @click="showColumnSelector = true" title="Customize Columns" :data-scrolled="isScrolled">
        ⚙️ Customize
      </button>
    </div>
    <div class="table-content">
      <div class="table-header">
        <div class="active-filters" v-if="Object.keys(columnFilters).length > 0">
          <div class="filter-tag" v-for="(value, column) in columnFilters" :key="column">
            <template v-if="isTextColumn(column)">
              {{ findHeaderLabel(column) }}: {{ value.join(', ') }}
              <button class="remove-filter" @click="updateColumnFilter(column, [])">×</button>
            </template>
            <template v-else>
              {{ findHeaderLabel(column) }} ≥ {{ value }}
              <button class="remove-filter" @click="updateColumnFilter(column, '')">×</button>
            </template>
          </div>
        </div>
      </div>
      <div v-if="loading" class="loading">Loading stats...</div>
      <table v-else class="stats-table" :class="{ 'player-locked': isPlayerColumnLocked }">
        <thead>
          <tr>
            <th v-for="header in visibleHeaders" :key="header.key" 
                @click="sortBy(header.key)" 
                :title="header.isCustom ? (header.tooltip || header.label) : (header.tooltip || header.label)"
                :class="{ 
                  'sticky-rank': header.key === 'currentRank',
                  'sticky-player': header.key === 'Name' && isPlayerColumnLocked
                }">
              {{ header.isCustom ? header.displayName : header.label }}
              <span v-if="header.key === 'Name'" 
                    class="lock-icon"
                    @click.stop="togglePlayerLock"
                    :title="isPlayerColumnLocked ? 'Unlock column' : 'Lock column'">
                {{ isPlayerColumnLocked ? '🔒' : '🔓' }}
              </span>
              <span class="sort-icon" v-if="sortKey === header.key">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in sortedStats" :key="`${player.Name}-${player.Team}`">
            <td v-for="header in visibleHeaders" 
                :key="header.key"
                :class="{ 
                  'sticky-rank': header.key === 'currentRank',
                  'sticky-player': header.key === 'Name' && isPlayerColumnLocked
                }">
              {{ formatColumnValue(player[header.key], header, player) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ColumnSelector
      v-model="showColumnSelector"
      :headers="headers"
      :initial-selection="visibleColumns"
      :custom-columns="customColumns"
      :column-filters="columnFilters"
      :stats="stats"
      :is-text-column="isTextColumn"
      :get-unique-values="getUniqueValues"
      :position="currentPosition"
      @save="updateVisibleColumns"
      @custom-column-created="handleCustomColumnCreated"
      @custom-column-updated="handleCustomColumnUpdated"
      @custom-column-deleted="handleCustomColumnDeleted"
      @filter-updated="updateColumnFilter"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ColumnSelector from './ColumnSelector.vue'
import { headersByPosition, defaultVisibleColumnsByPosition, defaultSortKeysByPosition } from '../config/tableHeaders'

export default {
  name: 'StatsTable',
  components: {
    ColumnSelector
  },
  setup() {
    const route = useRoute()
    const stats = ref([])
    const loading = ref(true)
    const sortKey = ref('')
    const sortOrder = ref('desc')
    const showColumnSelector = ref(false)
    const customColumns = ref([])
    const columnFilters = ref({})
    const isPlayerColumnLocked = ref(false)
    const isScrolled = ref(false)

    const currentPosition = computed(() => route.meta?.position || '')

    const headers = computed(() => {
      return headersByPosition[currentPosition.value] || []
    })

    const visibleColumns = ref([])

    // Initialize visible columns based on position and saved preferences
    const initializeVisibleColumns = (position) => {
      const savedColumns = localStorage.getItem(`visibleColumns_${position}`)
      if (savedColumns) {
        visibleColumns.value = JSON.parse(savedColumns)
      } else {
        visibleColumns.value = defaultVisibleColumnsByPosition[position]
      }
    }

    // Watch for route changes to load appropriate data
    watch(() => currentPosition.value, async (newPosition) => {
      if (!newPosition) return
      
      loading.value = true
      try {
        const response = await fetch(`/src/data/${newPosition.toLowerCase()}s/${newPosition.toLowerCase()}_stats_12042024.json`)
        const data = await response.json()
        stats.value = data
        
        // Initialize visible columns for the position
        initializeVisibleColumns(newPosition)
        
        // Set default sort key for the position
        sortKey.value = defaultSortKeysByPosition[newPosition]
      } catch (error) {
        console.error('Error loading stats:', error)
        stats.value = []
      } finally {
        loading.value = false
      }
    }, { immediate: true })

    const visibleHeaders = computed(() => {
      // Always include a rank column at the start
      const rankHeader = { key: 'currentRank', label: '#', tooltip: 'Current Rank' }
      return [rankHeader, ...[...headers.value, ...customColumns.value].filter(header => visibleColumns.value.includes(header.key))]
    })

    const calculateRanks = (players, key) => {
      // First, sort by value in descending order to assign ranks
      const rankedPlayers = [...players].sort((a, b) => {
        const aVal = Number(a[key])
        const bVal = Number(b[key])
        return bVal - aVal // Always sort descending for ranking
      })

      // Assign ranks (handling ties)
      let currentRank = 1
      let currentValue = null
      const rankMap = new Map()

      rankedPlayers.forEach((player, index) => {
        const value = Number(player[key])
        if (index === 0) {
          currentValue = value
          rankMap.set(`${player.Name}-${player.Team}`, currentRank)
        } else if (value === currentValue) {
          rankMap.set(`${player.Name}-${player.Team}`, currentRank)
        } else {
          currentRank = index + 1
          currentValue = value
          rankMap.set(`${player.Name}-${player.Team}`, currentRank)
        }
      })

      // Apply ranks to the original order
      return players.map(player => ({
        ...player,
        currentRank: rankMap.get(`${player.Name}-${player.Team}`)
      }))
    }

    const sortedStats = computed(() => {
      // First calculate ranks for all players
      const rankedPlayers = calculateRanks(filteredStats.value, sortKey.value)

      // Then sort according to the current sort direction
      return rankedPlayers.sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]

        // Convert to numbers if possible
        if (!isNaN(aVal)) aVal = Number(aVal)
        if (!isNaN(bVal)) bVal = Number(bVal)

        if (sortOrder.value === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
        }
      })
    })

    const formatColumnValue = (value, header, player) => {
      if (value === undefined || value === null) return ''
      
      // Special handling for rank display
      if (header.key === 'currentRank') {
        return player.currentRank
      }

      // If it's a custom column with a format
      if (header.isCustom && header.format) {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) return value

        switch (header.format) {
          case 'percent':
            return `${(numValue * 100).toFixed(1)}%`
          case 'rate':
            return numValue.toFixed(1)
          case 'decimal':
            return numValue.toFixed(3)
          default:
            return value
        }
      }

      // For regular columns, return as is
      return value
    }

    const computeCustomValue = (player, customColumn) => {
      try {
        const expr = customColumn.expression.map(token => {
          if (!['+', '-', '*', '/', '(', ')'].includes(token)) {
            const value = parseFloat(player[token])
            return isNaN(value) ? 0 : value
          }
          return token
        }).join(' ')

        const result = Function(`'use strict'; return (${expr})`)()
        return isFinite(result) ? result : 0
      } catch (error) {
        console.error('Error computing custom column:', error)
        return 0
      }
    }

    const statsWithCustomColumns = computed(() => {
      return stats.value.map(player => {
        const playerWithCustom = { ...player }
        customColumns.value.forEach(customCol => {
          playerWithCustom[customCol.key] = computeCustomValue(player, customCol)
        })
        return playerWithCustom
      })
    })

    const loadStats = async () => {
      try {
        const response = await fetch('/src/data/stats.json')
        const data = await response.json()
        stats.value = data
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        loading.value = false
      }
    }

    const getUniqueValues = (column) => {
      return [...new Set(stats.value.map(player => player[column]))].sort()
    }

    const isTextColumn = (column) => {
      return ['Name', 'Team'].includes(column)
    }

    const filteredStats = computed(() => {
      return statsWithCustomColumns.value.filter(player => {
        // Check if player meets all filter requirements
        return Object.entries(columnFilters.value).every(([column, filterValue]) => {
          if (!filterValue && filterValue !== 0) return true
          
          // Handle text-based filters (arrays of selected values)
          if (isTextColumn(column)) {
            return filterValue.length === 0 || filterValue.includes(player[column])
          }
          
          // Handle numeric filters
          const value = parseFloat(player[column])
          return !isNaN(value) && value >= filterValue
        })
      })
    })

    const updateColumnFilter = (column, value) => {
      if (isTextColumn(column)) {
        // For text columns (Team/Name)
        if (Array.isArray(value) && value.length === 0) {
          // Remove the filter completely if no values are selected
          const newFilters = { ...columnFilters.value }
          delete newFilters[column]
          columnFilters.value = newFilters
        } else if (Array.isArray(value)) {
          // Update with new selection
          columnFilters.value = {
            ...columnFilters.value,
            [column]: value
          }
        }
      } else {
        // Handle numeric filters as before
        if (value === '' || value === null || isNaN(value)) {
          const newFilters = { ...columnFilters.value }
          delete newFilters[column]
          columnFilters.value = newFilters
        } else {
          columnFilters.value = {
            ...columnFilters.value,
            [column]: parseFloat(value)
          }
        }
      }
      localStorage.setItem('columnFilters', JSON.stringify(columnFilters.value))
    }

    // Add a watcher for columnFilters to ensure UI updates
    watch(columnFilters, (newFilters) => {
      // Remove any empty array filters
      Object.entries(newFilters).forEach(([column, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          const updatedFilters = { ...newFilters }
          delete updatedFilters[column]
          columnFilters.value = updatedFilters
        }
      })
    }, { deep: true })

    const findHeaderLabel = (columnKey) => {
      const header = [...headers.value, ...customColumns.value].find(h => h.key === columnKey)
      // For custom columns, use the displayName or label
      if (header?.isCustom) {
        return header.tooltip || header.displayName || header.label
      }
      return header ? (header.tooltip || header.label) : columnKey
    }

    onMounted(() => {
      const position = route.meta.position
      if (position) {
        initializeVisibleColumns(position)
      }
      
      // Set initial player column width
      const playerColumn = document.querySelector('.stats-table th:nth-child(2)')
      if (playerColumn) {
        const width = playerColumn.offsetWidth
        document.documentElement.style.setProperty('--player-width', `${width}px`)
      }
      
      // Load saved custom columns if they exist
      const savedCustomColumns = localStorage.getItem('customColumns')
      if (savedCustomColumns) {
        customColumns.value = JSON.parse(savedCustomColumns)
      }
      
      // Load saved filters if they exist
      const savedFilters = localStorage.getItem('columnFilters')
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters)
          Object.entries(filters).forEach(([key, value]) => {
            if (isTextColumn(key)) {
              columnFilters.value[key] = Array.isArray(value) ? value : []
            } else if (!isNaN(parseFloat(value))) {
              columnFilters.value[key] = parseFloat(value)
            }
          })
        } catch (error) {
          console.error('Error loading saved filters:', error)
        }
      }

      window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 100
      })
    })

    const handleCustomColumnCreated = (newColumn) => {
      customColumns.value.push(newColumn)
      visibleColumns.value.push(newColumn.key)
      localStorage.setItem('customColumns', JSON.stringify(customColumns.value))
      localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns.value))
    }

    const handleCustomColumnUpdated = (key, updatedColumn) => {
      const index = customColumns.value.findIndex(col => col.key === key)
      if (index !== -1) {
        customColumns.value[index] = updatedColumn
        localStorage.setItem('customColumns', JSON.stringify(customColumns.value))
      }
    }

    const handleCustomColumnDeleted = (key) => {
      customColumns.value = customColumns.value.filter(col => col.key !== key)
      visibleColumns.value = visibleColumns.value.filter(colKey => colKey !== key)
      localStorage.setItem('customColumns', JSON.stringify(customColumns.value))
      localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns.value))
    }

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        // Always start with descending (highest = rank 1)
        sortOrder.value = 'desc'
      }
    }

    const updateVisibleColumns = (newColumns) => {
      visibleColumns.value = newColumns
      const position = route.meta.position
      if (position) {
        localStorage.setItem(`visibleColumns_${position}`, JSON.stringify(newColumns))
      }
    }

    const numericHeaders = computed(() => {
      return props.headers.filter(header => {
        return !['Name', 'Team'].includes(header.key)
      })
    })

    const togglePlayerLock = () => {
      isPlayerColumnLocked.value = !isPlayerColumnLocked.value
    }

    return {
      headers,
      visibleHeaders,
      visibleColumns,
      customColumns,
      sortedStats,
      sortKey,
      sortOrder,
      sortBy,
      loading,
      showColumnSelector,
      columnFilters,
      updateColumnFilter,
      updateVisibleColumns,
      handleCustomColumnCreated,
      handleCustomColumnUpdated,
      handleCustomColumnDeleted,
      findHeaderLabel,
      formatColumnValue,
      numericHeaders,
      getUniqueValues,
      isTextColumn,
      isPlayerColumnLocked,
      togglePlayerLock,
      currentPosition,
      isScrolled
    }
  }
}
</script>

<style scoped>
.stats-container {
  width: 100%;
  margin: 20px 0;
  position: relative;
}

.top-controls {
  position: relative;
  height: 32px;
  margin-bottom: 8px;
}

.current-sort {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: var(--bg-primary);
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  border: 1px solid var(--border-color);
  z-index: 100;
}

.customize-button {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  background: var(--header-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  z-index: 100;
  transition: opacity 0.3s ease;
  opacity: 1;
}

.customize-button[data-scrolled="true"] {
  opacity: 0;
  pointer-events: none;
}

.customize-button[data-scrolled="true"]:hover {
  opacity: 1;
  pointer-events: auto;
}

.table-content {
  position: relative;
  overflow-x: auto;
}

/* Base table styles */
.stats-table {
  position: relative;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--bg-secondary);
}

/* Base player column styles */
.stats-table th:nth-child(2),
.stats-table td:nth-child(2) {
  width: fit-content !important;
  min-width: fit-content !important;
  max-width: fit-content !important;
  white-space: nowrap !important;
  padding: 8px 24px 8px 8px !important;
  box-sizing: border-box !important;
  position: relative;
  flex: none !important;
}

/* Remove any conflicting width styles */
th, td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: none !important;
  width: auto !important;
}

/* Locked player column styles */
.player-locked .sticky-player {
  position: sticky !important;
  left: 24px !important;
  z-index: 3 !important;
  background: var(--bg-secondary) !important;
  width: inherit !important;
  min-width: inherit !important;
  max-width: inherit !important;
  padding: 8px 24px 8px 8px !important;
  box-sizing: border-box !important;
  box-shadow: 4px 0 4px -4px rgba(0, 0, 0, 0.1) !important;
  flex: none !important;
}

/* Scrollbar styling */
.table-content {
  scrollbar-width: thin;
  scrollbar-color: var(--text-secondary) var(--bg-primary);
}

.table-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-content::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.table-content::-webkit-scrollbar-thumb {
  background-color: var(--text-secondary);
  border-radius: 4px;
  border: 2px solid var(--bg-primary);
}

.table-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-primary);
}

.table-content::-webkit-scrollbar-corner {
  background: var(--bg-primary);
}

/* Sticky column styles */
.sticky-rank {
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--bg-secondary);
  width: 24px;
  padding: 12px 4px;
}

/* Player column styles when locked */
.player-locked .sticky-player {
  position: sticky;
  left: 24px;
  z-index: 3;
  background: var(--bg-secondary);
  width: var(--player-width, fit-content) !important;
  padding: 12px !important;
  box-sizing: border-box !important;
  box-shadow: 4px 0 4px -4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow: visible;
}

/* Container adjustments when player column is locked */
.player-locked .table-content {
  margin-left: auto;
}

.player-locked .stats-table {
  margin-left: 0;
}

/* Ensure proper cell behavior */
td, th {
  white-space: nowrap;
  background: var(--bg-secondary);
}

/* Hover states */
tr:hover td,
tr:hover th {
  background: var(--hover-bg);
}

tr:hover .sticky-rank,
tr:hover .sticky-player {
  background: var(--hover-bg);
}

.stats-container {
  overflow: hidden;
  position: relative;
}

.table-content {
  overflow-x: auto;
  position: relative;
  margin-right: -17px; /* Compensate for scrollbar width */
  padding-right: 17px;
}

.player-locked .table-content {
  margin-left: 264px;
}

/* Additional styles for table cells */
td, th {
  white-space: nowrap;
  overflow: visible;
}

.player-locked td.sticky-player,
.player-locked th.sticky-player {
  position: sticky !important;
  left: 24px !important;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  position: sticky;
  left: 0;
  right: 0;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 1.2em;
  color: var(--text-secondary);
}

th {
  background: var(--header-bg);
  padding: 12px;
  text-align: right;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  color: var(--text-primary);
  z-index: 1;
  white-space: nowrap;
}

th:hover {
  background: var(--header-hover);
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  text-align: right;
  white-space: nowrap;
}

th:first-child,
td:first-child,
th:nth-child(2),
td:nth-child(2),
th:nth-child(3),
td:nth-child(3) {
  text-align: left;
}

tr:hover {
  background: var(--hover-bg);
}

.sort-icon {
  margin-left: 4px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .stats-table {
    font-size: 14px;
  }

  th, td {
    padding: 8px;
  }
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-right: auto;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.remove-filter {
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.remove-filter:hover {
  color: #ff4444;
}

.lock-icon {
  position: absolute !important;
  right: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  cursor: pointer;
  font-size: 0.9em;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.lock-icon:hover {
  opacity: 1;
}

/* Sticky column styles */
.sticky-rank {
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--bg-secondary);
  width: 24px;
  padding: 12px 4px;
}

/* Player column styles */
.player-locked .sticky-player {
  position: sticky;
  left: 24px;
  z-index: 3;
  background: var(--bg-secondary);
  min-width: 240px;
  padding: 12px 28px 12px 4px;
  box-shadow: 4px 0 4px -4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow: visible;
  clip-path: none;
}

/* Ensure sticky columns maintain their background in hover state */
tr:hover .sticky-rank,
tr:hover .sticky-player {
  background: var(--hover-bg);
}

/* Create a fixed container for the locked columns */
.player-locked .sticky-rank,
.player-locked .sticky-player {
  contain: paint;
  transform-style: preserve-3d;
  will-change: transform;
}

/* Lock icon positioning */
.lock-icon {
  cursor: pointer;
  margin-left: 4px;
  font-size: 0.9em;
  opacity: 0.7;
  transition: opacity 0.2s;
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.lock-icon:hover {
  opacity: 1;
}

/* Remove previous pseudo-elements that weren't fully effective */
.sticky-rank::before,
.sticky-rank::after,
.player-locked .sticky-player::before,
.player-locked .sticky-player::after {
  display: none;
}

/* Set fixed widths for non-sticky columns */
td, th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 