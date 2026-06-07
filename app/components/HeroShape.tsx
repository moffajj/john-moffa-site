"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroShape() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- Solid icosahedron ---
    const geo = new THREE.IcosahedronGeometry(1.4, 0);

    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const solid = new THREE.Mesh(geo, solidMat);
    scene.add(solid);

    // --- Wireframe overlay ---
    const wireGeo = new THREE.IcosahedronGeometry(1.41, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // --- Lighting ---
    const ambient = new THREE.AmbientLight(0x111111, 2);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xc9a84c, 30, 15);
    keyLight.position.set(3, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x443322, 8, 10);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    // --- Mouse parallax ---
    const mouse = { x: 0, y: 0 };
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
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

    // --- Animate ---
    let animId: number;
    let t = 0;
    let targetRX = 0;
    let targetRY = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;

      solid.rotation.x += 0.004;
      solid.rotation.y += 0.006;
      wire.rotation.x = solid.rotation.x;
      wire.rotation.y = solid.rotation.y;

      if (!isMobile) {
        targetRX += (mouse.y * 0.3 - targetRX) * 0.05;
        targetRY += (mouse.x * 0.3 - targetRY) * 0.05;
        solid.rotation.x += targetRX * 0.01;
        solid.rotation.y += targetRY * 0.01;
        wire.rotation.x = solid.rotation.x;
        wire.rotation.y = solid.rotation.y;
      }

      // Breathe light
      keyLight.intensity = 28 + Math.sin(t) * 6;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      solidMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
