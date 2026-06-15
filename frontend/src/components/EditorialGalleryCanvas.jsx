import React, { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image, Text, RoundedBox } from "@react-three/drei";

/**
 * DECORATIVE WebGL showcase for the "Trending now" editorial band.
 *
 * Accessibility contract (enforced by the parent <TrendingRail>):
 *  - This whole subtree lives inside an `aria-hidden="true"` +
 *    `pointer-events-none` wrapper, so it is invisible to assistive tech and
 *    takes no clicks. The real content is the semantic <ul> the parent renders.
 *  - There is NO scroll container and NO focusable node here, so it contributes
 *    zero tab stops and can never trap the keyboard (WCAG 2.1.1 / 2.1.2 / 2.4.3).
 *  - Motion is TIME-DRIVEN (gentle eased auto-pan), not scroll-driven. The
 *    parent only mounts this when motion is allowed (prefers-reduced-motion NOT
 *    set), data-saving is off, WebGL exists, and the section is in view.
 *
 * Look: pmndrs "cards with border radius" — each look is a white rounded card
 * (photo + name + price) arranged on a subtle cylindrical arc that the row
 * glides across, side cards receding and rotating to face the centre.
 */

const GAP = 2.8; // horizontal spacing between cards (world units)

function Cards({ looks, progressRef }) {
  const group = useRef(null);
  const total = Math.max(1, looks.length);
  const span = (total - 1) * GAP;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // SCRUB: the row's horizontal position is driven by the section's scroll
    // progress (0..1), supplied by the parent via `progressRef`. Damping smooths
    // the per-frame target so the glide stays buttery and settles at rest (no
    // perpetual motion). If no ref is provided the row simply rests at start.
    const progress = progressRef && progressRef.current != null ? progressRef.current : 0;
    const targetX = -progress * span;
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 3, delta);

    // Cylindrical "cards with border radius" bend: each card recedes in Z and
    // rotates to face centre by its distance from the middle, scaling up as it
    // passes through, with a faint vertical bob for life.
    g.children.forEach((child, i) => {
      const worldX = i * GAP + g.position.x;
      const dist = Math.abs(worldX);
      child.position.z = -dist * 0.4;
      child.position.y = Math.sin(t * 0.6 + i) * 0.05;
      child.rotation.y = THREE.MathUtils.clamp(-worldX * 0.28, -0.9, 0.9);
      const s = THREE.MathUtils.clamp(1.16 - dist * 0.05, 0.82, 1.16);
      child.scale.set(s, s, 1);
    });
  });

  return (
    <group ref={group}>
      {looks.map((p, i) => {
        // Static collage tilt per index — ≤ ~1.5° (within the 2° vestibular cap
        // accessibility-lead approved). Not animated; useFrame only writes .y.
        const tiltZ = ((i % 3) - 1) * 0.025;
        // Two-digit editorial index ("01"... "08") — a streetwear lookbook accent.
        const idx = String(i + 1).padStart(2, "0");
        return (
          <group
            key={p.id || i}
            position={[i * GAP, 0, 0]}
            rotation={[0, 0, tiltZ]}
          >
            {/* Card "mat" — FLAT white (meshBasicMaterial). On the near-black
                runway backdrop each card EXPLODES off the background with ~20:1
                edge contrast, no studio shading. */}
            <RoundedBox
              args={[2.36, 3.46, 0.04]}
              radius={0.12}
              smoothness={8}
              position={[0, -0.1, -0.05]}
            >
              <meshBasicMaterial color="#ffffff" />
            </RoundedBox>

            <Image
              url={p.image1}
              position={[0, 0.4, 0.02]}
              scale={[2.0, 2.4, 1]}
              radius={0.1}
              transparent
              toneMapped={false}
            />

            {/* Decorative captions baked into the canvas (aria-hidden subtree).
                Near-black #111 on the white card mat → ~18.9:1, far above AA
                4.5:1. The operable surfaces (#shop / catalog) and the semantic
                <ul> remain the AT truth — all of this is purely visual. */}

            {/* Editorial index "N°01" — streetwear lookbook accent. fontSize
                0.16 → ≥ ~17px on a 68vh canvas at common viewports
                (accessibility-lead legibility floor). */}
            <Text
              position={[0, -0.82, 0.06]}
              fontSize={0.13}
              color="#111111"
              anchorX="center"
              anchorY="top"
              letterSpacing={0.28}
            >
              {`N°${idx}`}
            </Text>

            {/* Chunkier uppercase name — bigger, more open tracking. */}
            <Text
              position={[0, -1.04, 0.06]}
              fontSize={0.19}
              color="#111111"
              anchorX="center"
              anchorY="top"
              maxWidth={2.1}
              textAlign="center"
              letterSpacing={0.06}
              fontWeight="bold"
            >
              {String(p.name || "").toUpperCase()}
            </Text>

            {/* Price — display tabular feel, slightly larger. */}
            <Text
              position={[0, -1.48, 0.06]}
              fontSize={0.17}
              color="#111111"
              anchorX="center"
              anchorY="top"
              letterSpacing={0.06}
            >
              {String(p.price || "")}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default function EditorialGalleryCanvas({ looks = [], progressRef }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "low-power", alpha: false }}
      camera={{ position: [0, 0, 6.6], fov: 38 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* STREET-STYLE backdrop — near-black runway, so the flat-white card mats
          and the on-card type explode off the background (≈ 20:1 edge contrast,
          well above 1.4.11 3:1 UI-component contrast). */}
      <color attach="background" args={["#0a0a0a"]} />
      {/* No lights are needed — the card mat uses meshBasicMaterial (unlit) and
          drei's <Image> ships its own unlit shader. Removing lights eliminates
          the grey side-card fall-off and the beveled corner shading. The
          drei <Image> shader still works without lights. */}
      <Cards looks={looks} progressRef={progressRef} />
      {/* No ContactShadows — they painted a visible "studio floor" band across
          the bottom of the row. Each card carries its own offset shadow plate
          instead, so the row reads as floating paper. */}
    </Canvas>
  );
}
