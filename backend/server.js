import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { initDatabase } from './initDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initDatabase();

// --- VUE GLOBALE ---
app.get('/api/vue-complete', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.nomProj,
        p.mgrProj,
        e.idEmp,
        a.heures,
        e.nomEmp,
        p.budget,
        DATE_FORMAT(p.dateDebut, '%d/%m/%Y') AS dateDebut,
        e.salEmp,
        d.mgrEmp,
        d.deptEmp,
        a.evalEmp
      FROM Affectation a
      JOIN Projet p ON a.nomProj = p.nomProj
      JOIN Employe e ON a.idEmp = e.idEmp
      JOIN Departement d ON e.deptEmp = d.deptEmp
      ORDER BY p.nomProj, e.idEmp;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROJETS ---
app.get('/api/projets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Projet ORDER BY nomProj');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projets', async (req, res) => {
  const { nomProj, mgrProj, budget, dateDebut } = req.body;
  if (!nomProj || !mgrProj || !budget || !dateDebut) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  try {
    await pool.query(
      'INSERT INTO Projet (nomProj, mgrProj, budget, dateDebut) VALUES (?, ?, ?, ?)',
      [nomProj.trim().toUpperCase(), mgrProj.trim(), budget, dateDebut]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: `Le projet "${nomProj}" existe déjà.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- DÉPARTEMENTS ---
app.get('/api/departements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Departement ORDER BY deptEmp');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departements', async (req, res) => {
  const { deptEmp, mgrEmp } = req.body;
  if (!deptEmp || !mgrEmp) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  try {
    await pool.query(
      'INSERT INTO Departement (deptEmp, mgrEmp) VALUES (?, ?)',
      [Number(deptEmp), mgrEmp.trim()]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: `Le département n°${deptEmp} existe déjà.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- EMPLOYÉS ---
app.get('/api/employes', async (req, res) => {
  try {
    const query = `
      SELECT e.idEmp, e.nomEmp, e.salEmp, e.deptEmp, d.mgrEmp 
      FROM Employe e
      JOIN Departement d ON e.deptEmp = d.deptEmp
      ORDER BY e.idEmp
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employes', async (req, res) => {
  const { idEmp, nomEmp, salEmp, deptEmp } = req.body;
  if (!idEmp || !nomEmp || !salEmp || !deptEmp) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  try {
    await pool.query(
      'INSERT INTO Employe (idEmp, nomEmp, salEmp, deptEmp) VALUES (?, ?, ?, ?)',
      [idEmp.trim().toUpperCase(), nomEmp.trim(), salEmp, deptEmp]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: `L'identifiant "${idEmp}" est déjà utilisé.` });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- AFFECTATIONS ---
app.get('/api/affectations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Affectation');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/affectations', async (req, res) => {
  const { nomProj, idEmp, heures, evalEmp } = req.body;
  if (!nomProj || !idEmp || !heures) {
    return res.status(400).json({ error: 'Projet, collaborateur et heures sont requis.' });
  }
  try {
    await pool.query(
      'INSERT INTO Affectation (nomProj, idEmp, heures, evalEmp) VALUES (?, ?, ?, ?)',
      [nomProj, idEmp, heures, evalEmp !== undefined && evalEmp !== '' ? evalEmp : null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ce collaborateur est déjà assigné à ce projet.' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});