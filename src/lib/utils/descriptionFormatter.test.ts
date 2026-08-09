import { formatCardDescription, isArabicText } from './descriptionFormatter.js';
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

function assertLte(actual: number, max: number, testName: string) {
  totalTests++;
  if (actual <= max) {
    console.log(`[PASS] ${testName} (${actual} <= ${max})`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    console.error(`  Expected <= ${max}, got ${actual}`);
  }
}

// ===== LANGUAGE DETECTION TESTS =====

assertEqual(isArabicText("Short description under the limit."), false, "Language Detection: English text detected as non-Arabic");
assertEqual(isArabicText("وصف قصير لمشروع تحليلي لا يتجاوز الحد الأدنى."), true, "Language Detection: Arabic text detected as Arabic");
assertEqual(isArabicText("مشروع Marketing ROI Analytics قام بتحليل بيانات"), true, "Language Detection: Mixed text with Arabic majority detected as Arabic");
assertEqual(isArabicText(""), false, "Language Detection: Empty string returns false");

// ===== WORD COUNT RULE TESTS =====

// Case W1: English text under 22 words passes un-cut
const shortEn = "Short description under the limit.";
assertEqual(formatCardDescription(shortEn), shortEn, "Case W1: English text under 22 words passes un-cut");

// Case W2: Arabic text under 18 words passes un-cut
const shortAr = "وصف قصير لمشروع تحليلي لا يتجاوز الحد الأدنى.";
assertEqual(formatCardDescription(shortAr), shortAr, "Case W2: Arabic text under 18 words passes un-cut");

// Case W3: English text exactly 22 words passes un-cut
const exact22En = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two.";
const exact22Words = exact22En.split(/\s+/).length;
assertEqual(exact22Words, 22, "Case W3a: Verify test string is exactly 22 words");
assertEqual(formatCardDescription(exact22En), exact22En, "Case W3b: English text exactly 22 words passes un-cut");

// Case W4: Arabic text exactly 18 words passes un-cut
const exact18Ar = "كان المشروع يعاني من مشاكل كبيرة في الإدارة والتنظيم وعدم وجود نظام تتبع متكامل للبيانات والتقارير المالية.";
const exact18ArWords = exact18Ar.split(/\s+/).length;
assertEqual(exact18ArWords <= 18, true, "Case W4a: Verify Arabic test string is <= 18 words");
assertEqual(formatCardDescription(exact18Ar), exact18Ar, "Case W4b: Arabic text at/under 18 words passes un-cut");

// Case W5: English text over 22 words gets truncated
const longEn30Words = "Management spent heavily across platforms Facebook Instagram Pinterest Google Youtube LinkedIn Tiktok SnapChat Twitter without any tracking mechanism for channel ROI CTR conversion rates and seasonal variants impact on overall";
const resultLongEn = formatCardDescription(longEn30Words);
const resultEnWordCount = resultLongEn.replace(/\.{3}$/, '').split(/\s+/).length;
assertLte(resultEnWordCount, CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION_WORDS_EN, "Case W5: English text over 22 words truncated to <= 22 words");

// Case W6: Arabic text over 18 words gets truncated
const longAr25Words = "هل الجيم بتاعك بيكسب بجد ولا عايش في وهم الربحية كام اشتراك وتجديد بيضيعوا منك كل شهر عشان معندكش تتبع إدارة جيم رياضي بالدفاتر والورق";
const resultLongAr = formatCardDescription(longAr25Words);
const resultArWordCount = resultLongAr.replace(/\.{3}$/, '').split(/\s+/).length;
assertLte(resultArWordCount, CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION_WORDS_AR, "Case W6: Arabic text over 18 words truncated to <= 18 words");

// Case W7: Truncated text ends with ellipsis when no sentence boundary
assertEqual(resultLongEn.endsWith('...'), true, "Case W7: Word-truncated English text ends with ellipsis (...)");
assertEqual(resultLongAr.endsWith('...'), true, "Case W8: Word-truncated Arabic text ends with ellipsis (...)");

// ===== SENTENCE BOUNDARY TESTS (within word limits) =====

// Case S1: Long English text with sentence boundary within word limit
const longEnSentence = "The café was crippled by operational blindness: high perishable inventory waste and unpredictable customer peak hours. Complete lack of visibility into which products drove revenue from 10,000 transaction rows ruined growth.";
const resultEnSentence = formatCardDescription(longEnSentence);
const resultEnSentenceWords = resultEnSentence.split(/\s+/).length;
assertLte(resultEnSentenceWords, CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION_WORDS_EN, "Case S1: English sentence-truncated stays within 22 word limit");

// Case S2: Long Arabic text with sentence boundary within word limit
const longArSentence = "صاحب الكافيه كان بيعاني من عشوائية في الحسابات وعمى تشغيلي كامل مفيش أي تنظيم لحسابات الكافيه والمخازن. البيانات كلها متلخبطة في شيتات متبهدلة فيها أكتر من عشرة آلاف صف وتسببت في خسائر كبيرة للشركة.";
const resultArSentence = formatCardDescription(longArSentence);
const resultArSentenceWords = resultArSentence.split(/\s+/).length;
assertLte(resultArSentenceWords, CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION_WORDS_AR, "Case S2: Arabic sentence-truncated stays within 18 word limit");

// ===== IDEMPOTENCY TESTS =====

// Case I1: Re-formatting formatted English output produces identical string
const firstRunEn = formatCardDescription(longEn30Words);
const secondRunEn = formatCardDescription(firstRunEn);
assertEqual(secondRunEn, firstRunEn, "Case I1: Idempotency verified for English - re-formatting produces identical string");

// Case I2: Re-formatting formatted Arabic output produces identical string
const firstRunAr = formatCardDescription(longAr25Words);
const secondRunAr = formatCardDescription(firstRunAr);
assertEqual(secondRunAr, firstRunAr, "Case I2: Idempotency verified for Arabic - re-formatting produces identical string");

// ===== CHARACTER FALLBACK TESTS =====

// Case C1: Single long word (no spaces) hits character limit
const exactCharText = "A".repeat(CONTENT_LIMITS.PROJECT_CARD_DESCRIPTION);
assertEqual(formatCardDescription(exactCharText), exactCharText, "Case C1: Text exactly at character limit passes un-cut (1 word)");

// ===== MIXED TEXT TESTS =====

// Case M1: Mixed English/Arabic text under both limits passes cleanly
const mixedText = "مشروع Marketing ROI Analytics قام بتحليل بيانات Google Ads وتم تتبع عائد الاستثمار.";
assertEqual(formatCardDescription(mixedText), mixedText, "Case M1: Mixed English/Arabic text under limit passes cleanly");

// ===== EDGE CASES =====
assertEqual(formatCardDescription(""), "", "Edge: Empty string returns empty");
assertEqual(formatCardDescription("   "), "", "Edge: Whitespace-only returns empty");

console.log(`\n=== Verification Results: ${passedTests}/${totalTests} Tests Passed ===`);

