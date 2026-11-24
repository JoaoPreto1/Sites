// A luz que respira: um shader de ecrã inteiro, desenhado a metade da resolução
// para ser leve. Cada página escolhe o tom em <canvas data-tom="...">.
const TONS = {
  violeta: [[.08, .06, .16], [.45, .26, .75], [1, .62, .45], [1, .85, .55]],
  aurora: [[.04, .08, .14], [.16, .42, .62], [.55, .9, .78], [.85, .95, 1]],
  ambar: [[.12, .06, .05], [.62, .28, .18], [1, .72, .42], [1, .9, .66]],
  noite: [[.03, .04, .12], [.2, .24, .6], [.62, .5, .95], [.9, .86, 1]],
  rosa: [[.12, .05, .1], [.58, .22, .45], [1, .6, .62], [1, .86, .7]],
};

const FRAG = `precision mediump float;
uniform vec2 r; uniform float t; uniform float b; uniform vec2 mo;
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.03; a *= .5; } return v; }
void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * r) / r.y;
  float d = length(uv - mo * .3);
  vec2 q = vec2(fbm(uv * 1.6 + t * .05), fbm(uv * 1.6 - t * .04 + 3.1));
  float f = fbm(uv * 1.2 + q * 1.8 + t * .03);
  float glow = smoothstep(.55 + b * .14, 0., d);
  vec3 col = mix(c0, c1, smoothstep(.2, .8, f));
  col = mix(col, c2, smoothstep(.45, .95, f * q.x * 1.6) * .8);
  col += c3 * glow * (.3 + b * .3);
  col += (h(gl_FragCoord.xy + t) - .5) * .03;
  gl_FragColor = vec4(col, 1.);
}`;

export function iniciarLuz(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (k) => gl.getUniformLocation(pr, k);
  const tom = TONS[canvas.dataset.tom] || TONS.violeta;
  ['c0', 'c1', 'c2', 'c3'].forEach((k, i) => gl.uniform3fv(U(k), tom[i]));

  const quieto = matchMedia('(prefers-reduced-motion: reduce)');
  const escala = .5;
  function medir() {
    canvas.width = Math.round(innerWidth * escala); canvas.height = Math.round(innerHeight * escala);
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(U('r'), canvas.width, canvas.height);
  }
  medir();
  addEventListener('resize', medir);

  let mo = [0, 0], fora = null, ultimo = 0;
  addEventListener('pointermove', (e) => (mo = [e.clientX / innerWidth - .5, .5 - e.clientY / innerHeight]), { passive: true });
  // a página de respirar manda o ritmo; nas outras a luz respira sozinha (8 s por ciclo)
  addEventListener('folego:respira', (e) => (fora = e.detail));
  const inicio = performance.now() - 2000;

  function desenhar(agora) {
    if (agora - ultimo > 33 || quieto.matches) {
      ultimo = agora;
      const t = (agora - inicio) / 1000;
      const b = fora ?? (quieto.matches ? .5 : (Math.sin(t / 8 * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      gl.uniform1f(U('t'), quieto.matches ? 12 : t); gl.uniform1f(U('b'), b); gl.uniform2f(U('mo'), mo[0], mo[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!quieto.matches && !document.hidden) requestAnimationFrame(desenhar);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(desenhar); });
  quieto.addEventListener('change', () => requestAnimationFrame(desenhar));
  requestAnimationFrame(desenhar);
  canvas.classList.add('acesa');
  return true;
}
