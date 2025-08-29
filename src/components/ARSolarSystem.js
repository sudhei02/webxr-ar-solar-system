import React, { useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { XR, createXRStore, useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

// Error Boundary Component
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WebGL Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>WebGL Rendering Error</h3>
          <p>Unable to render 3D content. Please refresh the page.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Planet data optimized for AR table display
const planetData = [
  {
    name: "Sun",
    size: 0.06,
    distance: 0,
    speed: 0.005,
    color: "#ffff00",
    emissive: "#ffaa00",
    info: "Our star - source of light and heat",
    type: "star",
  },
  {
    name: "Mercury",
    size: 0.015,
    distance: 0.12,
    speed: 0.8,
    color: "#8c7853",
    info: "Smallest planet, closest to the Sun",
    type: "planet",
  },
  {
    name: "Venus",
    size: 0.025,
    distance: 0.18,
    speed: 0.6,
    color: "#ffc649",
    info: "Hottest planet, thick atmosphere",
    type: "planet",
  },
  {
    name: "Earth",
    size: 0.025,
    distance: 0.24,
    speed: 0.5,
    color: "#6b93d6",
    info: "Our home planet, perfect for life",
    type: "planet",
  },
  {
    name: "Mars",
    size: 0.02,
    distance: 0.3,
    speed: 0.4,
    color: "#c1440e",
    info: "The Red Planet, has polar ice caps",
    type: "planet",
  },
  {
    name: "Jupiter",
    size: 0.05,
    distance: 0.4,
    speed: 0.25,
    color: "#d8ca9d",
    info: "Largest planet, has a Great Red Spot",
    type: "planet",
  },
  {
    name: "Saturn",
    size: 0.04,
    distance: 0.52,
    speed: 0.2,
    color: "#fad5a5",
    info: "Famous for its beautiful rings",
    type: "planet",
    hasRings: true,
  },
  {
    name: "Uranus",
    size: 0.03,
    distance: 0.64,
    speed: 0.15,
    color: "#4fd0e3",
    info: "Tilted on its side, ice giant",
    type: "planet",
  },
  {
    name: "Neptune",
    size: 0.03,
    distance: 0.76,
    speed: 0.1,
    color: "#4b70dd",
    info: "Windiest planet, deep blue color",
    type: "planet",
  },
];

// Individual Planet Component
function Planet({ data, onClick, isSelected, time }) {
  const meshRef = useRef();
  const groupRef = useRef();

  // Calculate orbital position
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Planet rotation
      meshRef.current.rotation.y += 0.01;
    }

    if (groupRef.current && data.type === "planet") {
      // Orbital motion
      const orbitAngle = angle + time * data.speed * 0.01;
      groupRef.current.position.x = Math.cos(orbitAngle) * data.distance;
      groupRef.current.position.z = Math.sin(orbitAngle) * data.distance;
    }
  });

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onClick(data);
    },
    [onClick, data]
  );

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} onClick={handleClick} scale={isSelected ? 1.3 : 1}>
        <sphereGeometry args={[data.size, 16, 16]} />
        {data.type === "star" ? (
          <meshBasicMaterial
            color={data.color}
            transparent={false}
            opacity={1}
          />
        ) : (
          <meshBasicMaterial
            color={data.color}
            transparent={isSelected}
            opacity={isSelected ? 0.8 : 1.0}
          />
        )}
      </mesh>

      {/* Saturn's rings */}
      {data.hasRings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.size * 1.2, data.size * 1.6, 32]} />
          <meshBasicMaterial
            color={data.color}
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Planet label visible when selected */}
      {isSelected && (
        <Html
          center
          distanceFactor={10}
          position={[0, data.size + 0.04, 0]}
          style={{
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              border: "1px solid #ff6b35",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Main Solar System Scene
function SolarSystemScene({ selectedPlanet, setSelectedPlanet }) {
  const [time, setTime] = useState(0);
  const solarSystemRef = useRef();
  const placedRef = useRef(false);

  // Use @react-three/xr hit test
  useXRHitTest((hitMatrix) => {
    if (solarSystemRef.current && hitMatrix && !placedRef.current) {
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(hitMatrix);
      solarSystemRef.current.position.copy(position);
      solarSystemRef.current.position.y += 0.05;
      solarSystemRef.current.scale.setScalar(0.7);
    }
  });

  useFrame((state, delta) => {
    setTime((prev) => prev + delta);
  });

  // Tap-to-place: on user pointer down, commit placement
  const handlePointerDown = useCallback(() => {
    if (solarSystemRef.current && !placedRef.current) {
      placedRef.current = true;
    }
  }, []);

  const handlePlanetClick = useCallback(
    (planetData) => {
      setSelectedPlanet(planetData);
    },
    [setSelectedPlanet]
  );

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={1.5} />

      {/* Solar System */}
      <group ref={solarSystemRef} onPointerDown={handlePointerDown}>
        {planetData.map((planet) => (
          <Planet
            key={planet.name}
            data={planet}
            onClick={handlePlanetClick}
            isSelected={selectedPlanet?.name === planet.name}
            time={time}
          />
        ))}

        {/* Orbital paths (visible in 3D mode) */}
        {!placedRef.current &&
          planetData
            .filter((p) => p.type === "planet")
            .map((planet) => (
              <mesh key={planet.name + "-orbit"} position={[0, 0, 0]}>
                <torusGeometry args={[planet.distance, 0.001, 16, 100]} />
                <meshBasicMaterial
                  color="#333333"
                  transparent={true}
                  opacity={0.3}
                />
              </mesh>
            ))}
      </group>

      {/* 3D Mode Controls */}
      {!placedRef.current && (
        <OrbitControls enablePan={false} enableZoom={true} />
      )}
    </>
  );
}

// Status Message Component
function StatusMessage({ message, type, visible }) {
  if (!visible || !message) return null;

  const bgColor = {
    normal: "rgba(0, 0, 0, 0.8)",
    success: "rgba(34, 197, 94, 0.9)",
    error: "rgba(239, 68, 68, 0.9)",
  }[type];

  const borderColor = {
    normal: "#666",
    success: "#22c55e",
    error: "#ef4444",
  }[type];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: bgColor,
        color: "white",
        padding: "12px 24px",
        borderRadius: "20px",
        fontSize: "14px",
        maxWidth: "80%",
        textAlign: "center",
        backdropFilter: "blur(10px)",
        border: `1px solid ${borderColor}`,
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
}

// Planet Info Panel
function PlanetInfoPanel({ planet, onClose }) {
  if (!planet) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.95)",
        color: "white",
        padding: "20px",
        borderRadius: "15px",
        border: "2px solid #ff6b35",
        maxWidth: "300px",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "15px",
          background: "none",
          border: "none",
          color: "#ff6b35",
          fontSize: "24px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <h3 style={{ margin: "0 0 10px 0", color: "#ff6b35" }}>{planet.name}</h3>
      <p style={{ margin: "5px 0", fontSize: "14px" }}>{planet.info}</p>
      {planet.name !== "Sun" && (
        <p style={{ margin: "5px 0", fontSize: "12px", opacity: 0.8 }}>
          Orbital radius: {(planet.distance * 100).toFixed(0)}% of system
        </p>
      )}
    </div>
  );
}

// Create XR store outside component to avoid recreating on each render
const xrStore = createXRStore({
  hitTest: true,
  anchors: false,
  layers: false,
  meshDetection: false,
  planeDetection: false,
});

// Main AR Solar System Component
export default function ARSolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("normal");
  const [statusVisible, setStatusVisible] = useState(false);

  // Show status with auto-hide
  const showStatus = useCallback((message, type = "normal") => {
    setStatusMessage(message);
    setStatusType(type);
    setStatusVisible(true);
    setTimeout(() => {
      setStatusVisible(false);
    }, 3000);
  }, []);

  // Check AR support on mount
  React.useEffect(() => {
    const checkSupport = async () => {
      console.log("Checking WebXR support...");
      console.log("User Agent:", navigator.userAgent);
      console.log("navigator.xr exists:", !!navigator.xr);
      console.log("Location protocol:", window.location.protocol);

      // Check if we're on HTTPS (required for WebXR)
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        showStatus("WebXR requires HTTPS. Please use https:// URL.", "error");
        return;
      }

      if (!navigator.xr) {
        // Detect mobile browsers and provide specific guidance
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        const isChrome = /Chrome/i.test(navigator.userAgent);
        const isSafari =
          /Safari/i.test(navigator.userAgent) &&
          !/Chrome/i.test(navigator.userAgent);

        if (isMobile) {
          if (isChrome) {
            showStatus(
              "WebXR not detected. Update Chrome to latest version.",
              "error"
            );
          } else if (isSafari) {
            showStatus(
              "WebXR not detected. Update Safari to iOS 15.4+.",
              "error"
            );
          } else {
            showStatus(
              "Please use Chrome on Android or Safari on iOS for AR.",
              "error"
            );
          }
        } else {
          showStatus(
            "WebXR not available. Try on mobile device with Chrome/Safari.",
            "error"
          );
        }
        return;
      }

      try {
        console.log("Testing AR session support...");
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        console.log("AR session supported:", supported);

        if (supported) {
          showStatus("AR ready! Tap the AR button to start.", "success");
        } else {
          showStatus("AR not supported on this device/browser.", "error");
        }
      } catch (error) {
        console.error("Error checking AR support:", error);
        showStatus("Failed to check AR support: " + error.message, "error");
      }
    };

    setTimeout(checkSupport, 1000);
  }, [showStatus]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Title Card */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          background: "rgba(0, 0, 0, 0.85)",
          padding: "12px 18px",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 107, 53, 0.3)",
          zIndex: 100,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            background: "linear-gradient(45deg, #ff6b35, #f7931e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          🌌 Solar System AR
        </h2>
        <p
          style={{
            margin: "5px 0 0 0",
            fontSize: "14px",
            opacity: 0.9,
            color: "white",
          }}
        >
          3D Mode - Drag to explore, or click AR button for AR
        </p>
      </div>

      {/* AR Button */}
      <button
        onClick={async () => {
          try {
            console.log("Attempting to enter AR...");
            await xrStore.enterAR();
            showStatus("AR session started successfully!", "success");
          } catch (error) {
            console.error("Failed to enter AR:", error);
            showStatus("Failed to start AR: " + error.message, "error");
          }
        }}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          padding: "12px 20px",
          background: "linear-gradient(45deg, #ff6b35, #f7931e)",
          border: "none",
          borderRadius: "25px",
          color: "white",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 53, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "none";
        }}
      >
        🚀 AR Mode
      </button>

      {/* Three.js Canvas with XR inside */}
      <Canvas
        camera={{ position: [0, 1, 2], fov: 75 }}
        style={{
          background: "#000011",
          width: "100%",
          height: "100%",
        }}
        gl={{
          alpha: true,
          antialias: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={1}
        performance={{ min: 0.5 }}
      >
        <XR
          store={xrStore}
          referenceSpace="local-floor"
          onSessionStart={() => console.log("AR session started")}
          onSessionEnd={() => console.log("AR session ended")}
        >
          <WebGLErrorBoundary>
            <SolarSystemScene
              selectedPlanet={selectedPlanet}
              setSelectedPlanet={setSelectedPlanet}
            />
          </WebGLErrorBoundary>
        </XR>
      </Canvas>

      {/* Planet Info Panel */}
      <PlanetInfoPanel
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />

      {/* Status Message */}
      <StatusMessage
        message={statusMessage}
        type={statusType}
        visible={statusVisible}
      />
    </div>
  );
}
