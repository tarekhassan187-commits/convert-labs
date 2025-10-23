// Section toggle with fade animation and active nav button
function showSection(id, btn) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => {
    sec.classList.remove('visible');
    setTimeout(() => (sec.style.display = 'none'), 600);
  });

  const target = document.getElementById(id);
  setTimeout(() => {
    target.style.display = 'block';
    setTimeout(() => target.classList.add('visible'), 50);
  }, 600);

  // Highlight the active nav button
  document.querySelectorAll('#nav-buttons button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Visitor counter
fetch('https://api.countapi.xyz/hit/convertlabs.online/visits')
  .then(response => response.json())
  .then(data => {
    document.getElementById('visit-count').textContent = data.value.toLocaleString();
  })
  .catch(() => {
    document.getElementById('visit-count').textContent = 'N/A';
  });
