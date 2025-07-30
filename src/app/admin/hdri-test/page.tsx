'use client';

import React from 'react';
import HDRIUploadTest from '@/components/admin/HDRIUploadTest';

export default function HDRITestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury-black mb-2">HDRI Upload Test</h1>
          <p className="text-luxury-gray-600">
            Upload HDRI environment files for your 3D models. Once uploaded, you can use the URLs in your Model3DViewer components.
          </p>
        </div>
        
        <HDRIUploadTest />
        
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-luxury-black">Next Steps:</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <ol className="list-decimal list-inside space-y-3 text-luxury-gray-700">
              <li>
                <strong>Upload HDRI files</strong> using the interface above
              </li>
              <li>
                <strong>Copy the URL</strong> from the uploaded file
              </li>
              <li>
                <strong>Use in your 3D viewer</strong> by adding the HDRI props:
                <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
{`<Model3DViewer
  modelUrl="/path/to/model.glb"
  format="glb"
  hdriUrl="YOUR_COPIED_HDRI_URL"
  hdriIntensity={1.2}
  enableHdri={true}
  showControls={true}
/>`}
                </pre>
              </li>
              <li>
                <strong>Toggle HDRI</strong> using the sun icon in the 3D viewer controls
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}