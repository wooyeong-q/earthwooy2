import { EarthComponent, InteractionExample, SphereType } from './types';

export const SPHERES: Record<SphereType, { name: string; color: string; icon: string; description: string }> = {
  atmosphere: {
    name: '기권',
    color: 'bg-sky-100 border-sky-300 text-sky-800',
    icon: 'Cloud',
    description: '지구를 둘러싸고 있는 공기의 층',
  },
  geosphere: {
    name: '지권',
    color: 'bg-stone-100 border-stone-400 text-stone-800',
    icon: 'Mountain',
    description: '지표면과 지구 내부의 암석층',
  },
  hydrosphere: {
    name: '수권',
    color: 'bg-blue-100 border-blue-400 text-blue-800',
    icon: 'Droplets',
    description: '지구상의 모든 물 (바다, 강, 빙하 등)',
  },
  biosphere: {
    name: '생물권',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-800',
    icon: 'Leaf',
    description: '지구에 살고 있는 모든 생명체',
  },
  exosphere: {
    name: '외권',
    color: 'bg-slate-100 border-slate-400 text-slate-800',
    icon: 'Moon',
    description: '기권 바깥의 우주 공간',
  },
};

export const EARTH_COMPONENTS: EarthComponent[] = [
  { id: '1', name: '철광석', category: 'geosphere', description: '암석과 모래 등이 포함된 지권의 요소' },
  { id: '3', name: '소나무', category: 'biosphere', description: '광합성을 하며 자라는 생물' },
  { id: '4', name: '바닷물', category: 'hydrosphere', description: '지표면의 약 70%를 덮고 있는 물' },
  { id: '5', name: '구름', category: 'atmosphere', description: '대기 중의 수증기가 응결된 것' },
  { id: '6', name: '달', category: 'exosphere', description: '지구 주위를 도는 위성' },
  { id: '7', name: '산소', category: 'atmosphere', description: '생명 활동에 필요한 기체' },
  { id: '8', name: '빙하', category: 'hydrosphere', description: '꽁꽁 얼어 있는 수권의 거대한 물' },
  { id: '9', name: '토끼', category: 'biosphere', description: '산과 들에 구멍을 파고 사는 생물' },
  { id: '10', name: '태양빛', category: 'exosphere', description: '우주 공간을 통해 들어오는 빛 에너지' },
  { id: '11', name: '지하수', category: 'hydrosphere', description: '땅속을 흐르는 물' },
  { id: '12', name: '화강암', category: 'geosphere', description: '지각을 구성하는 단단한 암석' },
];

export const INTERACTIONS: InteractionExample[] = [
  { from: 'atmosphere', to: 'geosphere', title: '풍화 작용', description: '바람에 의해 암석이 깎여나가거나 부서짐' },
  { from: 'atmosphere', to: 'geosphere', title: '황사 현상', description: '기권의 먼지가 지표면으로 내려앉아 쌓임' },
  { from: 'hydrosphere', to: 'geosphere', title: '해안 절벽 형성', description: '파도에 의해 암석이 깎여 절벽이 만들어짐' },
  { from: 'hydrosphere', to: 'geosphere', title: '석회동굴 형성', description: '지하수가 석회암을 녹여 동굴을 만듦' },
  { from: 'geosphere', to: 'atmosphere', title: '화산 폭발', description: '화산이 터지면서 많은 화산재와 기체가 방출됨' },
  { from: 'geosphere', to: 'atmosphere', title: '먼지 날림', description: '지표면에서 강한 바람에 의해 먼지가 대기 중으로 상승함' },
  { from: 'biosphere', to: 'atmosphere', title: '광합성', description: '식물이 이산화 탄소를 흡수하고 산소를 내보냄' },
  { from: 'biosphere', to: 'atmosphere', title: '호흡 작용', description: '생물들이 산소를 마시고 이산화 탄소를 내뱉음' },
  { from: 'exosphere', to: 'geosphere', title: '운석 충돌', description: '우주 공간의 운석이 지표면에 떨어져 구덩이를 만듦' },
  { from: 'exosphere', to: 'geosphere', title: '태양풍 영향', description: '태양의 입자들이 지자기장에 영향을 줌' },
  { from: 'hydrosphere', to: 'atmosphere', title: '증발', description: '바닷물이 증발하여 수증기가 됨' },
  { from: 'hydrosphere', to: 'atmosphere', title: '강수 현상', description: '대기 중의 수증기가 비나 눈이 되어 다시 내려옴' },
  { from: 'geosphere', to: 'hydrosphere', title: '물 용해', description: '지층의 성분이 물에 녹아 바다로 흘러감' },
  { from: 'geosphere', to: 'hydrosphere', title: '화산섬 형성', description: '해저 화산 폭발로 육지가 만들어짐' },
  { from: 'biosphere', to: 'geosphere', title: '동물 서식', description: '두더지 등이 땅에 굴을 파서 지형을 변화시킴' },
  { from: 'biosphere', to: 'geosphere', title: '식물 뿌리', description: '식물의 뿌리가 암석 틈을 파고들어 암석을 부숨' },
  { from: 'biosphere', to: 'hydrosphere', title: '수질 정화', description: '부들 같은 수생 식물이 물속의 오염 물질을 흡수함' },
  { from: 'biosphere', to: 'hydrosphere', title: '산호초 형성', description: '산호가 바닷속에서 거대한 구조물을 만듦' },
  { from: 'atmosphere', to: 'hydrosphere', title: '해류 발생', description: '바람이 바다 표면을 불어 해류를 일으킴' },
  { from: 'atmosphere', to: 'hydrosphere', title: '태풍 발생', description: '기온 차이가 바다 위에서 강한 소용돌이를 만듦' },
  { from: 'exosphere', to: 'atmosphere', title: '오로라 현상', description: '우주 입자가 대기권과 충돌하여 빛을 냄' },
  { from: 'exosphere', to: 'atmosphere', title: '유성우', description: '우주 조각들이 대기권에서 타면서 빛을 남김' },
];
