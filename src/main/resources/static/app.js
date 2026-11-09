// Caminho relativo: funciona tanto em localhost quanto no Render,
// porque o front-end é servido pelo próprio Spring Boot.
const API_URL = "/api";

let grafico = null;
let ultimasMetas = [];

// ==================== INICIALIZACAO ====================
document.addEventListener('DOMContentLoaded', () => {
    carregarEmpresas();
    carregarMetas();
});

// ==================== UTILITARIOS ====================

// Faz a requisição e lança erro se o servidor responder 4xx/5xx.
// (fetch só lança erro sozinho quando a conexão falha)
async function requisicao(caminho, opcoes = {}) {
    const resposta = await fetch(`${API_URL}${caminho}`, opcoes);
    if (!resposta.ok) {
        const detalhe = await resposta.text().catch(() => '');
        throw new Error(`HTTP ${resposta.status} ${detalhe}`.trim());
    }
    // DELETE e alguns POST podem voltar sem corpo
    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
}

// Evita que um nome com <script> ou HTML quebre a tabela (XSS)
function escaparHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function travarBotao(form, travar) {
    const botao = form.querySelector('button[type="submit"]');
    if (!botao) return;
    if (travar) {
        botao.dataset.textoOriginal = botao.textContent;
        botao.textContent = 'Salvando...';
        botao.disabled = true;
    } else {
        botao.textContent = botao.dataset.textoOriginal || botao.textContent;
        botao.disabled = false;
    }
}

// ==================== EMPRESAS ====================

async function carregarEmpresas() {
    try {
        const empresas = await requisicao('/empresas');

        const select = document.getElementById('metaEmpresa');
        select.innerHTML = '<option value="">Selecione a empresa</option>';

        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nome;
            select.appendChild(option);
        });

        document.getElementById('statEmpresas').textContent = empresas.length;
    } catch (erro) {
        console.error('Erro ao carregar empresas:', erro);
    }
}

document.getElementById('formEmpresa').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.currentTarget;

    const nome = document.getElementById('empresaNome').value.trim();
    const setor = document.getElementById('empresaSetor').value.trim();

    if (!nome || !setor) {
        alert('Preencha o nome e o setor da empresa.');
        return;
    }

    travarBotao(form, true);
    try {
        await requisicao('/empresas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, setor })
        });

        form.reset();
        await carregarEmpresas();
        alert('Empresa cadastrada com sucesso!');
    } catch (erro) {
        console.error('Erro ao cadastrar empresa:', erro);
        alert('Não foi possível cadastrar a empresa. Se o servidor estava parado, aguarde alguns segundos e tente de novo.');
    } finally {
        travarBotao(form, false);
    }
});

// ==================== METAS ESG ====================

document.getElementById('formMeta').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.currentTarget;

    const empresaId = document.getElementById('metaEmpresa').value;
    const pilar = document.getElementById('metaPilar').value;
    const descricao = document.getElementById('metaDescricao').value.trim();
    const valorAtual = parseFloat(document.getElementById('metaValorAtual').value);
    const valorMeta = parseFloat(document.getElementById('metaValorMeta').value);

    if (!empresaId) {
        alert('Selecione uma empresa.');
        return;
    }
    if (isNaN(valorAtual) || isNaN(valorMeta) || valorAtual < 0 || valorMeta <= 0) {
        alert('Informe valores válidos: o valor atual não pode ser negativo e a meta deve ser maior que zero.');
        return;
    }

    const novaMeta = {
        pilar,
        descricao,
        valorAtual,
        valorMeta,
        empresa: { id: parseInt(empresaId, 10) }
    };

    travarBotao(form, true);
    try {
        await requisicao('/metas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaMeta)
        });

        form.reset();
        await carregarMetas();
        alert('Meta cadastrada com sucesso!');
    } catch (erro) {
        console.error('Erro ao cadastrar meta:', erro);
        alert('Não foi possível cadastrar a meta. Tente novamente em alguns segundos.');
    } finally {
        travarBotao(form, false);
    }
});

async function carregarMetas() {
    try {
        const metas = await requisicao('/metas');
        ultimasMetas = metas;

        preencherTabela(metas);
        atualizarResumo(metas);
        desenharGrafico(metas);
    } catch (erro) {
        console.error('Erro ao carregar metas:', erro);
    }
}

function preencherTabela(metas) {
    const tbody = document.querySelector('#tabelaMetas tbody');
    const tabela = document.getElementById('tabelaMetas');
    const estadoVazio = document.getElementById('estadoVazio');
    tbody.innerHTML = '';

    // Mostra a mensagem de "nenhuma meta" quando a lista está vazia
    estadoVazio.style.display = metas.length === 0 ? 'block' : 'none';
    tabela.style.display = metas.length === 0 ? 'none' : '';

    metas.forEach(meta => {
        const linha = document.createElement('tr');

        const classeBadge = meta.classificacao === 'Alto desempenho' ? 'badge-alto'
            : meta.classificacao === 'Medio desempenho' ? 'badge-medio'
                : 'badge-baixo';

        const percentual = Number(meta.percentualAtingido ?? 0).toFixed(1);

        // data-label é usado pelo CSS para mostrar o título da coluna no celular
        linha.innerHTML = `
            <td data-label="Empresa">${escaparHtml(meta.nomeEmpresa)}</td>
            <td data-label="Pilar">${escaparHtml(meta.pilar)}</td>
            <td data-label="Descrição">${escaparHtml(meta.descricao)}</td>
            <td data-label="Atual">${escaparHtml(meta.valorAtual)}</td>
            <td data-label="Meta">${escaparHtml(meta.valorMeta)}</td>
            <td data-label="% Atingido">${percentual}%</td>
            <td data-label="Classificação"><span class="badge ${classeBadge}">${escaparHtml(meta.classificacao)}</span></td>
            <td class="celula-acao"><button class="btn-excluir" data-id="${Number(meta.id)}">Excluir</button></td>
        `;

        tbody.appendChild(linha);
    });

    tbody.querySelectorAll('.btn-excluir').forEach(botao => {
        botao.addEventListener('click', () => excluirMeta(botao.dataset.id));
    });
}

async function excluirMeta(id) {
    if (!confirm('Deseja realmente excluir esta meta?')) return;

    try {
        await requisicao(`/metas/${id}`, { method: 'DELETE' });
        carregarMetas();
    } catch (erro) {
        console.error('Erro ao excluir meta:', erro);
        alert('Não foi possível excluir a meta.');
    }
}

// ==================== RESUMO (cards do topo) ====================

function atualizarResumo(metas) {
    document.getElementById('statMetas').textContent = metas.length;

    const pilares = [
        { chave: 'ENVIRONMENTAL', sufixo: 'Environmental' },
        { chave: 'SOCIAL', sufixo: 'Social' },
        { chave: 'GOVERNANCE', sufixo: 'Governance' }
    ];

    pilares.forEach(({ chave, sufixo }) => {
        const doPilar = metas.filter(m => m.pilar === chave);
        const valor = document.getElementById(`resumo${sufixo}`);
        const barra = document.getElementById(`barra${sufixo}`);

        if (doPilar.length === 0) {
            valor.textContent = '—';
            barra.style.width = '0%';
            return;
        }

        const media = doPilar.reduce((soma, m) => soma + (m.percentualAtingido || 0), 0) / doPilar.length;
        valor.textContent = `${media.toFixed(0)}%`;
        barra.style.width = `${Math.min(media, 100)}%`;
    });
}

// ==================== GRAFICO ====================

function desenharGrafico(metas) {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não carregou (sem internet ou CDN bloqueada).');
        return;
    }
    const ctx = document.getElementById('graficoMetas').getContext('2d');
    const celular = window.matchMedia('(max-width: 600px)').matches;

    // No celular o rótulo vira duas linhas curtas (empresa / pilar) para não ser cortado
    const encurtar = (texto, max) => texto.length > max ? texto.slice(0, max - 1) + '…' : texto;
    const labels = metas.map(m => celular
        ? [encurtar(m.nomeEmpresa, 16), m.pilar.charAt(0) + m.pilar.slice(1).toLowerCase()]
        : `${m.nomeEmpresa} - ${m.pilar}`);
    const dados = metas.map(m => m.percentualAtingido);
    const cores = metas.map(m => {
        if (m.classificacao === 'Alto desempenho') return '#2e9e5b';
        if (m.classificacao === 'Medio desempenho') return '#d9a441';
        return '#c94f4f';
    });

    if (grafico !== null) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '% da Meta Atingido',
                data: dados,
                backgroundColor: cores
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // a altura vem do .chart-container no CSS
            indexAxis: celular ? 'y' : 'x', // no celular, barras deitadas cabem melhor
            scales: {
                x: celular
                    ? { beginAtZero: true, max: 100, title: { display: true, text: '% Atingido' } }
                    : { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
                y: celular
                    ? { ticks: { autoSkip: false } }
                    : { beginAtZero: true, max: 100, title: { display: true, text: '% Atingido' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Redesenha o gráfico só quando cruza o limite celular/desktop
// (não usa "resize", que dispara toda vez que a barra do navegador do celular some/aparece)
window.matchMedia('(max-width: 600px)').addEventListener('change', () => {
    desenharGrafico(ultimasMetas);
});