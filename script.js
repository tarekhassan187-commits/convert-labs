// Section toggle
function showSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
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
