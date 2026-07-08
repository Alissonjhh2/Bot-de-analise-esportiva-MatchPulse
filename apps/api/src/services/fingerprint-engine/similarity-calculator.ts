/**
 * Calculate Hamming distance between two hex strings
 */
function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64; // Max distance if lengths differ
  
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) distance++;
  }
  return distance;
}

/**
 * Calculate similarity percentage between two fingerprints
 */
export function calculateSimilarity(fingerprint1: string, fingerprint2: string): number {
  if (fingerprint1 === fingerprint2) return 100;
  
  const maxDistance = fingerprint1.length;
  const distance = hammingDistance(fingerprint1, fingerprint2);
  
  const similarity = ((maxDistance - distance) / maxDistance) * 100;
  return Math.max(0, similarity);
}

/**
 * Check if two fingerprints are similar above a threshold
 */
export function areSimilar(fingerprint1: string, fingerprint2: string, threshold: number = 85): boolean {
  return calculateSimilarity(fingerprint1, fingerprint2) >= threshold;
}

/**
 * Find similar fingerprints from a list
 */
export function findSimilarFingerprints(targetFingerprint: string, fingerprints: string[], threshold: number = 85): string[] {
  return fingerprints.filter(fp => areSimilar(targetFingerprint, fp, threshold));
}
