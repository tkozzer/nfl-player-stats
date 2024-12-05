<template>
  <div class="year-selector">
    <h1>
      NFL {{ position ? `${position} Stats` : 'Player Stats' }}
      <span 
        class="year-text"
        @mouseenter="showHoverEffect = true"
        @mouseleave="showHoverEffect = false"
        @click="toggleDropdown"
      >
        {{ selectedYear }}
        <span 
          class="dropdown-arrow"
          :class="{ 
            'visible': showHoverEffect,
            'active': showDropdown 
          }"
        >▼</span>
        <div class="year-dropdown" v-show="showDropdown">
          <button 
            v-for="year in availableYears" 
            :key="year"
            :class="{ active: year === selectedYear }"
            @click.stop="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </span>
    </h1>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'YearSelector',
  props: {
    position: {
      type: String,
      default: ''
    }
  },
  emits: ['year-selected'],
  setup(props, { emit }) {
    const selectedYear = ref(2024)
    const showDropdown = ref(false)
    const showHoverEffect = ref(false)
    
    const availableYears = [2024, 2023, 2022, 2021, 2020]

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }

    const selectYear = (year) => {
      selectedYear.value = year
      showDropdown.value = false
      emit('year-selected', year)
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showDropdown.value && !event.target.closest('.year-text')) {
        showDropdown.value = false
      }
    }

    // Add/remove click outside listener
    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClickOutside)
    }

    return {
      selectedYear,
      showDropdown,
      showHoverEffect,
      availableYears,
      selectYear,
      toggleDropdown
    }
  }
}
</script>

<style scoped>
.year-selector h1 {
  color: var(--text-primary);
  font-size: 2.5rem;
  margin: 0;
}

.year-text {
  position: relative;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s;
}

.year-text:hover {
  color: var(--link-color);
}

.dropdown-arrow {
  font-size: 0.5em;
  vertical-align: middle;
  margin-left: 4px;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-arrow.visible {
  opacity: 0.7;
}

.dropdown-arrow.active {
  transform: rotate(180deg);
}

.year-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 100px;
  z-index: 1000;
  margin-top: 8px;
  padding: 4px;
  animation: dropdownFade 0.2s ease;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.year-dropdown button {
  background: none;
  border: none;
  padding: 8px 16px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.year-dropdown button:hover {
  background: var(--hover-bg);
}

.year-dropdown button.active {
  background: var(--link-color);
  color: white;
}

/* Add a small arrow at the top of the dropdown */
.year-dropdown::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}
</style> 