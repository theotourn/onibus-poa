import React, { useState, useEffect } from 'react';
import consultarHorariosAPI from './services/datapoaAPI';

function App() {
  const [linha, setLinha] = useState('');
  const [horarios, setHorarios] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const organizarHorariosPorSentidoDia = (horarios, horariosAntigos) => {
    const horariosOrganizados = { ...horariosAntigos };

    horarios.forEach((horario) => {
      const sentido = horario.sentido;
      const tipoDia = horario.tipo_dia;

      if (tipoDia === 'FERIADO') {
        return;
      }

      if (!horariosOrganizados[sentido]) {
        horariosOrganizados[sentido] = {};
      }

      if (!horariosOrganizados[sentido][tipoDia]) {
        horariosOrganizados[sentido][tipoDia] = [];
      }

      horariosOrganizados[sentido][tipoDia].push(horario);
    });

    return horariosOrganizados;
  };

  const compareHorarios = (horarioA, horarioB) => {
    const horaA = new Date(`2000-01-01 ${horarioA.horario_largada}`);
    const horaB = new Date(`2000-01-01 ${horarioB.horario_largada}`);

    return horaA - horaB;
  };

  const formatarNomeDia = (tipoDia) => {
    switch (tipoDia) {
      case 'DIAUTIL':
        return 'Dia útil';
      case 'SABADO':
        return 'Sábado';
      case 'DOMINGO':
        return 'Domingo';
      default:
        return tipoDia;
    }
  };

  const carregarMaisHorarios = async (nextEndpoint, horariosAntigos) => {
    try {
      setIsLoading(true);
      const { horarios: moreHorarios, nextLink } = await consultarHorariosAPI(nextEndpoint);
      const filteredHorarios = moreHorarios.filter((horario) => horario.tipo_tabela === 'OFICIAL');
      const horariosAtualizados = organizarHorariosPorSentidoDia(filteredHorarios, horariosAntigos);
      setHorarios((prevHorarios) => ({ ...prevHorarios, ...horariosAtualizados }));
      console.log(moreHorarios)

      if (nextLink && moreHorarios.length > 0) {
        carregarMaisHorarios(nextLink, horariosAtualizados);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const consultarHorarios = async () => {
    try {
      setIsLoading(true);
      const { horarios: initialHorarios, nextLink } = await consultarHorariosAPI(
        `https://dadosabertos.poa.br/api/3/action/datastore_search?resource_id=cb96a73e-e18b-4371-95c5-2cf20e359e6c&q=${linha}`
      );
      const filteredInitialHorarios = initialHorarios.filter((horario) => horario.tipo_tabela === 'OFICIAL');
      const horariosOrganizados = organizarHorariosPorSentidoDia(filteredInitialHorarios, {});
      setHorarios(horariosOrganizados);

      if (nextLink) {
        carregarMaisHorarios(nextLink, horariosOrganizados);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className='container pt-4'>
      <div className='card'>
        <div className='card-header'>
          <h2 className='card-title'>
            <span>Horários de ônibus</span>
          </h2>
        </div>
        <div className='card-body'>
          <div className='input-group'>
            <input
              className='form-control'
              type='text'
              placeholder='Digite o número da linha'
              value={linha}
              onChange={(e) => setLinha(e.target.value)}
            />
            <button className='btn btn-primary' onClick={consultarHorarios}>
              Consultar
            </button>
          </div>
          {isLoading ? (
            <div className='text-center mt-3'>
              <div className='spinner-border' role='status'>
                <span className='visually-hidden'>Carregando...</span>
              </div>
            </div>
          ) : (
            Object.entries(horarios).map(([sentido, horariosPorDia]) => (
              <div className='list-group list-group-flush' key={sentido}>
                <h3 className='list-group-item text-center mt-4 p-2 fw-bold'>{sentido}</h3>
                {Object.entries(horariosPorDia)
                  .sort()
                  .map(([tipoDia, horariosDoDia]) => {
                    if (tipoDia === 'FERIADO') {
                      return null;
                    }

                    return (
                      <div className='list-group-item text-center' key={tipoDia}>
                        <h4>{formatarNomeDia(tipoDia)}</h4>
                        {horariosDoDia.sort(compareHorarios).map((horario) => (
                          <div key={horario._id} className='badge bg-primary m-1'>
                            {horario.horario_largada}
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
