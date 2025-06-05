// Audio Visualizer Variables
let audioContext
let analyser
let dataArray
let source
let isAudioInitialized = false
let isPlaying = false
let musicEnabled = false

// Audio Visualizer Elements
const backgroundMusic = document.getElementById("backgroundMusic")
const playPauseBtn = document.getElementById("playPauseBtn")
const volumeSlider = document.getElementById("volumeSlider")
const audioBorder = document.getElementById("audioBorder")
const cornerGlows = document.querySelectorAll(".corner-glow")
const playIcon = document.querySelector(".play-icon")
const pauseIcon = document.querySelector(".pause-icon")

// Music Popup Elements
const musicPopup = document.getElementById("musicPopup")
const enableMusicBtn = document.getElementById("enableMusic")
const disableMusicBtn = document.getElementById("disableMusic")

// Debug Elements
const debugPanel = document.getElementById("debugPanel")
const audioStatus = document.getElementById("audioStatus")
const musicStatus = document.getElementById("musicStatus")
const volumeStatus = document.getElementById("volumeStatus")
const testAudioBtn = document.getElementById("testAudio")
const hideDebugBtn = document.getElementById("hideDebug")

// Function to update debug panel
function updateDebugPanel() {
  if (audioStatus) {
    audioStatus.textContent = `Audio: ${isAudioInitialized ? "Initialized" : "Not Initialized"}`
  }
  if (musicStatus) {
    musicStatus.textContent = `Music: ${isPlaying ? "Playing" : "Stopped"}`
  }
  if (volumeStatus) {
    volumeStatus.textContent = `Volume: ${Math.round(backgroundMusic.volume * 100)}%`
  }
}

// Function to set music preference in localStorage
function setMusicPreference(enabled) {
  localStorage.setItem("musicEnabled", enabled)
  musicEnabled = enabled
  console.log("Music preference set to:", enabled)
}

// Function to get music preference from localStorage
function getMusicPreference() {
  const preference = localStorage.getItem("musicEnabled")
  return preference === "true"
}

// Function to show the music permission popup
function showMusicPopup() {
  musicPopup.classList.remove("hidden")
  console.log("Music popup shown")
}

// Function to hide the music permission popup
function hideMusicPopup() {
  musicPopup.classList.add("hidden")
  console.log("Music popup hidden")
}

// Event listeners for music permission buttons
enableMusicBtn.addEventListener("click", () => {
  console.log("User enabled music")
  setMusicPreference(true)
  hideMusicPopup()
  initializeAudio()
})

disableMusicBtn.addEventListener("click", () => {
  console.log("User disabled music")
  setMusicPreference(false)
  hideMusicPopup()
})

// Debug panel event listeners
testAudioBtn.addEventListener("click", async () => {
  console.log("Testing audio...")
  if (!isAudioInitialized) {
    await initializeAudio()
  }

  try {
    if (isPlaying) {
      backgroundMusic.pause()
      console.log("Audio paused")
    } else {
      await backgroundMusic.play()
      console.log("Audio playing")
    }
  } catch (error) {
    console.error("Test audio error:", error)
  }
  updateDebugPanel()
})

hideDebugBtn.addEventListener("click", () => {
  debugPanel.style.display = "none"
})

// Initialize Web Audio API
async function initializeAudio() {
  console.log("Initializing audio...")

  try {
    // First, try to load the audio file
    backgroundMusic.load()
    console.log("Audio element loaded")

    // Wait for the audio to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Audio loading timeout"))
      }, 10000) // 10 second timeout

      backgroundMusic.addEventListener(
        "canplaythrough",
        () => {
          clearTimeout(timeout)
          resolve()
        },
        { once: true },
      )

      backgroundMusic.addEventListener(
        "error",
        (e) => {
          clearTimeout(timeout)
          reject(new Error(`Audio loading error: ${backgroundMusic.error?.message || "Unknown error"}`))
        },
        { once: true },
      )
    })

    console.log("Audio file loaded successfully")

    // Create AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    console.log("AudioContext created, state:", audioContext.state)

    // Resume AudioContext if suspended
    if (audioContext.state === "suspended") {
      await audioContext.resume()
      console.log("AudioContext resumed")
    }

    // Create analyser
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 512 // Increased for better visualization
    analyser.smoothingTimeConstant = 0.8

    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)
    console.log("Analyser created, buffer length:", bufferLength)

    // Create audio source and connect
    source = audioContext.createMediaElementSource(backgroundMusic)
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    console.log("Audio graph connected")

    isAudioInitialized = true

    // Set initial volume
    backgroundMusic.volume = volumeSlider.value / 100
    console.log("Initial volume set to:", backgroundMusic.volume)

    // Start visualization loop
    visualize()

    // Try to autoplay if enabled
    if (musicEnabled) {
      try {
        await backgroundMusic.play()
        playIcon.style.display = "none"
        pauseIcon.style.display = "block"
        isPlaying = true
        console.log("Music started playing automatically")
      } catch (error) {
        console.log("Autoplay prevented (this is normal):", error.message)
        // Don't treat autoplay prevention as an error
      }
    }

    updateDebugPanel()
    console.log("Audio system initialized successfully")
  } catch (error) {
    console.error("Error initializing audio:", error)

    // Fallback: Initialize visualizer without audio
    console.log("Initializing visualizer in demo mode...")
    initializeDemoVisualizer()

    updateDebugPanel()
  }
}

// Demo visualizer that works without audio
function initializeDemoVisualizer() {
  console.log("Starting demo visualizer...")

  // Create fake audio data for demonstration
  const bufferLength = 128
  dataArray = new Uint8Array(bufferLength)

  // Fill with demo data
  function generateDemoData() {
    const time = Date.now() * 0.001
    for (let i = 0; i < bufferLength; i++) {
      // Create fake frequency data with some variation
      const frequency = (i / bufferLength) * 255
      const wave1 = Math.sin(time * 2 + i * 0.1) * 50
      const wave2 = Math.sin(time * 0.5 + i * 0.05) * 30
      dataArray[i] = Math.max(0, Math.min(255, frequency + wave1 + wave2))
    }
  }

  // Demo visualization loop
  function demoVisualize() {
    requestAnimationFrame(demoVisualize)

    generateDemoData()

    // Use the same visualization logic as the real visualizer
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    const intensity = average / 255

    // Calculate bass (low frequencies)
    let bassSum = 0
    const bassRange = Math.floor(dataArray.length * 0.1)
    for (let i = 0; i < bassRange; i++) {
      bassSum += dataArray[i]
    }
    const bassIntensity = bassSum / bassRange / 255

    // Calculate treble (high frequencies)
    let trebleSum = 0
    const trebleStart = Math.floor(dataArray.length * 0.7)
    for (let i = trebleStart; i < dataArray.length; i++) {
      trebleSum += dataArray[i]
    }
    const trebleIntensity = trebleSum / (dataArray.length - trebleStart) / 255

    // Update corner glows
    if (cornerGlows.length >= 4) {
      // Top-left: Bass
      const topLeft = cornerGlows[0]
      const bassOpacity = 0.4 + bassIntensity * 1.2
      const bassBlur = 120 + bassIntensity * 80
      topLeft.style.opacity = Math.min(bassOpacity, 1)
      topLeft.style.filter = `blur(${bassBlur}px)`

      // Top-right: Treble
      const topRight = cornerGlows[1]
      const trebleOpacity = 0.4 + trebleIntensity * 1.2
      const trebleBlur = 120 + trebleIntensity * 80
      topRight.style.opacity = Math.min(trebleOpacity, 1)
      topRight.style.filter = `blur(${trebleBlur}px)`

      // Bottom-left: Mid frequencies
      const bottomLeft = cornerGlows[2]
      const midStart = Math.floor(dataArray.length * 0.2)
      const midEnd = Math.floor(dataArray.length * 0.6)
      let midSum = 0
      for (let i = midStart; i < midEnd; i++) {
        midSum += dataArray[i]
      }
      const midIntensity = midSum / (midEnd - midStart) / 255
      const midOpacity = 0.4 + midIntensity * 1.2
      const midBlur = 120 + midIntensity * 80
      bottomLeft.style.opacity = Math.min(midOpacity, 1)
      bottomLeft.style.filter = `blur(${midBlur}px)`

      // Bottom-right: Overall intensity
      const bottomRight = cornerGlows[3]
      const overallOpacity = 0.4 + intensity * 1.2
      const overallBlur = 120 + intensity * 80
      bottomRight.style.opacity = Math.min(overallOpacity, 1)
      bottomRight.style.filter = `blur(${overallBlur}px)`
    }

    // Update audio border
    const borderIntensity = bassIntensity * 3
    const borderColor = `rgba(255, 51, 51, ${Math.min(borderIntensity, 0.8)})`
    const borderGlow = Math.min(borderIntensity * 30, 20)
    audioBorder.style.borderColor = borderColor
    audioBorder.style.boxShadow = `inset 0 0 ${borderGlow}px ${borderColor}, 0 0 ${borderGlow}px ${borderColor}`
  }

  demoVisualize()
  console.log("Demo visualizer started")
}

// Audio visualization function
function visualize() {
  if (!isAudioInitialized || !analyser) return

  requestAnimationFrame(visualize)

  analyser.getByteFrequencyData(dataArray)

  // Calculate average frequency for overall intensity
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i]
  }
  const average = sum / dataArray.length
  const intensity = average / 255 // Normalize to 0-1

  // Calculate bass (low frequencies)
  let bassSum = 0
  const bassRange = Math.floor(dataArray.length * 0.1) // First 10% for bass
  for (let i = 0; i < bassRange; i++) {
    bassSum += dataArray[i]
  }
  const bassIntensity = bassSum / bassRange / 255

  // Calculate treble (high frequencies)
  let trebleSum = 0
  const trebleStart = Math.floor(dataArray.length * 0.7) // Last 30% for treble
  for (let i = trebleStart; i < dataArray.length; i++) {
    trebleSum += dataArray[i]
  }
  const trebleIntensity = trebleSum / (dataArray.length - trebleStart) / 255

  // Update corner glows based on different frequency ranges
  if (cornerGlows.length >= 4) {
    // Top-left: Bass
    const topLeft = cornerGlows[0]
    const bassOpacity = 0.4 + bassIntensity * 1.2
    const bassBlur = 120 + bassIntensity * 80
    topLeft.style.opacity = Math.min(bassOpacity, 1)
    topLeft.style.filter = `blur(${bassBlur}px)`

    // Top-right: Treble
    const topRight = cornerGlows[1]
    const trebleOpacity = 0.4 + trebleIntensity * 1.2
    const trebleBlur = 120 + trebleIntensity * 80
    topRight.style.opacity = Math.min(trebleOpacity, 1)
    topRight.style.filter = `blur(${trebleBlur}px)`

    // Bottom-left: Mid frequencies
    const bottomLeft = cornerGlows[2]
    const midStart = Math.floor(dataArray.length * 0.2)
    const midEnd = Math.floor(dataArray.length * 0.6)
    let midSum = 0
    for (let i = midStart; i < midEnd; i++) {
      midSum += dataArray[i]
    }
    const midIntensity = midSum / (midEnd - midStart) / 255
    const midOpacity = 0.4 + midIntensity * 1.2
    const midBlur = 120 + midIntensity * 80
    bottomLeft.style.opacity = Math.min(midOpacity, 1)
    bottomLeft.style.filter = `blur(${midBlur}px)`

    // Bottom-right: Overall intensity
    const bottomRight = cornerGlows[3]
    const overallOpacity = 0.4 + intensity * 1.2
    const overallBlur = 120 + intensity * 80
    bottomRight.style.opacity = Math.min(overallOpacity, 1)
    bottomRight.style.filter = `blur(${overallBlur}px)`
  }

  // Update audio border based on bass
  const borderIntensity = bassIntensity * 3 // Amplify bass effect
  const borderColor = `rgba(255, 51, 51, ${Math.min(borderIntensity, 0.8)})`
  const borderGlow = Math.min(borderIntensity * 30, 20)
  audioBorder.style.borderColor = borderColor
  audioBorder.style.boxShadow = `inset 0 0 ${borderGlow}px ${borderColor}, 0 0 ${borderGlow}px ${borderColor}`
}

// Play/Pause functionality
playPauseBtn.addEventListener("click", async () => {
  console.log("Play/Pause button clicked")

  if (!isAudioInitialized) {
    console.log("Audio not initialized, initializing...")
    await initializeAudio()
  }

  if (audioContext && audioContext.state === "suspended") {
    await audioContext.resume()
    console.log("AudioContext resumed")
  }

  if (isPlaying) {
    backgroundMusic.pause()
    playIcon.style.display = "block"
    pauseIcon.style.display = "none"
    isPlaying = false
    console.log("Music paused")
  } else {
    try {
      await backgroundMusic.play()
      playIcon.style.display = "none"
      pauseIcon.style.display = "block"
      isPlaying = true
      console.log("Music started playing")
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  updateDebugPanel()
})

// Volume control
volumeSlider.addEventListener("input", (e) => {
  const volume = e.target.value / 100
  backgroundMusic.volume = volume
  console.log("Volume changed to:", volume)

  // Update slider appearance
  const percentage = e.target.value
  e.target.style.background = `linear-gradient(to right, #ff3333 0%, #00ffff ${percentage}%, rgba(255,255,255,0.2) ${percentage}%, rgba(255,255,255,0.2) 100%)`

  updateDebugPanel()
})

// Initialize volume slider appearance
volumeSlider.style.background = `linear-gradient(to right, #ff3333 0%, #00ffff 30%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.2) 100%)`

// Audio event listeners
backgroundMusic.addEventListener("loadstart", () => {
  console.log("Audio loading started")
})

backgroundMusic.addEventListener("loadeddata", () => {
  console.log("Audio data loaded")
})

backgroundMusic.addEventListener("canplay", () => {
  console.log("Audio can start playing")
})

backgroundMusic.addEventListener("canplaythrough", () => {
  console.log("Audio can play through without buffering")
})

backgroundMusic.addEventListener("ended", () => {
  playIcon.style.display = "block"
  pauseIcon.style.display = "none"
  isPlaying = false
  console.log("Audio ended")
  updateDebugPanel()
})

backgroundMusic.addEventListener("error", (e) => {
  console.error("Audio error:", e)
  console.error("Error details:", backgroundMusic.error)
  updateDebugPanel()
})

backgroundMusic.addEventListener("play", () => {
  console.log("Audio play event fired")
  isPlaying = true
  updateDebugPanel()
})

backgroundMusic.addEventListener("pause", () => {
  console.log("Audio pause event fired")
  isPlaying = false
  updateDebugPanel()
})

// Handle user interaction for audio autoplay
document.addEventListener(
  "click",
  async () => {
    if (!isAudioInitialized && musicEnabled) {
      console.log("User interaction detected, initializing audio")
      await initializeAudio()
    }

    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume()
      console.log("AudioContext resumed after user interaction")
    }
  },
  { once: true },
)

// Initialize debug panel
updateDebugPanel()
