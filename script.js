// Section toggle with fade animation
function showSection(id) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => {
    sec.classList.remove('visible');
    setTimeout(() => (sec.style.display = 'none'), 600); // fade out delay
  });

  const target = document.getElementById(id);
  setTimeout(() => {
    target.style.display = 'block';
    setTimeout(() => target.classList.add('visible'), 50);
  }, 600);
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
