'use client';

import React, { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Pause,
  AlertTriangle,
  Loader2,
  Sun
} from 'lucide-react';
import { Model3DViewerProps, Model3DLoadingState } from '@/types/models';

interface Model3DSceneProps {
  modelUrl: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

// ✨ PRODUCTION-READY HDRI ENVIRONMENT SYSTEM ✨
// Based on expert analysis and React Three Fiber best practices

function HDRIEnvironment({ hdriUrl, intensity = 1.0, enabled = true, backgroundBlur = 0 }: { hdriUrl?: string; intensity?: number; enabled?: boolean; backgroundBlur?: number }) {
  console.log('🌍 HDRIEnvironment:', { hdriUrl, intensity, enabled, backgroundBlur });
  
  // If HDRI is disabled or no URL provided, use studio preset
  if (!enabled || !hdriUrl) {
    console.log('⚪ Using studio preset (disabled or no URL)');
    return <Environment preset="studio" environmentIntensity={0.6} />;
  }

  // Validate HDRI file format
  const fileExtension = hdriUrl.toLowerCase().split('.').pop();
  if (fileExtension !== 'hdr' && fileExtension !== 'hdri') {
    console.warn(`❌ HDRI format .${fileExtension} not supported. Using studio preset.`);
    return <Environment preset="studio" environmentIntensity={0.6} />;
  }

  console.log('🚀 Loading HDRI:', hdriUrl);
  
  return (
    <HDRIErrorBoundary fallback={<Environment preset="studio" environmentIntensity={0.6} />}>
      <Suspense fallback={<Environment preset="studio" environmentIntensity={0.3} />}>
        <HDRILoader hdriUrl={hdriUrl} intensity={intensity} backgroundBlur={backgroundBlur} />
      </Suspense>
    </HDRIErrorBoundary>
  );
}

// Error boundary for HDRI loading failures
class HDRIErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 HDRI Error Boundary triggered:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('⚠️ HDRI loading failed, using fallback environment:', error.message);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('🔄 Rendering fallback due to HDRI error');
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ✨ KEY FIX: Enhanced HDRI Loader with proper background display and blur effect
function HDRILoader({ hdriUrl, intensity, backgroundBlur = 0 }: { hdriUrl: string; intensity: number; backgroundBlur?: number }) {
  // Load HDRI texture using React Three Fiber's useLoader
  const texture = useLoader(RGBELoader, hdriUrl);
  
  // Configure texture mapping properly
  useMemo(() => {
    if (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.flipY = true; // ✨ Fix upside-down HDRI by flipping Y-axis
      console.log('✅ HDRI texture loaded and configured:', {
        format: texture.format,
        type: texture.type,
        mapping: texture.mapping,
        flipY: texture.flipY
      });
    }
  }, [texture]);

  // Calculate blur factor - convert 0-10 scale to 0-1 scale with exponential curve for stronger blur
  const blurFactor = backgroundBlur > 0 ? Math.pow(backgroundBlur / 10, 2) : 0;
  
  console.log('🌅 Rendering HDRI environment with background visible', {
    intensity,
    backgroundBlur,
    blurFactor: blurFactor.toFixed(3)
  });

  // 🔑 CRITICAL FIX: Set background={true} to make HDRI visible as background
  // ✨ NEW: Add backgroundBlurriness for depth of field effect
  return (
    <Environment 
      map={texture} 
      background={true}           // ✨ This was missing! Makes HDRI visible as background
      backgroundIntensity={intensity} 
      environmentIntensity={intensity}
      backgroundBlurriness={blurFactor}  // ✨ NEW: Background blur effect (0-1 scale)
    />
  );
}

// 🔍 Debug component to help troubleshoot HDRI loading (development only)
function HDRIDebugInfo({ hdriUrl, enabled, backgroundBlur }: { hdriUrl?: string; enabled: boolean; backgroundBlur?: number }) {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="absolute bottom-4 right-4 bg-black/70 text-white p-2 rounded text-xs font-mono max-w-xs">
      <div className="text-green-400">HDRI Debug:</div>
      <div>Status: {enabled ? '🟢 Enabled' : '🔴 Disabled'}</div>
      <div>URL: {hdriUrl ? '🟢 Valid' : '🔴 Missing'}</div>
      <div>Blur: {backgroundBlur ? `🔵 ${backgroundBlur}/10` : '⚪ None'}</div>
      {hdriUrl && (
        <>
          <div className="text-yellow-400 mt-1">URL:</div>
          <div className="break-all text-xs">{hdriUrl}</div>
        </>
      )}
    </div>
  );
}

// GLB/GLTF Scene Component
function GLTFScene({ modelUrl, onLoad, onError }: { modelUrl: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const { scene } = useGLTF(modelUrl);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene && onLoad) {
      onLoad();
    }
  }, [scene, onLoad]);

  useEffect(() => {
    if (meshRef.current && scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model at the origin (0, 0, 0)
      scene.position.set(-center.x, -center.y, -center.z);
      
      // Scale the model to fit in a 2x2x2 cube
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      scene.scale.setScalar(scale);
      
      // Ensure the model is properly positioned at the origin
      scene.updateMatrixWorld(true);
    }
  }, [scene]);

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
}

// STL Scene Component
function STLScene({ modelUrl, onLoad, onError }: { modelUrl: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const geometry = useLoader(STLLoader, modelUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (geometry && onLoad) {
      onLoad();
    }
  }, [geometry, onLoad]);

  useEffect(() => {
    if (meshRef.current && geometry) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (box) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the geometry at the origin (0, 0, 0)
        geometry.translate(-center.x, -center.y, -center.z);
        
        // Scale the geometry to fit in a 2x2x2 cube
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        geometry.scale(scale, scale, scale);
        
        // Update the geometry
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
      }
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#d4af37" metalness={0.1} roughness={0.3} />
    </mesh>
  );
}

// OBJ Scene Component
function OBJScene({ modelUrl, onLoad, onError }: { modelUrl: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const obj = useLoader(OBJLoader, modelUrl);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (obj && onLoad) {
      onLoad();
    }
  }, [obj, onLoad]);

  useEffect(() => {
    if (meshRef.current && obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the object at the origin (0, 0, 0)
      obj.position.set(-center.x, -center.y, -center.z);
      
      // Scale the object to fit in a 2x2x2 cube
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      obj.scale.setScalar(scale);

      // Apply default material to all meshes in OBJ
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#d4af37',
            metalness: 0.1,
            roughness: 0.3
          });
        }
      });
      
      // Ensure the object is properly positioned at the origin
      obj.updateMatrixWorld(true);
    }
  }, [obj]);

  return (
    <group ref={meshRef}>
      <primitive object={obj} />
    </group>
  );
}

// PLY Scene Component
function PLYScene({ modelUrl, onLoad, onError }: { modelUrl: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const geometry = useLoader(PLYLoader, modelUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (geometry && onLoad) {
      onLoad();
    }
  }, [geometry, onLoad]);

  useEffect(() => {
    if (meshRef.current && geometry) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (box) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the geometry at the origin (0, 0, 0)
        geometry.translate(-center.x, -center.y, -center.z);
        
        // Scale the geometry to fit in a 2x2x2 cube
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        geometry.scale(scale, scale, scale);
        
        // Update the geometry
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
      }
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#d4af37" metalness={0.1} roughness={0.3} />
    </mesh>
  );
}

// Multi-format 3D Model Scene Component
function Model3DScene({ modelUrl, format, onLoad, onError, onProgress }: Model3DSceneProps & { format: string }) {
  const renderScene = () => {
    switch (format.toLowerCase()) {
      case 'glb':
      case 'gltf':
        return <GLTFScene modelUrl={modelUrl} onLoad={onLoad} onError={onError} />;
      case 'stl':
        return <STLScene modelUrl={modelUrl} onLoad={onLoad} onError={onError} />;
      case 'obj':
        return <OBJScene modelUrl={modelUrl} onLoad={onLoad} onError={onError} />;
      case 'ply':
        return <PLYScene modelUrl={modelUrl} onLoad={onLoad} onError={onError} />;
      case 'fbx':
      case 'dae':
        // For now, show unsupported format message
        if (onError) {
          onError(new Error(`${format.toUpperCase()} format is not yet supported in preview. Please use GLB, STL, OBJ, or PLY format.`));
        }
        return null;
      default:
        if (onError) {
          onError(new Error(`Unsupported 3D model format: ${format}`));
        }
        return null;
    }
  };

  return <>{renderScene()}</>;
}

// Loading fallback component
function Model3DLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
      <div className="text-center text-white">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading 3D Model...</p>
      </div>
    </div>
  );
}

// Error fallback component
function Model3DError({ error }: { error: Error }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
      <div className="text-center text-white max-w-xs">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
        <p className="text-sm font-medium mb-1">Failed to load 3D model</p>
        <p className="text-xs text-gray-300">{error.message}</p>
      </div>
    </div>
  );
}

// Main 3D Viewer Component
const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelUrl,
  format,
  className = '',
  showControls = true,
  autoRotate = false,
  autoRotateSpeed = 2.0,
  enableZoom = true,
  enablePan = true,
  cameraPosition = [3, 3, 3],
  onLoad,
  onError,
  onProgress,
  // HDRI Environment Props
  hdriUrl,
  hdriIntensity = 1.0,
  enableHdri = true,
  backgroundBlur = 0
}) => {
  const [loadingState, setLoadingState] = useState<Model3DLoadingState>({
    isLoading: true,
    progress: 0,
    error: null,
    stage: 'loading'
  });
  
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hdriEnabled, setHdriEnabled] = useState(enableHdri);
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoad = () => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'complete',
      progress: 100
    }));
    if (onLoad) onLoad();
  };

  const handleError = (error: Error) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error: error.message,
      stage: 'error'
    }));
    if (onError) onError(error);
  };

  const handleProgress = (progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress
    }));
    if (onProgress) onProgress(progress);
  };

  const resetView = () => {
    if (controlsRef.current) {
      // Reset to initial camera position and target
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
      controlsRef.current.update();
    }
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const toggleHdri = () => {
    setHdriEnabled(!hdriEnabled);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden ${className}`}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #1a1a1a, #000000)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* HDRI Environment */}
        <HDRIEnvironment 
          hdriUrl={hdriUrl} 
          intensity={hdriIntensity} 
          enabled={hdriEnabled && !!hdriUrl}
          backgroundBlur={backgroundBlur}
        />
        
        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          autoRotate={isAutoRotating}
          autoRotateSpeed={autoRotateSpeed}
          enableZoom={enableZoom}
          enablePan={enablePan}
          enableRotate={enableZoom || enablePan} // Disable rotation when zoom and pan are disabled
          minDistance={1}
          maxDistance={10}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.1}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          {modelUrl && (
            <Model3DScene
              modelUrl={modelUrl}
              format={format}
              onLoad={handleLoad}
              onError={handleError}
              onProgress={handleProgress}
            />
          )}
        </Suspense>
        
        {/* Debug Stats removed for better UX */}
      </Canvas>

      {/* Loading State */}
      {loadingState.isLoading && <Model3DLoading />}

      {/* Error State */}
      {loadingState.error && <Model3DError error={new Error(loadingState.error)} />}

      {/* Control Buttons */}
      {showControls && !loadingState.isLoading && !loadingState.error && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={toggleAutoRotate}
            className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
              isAutoRotating 
                ? 'bg-luxury-gold text-luxury-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isAutoRotating ? 'Stop auto rotation' : 'Start auto rotation'}
          >
            {isAutoRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          {/* HDRI Environment Toggle */}
          {hdriUrl && (
            <button
              type="button"
              onClick={toggleHdri}
              className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                hdriEnabled 
                  ? 'bg-luxury-gold text-luxury-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={hdriEnabled ? 'Disable HDRI environment' : 'Enable HDRI environment'}
            >
              <Sun className="h-4 w-4" />
            </button>
          )}

          {/* Reset View */}
          <button
            type="button"
            onClick={resetView}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {loadingState.isLoading && loadingState.progress > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-luxury-gold transition-all duration-300"
              style={{ width: `${loadingState.progress}%` }}
            />
          </div>
          <p className="text-white text-xs mt-1 text-center">
            Loading... {Math.round(loadingState.progress)}%
          </p>
        </div>
      )}


      {/* Islamic Pattern Overlay (subtle) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern-3d" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#d4af37" />
              <circle cx="45" cy="15" r="1" fill="#d4af37" />
              <circle cx="15" cy="45" r="1" fill="#d4af37" />
              <circle cx="45" cy="45" r="1" fill="#d4af37" />
              <circle cx="30" cy="30" r="1.5" fill="#d4af37" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern-3d)" />
        </svg>
      </div>
    </div>
  );
};

export default Model3DViewer;