// WebXR utilities for AR functionality
import * as THREE from "three";

export class WebXRUtils {
  static async checkARSupport() {
    if (!navigator.xr) {
      console.warn("WebXR not available");
      return false;
    }

    try {
      const supported = await navigator.xr.isSessionSupported("immersive-ar");
      console.log("AR support check:", supported);
      return supported;
    } catch (error) {
      console.error("Error checking AR support:", error);
      return false;
    }
  }

  static async requestARSession(features = {}) {
    const sessionInit = {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body },
      ...features,
    };

    try {
      const session = await navigator.xr.requestSession(
        "immersive-ar",
        sessionInit
      );
      console.log("AR session created successfully");
      return session;
    } catch (error) {
      console.error("Failed to create AR session:", error);
      throw error;
    }
  }

  static async setupARSession(session, renderer) {
    try {
      // Create WebGL layer
      const baseLayer = new XRWebGLLayer(
        session,
        renderer.domElement.getContext("webgl2") ||
          renderer.domElement.getContext("webgl")
      );
      session.updateRenderState({ baseLayer });

      // Get reference spaces
      const referenceSpace = await session.requestReferenceSpace("local-floor");
      const viewerSpace = await session.requestReferenceSpace("viewer");

      // Set up hit test source
      const hitTestSource = await session.requestHitTestSource({
        space: viewerSpace,
      });

      // Configure Three.js renderer for XR
      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);

      return {
        referenceSpace,
        viewerSpace,
        hitTestSource,
      };
    } catch (error) {
      console.error("Failed to set up AR session:", error);
      throw error;
    }
  }

  static getHitTestResults(frame, hitTestSource, referenceSpace) {
    try {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      return hitTestResults
        .map((result) => {
          const pose = result.getPose(referenceSpace);
          return pose
            ? {
                transform: {
                  position: {
                    x: pose.transform.position.x,
                    y: pose.transform.position.y,
                    z: pose.transform.position.z,
                  },
                  orientation: {
                    x: pose.transform.orientation.x,
                    y: pose.transform.orientation.y,
                    z: pose.transform.orientation.z,
                    w: pose.transform.orientation.w,
                  },
                  matrix: pose.transform.matrix,
                },
              }
            : null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error("Error getting hit test results:", error);
      return [];
    }
  }

  static createReticle() {
    const geometry = new THREE.RingGeometry(0.05, 0.08, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });

    const reticle = new THREE.Mesh(geometry, material);
    reticle.rotation.x = -Math.PI / 2; // Lay flat
    reticle.visible = false;
    reticle.matrixAutoUpdate = false;

    return reticle;
  }

  static updateReticleFromHitTest(reticle, hitTestResults) {
    if (hitTestResults.length > 0) {
      const result = hitTestResults[0];
      if (result.transform && result.transform.matrix) {
        reticle.matrix.fromArray(result.transform.matrix);
        reticle.visible = true;
      }
    } else {
      reticle.visible = false;
    }
  }

  static positionObjectOnSurface(
    object,
    hitTestResults,
    offset = { x: 0, y: 0.05, z: 0 }
  ) {
    if (hitTestResults.length > 0 && object) {
      const result = hitTestResults[0];
      if (result.transform) {
        object.position.set(
          result.transform.position.x + offset.x,
          result.transform.position.y + offset.y,
          result.transform.position.z + offset.z
        );

        // Optional: Apply rotation from hit test
        if (result.transform.orientation) {
          object.quaternion.set(
            result.transform.orientation.x,
            result.transform.orientation.y,
            result.transform.orientation.z,
            result.transform.orientation.w
          );
        }
      }
    }
  }

  static async requestPermissions() {
    // Request device orientation permission for iOS 13+
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        console.log("Device orientation permission:", permission);
      } catch (error) {
        console.warn("Device orientation permission failed:", error);
      }
    }

    // Request device motion permission for iOS 13+
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        console.log("Device motion permission:", permission);
        return permission === "granted";
      } catch (error) {
        console.warn("Device motion permission failed:", error);
        return false;
      }
    }

    return true; // Assume granted if no permission API
  }

  static isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  static isWebXRBrowser() {
    return (
      navigator.userAgent.includes("WebXRViewer") ||
      navigator.userAgent.includes("XRBrowser") ||
      window.navigator.xr !== undefined
    );
  }
}

export default WebXRUtils;
