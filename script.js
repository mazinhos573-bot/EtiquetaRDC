// Conexão com Firebase (bd.js)
import { database, ref, push, onValue, update, remove } from "./bd.js";

// Referência no banco
const solicitacoesRef = ref(database, "solicitacoes");

let dbSolicitacoes = [];
let isAdminLoggedIn = false;


// ----------------------------
// INICIALIZAÇÃO
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
    carregarSolicitacoes();

    document.getElementById("loginPass").addEventListener("keypress", function (event) {
        if (event.key === "Enter") performLogin();
    });
});


// ----------------------------
// FIREBASE: CARREGAR DADOS
// ----------------------------
function carregarSolicitacoes() {
    onValue(solicitacoesRef, (snapshot) => {
        const data = snapshot.val();

        dbSolicitacoes = data
            ? Object.entries(data).map(([key, value]) => ({
                  firebaseId: key,
                  ...value,
              }))
            : [];

        atualizarTelas();
    });
}


// ----------------------------
// LOGIN ADMIN
// ----------------------------
window.checkAdminAccess = function () {
    if (isAdminLoggedIn) {
        switchRole("adm");
    } else {
        document.getElementById("loginModal").classList.add("active");
        document.getElementById("loginUser").focus();
    }
};

window.closeLoginModal = function () {
    document.getElementById("loginModal").classList.remove("active");
    document.getElementById("loginError").style.display = "none";
};

window.performLogin = function () {
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;
    const errorMsg = document.getElementById("loginError");

    if (user === "Ericlm" && pass === "Evo@0101") {
        isAdminLoggedIn = true;
        closeLoginModal();
        switchRole("adm");
        showToast("Bem-vindo, Administrador!", "success");
    } else {
        errorMsg.style.display = "block";
    }
};

window.logoutAdmin = function () {
    isAdminLoggedIn = false;
    switchRole("colaborador");
    showToast("Logout realizado.");
};


// ----------------------------
// TROCA DE TELAS
// ----------------------------
window.switchRole = function (role) {
    const btnColab = document.getElementById("btnColab");
    const btnAdm = document.getElementById("btnAdm");
    const viewColab = document.getElementById("view-colaborador");
    const viewAdm = document.getElementById("view-adm");

    if (role === "colaborador") {
        btnColab.classList.add("active");
        btnAdm.classList.remove("active");
        viewColab.classList.remove("hidden");
        viewAdm.classList.add("hidden");
    } else {
        btnColab.classList.remove("active");
        btnAdm.classList.add("active");
        viewColab.classList.add("hidden");
        viewAdm.classList.remove("hidden");
        renderTabelaAdm();
    }
};


// ----------------------------
// ENVIAR SOLICITAÇÃO
// ----------------------------
window.enviarSolicitacao = function () {
    const nome = document.getElementById("colabNome").value.trim();
    const etiqueta = document.getElementById("etiquetaNome").value.trim();
    const qtd = document.getElementById("etiquetaQtd").value;

    if (!nome || !etiqueta || !qtd) {
        return showToast("Preencha todos os campos!", "error");
    }

    const novaSolicitacao = {
        solicitante: nome,
        etiqueta: etiqueta,
        qtd: parseInt(qtd),
        data: new Date().toISOString(),
        status: "pendente",
    };

    push(solicitacoesRef, novaSolicitacao);

    document.getElementById("etiquetaNome").value = "";
    document.getElementById("etiquetaQtd").value = "";

    showToast("Solicitação enviada!");
};


// ----------------------------
// RENDER COLABORADOR
// ----------------------------
function renderTabelaColaborador() {
    const tbody = document.querySelector("#tabelaColaborador tbody");
    tbody.innerHTML = "";

    const ultimas = dbSolicitacoes.slice().reverse().slice(0, 10);

    if (ultimas.length === 0) {
        tbody.innerHTML =
            "<tr><td colspan='4' style='text-align:center;'>Nenhum pedido.</td></tr>";
        return;
    }

    ultimas.forEach((item) => {
        const dataFormatada = new Date(item.data).toLocaleString("pt-BR");

        tbody.innerHTML += `
        <tr>
            <td>${dataFormatada}</td>
            <td>${item.etiqueta}</td>
            <td><strong>${item.qtd}</strong></td>
            <td>${item.status}</td>
        </tr>
        `;
    });
}


// ----------------------------
// RENDER ADMIN
// ----------------------------
function renderTabelaAdm() {
    const tbody = document.querySelector("#tabelaAdm tbody");
    tbody.innerHTML = "";

    if (dbSolicitacoes.length === 0) {
        tbody.innerHTML =
            "<tr><td colspan='6' style='text-align:center;'>Fila vazia.</td></tr>";
        return;
    }

    dbSolicitacoes.forEach((item) => {
        const dataFormatada = new Date(item.data).toLocaleString("pt-BR");

        tbody.innerHTML += `
        <tr>
            <td>${dataFormatada}</td>
            <td>${item.solicitante}</td>
            <td>${item.etiqueta}</td>
            <td>${item.qtd}</td>
            <td>${item.status}</td>
            <td>
                ${
                    item.status === "pendente"
                        ? `<button onclick="confirmarImpressao('${item.firebaseId}')">Imprimir</button>`
                        : "✔"
                }
            </td>
        </tr>
        `;
    });

    atualizarDashboard();
}


// ----------------------------
// CONFIRMAR IMPRESSÃO
// ----------------------------
window.confirmarImpressao = function (firebaseId) {
    const itemRef = ref(database, "solicitacoes/" + firebaseId);

    update(itemRef, {
        status: "impresso",
    });

    showToast("Pedido marcado como impresso!");
};


// ----------------------------
// DASHBOARD
// ----------------------------
function atualizarDashboard() {
    document.getElementById("dashPendentes").innerText =
        dbSolicitacoes.filter((i) => i.status === "pendente").length;

    document.getElementById("dashImpressas").innerText =
        dbSolicitacoes.filter((i) => i.status === "impresso").length;
}


// ----------------------------
// LIMPAR HISTÓRICO
// ----------------------------
window.limparHistorico = function () {
    if (!confirm("Apagar tudo?")) return;

    dbSolicitacoes.forEach((item) => {
        const itemRef = ref(database, "solicitacoes/" + item.firebaseId);
        remove(itemRef);
    });

    showToast("Histórico apagado!");
};


// ----------------------------
// UTILITÁRIOS
// ----------------------------
function atualizarTelas() {
    renderTabelaColaborador();
    if (isAdminLoggedIn) renderTabelaAdm();
}

function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    document.getElementById("toastMsg").innerText = msg;

    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}
