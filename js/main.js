// Global state management
const appState = {
    isAuthenticated: false,
    currentUser: null,
    notifications: [],
    systemSettings: {
        schoolName: 'SDCKL International School',
        schoolHours: {
            start: '08:00',
            end: '15:00'
        },
        lateThreshold: 15,
        notifyAbsent: true
    }
};

// Authentication functions
const auth = {
    login: async (username, password) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin123') {
                    appState.isAuthenticated = true;
                    appState.currentUser = {
                        id: 1,
                        username: username,
                        role: 'admin',
                        name: 'Administrator'
                    };
                    localStorage.setItem('user', JSON.stringify(appState.currentUser));
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Invalid credentials' });
                }
            }, 1000);
        });
    },

    logout: () => {
        appState.isAuthenticated = false;
        appState.currentUser = null;
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    checkAuth: () => {
        const user = localStorage.getItem('user');
        if (user) {
            appState.currentUser = JSON.parse(user);
            appState.isAuthenticated = true;
            return true;
        }
        return false;
    }
};

// Biometric simulation
const biometric = {
    startScan: () => {
        return new Promise((resolve) => {
            // Simulate scanning process
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% success rate
                if (success) {
                    // Generate a random student ID and name for demo purposes
                    const studentId = 'STU' + Math.floor(Math.random() * 10000);
                    const studentName = 'Student ' + studentId.slice(3);

                    // Get current timestamp
                    const timestamp = new Date();

                    // Determine attendance status based on school hours and late threshold
                    const timeString = timestamp.toTimeString().slice(0, 5);
                    const isLate = dateUtils.isLate(timeString);
                    const status = isLate ? 'Late' : 'Present';

                    // Create attendance record
                    const attendanceRecord = {
                        studentId,
                        studentName,
                        timestamp: timestamp.toISOString(),
                        status
                    };

                    // Save attendance record to localStorage
                    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
                    attendanceRecords.push(attendanceRecord);
                    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

                    resolve({
                        success: true,
                        studentId,
                        studentName,
                        timestamp,
                        status
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Scan failed. Please try again.'
                    });
                }
            }, 2000);
        });
    }
};

// Notification system
const notifications = {
    add: (message, type = 'info') => {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        appState.notifications.push(notification);
        showNotification(notification);
    },

    remove: (id) => {
        appState.notifications = appState.notifications.filter(n => n.id !== id);
    }
};

// Function to get attendance records from localStorage
const getAttendanceRecords = () => {
    return JSON.parse(localStorage.getItem('attendanceRecords')) || [];
};

// Function to clear attendance records (for testing or reset)
const clearAttendanceRecords = () => {
    localStorage.removeItem('attendanceRecords');
};

// Export new functions
window.getAttendanceRecords = getAttendanceRecords;
window.clearAttendanceRecords = clearAttendanceRecords;

// UI Utilities
const ui = {
    showLoading: (element) => {
        element.innerHTML = `
            <div class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Loading...
            </div>
        `;
    },

    showError: (element, message) => {
        element.innerHTML = `
            <div class="text-red-500">
                <i class="fas fa-exclamation-circle mr-2"></i>
                ${message}
            </div>
        `;
    },

    showSuccess: (element, message) => {
        element.innerHTML = `
            <div class="text-green-500">
                <i class="fas fa-check-circle mr-2"></i>
                ${message}
            </div>
        `;
    }
};

// Show notification toast
function showNotification(notification) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        notification.type === 'error' ? 'bg-red-500' :
        notification.type === 'success' ? 'bg-green-500' :
        'bg-blue-500'
    } text-white`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                notification.type === 'error' ? 'fa-times-circle' :
                notification.type === 'success' ? 'fa-check-circle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${notification.message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
        notifications.remove(notification.id);
    }, 3000);
}

// Date and Time Utilities
const dateUtils = {
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    isLate: (time) => {
        const [hours, minutes] = time.split(':');
        const arrivalTime = new Date();
        arrivalTime.setHours(parseInt(hours), parseInt(minutes), 0);

        const [startHours, startMinutes] = appState.systemSettings.schoolHours.start.split(':');
        const startTime = new Date();
        startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

        const diffMinutes = (arrivalTime - startTime) / (1000 * 60);
        return diffMinutes > appState.systemSettings.lateThreshold;
    }
};

// Export functions and objects
window.appState = appState;
window.auth = auth;
window.biometric = biometric;
window.notifications = notifications;
window.ui = ui;
window.dateUtils = dateUtils;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    if (!auth.checkAuth() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Setup logout buttons
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });
});
