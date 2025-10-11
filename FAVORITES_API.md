# API des Favoris - Documentation

## Vue d'ensemble

Le système de favoris permet aux utilisateurs de marquer des campagnes comme favorites et de les retrouver facilement. Tous les endpoints de campagnes incluent maintenant le champ `isFavoris` pour indiquer si une campagne est dans les favoris de l'utilisateur connecté.

## Endpoints disponibles

### 1. Toggle Favoris (Recommandé)

**POST** `/campaigns/:id/toggle-favorite`

Basculer le statut favori d'une campagne. Si la campagne est déjà dans les favoris, elle sera retirée, sinon elle sera ajoutée.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "isFavoris": true,
  "message": "Campagne ajoutée aux favoris"
}
```

### 2. Ajouter aux Favoris

**POST** `/campaigns/:id/favorite`

Ajouter une campagne aux favoris.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Campagne ajoutée aux favoris"
}
```

### 3. Retirer des Favoris

**DELETE** `/campaigns/:id/favorite`

Retirer une campagne des favoris.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Campagne retirée des favoris"
}
```

### 4. Mes Favoris

**GET** `/favorites/my-favorites`

Récupérer toutes les campagnes favorites de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optionnel): Numéro de page (défaut: 1)
- `limit` (optionnel): Nombre d'éléments par page (défaut: 10)

**Réponse:**
```json
{
  "data": [
    {
      "id": "campaign_id",
      "title": "Titre de la campagne",
      "description": "Description...",
      "isFavoris": true,
      // ... autres champs de la campagne
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### 5. Toggle Favoris (Module dédié)

**POST** `/favorites/toggle/:campaignId`

Alternative au toggle dans le module campagnes.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "isFavoris": true,
  "message": "Campagne ajoutée aux favoris"
}
```

## Endpoints de Campagnes Modifiés

Tous les endpoints de campagnes incluent maintenant le champ `isFavoris` :

### GET `/campaigns`
Liste toutes les campagnes avec `isFavoris` pour l'utilisateur connecté.

### GET `/campaigns/:id`
Détail d'une campagne avec `isFavoris` pour l'utilisateur connecté.

### GET `/campaigns/my-campaigns`
Campagnes de l'utilisateur connecté avec `isFavoris`.

## Structure de la Base de Données

La table `favorites` contient :
- `id`: Identifiant unique
- `userId`: ID de l'utilisateur
- `campaignId`: ID de la campagne
- `createdAt`: Date de création
- Contrainte unique sur `(userId, campaignId)`

## Gestion des Erreurs

### 404 - Campagne non trouvée
```json
{
  "statusCode": 404,
  "message": "Campagne non trouvée"
}
```

### 409 - Déjà dans les favoris
```json
{
  "statusCode": 409,
  "message": "Cette campagne est déjà dans vos favoris"
}
```

### 404 - Pas dans les favoris
```json
{
  "statusCode": 404,
  "message": "Cette campagne n'est pas dans vos favoris"
}
```

## Exemple d'utilisation Frontend

```javascript
// Toggle favoris
const toggleFavorite = async (campaignId) => {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/toggle-favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Favori togglé:', result.isFavoris);
    return result;
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Récupérer les favoris
const getMyFavorites = async () => {
  try {
    const response = await fetch('/api/favorites/my-favorites', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## Notes Importantes

1. **Authentification requise** : Tous les endpoints de favoris nécessitent une authentification JWT.

2. **Champ isFavoris** : Le champ `isFavoris` est automatiquement ajouté à toutes les réponses de campagnes si un utilisateur est connecté.

3. **Performance** : Les requêtes de favoris sont optimisées avec des index sur `(userId, campaignId)`.

4. **Cascade** : La suppression d'un utilisateur ou d'une campagne supprime automatiquement les favoris associés.

5. **Toggle recommandé** : L'endpoint `toggle-favorite` est recommandé car il gère automatiquement l'ajout et la suppression.
