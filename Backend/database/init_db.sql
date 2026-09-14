-- Suppression de l'ancienne base
USE omnisave;

DROP TABLE IF EXISTS lien_tag;
DROP TABLE IF EXISTS lien;
DROP TABLE IF EXISTS message_contact;
DROP TABLE IF EXISTS utilisateur;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS categorie;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS lexicon_suggestion;

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
    pseudo VARCHAR(50) UNIQUE,
    photo_profil VARCHAR(255),
    pays VARCHAR(100),
    fast_save BOOLEAN DEFAULT FALSE,
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

-- 2. Link table (Removed the 'categorie_id' column)
CREATE TABLE lien (
    url_id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(1024) NOT NULL,
    titre_url VARCHAR(255),
    url_miniature VARCHAR(1024),
    plateforme VARCHAR(50),
    date_sauvegarde DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut_analyse VARCHAR(50) DEFAULT 'PENDING',
    utilisateur_id INT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(utilisateur_id)
) ENGINE=InnoDB;

-- 3. NEW: Junction table for Many-to-Many relationship (Max 5 categories per link)
CREATE TABLE lien_categorie (
    url_id INT NOT NULL,
    categorie_id INT NOT NULL,
    PRIMARY KEY (url_id, categorie_id),
    FOREIGN KEY (url_id) REFERENCES lien(url_id) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES categorie(categorie_id) ON DELETE CASCADE
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
-- Table for storing community lexicon suggestions
-- --------------------------------------------------------
CREATE TABLE lexicon_suggestion (
    suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100) NOT NULL,
    proposed_category VARCHAR(50) NOT NULL,
    occurrences INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    suggestion_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Prevents duplicate words in the same category
    UNIQUE KEY unq_word_category (word, proposed_category)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Insertion des données de référence (Seed Data)
-- --------------------------------------------------------
INSERT INTO role (role_id, nom_role) VALUES
(1, 'Utilisateur'),
(2, 'Administrateur');

-- Ajout des 3 catégories par défaut
INSERT INTO categorie (titre_categorie, description_categorie) VALUES
('Cooking', 'Contenu culinaire et recettes'),
('Sport', 'Activités physiques et sportives'),
('Finance', 'Économie et gestion de budget');

INSERT INTO categorie (titre_categorie)
VALUES ('sports'), ('tech'), ('gaming');

INSERT INTO role (nom_role) VALUES ('Membre');

INSERT INTO utilisateur (email, password, role_id)
VALUES ('anthony@omnisave.test', 'Motdepasse123@', 1);

-- 1. Un mot qui atteint le niveau 1 (5+ occurrences) pour une NOUVELLE catégorie
INSERT INTO lexicon_suggestion (word, proposed_category, occurrences)
VALUES ('pixel', 'gaming', 6);

-- 2. Un mot qui atteint le niveau 2 (10+ occurrences) pour une NOUVELLE catégorie
INSERT INTO lexicon_suggestion (word, proposed_category, occurrences)
VALUES ('console', 'gaming', 12);

-- 3. Un mot qui atteint le niveau 3 (20+ occurrences) pour une catégorie EXISTANTE
INSERT INTO lexicon_suggestion (word, proposed_category, occurrences)
VALUES ('esport', 'sports', 25);