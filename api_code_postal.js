const cpInput = document.getElementById("cp-input");
const communeSelect = document.getElementById("commune-select");
const submitBtn = document.getElementById("submit-btn");

const GEO_API_URL = "https://geo.api.gouv.fr/communes";

async function fetchCommunes(codePostal) {
  const url = `${GEO_API_URL}?codePostal=${codePostal}&fields=nom,code,centre&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erreur réseau lors de la récupération des communes.");
  return response.json();
}

function resetSelect(message = "-- Saisissez d'abord un code postal --") {
  communeSelect.innerHTML = `<option value="">${message}</option>`;
  communeSelect.disabled = true;
  submitBtn.disabled = true;
}

function populateSelect(communes) {
  communeSelect.innerHTML = '<option value="">-- Choisissez une commune --</option>';

  communes.forEach((commune) => {
    const option = document.createElement("option");
    option.value = commune.code;
    option.textContent = commune.nom;
    option.dataset.lat = commune.centre?.coordinates[1] ?? "";
    option.dataset.lon = commune.centre?.coordinates[0] ?? "";
    communeSelect.appendChild(option);
  });

  communeSelect.disabled = false;
}

cpInput.addEventListener("input", async () => {
  const codePostal = cpInput.value.trim();

  if (!/^\d{5}$/.test(codePostal)) {
    resetSelect();
    return;
  }

  resetSelect("Chargement...");

  try {
    const communes = await fetchCommunes(codePostal);

    if (communes.length === 0) {
      resetSelect("Aucune commune trouvée");
      return;
    }

    populateSelect(communes);
  } catch {
    resetSelect("Erreur lors du chargement");
  }
});

communeSelect.addEventListener("change", () => {
  submitBtn.disabled = communeSelect.value === "";
});
