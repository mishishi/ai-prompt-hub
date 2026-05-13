export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  spawnCopyParticles();
}

function spawnCopyParticles() {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'copy-particle';
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 30 + Math.random() * 20;
    particle.style.setProperty('--px', Math.cos(angle) * distance + 'px');
    particle.style.setProperty('--py', Math.sin(angle) * distance + 'px');
    particle.style.left = '50%';
    particle.style.top = '50%';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 500);
  }
}
