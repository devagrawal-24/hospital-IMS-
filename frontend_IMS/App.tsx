import React, { useState, useEffect } from 'react';
import { User, Role, Patient, AttendanceRecord, InventoryItem, Message, Note } from './types';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_INVENTORY, MOCK_ATTENDANCE } from './constants';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminDashboard from './views/AdminDashboard';
import DoctorDashboard from './views/DoctorDashboard';
import NurseDashboard from './views/NurseDashboard';
import StaffDashboard from './views/StaffDashboard';
import { login, fetchPatients, fetchInventory, fetchAttendance, fetchMessages, fetchNotes, normalizeRole, deleteUser, sendMessageToBackend } from './services/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Application State (Simulating Database)
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notes, setNotes] = useState<Note[]>([]); // New notes state

  // Initial Messages - Cleaned up to remove "popup" effect of old messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Initial View Setup based on Role
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') setCurrentView('overview');
      else if (user.role === 'DOCTOR') setCurrentView('appointments');
      else if (user.role === 'NURSE') setCurrentView('dashboard');
      else if (user.role === 'STAFF') setCurrentView('inventory');

      // Fetch data from API
      fetchAllData();
    }
  }, [user]);

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      // First fetch users, then other data
      const token = localStorage.getItem('token');
      let usersData = MOCK_USERS;
      
      try {
        const usersResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (usersResponse.ok) {
          const usersJson = await usersResponse.json();
          usersData = usersJson.map((u: any) => ({
            id: u._id,
            name: u.fullName,
            username: u.username,
            role: normalizeRole(u.role),
            password: '',
            department: u.department,
            dailyWorkHoursLimit: 8,
          }));
          setUsers(usersData);
        }
      } catch (e) {
        console.log('Users API failed, using mock');
        setUsers(MOCK_USERS);
      }

      const [patientsData, inventoryData, attendanceData, messagesData, notesData] = await Promise.all([
        fetchPatients().catch(() => MOCK_PATIENTS),
        fetchInventory().catch(() => MOCK_INVENTORY),
        fetchAttendance().catch(() => MOCK_ATTENDANCE),
        fetchMessages().catch(() => []),
        fetchNotes().catch(() => []),
      ]);

      setPatients(patientsData);
      setInventory(inventoryData);
      setAttendance(attendanceData);
      setMessages(messagesData);
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async (role: Role, username: string, password?: string) => {
    try {
      if (password) {
        // Real API Login
        const loggedInUser = await login(username, password);

        // Optional: Check if role matches what user selected, or just trust backend
        if (role !== loggedInUser.role) {
          alert(`Warning: You logged in as ${loggedInUser.role}, but selected ${role}. Proceeding as ${loggedInUser.role}.`);
        }

        setUser(loggedInUser);
      } else {
        // Fallback to mock if no password provided (shouldn't happen with updated Login)
        const foundUser = users.find(u => u.username === username && u.role === role);
        if (foundUser) setUser(foundUser);
        else alert('Invalid credentials');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const handlePunchInOut = (userId: string) => {
    // Generate Local Date String YYYY-MM-DD
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const existingRecord = attendance.find(a => a.userId === userId && a.date === today);

    if (existingRecord) {
      // Case 1: Record exists but punchIn is null (placeholder record)
      if (!existingRecord.punchIn) {
        setAttendance(attendance.map(a =>
          a.id === existingRecord.id
            ? { ...a, punchIn: new Date().toISOString() }
            : a
        ));
      }
      // Case 2: Punched In -> Punching Out
      else if (!existingRecord.punchOut) {
        const punchOutTime = new Date();
        const punchInTime = new Date(existingRecord.punchIn);
        const hoursWorked = (punchOutTime.getTime() - punchInTime.getTime()) / (1000 * 60 * 60);

        setAttendance(attendance.map(a =>
          a.id === existingRecord.id
            ? { ...a, punchOut: punchOutTime.toISOString(), totalHours: hoursWorked }
            : a
        ));
      }
      // Case 3: Already Punched Out
      else {
        alert("You have already completed your shift for today.");
      }
    } else {
      // Case 4: No record -> Punching In
      const newRecord: AttendanceRecord = {
        id: `a${Date.now()}`,
        userId,
        date: today,
        punchIn: new Date().toISOString(),
        punchOut: null,
        totalHours: 0
      };
      setAttendance([...attendance, newRecord]);
    }
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([...patients, newPatient]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  // User Management Handlers
  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleResetPassword = (userId: string) => {
    // Mock reset
    const newPass = Math.random().toString(36).slice(-8);
    setUsers(users.map(u => u.id === userId ? { ...u, password: newPass } : u));
    alert(`Password reset for User ID ${userId}. New Password: ${newPass}`);
  };

  const handleDeleteUser = (userId: string) => {
    // Call backend API to delete
    deleteUser(userId).then(() => {
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    }).catch(error => {
      alert(`Failed to delete user: ${error.message}`);
    });
  };

  // Improved Message Handler
  const handleSendMessage = (content: string, toUserId: string = 'ADMIN') => {
    if (!user) return;

    // Resolve 'ADMIN' to actual admin ID if possible
    let targetId = toUserId;
    if (toUserId === 'ADMIN') {
      const adminUser = users.find(u => u.role === 'ADMIN');
      if (adminUser) {
        targetId = adminUser.id;
      }
    }

    const newMessage: Message = {
      id: `m${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      fromUserRole: user.role,
      toUserId: targetId,
      content: content,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Add to local state immediately for UI
    setMessages(prev => [...prev, newMessage]);

    // Also save to backend
    sendMessageToBackend(content, targetId).catch(error => {
      console.error('Failed to send message:', error);
    });
  };

  const handleBroadcastMessage = (content: string) => {
    if (!user || user.role !== 'ADMIN') return;

    const newMessages: Message[] = users
      .filter(u => u.role !== 'ADMIN') // Don't send to self (Admin)
      .map((u, index) => ({
        id: `bm${Date.now()}-${index}`,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserRole: user.role,
        toUserId: u.id,
        content: `📢 ANNOUNCEMENT: ${content}`,
        timestamp: new Date().toISOString(),
        read: false
      }));

    // Add to local state
    setMessages(prev => [...prev, ...newMessages]);

    // Save each announcement to backend
    newMessages.forEach(msg => {
      sendMessageToBackend(msg.content, msg.toUserId).catch(error => {
        console.error('Failed to send announcement:', error);
      });
    });
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map(m => m.id === messageId ? { ...m, read: true } : m));
  };

  // Note Handlers
  const handleAddNote = (newNoteData: Omit<Note, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newNote: Note = {
      id: `n${Date.now()}`,
      userId: user.id,
      ...newNoteData,
      createdAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  // Inventory Management Handlers
  const handleAddInventory = (newItem: InventoryItem) => {
    setInventory([...inventory, newItem]);
  };

  const handleUpdateInventory = (updatedItem: InventoryItem) => {
    setInventory(inventory.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleDeleteInventory = (itemId: string) => {
    setInventory(inventory.filter(i => i.id !== itemId));
  };

  // Calculate unread messages for the logged-in user
  const unreadCount = messages.filter(m =>
    !m.read && (m.toUserId === user?.id || (user?.role === 'ADMIN' && m.toUserId === 'ADMIN'))
  ).length;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      currentView={currentView}
      onChangeView={setCurrentView}
      unreadCount={unreadCount}
    >
      {user.role === 'ADMIN' && (
        <AdminDashboard
          currentView={currentView}
          users={users}
          patients={patients}
          inventory={inventory}
          attendance={attendance}
          messages={messages}
          notes={notes}
          onAddPatient={handleAddPatient}
          onUpdatePatient={handleUpdatePatient}
          onResetPassword={handleResetPassword}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAddInventory={handleAddInventory}
          onUpdateInventory={handleUpdateInventory}
          onDeleteInventory={handleDeleteInventory}
          onSendMessage={handleSendMessage}
          onBroadcastMessage={handleBroadcastMessage}
          onMarkAsRead={handleMarkAsRead}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          user={user}
        />
      )}
      {user.role === 'DOCTOR' && (
        <DoctorDashboard
          currentView={currentView}
          user={user}
          patients={patients}
          attendance={attendance}
          messages={messages}
          notes={notes}
          onPunchInOut={handlePunchInOut}
          onSendMessage={handleSendMessage}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}
      {user.role === 'NURSE' && (
        <NurseDashboard
          currentView={currentView}
          user={user}
          attendance={attendance}
          messages={messages}
          notes={notes}
          onPunchInOut={handlePunchInOut}
          onSendMessage={handleSendMessage}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}
      {user.role === 'STAFF' && (
        <StaffDashboard
          currentView={currentView}
          user={user}
          attendance={attendance}
          inventory={inventory}
          messages={messages}
          notes={notes}
          onPunchInOut={handlePunchInOut}
          onSendMessage={handleSendMessage}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onUpdateInventory={handleUpdateInventory}
        />
      )}
    </Layout>
  );
};

export default App;