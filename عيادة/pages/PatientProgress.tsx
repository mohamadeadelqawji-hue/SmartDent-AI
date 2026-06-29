import React, { useMemo, useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';

// دالة لتوليد ألوان مميزة ومختلفة لكل سن تلقائياً لتمييز الخطوط والنقاط بوضوح
const getRandomColor = (index) => {
  const colors = [
    '#ef4444', // أحمر
    '#3b82f6', // أزرق
    '#10b981', // أخضر
    '#f59e0b', // برتقالي/أصفر
    '#8b5cf6', // بنفسجي
    '#ec4899', // وردي
    '#14b8a6', // تركواز
    '#f97316', // برتقالي غامق
    '#06b6d4', // سماوي
    '#a855f7'  // أرجواني
  ];
  return colors[index % colors.length];
};

const PatientHealthDashboard = ({ patientId, token }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const userRole = localStorage.getItem('role'); 
  const isDoctor = userRole === 'doctor';

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          'accept': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://127.0.0.1:8000/get_all_ill_User_from_Visites_and_Images/${patientId}`, {
          method: 'GET',
          headers: headers
        });

        if (response.status === 401) {
          throw new Error("غير مصرح لك بالوصول (انتهت صلاحية الجلسة أو التوكن غير صحيح).");
        }
        
        if (!response.ok) {
          throw new Error(`خطأ في السيرفر: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err.message || "فشل في جلب بيانات التحليل الخاصة بالمريض.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, token]);

  // 1. حساب إجمالي الإصابات التاريخية للمخطط الراداري المحدث
  const radarData = useMemo(() => {
    // تم إضافة جميع العدادات الثمانية الجديدة هنا ومطابقتها مع الـ API
    const counts = { 
      "Caries": 0, 
      "Filling": 0, 
      "Crown": 0, 
      "Impacted": 0,
      "Implant": 0,
      "Braces": 0,
      "Bridge": 0,
      "Root Canal": 0
    };
    
    if (!data || data.length === 0) {
      return [
        { subject: 'تسوس', A: 0 },
        { subject: 'حشوة', A: 0 },
        { subject: 'تاج', A: 0 },
        { subject: 'منطمر', A: 0 },
        { subject: 'زراعة', A: 0 },
        { subject: 'تقويم', A: 0 },
        { subject: 'جسر', A: 0 },
        { subject: 'علاج عصب', A: 0 },
      ];
    }
    
    data.forEach(visit => {
      if (visit.images) {
        visit.images.forEach(img => {
          if (img.diseases) {
            img.diseases.forEach(d => {
              if (counts[d.finding] !== undefined) {
                counts[d.finding] += 1;
              } else {
                counts[d.finding] = 1;
              }
            });
          }
        });
      }
    });

    return [
      { subject: 'تسوس', A: counts["Caries"] || 0 },
      { subject: 'حشوة', A: counts["Filling"] || 0 },
      { subject: 'تاج', A: counts["Crown"] || 0 },
      { subject: 'منطمر', A: counts["Impacted"] || 0 },
      { subject: 'زراعة', A: counts["Implant"] || 0 },
      // { subject: 'تقويم', A: counts["Braces"] || 0 },
      { subject: 'جسر', A: counts["Bridge"] || 0 },
      { subject: 'علاج عصب', A: counts["Root Canal"] || 0 },
    ];
  }, [data]);

  // 2. ملخص عدد الصور في كل زيارة
  const visitsSummary = useMemo(() => {
    if (!data) return [];
    return data.map(v => ({
      date: v.date,
      count: v.images ? v.images.length : 0
    }));
  }, [data]);

  // 3. بناء وتجهيز بيانات الأسنان المصابة برمجياً وحساب المساحات من مصفوفات إحداثيات YOLO
  const { chartData, allTeeth } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], allTeeth: [] };

    // فرز الزيارات تصاعدياً حسب التاريخ لضمان تسلسل زمني صحيح من اليسار لليمين
    const sortedVisits = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // تجميع كافة أرقام الأسنان الفريدة التي تحتوي على تشخيصات في تاريخ المريض
    const teethSet = new Set();
    sortedVisits.forEach(visit => {
      if (visit.images) {
        visit.images.forEach(img => {
          if (img.diseases) {
            img.diseases.forEach(d => {
              const toothNum = d.tooth_number || d.tooth_id || d.tooth;
              if (toothNum) teethSet.add(toothNum.toString());
            });
          }
        });
      }
    });

    const uniqueTeeth = Array.from(teethSet);

    // بناء مصفوفة البيانات الزمنية لكل زيارة
    const formattedData = sortedVisits.map((visit, index) => {
      const visitRow = {
        visitName: `زيارة ${index + 1}`,
        date: visit.date,
        rawDetails: {} // سنحفظ به تفاصيل الإصابة العربية لكل سن مع المساحة المحسوبة
      };

      // تعيين قيمة افتراضية (صفر إصابات) لكل سن تم اكتشافه تاريخياً لدى المريض
      uniqueTeeth.forEach(tooth => {
        visitRow[`tooth_${tooth}`] = 0;
      });

      // البحث عن الإصابات النشطة في هذه الزيارة بالتحديد وتحديث قيمتها
      if (visit.images) {
        visit.images.forEach(img => {
          if (img.diseases) {
            img.diseases.forEach(d => {
              const toothNum = d.tooth_number || d.tooth_id || d.tooth;
              if (toothNum) {
                const key = `tooth_${toothNum}`;
                // زيادة عداد الإصابات للسن المحدد في هذه الزيارة
                visitRow[key] = (visitRow[key] || 0) + 1;

                // ترجمة المسميات الطبية المحدثة بالكامل للعربية لتظهر في الـ Tooltip
                let diseaseName = d.finding;
                if (d.finding === "Caries") diseaseName = "تسوس";
                else if (d.finding === "Filling") diseaseName = "حشوة";
                else if (d.finding === "Crown") diseaseName = "تاج";
                else if (d.finding === "Impacted") diseaseName = "منطمر";
                else if (d.finding === "Implant") diseaseName = "زراعة";
                else if (d.finding === "Braces") diseaseName = "تقويم";
                else if (d.finding === "Bridge") diseaseName = "جسر";
                else if (d.finding === "Root Canal") diseaseName = "علاج عصب";

                // حساب المساحة ديناميكياً من الـ defect_bbox الخاص بـ YOLO
                let areaText = " (المساحة: غير محددة)";
                if (d.defect_bbox && Array.isArray(d.defect_bbox) && d.defect_bbox.length === 4) {
                  const [x_min, y_min, x_max, y_max] = d.defect_bbox;
                  const width = Math.abs(x_max - x_min);
                  const height = Math.abs(y_max - y_min);
                  const calculatedArea = width * height;
                  
                  // تنسيق الرقم بطريقة k لسهولة القراءة إذا تجاوز الألف بكسل
                  const formattedArea = calculatedArea > 1000 
                    ? `${(calculatedArea / 1000).toFixed(1)}k` 
                    : calculatedArea;
                    
                  areaText = ` (المساحة: ${formattedArea} px²)`;
                }

                if (!visitRow.rawDetails[toothNum]) {
                  visitRow.rawDetails[toothNum] = [];
                }
                // دمج اسم التشخيص مع مساحته داخل مصفوفة التفاصيل
                visitRow.rawDetails[toothNum].push(`${diseaseName}${areaText}`);
              }
            });
          }
        });
      }

      return visitRow;
    });

    return { chartData: formattedData, allTeeth: uniqueTeeth };
  }, [data]);

  // واجهات التحميل والخطأ وعدم وجود بيانات
  if (loading) {
    return isDoctor && (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', fontFamily: 'Arial, sans-serif' }}>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '15px', color: '#64748b' }}>جاري تحميل وتحليل بيانات الأشعة للمريض {patientId}...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '20px', borderRadius: '15px', textAlign: 'center', margin: '20px auto', maxWidth: '600px', fontFamily: 'Arial, sans-serif' }}>
        <h4 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>عذراً، حدث خطأ أثناء التحميل</h4>
        <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: 0 }}>{error}</p>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '10px' }}>تأكت من تسجيل الدخول بصلاحيات طبيب صالحة.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div dir="rtl" style={{ background: '#f8fafc', padding: '30px', borderRadius: '20px', textAlign: 'center', margin: '20px auto', maxWidth: '600px', fontFamily: 'Arial, sans-serif', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#475569', margin: '0 0 10px 0' }}>لا يوجد سجل زيارات</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>المريض الحالي ليس لديه أي صور أشعة أو زيارات مسجلة في النظام بعد.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      
      {/* القسم الأول: المخطط الراداري البصمة التراكمية (أصبح ثماني الأبعاد الآن ليناسب كل الأمراض) */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '5px' }}>بصمة حالة المريض التراكمية</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>ملخص تراكمي لتوزع الإصابات والمشاكل المكتشفة عبر كافة الزيارات</p>
        
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
              <Radar name="المريض" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* المخطط المعدل: تتبع الخطوط الفردية لكل سن مصاب على حدة مع معالجة الصفر */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '30px' }}>
        <h3 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '1.3rem', fontWeight: 'bold' }}>
          تتبع مسار وعلاج كل سن على حدة عبر الزيارات
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
          كل خط ملون يمثل سنّاً معيناً برقم محدد. نزول الخط والنقطة إلى المستوى (0) يمثل الشفاء التام أو المعالجة الناجحة للسن.
        </p>

        <div style={{ width: '100%', height: 380 }} dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="visitName" 
                tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              
              {/* إزاحة طفيفة للمجال الأسفل (-0.15) لرفع النقاط الصفرية فوق خط المحور الرمادي وجعلها مرئية بالكامل */}
              <YAxis 
                allowDecimals={false}
                domain={[-0.15, 'auto']} 
                tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                tickLine={{ stroke: '#cbd5e1' }}
                label={{ 
                  value: 'عدد الإصابات النشطة بالسن الواحد', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fill: '#64748b', fontWeight: 'bold', textAnchor: 'middle' },
                  offset: -5
                }}
              />
              
              {/* نافذة التلميحات التفاعلية Tooltip */}
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const currentData = payload[0].payload;
                    return (
                      <div style={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0', 
                        padding: '15px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        textAlign: 'right',
                        fontFamily: 'Arial, sans-serif',
                        minWidth: '240px'
                      }}>
                        <p style={{ fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                          {currentData.visitName} ({currentData.date})
                        </p>
                        
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <p style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b', margin: '0 0 6px 0' }}>
                            حالة الأسنان في هذه الزيارة:
                          </p>
                          {Object.keys(currentData.rawDetails).length > 0 ? (
                            <ul style={{ paddingRight: '15px', margin: 0, fontSize: '0.8rem', color: '#0f172a', lineHeight: '1.6' }}>
                              {Object.entries(currentData.rawDetails).map(([tooth, diseases]) => (
                                <li key={tooth} style={{ marginBottom: '4px' }}>
                                  <strong>السن رقم {tooth}:</strong> {diseases.join(' + ')}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '0.8rem', color: '#10b981', margin: 0 }}>جميع الأسنان سليمة تماماً في هذه الزيارة.</p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} />
              
              {/* رسم خطوط ديناميكية مميزة مع نقاط ثابتة مرئية */}
              {allTeeth.map((tooth, index) => (
                <Line
                  key={tooth}
                  type="monotone"
                  dataKey={`tooth_${tooth}`}
                  name={`السن رقم ${tooth}`}
                  stroke={getRandomColor(index)}
                  strokeWidth={3}
                  activeDot={{ r: 7 }}
                  dots={{ r: 4, strokeWidth: 1 }} // تفعيل نقاط المسار الدائرية لتسهيل رؤية الأسنان السليمة عند الصفر
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* زر التفاصيل الإضافية */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '12px 25px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: '0.3s'
            }}
          >
            {showDetails ? 'إخفاء التقارير التفصيلية' : 'مزيد من التفاصيل للزيارات والصور 🔍'}
          </button>
        </div>
      </div>

      {/* القسم الثاني: يظهر عند الضغط على زر "مزيد من التفاصيل" */}
      {showDetails && (
        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease-in' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: '#1e293b', marginBottom: '15px' }}>توزيع الصور حسب تاريخ الزيارة</h4>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={visitsSummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'عدد الصور', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[5, 5, 0, 0]} name="عدد الصور" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h4 style={{ color: '#1e293b', margin: '30px 0 15px 0' }}>تحليل تفصيلي لعدد الإصابات في صور كل زيارة:</h4>
          {data.filter(v => v.images && v.images.length > 0).map(visit => (
            <div key={visit.visit_id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '15px', borderRight: '5px solid #3b82f6' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>زيارة تاريخ: {visit.date}</p>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={visit.images.map(img => ({ id: img.image_id, diseasesCount: img.diseases ? img.diseases.length : 0 }))}>
                    <XAxis dataKey="id" />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="diseasesCount" fill="#6366f1" radius={[4, 4, 0, 0]} name="عدد الأمراض المكتشفة بالصورة" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PatientHealthDashboard;