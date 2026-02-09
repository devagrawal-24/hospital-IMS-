import { API_URL } from '../config';
import { User, Role, Patient, InventoryItem, AttendanceRecord, Message, Note } from '../types';

export const normalizeRole = (role: string): Role => {
    const roleMap: { [key: string]: Role } = {
        'admin': 'ADMIN',
        'doctor': 'DOCTOR',
        'nurse': 'NURSE',
        'staff': 'STAFF',
        'ADMIN': 'ADMIN',
        'DOCTOR': 'DOCTOR',
        'NURSE': 'NURSE',
        'STAFF': 'STAFF',
    };
    return roleMap[role.toLowerCase()] || ('ADMIN' as Role);
};

export const login = async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    // Store token in localStorage
    localStorage.setItem('token', data.token);

    // Map backend response to frontend User type
    return {
        id: data._id,
        name: data.fullName,
        username: data.username,
        role: normalizeRole(data.role),
        password: '', // Don't keep password in state
        department: data.department,
        dailyWorkHoursLimit: 8, // Default or mock
    };
};

// Fetch patients
export const fetchPatients = async (): Promise<Patient[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/patients`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch patients');
    }

    const data = await response.json();
    return data.map((p: any) => ({
        id: p._id,
        name: p.name,
        age: p.age,
        condition: p.condition,
        appointmentDate: p.appointmentDate,
        appointmentTime: p.appointmentTime,
        status: p.status,
        lastCheckup: p.lastCheckup,
        assignedDoctorId: p.assignedDoctorId?._id || p.assignedDoctorId,
        notes: p.notes,
        disease: p.condition, // Map condition to disease for compatibility
    }));
};

// Fetch inventory
export const fetchInventory = async (): Promise<InventoryItem[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/inventory`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch inventory');
    }

    const data = await response.json();
    return data.map((item: any) => ({
        id: item._id,
        name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        minThreshold: 50, // Default
        unit: item.unit || 'units',
        status: item.status,
    }));
};

// Fetch attendance
export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/attendance`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch attendance');
    }

    const data = await response.json();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return data.map((record: any) => ({
        id: record._id,
        userId: record.userId,
        date: todayStr,
        punchIn: record.punchInTime ? new Date(record.punchInTime).toISOString() : null,
        punchOut: record.punchOutTime ? new Date(record.punchOutTime).toISOString() : null,
        totalHours: record.totalHours || 0,
    }));
};

// Fetch messages
export const fetchMessages = async (): Promise<Message[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/messages`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.map((msg: any) => ({
        id: msg._id,
        fromUserId: msg.senderId?._id || msg.senderId || 'system',
        fromUserName: msg.senderId?.fullName || 'System',
        fromUserRole: normalizeRole(msg.senderId?.role || 'ADMIN'),
        toUserId: msg.receiverId?._id || msg.receiverId || 'ADMIN',
        content: msg.content,
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        read: msg.read || false,
    }));
};

// Register new user (Admin only)
export const registerUser = async (fullName: string, username: string, password: string, role: string, department: string = ''): Promise<User> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, username, password, role, department }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'User registration failed');
    }

    const data = await response.json();
    return {
        id: data._id,
        name: data.fullName,
        username: data.username,
        role: normalizeRole(data.role),
        password: '',
        department: data.department,
        dailyWorkHoursLimit: 8,
    };
};

// Delete user (Admin only)
export const deleteUser = async (userId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'User deletion failed');
    }
};

// Send message to backend
export const sendMessageToBackend = async (content: string, receiverId: string): Promise<Message> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, receiverId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
    }

    const data = await response.json();
    return {
        id: data._id,
        fromUserId: data.senderId?._id || data.senderId,
        fromUserName: data.senderId?.fullName || 'Unknown',
        fromUserRole: normalizeRole(data.senderId?.role || 'ADMIN'),
        toUserId: data.receiverId,
        content: data.content,
        timestamp: data.createdAt || data.timestamp,
        read: data.read || false,
    };
};

// Fetch notes
export const fetchNotes = async (): Promise<Note[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/notes`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }

    const data = await response.json();
    return data.map((note: any) => ({
        id: note._id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        timestamp: note.timestamp,
        createdAt: note.createdAt,
    }));
};
