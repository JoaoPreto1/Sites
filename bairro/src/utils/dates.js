const lisbon = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' });

// O estúdio é no Porto: "hoje" e "este mês" contam na hora de Portugal
export const lisbonToday = (date = new Date()) => lisbon.format(date);

export const lisbonMonth = (date = new Date()) => lisbonToday(date).slice(0, 7);
