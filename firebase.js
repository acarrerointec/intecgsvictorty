// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importar el módulo de autenticación

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBlgbvKKWZl8iFESPYVBi9N8nyuNcwZHWM",
  authDomain: "victoryintecgs.firebaseapp.com",
  projectId: "victoryintecgs",
  storageBucket: "victoryintecgs.appspot.com",
  messagingSenderId: "930179407738",
  appId: "1:930179407738:web:a190a97b375c707e1f00c3",
  measurementId: "G-MBP3DQHKXG"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializar el servicio de autenticación


export { auth }; // Exportar el servicio de autenticación