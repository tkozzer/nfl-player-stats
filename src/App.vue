<template>
  <div class="app">
    <div class="theme-toggle-container">
      <button 
        class="theme-toggle" 
        @click="toggleTheme"
        :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        :data-scrolled="isScrolled"
      >
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </div>
    <Sidebar @position-selected="handlePositionSelect" />
    <header>
      <YearSelector 
        @year-selected="handleYearSelect" 
        :position="currentPosition"
      />
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import YearSelector from './components/YearSelector.vue'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  components: {
    Sidebar,
    YearSelector
  },
  setup() {
    const isDarkMode = ref(false)
    const router = useRouter()
    const isScrolled = ref(false)
    const currentPosition = ref('')

    const positionMap = {
      '/wide-receivers': 'WR',
      '/quarterbacks': 'QB',
      '/running-backs': 'RB',
      '/tight-ends': 'TE'
    }

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    }

    const handlePositionSelect = (position) => {
      const routes = {
        'WR': '/wide-receivers',
        'QB': '/quarterbacks',
        'RB': '/running-backs',
        'TE': '/tight-ends'
      }
      
      if (routes[position]) {
        currentPosition.value = position
        router.push(routes[position])
      }
    }

    const handleYearSelect = (year) => {
      // Handle year selection here
      console.log('Selected year:', year)
      // You can update your data fetching or routing based on the selected year
    }

    // Watch for route changes
    watch(
      () => router.currentRoute.value.path,
      (path) => {
        currentPosition.value = positionMap[path] || ''
      }
    )

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark'
        document.documentElement.setAttribute('data-theme', savedTheme)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDarkMode.value = prefersDark
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      }

      // Set initial position based on route
      const path = router.currentRoute.value.path
      currentPosition.value = positionMap[path] || ''

      // Add scroll event listener
      window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 100
      })
    })

    return {
      isDarkMode,
      toggleTheme,
      handlePositionSelect,
      handleYearSelect,
      isScrolled,
      currentPosition
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

h1 {
  color: var(--text-primary);
  font-size: 2.5rem;
  margin: 0;
}

main {
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  padding: 20px;
}

.theme-toggle-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 40px;
  height: 40px;
}

/* Create hover area container */
.theme-toggle-container::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  z-index: 999;
}

.theme-toggle {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: all 0.3s ease;
  opacity: 1;
  z-index: 1000;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-toggle[data-scrolled="true"] {
  opacity: 0;
  pointer-events: none;
}

.theme-toggle-container:hover .theme-toggle[data-scrolled="true"] {
  opacity: 1;
  pointer-events: auto;
}
</style>
