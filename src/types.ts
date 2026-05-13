export type SphereType = 'atmosphere' | 'geosphere' | 'hydrosphere' | 'biosphere' | 'exosphere';

export interface EarthComponent {
  id: string;
  name: string;
  category: SphereType;
  description: string;
}

export interface InteractionExample {
  from: SphereType;
  to: SphereType;
  title: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
