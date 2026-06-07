"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroShape() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Scene ---
    const scene = new THREE.Scene();

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- Geometry ---
    const geo = new THREE.IcosahedronGeometry(1.35, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      metalness: 0.85,
      roughness: 0.25,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // --- Lights ---
    // Ambient fill
    const ambient = new THREE.AmbientLight(0x222222, 1.2);
    scene.add(ambient);

    // Amber/gold key light
    const keyLight = new THREE.PointLight(0xc9a84c, 18, 12);
    keyLight.position.set(2.5, 2, 3);
    scene.add(keyLight);

    // Cool rim light opposite side
    const rimLight = new THREE.PointLight(0x2060a0, 6, 10);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    // --- Mouse tracking ---
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- Resize ---
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- Animation ---
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;

      // Auto-rotate
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;

      // Subtle parallax toward cursor
      if (!isMobile) {
        target.x += (mouse.x * 0.15 - target.x) * 0.04;
        target.y += (mouse.y * 0.15 - target.y) * 0.04;
        mesh.rotation.y += target.x * 0.01;
        mesh.rotation.x += target.y * 0.01;
      }

      // Gentle amber light breathe
      keyLight.intensity = 16 + Math.sin(t * 1.2) * 3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
