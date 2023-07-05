import axios from 'axios';

const BASE_URL = 'https://dadosabertos.poa.br';

const consultarHorariosAPI = async (endpoint) => {
  try {
    const response = await axios.get(endpoint);

    const data = response.data;
    console.log(response.data.result._links.next);
    if (data.result && data.result.records) {
      const horarios = data.result.records;

      let nextLink = '';
      if (data.result._links && data.result._links.next) {
        nextLink = `${BASE_URL}${data.result._links.next}`;
      }

      return {
        horarios,
        nextLink,
      };
    } else {
      throw new Error('Nenhum horário encontrado.');
    }
  } catch (error) {
    throw new Error('Erro ao consultar horários.');
  }
};

export default consultarHorariosAPI;
