import bcrypt from 'bcrypt';
import { db } from './db.js';
import { config } from '../config.js';
import { currentYear } from '../utils/calculations.js';

export function seedDatabase() {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;

  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync(config.adminPassword, 10);
    db.prepare(
      `INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`
    ).run(config.adminUsername, passwordHash, 'مدير النظام', 'admin');
    console.log(`✔ تم إنشاء المستخدم الإداري: ${config.adminUsername}`);

    const viewerPasswordHash = bcrypt.hashSync(config.viewerPassword, 10);
    db.prepare(
      `INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`
    ).run(config.viewerUsername, viewerPasswordHash, 'مستخدم عرض', 'viewer');
    console.log(`✔ تم إنشاء مستخدم عرض تجريبي: ${config.viewerUsername}`);
  }

  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number }).c;
  if (settingsCount === 0) {
    db.prepare(
      `INSERT INTO settings (id, company_name, system_name, primary_color, secondary_color, success_color, warning_color, danger_color)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'يسوم للمحاماة',
      'مؤشرات أداء قسم التسويق',
      '#0B2545',
      '#C9A24B',
      '#15803D',
      '#D97706',
      '#DC2626'
    );
    console.log('✔ تم إنشاء إعدادات النظام الافتراضية');
  }

  const categoryCount = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }).c;
  if (categoryCount === 0) {
    const insertCategory = db.prepare(
      `INSERT INTO categories (name, description, status, sort_order) VALUES (?, ?, 'active', ?)`
    );
    const categories = [
      ['التسويق الرقمي', 'مؤشرات الحملات الإعلانية والقنوات الرقمية', 1],
      ['العلامة التجارية', 'مؤشرات الوعي بالعلامة التجارية والسمعة', 2],
      ['العملاء والاستشارات', 'مؤشرات جذب العملاء وطلبات الاستشارة', 3],
      ['المحتوى والإعلام', 'مؤشرات إنتاج المحتوى والتفاعل الإعلامي', 4],
    ];
    const categoryIds: number[] = [];
    for (const [name, description, order] of categories) {
      const info = insertCategory.run(name, description, order);
      categoryIds.push(Number(info.lastInsertRowid));
    }

    const insertKpi = db.prepare(
      `INSERT INTO kpis (category_id, name, description, unit, target, color, icon, sort_order, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`
    );

    const kpis: Array<[number, string, string, string, number, string, string, number, string]> = [
      [categoryIds[0], 'عدد الزيارات للموقع', 'إجمالي زيارات الموقع الإلكتروني', 'زيارة', 50000, '#0B2545', 'Globe', 1, 'زيارات من جميع القنوات'],
      [categoryIds[0], 'معدل التحويل', 'نسبة الزوار الذين أتموا إجراء مستهدف', '%', 5, '#C9A24B', 'Target', 2, ''],
      [categoryIds[0], 'تكلفة اكتساب العميل', 'متوسط تكلفة الحصول على عميل جديد', 'ريال', 300, '#DC2626', 'Wallet', 3, 'كلما قلت كان أفضل'],
      [categoryIds[1], 'الوعي بالعلامة التجارية', 'نسبة الوعي بالعلامة التجارية في السوق المستهدف', '%', 70, '#15803D', 'Award', 1, ''],
      [categoryIds[1], 'متابعو السوشيال ميديا', 'إجمالي المتابعين على منصات التواصل', 'متابع', 25000, '#0B2545', 'Users', 2, ''],
      [categoryIds[2], 'عدد طلبات الاستشارة', 'عدد طلبات الاستشارة القانونية الواردة', 'طلب', 200, '#C9A24B', 'MessageSquare', 1, ''],
      [categoryIds[2], 'معدل تحويل العملاء', 'نسبة تحويل الاستشارات إلى عملاء فعليين', '%', 35, '#15803D', 'UserCheck', 2, ''],
      [categoryIds[3], 'المقالات المنشورة', 'عدد المقالات القانونية المنشورة', 'مقال', 40, '#0B2545', 'FileText', 1, ''],
      [categoryIds[3], 'معدل التفاعل', 'نسبة التفاعل مع المحتوى المنشور', '%', 8, '#C9A24B', 'Heart', 2, ''],
    ];

    const kpiIds: number[] = [];
    for (const kpi of kpis) {
      const info = insertKpi.run(...kpi);
      kpiIds.push(Number(info.lastInsertRowid));
    }

    const insertValue = db.prepare(
      `INSERT INTO kpi_values (kpi_id, year, quarter, current_value, previous_value, target, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const year = currentYear();
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (const kpiId of kpiIds) {
      const kpiRow = db.prepare('SELECT target FROM kpis WHERE id = ?').get(kpiId) as { target: number };
      let previous = kpiRow.target * 0.6;
      for (const q of quarters) {
        const growthFactor = 0.85 + Math.random() * 0.35;
        const current = Number((previous * growthFactor + kpiRow.target * 0.1).toFixed(2));
        insertValue.run(kpiId, year, q, current, previous, kpiRow.target, '');
        previous = current;
      }
    }
    console.log('✔ تم إنشاء بيانات تجريبية للفئات والمؤشرات والقيم الفصلية');
  }

  console.log('تمت تهيئة قاعدة البيانات بنجاح ✔');
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedDatabase();
}
