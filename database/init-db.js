import 'dotenv/config';
import { openDatabase } from '../api/database.js';

const { db, databasePath } = openDatabase();
console.log(`Database initialized successfully at: ${databasePath}`);
db.close();