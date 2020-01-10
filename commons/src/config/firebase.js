import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId
};

!firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
export const AUTH = firebase.auth();
export const DB = firebase.firestore();
// DB.settings({
//     timestampsInSnapshots: true
// });
export const STORAGE = firebase.storage();
export const FB = firebase;
export default firebase;
