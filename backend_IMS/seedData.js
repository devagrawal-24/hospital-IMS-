const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Attendance = require('./src/models/Attendance');
const Inventory = require('./src/models/Inventory');
const Message = require('./src/models/Message');
const Note = require('./src/models/Note');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Attendance.deleteMany({});
        await Inventory.deleteMany({});
        await Message.deleteMany({});
        await Note.deleteMany({});

        console.log('Cleared existing data...');

        // Create Users
        const admin = await User.create({
            fullName: 'System Admin',
            username: 'admin',
            password: 'password123',
            role: 'Admin',
            department: 'Management',
        });

        const doctor = await User.create({
            fullName: 'Dr. John Doe',
            username: 'doctor',
            password: 'password123',
            role: 'Doctor',
            department: 'Cardiology',
        });

        const nurse = await User.create({
            fullName: 'Jane Smith',
            username: 'nurse',
            password: 'password123',
            role: 'Nurse',
            department: 'ICU',
        });

        const staff = await User.create({
            fullName: 'Bob Johnson',
            username: 'staff',
            password: 'password123',
            role: 'Staff',
            department: 'Reception',
        });

        console.log('✓ Users created');

        // Create Patients
        const patient1 = await Patient.create({
            name: 'Alice Johnson',
            age: 45,
            condition: 'Hypertension, Diabetes',
            appointmentDate: new Date('2026-02-05'),
            appointmentTime: '10:00 AM',
            status: 'Admitted',
            lastCheckup: new Date('2026-01-20'),
            notes: 'Monitor blood pressure regularly',
            assignedDoctorId: doctor._id,
        });

        const patient2 = await Patient.create({
            name: 'Robert Smith',
            age: 62,
            condition: 'Heart Disease',
            appointmentDate: new Date('2026-02-10'),
            appointmentTime: '02:00 PM',
            status: 'Admitted',
            lastCheckup: new Date('2026-01-18'),
            notes: 'Post-operative care, cardiac monitoring',
            assignedDoctorId: doctor._id,
        });

        const patient3 = await Patient.create({
            name: 'Maria Garcia',
            age: 35,
            condition: 'Asthma',
            appointmentDate: new Date('2026-02-08'),
            appointmentTime: '03:30 PM',
            status: 'Admitted',
            lastCheckup: new Date('2026-01-15'),
            notes: 'Regular inhaler usage monitoring',
            assignedDoctorId: doctor._id,
        });

        console.log('✓ Patients created');

        // Create Attendance Records
        const today = new Date();
        await Attendance.create({
            userId: doctor._id,
            punchInTime: new Date(today.getTime() - 4 * 60 * 60000),
            punchOutTime: new Date(today.getTime() + 4 * 60 * 60000),
            totalHours: 8,
            overtime: 0,
        });

        await Attendance.create({
            userId: nurse._id,
            punchInTime: new Date(today.getTime() - 8 * 60 * 60000),
            punchOutTime: new Date(today.getTime()),
            totalHours: 8,
            overtime: 0,
        });

        await Attendance.create({
            userId: staff._id,
            punchInTime: new Date(today.getTime() - 6 * 60 * 60000),
            totalHours: 6,
            overtime: 0,
        });

        console.log('✓ Attendance records created');

        // Create Inventory Items
        await Inventory.create({
            itemName: 'Paracetamol 500mg',
            category: 'Medicine',
            quantity: 500,
            status: 'Available',
            addedBy: admin._id,
        });

        await Inventory.create({
            itemName: 'Surgical Masks',
            category: 'PPE',
            quantity: 2000,
            status: 'Available',
            addedBy: admin._id,
        });

        await Inventory.create({
            itemName: 'Oxygen Cylinders',
            category: 'Equipment',
            quantity: 45,
            status: 'Available',
            addedBy: admin._id,
        });

        await Inventory.create({
            itemName: 'IV Bags (500ml)',
            category: 'Medical Supplies',
            quantity: 300,
            status: 'Available',
            addedBy: admin._id,
        });

        console.log('✓ Inventory items created');

        // Create Messages
        await Message.create({
            senderId: doctor._id,
            receiverId: nurse._id,
            content: 'Please check on patient Alice Johnson in room 302 and update vitals.',
            timestamp: new Date(),
        });

        await Message.create({
            senderId: nurse._id,
            receiverId: doctor._id,
            content: 'Patient Alice Johnson BP: 130/85, HR: 72. All normal.',
            timestamp: new Date(),
        });

        await Message.create({
            senderId: admin._id,
            receiverId: staff._id,
            content: 'Please update the staff schedule for next week.',
            timestamp: new Date(today.getTime() - 2 * 60 * 60000),
        });

        console.log('✓ Messages created');

        // Create Notes
        await Note.create({
            userId: doctor._id,
            title: 'Patient Care Plan - Alice Johnson',
            content: 'Review blood pressure management. Increase monitoring frequency to every 2 hours.',
            timestamp: new Date(),
        });

        await Note.create({
            userId: nurse._id,
            title: 'Lab Results Pending',
            content: 'Waiting for blood test results. Expected by end of day.',
            timestamp: new Date(),
        });

        await Note.create({
            userId: doctor._id,
            title: 'Medication Schedule',
            content: 'Robert Smith: Continue Aspirin 100mg daily, Lisinopril 10mg daily.',
            timestamp: new Date(today.getTime() - 24 * 60 * 60000),
        });

        console.log('✓ Notes created');

        console.log('\n✅ All seed data created successfully!');
        console.log('\nTest Credentials:');
        console.log('Admin: admin / password123');
        console.log('Doctor: doctor / password123');
        console.log('Nurse: nurse / password123');
        console.log('Staff: staff / password123');

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedData();
