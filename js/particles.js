// ============================================
// LIGHTWEIGHT PARTICLE SYSTEM FOR MOBILE
// Optimized for 60fps performance
// ============================================

(function() {
    'use strict';

    // Configuration - optimized for mobile and desktop
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    const config = {
        particleCount: isMobile ? 30 : (isTablet ? 50 : 80), // Adaptive particle count
        particleSize: isMobile ? 2 : 2.5,
        particleSpeed: 0.4,
        connectionDistance: isMobile ? 100 : 150,
        particleColor: 'rgba(0, 212, 255, 0.7)',
        lineColor: 'rgba(0, 255, 157, 0.15)'
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    const particles = [];
    let animationId;

    // Initialize
    function init() {
        const container = document.getElementById('particles');
        if (!container) return;

        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';

        container.appendChild(canvas);

        resize();
        createParticles();
        animate();

        // Handle resize with debounce for performance
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resize, 250);
        });
    }

    // Resize canvas
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
            this.radius = config.particleSize;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around screen edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor;
            ctx.fill();
        }
    }

    // Create particles
    function createParticles() {
        particles.length = 0;
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections between nearby particles
    function drawConnections() {
        const maxDistance = config.connectionDistance;
        const maxDistanceSq = maxDistance * maxDistance; // Use squared distance to avoid sqrt

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq < maxDistanceSq) {
                    const opacity = 1 - (distanceSq / maxDistanceSq);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 157, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop - optimized with requestAnimationFrame
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        // Draw connections
        drawConnections();

        animationId = requestAnimationFrame(animate);
    }

    // Pause animation when page is not visible (saves battery)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        } else {
            animate();
        }
    });

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
