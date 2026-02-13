// script.js - Sistema de Gestão de Etiquetas com Firebase
// Impressas Hoje = quantidade de solicitações (linhas) impressas hoje
// Total Etiquetas Impressas = soma das quantidades (qtd) de todas impressas (histórico)

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
// FIREBASE: CARREGAR DADOS EM TEMPO REAL
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

        // Ordena por data (mais recente primeiro)
        dbSolicitacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

        atualizarTelas();
        atualizarDashboard();
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
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const errorMsg = document.getElementById("loginError");

    if (user === "Ericlm" && pass === "Evo@0101") {
        isAdminLoggedIn = true;
        closeLoginModal();
        switchRole("adm");
        showToast("Bem-vindo, Administrador!");
    } else {
        errorMsg.style.display = "block";
    }
};

window.logoutAdmin = function () {
    isAdminLoggedIn = false;
    switchRole("colaborador");
    showToast("Sessão de administrador encerrada.");
};

// ----------------------------
// TROCA DE TELAS
// ----------------------------
window.switchRole = function (role) {
    const btnColab = document.getElementById("btnColab");
    const btnAdm   = document.getElementById("btnAdm");
    const viewColab = document.getElementById("view-colaborador");
    const viewAdm   = document.getElementById("view-adm");

    if (role === "colaborador") {
        btnColab.classList.add("active");
        btnAdm.classList.remove("active");
        viewColab.classList.remove("hidden");
        viewAdm.classList.add("hidden");
    } else if (role === "adm") {
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
    const qtdStr = document.getElementById("etiquetaQtd").value.trim();

    if (!nome || !etiqueta || !qtdStr || isNaN(qtdStr) || Number(qtdStr) < 1) {
        showToast("Preencha todos os campos corretamente!");
        return;
    }

    const novaSolicitacao = {
        solicitante: nome,
        etiqueta: etiqueta,
        qtd: Number(qtdStr),
        data: new Date().toISOString(),
        status: "pendente",
    };

    push(solicitacoesRef, novaSolicitacao);

    document.getElementById("etiquetaNome").value = "";
    document.getElementById("etiquetaQtd").value = "";

    showToast("Solicitação enviada com sucesso!");
};

// ----------------------------
// TABELA COLABORADOR (últimos 10)
// ----------------------------
function renderTabelaColaborador() {
    const tbody = document.querySelector("#tabelaColaborador tbody");
    tbody.innerHTML = "";

    const ultimas = dbSolicitacoes.slice(0, 10);

    if (ultimas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Nenhum pedido recente.</td></tr>`;
        return;
    }

    ultimas.forEach((item) => {
        const dataFormatada = new Date(item.data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });

        const statusClass = item.status === "pendente" ? "badge-pending" : "badge-done";
        const statusText  = item.status === "pendente" ? "Pendente" : "Impresso";

        tbody.innerHTML += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${item.etiqueta}</td>
                <td><strong>${item.qtd}</strong></td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
}

// ----------------------------
// TABELA ADMIN (todas)
// ----------------------------
function renderTabelaAdm() {
    const tbody = document.querySelector("#tabelaAdm tbody");
    tbody.innerHTML = "";

    if (dbSolicitacoes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Fila de impressão vazia.</td></tr>`;
        return;
    }

    dbSolicitacoes.forEach((item) => {
        const dataFormatada = new Date(item.data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });

        const statusClass = item.status === "pendente" ? "badge-pending" : "badge-done";
        const statusText  = item.status === "pendente" ? "Pendente" : "Impresso";

        tbody.innerHTML += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${item.solicitante}</td>
                <td>${item.etiqueta}</td>
                <td>${item.qtd}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td style="text-align:center;">
                    ${
                        item.status === "pendente"
                            ? `<button class="btn btn-success" style="padding:6px 12px; font-size:0.9rem;" onclick="confirmarImpressao('${item.firebaseId}')">
                                 <i class="fa-solid fa-check"></i> Imprimir
                               </button>`
                            : `<span style="color:#10b981;">✔ Impresso</span>`
                    }
                </td>
            </tr>
        `;
    });
}

// ----------------------------
// MARCAR COMO IMPRESSO
// ----------------------------
window.confirmarImpressao = function (firebaseId) {
    const itemRef = ref(database, "solicitacoes/" + firebaseId);

    update(itemRef, {
        status: "impresso",
        dataImpressao: new Date().toISOString()
    });

    showToast("Pedido marcado como impresso!");
};

// ----------------------------
// IMPRIMIR RELATÓRIO
// ----------------------------
window.imprimirRelatorio = function () {
    if (dbSolicitacoes.length === 0) {
        showToast("Nenhuma solicitação para gerar relatório.");
        return;
    }

    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Etiquetas - ${new Date().toLocaleDateString("pt-BR")}</title>
        <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 30px; color: #333; }
            h1 { text-align: center; color: #2563eb; margin-bottom: 10px; }
            .subtitle { text-align: center; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin: 25px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 0.85rem; }
            .pendente { color: #c2410c; font-weight: bold; }
            .impresso { color: #047857; font-weight: bold; }
            .totais { margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; }
            .totais p { margin: 8px 0; font-size: 1.1rem; }
        </style>
    </head>
    <body>
        <h1>Relatório de Solicitações de Etiquetas</h1>
        <p class="subtitle">Gerado em ${new Date().toLocaleString("pt-BR")}</p>

        <table>
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Solicitante</th>
                    <th>Etiqueta</th>
                    <th>Quantidade</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    dbSolicitacoes.forEach(item => {
        const dataFmt = new Date(item.data).toLocaleString("pt-BR");
        const statusClass = item.status === "pendente" ? "pendente" : "impresso";
        const statusTxt  = item.status === "pendente" ? "Pendente" : "Impresso";

        html += `
                <tr>
                    <td>${dataFmt}</td>
                    <td>${item.solicitante}</td>
                    <td>${item.etiqueta}</td>
                    <td>${item.qtd}</td>
                    <td class="${statusClass}">${statusTxt}</td>
                </tr>
        `;
    });

    const totPendQtd = dbSolicitacoes
        .filter(i => i.status === "pendente")
        .reduce((sum, i) => sum + (Number(i.qtd) || 0), 0);

    const totImpQtd = dbSolicitacoes
        .filter(i => i.status === "impresso")
        .reduce((sum, i) => sum + (Number(i.qtd) || 0), 0);

    const totPendLinhas = dbSolicitacoes.filter(i => i.status === "pendente").length;
    const totImpLinhas  = dbSolicitacoes.filter(i => i.status === "impresso").length;

    html += `
            </tbody>
        </table>

        <div class="totais">
            <p><strong>Total pendentes (etiquetas):</strong> ${totPendQtd.toLocaleString("pt-BR")}</p>
            <p><strong>Total pendentes (solicitações):</strong> ${totPendLinhas}</p>
            <p><strong>Total impressas (etiquetas):</strong> ${totImpQtd.toLocaleString("pt-BR")}</p>
            <p><strong>Total impressas (solicitações):</strong> ${totImpLinhas}</p>
        </div>

        <script>window.onload = () => window.print();</script>
    </body>
    </html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
};

// ----------------------------
// LIMPAR HISTÓRICO
// ----------------------------
window.limparHistorico = function () {
    if (!confirm("Deseja realmente apagar TODO o histórico?")) return;

    dbSolicitacoes.forEach(item => {
        const itemRef = ref(database, "solicitacoes/" + item.firebaseId);
        remove(itemRef);
    });

    showToast("Histórico apagado com sucesso.");
};

// ----------------------------
// DASHBOARD – DIFERENÇA PRINCIPAL AQUI
// ----------------------------
function atualizarDashboard() {
    // Pendentes – soma das quantidades
    const pendentesQtd = dbSolicitacoes
        .filter(i => i.status === "pendente")
        .reduce((sum, i) => sum + (Number(i.qtd) || 0), 0);

    // Impressas Hoje – CONTAGEM de solicitações (linhas) impressas hoje
    const hoje = new Date().toDateString();
    const impressasHojeCount = dbSolicitacoes
        .filter(i => {
            if (i.status !== "impresso") return false;
            return new Date(i.data).toDateString() === hoje;
        })
        .length;

    // Total Etiquetas Impressas – soma das quantidades (todas impressas, histórico)
    const totalImpressasQtd = dbSolicitacoes
        .filter(i => i.status === "impresso")
        .reduce((sum, i) => sum + (Number(i.qtd) || 0), 0);

    document.getElementById("dashPendentes").textContent       = pendentesQtd.toLocaleString("pt-BR");
    document.getElementById("dashImpressas").textContent       = impressasHojeCount.toLocaleString("pt-BR");
    document.getElementById("dashTotalPendentes").textContent  = pendentesQtd.toLocaleString("pt-BR");
    document.getElementById("dashTotalImpressas").textContent  = totalImpressasQtd.toLocaleString("pt-BR");
}

// ----------------------------
// UTILITÁRIOS
// ----------------------------
function atualizarTelas() {
    renderTabelaColaborador();
    if (isAdminLoggedIn) renderTabelaAdm();
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    document.getElementById("toastMsg").textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
}
