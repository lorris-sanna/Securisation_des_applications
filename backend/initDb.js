import { pool } from './db.js';

export const initDatabase = async () => {
  try {
    // Création des tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Departement (
        deptEmp INT PRIMARY KEY,
        mgrEmp VARCHAR(50) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Projet (
        nomProj VARCHAR(50) PRIMARY KEY,
        mgrProj VARCHAR(50) NOT NULL,
        budget DECIMAL(12, 2) NOT NULL,
        dateDebut DATE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Employe (
        idEmp VARCHAR(10) PRIMARY KEY,
        nomEmp VARCHAR(50) NOT NULL,
        salEmp DECIMAL(10, 2) NOT NULL,
        deptEmp INT,
        FOREIGN KEY (deptEmp) REFERENCES Departement(deptEmp) ON UPDATE CASCADE ON DELETE RESTRICT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Affectation (
        nomProj VARCHAR(50),
        idEmp VARCHAR(10),
        heures INT NOT NULL,
        evalEmp INT NULL,
        PRIMARY KEY (nomProj, idEmp),
        FOREIGN KEY (nomProj) REFERENCES Projet(nomProj) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (idEmp) REFERENCES Employe(idEmp) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Insertion des données (INSERT IGNORE pour éviter les doublons au redémarrage)
    await pool.query(`
      INSERT IGNORE INTO Departement (deptEmp, mgrEmp) VALUES
        (10, 'Holmes'),
        (12, 'Lupin');
    `);

    await pool.query(`
      INSERT IGNORE INTO Projet (nomProj, mgrProj, budget, dateDebut) VALUES
        ('ILO', 'Dupont', 100000.00, '2011-11-15'),
        ('MAXI', 'Jones', 200000.00, '2012-01-03');
    `);

    await pool.query(`
      INSERT IGNORE INTO Employe (idEmp, nomEmp, salEmp, deptEmp) VALUES
        ('E101', 'Durand', 45000.00, 10),
        ('E105', 'Adam',   43000.00, 12),
        ('E110', 'Rivera', 41000.00, 10);
    `);

    await pool.query(`
      INSERT IGNORE INTO Affectation (nomProj, idEmp, heures, evalEmp) VALUES
        ('ILO', 'E101', 25, 9),
        ('ILO', 'E105', 39, NULL),
        ('ILO', 'E110', 10, 8),
        ('MAXI', 'E110', 29, NULL);
    `);

    console.log('Base de données MySQL initialisée avec succès.');
  } catch (err) {
    console.error("Erreur d'initialisation MySQL :", err.message);
  }
};