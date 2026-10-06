export const plans = [
  {
    key: 'startup',
    catalogKey: 'starter',
    name: 'Starter',
    emoji: '🥉',
    regularPrice: 49,
    price: 29,
    discount: 40,
    blueprintCount: 15,
    blueprintAccessCount: 15,
    audience: 'Solo devs, side-projects, étudiants',
    limits: ['1 application', '15 blueprints', '1 cluster', '50k requêtes/mois']
  },
  {
    key: 'scale-up',
    catalogKey: 'scale-up',
    name: 'Scale-up',
    emoji: '🥈',
    regularPrice: 99,
    price: 79,
    discount: 20,
    blueprintCount: 20,
    blueprintAccessCount: 35,
    audience: 'Startups, freelances pro, PME',
    limits: ['3 applications', '35 blueprints accessibles', '3 clusters', '500k requêtes/mois']
  },
  {
    key: 'enterprise',
    catalogKey: 'enterprise',
    name: 'Enterprise',
    emoji: '🥇',
    regularPrice: 199,
    price: 169,
    discount: 15,
    blueprintCount: 15,
    blueprintAccessCount: 50,
    audience: 'ETI, grands comptes, secteurs régulés',
    limits: ['Applications illimitées', '50 blueprints accessibles', 'Clusters illimités', 'Requêtes illimitées']
  }
];
