-- Créer la table terms_of_service si elle n'existe pas
CREATE TABLE IF NOT EXISTS terms_of_service (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insérer une politique d'utilisation par défaut
INSERT INTO terms_of_service (title, content, version, "isActive")
VALUES (
    'Conditions d''utilisation - Tolotanana',
    '1. Acceptation des conditions

En accédant et en utilisant la plateforme Tolotanana, vous acceptez d''être lié par ces conditions d''utilisation.

2. Description du service

Tolotanana est une plateforme de crowdfunding qui permet aux utilisateurs de créer des campagnes de financement participatif et de faire des dons.

3. Utilisation de la plateforme

- Vous devez être âgé d''au moins 18 ans pour utiliser cette plateforme
- Vous êtes responsable de la véracité des informations fournies
- Vous vous engagez à utiliser la plateforme de manière légale et éthique

4. Campagnes de financement

- Les créateurs de campagnes sont responsables du contenu de leurs campagnes
- Les fonds collectés doivent être utilisés conformément aux objectifs déclarés
- Tolotanana se réserve le droit de suspendre ou supprimer toute campagne inappropriée

5. Dons et paiements

- Les dons sont irrévocables une fois effectués
- Les frais de transaction peuvent s''appliquer
- Les remboursements sont à la discrétion du créateur de campagne

6. Propriété intellectuelle

- Vous conservez les droits sur votre contenu original
- En publiant sur la plateforme, vous accordez à Tolotanana une licence d''utilisation

7. Limitation de responsabilité

Tolotanana ne peut être tenu responsable des actions des utilisateurs ou des résultats des campagnes.

8. Modification des conditions

Ces conditions peuvent être modifiées à tout moment. Les utilisateurs seront notifiés des changements importants.

9. Contact

Pour toute question concernant ces conditions, contactez-nous à l''adresse support@tolotanana.com.',
    '1.0',
    true
) ON CONFLICT DO NOTHING;
