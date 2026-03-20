// Mock books data for development

import { AllWorksDTO } from '@/interfaces/interfaces';

export const mockBooks: AllWorksDTO[] = [
  {
    id: 1,
    title: 'Манас',
    description: 'Кыргыз элинин баатырдык эпосу',
    authorName: 'Элдик',
    genres: [{ id: 1, name: 'Эпос' }],
    imageUrl: undefined,
  },
  {
    id: 2,
    title: 'Семетей',
    description: 'Манас эпосунун уландысы',
    authorName: 'Элдик',
    genres: [{ id: 1, name: 'Эпос' }],
    imageUrl: undefined,
  },
  {
    id: 3,
    title: 'Сейтек',
    description: 'Манас эпосунун уландысы',
    authorName: 'Элдик',
    genres: [{ id: 1, name: 'Эпос' }],
    imageUrl: undefined,
  },
];

