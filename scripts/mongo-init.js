// MongoDB initialization script for HealthTech Platform
// This script sets up replica set and creates databases

print('Starting MongoDB initialization for HealthTech Platform...');

// Initialize replica set for transactions support
try {
    rs.initiate({
        _id: "rs0",
        members: [
            { _id: 0, host: "localhost:27017" }
        ]
    });
    print('Replica set initialized successfully');
} catch (e) {
    print('Replica set already initialized or error:', e);
}

// Wait for replica set to be ready
sleep(2000);

// Database names
const databases = [
    'reminderdb_analysis',
    'reminderdb_auth', 
    'reminderdb_chatbot',
    'reminderdb_data',
    'reminderdb_event',
    'reminderdb_feedback',
    'reminderdb_forecast',
    'reminderdb_notification',
    'reminderdb_optimization',
    'reminderdb_reminder',
    'reminderdb_translation'
];

// Create databases and collections
databases.forEach(dbName => {
    print(`Creating database: ${dbName}`);
    
    const db = db.getSiblingDB(dbName);
    
    // Create a dummy collection to ensure database is created
    db.createCollection('_init');
    
    // Create common indexes
    try {
        // Most collections will have these fields
        db._init.createIndex({ "created_at": 1 });
        db._init.createIndex({ "updated_at": 1 });
        print(`Indexes created for ${dbName}`);
    } catch (e) {
        print(`Error creating indexes for ${dbName}:`, e);
    }
});

// Special setup for auth database
print('Setting up auth database...');
const authDb = db.getSiblingDB('reminderdb_auth');

// Create auth collections
const authCollections = [
    'users',
    'audit_logs', 
    'security_events',
    'login_attempts'
];

authCollections.forEach(collectionName => {
    authDb.createCollection(collectionName);
    print(`Created auth collection: ${collectionName}`);
});

// Create auth-specific indexes
authDb.users.createIndex({ "email": 1 }, { unique: true });
authDb.users.createIndex({ "employee_id": 1 });
authDb.users.createIndex({ "role": 1 });
authDb.users.createIndex({ "department": 1 });
authDb.users.createIndex({ "is_active": 1 });
authDb.users.createIndex({ "approval_status": 1 });

authDb.audit_logs.createIndex({ "timestamp": 1 });
authDb.audit_logs.createIndex({ "user_id": 1 });
authDb.audit_logs.createIndex({ "action": 1 });
authDb.audit_logs.createIndex({ "severity": 1 });

authDb.login_attempts.createIndex({ "email": 1 });
authDb.login_attempts.createIndex({ "timestamp": 1 });
authDb.login_attempts.createIndex({ "success": 1 });

print('Auth database setup completed');

// Create default admin user
print('Creating default admin user...');
try {
    const adminUser = {
        email: "admin@hospital.com",
        hashed_password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.", // admin123
        full_name: "System Administrator",
        role: "admin",
        employee_id: "ADM001",
        department: "it",
        is_active: true,
        created_at: new Date(),
        permissions: [
            "manage_users",
            "manage_department", 
            "view_reports",
            "system_admin",
            "view_audit_logs",
            "read_patient_data",
            "write_patient_data",
            "delete_patient_data"
        ],
        failed_login_attempts: 0,
        locked_until: null,
        last_login: null,
        mfa_enabled: false,
        approval_status: "approved"
    };
    
    // Check if admin already exists
    const existingAdmin = authDb.users.findOne({ email: "admin@hospital.com" });
    if (!existingAdmin) {
        authDb.users.insertOne(adminUser);
        print('Default admin user created successfully');
        print('Email: admin@hospital.com');
        print('Password: admin123');
        print('IMPORTANT: Change this password immediately!');
    } else {
        print('Default admin user already exists');
    }
} catch (e) {
    print('Error creating admin user:', e);
}

print('MongoDB initialization completed successfully!');
print('Databases created:', databases.length);
print('Ready for HealthTech Platform services');
