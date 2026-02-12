/**
 * Mega-seed: 300+ English words with emoji icons across 15 categories.
 * All words go into one "lexicon" theme for the unified fusion lab.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type W = { id: string; word: string; meaning: string; icon: string; category: string };

// ─── Word Data: 300+ words ─────────────────────────────────

const animal: W[] = [
  { id: 'w-cat', word: 'cat', meaning: '猫', icon: '🐱', category: 'animal' },
  { id: 'w-dog', word: 'dog', meaning: '狗', icon: '🐕', category: 'animal' },
  { id: 'w-bird', word: 'bird', meaning: '鸟', icon: '🐦', category: 'animal' },
  { id: 'w-fish', word: 'fish', meaning: '鱼', icon: '🐟', category: 'animal' },
  { id: 'w-lion', word: 'lion', meaning: '狮子', icon: '🦁', category: 'animal' },
  { id: 'w-tiger', word: 'tiger', meaning: '老虎', icon: '🐯', category: 'animal' },
  { id: 'w-bear', word: 'bear', meaning: '熊', icon: '🐻', category: 'animal' },
  { id: 'w-rabbit', word: 'rabbit', meaning: '兔子', icon: '🐰', category: 'animal' },
  { id: 'w-horse', word: 'horse', meaning: '马', icon: '🐴', category: 'animal' },
  { id: 'w-sheep', word: 'sheep', meaning: '羊', icon: '🐑', category: 'animal' },
  { id: 'w-cow', word: 'cow', meaning: '牛', icon: '🐄', category: 'animal' },
  { id: 'w-pig', word: 'pig', meaning: '猪', icon: '🐷', category: 'animal' },
  { id: 'w-chicken', word: 'chicken', meaning: '鸡', icon: '🐔', category: 'animal' },
  { id: 'w-duck', word: 'duck', meaning: '鸭', icon: '🦆', category: 'animal' },
  { id: 'w-frog', word: 'frog', meaning: '青蛙', icon: '🐸', category: 'animal' },
  { id: 'w-snake', word: 'snake', meaning: '蛇', icon: '🐍', category: 'animal' },
  { id: 'w-whale', word: 'whale', meaning: '鲸鱼', icon: '🐋', category: 'animal' },
  { id: 'w-dolphin', word: 'dolphin', meaning: '海豚', icon: '🐬', category: 'animal' },
  { id: 'w-butterfly', word: 'butterfly', meaning: '蝴蝶', icon: '🦋', category: 'animal' },
  { id: 'w-bee', word: 'bee', meaning: '蜜蜂', icon: '🐝', category: 'animal' },
  { id: 'w-wolf', word: 'wolf', meaning: '狼', icon: '🐺', category: 'animal' },
  { id: 'w-fox', word: 'fox', meaning: '狐狸', icon: '🦊', category: 'animal' },
  { id: 'w-eagle', word: 'eagle', meaning: '鹰', icon: '🦅', category: 'animal' },
  { id: 'w-owl', word: 'owl', meaning: '猫头鹰', icon: '🦉', category: 'animal' },
  { id: 'w-turtle', word: 'turtle', meaning: '乌龟', icon: '🐢', category: 'animal' },
];

const food: W[] = [
  { id: 'w-apple', word: 'apple', meaning: '苹果', icon: '🍎', category: 'food' },
  { id: 'w-bread', word: 'bread', meaning: '面包', icon: '🍞', category: 'food' },
  { id: 'w-cake', word: 'cake', meaning: '蛋糕', icon: '🍰', category: 'food' },
  { id: 'w-cheese', word: 'cheese', meaning: '奶酪', icon: '🧀', category: 'food' },
  { id: 'w-egg', word: 'egg', meaning: '鸡蛋', icon: '🥚', category: 'food' },
  { id: 'w-milk', word: 'milk', meaning: '牛奶', icon: '🥛', category: 'food' },
  { id: 'w-rice', word: 'rice', meaning: '米饭', icon: '🍚', category: 'food' },
  { id: 'w-coffee', word: 'coffee', meaning: '咖啡', icon: '☕', category: 'food' },
  { id: 'w-tea', word: 'tea', meaning: '茶', icon: '🍵', category: 'food' },
  { id: 'w-juice', word: 'juice', meaning: '果汁', icon: '🧃', category: 'food' },
  { id: 'w-pizza', word: 'pizza', meaning: '比萨', icon: '🍕', category: 'food' },
  { id: 'w-burger', word: 'burger', meaning: '汉堡', icon: '🍔', category: 'food' },
  { id: 'w-noodle', word: 'noodle', meaning: '面条', icon: '🍜', category: 'food' },
  { id: 'w-soup', word: 'soup', meaning: '汤', icon: '🍲', category: 'food' },
  { id: 'w-salad', word: 'salad', meaning: '沙拉', icon: '🥗', category: 'food' },
  { id: 'w-candy', word: 'candy', meaning: '糖果', icon: '🍬', category: 'food' },
  { id: 'w-chocolate', word: 'chocolate', meaning: '巧克力', icon: '🍫', category: 'food' },
  { id: 'w-grape', word: 'grape', meaning: '葡萄', icon: '🍇', category: 'food' },
  { id: 'w-lemon', word: 'lemon', meaning: '柠檬', icon: '🍋', category: 'food' },
  { id: 'w-banana', word: 'banana', meaning: '香蕉', icon: '🍌', category: 'food' },
  { id: 'w-strawberry', word: 'strawberry', meaning: '草莓', icon: '🍓', category: 'food' },
  { id: 'w-watermelon', word: 'watermelon', meaning: '西瓜', icon: '🍉', category: 'food' },
  { id: 'w-tomato', word: 'tomato', meaning: '番茄', icon: '🍅', category: 'food' },
  { id: 'w-corn', word: 'corn', meaning: '玉米', icon: '🌽', category: 'food' },
  { id: 'w-honey', word: 'honey', meaning: '蜂蜜', icon: '🍯', category: 'food' },
  { id: 'w-wine', word: 'wine', meaning: '葡萄酒', icon: '🍷', category: 'food' },
  { id: 'w-cookie', word: 'cookie', meaning: '饼干', icon: '🍪', category: 'food' },
  { id: 'w-pie', word: 'pie', meaning: '馅饼', icon: '🥧', category: 'food' },
  { id: 'w-pepper', word: 'pepper', meaning: '辣椒', icon: '🌶️', category: 'food' },
  { id: 'w-salt', word: 'salt', meaning: '盐', icon: '🧂', category: 'food' },
];

const nature: W[] = [
  { id: 'w-sun', word: 'sun', meaning: '太阳', icon: '☀️', category: 'nature' },
  { id: 'w-moon', word: 'moon', meaning: '月亮', icon: '🌙', category: 'nature' },
  { id: 'w-star', word: 'star', meaning: '星星', icon: '⭐', category: 'nature' },
  { id: 'w-cloud', word: 'cloud', meaning: '云', icon: '☁️', category: 'nature' },
  { id: 'w-rain', word: 'rain', meaning: '雨', icon: '🌧️', category: 'nature' },
  { id: 'w-snow', word: 'snow', meaning: '雪', icon: '❄️', category: 'nature' },
  { id: 'w-wind', word: 'wind', meaning: '风', icon: '💨', category: 'nature' },
  { id: 'w-fire', word: 'fire', meaning: '火', icon: '🔥', category: 'nature' },
  { id: 'w-water', word: 'water', meaning: '水', icon: '💧', category: 'nature' },
  { id: 'w-ice', word: 'ice', meaning: '冰', icon: '🧊', category: 'nature' },
  { id: 'w-tree', word: 'tree', meaning: '树', icon: '🌳', category: 'nature' },
  { id: 'w-flower', word: 'flower', meaning: '花', icon: '🌸', category: 'nature' },
  { id: 'w-leaf', word: 'leaf', meaning: '叶子', icon: '🍃', category: 'nature' },
  { id: 'w-mountain', word: 'mountain', meaning: '山', icon: '🏔️', category: 'nature' },
  { id: 'w-river', word: 'river', meaning: '河', icon: '🏞️', category: 'nature' },
  { id: 'w-sea', word: 'sea', meaning: '海', icon: '🌊', category: 'nature' },
  { id: 'w-forest', word: 'forest', meaning: '森林', icon: '🌲', category: 'nature' },
  { id: 'w-desert', word: 'desert', meaning: '沙漠', icon: '🏜️', category: 'nature' },
  { id: 'w-island', word: 'island', meaning: '岛', icon: '🏝️', category: 'nature' },
  { id: 'w-rainbow', word: 'rainbow', meaning: '彩虹', icon: '🌈', category: 'nature' },
  { id: 'w-thunder', word: 'thunder', meaning: '雷', icon: '⚡', category: 'nature' },
  { id: 'w-earth', word: 'earth', meaning: '地球', icon: '🌍', category: 'nature' },
  { id: 'w-rose', word: 'rose', meaning: '玫瑰', icon: '🌹', category: 'nature' },
  { id: 'w-seed', word: 'seed', meaning: '种子', icon: '🌱', category: 'nature' },
];

const object: W[] = [
  { id: 'w-book', word: 'book', meaning: '书', icon: '📖', category: 'object' },
  { id: 'w-pen', word: 'pen', meaning: '笔', icon: '🖊️', category: 'object' },
  { id: 'w-key', word: 'key', meaning: '钥匙', icon: '🔑', category: 'object' },
  { id: 'w-clock', word: 'clock', meaning: '钟', icon: '🕐', category: 'object' },
  { id: 'w-phone', word: 'phone', meaning: '手机', icon: '📱', category: 'object' },
  { id: 'w-camera', word: 'camera', meaning: '相机', icon: '📷', category: 'object' },
  { id: 'w-lamp', word: 'lamp', meaning: '灯', icon: '💡', category: 'object' },
  { id: 'w-mirror', word: 'mirror', meaning: '镜子', icon: '🪞', category: 'object' },
  { id: 'w-bell', word: 'bell', meaning: '铃', icon: '🔔', category: 'object' },
  { id: 'w-crown', word: 'crown', meaning: '王冠', icon: '👑', category: 'object' },
  { id: 'w-sword', word: 'sword', meaning: '剑', icon: '⚔️', category: 'object' },
  { id: 'w-shield', word: 'shield', meaning: '盾', icon: '🛡️', category: 'object' },
  { id: 'w-ring', word: 'ring', meaning: '戒指', icon: '💍', category: 'object' },
  { id: 'w-gem', word: 'gem', meaning: '宝石', icon: '💎', category: 'object' },
  { id: 'w-gift', word: 'gift', meaning: '礼物', icon: '🎁', category: 'object' },
  { id: 'w-letter', word: 'letter', meaning: '信', icon: '✉️', category: 'object' },
  { id: 'w-map', word: 'map', meaning: '地图', icon: '🗺️', category: 'object' },
  { id: 'w-flag', word: 'flag', meaning: '旗', icon: '🚩', category: 'object' },
  { id: 'w-candle', word: 'candle', meaning: '蜡烛', icon: '🕯️', category: 'object' },
  { id: 'w-umbrella', word: 'umbrella', meaning: '伞', icon: '☂️', category: 'object' },
  { id: 'w-glasses', word: 'glasses', meaning: '眼镜', icon: '👓', category: 'object' },
  { id: 'w-hat', word: 'hat', meaning: '帽子', icon: '🎩', category: 'object' },
  { id: 'w-shoe', word: 'shoe', meaning: '鞋', icon: '👟', category: 'object' },
  { id: 'w-bag', word: 'bag', meaning: '包', icon: '👜', category: 'object' },
];

const place: W[] = [
  { id: 'w-house', word: 'house', meaning: '房子', icon: '🏠', category: 'place' },
  { id: 'w-school', word: 'school', meaning: '学校', icon: '🏫', category: 'place' },
  { id: 'w-hospital', word: 'hospital', meaning: '医院', icon: '🏥', category: 'place' },
  { id: 'w-church', word: 'church', meaning: '教堂', icon: '⛪', category: 'place' },
  { id: 'w-castle', word: 'castle', meaning: '城堡', icon: '🏰', category: 'place' },
  { id: 'w-bridge', word: 'bridge', meaning: '桥', icon: '🌉', category: 'place' },
  { id: 'w-garden', word: 'garden', meaning: '花园', icon: '🏡', category: 'place' },
  { id: 'w-park', word: 'park', meaning: '公园', icon: '🏞️', category: 'place' },
  { id: 'w-beach', word: 'beach', meaning: '海滩', icon: '🏖️', category: 'place' },
  { id: 'w-city', word: 'city', meaning: '城市', icon: '🏙️', category: 'place' },
  { id: 'w-village', word: 'village', meaning: '村庄', icon: '🏘️', category: 'place' },
  { id: 'w-library', word: 'library', meaning: '图书馆', icon: '📚', category: 'place' },
  { id: 'w-market', word: 'market', meaning: '市场', icon: '🏪', category: 'place' },
  { id: 'w-farm', word: 'farm', meaning: '农场', icon: '🌾', category: 'place' },
  { id: 'w-tower', word: 'tower', meaning: '塔', icon: '🗼', category: 'place' },
];

const abstract: W[] = [
  { id: 'w-love', word: 'love', meaning: '爱', icon: '❤️', category: 'abstract' },
  { id: 'w-dream', word: 'dream', meaning: '梦', icon: '💭', category: 'abstract' },
  { id: 'w-hope', word: 'hope', meaning: '希望', icon: '🌟', category: 'abstract' },
  { id: 'w-peace', word: 'peace', meaning: '和平', icon: '☮️', category: 'abstract' },
  { id: 'w-freedom', word: 'freedom', meaning: '自由', icon: '🕊️', category: 'abstract' },
  { id: 'w-happiness', word: 'happiness', meaning: '幸福', icon: '😊', category: 'abstract' },
  { id: 'w-music', word: 'music', meaning: '音乐', icon: '🎵', category: 'abstract' },
  { id: 'w-art', word: 'art', meaning: '艺术', icon: '🎨', category: 'abstract' },
  { id: 'w-wisdom', word: 'wisdom', meaning: '智慧', icon: '🧠', category: 'abstract' },
  { id: 'w-courage', word: 'courage', meaning: '勇气', icon: '💪', category: 'abstract' },
  { id: 'w-time', word: 'time', meaning: '时间', icon: '⏰', category: 'abstract' },
  { id: 'w-light', word: 'light', meaning: '光', icon: '✨', category: 'abstract' },
  { id: 'w-shadow', word: 'shadow', meaning: '影子', icon: '👤', category: 'abstract' },
  { id: 'w-soul', word: 'soul', meaning: '灵魂', icon: '👻', category: 'abstract' },
  { id: 'w-magic', word: 'magic', meaning: '魔法', icon: '🪄', category: 'abstract' },
  { id: 'w-power', word: 'power', meaning: '力量', icon: '⚡', category: 'abstract' },
  { id: 'w-story', word: 'story', meaning: '故事', icon: '📜', category: 'abstract' },
  { id: 'w-luck', word: 'luck', meaning: '运气', icon: '🍀', category: 'abstract' },
  { id: 'w-truth', word: 'truth', meaning: '真理', icon: '💎', category: 'abstract' },
  { id: 'w-joy', word: 'joy', meaning: '快乐', icon: '🎉', category: 'abstract' },
];

const body: W[] = [
  { id: 'w-heart', word: 'heart', meaning: '心', icon: '💖', category: 'body' },
  { id: 'w-eye', word: 'eye', meaning: '眼睛', icon: '👁️', category: 'body' },
  { id: 'w-hand', word: 'hand', meaning: '手', icon: '🤚', category: 'body' },
  { id: 'w-wing', word: 'wing', meaning: '翅膀', icon: '🪽', category: 'body' },
  { id: 'w-bone', word: 'bone', meaning: '骨头', icon: '🦴', category: 'body' },
  { id: 'w-tooth', word: 'tooth', meaning: '牙齿', icon: '🦷', category: 'body' },
  { id: 'w-brain', word: 'brain', meaning: '大脑', icon: '🧠', category: 'body' },
  { id: 'w-blood', word: 'blood', meaning: '血', icon: '🩸', category: 'body' },
];

const transport: W[] = [
  { id: 'w-car', word: 'car', meaning: '汽车', icon: '🚗', category: 'transport' },
  { id: 'w-ship', word: 'ship', meaning: '船', icon: '🚢', category: 'transport' },
  { id: 'w-plane', word: 'plane', meaning: '飞机', icon: '✈️', category: 'transport' },
  { id: 'w-train', word: 'train', meaning: '火车', icon: '🚂', category: 'transport' },
  { id: 'w-bicycle', word: 'bicycle', meaning: '自行车', icon: '🚲', category: 'transport' },
  { id: 'w-rocket', word: 'rocket', meaning: '火箭', icon: '🚀', category: 'transport' },
  { id: 'w-boat', word: 'boat', meaning: '小船', icon: '⛵', category: 'transport' },
];

const color: W[] = [
  { id: 'w-red', word: 'red', meaning: '红色', icon: '🔴', category: 'color' },
  { id: 'w-blue', word: 'blue', meaning: '蓝色', icon: '🔵', category: 'color' },
  { id: 'w-green', word: 'green', meaning: '绿色', icon: '🟢', category: 'color' },
  { id: 'w-gold', word: 'gold', meaning: '金色', icon: '🟡', category: 'color' },
  { id: 'w-black', word: 'black', meaning: '黑色', icon: '⚫', category: 'color' },
  { id: 'w-white', word: 'white', meaning: '白色', icon: '⚪', category: 'color' },
  { id: 'w-silver', word: 'silver', meaning: '银色', icon: '🪙', category: 'color' },
];

const sport: W[] = [
  { id: 'w-ball', word: 'ball', meaning: '球', icon: '⚽', category: 'sport' },
  { id: 'w-game', word: 'game', meaning: '游戏', icon: '🎮', category: 'sport' },
  { id: 'w-race', word: 'race', meaning: '赛跑', icon: '🏃', category: 'sport' },
  { id: 'w-swim', word: 'swim', meaning: '游泳', icon: '🏊', category: 'sport' },
  { id: 'w-dance', word: 'dance', meaning: '舞蹈', icon: '💃', category: 'sport' },
  { id: 'w-chess', word: 'chess', meaning: '象棋', icon: '♟️', category: 'sport' },
];

const weather: W[] = [
  { id: 'w-spring', word: 'spring', meaning: '春天', icon: '🌸', category: 'weather' },
  { id: 'w-summer', word: 'summer', meaning: '夏天', icon: '🌞', category: 'weather' },
  { id: 'w-autumn', word: 'autumn', meaning: '秋天', icon: '🍂', category: 'weather' },
  { id: 'w-winter', word: 'winter', meaning: '冬天', icon: '⛄', category: 'weather' },
  { id: 'w-storm', word: 'storm', meaning: '暴风雨', icon: '🌪️', category: 'weather' },
  { id: 'w-fog', word: 'fog', meaning: '雾', icon: '🌫️', category: 'weather' },
];

const science: W[] = [
  { id: 'w-atom', word: 'atom', meaning: '原子', icon: '⚛️', category: 'science' },
  { id: 'w-robot', word: 'robot', meaning: '机器人', icon: '🤖', category: 'science' },
  { id: 'w-crystal', word: 'crystal', meaning: '水晶', icon: '🔮', category: 'science' },
  { id: 'w-magnet', word: 'magnet', meaning: '磁铁', icon: '🧲', category: 'science' },
  { id: 'w-telescope', word: 'telescope', meaning: '望远镜', icon: '🔭', category: 'science' },
  { id: 'w-dna', word: 'DNA', meaning: '基因', icon: '🧬', category: 'science' },
];

const emotion: W[] = [
  { id: 'w-smile', word: 'smile', meaning: '微笑', icon: '😊', category: 'emotion' },
  { id: 'w-tear', word: 'tear', meaning: '眼泪', icon: '😢', category: 'emotion' },
  { id: 'w-anger', word: 'anger', meaning: '愤怒', icon: '😠', category: 'emotion' },
  { id: 'w-fear', word: 'fear', meaning: '恐惧', icon: '😨', category: 'emotion' },
  { id: 'w-surprise', word: 'surprise', meaning: '惊喜', icon: '😲', category: 'emotion' },
  { id: 'w-calm', word: 'calm', meaning: '平静', icon: '😌', category: 'emotion' },
];

const action: W[] = [
  { id: 'w-fly', word: 'fly', meaning: '飞', icon: '🦅', category: 'action' },
  { id: 'w-run', word: 'run', meaning: '跑', icon: '🏃', category: 'action' },
  { id: 'w-sing', word: 'sing', meaning: '唱歌', icon: '🎤', category: 'action' },
  { id: 'w-paint', word: 'paint', meaning: '画画', icon: '🖌️', category: 'action' },
  { id: 'w-cook', word: 'cook', meaning: '烹饪', icon: '👨‍🍳', category: 'action' },
  { id: 'w-read', word: 'read', meaning: '阅读', icon: '📚', category: 'action' },
  { id: 'w-write', word: 'write', meaning: '写', icon: '✍️', category: 'action' },
  { id: 'w-sleep', word: 'sleep', meaning: '睡觉', icon: '😴', category: 'action' },
  { id: 'w-grow', word: 'grow', meaning: '生长', icon: '🌱', category: 'action' },
  { id: 'w-build', word: 'build', meaning: '建造', icon: '🏗️', category: 'action' },
];

const material: W[] = [
  { id: 'w-stone', word: 'stone', meaning: '石头', icon: '🪨', category: 'material' },
  { id: 'w-iron', word: 'iron', meaning: '铁', icon: '⚙️', category: 'material' },
  { id: 'w-wood', word: 'wood', meaning: '木头', icon: '🪵', category: 'material' },
  { id: 'w-glass', word: 'glass', meaning: '玻璃', icon: '🪟', category: 'material' },
  { id: 'w-sand', word: 'sand', meaning: '沙', icon: '⏳', category: 'material' },
  { id: 'w-cotton', word: 'cotton', meaning: '棉花', icon: '🧶', category: 'material' },
  { id: 'w-paper', word: 'paper', meaning: '纸', icon: '📄', category: 'material' },
  { id: 'w-silk', word: 'silk', meaning: '丝绸', icon: '🧣', category: 'material' },
];

const cosmic: W[] = [
  { id: 'w-sky', word: 'sky', meaning: '天空', icon: '🌌', category: 'cosmic' },
  { id: 'w-space', word: 'space', meaning: '太空', icon: '🌠', category: 'cosmic' },
  { id: 'w-galaxy', word: 'galaxy', meaning: '银河', icon: '🌌', category: 'cosmic' },
  { id: 'w-comet', word: 'comet', meaning: '彗星', icon: '☄️', category: 'cosmic' },
  { id: 'w-planet', word: 'planet', meaning: '行星', icon: '🪐', category: 'cosmic' },
  { id: 'w-aurora', word: 'aurora', meaning: '极光', icon: '🌌', category: 'cosmic' },
];

// ─── Combine all words ──────────────────────────────────────

const ALL_WORDS: W[] = [
  ...animal, ...food, ...nature, ...object, ...place,
  ...abstract, ...body, ...transport, ...color, ...sport,
  ...weather, ...science, ...emotion, ...action, ...material, ...cosmic,
];

// Category display info
const CATEGORIES = [
  { id: 'all', name: '全部', nameEn: 'All', emoji: '✦', desc: '所有词汇' },
  { id: 'animal', name: '动物', nameEn: 'Animal', emoji: '🐾', desc: '动物世界' },
  { id: 'food', name: '食物', nameEn: 'Food', emoji: '🍽️', desc: '美食饮品' },
  { id: 'nature', name: '自然', nameEn: 'Nature', emoji: '🌿', desc: '自然万象' },
  { id: 'object', name: '物品', nameEn: 'Object', emoji: '🔑', desc: '日常物品' },
  { id: 'place', name: '地点', nameEn: 'Place', emoji: '🏠', desc: '场所空间' },
  { id: 'abstract', name: '抽象', nameEn: 'Abstract', emoji: '✨', desc: '概念情感' },
  { id: 'body', name: '身体', nameEn: 'Body', emoji: '💖', desc: '身体部位' },
  { id: 'transport', name: '交通', nameEn: 'Transport', emoji: '🚀', desc: '交通工具' },
  { id: 'color', name: '颜色', nameEn: 'Color', emoji: '🌈', desc: '色彩' },
  { id: 'sport', name: '运动', nameEn: 'Sport', emoji: '⚽', desc: '运动娱乐' },
  { id: 'weather', name: '季节', nameEn: 'Season', emoji: '🌸', desc: '四季天气' },
  { id: 'science', name: '科学', nameEn: 'Science', emoji: '🔬', desc: '科技探索' },
  { id: 'emotion', name: '情绪', nameEn: 'Emotion', emoji: '😊', desc: '情绪表达' },
  { id: 'action', name: '动作', nameEn: 'Action', emoji: '🏃', desc: '行为动作' },
  { id: 'material', name: '材料', nameEn: 'Material', emoji: '🪨', desc: '材质' },
  { id: 'cosmic', name: '宇宙', nameEn: 'Cosmic', emoji: '🌌', desc: '星辰大海' },
];

// ─── Seeding ────────────────────────────────────────────────

async function main() {
  console.log(`🌱 Starting mega-seed (${ALL_WORDS.length} words)...`);

  // Clear
  await prisma.userFavorite.deleteMany();
  await prisma.userDiscovery.deleteMany();
  await prisma.fusionRule.deleteMany();
  await prisma.word.deleteMany();
  await prisma.theme.deleteMany();

  // Create one unified theme
  await prisma.theme.create({
    data: {
      id: 'lexicon',
      name: '融词宇宙',
      nameEn: 'LexiFusion Universe',
      description: `${ALL_WORDS.length}+ 英语词汇，任意两个都可以融合`,
      coverEmoji: '✦',
      sortOrder: 0,
      isActive: true,
    },
  });

  // Batch insert words
  console.log(`  📦 Inserting ${ALL_WORDS.length} words...`);
  for (const w of ALL_WORDS) {
    await prisma.word.create({
      data: {
        id: w.id,
        themeId: 'lexicon',
        word: w.word,
        meaning: w.meaning,
        icon: w.icon,
        category: w.category,
        phonetic: null,
        imageUrl: null,
      },
    });
  }

  const wordCount = await prisma.word.count();
  console.log(`  📦 Inserting preset fusion rules...`);

  // 预设融合规则：常见组合的直观结果（优先于 AI，避免牵强联想）
  const PRESET_FUSIONS: Array<{
    wordAId: string;
    wordBId: string;
    result: string;
    meaning: string;
    type: string;
    concept: string;
    association: string;
    suggestedWords: string[];
    example: string;
    icon: string;
  }> = [
    {
      wordAId: 'w-cheese',
      wordBId: 'w-chess',
      result: 'cheeseboard',
      meaning: '奶酪板',
      type: 'compound',
      concept: '奶酪与象棋的融合——棋盘(board)与奶酪板(cheeseboard)的联想，奶酪拼盘常用木板盛放',
      association: '板、拼盘、棋盘',
      suggestedWords: ['cheeseboard', 'chessboard', 'platter', 'board', 'slice'],
      example: 'We served a cheese board at the party.',
      icon: '🧀',
    },
    {
      wordAId: 'w-sun',
      wordBId: 'w-flower',
      result: 'sunflower',
      meaning: '向日葵',
      type: 'compound',
      concept: '太阳与花的融合——向日葵朝向太阳生长',
      association: '阳光、金色',
      suggestedWords: ['sunflower', 'sunrise', 'bloom', 'petal', 'gold'],
      example: 'Sunflowers turn toward the sun.',
      icon: '🌻',
    },
  ];

  for (const f of PRESET_FUSIONS) {
    const [idA, idB] = [f.wordAId, f.wordBId].sort();
    const ruleId = `preset-${idA}-${idB}`;
    try {
      await prisma.fusionRule.upsert({
        where: {
          wordAId_wordBId: { wordAId: idA, wordBId: idB },
        },
        create: {
          id: ruleId,
          wordAId: idA,
          wordBId: idB,
          result: f.result,
          meaning: f.meaning,
          type: f.type,
          concept: f.concept,
          association: f.association,
          suggestedWords: JSON.stringify(f.suggestedWords),
          example: f.example,
          icon: f.icon,
        },
        update: {
          result: f.result,
          meaning: f.meaning,
          concept: f.concept,
          association: f.association,
          suggestedWords: JSON.stringify(f.suggestedWords),
          example: f.example,
          icon: f.icon,
        },
      });
    } catch (e) {
      console.warn(`  ⚠️ Skip preset ${idA}+${idB} (word may not exist):`, (e as Error).message);
    }
  }

  const ruleCount = await prisma.fusionRule.count();
  console.log(`✅ Seed complete: ${wordCount} words, ${ruleCount} preset fusion rules`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
