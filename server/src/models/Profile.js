import mongoose from 'mongoose';
import { fileSchema, str } from './shared.js';

const schema = new mongoose.Schema(
  {
    name: str(120, { required: true }),
    title: str(120),
    headline: str(200),
    tagline: str(500),
    biography: str(8000),
    yearsExperience: str(40),
    experienceHistory: str(5000),
    stats: [new mongoose.Schema({ value: str(40), label: str(80) }, { _id: false })],
    phone: str(40),
    whatsapp: str(40),
    email: str(200),
    officeAddress: str(400),
    chamberNumber: str(60),
    chamberLocation: str(300),
    mapEmbedUrl: str(1000),
    profilePhoto: fileSchema,
    education: [
      new mongoose.Schema(
        { qualification: str(200), subtitle: str(200), institution: str(200), year: str(40), description: str(1000) },
        { _id: false }
      ),
    ],
    memberships: [
      new mongoose.Schema({ organization: str(200), type: str(200), description: str(1000) }, { _id: false }),
    ],
    social: [new mongoose.Schema({ platform: str(60), url: str(500) }, { _id: false })],
    criminalSection: {
      heading: str(200),
      text: str(1500),
      items: [str(120)],
    },
    ctaHeading: str(200),
    ctaText: str(400),
  },
  { timestamps: true, collection: 'advocateProfile' }
);
export default mongoose.model('Profile', schema);
