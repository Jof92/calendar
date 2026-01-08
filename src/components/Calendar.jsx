import React, { useState, useEffect } from 'react';
import './Calendar.css';
import supabase from '../lib/supabaseClient'; // ajuste o caminho conforme sua estrutura

const Calendar = () => {
  const [agendamentos, setAgendamentos] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [turnoSelecionado, setTurnoSelecionado] = useState(null);
  const [form, setForm] = useState({
    solicitante: '',
    servico: '',
    origem: '',
    destino: '',
    material: '',
    quemProcurar: '',
    tipoTransporte: '',
    fornecedor: ''
  });
  const [visualizandoChave, setVisualizandoChave] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  useEffect(() => {
    const carregarAgendamentos = async () => {
      setCarregando(true);
      const inicioMes = new Date(ano, mes, 1);
      const fimMes = new Date(ano, mes + 1, 0);

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', fimMes.toISOString().split('T')[0]);

      if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        alert('Erro ao carregar agendamentos.');
      } else {
        const mapa = {};
        data.forEach(ag => {
          const chave = `${ag.data}-${ag.turno}`;
          mapa[chave] = {
            solicitante: ag.solicitante,
            servico: ag.servico,
            origem: ag.origem,
            destino: ag.destino,
            material: ag.material,
            quemProcurar: ag.quem_procurar,
            tipoTransporte: ag.tipo_transporte,
            fornecedor: ag.fornecedor
          };
        });
        setAgendamentos(mapa);
      }
      setCarregando(false);
    };

    carregarAgendamentos();
  }, [mes, ano]);

  const abrirModal = (data, turno) => {
    const agora = new Date();
    const dataAtual = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const [anoStr, mesStr, diaStr] = data.split('-');
    const dataClicada = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));

    if (dataClicada < dataAtual) return;

    const diaSemana = dataClicada.getDay();
    if (diaSemana === 0 || diaSemana === 6) return;
    if (diaSemana === 3 || diaSemana === 5) return;

    const chave = `${data}-${turno}`;
    if (agendamentos[chave]) {
      alert('Este turno já está agendado!');
      return;
    }

    setDiaSelecionado(data);
    setTurnoSelecionado(turno);
    setForm({
      solicitante: '',
      servico: '',
      origem: '',
      destino: '',
      material: '',
      quemProcurar: '',
      tipoTransporte: '',
      fornecedor: ''
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoTransporteChange = (tipo) => {
    setForm(prev => ({ ...prev, tipoTransporte: tipo }));
  };

  const handleSubmit = async () => {
    const { solicitante, servico, origem, destino, material, quemProcurar, tipoTransporte, fornecedor } = form;

    if (!solicitante || !servico || !origem || !destino || !material || !quemProcurar || !tipoTransporte || !fornecedor) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (tipoTransporte === 'caminhao' && turnoSelecionado === 'tarde') {
      alert('Caminhão só pode ser agendado no período da manhã.');
      return;
    }

    const novoAgendamento = {
      data: diaSelecionado,
      turno: turnoSelecionado,
      solicitante,
      servico,
      origem,
      destino,
      material,
      quem_procurar: quemProcurar,
      tipo_transporte: tipoTransporte,
      fornecedor
    };

    const { error } = await supabase
      .from('agendamentos')
      .insert([novoAgendamento]);

    if (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar agendamento. Tente novamente.');
      return;
    }

    const chave = `${diaSelecionado}-${turnoSelecionado}`;
    setAgendamentos(prev => ({
      ...prev,
      [chave]: form
    }));

    fecharModal();
    alert('Turno agendado com sucesso!');
  };

  const hojeSemHora = new Date();
  hojeSemHora.setHours(0, 0, 0, 0);

  return (
    <div className="calendar-wrapper">
      {carregando && <div className="loading">Carregando...</div>}
      <div className="calendar-card">
        <div className="calendar-header">
          <button 
            onClick={() => mes === 0 ? (setMes(11), setAno(ano - 1)) : setMes(mes - 1)}
            className="nav-button prev"
          >
            {'<'}
          </button>
          <h2 className="calendar-title">
            {new Date(ano, mes, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            onClick={() => mes === 11 ? (setMes(0), setAno(ano + 1)) : setMes(mes + 1)}
            className="nav-button next"
          >
            {'>'}
          </button>
        </div>

        <div className="days-grid">
          {Array.from({ length: primeiroDia }).map((_, i) => (
            <div key={`vazio-${i}`} className="empty-day"></div>
          ))}

          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const dataObj = new Date(ano, mes, dia);
            const diaSemana = dataObj.getDay();
            const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const manhaOcupada = agendamentos[`${dataStr}-manha`];
            const tardeOcupada = agendamentos[`${dataStr}-tarde`];
            const ehPassado = dataObj < hojeSemHora;

            if (diaSemana === 0 || diaSemana === 6) {
              return (
                <div key={dia} className="day-cell disabled-weekend">
                  <div className="day-number">
                    <span className="mobile-weekday">{diasSemana[diaSemana]}</span>
                    <span className="mobile-date">{dia}</span>
                  </div>
                  <div className="weekend-placeholder">—</div>
                </div>
              );
            }

            const isBloqueado = diaSemana === 3 || diaSemana === 5;

            return (
              <div key={dia} className={`day-cell ${ehPassado ? 'day-passado' : ''}`}>
                {/* ✅ CORREÇÃO AQUI: agora mostra o dia da semana em TODOS os dias */}
                <div className="day-number">
                  <span className="mobile-weekday">{diasSemana[diaSemana]}</span>
                  <span className="mobile-date">{dia}</span>
                </div>

                <div className="turno-item">
                  <div
                    className={`turno turno-manha ${manhaOcupada ? 'ocupado' : ''} ${isBloqueado ? 'bloqueado' : ''} ${ehPassado ? 'passado' : ''}`}
                    onClick={() => {
                      if (!isBloqueado && !ehPassado) {
                        abrirModal(dataStr, 'manha');
                      }
                    }}
                    title={
                      ehPassado
                        ? 'Data já passou'
                        : isBloqueado
                        ? 'Bloqueado'
                        : manhaOcupada
                        ? manhaOcupada.servico
                        : 'Clique para agendar manhã'
                    }
                  >
                    {manhaOcupada ? 'Agendado' : 'Manhã'}
                    {isBloqueado && <span className="lock-icon"><LockIcon /></span>}
                  </div>
                  {!isBloqueado && !ehPassado && (
                    <button
                      className="eye-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisualizandoChave(`${dataStr}-manha`);
                      }}
                      title="Ver detalhes"
                    >
                      <EyeIcon />
                    </button>
                  )}
                </div>

                <div className="turno-item">
                  <div
                    className={`turno turno-tarde ${tardeOcupada ? 'ocupado' : ''} ${isBloqueado ? 'bloqueado' : ''} ${ehPassado ? 'passado' : ''}`}
                    onClick={() => {
                      if (!isBloqueado && !ehPassado) {
                        abrirModal(dataStr, 'tarde');
                      }
                    }}
                    title={
                      ehPassado
                        ? 'Data já passou'
                        : isBloqueado
                        ? 'Bloqueado'
                        : tardeOcupada
                        ? tardeOcupada.servico
                        : 'Clique para agendar tarde'
                    }
                  >
                    {tardeOcupada ? 'Agendado' : 'Tarde'}
                    {isBloqueado && <span className="lock-icon"><LockIcon /></span>}
                  </div>
                  {!isBloqueado && !ehPassado && (
                    <button
                      className="eye-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisualizandoChave(`${dataStr}-tarde`);
                      }}
                      title="Ver detalhes"
                    >
                      <EyeIcon />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {visualizandoChave && (
        <div className="modal-overlay" onClick={() => setVisualizandoChave(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Agendamento</h3>
              <button className="modal-close" onClick={() => setVisualizandoChave(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {agendamentos[visualizandoChave] ? (
                <div className="agendamento-info">
                  <p><strong>Solicitante:</strong> {agendamentos[visualizandoChave].solicitante}</p>
                  <p><strong>Serviço:</strong> {agendamentos[visualizandoChave].servico}</p>
                  <p><strong>Origem:</strong> {agendamentos[visualizandoChave].origem}</p>
                  <p><strong>Destino:</strong> {agendamentos[visualizandoChave].destino}</p>
                  <p><strong>Material:</strong> {agendamentos[visualizandoChave].material}</p>
                  <p><strong>Quem procurar no local:</strong> {agendamentos[visualizandoChave].quemProcurar}</p>
                  <p><strong>Tipo de Transporte:</strong> {agendamentos[visualizandoChave].tipoTransporte === 'caminhao' ? 'Caminhão' : 'Saveiro'}</p>
                  <p><strong>Fornecedor acertado:</strong> {agendamentos[visualizandoChave].fornecedor === 'sim' ? 'Sim' : 'Não'}</p>
                </div>
              ) : (
                <p className="mensagem-vazia">Vazio</p>
              )}
            </div>
          </div>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agendar Turno</h3>
              <button className="modal-close" onClick={fecharModal}>&times;</button>
            </div>
            <form className="modal-form">
              <div className="form-group">
                <label>Solicitante *</label>
                <input
                  type="text"
                  name="solicitante"
                  value={form.solicitante}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Serviço *</label>
                <input
                  type="text"
                  name="servico"
                  value={form.servico}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Origem *</label>
                <input
                  type="text"
                  name="origem"
                  value={form.origem}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Destino *</label>
                <input
                  type="text"
                  name="destino"
                  value={form.destino}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Material *</label>
                <input
                  type="text"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quem procurar no local *</label>
                <input
                  type="text"
                  name="quemProcurar"
                  value={form.quemProcurar}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de transporte *</label>
                <div className="radio-group">
                  {turnoSelecionado !== 'tarde' && (
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="tipoTransporte"
                        value="caminhao"
                        checked={form.tipoTransporte === 'caminhao'}
                        onChange={() => handleTipoTransporteChange('caminhao')}
                        required
                      />
                      <span>Caminhão</span>
                    </label>
                  )}
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="tipoTransporte"
                      value="saveiro"
                      checked={form.tipoTransporte === 'saveiro'}
                      onChange={() => handleTipoTransporteChange('saveiro')}
                      required
                    />
                    <span>Saveiro</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Já foi acertado com fornecedor? *</label>
                <select
                  name="fornecedor"
                  value={form.fornecedor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn cancel" onClick={fecharModal}>Cancelar</button>
                <button type="button" className="btn submit" onClick={handleSubmit}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;