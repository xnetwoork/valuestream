/**
 * VALUESTREAMHUB AI - MODEL CONSTELLATION ANIMATED CANVAS
 * Renders a reactive 2D/3D computational node matrix with model hubs
 * representing OpenAI, Anthropic, Google, xAI, DeepSeek, Mistral, Meta, Qwen, Cohere, NVIDIA.
 */

(function initModelConstellationCanvas() {
    const canvas = document.getElementById('vsh-constellation-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement.offsetHeight || 650;

    let mouseX = width / 2;
    let mouseY = height / 2;

    const nodes = [];
    const nodeCount = Math.min(50, Math.floor(width / 25));

    const providerColors = ['#10a37f', '#d97706', '#4285f4', '#ffffff', '#3b82f6', '#ff7000', '#0668e1', '#ff6a00', '#76b900'];

    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2.5 + 1.2,
            color: providerColors[i % providerColors.length],
            pulse: Math.random() * Math.PI * 2
        });
    }

    function resize() {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement.offsetHeight || 650;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const alpha = (1 - dist / 140) * 0.25;
                    ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach((node) => {
            node.x += node.vx;
            node.y += node.vy;
            node.pulse += 0.03;

            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;

            const scale = 1 + Math.sin(node.pulse) * 0.3;

            ctx.fillStyle = node.color;
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(draw);
    }

    draw();
})();
