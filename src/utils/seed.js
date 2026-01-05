// src/utils/seed.js - Database Seeding Script
// =============================================
// This script populates the database with sample data
// Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database.js');
const User = require('../models/User.model.js');
const Consultation = require('../models/Consultation.model.js');

const seedDatabase = async () => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 ADDISCO DATABASE SEEDING');
    console.log('='.repeat(60) + '\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Consultation.deleteMany({});
    console.log('✓ Database cleared\n');

    // =====================================================
    // CREATE USERS
    // =====================================================

    console.log('👤 Creating users...');

    // Admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@addisco.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('✓ Admin created: admin@addisco.com');

    // Partner 1 - Managing Partner
    const partner1 = await User.create({
      name: 'Aro O. Shuaib, Jr',
      email: 'aro@addisco.com',
      password: 'partner123',
      role: 'partner',
      organization: 'Addisco & Company',
      phone: '+234 803 456 7890',
      isActive: true
    });
    console.log('✓ Partner created: aro@addisco.com');

    // Partner 2 - Education Lead
    const partner2 = await User.create({
      name: 'Abiodun Babatunde',
      email: 'abiodun@addisco.com',
      password: 'partner123',
      role: 'partner',
      organization: 'Addisco & Company',
      phone: '+234 804 567 8901',
      isActive: true
    });
    console.log('✓ Partner created: abiodun@addisco.com');

    // Partner 3 - Fintech Lead
    const partner3 = await User.create({
      name: 'Comfort Adeoye',
      email: 'comfort@addisco.com',
      password: 'partner123',
      role: 'partner',
      organization: 'Addisco & Company',
      phone: '+234 805 678 9012',
      isActive: true
    });
    console.log('✓ Partner created: comfort@addisco.com');

    // Client users
    const client1 = await User.create({
      name: 'John Okafor',
      email: 'john@techcorp.com',
      password: 'client123',
      role: 'client',
      organization: 'TechCorp Nigeria',
      phone: '+234 801 234 5678'
    });

    const client2 = await User.create({
      name: 'Sarah Adeleke',
      email: 'sarah@innovate.ng',
      password: 'client123',
      role: 'client',
      organization: 'Innovate Nigeria',
      phone: '+234 802 345 6789'
    });

    console.log('✓ Client users created\n');

    // =====================================================
    // CREATE CONSULTATIONS
    // =====================================================

    console.log('📋 Creating sample consultations...');

    const consultations = [
      {
        name: 'John Okafor',
        email: 'john@techcorp.com',
        phone: '+234 801 234 5678',
        organization: 'TechCorp Nigeria',
        service: 'strategic',
        message: 'We need help developing a comprehensive 5-year strategic plan for expansion across West Africa. Our current operations are in Nigeria and Ghana, and we want to expand to Senegal, Ivory Coast, and Kenya. We need market analysis, competitive positioning, and implementation roadmap.',
        status: 'in-progress',
        priority: 'high',
        assignedTo: partner1._id,
        notes: [
          {
            text: 'Initial discovery call completed. Client is well-prepared with detailed financial projections and market research. Setting up strategic workshop for next week.',
            addedBy: partner1._id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            text: 'Received preliminary market data for target countries. Competitive landscape looks favorable in Senegal and Kenya.',
            addedBy: partner1._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        name: 'Sarah Adeleke',
        email: 'sarah@innovate.ng',
        phone: '+234 802 345 6789',
        organization: 'Innovate Nigeria',
        service: 'digital',
        message: 'Looking to digitally transform our supply chain operations. Currently using manual processes for inventory management, vendor management, and order tracking. Need help selecting and implementing ERP system.',
        status: 'contacted',
        priority: 'medium',
        assignedTo: partner2._id,
        notes: [
          {
            text: 'Contacted client via email. Scheduled assessment call for Thursday 2pm.',
            addedBy: partner2._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        name: 'Michael Adebayo',
        email: 'michael@agriventures.ng',
        phone: '+234 803 456 7890',
        organization: 'AgriVentures Limited',
        service: 'market',
        message: 'We want to enter the agricultural export market in Europe. Currently producing cassava, yam, and plantain for local market. Need market research, regulatory compliance guidance, and entry strategy for UK and Netherlands.',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        name: 'Chioma Nwosu',
        email: 'chioma@edutech.com.ng',
        phone: '+234 804 567 8901',
        organization: 'EduTech Solutions',
        service: 'organizational',
        message: 'Our EdTech startup has grown from 5 to 50 people in 18 months. Current flat structure is no longer working. Need help designing organizational structure, defining roles, and implementing performance management systems.',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        name: 'David Okonkwo',
        email: 'david@financeplus.ng',
        phone: '+234 805 678 9012',
        organization: 'FinancePlus Nigeria',
        service: 'digital',
        message: 'We need to develop a mobile banking app that integrates with our core banking system. Looking for technology architecture recommendations, vendor selection support, and program management.',
        status: 'completed',
        priority: 'high',
        assignedTo: partner3._id,
        notes: [
          {
            text: 'Project successfully completed. Client selected Temenos as core banking provider and Backbase for digital banking frontend. Implementation roadmap delivered.',
            addedBy: partner3._id,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      },
      {
        name: 'Amina Ibrahim',
        email: 'amina@retailhub.ng',
        phone: '+234 806 789 0123',
        organization: 'RetailHub Nigeria',
        service: 'strategic',
        message: 'Planning to pivot from pure retail to omnichannel (online + offline). Need strategic guidance on technology investments, supply chain optimization, and customer experience design.',
        status: 'in-progress',
        priority: 'high',
        assignedTo: partner1._id,
        notes: [
          {
            text: 'Conducted stakeholder interviews and current state assessment. Major gaps identified in logistics and last-mile delivery.',
            addedBy: partner1._id,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        name: 'Oluwaseun Bello',
        email: 'seun@healthconnect.ng',
        phone: '+234 807 890 1234',
        organization: 'HealthConnect',
        service: 'other',
        message: 'Telemedicine platform seeking guidance on scaling operations across Nigeria. Need help with regulatory compliance, partnership strategy with hospitals, and fundraising strategy.',
        status: 'contacted',
        priority: 'urgent',
        assignedTo: partner2._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        name: 'Blessing Okoro',
        email: 'blessing@fashionista.ng',
        phone: '+234 808 901 2345',
        organization: 'Fashionista Lagos',
        service: 'market',
        message: 'Fashion retail business looking to expand to 5 new states. Need market entry strategy, site selection criteria, and franchise model development.',
        status: 'cancelled',
        priority: 'low',
        notes: [
          {
            text: 'Client decided to postpone expansion plans due to funding constraints.',
            addedBy: admin._id,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      }
    ];

    await Consultation.insertMany(consultations);
    console.log(`✓ ${consultations.length} sample consultations created\n`);

    // =====================================================
    // SUMMARY
    // =====================================================

    console.log('='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

    console.log('📊 Summary:');
    console.log(`   Users created: ${await User.countDocuments()}`);
    console.log(`   Consultations created: ${await Consultation.countDocuments()}`);
    console.log('');

    console.log('👤 Login Credentials:');
    console.log('━'.repeat(60));
    console.log('Admin:');
    console.log('  Email: admin@addisco.com');
    console.log('  Password: admin123');
    console.log('━'.repeat(60));
    console.log('Partners:');
    console.log('  Email: aro@addisco.com | abiodun@addisco.com | comfort@addisco.com');
    console.log('  Password: partner123');
    console.log('━'.repeat(60));
    console.log('Clients:');
    console.log('  Email: john@techcorp.com | sarah@innovate.ng');
    console.log('  Password: client123');
    console.log('━'.repeat(60) + '\n');

    console.log('🚀 You can now start the server with: npm run dev\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ SEEDING FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
