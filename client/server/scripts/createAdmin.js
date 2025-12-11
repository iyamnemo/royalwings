const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

//To run the script:
//node createAdmin.js admin@royalwings.com password12345
// Initialize Firebase Admin with service account
const serviceAccount = require('../config/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function createAdminUser(email, password) {
  try {
    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true
    });

    // Set custom claims to mark user as admin
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Successfully created admin user:');
    console.log('Email:', email);
    console.log('User UID:', userRecord.uid);
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Exit the process
    process.exit();
  }
}

// Get email and password from command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node createAdmin.js <email> <password>');
  process.exit(1);
}

const [email, password] = args;
createAdminUser(email, password);