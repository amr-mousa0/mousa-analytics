import React from 'react';

export default function EvidenceStrip({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';
  
  const metrics = [
    { value: "100%", label: isAr ? "دقة ربط البيانات" : "Data Accuracy" },
    { value: "9.4K", label: isAr ? "طلبات تم تحليلها" : "Orders Analyzed" },
    { value: "$84.7K", label: isAr ? "مبيعات مدروسة" : "Sales Analyzed" },
    { value: "93K", label: isAr ? "إيرادات مستردة" : "Recovered Revenue" },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto py-12 md:py-24 flex justify-center border-t border-b border-text-main/5 relative z-20">
      <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-16 w-full px-8">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-text-main">
              {metric.value}
            </span>
            <span className="text-xs md:text-sm font-sans font-medium uppercase tracking-[0.1em] text-text-main/50 mt-2">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
