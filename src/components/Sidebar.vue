<template>
  <div class="sidebar-container">
    <button 
      class="hamburger-button" 
      @click="toggleSidebar" 
      aria-label="Toggle menu"
      :data-scrolled="isScrolled"
      :class="{ 'is-open': isOpen }"
    >
      <div class="hamburger-icon" :class="{ 'is-open': isOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <Transition name="sidebar">
      <div v-if="isOpen" class="sidebar-overlay" @click="closeSidebar">
        <div class="sidebar" @click.stop>
          <div class="sidebar-header">
            <h2>Menu</h2>
            <button class="close-button" @click="closeSidebar">×</button>
          </div>
          <nav class="sidebar-nav">
            <ul>
              <li>
                <router-link 
                  to="/quarterbacks" 
                  class="nav-item"
                  active-class="active"
                  @click="selectPosition('QB')"
                >
                  Quarterbacks
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/running-backs" 
                  class="nav-item"
                  active-class="active"
                  @click="selectPosition('RB')"
                >
                  Running Backs
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/wide-receivers" 
                  class="nav-item"
                  active-class="active"
                  @click="selectPosition('WR')"
                >
                  Wide Receivers
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/tight-ends" 
                  class="nav-item"
                  active-class="active"
                  @click="selectPosition('TE')"
                >
                  Tight Ends
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const isScrolled = ref(false)
const emit = defineEmits(['position-selected'])

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 100
  })
})

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeSidebar = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}

const selectPosition = (position) => {
  emit('position-selected', position)
  closeSidebar()
}
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  width: 44px;
  height: 44px;
}

.sidebar-container::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  z-index: 999;
}

.hamburger-button {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 1;
  z-index: 1000;
}

.hamburger-button.is-open {
  opacity: 0;
  pointer-events: none;
}

.hamburger-button[data-scrolled="true"] {
  opacity: 0;
  pointer-events: none;
}

.sidebar-container:hover .hamburger-button[data-scrolled="true"]:not(.is-open) {
  opacity: 1;
  pointer-events: auto;
}

.hamburger-button:hover {
  background: var(--header-hover);
}

.hamburger-icon {
  width: 20px;
  height: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--text-primary);
  transition: transform 0.3s, opacity 0.3s;
}

.hamburger-icon.is-open span:first-child {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-icon.is-open span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.is-open span:last-child {
  transform: translateY(-7px) rotate(-45deg);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
}

.sidebar {
  position: relative;
  width: 300px;
  height: 100%;
  background: var(--bg-secondary);
  box-shadow: 2px 0 8px var(--shadow-color);
  display: flex;
  flex-direction: column;
  z-index: 1001;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--text-secondary);
}

.sidebar-nav {
  padding: 1rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
  text-align: left;
}

.nav-item:hover {
  background: var(--hover-bg);
}

.nav-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-item.disabled:hover {
  background: none;
}

.coming-soon {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--header-bg);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

/* Transitions */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-active .sidebar {
  transition: transform 0.3s ease;
}

.sidebar-leave-active .sidebar {
  transition: transform 0.3s ease;
}

.sidebar-enter-from .sidebar {
  transform: translateX(-100%);
}

.sidebar-leave-to .sidebar {
  transform: translateX(-100%);
}

.nav-item.active {
  background: var(--hover-bg);
  color: var(--link-color);
}

.nav-item.router-link-active {
  background: var(--hover-bg);
  color: var(--link-color);
}
</style> 