document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('actionBtn');
  const output = document.getElementById('output');

  actionBtn.addEventListener('click', () => {
    output.textContent = '¡Listos para el hackathon! 🚀';
  });

  console.log('Proyecto cargado correctamente');
});
