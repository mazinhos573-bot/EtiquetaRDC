// bd.js (mantido igual, mas incluído para completude)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getDatabase, ref, push, update, onValue, remove, set, get } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAT2Nh8vvqWb9M4NSK843hxfTI5690WXH8",
  authDomain: "etiqueta-f2215.firebaseapp.com",
  projectId: "etiqueta-f2215",
  storageBucket: "etiqueta-f2215.firebasestorage.app",
  messagingSenderId: "71489574894",
  appId: "1:71489574894:web:3e6f300e71cb475584e0ff",
  measurementId: "G-5CRMKNVHNQ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exportar
export { database, ref, push, update, onValue, remove, set, get };
