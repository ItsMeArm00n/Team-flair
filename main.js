// Loading Screen
const loadingScreen = document.getElementById("loadingScreen")
const loadingStatus = document.getElementById("loadingStatus")

// Loading sequence
function startLoading() {
  const messages = [
    "Initializing...",
    "Loading Team Flair...",
    "Preparing Audio System...",
    "Setting Up Visualizer...",
    "Almost Ready...",
    "Welcome to Team Flair!",
  ]

  let messageIndex = 0
  const messageInterval = setInterval(() => {
    if (messageIndex < messages.length) {
      loadingStatus.textContent = messages[messageIndex]
      messageIndex++
    } else {
      clearInterval(messageInterval)
    }
  }, 500)

  // Hide loading screen after 3 seconds
  setTimeout(() => {
    loadingScreen.classList.add("hidden")

    // Check music preference and initialize audio or show popup
    if (window.getMusicPreference()) {
      window.initializeAudio()
    } else {
      window.showMusicPopup()
    }
  }, 3000)
}

// Enhanced Members Slider with Slider Bar
const slider = document.getElementById("membersSlider")
const sliderBarContainer = document.getElementById("sliderBarContainer")
const sliderProgress = document.getElementById("sliderProgress")
const sliderHandle = document.getElementById("sliderHandle")

const cards = document.querySelectorAll(".member-card")
const totalMembers = cards.length
let currentIndex = 0
let isTransitioning = false
let scrollTimeout

// Calculate card width and spacing for proper positioning
const cardWidth = 250 // Base width of a card
const cardGap = 30 // Gap between cards
const totalCardWidth = cardWidth + cardGap

function updateSlider() {
  if (isTransitioning) return

  isTransitioning = true

  // Update card classes for visual effects
  cards.forEach((card, index) => {
    card.classList.remove("active", "side-1", "side-2", "side-3", "far")

    const distance = Math.abs(index - currentIndex)

    if (index === currentIndex) {
      card.classList.add("active")
    } else if (distance === 1) {
      card.classList.add("side-1")
    } else if (distance === 2) {
      card.classList.add("side-2")
    } else if (distance === 3) {
      card.classList.add("side-3")
    } else {
      card.classList.add("far")
    }
  })

  // Update slider bar
  const progressPercent = ((currentIndex + 1) / totalMembers) * 100
  const handlePosition = (currentIndex / (totalMembers - 1)) * 100

  sliderProgress.style.width = progressPercent + "%"
  sliderHandle.style.left = handlePosition + "%"

  // Calculate position to center the active card
  const offset = -currentIndex * totalCardWidth
  slider.style.transform = `translateX(${offset}px)`

  setTimeout(() => {
    isTransitioning = false
  }, 1000)
}

function goToMember(index) {
  if (isTransitioning) return
  currentIndex = Math.max(0, Math.min(index, totalMembers - 1))
  updateSlider()
}

function nextMember() {
  if (isTransitioning) return
  currentIndex = (currentIndex + 1) % totalMembers
  updateSlider()
}

function prevMember() {
  if (isTransitioning) return
  currentIndex = (currentIndex - 1 + totalMembers) % totalMembers
  updateSlider()
}

// Position the slider initially to center the first card
function initializeSlider() {
  const containerWidth = document.querySelector(".members-container").offsetWidth
  const initialOffset = containerWidth / 2 - cardWidth / 2

  slider.style.left = `${initialOffset}px`
  updateSlider()
}

// Scroll-based navigation for members section
const membersContainer = document.querySelector(".members-container")

if (membersContainer) {
  membersContainer.addEventListener("wheel", (e) => {
    e.preventDefault()

    clearTimeout(scrollTimeout)

    scrollTimeout = setTimeout(() => {
      if (e.deltaY > 0) {
        nextMember()
      } else {
        prevMember()
      }
    }, 50)
  })
}

// Click on cards
cards.forEach((card, index) => {
  card.addEventListener("click", () => goToMember(index))
})

// Slider bar interaction
if (sliderBarContainer) {
  sliderBarContainer.addEventListener("click", (e) => {
    const rect = sliderBarContainer.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const targetIndex = Math.round(percentage * (totalMembers - 1))
    goToMember(targetIndex)
  })
}

// Draggable slider handle
let isDragging = false

if (sliderHandle) {
  sliderHandle.addEventListener("mousedown", (e) => {
    isDragging = true
    e.preventDefault()
  })
}

document.addEventListener("mousemove", (e) => {
  if (!isDragging || !sliderBarContainer) return

  const rect = sliderBarContainer.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, mouseX / rect.width))
  const targetIndex = Math.round(percentage * (totalMembers - 1))

  if (targetIndex !== currentIndex) {
    goToMember(targetIndex)
  }
})

document.addEventListener("mouseup", () => {
  isDragging = false
})

// Touch support for mobile
if (sliderHandle) {
  sliderHandle.addEventListener("touchstart", (e) => {
    isDragging = true
    e.preventDefault()
  })
}

document.addEventListener("touchmove", (e) => {
  if (!isDragging || !sliderBarContainer) return

  const touch = e.touches[0]
  const rect = sliderBarContainer.getBoundingClientRect()
  const touchX = touch.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, touchX / rect.width))
  const targetIndex = Math.round(percentage * (totalMembers - 1))

  if (targetIndex !== currentIndex) {
    goToMember(targetIndex)
  }
})

document.addEventListener("touchend", () => {
  isDragging = false
})

// Smooth scroll for navigation
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const text = e.target.textContent.toLowerCase()
    if (text === "about") {
      document.querySelector(".about-container")?.scrollIntoView({ behavior: "smooth" })
    } else if (text === "members") {
      document.querySelector(".team-section")?.scrollIntoView({ behavior: "smooth" })
    } else if (text === "home") {
      document.querySelector(".hero")?.scrollIntoView({ behavior: "smooth" })
    }
  })
})

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  startLoading()
  window.initializeAnimations()

  // Initialize slider after a short delay to ensure DOM is ready
  setTimeout(initializeSlider, 100)
})

// Handle resize
window.addEventListener("resize", () => {
  if (typeof window.initializeSlider === "function") {
    window.initializeSlider()
  }
})
