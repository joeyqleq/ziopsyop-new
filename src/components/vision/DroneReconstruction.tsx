"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cn } from "@/lib/utils";

type ViewName = "iso" | "top" | "front" | "side";
type PartId = "frame" | "motors" | "camera" | "spool" | "payload" | "power";

interface PartDefinition {
  id: PartId;
  index: string;
  label: string;
  status: "OBSERVED" | "PROBABLE" | "UNRESOLVED";
  detail: string;
  color: string;
}

const PARTS: PartDefinition[] = [
  {
    id: "frame",
    index: "01",
    label: "LONG-RANGE X FRAME",
    status: "OBSERVED",
    detail: "Campaign imagery shows a large four-arm quadcopter. The exact frame manufacturer and dimensions remain unverified.",
    color: "#b6ff7c",
  },
  {
    id: "motors",
    index: "02",
    label: "FOUR-MOTOR DRIVE",
    status: "OBSERVED",
    detail: "Four electric motors and large propellers are visible. A 13-inch class is a plausible reconstruction, not a recovered specification.",
    color: "#70d6ff",
  },
  {
    id: "camera",
    index: "03",
    label: "FORWARD FPV OPTIC",
    status: "OBSERVED",
    detail: "A forward camera supplies the pilot view used for terminal steering. Thermal variants appear in later released footage.",
    color: "#f8ffb0",
  },
  {
    id: "spool",
    index: "04",
    label: "OPTICAL-FIBRE SPOOL",
    status: "PROBABLE",
    detail: "Reporting places a 10–20 km optical spool on many aircraft; some reporting gives a wider 10–30 km envelope.",
    color: "#b692ff",
  },
  {
    id: "payload",
    index: "05",
    label: "EXTERNAL CHARGE SILHOUETTE",
    status: "OBSERVED",
    detail: "Released imagery shows an externally carried anti-armour charge. This reconstruction deliberately omits internal and mounting details.",
    color: "#ff7b72",
  },
  {
    id: "power",
    index: "06",
    label: "POWER + CONTROL STACK",
    status: "UNRESOLVED",
    detail: "Commercial and 3D-printed components are reported, but the battery, flight controller, motor ratings and exact vendor chain are not public.",
    color: "#ffbd69",
  },
];

const VIEWS: Record<ViewName, { position: [number, number, number]; target: [number, number, number] }> = {
  iso: { position: [8.6, 6.6, 9.8], target: [0, 0.2, 0] },
  top: { position: [0.01, 13.5, 0.01], target: [0, 0, 0] },
  front: { position: [0, 2.2, -13], target: [0, 0.1, 0] },
  side: { position: [13, 2.5, 0], target: [0, 0.1, 0] },
};

interface SceneApi {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  drone: THREE.Group;
  taggedMeshes: Map<PartId, THREE.Object3D[]>;
  baseColors: Map<THREE.Material, THREE.Color>;
}

function makeLabelSprite(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.arc(80, 40, 25, 0, Math.PI * 2);
  context.fillStyle = "rgba(5,7,9,.88)";
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = color;
  context.stroke();
  context.fillStyle = color;
  context.font = "600 24px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 80, 41);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.82, 0.42, 1);
  sprite.renderOrder = 12;
  return sprite;
}

function beamBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 12), material);
  beam.position.copy(a).add(b).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return beam;
}

function tagObject(
  taggedMeshes: Map<PartId, THREE.Object3D[]>,
  id: PartId,
  object: THREE.Object3D,
) {
  object.userData.partId = id;
  const existing = taggedMeshes.get(id) ?? [];
  existing.push(object);
  taggedMeshes.set(id, existing);
  return object;
}

function createDroneModel() {
  const drone = new THREE.Group();
  drone.rotation.y = Math.PI / 4;
  const taggedMeshes = new Map<PartId, THREE.Object3D[]>();
  const baseColors = new Map<THREE.Material, THREE.Color>();

  const material = (
    color: string,
    options: Partial<THREE.MeshStandardMaterialParameters> = {},
  ) => {
    const next = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.66,
      metalness: 0.28,
      ...options,
    });
    baseColors.set(next, next.color.clone());
    return next;
  };

  const carbon = material("#18231d", { metalness: 0.5, roughness: 0.44 });
  const carbonEdge = material("#4f7660", { wireframe: true, transparent: true, opacity: 0.58 });
  const metal = material("#69736e", { metalness: 0.82, roughness: 0.24 });
  const motorBlack = material("#101614", { metalness: 0.84, roughness: 0.22 });
  const prop = material("#4f6c5a", {
    transparent: true,
    opacity: 0.46,
    side: THREE.DoubleSide,
    metalness: 0.1,
  });
  const board = material("#1f6244", { metalness: 0.12, roughness: 0.76 });
  const chip = material("#070b09", { metalness: 0.45, roughness: 0.38 });
  const lens = material("#8ae8ff", { emissive: "#143e47", emissiveIntensity: 2.2, metalness: 0.35 });
  const battery = material("#303b37", { roughness: 0.72 });
  const fibre = material("#a98cff", { emissive: "#2f1f63", emissiveIntensity: 1.3, metalness: 0.18 });
  const charge = material("#5f5a3b", { roughness: 0.82, metalness: 0.12 });
  const chargeEdge = material("#ff7b72", { wireframe: true, transparent: true, opacity: 0.3 });
  const copper = material("#bd7448", { metalness: 0.65, roughness: 0.28 });

  // Layered carbon centre plates: a recognisable long-range FPV stack rather than a toy X.
  const plateShape = new THREE.Shape();
  plateShape.moveTo(-1.24, -0.72);
  plateShape.lineTo(0.96, -0.72);
  plateShape.lineTo(1.28, -0.38);
  plateShape.lineTo(1.18, 0.65);
  plateShape.lineTo(0.78, 0.84);
  plateShape.lineTo(-1.18, 0.7);
  plateShape.lineTo(-1.36, 0.25);
  plateShape.closePath();
  const plateGeometry = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.055,
    bevelThickness: 0.045,
  });
  plateGeometry.rotateX(Math.PI / 2);
  plateGeometry.center();
  [-0.28, 0.26].forEach((y) => {
    const plate = tagObject(taggedMeshes, "frame", new THREE.Mesh(plateGeometry, carbon));
    plate.position.y = y;
    drone.add(plate);
    const edges = new THREE.Mesh(plateGeometry, carbonEdge);
    edges.position.y = y;
    drone.add(edges);
  });

  const motorPositions = [
    new THREE.Vector3(-2.7, 0.28, -2.35),
    new THREE.Vector3(2.7, 0.28, -2.35),
    new THREE.Vector3(-2.7, 0.28, 2.35),
    new THREE.Vector3(2.7, 0.28, 2.35),
  ];

  motorPositions.forEach((position, motorIndex) => {
    const armStart = new THREE.Vector3(Math.sign(position.x) * 0.58, 0, Math.sign(position.z) * 0.48);
    const arm = tagObject(taggedMeshes, "frame", beamBetween(armStart, position, 0.12, carbon));
    drone.add(arm);
    const armEdge = beamBetween(armStart, position, 0.126, carbonEdge);
    drone.add(armEdge);

    const braceA = beamBetween(
      new THREE.Vector3(Math.sign(position.x) * 0.25, -0.19, Math.sign(position.z) * 0.5),
      new THREE.Vector3(position.x * 0.72, 0.08, position.z * 0.78),
      0.042,
      metal,
    );
    drone.add(tagObject(taggedMeshes, "frame", braceA));

    const motorGroup = new THREE.Group();
    motorGroup.position.copy(position);
    motorGroup.userData.partId = "motors";
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.25, 24), motorBlack);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.38, 24), metal);
    bell.position.y = 0.28;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.14, 20), copper);
    cap.position.y = 0.54;
    motorGroup.add(base, bell, cap);
    [base, bell, cap].forEach((object) => tagObject(taggedMeshes, "motors", object));

    for (let coilIndex = 0; coilIndex < 10; coilIndex++) {
      const coil = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.095), copper);
      const angle = (coilIndex / 10) * Math.PI * 2;
      coil.position.set(Math.cos(angle) * 0.25, 0.23, Math.sin(angle) * 0.25);
      coil.rotation.y = -angle;
      motorGroup.add(coil);
    }

    const propGroup = new THREE.Group();
    propGroup.position.y = 0.66;
    propGroup.rotation.y = motorIndex % 2 ? Math.PI / 6 : 0;
    for (let bladeIndex = 0; bladeIndex < 3; bladeIndex++) {
      const shape = new THREE.Shape();
      shape.moveTo(0.12, -0.11);
      shape.bezierCurveTo(0.62, -0.16, 1.42, -0.12, 1.72, 0.02);
      shape.bezierCurveTo(1.35, 0.2, 0.62, 0.26, 0.12, 0.12);
      shape.closePath();
      const blade = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), prop);
      blade.rotation.x = -Math.PI / 2;
      blade.rotation.y = (bladeIndex / 3) * Math.PI * 2;
      propGroup.add(blade);
      tagObject(taggedMeshes, "motors", blade);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20), motorBlack);
    hub.position.y = 0.02;
    propGroup.add(hub);
    tagObject(taggedMeshes, "motors", hub);
    motorGroup.add(propGroup);
    drone.add(motorGroup);
  });

  // Control stack with visible boards, dampers, chips and power leads.
  [-0.05, 0.2, 0.45].forEach((y, layer) => {
    const pcb = tagObject(
      taggedMeshes,
      "power",
      new THREE.Mesh(new THREE.BoxGeometry(1.34 - layer * 0.1, 0.075, 1.05 - layer * 0.07), board),
    );
    pcb.position.set(0, y, 0.08);
    drone.add(pcb);
    for (const x of [-0.45, 0.45]) {
      for (const z of [-0.34, 0.34]) {
        const damper = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 10), fibre);
        damper.position.set(x, y - 0.1, z);
        drone.add(damper);
      }
    }
  });
  const flightChip = tagObject(taggedMeshes, "power", new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.42), chip));
  flightChip.position.set(0, 0.56, 0.05);
  drone.add(flightChip);
  const batteryPack = tagObject(taggedMeshes, "power", new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.62, 2.0), battery));
  batteryPack.position.set(0, -0.5, 0.28);
  drone.add(batteryPack);
  for (let bandIndex = -1; bandIndex <= 1; bandIndex += 2) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.66, 0.09), fibre);
    band.position.set(0, -0.5, 0.28 + bandIndex * 0.58);
    drone.add(band);
  }

  // Forward camera pod and protected lens.
  const cameraPod = tagObject(taggedMeshes, "camera", new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.62, 0.7), motorBlack));
  cameraPod.position.set(0, 0.06, -1.12);
  cameraPod.rotation.x = -0.1;
  drone.add(cameraPod);
  const cameraLens = tagObject(taggedMeshes, "camera", new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.29, 0.26, 28), lens));
  cameraLens.position.set(0, 0.02, -1.53);
  cameraLens.rotation.x = Math.PI / 2;
  drone.add(cameraLens);
  const cameraCage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.98, 0.84, 0.92)),
    new THREE.LineBasicMaterial({ color: "#70d6ff", transparent: true, opacity: 0.48 }),
  );
  cameraCage.position.set(0, 0.08, -1.16);
  drone.add(cameraCage);

  // Optical spool beneath the frame, with visible winding bands and trailing fibre.
  const spoolCore = tagObject(taggedMeshes, "spool", new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.18, 36), fibre));
  spoolCore.rotation.z = Math.PI / 2;
  spoolCore.position.set(0, -1.08, 0.22);
  drone.add(spoolCore);
  for (let ringIndex = -5; ringIndex <= 5; ringIndex++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.59, 0.018, 8, 36), metal);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(ringIndex * 0.098, -1.08, 0.22);
    drone.add(ring);
  }
  for (const x of [-0.66, 0.66]) {
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.055, 36), motorBlack);
    flange.rotation.z = Math.PI / 2;
    flange.position.set(x, -1.08, 0.22);
    drone.add(flange);
  }
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.68, -1.14, 0.2),
    new THREE.Vector3(-1.7, -1.32, 0.7),
    new THREE.Vector3(-2.8, -1.04, 1.8),
    new THREE.Vector3(-4.1, -1.45, 2.2),
  ]);
  const cable = tagObject(taggedMeshes, "spool", new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 48, 0.018, 8, false), fibre));
  drone.add(cable);

  // Evidence-visible payload silhouette. No internal or attachment geometry is represented.
  const payloadProfile = [
    new THREE.Vector2(0.08, -1.35),
    new THREE.Vector2(0.33, -1.18),
    new THREE.Vector2(0.48, -0.84),
    new THREE.Vector2(0.52, 0.56),
    new THREE.Vector2(0.4, 0.9),
    new THREE.Vector2(0.16, 1.34),
    new THREE.Vector2(0.04, 1.47),
  ];
  const payloadGeometry = new THREE.LatheGeometry(payloadProfile, 36);
  payloadGeometry.rotateX(Math.PI / 2);
  const payload = tagObject(taggedMeshes, "payload", new THREE.Mesh(payloadGeometry, charge));
  payload.position.set(0, 1.02, 0.15);
  drone.add(payload);
  const payloadWire = new THREE.Mesh(payloadGeometry, chargeEdge);
  payloadWire.position.copy(payload.position);
  drone.add(payloadWire);

  // Numbered evidence markers.
  const markerPositions: Record<PartId, THREE.Vector3> = {
    frame: new THREE.Vector3(-1.65, 0.5, -0.7),
    motors: new THREE.Vector3(3.1, 1.22, -2.5),
    camera: new THREE.Vector3(0.72, 0.55, -1.7),
    spool: new THREE.Vector3(-0.9, -1.48, 0.1),
    payload: new THREE.Vector3(0.62, 1.78, 0.2),
    power: new THREE.Vector3(1.05, 0.55, 0.6),
  };
  PARTS.forEach((part) => {
    const marker = makeLabelSprite(part.index, part.color);
    marker.position.copy(markerPositions[part.id]);
    marker.userData.partId = part.id;
    drone.add(marker);
    tagObject(taggedMeshes, part.id, marker);
  });

  return { drone, taggedMeshes, baseColors };
}

export function DroneReconstruction() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneApiRef = useRef<SceneApi | null>(null);
  const autoRotateRef = useRef(true);
  const [activePart, setActivePart] = useState<PartId>("frame");
  const [activeView, setActiveView] = useState<ViewName>("iso");
  const [autoRotate, setAutoRotate] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);

  const highlightPart = useCallback((id: PartId) => {
    setActivePart(id);
    const api = sceneApiRef.current;
    if (!api) return;
    api.baseColors.forEach((baseColor, material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.copy(baseColor);
        material.emissive.set("#000000");
        material.emissiveIntensity = 0;
      }
    });
    (api.taggedMeshes.get(id) ?? []).forEach((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const meshMaterial = object.material;
      const materials = Array.isArray(meshMaterial) ? meshMaterial : [meshMaterial];
      materials.forEach((nextMaterial) => {
        if (nextMaterial instanceof THREE.MeshStandardMaterial) {
          nextMaterial.emissive.set(PARTS.find((part) => part.id === id)?.color ?? "#b6ff7c");
          nextMaterial.emissiveIntensity = 0.32;
        }
      });
    });
  }, []);

  const setView = useCallback((name: ViewName) => {
    setActiveView(name);
    const api = sceneApiRef.current;
    if (!api) return;
    const view = VIEWS[name];
    api.camera.position.set(...view.position);
    api.controls.target.set(...view.target);
    api.controls.update();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      const failureTimer = window.setTimeout(() => setWebglFailed(true), 0);
      return () => window.clearTimeout(failureTimer);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x050708, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050708, 0.026);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(...VIEWS.iso.position);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6.2;
    controls.maxDistance = 19;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.target.set(...VIEWS.iso.target);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.62;

    const ambient = new THREE.HemisphereLight(0xbde7d0, 0x101312, 1.7);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xb6ff7c, 4.4);
    key.position.set(5, 9, -3);
    scene.add(key);
    const fill = new THREE.PointLight(0x6a8cff, 28, 26);
    fill.position.set(-6, 1, 6);
    scene.add(fill);
    const red = new THREE.PointLight(0xff665d, 12, 18);
    red.position.set(4, -2, -5);
    scene.add(red);

    const { drone, taggedMeshes, baseColors } = createDroneModel();
    scene.add(drone);

    const grid = new THREE.GridHelper(24, 24, 0x395345, 0x17231c);
    grid.position.y = -2.12;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((gridMaterial) => {
      gridMaterial.transparent = true;
      gridMaterial.opacity = 0.58;
    });
    scene.add(grid);
    const axis = new THREE.AxesHelper(2.3);
    axis.position.set(-5.6, -2.08, 4.9);
    scene.add(axis);

    sceneApiRef.current = { camera, controls, drone, taggedMeshes, baseColors };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(drone.children, true);
      const tagged = hits.find((hit) => {
        let current: THREE.Object3D | null = hit.object;
        while (current) {
          if (current.userData.partId) return true;
          current = current.parent;
        }
        return false;
      });
      if (!tagged) return;
      let current: THREE.Object3D | null = tagged.object;
      while (current && !current.userData.partId) current = current.parent;
      if (current?.userData.partId) highlightPart(current.userData.partId as PartId);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      camera.aspect = Math.max(width, 1) / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frame = 0;
    let elapsed = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      elapsed += 0.009;
      controls.autoRotate = !reduceMotion && autoRotateRef.current;
      if (!reduceMotion) {
        drone.position.y = Math.sin(elapsed * 1.25) * 0.07;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((nextMaterial) => nextMaterial.dispose());
        }
        if (object instanceof THREE.Sprite && object.material.map) {
          object.material.map.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      sceneApiRef.current = null;
    };
  }, [highlightPart]);

  const selected = PARTS.find((part) => part.id === activePart) ?? PARTS[0];

  return (
    <div className="overflow-hidden border border-white/[0.09] bg-[#050708]/85 shadow-[0_24px_90px_rgba(0,0,0,.55)]">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <div>
            <p className="font-mono text-[9px] tracking-[0.26em] text-primary">INTERACTIVE EVIDENCE MODEL</p>
            <p className="mt-1 font-mono text-[9px] text-muted">DRAG ROTATE · RIGHT-DRAG PAN · WHEEL ZOOM · CLICK A COMPONENT</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(VIEWS) as ViewName[]).map((view) => (
            <button
              type="button"
              key={view}
              onClick={() => setView(view)}
              className={cn(
                "border px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] uppercase transition-colors",
                activeView === view
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-white/10 text-muted hover:border-white/25 hover:text-foreground",
              )}
            >
              {view}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              setAutoRotate((value) => {
                autoRotateRef.current = !value;
                return !value;
              })
            }
            className={cn(
              "border px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] transition-colors",
              autoRotate
                ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200"
                : "border-white/10 text-muted hover:text-foreground",
            )}
          >
            AUTO {autoRotate ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="relative min-h-[430px] border-b border-white/[0.08] lg:min-h-[650px] lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between p-4 font-mono text-[8px] tracking-[0.18em] text-white/30">
            <span>RECON // ABABIL FPV</span>
            <span>NOT TO SCALE</span>
          </div>
          <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
          {webglFailed && (
            <div className="absolute inset-0 grid place-items-center bg-background/95 p-8 text-center">
              <p className="max-w-sm font-mono text-xs leading-relaxed text-muted">
                WEBGL UNAVAILABLE. THE EVIDENCE NOTES REMAIN ACCESSIBLE IN THE COMPONENT INDEX.
              </p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between font-mono text-[8px] tracking-[0.14em] text-white/30">
            <span>X / Y / Z AXES ACTIVE</span>
            <span>ESTIMATED RECONSTRUCTION // V1.0</span>
          </div>
        </div>

        <aside className="flex min-h-[430px] flex-col bg-black/15">
          <div className="border-b border-white/[0.08] p-4">
            <p className="font-mono text-[8px] tracking-[0.26em] text-muted">SELECTED COMPONENT</p>
            <div className="mt-3 flex items-start gap-3">
              <span className="font-mono text-2xl" style={{ color: selected.color }}>{selected.index}</span>
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-foreground">{selected.label}</p>
                <span
                  className="mt-2 inline-block border px-1.5 py-0.5 font-mono text-[7px] tracking-[0.18em]"
                  style={{ color: selected.color, borderColor: `${selected.color}55`, background: `${selected.color}12` }}
                >
                  {selected.status}
                </span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">{selected.detail}</p>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {PARTS.map((part) => (
              <button
                type="button"
                key={part.id}
                onClick={() => highlightPart(part.id)}
                className={cn(
                  "grid w-full grid-cols-[28px_1fr_auto] items-center gap-2 px-4 py-3 text-left transition-colors",
                  activePart === part.id ? "bg-white/[0.055]" : "hover:bg-white/[0.025]",
                )}
              >
                <span className="font-mono text-[9px]" style={{ color: part.color }}>{part.index}</span>
                <span className="font-mono text-[8px] tracking-[0.12em] text-foreground/85">{part.label}</span>
                <span className="font-mono text-[7px] text-muted-2">{part.status.slice(0, 3)}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto border-t border-white/[0.08] p-4">
            <div className="grid grid-cols-3 gap-2 font-mono text-[7px] tracking-[0.12em]">
              <span className="text-primary">● OBSERVED</span>
              <span className="text-violet-300">● PROBABLE</span>
              <span className="text-amber-300">● UNRESOLVED</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
