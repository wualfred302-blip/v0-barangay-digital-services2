#!/usr/bin/env node
/**
 * QRT ID Implementation Verification Script
 *
 * This script verifies that all required components and functions
 * are properly implemented for the QRT ID payment workflow.
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('QRT ID IMPLEMENTATION VERIFICATION');
console.log('========================================\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  const result = { name, status, passed: condition, details };
  checks.push(result);

  if (condition) {
    passed++;
    console.log(`${status} - ${name}`);
  } else {
    failed++;
    console.log(`${status} - ${name}`);
    if (details) console.log(`         ${details}`);
  }
}

// File existence checks
console.log('\n1. CHECKING FILE EXISTENCE:\n');

const files = [
  { path: 'app/payment/page.tsx', desc: 'Payment page' },
  { path: 'app/qrt-id/request/page.tsx', desc: 'QRT request form' },
  { path: 'lib/qrt-id-generator.ts', desc: 'QRT image generator' },
  { path: 'lib/qrt-context.tsx', desc: 'QRT context provider' },
  { path: 'lib/payment-utils.ts', desc: 'Payment utilities' },
  { path: 'components/qrt-id-front-template.tsx', desc: 'Front template' },
  { path: 'components/qrt-id-back-template.tsx', desc: 'Back template' },
  { path: 'components/payment-methods.tsx', desc: 'Payment method forms' },
];

files.forEach(({ path: filePath, desc }) => {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  check(desc, exists, exists ? '' : `Missing: ${filePath}`);
});

// Code content checks
console.log('\n2. CHECKING CODE IMPLEMENTATION:\n');

function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    check(description, false, `File not found: ${filePath}`);
    return false;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const contains = content.includes(searchString);
  check(description, contains, contains ? '' : `Missing: "${searchString}"`);
  return contains;
}

// Payment page checks
checkFileContains(
  'app/payment/page.tsx',
  'generateQRTIDImages',
  'Payment page imports generateQRTIDImages'
);

checkFileContains(
  'app/payment/page.tsx',
  'QRTIDFrontTemplate',
  'Payment page imports QRTIDFrontTemplate'
);

checkFileContains(
  'app/payment/page.tsx',
  'QRTIDBackTemplate',
  'Payment page imports QRTIDBackTemplate'
);

checkFileContains(
  'app/payment/page.tsx',
  'isQRTPayment',
  'Payment page handles QRT payment type'
);

checkFileContains(
  'app/payment/page.tsx',
  'frontRef',
  'Payment page has frontRef for template'
);

checkFileContains(
  'app/payment/page.tsx',
  'backRef',
  'Payment page has backRef for template'
);

checkFileContains(
  'app/payment/page.tsx',
  'visibility: "hidden"',
  'Templates use visibility:hidden strategy'
);

checkFileContains(
  'app/payment/page.tsx',
  'waitForImageLoad',
  'Payment page pre-loads images'
);

checkFileContains(
  'app/payment/page.tsx',
  'requestAnimationFrame',
  'Payment page waits for DOM render'
);

// QRT generator checks
checkFileContains(
  'lib/qrt-id-generator.ts',
  'html2canvas',
  'Generator imports html2canvas'
);

checkFileContains(
  'lib/qrt-id-generator.ts',
  'useCORS: true',
  'Generator enables CORS for images'
);

checkFileContains(
  'lib/qrt-id-generator.ts',
  'scale: 2',
  'Generator uses 2x scale for quality'
);

checkFileContains(
  'lib/qrt-id-generator.ts',
  'for (let attempt = 1; attempt <= 3',
  'Generator has retry logic'
);

// Template checks
checkFileContains(
  'components/qrt-id-front-template.tsx',
  'React.forwardRef',
  'Front template uses forwardRef'
);

checkFileContains(
  'components/qrt-id-front-template.tsx',
  'crossOrigin="anonymous"',
  'Front template has CORS for images'
);

checkFileContains(
  'components/qrt-id-front-template.tsx',
  'w-[856px] h-[540px]',
  'Front template has correct dimensions'
);

checkFileContains(
  'components/qrt-id-back-template.tsx',
  'React.forwardRef',
  'Back template uses forwardRef'
);

checkFileContains(
  'components/qrt-id-back-template.tsx',
  'crossOrigin="anonymous"',
  'Back template has CORS for images'
);

checkFileContains(
  'components/qrt-id-back-template.tsx',
  'w-[856px] h-[540px]',
  'Back template has correct dimensions'
);

// Package.json checks
console.log('\n3. CHECKING DEPENDENCIES:\n');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  check('html2canvas installed', !!deps['html2canvas']);
  check('qrcode installed', !!deps['qrcode']);
  check('next installed', !!deps['next']);
  check('react installed', !!deps['react']);
} else {
  check('package.json exists', false, 'package.json not found');
}

// Console logging checks
console.log('\n4. CHECKING DEBUG LOGGING:\n');

checkFileContains(
  'app/payment/page.tsx',
  '[QRT ID Generation]',
  'Has QRT ID generation logs'
);

checkFileContains(
  'lib/qrt-id-generator.ts',
  '[html2canvas]',
  'Has html2canvas logs'
);

checkFileContains(
  'app/payment/page.tsx',
  'console.log',
  'Uses console.log for debugging'
);

// Error handling checks
console.log('\n5. CHECKING ERROR HANDLING:\n');

checkFileContains(
  'app/payment/page.tsx',
  'try {',
  'Payment page has try-catch blocks'
);

checkFileContains(
  'app/payment/page.tsx',
  'catch (imgError)',
  'Payment page catches image errors'
);

checkFileContains(
  'lib/qrt-id-generator.ts',
  'catch (error)',
  'Generator has error handling'
);

checkFileContains(
  'app/payment/page.tsx',
  'Continue without images',
  'Gracefully handles missing images'
);

// Data structure checks
console.log('\n6. CHECKING DATA STRUCTURES:\n');

checkFileContains(
  'app/payment/page.tsx',
  'idFrontImageUrl',
  'QRT record has front image URL field'
);

checkFileContains(
  'app/payment/page.tsx',
  'idBackImageUrl',
  'QRT record has back image URL field'
);

checkFileContains(
  'app/payment/page.tsx',
  'qrCodeData',
  'QRT record has QR code data field'
);

checkFileContains(
  'app/payment/page.tsx',
  'status: "ready"',
  'QRT record sets ready status'
);

// Summary
console.log('\n========================================');
console.log('VERIFICATION SUMMARY');
console.log('========================================\n');

console.log(`Total Checks: ${checks.length}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log(`Success Rate: ${Math.round((passed / checks.length) * 100)}%\n`);

if (failed === 0) {
  console.log('🎉 All checks passed! Implementation looks good.\n');
  console.log('NEXT STEPS:');
  console.log('1. Run the development server: npm run dev');
  console.log('2. Navigate to the payment page');
  console.log('3. Test the payment workflow manually');
  console.log('4. Check browser console for logs');
  console.log('5. Verify QRT ID images are generated\n');
} else {
  console.log('⚠️  Some checks failed. Review the issues above.\n');
  console.log('RECOMMENDATIONS:');
  console.log('1. Fix missing files or imports');
  console.log('2. Ensure all dependencies are installed');
  console.log('3. Review the implementation guide');
  console.log('4. Run npm install if dependencies are missing\n');
}

// Generate detailed report
const reportPath = path.join(__dirname, 'verification-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalChecks: checks.length,
  passed,
  failed,
  successRate: Math.round((passed / checks.length) * 100),
  checks: checks
}, null, 2));

console.log(`Detailed report saved to: ${reportPath}\n`);

process.exit(failed > 0 ? 1 : 0);
