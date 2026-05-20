import { Client, Account, Databases, ID, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint('http://localhost:9000/v1') // Forcing our custom 9000 local port
    .setProject('6a08102c0021f3f5c49d'); 

export const account = new Account(client);
export const databases = new Databases(client);
export { client };

export const DATABASE_ID = '6a0bde410017c4b46ef5'; 
export const COLLECTION_ID = 'chatlogs'; 

export { ID, Query };