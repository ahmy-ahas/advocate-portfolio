import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import PracticeArea from '../models/PracticeArea.js';

// Only information supplied by the advocate is seeded. Everything is editable from /admin.
const profile = {
  name: 'Ghulam Mujtaba',
  title: 'Advocate',
  headline: 'Advocate | Criminal, Civil & Family Law',
  tagline: 'Providing professional legal representation with more than 20 years of experience.',
  biography:
    'Ghulam Mujtaba is an experienced Advocate with 20+ years of professional experience in legal practice.\n\n' +
    'His areas of practice include criminal litigation, criminal trials, bail matters, murder trials, narcotics cases, family matters, and civil cases.\n\n' +
    'He is professionally affiliated with legal and business organizations in Sahiwal and Punjab, including DBA Sahiwal, Lahore High Court, Multan Bar, and the Chamber of Commerce & Industry Sahiwal.',
  yearsExperience: '20+',
  experienceHistory: '',
  stats: [
    { value: '20+', label: 'Years of Experience' },
    { value: 'Criminal', label: 'Litigation' },
    { value: 'Civil', label: 'Cases' },
    { value: 'Family', label: 'Cases' },
  ],
  phone: '03009427810',
  whatsapp: '923009427810',
  email: 'ghulammujtaba1976@gmail.com',
  officeAddress: '458 R Block, Farid Town, Sahiwal, Punjab, Pakistan',
  chamberNumber: '105',
  chamberLocation: 'Sahiwal Courts, Sahiwal, Punjab, Pakistan',
  profilePhoto: { url: '/images/advocate.jpg', name: 'Ghulam Mujtaba', resourceType: 'static' },
  education: [
    { qualification: 'U.B', subtitle: 'Academic Qualification' },
    { qualification: 'MBA', subtitle: 'Master of Business Administration' },
    { qualification: 'P.G.D Business', institution: 'London, United Kingdom' },
  ],
  memberships: [
    { organization: 'DBA Sahiwal', type: 'Lifetime Member' },
    { organization: 'Lahore High Court', type: 'Professional Affiliation / Membership' },
    { organization: 'Multan Bar', type: 'Professional Affiliation / Membership' },
    { organization: 'Chamber of Commerce & Industry Sahiwal', type: 'Professional Membership / Affiliation' },
  ],
  social: [],
  criminalSection: {
    heading: 'Experienced Criminal Litigation Representation',
    text:
      'With more than 20 years of professional experience, Ghulam Mujtaba provides legal representation across a range of criminal matters, including criminal trials, bail matters, murder trials, narcotics cases, and other criminal proceedings.',
    items: ['Criminal Trial', 'Bail Matters', 'Murder Trials', 'Narcotics Cases', 'Other Criminal Cases'],
  },
  ctaHeading: 'Need Legal Assistance?',
  ctaText: 'Contact the office to discuss your legal matter.',
};

const areas = [
  {
    title: 'Criminal Law', icon: 'shield', order: 1,
    description: 'Representation in criminal trials, bail matters, murder trials, narcotics cases, and other criminal cases.',
    items: ['Criminal Trial', 'Bail Matters', 'Murder Trials', 'Narcotics Cases', 'Other Criminal Cases'],
  },
  {
    title: 'Family Law', icon: 'users', order: 2,
    description: 'Representation in family cases, family disputes, and related legal matters.',
    items: ['Family Cases', 'Family Disputes', 'Related Legal Matters'],
  },
  {
    title: 'Civil Law', icon: 'briefcase', order: 3,
    description: 'Representation in civil cases, civil litigation, and related legal matters.',
    items: ['Civil Cases', 'Civil Litigation', 'Related Legal Matters'],
  },
];

export async function run({ disconnectAfter = true } = {}) {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in .env');
  if (password === 'ChangeThisPassword123') throw new Error('Choose your own ADMIN_PASSWORD in .env (do not use the example value)');

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ email, name: process.env.ADMIN_NAME || 'Administrator', passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Created admin account: ${email}`);
  } else if (process.argv.includes('--reset-password')) {
    existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
    console.log(`Reset password for ${email}`);
  } else console.log(`Admin ${email} already exists (use --reset-password to change its password)`);

  if (!(await Profile.countDocuments())) { await Profile.create(profile); console.log('Created profile'); }
  else console.log('Profile already exists, left unchanged');

  if (!(await PracticeArea.countDocuments())) {
    for (const a of areas) await PracticeArea.create(a);
    console.log('Created practice areas');
  } else console.log('Practice areas already exist, left unchanged');

  if (disconnectAfter) await mongoose.disconnect();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => { console.error(e.message); process.exit(1); });
}
