-- Suppression de l'ancienne base
USE omnisave;

DROP TABLE IF EXISTS lien_tag;
DROP TABLE IF EXISTS lien;
DROP TABLE IF EXISTS message_contact;
DROP TABLE IF EXISTS utilisateur;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS categorie;
DROP TABLE IF EXISTS role;

-- 1. Tables indépendantes

CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    nom_role VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE categorie (
    categorie_id INT AUTO_INCREMENT PRIMARY KEY,
    titre_categorie VARCHAR(50) NOT NULL,
    description_categorie VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE tag (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_libelle VARCHAR(50) NOT NULL
) ENGINE=InnoDB;


-- 2. Tables de premier niveau d'héritage

CREATE TABLE utilisateur (
    utilisateur_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    prenom VARCHAR(50),
    nom VARCHAR(50),
    pays VARCHAR(100),
    est_actif BOOLEAN DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
) ENGINE=InnoDB;


-- 3. Tables de second niveau d'héritage

CREATE TABLE message_contact (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    motif VARCHAR(100) NOT NULL,
    description_contact TEXT NOT NULL,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    est_lu BOOLEAN DEFAULT FALSE,
    utilisateur_id INT NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id)
) ENGINE=InnoDB;

CREATE TABLE lien (
    url_id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(1024) NOT NULL,
    titre_url VARCHAR(255),
    url_miniature VARCHAR(1024),
    plateforme VARCHAR(50),
    date_sauvegarde DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut_analyse VARCHAR(50) DEFAULT 'PENDING',
    categorie_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie(categorie_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id)
) ENGINE=InnoDB;


-- 4. Table de jointure

CREATE TABLE lien_tag (
    tag_id INT NOT NULL,
    url_id INT NOT NULL,
    PRIMARY KEY (tag_id, url_id),
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE,
    FOREIGN KEY (url_id) REFERENCES lien(url_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Insertion des données de référence (Seed Data)
-- --------------------------------------------------------
INSERT INTO role (role_id, nom_role) VALUES
(1, 'Utilisateur'),
(2, 'Administrateur');

-- Ajout des 3 catégories par défaut
INSERT INTO categorie (titre_categorie, description_categorie) VALUES
('Cuisine', 'Contenu culinaire et recettes'),
('Sport', 'Activités physiques et sportives'),
('Finance', 'Économie et gestion de budget');