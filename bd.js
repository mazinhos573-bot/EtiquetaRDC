// bd.js (mantido igual, mas incluído para completude)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getDatabase, ref, push, update, onValue, remove, set, get } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuKRaFDaViCQj72lQgLH7HDFUxOk43fss",
  authDomain: "insumo-16085.firebaseapp.com",
  databaseURL: "https://insumo-16085-default-rtdb.firebaseio.com",
  projectId: "insumo-16085",
  storageBucket: "insumo-16085.firebasestorage.app",
  messagingSenderId: "706106422021",
  appId: "1:706106422021:web:4e6b4fafda82104df93d6c",
  measurementId: "G-1Y7ZRBX658"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exportar
export { database, ref, push, update, onValue, remove, set, get };
