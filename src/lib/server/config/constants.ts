export const API_MESSAGES = {
  INVALID_DATA: 'Données invalides',
  SERVER_ERROR: 'Erreur interne du serveur',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  
  PRODUCT_NOT_FOUND: 'Produit non trouvé',
  PRODUCT_ALREADY_PURCHASED: 'Produit déjà acheté',
  PRODUCT_CREATION_FAILED: 'Échec de la création du produit',
  PRODUCT_UPDATE_FAILED: 'Échec de la mise à jour du produit',
  PRODUCT_DELETE_FAILED: 'Échec de la suppression du produit',
  
  USED_BOARD_NOT_FOUND: 'Planche d\'occasion non trouvée',
  USED_BOARD_ALREADY_USED: 'Cette planche est déjà utilisée pour un produit',
  USED_BOARD_CREATION_FAILED: 'Échec de la création de la planche',
  USED_BOARD_UPDATE_FAILED: 'Échec de la mise à jour de la planche',
  USED_BOARD_DELETE_FAILED: 'Échec de la suppression de la planche',
  
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  INSUFFICIENT_POINTS: 'Points insuffisants',
  
  IMAGE_UPLOAD_FAILED: 'Échec de l\'upload des images',
  IMAGE_VALIDATION_FAILED: 'Validation des images échouée',
  IMAGE_DELETE_FAILED: 'Échec de la suppression des images',
  AT_LEAST_ONE_IMAGE_REQUIRED: 'Au moins une image est requise',
  
  PRODUCT_CREATED: 'Produit créé avec succès',
  PRODUCT_UPDATED: 'Produit mis à jour avec succès',
  PRODUCT_DELETED: 'Produit supprimé avec succès',
  PRODUCT_PURCHASED: 'Produit acheté avec succès',
  USED_BOARD_CREATED: 'Planche créée avec succès',
  USED_BOARD_UPDATED: 'Planche mise à jour avec succès',
  USED_BOARD_DELETED: 'Planche supprimée avec succès'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const

// TODO : mettre en place pagination côté back -> catalogue et dashboard
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100
} as const

export const POINTS_CONFIG = {
  recycling: {
    good: 100,
    average: 75,
    bad: 50
  },
  
  // TODO : réfléchir au systeme de points à mettre en place
  euroToPoints: 10,
  pointsToEuro: 0.1
} as const