import { api } from '../api.js';
import { serviceCard } from '../service-card.js';

const root = document.querySelector('[data-services]');

// Os cartões já vêm do servidor; só os desenha aqui se a página tiver sido aberta sem eles
if (!root.querySelector('.service-card')) {
  try {
    const { services } = await api('/services');
    root.innerHTML = services.map(serviceCard).join('');
  } catch {
    root.innerHTML = '<p class="empty">Não foi possível carregar os serviços.</p>';
  }
}
