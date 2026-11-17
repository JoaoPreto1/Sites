import { randomUUID } from 'node:crypto';

// Guarda tudo em memória. Para usar uma base de dados basta reescrever
// esta função mantendo os mesmos métodos (todos devolvem Promises).
export function createRepository(initialItems = []) {
  const items = new Map(initialItems.map((item) => [item.id, structuredClone(item)]));
  const copy = (item) => (item ? structuredClone(item) : null);

  return {
    async findAll(filter = () => true) {
      return [...items.values()].filter(filter).map(copy);
    },

    async findById(id) {
      return copy(items.get(id));
    },

    async findOne(predicate) {
      return copy([...items.values()].find(predicate));
    },

    async create(data) {
      const item = { id: randomUUID(), createdAt: new Date().toISOString(), ...data };
      items.set(item.id, item);
      return copy(item);
    },

    async update(id, changes) {
      const current = items.get(id);
      if (!current) return null;
      const updated = { ...current, ...changes, updatedAt: new Date().toISOString() };
      items.set(id, updated);
      return copy(updated);
    },

    async remove(id) {
      return items.delete(id);
    },
  };
}
