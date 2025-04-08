import { ativar } from "./alerts.js";

document.addEventListener('DOMContentLoaded', () => {
    carregarAtividades();
});

function carregarAtividades() {
    fetch('/professor/atividades')
        .then(response => response.json())
        .then(atividades => {
            const container = document.createElement('div');
            container.className = 'atividades-criadas';
            container.innerHTML = '';

            // Ordena pela data de criação (mais recente primeiro)
            atividades.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
            atividades.forEach(atividade => {
                const div = criarCardAtividade(atividade);
                container.appendChild(div);
            });

            if (!document.querySelector('.atividades-criadas')) {
                document.querySelector('.container').appendChild(container);
            }
        })
        .catch(error => console.error('Erro ao carregar atividades:', error));
}

function criarCardAtividade({ id, titulo, descricao, semestre, prazo_entrega, criterios_avaliacao}) {
    const div = document.createElement('div');
    div.className = 'atividade-card';
    div.dataset.atividadeId = id;
    
    div.innerHTML = `
        <strong>${titulo}</strong><br>
        Prazo de Entrega: ${formatarData(prazo_entrega)}<br>
        Semestre: ${semestre}º Semestre <br>
    `;

    const btnMostrar = document.createElement('button');
    btnMostrar.className = 'btn-Ver btn';
    btnMostrar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ver`
    btnMostrar.onclick = () => {
            // Div do fundo escuro
            const overlay = document.createElement('div');
            overlay.className='div-zindex'
        
            // Div do conteúdo central
            const modal = document.createElement('div');
            modal.className='div-mostrar'
            modal.innerHTML = `
                  <h2>${titulo}</h2>
                  <p><strong>Descrição:</strong> ${descricao}</p>
                  <p><strong>Semestre:</strong> ${semestre}</p>
                  <p><strong>Prazo de Entrega:</strong> ${formatarData(prazo_entrega)}</p>
                  <p><strong>Critérios de Avaliação:</strong> ${criterios_avaliacao}</p>
                  <button id="fecharModal" style="margin-top: 1rem;">Fechar</button>
            `;
        
            // Evento para fechar o modal
            modal.querySelector('#fecharModal').onclick = () => {
                document.body.removeChild(overlay);
            };
        
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        
        
    };
    const btnAlterar = document.createElement('button');
    btnAlterar.className = 'btn-alterar btn';
    btnAlterar.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg> Alterar`
    btnAlterar.onclick = () => {
        // Criar o modal de edição
        const overlay = document.createElement('div');
        overlay.className = 'div-zindex';
        
        // Formatar a data para o campo datetime-local
        const dataHora = new Date(prazo_entrega);
        const ano = dataHora.getFullYear();
        const mes = String(dataHora.getMonth() + 1).padStart(2, '0');
        const dia = String(dataHora.getDate()).padStart(2, '0');
        const hora = String(dataHora.getHours()).padStart(2, '0');
        const minuto = String(dataHora.getMinutes()).padStart(2, '0');
        const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
        
        // Criar modal com formulário de edição
        const modal = document.createElement('div');
        modal.className = 'div-mostrar form-task';
        modal.innerHTML = `
            <h2>Editar Atividade</h2>
            <form id="editar-atividade">
                <label for="edit-titulo">Nome da atividade</label>
                <input type="text" id="edit-titulo" class="input-atividade" value="${titulo}" required>
                
                <label for="edit-descricao">Descrição da Atividade</label>
                <textarea id="edit-descricao" class="input-atividade textarea-tamanho" required>${descricao}</textarea>
                
                <label for="edit-semestre">Semestre</label>
                <select id="edit-semestre" class="input-atividade selectSemestre" required>
                    <option value="1" ${semestre == 1 ? 'selected' : ''}>1º Semestre</option>
                    <option value="2" ${semestre == 2 ? 'selected' : ''}>2º Semestre</option>
                    <option value="3" ${semestre == 3 ? 'selected' : ''}>3º Semestre</option>
                    <option value="4" ${semestre == 4 ? 'selected' : ''}>4º Semestre</option>
                    <option value="5" ${semestre == 5 ? 'selected' : ''}>5º Semestre</option>
                    <option value="6" ${semestre == 6 ? 'selected' : ''}>6º Semestre</option>
                </select>
                
                <label for="edit-prazo">Data de entrega</label>
                <input type="datetime-local" id="edit-prazo" class="input-atividade" value="${dataFormatada}" required>
                
                <label for="edit-criterios">Pontos</label>
                <input type="number" id="edit-criterios" class="input-atividade" value="${criterios_avaliacao}" min="1" max="100" required>
                
                <div class="btn-group">
                    <button type="submit" class="send-button">Salvar</button>
                    <button type="button" id="cancelar-edicao" class="btn-excluir">Cancelar</button>
                </div>
            </form>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Evento para cancelar edição
        document.getElementById('cancelar-edicao').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        // Evento de envio do formulário de edição
        document.getElementById('editar-atividade').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const atividadeId = div.dataset.atividadeId;
            
            const dadosAtualizados = {
                titulo: document.getElementById('edit-titulo').value,
                descricao: document.getElementById('edit-descricao').value,
                semestre: parseInt(document.getElementById('edit-semestre').value),
                prazo_entrega: document.getElementById('edit-prazo').value,
                criterios_avaliacao: document.getElementById('edit-criterios').value,
                professor_id: 1,  // ID fixo como no exemplo original
                projeto_id: 1     // ID fixo como no exemplo original
            };
            
            try {
                const response = await fetch(`/professor/atividades/${atividadeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosAtualizados)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao atualizar atividade');
                }
                
                const data = await response.json();
                
                // Atualizar o card com os novos dados
                div.querySelector('strong').textContent = dadosAtualizados.titulo;
                div.querySelector('br').nextSibling.textContent = `Prazo: ${formatarData(dadosAtualizados.prazo_entrega)}`;
                
                // Atualizar as referências aos dados para os eventos de botões
                titulo = dadosAtualizados.titulo;
                descricao = dadosAtualizados.descricao;
                semestre = dadosAtualizados.semestre;
                prazo_entrega = dadosAtualizados.prazo_entrega;
                criterios_avaliacao = dadosAtualizados.criterios_avaliacao;
                
                // Fechar o modal e mostrar mensagem de sucesso
                document.body.removeChild(overlay);
                ativar(data.message, 'sucesso', '');
                
            } catch (error) {
                console.error('Erro:', error);
                alert(`Falha ao atualizar atividade: ${error.message}`);
            }
        });
    };

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn-excluir btn';
    btnExcluir.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Excluir`
    btnExcluir.onclick = async () => {
        try {
            // Obter e converter ID para número
            const atividadeId = parseInt(div.dataset.atividadeId, 10);
            console.log("ID da atividade a ser excluída:", atividadeId); 
            if (isNaN(atividadeId)) {
                throw new Error('ID da atividade inválido');
            }
            
            if (!confirm('Tem certeza que deseja excluir esta atividade?')) {
                return; 
            }
            
            // Fazer requisição DELETE para o servidor
            const response = await fetch(`/professor/criar-atividade/${atividadeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao excluir atividade');
            }
            
            // Se chegou aqui, a exclusão foi bem-sucedida
            const data = await response.json();
            ativar(data.message,'sucesso',''); 
            
            // Remover elemento do DOM
            div.remove();
            
        } catch (error) {
            console.error('Erro:', error);
            ativar(`Falha ao excluir atividade: ${error.message}`,'erro','');
        }
    };

    div.appendChild(btnMostrar)
    div.appendChild(btnAlterar);
    div.appendChild(btnExcluir);
    return div;
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

const form = document.querySelector('#create-task');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const titulo = document.getElementById('nomeAtividade').value;
    const descricao = document.getElementById('descricao').value;
    const semestre = parseInt(document.getElementById('semestre').value);
    const prazo_entrega = document.getElementById('dataEntrega').value;
    const criterios_avaliacao = document.getElementById('pontos').value;

    // IDs fixos (temporariamente estáticos, podem vir do login futuramente)
    const professor_id = 1;
    const projeto_id = 1;

    document.getElementById('semestreError').textContent = '';

    // Validações
    if (!titulo || !descricao || !prazo_entrega || !criterios_avaliacao || !semestre) {
        ativar('Por favor, preencha todos os campos.', 'erro', '');
        return;
    }

    if (semestre < 1) {
        document.getElementById('semestreError').textContent = 'Selecione um Semestre válido.';
        return;
    }

    // Envio para o back-end
    fetch('/professor/atividades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            titulo,
            descricao,
            professor_id,
            projeto_id,
            prazo_entrega,
            criterios_avaliacao,
            semestre
        })
    })
    .then(response => {
        if (response.ok) {
            ativar('Atividade criada com sucesso!', 'sucesso', '/professor/criar-atividade');
            form.reset();
            // Criar e adicionar lembrete abaixo do formulário
            response.json().then(data => {
                carregarAtividades();
            });
        } else {
            response.json().then(data => {
                ativar(data.message, data.success ? 'sucesso' : 'erro');
            });
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        ativar(`Erro ${response.status}: ${response.statusText}`, 'erro', '');
    });
});