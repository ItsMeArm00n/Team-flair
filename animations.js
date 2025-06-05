// Create enhanced floating geometric shapes
function createFloatingShapes() {
  const shapesContainer = document.getElementById("floatingShapes")
  const shapeTypes = ["triangle", "square", "circle"]
  const shapeCount = 20

  for (let i = 0; i < shapeCount; i++) {
    const shape = document.createElement("div")
    shape.classList.add("shape", shapeTypes[Math.floor(Math.random() * shapeTypes.length)])
    shape.style.left = Math.random() * 100 + "%"
    shape.style.animationDelay = Math.random() * 20 + "s"
    shape.style.animationDuration = Math.random() * 10 + 15 + "s"
    shapesContainer.appendChild(shape)
  }
}

// Create enhanced animated particles
function createParticles() {
  const particlesContainer = document.getElementById("particles")
  const particleCount = 70

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.classList.add("particle")
    particle.style.left = Math.random() * 100 + "%"
    particle.style.animationDelay = Math.random() * 10 + "s"
    particle.style.animationDuration = Math.random() * 5 + 5 + "s"

    // Random particle sizes and colors
    const size = Math.random() * 3 + 1
    particle.style.width = size + "px"
    particle.style.height = size + "px"

    const colors = ["#ff3333", "#00ffff", "#0080ff"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    particle.style.background = color
    particle.style.boxShadow = `0 0 10px ${color}`

    particlesContainer.appendChild(particle)
  }
}

// Enhanced scroll animations with stagger effect
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.animationPlayState = "running"
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }, index * 100)
    }
  })
}, observerOptions)

// Initialize scroll animations
function initializeScrollAnimations() {
  document.querySelectorAll(".section, .about-content, .member-card").forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(50px)"
    el.style.transition = "all 1.2s ease"
    observer.observe(el)
  })
}

// Add parallax effect to hero
function initializeParallax() {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const hero = document.querySelector(".hero")
    if (hero) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`
    }
  })
}

// Enhanced navbar scroll effect
function initializeNavbarScroll() {
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar")
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled")
    } else {
      navbar.classList.remove("scrolled")
    }
  })
}

// Initialize all animations
function initializeAnimations() {
  createFloatingShapes()
  createParticles()
  initializeScrollAnimations()
  initializeParallax()
  initializeNavbarScroll()
}
