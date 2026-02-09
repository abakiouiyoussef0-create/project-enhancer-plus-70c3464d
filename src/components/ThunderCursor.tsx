import { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

interface ThunderCursorProps {
    theme?: 'thunder' | 'spider';
}

export function ThunderCursor({ theme = 'thunder' }: ThunderCursorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const lastPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e: MouseEvent) => {
            const { x: lastX, y: lastY } = lastPosRef.current;
            const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);

            lastPosRef.current = { x: e.clientX, y: e.clientY };

            if (theme === 'thunder') {
                // THUNDER: Create jagged lightning segments
                if (dist > 5) { // Only create if moved enough
                    const steps = Math.min(dist / 5, 5); // Interpolate points
                    for (let i = 0; i < steps; i++) {
                        const t = i / steps;
                        const x = lastX + (e.clientX - lastX) * t;
                        const y = lastY + (e.clientY - lastY) * t;

                        // Add main bolt point
                        pointsRef.current.push({
                            x: x + (Math.random() - 0.5) * 10,
                            y: y + (Math.random() - 0.5) * 10,
                            vx: 0,
                            vy: 0,
                            life: 1.0,
                            color: `hsla(${260 + Math.random() * 40}, 100%, 70%, 1)`
                        });

                        // Random chance for a branch
                        if (Math.random() > 0.8) {
                            pointsRef.current.push({
                                x: x,
                                y: y,
                                vx: (Math.random() - 0.5) * 5,
                                vy: (Math.random() - 0.5) * 5,
                                life: 0.6,
                                color: `hsla(190, 100%, 70%, 1)` // Cyan branch
                            });
                        }
                    }
                }
            } else if (theme === 'spider') {
                // SPIDER: Particles that stick around to form webs
                if (dist > 2) {
                    pointsRef.current.push({
                        x: e.clientX,
                        y: e.clientY,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: (Math.random() - 0.5) * 0.5,
                        life: 1.0,
                        color: 'rgba(255, 255, 255, 1)'
                    });
                }
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update points
            pointsRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= theme === 'thunder' ? 0.04 : 0.01; // Spider webs last longer
            });
            pointsRef.current = pointsRef.current.filter(p => p.life > 0);

            if (theme === 'thunder') {
                // Draw Lightning Effect
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                // Group points into a path? No, lightning is chaotic.
                // We connect recent points to simulate a continuous bolt
                // But for a particle system, we can just draw segments

                for (let i = 0; i < pointsRef.current.length - 1; i++) {
                    const p = pointsRef.current[i];
                    // Connect to a nearby newer point to maximize "bolt" look
                    // Actually, just drawing small lines from p to slightly random offset works for "sparks"
                    // But to look like a trail, we should connect them.
                }

                // Better Thunder: Connect random nearby points
                pointsRef.current.forEach((p, i) => {
                    // Find neighbors
                    for (let j = i + 1; j < pointsRef.current.length; j++) {
                        const p2 = pointsRef.current[j];
                        const d = Math.hypot(p.x - p2.x, p.y - p2.y);

                        if (d < 40) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = p.color.replace(', 1)', `, ${p.life})`);
                            ctx.lineWidth = p.life * 3;
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = p.color; // Glow
                            ctx.stroke();
                        }
                    }
                });

            } else if (theme === 'spider') {
                // Draw Web Effect
                ctx.lineWidth = 1;

                pointsRef.current.forEach((p, i) => {
                    // Draw particle
                    ctx.fillStyle = `rgba(200, 50, 50, ${p.life})`; // Deep Red/White for Dilexit
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
                    ctx.fill();

                    // Connect to neighbors
                    for (let j = i + 1; j < pointsRef.current.length; j++) {
                        const p2 = pointsRef.current[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 100) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            const alpha = (1 - dist / 100) * p.life * p2.life;
                            ctx.strokeStyle = `rgba(180, 40, 40, ${alpha})`; // Red webs
                            ctx.stroke();
                        }
                    }
                });
            }

            requestAnimationFrame(animate);
        };
        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[9999] mix-blend-screen"
        />
    );
}
