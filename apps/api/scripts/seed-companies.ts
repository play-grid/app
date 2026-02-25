import process from 'node:process';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { companiesTable } from '@/db/schema';

const GENERAL_COMPANIES = [
  { en: 'x.com', ar: 'اكس' },
  { en: 'Apple', ar: 'آبل' },
  { en: 'Google', ar: 'جوجل' },
  { en: 'Microsoft', ar: 'مايكروسوفت' },
  { en: 'Amazon', ar: 'أمازون' },
  { en: 'Meta Platforms', ar: 'ميتا' },
  { en: 'Tesla', ar: 'تيسلا' },
  { en: 'Netflix', ar: 'نتفليكس' },
  { en: 'Spotify', ar: 'سبوتيفاي' },
  { en: 'Nike', ar: 'نايكي' },
  { en: 'Adidas', ar: 'أديداس' },
  { en: 'Coca-Cola', ar: 'كوكا كولا' },
  { en: 'wpbpepsi.com', ar: 'بيبسي' },
  { en: 'McDonald\'s', ar: 'ماكدونالدز' },
  { en: 'Starbucks', ar: 'ستاربكس' },
  { en: 'Disney', ar: 'ديزني' },
  { en: 'Sony', ar: 'سوني' },
  { en: 'Samsung', ar: 'سامسونج' },
  { en: 'intel.com', ar: 'إنتل' },
  { en: 'NVIDIA', ar: 'إنفيديا' },
  { en: 'Oracle', ar: 'أوراكل' },
  { en: 'Adobe', ar: 'أدوبي' },
  { en: 'Volkswagen', ar: 'مجموعة فولكسفاغن' },
  { en: 'Uber', ar: 'أوبر' },
  { en: 'Airbnb', ar: 'إير بي إن بي' },
  { en: 'LinkedIn', ar: 'لينكد إن' },
  { en: 'TikTok', ar: 'تيك توك' },
  { en: 'Snapchat', ar: 'سناب شات' },
  { en: 'Pinterest', ar: 'بينترست' },
  { en: 'Reddit', ar: 'ريديت' },
  { en: 'Walmart', ar: 'وول مارت' },
  { en: 'Target', ar: 'تارجت' },
  { en: 'Best Buy', ar: 'بست باي' },
  { en: 'Ford', ar: 'فورد' },
  { en: 'Toyota', ar: 'تويوتا' },
  { en: 'BMW', ar: 'بي إم دبليو' },
  { en: 'Mercedes', ar: 'مرسيدس' },
  { en: 'Honda', ar: 'هوندا' },
  { en: 'FedEx', ar: 'فيديكس' },
  { en: 'Visa', ar: 'فيزا' },
  { en: 'Mastercard', ar: 'ماستركارد' },
  { en: 'Carrefour', ar: 'كارفور' },
  { en: 'PayPal', ar: 'باي بال' },
  { en: 'Zoom', ar: 'زووم' },
  { en: 'Slack', ar: 'سلاك' },
  { en: 'Saudi Aramco', ar: 'أرامكو السعودية' },
  { en: 'Tencent', ar: 'تينسنت' },
  { en: 'EA SPORTS', ar: 'إي إيه سبورتس' },
  { en: 'Johnson & Johnson', ar: 'جونسون آند جونسون' },
  { en: 'Alibaba', ar: 'علي بابا' },
  { en: 'Procter & Gamble', ar: 'بروكتر آند غامبل (P&G)' },
  { en: 'Hyundai', ar: 'هيونداي' },
  { en: 'Louis Vuitton', ar: 'لويس فيتون' },
  { en: 'Dior', ar: 'ديور' },
  { en: 'General Electric', ar: 'جنرال إلكتريك' },
  { en: 'Cisco', ar: 'سيسكو' },
  { en: 'hermes.com', ar: 'هيرميس' },
  { en: 'Nestlé', ar: 'نستله' },
  { en: 'Mitsubishi', ar: 'ميتسوبيشي' },
  { en: 'HSBC', ar: 'إتش إس بي سي' },
  { en: 'loreal.com', ar: 'لوريال' },
  { en: 'American Express', ar: 'أمريكان إكسبريس' },
  { en: 'Shell', ar: 'شل' },
  { en: 'Shopify', ar: 'شوبفاي' },
  { en: 'IBM', ar: 'آي بي إم' },
  { en: 'Dell', ar: 'ديل' },
  { en: 'HP', ar: 'إتش بي' },
  { en: 'Lenovo', ar: 'لينوفو' },
  { en: 'ASUS', ar: 'أسوس' },
  { en: 'Acer', ar: 'أيسر' },
  { en: 'AMD', ar: 'إيه إم دي' },
  { en: 'OpenAI', ar: 'أوبن أي آي' },
  { en: 'Huawei', ar: 'هواوي' },
  { en: 'oppo.com', ar: 'أوبو' },
  { en: 'Xiaomi', ar: 'شاومي' },
  { en: 'OnePlus', ar: 'ون بلس' },
  { en: 'LG', ar: 'إل جي' },
  { en: 'PlayStation', ar: 'بلايستيشن' },
  { en: 'Nintendo', ar: 'نينتندو' },
  { en: 'eBay', ar: 'إي باي' },
  { en: 'Booking.com', ar: 'بوكينغ' },
  { en: 'porsche.com', ar: 'بورش' },
  { en: 'Ferrari', ar: 'فيراري' },
  { en: 'Lamborghini', ar: 'لامبورغيني' },
  { en: 'audi.com', ar: 'أودي' },
  { en: 'Chevrolet', ar: 'شيفروليه' },
  { en: 'Jeep', ar: 'جيب' },
  { en: 'Nissan', ar: 'نيسان' },
  { en: 'Kia', ar: 'كيا' },
  { en: 'BP', ar: 'بي بي' },
  { en: '3m.com', ar: 'ثري إم' },
  { en: 'UPS', ar: 'يو بي إس' },
  { en: 'DHL', ar: 'دي إتش إل' },
  { en: 'shopcaterpillar.cl', ar: 'كاتربيلر' },
  { en: 'Unilever', ar: 'يونيليفر' },
  { en: 'IKEA', ar: 'إيكيا' },
  { en: 'H&M', ar: 'إتش آند إم' },
  { en: 'Zara', ar: 'زارا' },
  { en: 'Gucci', ar: 'غوتشي' },
  { en: 'Prada', ar: 'برادا' },
  { en: 'Chanel', ar: 'شانيل' },
  { en: 'Burberry', ar: 'بربري' },
  { en: 'Lacoste', ar: 'لاكوست' },
  { en: 'levi.com', ar: 'ليفايس' },
  { en: 'Ralph Lauren', ar: 'رالف لورين' },
  { en: 'KFC', ar: 'كنتاكي' },
  { en: 'Burger King', ar: 'برجر كينغ' },
  { en: 'Subway', ar: 'صب واي' },
  { en: 'Domino\'s Pizza', ar: 'دومينوز بيتزا' },
  { en: 'Papa John\'s', ar: 'بابا جونز' },
  { en: 'Warner Bros.', ar: 'وارنر بروس' },
  { en: 'Paramount', ar: 'باراماونت' },
  { en: 'Universal', ar: 'يونيفرسال' },
  { en: 'YouTube', ar: 'يوتيوب' },
  { en: 'Twitch', ar: 'تويتش' },
  { en: 'Epic Games', ar: 'إيبك غيمز' },
  { en: 'Activision Blizzard', ar: 'أكتيفيجن بليزارد' },
  { en: 'Roblox', ar: 'روبلكس' },
  { en: 'STC', ar: 'إس تي سي' },
];

const SAUDI_COMPANIES = [
  { en: 'Aramco', ar: 'أرامكو' },
  { en: 'Alrajhi Bank', ar: 'مصرف الراجحي' },
  { en: 'Almarai', ar: 'المراعي' },
  { en: 'Riyad Bank', ar: 'بنك الرياض' },
  { en: 'Alinma Bank', ar: 'مصرف الإنماء' },
  { en: 'Dr Sulaiman AlHabib Medical Centers', ar: 'مجموعة الدكتور سليمان الحبيب الطبية' },
  { en: 'Mobily', ar: 'موبايلي' },
  { en: 'Elm Company', ar: 'شركة علم' },
  { en: 'Aldrees Petroleum', ar: 'الدريس للخدمات البترولية' },
  { en: 'stc.com.sa', ar: 'اس تي سي' },
  { en: 'SABIC', ar: 'سابك' },
  { en: 'alahli.com', ar: 'البنك الأهلي' },
  { en: 'Saudia', ar: 'الخطوط السعودية' },
  { en: 'Aljazira', ar: 'بنك الجزيرة' },
  { en: 'Nahdi Medical Co', ar: 'شركة النهدي الطبية' },
  { en: 'noon', ar: 'نون' },
  { en: 'jahez.net', ar: 'جاهز' },
  { en: 'HungerStation', ar: 'هنقرستيشن' },
  { en: 'nana.sa', ar: 'نعناع' },
  { en: 'tamara.co', ar: 'تمارا' },
  { en: 'tabby.ai', ar: 'تابي' },
  { en: 'Othaim Markets', ar: 'أسواق العثيم' },
  { en: 'Nadec', ar: 'نادك' },
  { en: 'Careem', ar: 'كريم' },
  { en: 'MBC GROUP', ar: 'مجموعة ام بي سي' },
  { en: 'Shahid', ar: 'شاهد' },
  { en: 'alarabiya', ar: 'العربية' },
  { en: 'sdaia.gov.sa', ar: 'سدايا' },
  { en: 'humain.ai', ar: 'هيوماين' },
  { en: 'zain.com', ar: 'زين' },
  { en: 'Jarir', ar: 'جرير' },
  { en: 'thmanyah', ar: 'ثمانية' },
  { en: 'zamil', ar: 'الزامل' },
  { en: 'Saudi Electricity Company', ar: 'الشركة السعودية للكهرباء' },
  { en: 'tawuniya', ar: 'التعاونية' },
  { en: 'splonline.com.sa', ar: 'سبل' },
  { en: 'sab.com', ar: 'الأول' },
  { en: 'Kudu company for food and catering', ar: 'كودو' },
  { en: 'Albaik', ar: 'البيك' },
  { en: 'extra.com', ar: 'اكسترا' },
  { en: 'haraj', ar: 'حراج' },
  { en: 'syarah', ar: 'سيارة' },
  { en: 'Panda Retail Company', ar: 'بنده' },
  { en: 'sary', ar: 'ساري' },
  { en: 'rasan', ar: 'رسن' },
  { en: 'mrsool', ar: 'مرسول' },
  { en: 'NICE ONE', ar: 'نايس ون' },
  { en: 'performancegrowthlab.com', ar: 'لوسد موتورز' },
  { en: 'Petromin Corporation', ar: 'بترومين' },
  { en: 'rotanagroup.net', ar: 'روتانا' },
  { en: 'Camel Step', ar: 'خطوة جمل' },
  { en: 'Abdul Samad Al Qurashi', ar: 'عبد الصمد القرشي' },
  { en: 'Al Hatab Bakery', ar: 'الحطب فودز' },
  { en: 'aawsat', ar: 'صحيفة الشرق الأوسط' },
  { en: 'roshn.sa', ar: 'مجموعة روشن' },
  { en: 'saco.sa', ar: 'ساكو' },
  { en: 'Al Majed Oud', ar: 'الماجد للعود' },
  { en: 'al-dawaa.com.sa', ar: 'صيدليات الدواء' },
  { en: 'Almunajem Foods Company', ar: 'المنجم للأغذية' },
  { en: 'Mouwasat', ar: 'المواساة للخدمات الطبية' },
  { en: 'Dar Al Arkan', ar: 'دار الأركان' },
  { en: 'Halwani Brothers', ar: 'حلواني إخوان' },
  { en: 'First Mills', ar: 'المطاحن الأولى' },
  { en: 'alaseel.com.sa', ar: 'الأصيل' },
  { en: 'muvi Cinemas', ar: 'موڤي سينما' },
  { en: 'Maestro Pizza', ar: 'مايسترو بيتزا' },
  { en: 'Half Million', ar: 'هاف مليون' },
  { en: 'neom.com', ar: 'نيوم' },
  { en: 'alhokair.com', ar: 'مجموعة فواز عبد العزيز الحكير' },
  { en: 'Alsaif Gallery', ar: 'السيف غاليري' },
  { en: 'Tamimi Markets', ar: 'أسواق التميمي' },
  { en: 'Deraah Trading Company', ar: 'شركة درعه التجارية' },
  { en: 'Riyadh Air', ar: 'طيران الرياض' },
  { en: 'floward', ar: 'فلاورد' },
  { en: 'Fitness Time', ar: 'وقت اللياقة' },
  { en: 'eyewa', ar: 'آيوا' },
  { en: 'Herfy Food', ar: 'هرفي' },
  { en: 'burgerizzr', ar: 'برغرايززر' },
  { en: 'Al Safi Danone', ar: 'الصافي دانون' },
  { en: 'Altazaj', ar: 'الطازج' },
  { en: 'saptco', ar: 'سابتكو - الشركة السعودية للنقل الجماعي' },
];

const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/b03431d2e16fe7a9ac99e19096d2a983b1db62385375ffc7f8dc90e4503488fb.sqlite';

async function seedCompanies() {
  console.log('🌱 Seeding companies database...\n');

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  const allCompanies = db.select().from(companiesTable);
  const existing = await allCompanies;

  if (existing.length > 0) {
    console.log(`⚠️  Companies table already has ${existing.length} records`);
    console.log('To reseed, delete the table and run this script again');
    process.exit(0);
  }

  console.log('📦 Inserting general companies...');
  let inserted = 0;
  for (const company of GENERAL_COMPANIES) {
    await db.insert(companiesTable).values({
      nameEn: company.en,
      nameAr: company.ar,
      listId: 'companies',
      isActive: true,
    });
    inserted++;
  }
  console.log(`✅ Inserted ${inserted} general companies\n`);

  console.log('📦 Inserting Saudi companies...');
  inserted = 0;
  for (const company of SAUDI_COMPANIES) {
    await db.insert(companiesTable).values({
      nameEn: company.en,
      nameAr: company.ar,
      listId: 'saudi',
      isActive: true,
    });
    inserted++;
  }
  console.log(`✅ Inserted ${inserted} Saudi companies\n`);

  const total = await db.select().from(companiesTable);
  console.log(`✅ Seeding complete! Total companies: ${total.length}`);
  process.exit(0);
}

seedCompanies().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
