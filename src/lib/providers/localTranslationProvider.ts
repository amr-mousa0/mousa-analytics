import type { TranslationProvider } from '../../types/providers.js';
import { TranslationMemory } from './translationMemory.js';

/**
 * Local Translation Provider implementation (formerly DefaultTranslationProvider)
 * Used in Development environments to mock translations.
 */
export class LocalTranslationProvider implements TranslationProvider {
  public id = 'local-provider';

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;

    // Translation Execution (dynamic provider logic)
    const translatedText = await this.executeTranslation(text, sourceLang, targetLang);

    return translatedText;
  }

  private async executeTranslation(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // Basic dynamic formatting preservation helper for free provider execution
    if (targetLang === 'ar' && sourceLang === 'en') {
      return this.mockTranslateToArabic(text);
    }
    return text;
  }

  private mockTranslateToArabic(text: string): string {
    const replacements: Record<string, string> = {
      'Enterprise CRM & ERP Platform': 'منصة إدارة علاقات العملاء وتخطيط الموارد للمؤسسات',
      'Comprehensive CRM & ERP solution for high-scale enterprise operations.': 'حل شامل لإدارة علاقات العملاء وتخطيط الموارد للعمليات المؤسسية واسعة النطاق.',
      'Sales Performance & Territory Analytics': 'تحليل أداء المبيعات والمناطق الجغرافية',
      'SQL Practice Level 1 - Data Analytics Challenges': 'رحلة تدريب SQL - المستوى الأول (تحديات تحليل البيانات)',
      'Regional managers lacked real-time visiblity into monthly revenue quotas and dynamic target achievements.': 'افتقرت الشركة إلى الرؤية اللحظية لأداء المبيعات الأسبوعية والشهري للمناطق الجغرافية المختلفة، مما تسبب في صعوبة متابعة الأهداف والتارقت وتحديد الاختناقات.',
      'Built an enterprise Star Schema model with DAX measures for YTD growth and variance analysis.': 'بنينا نموذج بيانات متكامل (Star Schema) في Power BI مع معادلات DAX متطورة لقياس النمو السنوي (YTD) وتحليل الفروقات وتتبع أداء فرق المبيعات لحظياً.',
      'Increased regional sales forecast accuracy by 35% and saved 12 hours of manual reporting per week.': 'رفع دقة التوقعات البيعية بنسبة 35% وتوفير 12 ساعة عمل أسبوعياً من إعداد التقارير اليدوية.',
      'Analysts needed real-world query exercises to sharpen data extraction and performance optimization skills.': 'عانى محللو البيانات الجدد من صعوبة تطبيق الاستعلامات المعقدة وتصفية البيانات الكبيرة على قواعد بيانات حقيقية، مع غياب ممارسات عملية واختبارات قياس أداء الاستعلامات.',
      'Created 25+ structured SQL problems with synthetic e-commerce datasets and benchmark solutions.': 'تم إنشاء أكثر من 25 تمريناً عملياً معتمداً على قواعد بيانات e-commerce حقيقية وتطوير حلول مرجعية باستخدام SQL Server وPostgreSQL مع تحسين أداء الاستعلامات.',
      'Accelerated analytical onboarding time by 40% for junior data analysts.': 'تسريع تأهيل المحللين الجدد بنسبة 40% وتوفير دليل عملي كامل للتعامل مع البيانات الضخمة والاستعلامات المتقدمة.',
      'Data Analytics': 'تحليلات البيانات',
      'Power BI': 'باور بي أي',
      'SQL Server': 'خادم SQL',
      'Production': 'إنتاج حي'
    };

    return replacements[text] || text;
  }
}
