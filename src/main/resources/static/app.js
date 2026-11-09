const API_URL = "/api";

let grafico = null;

// ==================== INICIALIZACAO ====================
document.addEventListener('DOMContentLoaded', () => {
    carregarEmpresas();
    carregarMetas();
});

// ==================== EMPRESAS ====================

async function carregarEmpresas() {
    try {
        const resposta = await fetch(`${API_URL}/empresas`);
        const empresas = await resposta.json();

        const select = document.getElementById('metaEmpresa');
        select.innerHTML = '<option value="">Selecione a empresa</option>';

        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nome;
            select.appendChild(option);
        });
    } catch (erro) {
        console.error('Erro ao carregar empresas:', erro);
    }
}

document.getElementById('formEmpresa').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('empresaNome').value;
    const setor = document.getElementById('empresaSetor').value;

    try {
        await fetch(`${API_URL}/empresas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, setor })
        });

        document.getElementById('formEmpresa').reset();
        carregarEmpresas();
        alert('Empresa cadastrada com sucesso!');
    } catch (erro) {
        console.error('Erro ao cadastrar empresa:', erro);
        alert('Erro ao cadastrar empresa.');
    }
});

// ==================== METAS ESG ====================

document.getElementById('formMeta').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const empresaId = document.getElementById('metaEmpresa').value;
    const pilar = document.getElementById('metaPilar').value;
    const descricao = document.getElementById('metaDescricao').value;
    const valorAtual = parseFloat(document.getElementById('metaValorAtual').value);
    const valorMeta = parseFloat(document.getElementById('metaValorMeta').value);

    if (!empresaId) {
        alert('Selecione uma empresa.');
        return;
    }

    const novaMeta = {
        pilar: pilar,
        descricao: descricao,
        valorAtual: valorAtual,
        valorMeta: valorMeta,
        empresa: { id: parseInt(empresaId) }
    };

    try {
        await fetch(`${API_URL}/metas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaMeta)
        });

        document.getElementById('formMeta').reset();
        carregarMetas();
        alert('Meta cadastrada com sucesso!');
    } catch (erro) {
        console.error('Erro ao cadastrar meta:', erro);
        alert('Erro ao cadastrar meta.');
    }
});

async function carregarMetas() {
    try {
        const resposta = await fetch(`${API_URL}/metas`);
        const metas = await resposta.json();

        preencherTabela(metas);
        desenharGrafico(metas);
    } catch (erro) {
        console.error('Erro ao carregar metas:', erro);
    }
}

function preencherTabela(metas) {
    const tbody = document.querySelector('#tabelaMetas tbody');
    tbody.innerHTML = '';

    metas.forEach(meta => {
        const linha = document.createElement('tr');

        const classeBadge = meta.classificacao === 'Alto desempenho' ? 'badge-alto'
            : meta.classificacao === 'Medio desempenho' ? 'badge-medio'
                : 'badge-baixo';

        linha.innerHTML = `
            <td>${meta.nomeEmpresa}</td>
            <td>${meta.pilar}</td>
            <td>${meta.descricao}</td>
            <td>${meta.valorAtual}</td>
            <td>${meta.valorMeta}</td>
            <td>${meta.percentualAtingido.toFixed(1)}%</td>
            <td><span class="badge ${classeBadge}">${meta.classificacao}</span></td>
            <td><button class="btn-excluir" onclick="excluirMeta(${meta.id})">Excluir</button></td>
        `;

        tbody.appendChild(linha);
    });
}

async function excluirMeta(id) {
    if (!confirm('Deseja realmente excluir esta meta?')) return;

    try {
        await fetch(`${API_URL}/metas/${id}`, { method: 'DELETE' });
        carregarMetas();
    } catch (erro) {
        console.error('Erro ao excluir meta:', erro);
    }
}

// ==================== GRAFICO ====================

function desenharGrafico(metas) {
    const ctx = document.getElementById('graficoMetas').getContext('2d');

    const labels = metas.map(m => `${m.nomeEmpresa} - ${m.pilar}`);
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
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: '% Atingido' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}