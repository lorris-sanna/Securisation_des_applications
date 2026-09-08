<template>
  <div class="app-container">
    <header>
      <h1>Tableau de bord des projets</h1>
      <p class="subtitle">Gestion opérationnelle des équipes, des départements et des projets</p>
    </header>

    <!-- Navigation principale -->
    <nav class="tabs">
      <button 
        :class="{ active: currentTab === 'vue-globale' }" 
        @click="currentTab = 'vue-globale'">
        Vue d'ensemble
      </button>
      <button 
        :class="{ active: currentTab === 'donnees' }" 
        @click="currentTab = 'donnees'">
        Gestion des données
      </button>
      <button 
        :class="{ active: currentTab === 'creation' }" 
        @click="currentTab = 'creation'">
        + Nouvel élément
      </button>
    </nav>

    <!-- Zone principale à disposition fixe -->
    <main class="content-wrapper">
      <!-- 1. Vue d'ensemble -->
      <section v-if="currentTab === 'vue-globale'" class="card full-width">
        <div class="card-header">
          <h2>Planning des affectations</h2>
          <button class="btn-refresh" @click="fetchAllData">Actualiser</button>
        </div>

        <div v-if="loading" class="state-msg">Chargement des données...</div>
        <div v-else-if="vueComplete.length === 0" class="state-msg">Aucune affectation enregistrée.</div>
        <div v-else class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Projet</th>
                <th>Responsable projet</th>
                <th>ID</th>
                <th>Collaborateur</th>
                <th>Temps alloué</th>
                <th>Budget projet</th>
                <th>Lancement</th>
                <th>Salaire</th>
                <th>Manager dép.</th>
                <th>Département</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in vueComplete" :key="idx">
                <td><strong>{{ row.nomProj }}</strong></td>
                <td>{{ row.mgrProj }}</td>
                <td><code>{{ row.idEmp }}</code></td>
                <td>{{ row.nomEmp }}</td>
                <td><span class="badge badge-heures">{{ row.heures }} h</span></td>
                <td>{{ Number(row.budget).toLocaleString('fr-FR') }} €</td>
                <td>{{ row.dateDebut }}</td>
                <td>{{ Number(row.salEmp).toLocaleString('fr-FR') }} €</td>
                <td>{{ row.mgrEmp }}</td>
                <td>Département {{ row.deptEmp }}</td>
                <td>
                  <span v-if="row.evalEmp !== null" class="badge badge-eval">{{ row.evalEmp }} / 10</span>
                  <span v-else class="text-muted">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 2. Gestion des données -->
      <section v-if="currentTab === 'donnees'" class="grid-tables">
        <div class="card">
          <h3>Projets ({{ projets.length }})</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Responsable</th>
                  <th>Budget</th>
                  <th>Date de début</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in projets" :key="p.nomProj">
                  <td><strong>{{ p.nomProj }}</strong></td>
                  <td>{{ p.mgrProj }}</td>
                  <td>{{ Number(p.budget).toLocaleString('fr-FR') }} €</td>
                  <td>{{ new Date(p.dateDebut).toLocaleDateString('fr-FR') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3>Départements ({{ departements.length }})</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in departements" :key="d.deptEmp">
                  <td><strong>Département {{ d.deptEmp }}</strong></td>
                  <td>{{ d.mgrEmp }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3>Collaborateurs ({{ employes.length }})</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Identifiant</th>
                  <th>Nom</th>
                  <th>Rémunération</th>
                  <th>Département</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in employes" :key="e.idEmp">
                  <td><code>{{ e.idEmp }}</code></td>
                  <td>{{ e.nomEmp }}</td>
                  <td>{{ Number(e.salEmp).toLocaleString('fr-FR') }} €</td>
                  <td>Département {{ e.deptEmp }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3>Affectations ({{ affectations.length }})</h3>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Collaborateur</th>
                  <th>Heures</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in affectations" :key="`${a.nomProj}-${a.idEmp}`">
                  <td><strong>{{ a.nomProj }}</strong></td>
                  <td><code>{{ a.idEmp }}</code></td>
                  <td>{{ a.heures }} h</td>
                  <td>{{ a.evalEmp !== null ? `${a.evalEmp} / 10` : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 3. Formulaires de création -->
      <section v-if="currentTab === 'creation'" class="card full-width">
        <div class="subtabs">
          <button :class="{ active: formType === 'affectation' }" @click="setFormType('affectation')">
            Affectation
          </button>
          <button :class="{ active: formType === 'projet' }" @click="setFormType('projet')">
            Nouveau Projet
          </button>
          <button :class="{ active: formType === 'employe' }" @click="setFormType('employe')">
            Nouveau Collaborateur
          </button>
          <button :class="{ active: formType === 'dept' }" @click="setFormType('dept')">
            Nouveau Département
          </button>
        </div>

        <div class="form-container">
          <!-- Formulaire Affectation -->
          <form v-if="formType === 'affectation'" @submit.prevent="submitAffectation">
            <h3>Assigner un collaborateur à un projet</h3>
            <div class="form-group">
              <label>Projet</label>
              <select v-model="formAffectation.nomProj" required>
                <option disabled value="">Sélectionner un projet</option>
                <option v-for="p in projets" :key="p.nomProj" :value="p.nomProj">
                  {{ p.nomProj }} (Responsable : {{ p.mgrProj }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Collaborateur</label>
              <select v-model="formAffectation.idEmp" required>
                <option disabled value="">Sélectionner un collaborateur</option>
                <option v-for="e in employes" :key="e.idEmp" :value="e.idEmp">
                  {{ e.nomEmp }} ({{ e.idEmp }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Heures allouées</label>
              <input type="number" v-model.number="formAffectation.heures" min="1" required />
            </div>

            <div class="form-group">
              <label>Évaluation sur le projet (optionnel, sur 10)</label>
              <input type="number" v-model.number="formAffectation.evalEmp" min="0" max="10" />
            </div>

            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Enregistrement...' : 'Valider l\'affectation' }}
            </button>
          </form>

          <!-- Formulaire Projet -->
          <form v-if="formType === 'projet'" @submit.prevent="submitProjet">
            <h3>Créer un nouveau projet</h3>
            <div class="form-group">
              <label>Code / Nom du projet</label>
              <input type="text" v-model="formProjet.nomProj" required />
            </div>

            <div class="form-group">
              <label>Responsable du projet</label>
              <input type="text" v-model="formProjet.mgrProj" required />
            </div>

            <div class="form-group">
              <label>Budget alloué (€)</label>
              <input type="number" step="1000" v-model.number="formProjet.budget" min="0" required />
            </div>

            <div class="form-group">
              <label>Date de lancement</label>
              <input type="date" v-model="formProjet.dateDebut" required />
            </div>

            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Création...' : 'Créer le projet' }}
            </button>
          </form>

          <!-- Formulaire Employé -->
          <form v-if="formType === 'employe'" @submit.prevent="submitEmploye">
            <h3>Ajouter un collaborateur</h3>
            <div class="form-group">
              <label>Identifiant unique</label>
              <input type="text" v-model="formEmploye.idEmp" required />
            </div>

            <div class="form-group">
              <label>Nom complet</label>
              <input type="text" v-model="formEmploye.nomEmp" required />
            </div>

            <div class="form-group">
              <label>Salaire annuel brut (€)</label>
              <input type="number" step="500" v-model.number="formEmploye.salEmp" min="0" required />
            </div>

            <div class="form-group">
              <label>Département de rattachement</label>
              <select v-model.number="formEmploye.deptEmp" required>
                <option disabled value="">Sélectionner un département</option>
                <option v-for="d in departements" :key="d.deptEmp" :value="d.deptEmp">
                  Département {{ d.deptEmp }} (Manager : {{ d.mgrEmp }})
                </option>
              </select>
            </div>

            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Ajout...' : 'Ajouter le collaborateur' }}
            </button>
          </form>

          <!-- Formulaire Département -->
          <form v-if="formType === 'dept'" @submit.prevent="submitDepartement">
            <h3>Ajouter un département</h3>
            <div class="form-group">
              <label>Numéro de département</label>
              <input type="number" v-model.number="formDept.deptEmp" min="1" required />
            </div>

            <div class="form-group">
              <label>Responsable du département</label>
              <select v-model="formDept.selectedMgr" required>
                <option disabled value="">Sélectionner un responsable</option>
                <option v-for="mgr in listeResponsables" :key="mgr" :value="mgr">
                  {{ mgr }}
                </option>
                <option value="__NEW__">+ Nouveau responsable (saisie manuelle)</option>
              </select>
            </div>

            <!-- Champ texte conditionnel si on choisit de saisir un nouveau nom -->
            <div v-if="formDept.selectedMgr === '__NEW__'" class="form-group">
              <label>Nom du nouveau responsable</label>
              <input type="text" v-model="formDept.customMgr" required />
            </div>

            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Création...' : 'Créer le département' }}
            </button>
          </form>

          <p v-if="feedbackMsg" :class="['feedback', feedbackStatus]">
            {{ feedbackMsg }}
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const currentTab = ref('vue-globale');
const formType = ref('affectation');
const loading = ref(true);
const submitting = ref(false);
const feedbackMsg = ref('');
const feedbackStatus = ref('');

const vueComplete = ref([]);
const projets = ref([]);
const employes = ref([]);
const departements = ref([]);
const affectations = ref([]);

const formAffectation = ref({ nomProj: '', idEmp: '', heures: null, evalEmp: null });
const formProjet = ref({ nomProj: '', mgrProj: '', budget: null, dateDebut: '' });
const formEmploye = ref({ idEmp: '', nomEmp: '', salEmp: null, deptEmp: '' });
const formDept = ref({ deptEmp: null, selectedMgr: '', customMgr: '' });

// Liste sans doublons de tous les managers et collaborateurs existants
const listeResponsables = computed(() => {
  const noms = new Set();
  departements.value.forEach(d => d.mgrEmp && noms.add(d.mgrEmp));
  projets.value.forEach(p => p.mgrProj && noms.add(p.mgrProj));
  employes.value.forEach(e => e.nomEmp && noms.add(e.nomEmp));
  return Array.from(noms).sort();
});

const setFormType = (type) => {
  formType.value = type;
  feedbackMsg.value = '';
};

const fetchAllData = async () => {
  loading.value = true;
  try {
    const [resVue, resProj, resEmp, resDept, resAff] = await Promise.all([
      axios.get(`${API_BASE}/vue-complete`),
      axios.get(`${API_BASE}/projets`),
      axios.get(`${API_BASE}/employes`),
      axios.get(`${API_BASE}/departements`),
      axios.get(`${API_BASE}/affectations`)
    ]);

    vueComplete.value = resVue.data;
    projets.value = resProj.data;
    employes.value = resEmp.data;
    departements.value = resDept.data;
    affectations.value = resAff.data;
  } catch (err) {
    console.error('Erreur API :', err);
    feedbackMsg.value = 'Impossible de joindre le serveur API.';
    feedbackStatus.value = 'error';
  } finally {
    loading.value = false;
  }
};

const submitAffectation = async () => {
  submitting.value = true;
  feedbackMsg.value = '';
  try {
    await axios.post(`${API_BASE}/affectations`, formAffectation.value);
    feedbackStatus.value = 'success';
    feedbackMsg.value = 'Affectation enregistrée avec succès.';
    formAffectation.value = { nomProj: '', idEmp: '', heures: null, evalEmp: null };
    await fetchAllData();
  } catch (err) {
    feedbackStatus.value = 'error';
    feedbackMsg.value = err.response?.data?.error || 'Erreur lors de l\'affectation.';
  } finally {
    submitting.value = false;
  }
};

const submitProjet = async () => {
  submitting.value = true;
  feedbackMsg.value = '';
  try {
    await axios.post(`${API_BASE}/projets`, formProjet.value);
    feedbackStatus.value = 'success';
    feedbackMsg.value = 'Projet créé avec succès.';
    formProjet.value = { nomProj: '', mgrProj: '', budget: null, dateDebut: '' };
    await fetchAllData();
  } catch (err) {
    feedbackStatus.value = 'error';
    feedbackMsg.value = err.response?.data?.error || 'Erreur lors de la création du projet.';
  } finally {
    submitting.value = false;
  }
};

const submitEmploye = async () => {
  submitting.value = true;
  feedbackMsg.value = '';
  try {
    await axios.post(`${API_BASE}/employes`, formEmploye.value);
    feedbackStatus.value = 'success';
    feedbackMsg.value = 'Collaborateur ajouté avec succès.';
    formEmploye.value = { idEmp: '', nomEmp: '', salEmp: null, deptEmp: '' };
    await fetchAllData();
  } catch (err) {
    feedbackStatus.value = 'error';
    feedbackMsg.value = err.response?.data?.error || 'Erreur lors de l\'ajout du collaborateur.';
  } finally {
    submitting.value = false;
  }
};

const submitDepartement = async () => {
  submitting.value = true;
  feedbackMsg.value = '';

  const manager = formDept.value.selectedMgr === '__NEW__' 
    ? formDept.value.customMgr 
    : formDept.value.selectedMgr;

  try {
    await axios.post(`${API_BASE}/departements`, {
      deptEmp: formDept.value.deptEmp,
      mgrEmp: manager
    });
    feedbackStatus.value = 'success';
    feedbackMsg.value = 'Département ajouté avec succès.';
    formDept.value = { deptEmp: null, selectedMgr: '', customMgr: '' };
    await fetchAllData();
  } catch (err) {
    feedbackStatus.value = 'error';
    feedbackMsg.value = err.response?.data?.error || 'Erreur lors de la création du département.';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchAllData();
});
</script>

<style>
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

html {
  scrollbar-gutter: stable;
}

body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg);
  color: var(--text);
}

.app-container {
  width: 1200px;
  max-width: 95vw;
  margin: 2rem auto;
  box-sizing: border-box;
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

h1 {
  font-size: 1.8rem;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.tabs {
  display: flex;
  justify-content: flex-start;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
  width: 100%;
}

.tabs button {
  background: none;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.tabs button.active {
  background-color: var(--primary);
  color: white;
}

.content-wrapper {
  width: 100%;
  display: block;
}

.card {
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  box-sizing: border-box;
  width: 100%;
}

.card.full-width {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-refresh {
  background-color: #e2e8f0;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-refresh:hover {
  background-color: #cbd5e1;
}

.grid-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
}

.table-responsive {
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

th {
  background-color: #f1f5f9;
  font-weight: 600;
}

code {
  background-color: #e2e8f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-heures {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-eval {
  background-color: #dcfce7;
  color: #166534;
}

.text-muted {
  color: var(--text-muted);
}

.form-container {
  max-width: 520px;
  margin: 0;
}

.subtabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  background-color: #f1f5f9;
  padding: 0.3rem;
  border-radius: 6px;
  max-width: 520px;
}

.subtabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
}

.subtabs button.active {
  background: white;
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

input, select {
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  box-sizing: border-box;
  font-size: 0.9rem;
}

.btn-submit {
  width: 100%;
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.feedback {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.feedback.success {
  background-color: #dcfce7;
  color: #166534;
}

.feedback.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.state-msg {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
</style>