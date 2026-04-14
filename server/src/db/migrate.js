import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('\n🔧 Running SUVIDHA Connect database migration...\n');

  const client = await pool.connect();
  try {
    // ── Create tables ──────────────────────────────────────────────────────────
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Tables created');

    // ── Seed citizens ──────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO citizens (id, name, mobile, aadhaar, address, consumer_id, pin, email, points)
      VALUES
        ('CIT001','Rajesh Kumar','9876543210','XXXX-XXXX-1234','123 MG Road, Sector 5, Guwahati','ELEC2024001','1234','rajesh@example.com',150),
        ('CIT002','Priya Sharma','9876543211','XXXX-XXXX-5678','456 Nehru Place, Block B, Guwahati','ELEC2024002','5678','priya@example.com',50),
        ('CIT003','Amit Das','9876543212','XXXX-XXXX-9012','789 Dispur Lane, Sector 3, Guwahati','GAS2024001','2345','amit@example.com',80)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Citizens seeded');

    // ── Seed bills ─────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO bills (id, consumer_id, type, amount, due_date, status, units, bill_date)
      VALUES
        ('BILL001','ELEC2024001','electricity',2450.00,'2026-04-15','pending',245,'2026-03-15'),
        ('BILL002','ELEC2024001','gas',850.00,'2026-04-20','pending',12,'2026-03-20'),
        ('BILL003','ELEC2024001','water',320.00,'2026-03-25','overdue',5000,'2026-03-01'),
        ('BILL004','GAS2024001','gas',1100.00,'2026-04-18','pending',18,'2026-03-18')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Bills seeded');

    // ── Seed civic alerts ──────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO civic_alerts (id, type, title, title_hindi, title_assamese, message, message_hindi, severity, zones, expires_at)
      VALUES
        ('ALERT001','maintenance','Scheduled Power Maintenance','निर्धारित बिजली रखरखाव','নিৰ্ধাৰিত বিদ্যুৎ ৰক্ষণাবেক্ষণ',
         'Power supply will be interrupted in Sectors 4-8 on Apr 5 from 10 AM to 2 PM.',
         'सेक्टर 4-8 में 5 अप्रैल को सुबह 10 बजे से दोपहर 2 बजे तक बिजली बाधित रहेगी।',
         'warning', ARRAY['Sector 4','Sector 5','Sector 6'], '2030-04-05 14:00:00+00'),
        ('ALERT002','emergency','Gas Leak Reported – Sector 9','सेक्टर 9 में गैस रिसाव','ছেক্টৰ 9ত গেছ লিক',
         'CRITICAL: Gas leak reported near Sector 9 market. Avoid open flames. Helpline: 1906.',
         'गंभीर: सेक्टर 9 बाजार के पास गैस रिसाव। खुली आग से बचें।',
         'critical', ARRAY['Sector 9'], '2030-03-25 06:00:00+00')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Civic alerts seeded');

    // ── Seed integrity ledger genesis block ────────────────────────────────────
    await client.query(`
      INSERT INTO integrity_ledger (id, record_type, record_id, hash, previous_hash, verified)
      VALUES ('IR000','payment','GENESIS','0000000000000000','0000000000000000',true)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Integrity ledger genesis block created');

    console.log('\n🎉 Migration complete! Database is ready.\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
