// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyCIh-pRvUQGxbvyUzdxSihaej7fgeh5944',
	authDomain: 'spotify-spotlight-6f431.firebaseapp.com',
	projectId: 'spotify-spotlight-6f431',
	storageBucket: 'spotify-spotlight-6f431.firebasestorage.app',
	messagingSenderId: '88017092515',
	appId: '1:88017092515:web:10d856a4f3ca5298df6416',
	measurementId: 'G-9Y93Y4Q3W2'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
