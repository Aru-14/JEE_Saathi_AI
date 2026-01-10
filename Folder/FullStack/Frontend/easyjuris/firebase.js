
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDlttju52QpsjXdm1uCp-bjsB2k8UwD2jA",
  authDomain: "easyjuris-88e85.firebaseapp.com",
  projectId: "easyjuris-88e85",
  storageBucket: "easyjuris-88e85.firebasestorage.app",
  messagingSenderId: "638097681335",
  appId: "1:638097681335:web:1341fc4440cb9fac7b9632",
  measurementId: "G-HZCDVPB3GG"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


export default app;