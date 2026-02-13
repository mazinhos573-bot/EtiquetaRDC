// bd.js (mantido igual, mas incluído para completude)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getDatabase, ref, push, update, onValue, remove, set, get } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCiuEMTRejxFfV76S_xMv9Eskt-G9cuqUU",
  authDomain: "sistema-de-etiqueta.firebaseapp.com",
  databaseURL: "https://sistema-de-etiqueta-default-rtdb.firebaseio.com",
  projectId: "sistema-de-etiqueta",
  storageBucket: "sistema-de-etiqueta.firebasestorage.app",
  messagingSenderId: "338003364834",
  appId: "1:338003364834:web:10b8c7f72f942e018307bb",
  measurementId: "G-WLJ9WCPTSD"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exportar
export { database, ref, push, update, onValue, remove, set, get };
