import { formatCardDescription } from './descriptionFormatter.js';
import { CONTENT_LIMITS } from '../config/contentLimits.js';

console.log('=== Running Edge Case & Boundary Verification Suite for Description Formatter ===\n');

let passedTests = 0;
let totalTests = 0;

function assertEqual(actual: any, expected: any, testName: string) {
  totalTests++;
  if (actual === expected) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    console.error(`  Expected: "${expected}"`);
    console.error(`  Actual:   "${actual}"`);
  }
}

// Case 1: Short text < 220 chars (English)
const shortEn = "Short description under the limit.";
assertEqual(formatCardDescription(shortEn), shortEn, "Case 1: English text < 220 chars passes un-cut");

// Case 2: Short text < 220 chars (Arabic)
const shortAr = "وصف قصير لمشروع تحليلي لا يتجاوز الحد الأدنى.";
assertEqual(formatCardDescription(shortAr), shortAr, "Case 2: Arabic text < 220 chars passes un-cut");

// Case 3: Exactly 220 chars
const exactText = "A".repeat(CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION);
assertEqual(formatCardDescription(exactText), exactText, "Case 3: Text exactly equal to 220 chars passes un-cut");

// Case 4: Long English text with sentence boundary
const longEnSentence = "The café was crippled by operational blindness: high perishable inventory waste and unpredictable customer peak hours. Complete lack of visibility into which products drove revenue from 10,000 transaction rows ruined growth.";
const resultEnSentence = formatCardDescription(longEnSentence);
assertEqual(
  resultEnSentence.endsWith('.'),
  true,
  "Case 4: Long English text cuts cleanly at full sentence boundary ending in dot"
);

// Case 5: Long Arabic text with sentence boundary
const longArSentence = "صاحب الكافيه كان بيعاني من عشوائية في الحسابات وعمى تشغيلي كامل، مفيش أي تنظيم لحسابات الكافيه والمخازن. البيانات كلها متلخبطة في شيتات متبهدلة فيها أكتر من 10,000 صف وتسببت في خسائر كبيرة للشركة.";
const resultArSentence = formatCardDescription(longArSentence);
assertEqual(
  resultArSentence.endsWith('.'),
  true,
  "Case 5: Long Arabic text cuts cleanly at full sentence boundary ending in dot"
);

// Case 6: Long text without punctuation (fallback word cut)
const longNoPunct = "Management spent heavily across platforms Facebook Instagram Pinterest Google Youtube LinkedIn Tiktok SnapChat Twitter without any tracking mechanism for channel ROI CTR conversion rates and seasonal variants impact on overall campaign performance efficiency budget scale";
const resultNoPunct = formatCardDescription(longNoPunct);
assertEqual(
  resultNoPunct.endsWith('...'),
  true,
  "Case 6: Long text without punctuation falls back to clean word cut ending in ellipsis (...)"
);

// Case 7: Idempotency check (Running formatter on already formatted output)
const firstRun = formatCardDescription(longNoPunct);
const secondRun = formatCardDescription(firstRun);
assertEqual(secondRun, firstRun, "Case 7: Idempotency verified - re-formatting formatted output produces identical string");

// Case 8: Mixed English/Arabic technical text
const mixedText = "مشروع Marketing ROI Analytics قام بتحليل بيانات Google Ads & Meta Ads وتم تتبع عائد الاستثمار الإعلاني لكل منصة بدقة عالية من خلال لوحة تحكم تفاعلية.";
assertEqual(formatCardDescription(mixedText), mixedText, "Case 8: Mixed English/Arabic text under limit passes cleanly");

console.log(`\n=== Verification Results: ${passedTests}/${totalTests} Tests Passed ===`);
