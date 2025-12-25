/* ================================================
   WAYNOVA TECHNOLOGIES - MAIN SCRIPT
   3D Particle Animation, Scroll Effects, Interactions
   ================================================ */

// ================================================
// STOCK CHART BACKGROUND ANIMATION
// ================================================
class StockChartAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.charts = [];
        this.candlesticks = [];
        this.gridLines = [];
        this.time = 0;

        this.colors = {
            blue: '#0066FF',
            blueGlow: 'rgba(0, 102, 255, 0.3)',
            gold: '#FFD700',
            goldGlow: 'rgba(255, 215, 0, 0.3)',
            green: '#00ff88',
            red: '#ff4444',
            grid: 'rgba(255, 255, 255, 0.03)'
        };

        this.init();
        this.animate();
    }

    init() {
        this.resize();
        this.createChartElements();
        window.addEventListener('resize', () => {
            this.resize();
            this.createChartElements();
        });
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    createChartElements() {
        // Create multiple chart lines
        this.charts = [];
        for (let i = 0; i < 3; i++) {
            const points = [];
            const baseY = this.canvas.height * (0.3 + i * 0.25);
            const amplitude = 30 + Math.random() * 40;
            const frequency = 0.01 + Math.random() * 0.02;
            const phase = Math.random() * Math.PI * 2;

            for (let x = 0; x < this.canvas.width + 100; x += 5) {
                const y = baseY + Math.sin(x * frequency + phase) * amplitude;
                points.push({ x, y, baseY, amplitude, frequency, phase });
            }

            this.charts.push({
                points,
                color: i === 0 ? this.colors.blue : i === 1 ? this.colors.gold : this.colors.green,
                glowColor: i === 0 ? this.colors.blueGlow : i === 1 ? this.colors.goldGlow : 'rgba(0, 255, 136, 0.3)',
                opacity: 0.3 - i * 0.08,
                speed: 0.3 + i * 0.1
            });
        }

        // Create candlesticks
        this.candlesticks = [];
        const candleCount = Math.floor(this.canvas.width / 80);
        for (let i = 0; i < candleCount; i++) {
            const x = i * 80 + 40 + Math.random() * 20;
            const isGreen = Math.random() > 0.45;
            const height = 20 + Math.random() * 60;
            const baseY = this.canvas.height * 0.5 + (Math.random() - 0.5) * 200;

            this.candlesticks.push({
                x,
                y: baseY,
                width: 8,
                height,
                wickHeight: height + 10 + Math.random() * 20,
                isGreen,
                opacity: 0.15 + Math.random() * 0.1,
                pulseSpeed: 0.5 + Math.random() * 0.5
            });
        }

        // Create grid lines
        this.gridLines = [];
        const gridSpacing = 60;
        for (let y = gridSpacing; y < this.canvas.height; y += gridSpacing) {
            this.gridLines.push({ y, opacity: 0.02 });
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        this.gridLines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, line.y);
            this.ctx.lineTo(this.canvas.width, line.y);
            this.ctx.stroke();
        });
    }

    drawChartLine(chart) {
        const { points, color, glowColor, opacity, speed } = chart;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // Draw glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = glowColor;

        // Draw line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        points.forEach((point, index) => {
            const animatedX = point.x - this.time * speed;
            const wrappedX = ((animatedX % (this.canvas.width + 100)) + this.canvas.width + 100) % (this.canvas.width + 100) - 50;
            const animatedY = point.baseY + Math.sin((wrappedX * point.frequency) + point.phase + this.time * 0.02) * point.amplitude;

            if (index === 0) {
                this.ctx.moveTo(wrappedX, animatedY);
            } else {
                this.ctx.lineTo(wrappedX, animatedY);
            }
        });

        this.ctx.stroke();

        // Draw gradient fill below line
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, color.replace(')', ', 0.1)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.ctx.restore();
    }

    drawCandlestick(candle) {
        const pulse = Math.sin(this.time * candle.pulseSpeed) * 0.3 + 0.7;
        const opacity = candle.opacity * pulse;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        const color = candle.isGreen ? this.colors.green : this.colors.red;

        // Draw wick
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(candle.x + candle.width / 2, candle.y - candle.wickHeight / 2);
        this.ctx.lineTo(candle.x + candle.width / 2, candle.y + candle.wickHeight / 2);
        this.ctx.stroke();

        // Draw body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            candle.x,
            candle.y - candle.height / 2,
            candle.width,
            candle.height
        );

        // Add glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillRect(
            candle.x,
            candle.y - candle.height / 2,
            candle.width,
            candle.height
        );

        this.ctx.restore();
    }

    drawBarChart() {
        const barCount = 12;
        const barWidth = 20;
        const gap = 15;
        const startX = this.canvas.width - (barCount * (barWidth + gap)) - 50;
        const baseY = this.canvas.height - 100;

        this.ctx.save();
        this.ctx.globalAlpha = 0.15;

        for (let i = 0; i < barCount; i++) {
            const x = startX + i * (barWidth + gap);
            const height = 30 + Math.sin(this.time * 0.03 + i * 0.5) * 20 + Math.random() * 10;

            const gradient = this.ctx.createLinearGradient(x, baseY, x, baseY - height);
            gradient.addColorStop(0, this.colors.blue);
            gradient.addColorStop(1, this.colors.gold);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, baseY - height, barWidth, height);

            // Glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.colors.blueGlow;
        }

        this.ctx.restore();
    }

    drawFloatingNumbers() {
        const numbers = ['+2.45%', '-0.87%', '+5.12%', '1,234.56', '+12.3%'];
        const positions = [
            { x: 100, y: 150 },
            { x: this.canvas.width - 200, y: 200 },
            { x: 200, y: this.canvas.height - 200 },
            { x: this.canvas.width / 2, y: 100 },
            { x: this.canvas.width - 150, y: this.canvas.height - 150 }
        ];

        this.ctx.save();
        this.ctx.font = '600 14px Inter, sans-serif';

        numbers.forEach((num, i) => {
            const pos = positions[i];
            const pulse = Math.sin(this.time * 0.02 + i) * 0.3 + 0.7;
            const isPositive = num.includes('+');

            this.ctx.globalAlpha = 0.15 * pulse;
            this.ctx.fillStyle = isPositive ? this.colors.green : (num.includes('-') ? this.colors.red : this.colors.gold);
            this.ctx.fillText(num, pos.x + Math.sin(this.time * 0.01 + i) * 5, pos.y + Math.cos(this.time * 0.015 + i) * 3);
        });

        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw chart lines
        this.charts.forEach(chart => this.drawChartLine(chart));

        // Draw candlesticks
        this.candlesticks.forEach(candle => this.drawCandlestick(candle));

        // Draw bar chart
        this.drawBarChart();

        // Draw floating numbers
        this.drawFloatingNumbers();

        this.time += 1;
        requestAnimationFrame(() => this.animate());
    }
}

// ================================================
// PARTICLES ANIMATION - Enhanced Neural Network Style
// ================================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 180 };
        this.particleCount = 200; // Increased particle count
        this.connectionDistance = 150; // Neural network connection distance
        this.colors = ['#0066FF', '#FFD700', '#ffffff', '#3388FF', '#FFE44D'];

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            // Uniform dot sizes with slight variation
            const size = Math.random() * 1.5 + 1;
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            // Slower, more uniform movement like floating in space
            const speedX = (Math.random() - 0.5) * 0.3;
            const speedY = (Math.random() - 0.5) * 0.3;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const opacity = Math.random() * 0.6 + 0.2;

            this.particles.push({
                x, y, size, speedX, speedY, color, opacity,
                baseX: x, baseY: y,
                density: Math.random() * 30 + 1,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawArrowHead(fromX, fromY, toX, toY, color, alpha) {
        const headLength = 6;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        // Calculate midpoint for arrow
        const midX = fromX + dx * 0.6;
        const midY = fromY + dy * 0.6;

        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.8;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(midX, midY);
        this.ctx.lineTo(
            midX - headLength * Math.cos(angle - Math.PI / 6),
            midY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            midX - headLength * Math.cos(angle + Math.PI / 6),
            midY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // First pass: draw all connections with arrows
        this.particles.forEach((particle, i) => {
            this.connectParticlesWithArrows(particle, i);
        });

        // Second pass: draw all particles on top
        this.particles.forEach((particle, i) => {
            // Mouse interaction - particles repel from cursor
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = this.mouse.radius;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * particle.density * 0.5;
                    const directionY = forceDirectionY * force * particle.density * 0.5;

                    particle.x -= directionX;
                    particle.y -= directionY;
                }
            }

            // Return to base position slowly
            const dx = particle.baseX - particle.x;
            const dy = particle.baseY - particle.y;
            particle.x += dx * 0.03;
            particle.y += dy * 0.03;

            // Float movement - space-like drifting
            particle.baseX += particle.speedX;
            particle.baseY += particle.speedY;

            // Wrap around boundaries for continuous flow
            if (particle.baseX < -10) particle.baseX = this.canvas.width + 10;
            if (particle.baseX > this.canvas.width + 10) particle.baseX = -10;
            if (particle.baseY < -10) particle.baseY = this.canvas.height + 10;
            if (particle.baseY > this.canvas.height + 10) particle.baseY = -10;

            // Pulsing glow effect
            particle.pulsePhase += particle.pulseSpeed;
            const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
            const currentOpacity = particle.opacity * pulse;

            // Draw particle with glow
            this.ctx.save();

            // Outer glow
            this.ctx.globalAlpha = currentOpacity * 0.3;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Core particle
            this.ctx.globalAlpha = currentOpacity;
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }

    connectParticlesWithArrows(particle, index) {
        for (let j = index + 1; j < this.particles.length; j++) {
            const other = this.particles[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.connectionDistance) {
                const alpha = (1 - distance / this.connectionDistance) * 0.25;

                // Draw connection line
                this.ctx.save();
                this.ctx.globalAlpha = alpha;

                // Gradient line between particles
                const gradient = this.ctx.createLinearGradient(
                    particle.x, particle.y, other.x, other.y
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, other.color);

                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(other.x, other.y);
                this.ctx.stroke();
                this.ctx.restore();

                // Draw arrow head on some connections for neural network effect
                if (Math.random() > 0.7 && distance < this.connectionDistance * 0.7) {
                    this.drawArrowHead(
                        particle.x, particle.y,
                        other.x, other.y,
                        particle.color,
                        alpha
                    );
                }
            }
        }
    }
}

// ================================================
// SCROLL ANIMATIONS
// ================================================
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.glass-card, .section-header, .about-card, .bento-item, .research-card, .benefit-item');
        this.init();
    }

    init() {
        this.elements.forEach(el => {
            el.classList.add('reveal');
        });

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => this.observer.observe(el));
    }
}

// ================================================
// NAVBAR SCROLL EFFECT
// ================================================
class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.initSmoothScroll();
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            this.navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            this.navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            this.navbar.style.background = 'rgba(10, 10, 10, 0.8)';
            this.navbar.style.boxShadow = 'none';
        }

        this.lastScrollY = currentScrollY;
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ================================================
// CONTACT FORM
// ================================================
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Create mailto link with form data
        const subject = encodeURIComponent(data.subject || 'Contact from Website');
        const body = encodeURIComponent(`
Name: ${data.name}
Email: ${data.email}

Message:
${data.message}
        `);

        window.location.href = `mailto:waynovatechnologies@gmail.com?subject=${subject}&body=${body}`;

        // Show success message
        this.showNotification('Opening your email client...', 'success');
        this.form.reset();
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: linear-gradient(135deg, #0066FF 0%, #3388FF 100%);
            color: white;
            border-radius: 12px;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0, 102, 255, 0.3);
            z-index: 9999;
            animation: slideIn 0.3s ease forwards;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ================================================
// MOBILE MENU
// ================================================
class MobileMenu {
    constructor() {
        this.button = document.getElementById('mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        this.isOpen = false;

        if (this.button) {
            this.init();
        }
    }

    init() {
        this.button.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.createMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    createMobileMenu() {
        const menu = document.createElement('div');
        menu.id = 'mobile-menu';
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(20px);
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            animation: fadeIn 0.3s ease forwards;
        `;

        const links = [
            { href: '#about', text: 'About' },
            { href: '#features', text: 'Features' },
            { href: '#research', text: 'Research' },
            { href: '#community', text: 'Community' },
            { href: '#contact', text: 'Contact' }
        ];

        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            a.style.cssText = `
                font-size: 1.5rem;
                font-weight: 600;
                color: white;
                text-decoration: none;
                transition: color 0.2s ease;
            `;
            a.addEventListener('click', () => this.closeMobileMenu());
            menu.appendChild(a);
        });

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 10px;
        `;
        closeBtn.addEventListener('click', () => this.closeMobileMenu());
        menu.appendChild(closeBtn);

        document.body.appendChild(menu);
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => menu.remove(), 300);
        }
        document.body.style.overflow = '';
        this.isOpen = false;
    }
}

// ================================================
// PARALLAX EFFECT FOR HERO
// ================================================
class ParallaxEffect {
    constructor() {
        this.heroContent = document.querySelector('.hero-content');
        this.floatingCards = document.querySelectorAll('.floating-card');
        this.init();
    }

    init() {
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleMouseMove(e) {
        const x = (window.innerWidth / 2 - e.clientX) / 50;
        const y = (window.innerHeight / 2 - e.clientY) / 50;

        this.floatingCards.forEach((card, index) => {
            const factor = (index + 1) * 0.5;
            card.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    }
}

// ================================================
// TYPING EFFECT
// ================================================
class TypeWriter {
    constructor(element, words, wait = 3000) {
        this.element = element;
        this.words = words;
        this.wait = parseInt(wait, 10);
        this.wordIndex = 0;
        this.txt = '';
        this.isDeleting = false;

        if (this.element) {
            this.type();
        }
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.innerHTML = this.txt;

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ================================================
// COUNTER ANIMATION
// ================================================
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat-value');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateCounters();
                    this.hasAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.hero-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const text = counter.textContent;
            const target = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/[0-9]/g, '');
            const duration = 2000;
            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(target * easeProgress);

                counter.textContent = current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        });
    }
}



// ================================================
// ADD DYNAMIC STYLES
// ================================================
const addDynamicStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
};

// ================================================
// INITIALIZE ALL COMPONENTS
// ================================================
document.addEventListener('DOMContentLoaded', () => {
    // Add dynamic styles
    addDynamicStyles();

    // Initialize particle system
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // Initialize scroll reveal
    new ScrollReveal();

    // Initialize navbar
    new Navbar();

    // Initialize contact form
    new ContactForm();

    // Initialize mobile menu
    new MobileMenu();

    // Initialize parallax
    new ParallaxEffect();

    // Initialize counter animation
    new CounterAnimation();

    console.log('🚀 Waynova Technologies - All systems initialized');
});
