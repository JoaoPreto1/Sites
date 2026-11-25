// Descarrega as fotografias do Unsplash em webp, já recortadas a 4:3, em três larguras (480, 800 e 1200).
// Uso: npm run fotos   (só é preciso correr uma vez; as imagens ficam em public/img/fotos)
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../public/img/fotos/', import.meta.url));
mkdirSync(dir, { recursive: true });

// nome local → identificador da fotografia no Unsplash
export const FOTOS = {
  falesia: '1569406829354-eb0cc9e653e8', costa: '1579550229847-676fa238ec46', praia: '1759881585824-87f187cd4cb1',
  pordosol: '1773434537544-c1c77fbd1891', veleiro: '1526761122248-c31c93f8b2b9', baia: '1627826676942-576ea238e0cc',
  qmar: '1695259496167-c05f25f1d793', qcadeiras: '1694350639569-6706d403a30d', qbranco: '1612152605347-f93296cb657d',
  qmadeira: '1639678349557-ffe5bed73ce7', quarto: '1771611186938-39a6b934f2f6', qazulejo: '1667125095636-dce94dcbdd96',
  qescuro: '1757417983938-2c2a931d41aa', arcosbrancos: '1617048400527-e6ab223281e1', sala: '1631679706909-1844bbd07221',
  terraco: '1705095605806-4b2936e90471', terraco2: '1760067538559-49b2bfb5f42a', rosas: '1716667282987-c03452d43181',
  piscina: '1651108066220-f61c22fc281f', banho: '1781344334947-60c704bafd51', banho2: '1718894070021-5d24d72a5437',
  lencois: '1552558636-f6a8f071c2b3', cocktail: '1514362545857-3bc16c4c7d1b', mesa: '1764236307312-6ead0505ad3a',
  prato: '1656937969203-0e13eb484b86', cafe: '1760175445000-0e01e193d1cd', pasteis: '1591107576521-87091dc07797',
  petiscos: '1782174177406-d36704027953', jantar: '1768497262022-2afdf6b1266f', massagem: '1768507423533-b87b62769758',
};

for (const [nome, id] of Object.entries(FOTOS)) {
  for (const w of [480, 800, 1200]) {
    const file = `${dir}${nome}-${w}.webp`;
    if (existsSync(file) && !process.env.REFAZER) continue;
    const url = `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round((w * 3) / 4)}&fit=crop&fm=webp&q=${w > 800 ? 50 : w > 480 ? 55 : 60}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${nome}: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  console.log('ok', nome);
}
// Imagem de partilha (1200 × 630)
const og = await fetch(`https://images.unsplash.com/photo-${FOTOS.falesia}?w=1200&h=630&fit=crop&fm=jpg&q=78`);
writeFileSync(fileURLToPath(new URL('../public/img/og.jpg', import.meta.url)), Buffer.from(await og.arrayBuffer()));
