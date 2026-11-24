// Prestador de demonstração: não pede cartão, não contacta nenhum banco e não movimenta dinheiro.
// Leva a uma página do próprio site que diz claramente que é uma simulação.
export const demoProvider = {
  id: 'demo',
  label: 'Simulação (sem dinheiro real)',
  async createCheckout({ kind, id }) {
    return { reference: `demo-${id}`, redirectUrl: `/simulacao/${kind}/${id}` };
  },
};
