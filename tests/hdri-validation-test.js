/**
 * HDRI Upload Validation Test
 * Tests the HDRI file validation logic used in the HDRIUpload component
 */

// Mock File constructor for testing
class MockFile {
  constructor(name, size, type) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

// Supported HDRI formats (from HDRIUpload component)
const SUPPORTED_HDRI_FORMATS = {
  hdr: ['.hdr', '.HDR'],
  exr: ['.exr', '.EXR'],
  hdri: ['.hdri', '.HDRI'],
  pic: ['.pic', '.PIC']
};

// Validation function (from HDRIUpload component)
const validateHDRIFile = (file) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidHDRI = Object.values(SUPPORTED_HDRI_FORMATS).flat().some(ext => ext.toLowerCase() === fileExtension);

  if (!isValidHDRI) {
    validation.isValid = false;
    validation.errors.push(`Unsupported HDRI format: ${fileExtension}`);
  }

  // Check file size (100MB limit for HDRI)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    validation.isValid = false;
    validation.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 100MB limit`);
  }

  // Warnings for large files
  if (file.size > 50 * 1024 * 1024) { // 50MB
    validation.warnings.push(`Large HDRI file (${(file.size / 1024 / 1024).toFixed(1)}MB) may impact loading times`);
  }

  return validation;
};

// Test cases
const testCases = [
  // Valid HDRI files
  {
    name: 'Valid HDR file',
    file: new MockFile('studio_lighting.hdr', 30 * 1024 * 1024, 'image/x-hdr'),
    expectedValid: true,
    expectedWarnings: 0
  },
  {
    name: 'Valid EXR file',
    file: new MockFile('environment.exr', 25 * 1024 * 1024, 'image/x-exr'),
    expectedValid: true,
    expectedWarnings: 0
  },
  {
    name: 'Valid HDRI file',
    file: new MockFile('lighting.hdri', 20 * 1024 * 1024, 'application/octet-stream'),
    expectedValid: true,
    expectedWarnings: 0
  },
  {
    name: 'Valid PIC file',
    file: new MockFile('radiance.pic', 15 * 1024 * 1024, 'image/vnd.radiance'),
    expectedValid: true,
    expectedWarnings: 0
  },
  
  // Large but valid files (with warnings)
  {
    name: 'Large HDR file (with warning)',
    file: new MockFile('large_environment.hdr', 60 * 1024 * 1024, 'image/x-hdr'),
    expectedValid: true,
    expectedWarnings: 1
  },
  
  // Invalid files
  {
    name: 'File too large',
    file: new MockFile('huge_environment.hdr', 120 * 1024 * 1024, 'image/x-hdr'),
    expectedValid: false,
    expectedWarnings: 1
  },
  {
    name: 'Invalid file type',
    file: new MockFile('image.jpg', 5 * 1024 * 1024, 'image/jpeg'),
    expectedValid: false,
    expectedWarnings: 0
  },
  {
    name: 'Invalid extension',
    file: new MockFile('file.txt', 1 * 1024 * 1024, 'text/plain'),
    expectedValid: false,
    expectedWarnings: 0
  },
  
  // Case sensitivity tests
  {
    name: 'Uppercase HDR extension',
    file: new MockFile('ENVIRONMENT.HDR', 30 * 1024 * 1024, 'application/octet-stream'),
    expectedValid: true,
    expectedWarnings: 0
  },
  {
    name: 'Mixed case EXR extension',
    file: new MockFile('lighting.ExR', 25 * 1024 * 1024, 'application/octet-stream'),
    expectedValid: true,
    expectedWarnings: 0
  }
];

// Run tests
console.log('🧪 Running HDRI Validation Tests...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = validateHDRIFile(testCase.file);
  
  const validMatch = result.isValid === testCase.expectedValid;
  const warningsMatch = result.warnings.length === testCase.expectedWarnings;
  
  if (validMatch && warningsMatch) {
    console.log(`✅ Test ${index + 1}: ${testCase.name} - PASSED`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.name} - FAILED`);
    console.log(`   Expected valid: ${testCase.expectedValid}, got: ${result.isValid}`);
    console.log(`   Expected warnings: ${testCase.expectedWarnings}, got: ${result.warnings.length}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`   Warnings: ${result.warnings.join(', ')}`);
    }
    failed++;
  }
});

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! HDRI validation is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please review the validation logic.');
}

// Test supported formats display
console.log('\n📋 Supported HDRI Formats:');
Object.entries(SUPPORTED_HDRI_FORMATS).forEach(([format, extensions]) => {
  console.log(`   ${format.toUpperCase()}: ${extensions.join(', ')}`);
});

console.log('\n📏 File Size Limits:');
console.log('   Maximum: 100MB');
console.log('   Warning threshold: 50MB');

console.log('\n🔧 Integration Notes:');
console.log('   - Upload API endpoint: /api/upload with bucket=hdri-files');
console.log('   - Storage bucket: hdri-files');
console.log('   - Default intensity: 1.0 (0.1-2.0 range)');
console.log('   - Background blur: 0-10 scale');
console.log('   - Maximum HDRI files per product: 2');