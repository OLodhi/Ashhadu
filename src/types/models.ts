// 3D Model Types for Three.js Integration
import { ProductHDRI } from './product';

export interface Model3DViewerProps {
  modelUrl: string;
  format: Model3DFormat;
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number; // Rotation speed (0.2-3.0, default 2.0)
  enableZoom?: boolean;
  enablePan?: boolean;
  cameraPosition?: [number, number, number]; // Camera position [x, y, z]
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  // HDRI Environment Support
  hdriUrl?: string;
  hdriIntensity?: number; // 0.0 to 2.0, default 1.0
  enableHdri?: boolean;
  backgroundBlur?: number; // 0-10 scale for background blur intensity
}

export interface Model3DGalleryProps {
  models: Product3DModel[];
  images: ProductImage[];
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  showThumbnails?: boolean;
  defaultView?: 'image' | '3d';
}

export interface Model3DUploadProps {
  models?: Product3DModel[];
  onModelsChange: (models: Product3DModel[]) => void;
  maxModels?: number;
  maxFileSize?: number; // in MB
  className?: string;
  showFeaturedToggle?: boolean;
  featuredModel?: string;
  onFeaturedModelChange?: (modelId: string) => void;
  // HDRI Support
  enableHdriUpload?: boolean;
  hdriFiles?: ProductHDRI[];
  onHdriFilesChange?: (hdris: ProductHDRI[]) => void;
  maxHdriFiles?: number;
  defaultHdri?: string;
  onDefaultHdriChange?: (hdriId: string) => void;
}

export interface Model3DControls {
  autoRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  resetView: () => void;
  toggleFullscreen?: () => void;
  wireframe?: boolean;
}

export interface Model3DLoadingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  stage: 'loading' | 'parsing' | 'rendering' | 'complete' | 'error';
}

export type Model3DFormat = 'glb' | 'stl' | 'obj' | 'fbx' | 'dae' | 'ply';

export interface Model3DValidation {
  isValid: boolean;
  format: Model3DFormat | null;
  fileSize: number;
  errors: string[];
  warnings: string[];
}

export interface Model3DProcessingOptions {
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
  compressionLevel?: number;
  centerModel?: boolean;
  normalizeScale?: boolean;
}

// Re-export Product3DModel from product types for convenience
export type { Product3DModel, ProductImage } from './product';

// Three.js specific types
export interface ThreeJSScene {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls: any; // OrbitControls type
}

export interface Model3DMetadata {
  vertices: number;
  faces: number;
  materials: number;
  textures: string[];
  animations: string[];
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}