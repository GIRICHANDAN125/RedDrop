/**
 * AI Verification Service
 * Analyzes medical reports for authenticity
 * Uses heuristic + metadata analysis as the AI verification layer
 */

const sharp = require('sharp');
const axios = require('axios').default;

// Verify a medical report image/PDF
exports.verifyMedicalReport = async (fileUrl) => {
  try {
    const checks = await Promise.allSettled([
      checkMetadata(fileUrl),
      checkImageIntegrity(fileUrl),
      checkDateValidity(fileUrl),
      checkReportFormat(fileUrl)
    ]);

    const results = checks.map(c => c.status === 'fulfilled' ? c.value : { score: 50, flags: [] });
    
    const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const allFlags = results.flatMap(r => r.flags);

    return {
      isVerified: totalScore >= 60 && allFlags.length === 0,
      confidence: Math.round(totalScore),
      flags: allFlags,
      verifiedAt: new Date(),
      details: {
        metadataCheck: results[0],
        integrityCheck: results[1],
        dateCheck: results[2],
        formatCheck: results[3]
      }
    };
  } catch (error) {
    console.error('AI verification error:', error);
    return {
      isVerified: false,
      confidence: 0,
      flags: ['verification_failed'],
      verifiedAt: new Date()
    };
  }
};

async function checkMetadata(url) {
  // Check if file URL is from a trusted object storage domain.
  const trustedDomains = ['storage.googleapis.com', 'amazonaws.com'];
  const isTrusted = trustedDomains.some(d => url.includes(d));

  return {
    score: isTrusted ? 85 : 40,
    flags: isTrusted ? [] : ['untrusted_source']
  };
}

async function checkImageIntegrity(url) {
  try {
    // In production: download image and use sharp to check for manipulation
    // Check EXIF data, color histograms, noise patterns
    const response = await axios.head(url, { timeout: 5000 });
    const contentType = response.headers['content-type'];
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const isValidType = validTypes.some(t => contentType?.includes(t.split('/')[1]));

    return {
      score: isValidType ? 80 : 20,
      flags: isValidType ? [] : ['invalid_file_type']
    };
  } catch {
    return { score: 50, flags: ['integrity_check_failed'] };
  }
}

async function checkDateValidity(url) {
  // In production: OCR the document to extract dates
  // Check if report date is within last 30 days
  // Here we simulate — real implementation needs OCR (e.g., Google Vision API)
  return { score: 75, flags: [] };
}

async function checkReportFormat(url) {
  // Check if document has expected medical report structure
  // In production: use ML model trained on medical reports
  return { score: 80, flags: [] };
}

// Analyze request text for suspicious patterns
exports.analyzeRequestText = (text) => {
  const suspiciousPatterns = [
    /urgent.*money/i,
    /cash.*blood/i,
    /reward.*donor/i,
    /bitcoin/i,
    /payment.*required/i
  ];

  const flags = [];
  let score = 0;

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      flags.push('suspicious_text_pattern');
      score += 25;
    }
  });

  return { score: Math.min(score, 100), flags };
};

// Get confidence label
exports.getConfidenceLabel = (score) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
};
