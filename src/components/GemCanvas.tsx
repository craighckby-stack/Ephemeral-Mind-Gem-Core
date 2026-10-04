/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/GemCanvas.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GemCanvasProps {
  status: 'idle' | 'loading' | 'error';
}

const colorMap = {
  idle: 0x84cc16,    // Neon Lime Green
  loading: 0xa3e635, // Bright yellow-green
  error: 0xef4444,   // Crimson Red
};

export default function GemCanvas({ status }: GemCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // References to THREE objects to update them dynamic on status change
  const gemRef = useRef<THREE.LineSegments | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);

    // 2. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 2.5;

    // 3. Geometry Setup - Icosahedron
    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: colorMap[status],
      linewidth: 2,
    });
    const gem = new THREE.LineSegments(wireframe, material);
    scene.add(gem);
    gemRef.current = gem;

    // 4. Ambient light
    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);

    // 5. Drag/Rotation Event Listeners
    const onMouseDown = () => {
      isDraggingRef.current = true;
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };
    const onMouseMove = (event: MouseEvent) => {
      if (isDraggingRef.current && canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        rotationRef.current.y = -mouseX * Math.PI * 0.8;
        rotationRef.current.x = -mouseY * Math.PI * 0.8;
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);

    // 6. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 7. Animation Loop
    const animate = () => {
      let speed = 0.003;
      if (status === 'loading') speed = 0.015;
      if (status === 'error') speed = 0.0005;

      if (gem) {
        gem.rotation.y += speed;
        gem.rotation.x += speed * 0.5;

        // Damping the manual mouse rotation
        gem.rotation.y += (rotationRef.current.y - gem.rotation.y) * 0.05;
        gem.rotation.x += (rotationRef.current.x - gem.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
      geometry.dispose();
      wireframe.dispose();
      material.dispose();
    };
  }, [status]);

  return (
    <div
      ref={containerRef}
      id="gem-container"
      className="h-64 dos-panel overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center bg-black"
    >
      <canvas ref={canvasRef} id="gem-canvas" className="block w-full h-full" />
    </div>
  );
}
