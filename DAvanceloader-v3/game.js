"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const introOverlay = document.getElementById("introOverlay");
const deathOverlay = document.getElementById("deathOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const tipsOverlay = document.getElementById("tipsOverlay");
const introInstructions = introOverlay.querySelector(".instructions");
const finalScore = document.getElementById("finalScore");
const bestCombo = document.getElementById("bestCombo");
const retryButton = document.getElementById("retryButton");
const resumeButton = document.getElementById("resumeButton");
const aliasButton = document.getElementById("aliasButton");
const aiFramesButton = document.getElementById("aiFramesButton");
const inventoryButton = document.getElementById("inventoryButton");
const controllerModeButton = document.getElementById("controllerModeButton");
const assistButton = document.getElementById("assistButton");
const comfortButton = document.getElementById("comfortButton");
const reticleButton = document.getElementById("reticleButton");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const introAliasButton = document.getElementById("introAliasButton");
const introAiFramesButton = document.getElementById("introAiFramesButton");
const introInventoryButton = document.getElementById("introInventoryButton");
const introTipsButton = document.getElementById("introTipsButton");
const tipsButton = document.getElementById("tipsButton");
const tipsCloseButton = document.getElementById("tipsCloseButton");
const introControllerModeButton = document.getElementById("introControllerModeButton");
const introAssistButton = document.getElementById("introAssistButton");
const introComfortButton = document.getElementById("introComfortButton");
const introReticleButton = document.getElementById("introReticleButton");
const aiSettings = document.getElementById("aiSettings");
const introAiSettings = document.getElementById("introAiSettings");
const inventorySettings = document.getElementById("inventorySettings");
const introInventorySettings = document.getElementById("introInventorySettings");
const aiSettingSelects = {
  frameCount: [document.getElementById("aiFrameCountSelect"), document.getElementById("introAiFrameCountSelect")],
  prediction: [document.getElementById("aiPredictionSelect"), document.getElementById("introAiPredictionSelect")],
  influence: [document.getElementById("aiInfluenceSelect"), document.getElementById("introAiInfluenceSelect")],
  use: [document.getElementById("aiUseSelect"), document.getElementById("introAiUseSelect")],
  debug: [document.getElementById("aiDebugSelect"), document.getElementById("introAiDebugSelect")]
};
const inventorySettingSelects = {
  weapon: [document.getElementById("inventoryWeaponSelect"), document.getElementById("introInventoryWeaponSelect")],
  reload: [document.getElementById("inventoryReloadSelect"), document.getElementById("introInventoryReloadSelect")],
  pickup: [document.getElementById("inventoryPickupSelect"), document.getElementById("introInventoryPickupSelect")],
  reserve: [document.getElementById("inventoryReserveSelect"), document.getElementById("introInventoryReserveSelect")],
  swap: [document.getElementById("inventorySwapSelect"), document.getElementById("introInventorySwapSelect")]
};

const WORLD = {
  gravity: 1900,
  maxFall: 1500,
  floorKillY: 1250,
  levelEndX: 0
};

const SECRET_DROP = {
  y: 1138,
  width: 1040,
  height: 54,
  enemyCount: 4,
  propRagdolls: 5
};

const MOVE = {
  groundAccel: 3100,
  airAccel: 1900,
  groundFriction: 2500,
  airFriction: 180,
  maxRun: 430,
  maxAir: 540,
  jumpSpeed: 690,
  doubleJumpSpeed: 640,
  wallJumpX: 560,
  wallJumpY: 690,
  coyote: 0.1,
  jumpBuffer: 0.08,
  superStrafeTap: 0.08,
  slideTap: 0.15,
  slideTapWindow: 0.2,
  superSlideTapWindow: 0.22,
  slideBoost: 250,
  slideFriction: 560,
  airStrafeX: 820,
  airStrafeY: 520,
  superStrafeBoost: 1.5,
  superStrafeHang: 3.8,
  easyStrafeHang: 3.8,
  strafeComboWindow: 0.2,
  airCrouchAccel: 760,
  airCrouchPrecision: 1.45,
  airTurnBoost: 0.5,
  airTurnCooldown: 0.16,
  airTurnMax: 2.5,
  dashSpeed: 980,
  dashTime: 0.16,
  dashCooldown: 1.5
};

const AMMO = {
  minStart: 60,
  maxStart: 84,
  clipSize: 60,
  fireCooldown: 1 / 9,
  reloadFrames: 80,
  reloadDuration: 80 / 60
};

const WEAPONS = {
  ar: {
    label: "AR",
    personality: "STEADY",
    clipSize: 60,
    fireCooldown: 1 / 9,
    reloadFrames: 80,
    reloadDuration: 80 / 60,
    bulletSpeed: 900,
    damage: 1,
    spread: 0,
    pellets: 1,
    color: "#4df7ff",
    length: 56,
    kick: 1.4
  },
  pistol: {
    label: "PISTOL",
    personality: "HEAVY",
    clipSize: 12,
    fireCooldown: 0.26,
    reloadFrames: 44,
    reloadDuration: 44 / 60,
    bulletSpeed: 790,
    damage: 2,
    spread: 0.025,
    pellets: 1,
    color: "#b8fff3",
    length: 38,
    kick: 1.1
  },
  smg: {
    label: "SMG",
    personality: "SPRAY",
    clipSize: 36,
    fireCooldown: 1 / 13,
    reloadFrames: 58,
    reloadDuration: 58 / 60,
    bulletSpeed: 840,
    damage: 1,
    spread: 0.075,
    pellets: 1,
    color: "#ffd166",
    length: 45,
    kick: 1.7
  },
  shotgun: {
    label: "SHOTGUN",
    personality: "EMERGENCY",
    clipSize: 6,
    fireCooldown: 0.72,
    reloadFrames: 54,
    reloadDuration: 54 / 60,
    bulletSpeed: 760,
    damage: 2,
    spread: 0.28,
    pellets: 7,
    color: "#ff7a30",
    length: 52,
    kick: 5.5
  }
};
const WEAPON_CYCLE_ORDER = ["ar", "smg", "shotgun", "pistol"];

const PLAYER_MAX_HP = 5;
const PLAYER_SHIELD_MAX = 2;
const SHIELD_DROP_CHANCE = 0.3;
const SHIELD_PICKUP_VALUE = 1.5;
const RED_TAKEDOWN_HP_THRESHOLD = 1.5;

const MELEE = {
  hitFrame: 6,
  punchDuration: 0.24,
  kickDuration: 0.56,
  elbowDuration: 0.22,
  punchCooldown: 0.3,
  kickCooldown: 0.88,
  elbowCooldown: 0.28
};

const AI = {
  memoryTime: 2.4,
  searchTime: 1.65,
  alertTime: 0.2,
  shootDelay: 0.5,
  regularFireInterval: 0.5,
  regularAimAssist: 0.05,
  accuracy: 0.8,
  meleeRange: 112,
  takedownDamage: 999
};

function isExactRedTakedownHp(hp) {
  return Math.abs(hp - RED_TAKEDOWN_HP_THRESHOLD) < 0.001;
}

const PLAYER_BULLET_TRACKING = {
  strength: 0.2,
  range: 760,
  lifeWindow: 0.52,
  maxTurnPerSecond: 4.4
};

const ELITE_TRAITS = {
  shieldShots: 2,
  accuracy: 0.2,
  aimAssist: 0.3,
  fireDelay: 0.2,
  airStrafeHeight: 4,
  airStrafeVy: -480,
  airStrafeVx: 360,
  takedownFrames: 200,
  takedownFps: 60,
  takedownRange: 210,
  rightStickThreshold: 0.92
};

const ENEMY_TAKEDOWN_FRAMES = ELITE_TRAITS.takedownFrames + 20;
const PLAYER_ACTION_MEMORY_LIMIT = 10;
const ENEMY_FOOT = 18;
const ENEMY_MIN_SPACING = ENEMY_FOOT * 2;
const ENEMY_MAX_SPACING = ENEMY_FOOT * 6;
const ENEMY_SPAWN_PADDING = 42;
const UNARMED = {
  assistReach: 1.28,
  lunge: 155,
  cooldownScale: 0.74
};

const RAGDOLL_SHIELD = {
  eligibleChance: 1 / 35,
  shots: 7,
  grabRange: 150,
  width: 50,
  height: 78
};

const BLOOD_EFFECT = {
  minSplats: 1,
  gunSplats: 3,
  killSplats: 5,
  maxSplats: 180,
  maxLife: 5,
  sizeScale: 0.38,
  colors: ["#4b0712", "#68101c", "#842033"]
};

const BLOOD_PHYSICS = {
  gravity: 980,
  airDrag: 0.975,
  settleSpeed: 70,
  bounceDamp: 0.1,
  slideDamp: 0.28,
  maxActive: 42,
  fadeBehindPlayer: 260,
  fadeBehindCamera: 80,
  fadeRate: 2.4
};

const DEATH_RAGDOLL = {
  bleedDuration: 3,
  bleedInterval: 0.42,
  groundFriction: 420,
  bounceDamp: 0.24
};

const PLAYER_DEATH_RAGDOLL = {
  bleedDuration: 3,
  bleedInterval: 0.38,
  groundFriction: 360,
  bounceDamp: 0.2
};

const PLAYER_RAGDOLL = {
  gravity: 1550,
  damping: 0.985,
  iterations: 8,
  floorBounce: 0.08,
  floorFriction: 0.58
};

const RAGDOLL_INTERACTION = {
  bodyPadding: 18,
  bodyImpulse: 0.34,
  bodyPush: 0.72,
  bulletRadius: 22,
  bulletImpulse: 0.38,
  maxImpulse: 560
};

const LEDGE_CLIMB_FRAME_COUNT = 30;
const LEDGE_CLIMB_DURATION = LEDGE_CLIMB_FRAME_COUNT / 60;
const HALF_MANTLE_FRAME_COUNT = 25;

const FINALE = {
  sectionCount: 50,
  crowdJumpDuration: 1,
  armWrestleDuration: 1,
  bossTargetSeconds: 10
};

const ENDLESS_BATCH_SECTION_COUNT = 28;
const ENEMY_STREAM = {
  retireBehind: 360,
  retireDelay: 0.7,
  spawnAheadStart: 240,
  spawnAheadEnd: 3600,
  refillInterval: 0.45,
  maxLive: 150,
  targetAhead: 38,
  maxAddsPerTick: 3,
  maxStreamSpawnsPerPlatform: 2
};
const ENEMY_STREAM_BLOCKED_KINDS = new Set([
  "start",
  "jumpwall",
  "caveWall",
  "lowceiling",
  "routeBlocker",
  "decoCatwalk",
  "decoPipe",
  "decoAntenna",
  "caveSlope",
  "runSlope",
  "caveFloor",
  "chaseStart",
  "downhill",
  "bossgate",
  "finaldeck",
  "secretArena",
  "secretWall"
]);
const ENEMY_PERF = {
  poolMax: 96,
  maxOnscreen: 24,
  fullAiDistance: 1550,
  simpleAiDistance: 2450,
  drawMargin: 180,
  batchFrames: 3,
  stressFrameTime: 1 / 34
};
const SECTION_STREAM_CONFIG = {
  initialSections: 4,
  appendSections: 4,
  appendAtActiveIndex: 2,
  retireBatch: 3,
  keepBehind: 720,
  minSectionWidth: 980,
  maxSectionWidth: 2300
};
const STREAM_SECTION_TOOLS = [
  { id: "wide-run", width: [980, 1500], gap: [70, 150], y: [-24, 36], features: ["longFloor", "ledgeHigh"] },
  { id: "air-strafe-gap", width: [860, 1280], gap: [170, 260], y: [-60, 40], features: ["airGate", "farLedge"] },
  { id: "ledge-chain", width: [880, 1320], gap: [90, 160], y: [-90, 60], features: ["ledgeHigh", "ledgeMid", "ledgeLow"] },
  { id: "wall-kick", width: [860, 1260], gap: [120, 210], y: [-110, 80], features: ["leftWall", "rightWall", "ledgeHigh"] },
  { id: "low-tunnel", width: [900, 1380], gap: [70, 130], y: [-20, 70], features: ["ceiling", "lowTunnel"] },
  { id: "double-decker", width: [1000, 1520], gap: [90, 160], y: [-70, 70], features: ["upperDeck", "lowerDeck"] },
  { id: "broken-roofs", width: [900, 1450], gap: [120, 220], y: [-80, 110], features: ["stagger", "farLedge"] },
  { id: "neon-steps", width: [930, 1380], gap: [75, 135], y: [-130, -30], features: ["stepUp", "stepUp2"] },
  { id: "drop-steps", width: [930, 1450], gap: [75, 135], y: [50, 145], features: ["stepDown", "stepDown2"] },
  { id: "slide-under", width: [920, 1320], gap: [70, 130], y: [-15, 85], features: ["ceiling", "lowTunnel", "slideGap"] },
  { id: "antenna-spine", width: [1000, 1500], gap: [95, 175], y: [-80, 70], features: ["antenna", "wallPost"] },
  { id: "pipe-yard", width: [960, 1480], gap: [80, 150], y: [-35, 95], features: ["pipes", "ledgeMid"] },
  { id: "glass-bridge", width: [1040, 1650], gap: [130, 230], y: [-120, 50], features: ["upperDeck", "airGate", "farLedge"] },
  { id: "split-lane", width: [980, 1580], gap: [85, 170], y: [-70, 90], features: ["splitLane", "lowerDeck"] },
  { id: "crane-hop", width: [1000, 1600], gap: [120, 230], y: [-135, 60], features: ["stagger", "antenna", "rightWall"] },
  { id: "vault-boxes", width: [900, 1350], gap: [70, 140], y: [-45, 80], features: ["ledgeLow", "ledgeMid", "cube"] },
  { id: "dash-straight", width: [1220, 1700], gap: [140, 250], y: [-30, 75], features: ["longFloor", "airGate"] },
  { id: "skyhook", width: [950, 1450], gap: [145, 245], y: [-160, 30], features: ["leftWall", "upperDeck", "airGate"] },
  { id: "blackout-run", width: [1000, 1500], gap: [70, 150], y: [-45, 95], features: ["ceiling", "pipes", "wallPost"] },
  { id: "switchback", width: [980, 1480], gap: [90, 180], y: [-110, 100], features: ["leftWall", "stepUp", "rightWall"] },
  { id: "rail-spine", width: [1180, 1700], gap: [95, 175], y: [-65, 75], features: ["upperDeck", "antenna", "ledgeMid"] },
  { id: "underpass", width: [980, 1460], gap: [70, 140], y: [-25, 85], features: ["lowTunnel", "ceiling", "farLedge"] },
  { id: "spirewalk", width: [950, 1500], gap: [135, 245], y: [-155, 45], features: ["stagger", "upperDeck", "leftWall"] },
  { id: "maglift", width: [1080, 1680], gap: [90, 190], y: [-95, 105], features: ["splitLane", "airGate", "cube"] },
  { id: "cover-saw", width: [1040, 1560], gap: [78, 156], y: [-72, 88], features: ["ledgeLow", "ceiling", "splitLane"] },
  { id: "storm-gantry", width: [1120, 1740], gap: [112, 224], y: [-140, 54], features: ["upperDeck", "wallPost", "farLedge"] },
  { id: "neon-underbite", width: [960, 1480], gap: [70, 138], y: [-10, 112], features: ["lowTunnel", "slideGap", "stepDown"] },
  { id: "stacked-billboards", width: [1000, 1640], gap: [86, 180], y: [-126, 66], features: ["stagger", "splitLane", "antenna"] },
  { id: "rail-pocket", width: [1080, 1620], gap: [96, 190], y: [-56, 104], features: ["lowerDeck", "ledgeMid", "pipes"] },
  { id: "skylight-hop", width: [940, 1440], gap: [128, 242], y: [-150, 44], features: ["airGate", "stagger", "cube"] },
  { id: "vent-maze", width: [980, 1520], gap: [68, 144], y: [-32, 94], features: ["ceiling", "lowTunnel", "pipes"] },
  { id: "signal-stairs", width: [1020, 1580], gap: [86, 176], y: [-148, -18], features: ["stepUp", "stepUp2", "antenna"] },
  { id: "fallen-skyway", width: [1080, 1760], gap: [130, 252], y: [-92, 124], features: ["farLedge", "lowerDeck", "airGate"] },
  { id: "compressor", width: [980, 1500], gap: [76, 158], y: [-44, 82], features: ["slideGap", "wallPost", "ledgeLow"] },
  { id: "mirror-posts", width: [1000, 1540], gap: [104, 198], y: [-112, 96], features: ["leftWall", "rightWall", "stagger"] },
  { id: "rain-corridor", width: [1180, 1800], gap: [82, 168], y: [-40, 76], features: ["longFloor", "ceiling", "pipes"] },
  { id: "gap-market", width: [960, 1480], gap: [146, 258], y: [-82, 72], features: ["airGate", "farLedge", "ledgeMid"] },
  { id: "cover-steps", width: [980, 1460], gap: [76, 150], y: [-120, 86], features: ["stepUp", "ledgeLow", "ledgeMid"] },
  { id: "split-deck", width: [1060, 1680], gap: [90, 184], y: [-78, 118], features: ["splitLane", "lowerDeck", "lowTunnel"] },
  { id: "crash-deck", width: [1100, 1720], gap: [118, 238], y: [-132, 110], features: ["stagger", "rightWall", "farLedge"] },
  { id: "overpass-bite", width: [1020, 1660], gap: [84, 168], y: [-36, 92], features: ["upperDeck", "lowTunnel", "slideGap"] },
  { id: "antenna-pocket", width: [940, 1400], gap: [92, 188], y: [-118, 64], features: ["antenna", "ledgeHigh", "wallPost"] },
  { id: "hardlight-lanes", width: [1160, 1860], gap: [100, 205], y: [-96, 96], features: ["splitLane", "upperDeck", "farLedge"] },
  { id: "service-run", width: [1000, 1580], gap: [70, 142], y: [-22, 88], features: ["longFloor", "pipes", "cube"] },
  { id: "airlock", width: [980, 1520], gap: [142, 252], y: [-160, 32], features: ["leftWall", "airGate", "upperDeck"] },
  { id: "broken-cover", width: [960, 1480], gap: [80, 164], y: [-64, 116], features: ["ledgeLow", "farLedge", "stepDown"] },
  { id: "roof-service", width: [1060, 1700], gap: [88, 176], y: [-46, 106], features: ["lowerDeck", "longFloor", "ceiling"] },
  { id: "clutch-line", width: [1020, 1620], gap: [118, 238], y: [-142, 74], features: ["wallPost", "airGate", "ledgeHigh"] }
];

const STREAM_FEATURE_CATALOG = [...new Set(STREAM_SECTION_TOOLS.flatMap((tool) => tool.features))];
const LEVEL_MACHINE_CONFIG = {
  candidateCount: 12,
  generatedChance: 0.72,
  maxHistory: 18,
  maxFeatures: 4
};

const FINALE_SECTION_KINDS = [
  "tunnel",
  "wall",
  "stair",
  "slab",
  "underpass",
  "switchback",
  "narrow",
  "slab",
  "lowrun",
  "drop",
  "gauntlet",
  "billboard",
  "antenna",
  "crane",
  "glassgap",
  "railcut",
  "splitroof",
  "ventfield",
  "neonbridge",
  "zigzag",
  "longjump",
  "shaft",
  "overhang",
  "signwall",
  "rainpipe",
  "catwalk",
  "skylight",
  "elevator",
  "brokenroof",
  "stormdrain",
  "generator",
  "satellite",
  "billow",
  "sawtooth",
  "rampchain",
  "lowvault",
  "fencehop",
  "powerline",
  "alleyrise",
  "substation",
  "monorail",
  "skyhook",
  "datacenter",
  "waterworks",
  "cablemaze",
  "ruinedmall",
  "helipad",
  "maglift",
  "spirewalk",
  "stormgarden",
  "signalnest",
  "vaultdoor",
  "dronebay",
  "coolanttower",
  "arcade",
  "railspine",
  "furnace",
  "satelliteyard",
  "splitstack",
  "glassspire",
  "blackout"
];

const BONUS_BOSSES = [
  {
    id: "vanta",
    name: "VANTA SPRINTER",
    color: "#b8fff3",
    weaponType: "smg",
    hp: 16,
    preferredRange: 260,
    moveSpeed: 1.34,
    qteCooldown: 3.4,
    qte: { action: "A", label: "TAP A x3", taps: 3, duration: 0.72, damage: 0.34, flingX: 420, flingY: -740 }
  },
  {
    id: "echo",
    name: "ECHO BRAWLER",
    color: "#ffd166",
    weaponType: "shotgun",
    hp: 18,
    preferredRange: 170,
    moveSpeed: 0.9,
    qteCooldown: 4.2,
    qte: { action: "X", label: "TAP X x2", taps: 2, duration: 1.1, damage: 0.38, flingX: 330, flingY: -650 }
  },
  {
    id: "null",
    name: "NULL KICKER",
    color: "#ff7a30",
    weaponType: "pistol",
    hp: 17,
    preferredRange: 210,
    moveSpeed: 1.08,
    qteCooldown: 3.7,
    qte: { action: "B", label: "HIT B", taps: 1, duration: 0.54, damage: 0.36, flingX: 500, flingY: -590 }
  },
  {
    id: "rail",
    name: "RAIL JUDGE",
    color: "#c66bff",
    weaponType: "ar",
    hp: 20,
    preferredRange: 330,
    moveSpeed: 0.82,
    qteCooldown: 5.0,
    qte: { action: "RB", label: "HIT RB", taps: 1, duration: 0.9, damage: 0.32, flingX: 610, flingY: -620 }
  },
  {
    id: "sky",
    name: "SKY WARDEN",
    color: "#4df7ff",
    weaponType: "ar",
    hp: 19,
    preferredRange: 300,
    moveSpeed: 1.18,
    qteCooldown: 3.9,
    qte: { action: "RIGHT", label: "FLICK RIGHT", taps: 1, duration: 0.78, damage: 0.4, flingX: 430, flingY: -820 }
  }
];

const PLAYER_RUN_KEYFRAMES = [
  { head: 0, chest: -0.05, backArm: -1.05, frontArm: 0.62, backLeg: 0.82, frontLeg: -0.72, kneeBack: 0.46, kneeFront: -0.32 },
  { head: -0.5, chest: -0.03, backArm: -0.86, frontArm: 0.45, backLeg: 0.64, frontLeg: -0.58, kneeBack: 0.32, kneeFront: -0.22 },
  { head: -0.8, chest: 0.01, backArm: -0.48, frontArm: 0.18, backLeg: 0.34, frontLeg: -0.28, kneeBack: 0.14, kneeFront: -0.06 },
  { head: -0.5, chest: 0.04, backArm: -0.12, frontArm: -0.08, backLeg: 0.04, frontLeg: 0.08, kneeBack: -0.06, kneeFront: 0.12 },
  { head: 0, chest: 0.03, backArm: 0.34, frontArm: -0.35, backLeg: -0.36, frontLeg: 0.42, kneeBack: -0.16, kneeFront: 0.26 },
  { head: 0.5, chest: 0, backArm: 0.68, frontArm: -0.66, backLeg: -0.72, frontLeg: 0.72, kneeBack: -0.28, kneeFront: 0.38 },
  { head: 0.8, chest: -0.03, backArm: 0.42, frontArm: -0.52, backLeg: -0.42, frontLeg: 0.5, kneeBack: -0.16, kneeFront: 0.22 },
  { head: 0.5, chest: -0.04, backArm: 0.1, frontArm: -0.2, backLeg: -0.1, frontLeg: 0.16, kneeBack: 0.02, kneeFront: 0.08 },
  { head: 0, chest: -0.02, backArm: -0.34, frontArm: 0.12, backLeg: 0.28, frontLeg: -0.22, kneeBack: 0.2, kneeFront: -0.1 },
  { head: -0.25, chest: -0.04, backArm: -0.72, frontArm: 0.42, backLeg: 0.58, frontLeg: -0.48, kneeBack: 0.34, kneeFront: -0.2 }
];

const PLAYER_RUN_FRAMES = Array.from({ length: 30 }, (unused, frameIndex) => {
  const runPhase = (frameIndex / 30) * PLAYER_RUN_KEYFRAMES.length;
  const fromIndex = Math.floor(runPhase) % PLAYER_RUN_KEYFRAMES.length;
  const toIndex = (fromIndex + 1) % PLAYER_RUN_KEYFRAMES.length;
  const blend = runPhase - Math.floor(runPhase);
  const easedBlend = blend * blend * (3 - 2 * blend);
  const fromFrame = PLAYER_RUN_KEYFRAMES[fromIndex];
  const toFrame = PLAYER_RUN_KEYFRAMES[toIndex];
  const frame = {};
  for (const key of ["head", "chest", "backArm", "frontArm", "backLeg", "frontLeg", "kneeBack", "kneeFront"]) {
    frame[key] = fromFrame[key] + (toFrame[key] - fromFrame[key]) * easedBlend;
  }
  const footPlant = Math.sin((frameIndex / 30) * Math.PI * 4);
  frame.head += footPlant * 0.08;
  frame.shoulderDrop = Math.max(0, -footPlant) * 0.7;
  frame.hipDrop = Math.max(0, footPlant) * 0.55;
  return frame;
});
const RUN_FRAME_RATE_SCALE = PLAYER_RUN_FRAMES.length / PLAYER_RUN_KEYFRAMES.length;

const PLAYER_IDLE_FRAMES = [
  { head: 0, chest: 0, backArm: -0.18, frontArm: 0.12, backLeg: 0.08, frontLeg: -0.05, kneeBack: 0.1, kneeFront: -0.08 },
  { head: -0.15, chest: 0.01, backArm: -0.16, frontArm: 0.11, backLeg: 0.06, frontLeg: -0.03, kneeBack: 0.08, kneeFront: -0.07 },
  { head: -0.28, chest: 0.02, backArm: -0.13, frontArm: 0.09, backLeg: 0.04, frontLeg: -0.01, kneeBack: 0.06, kneeFront: -0.05 },
  { head: -0.36, chest: 0.03, backArm: -0.1, frontArm: 0.07, backLeg: 0.03, frontLeg: 0.01, kneeBack: 0.04, kneeFront: -0.02 },
  { head: -0.28, chest: 0.02, backArm: -0.08, frontArm: 0.06, backLeg: 0.02, frontLeg: 0.02, kneeBack: 0.03, kneeFront: 0 },
  { head: -0.08, chest: 0.01, backArm: -0.1, frontArm: 0.07, backLeg: 0.03, frontLeg: 0.01, kneeBack: 0.04, kneeFront: -0.02 },
  { head: 0.12, chest: 0, backArm: -0.13, frontArm: 0.09, backLeg: 0.04, frontLeg: -0.01, kneeBack: 0.06, kneeFront: -0.05 },
  { head: 0.24, chest: -0.01, backArm: -0.16, frontArm: 0.11, backLeg: 0.06, frontLeg: -0.03, kneeBack: 0.08, kneeFront: -0.07 },
  { head: 0.16, chest: -0.01, backArm: -0.18, frontArm: 0.12, backLeg: 0.08, frontLeg: -0.05, kneeBack: 0.1, kneeFront: -0.08 },
  { head: 0.05, chest: 0, backArm: -0.19, frontArm: 0.13, backLeg: 0.08, frontLeg: -0.06, kneeBack: 0.1, kneeFront: -0.08 }
];

const PLAYER_CROUCH_FRAMES = makePoseFrames({
  head: 0,
  chest: 0.1,
  backArm: 0.24,
  frontArm: -0.2,
  backLeg: 1.05,
  frontLeg: -0.98,
  kneeBack: 0.62,
  kneeFront: -0.54,
  headDrop: 12,
  shoulderDrop: 13,
  hipDrop: 9,
  legScale: 0.8,
  compact: true
});

const PLAYER_SLIDE_FRAMES = makePoseFrames({
  head: -0.15,
  chest: 0.18,
  backArm: 1.12,
  frontArm: -1.02,
  backLeg: 1.32,
  frontLeg: -1.24,
  kneeBack: 0.48,
  kneeFront: -0.3,
  headDrop: 15,
  shoulderDrop: 17,
  hipDrop: 11,
  legScale: 0.72,
  compact: true,
  lean: 16
});

const PLAYER_JUMP_RISE_FRAMES = makePoseFrames({
  head: -0.25,
  chest: -0.08,
  backArm: -0.98,
  frontArm: 0.78,
  backLeg: -0.42,
  frontLeg: 0.36,
  kneeBack: 0.42,
  kneeFront: -0.36,
  headDrop: -2,
  shoulderDrop: -2,
  hipDrop: -1,
  legScale: 1.05
});

const PLAYER_JUMP_FALL_FRAMES = makePoseFrames({
  head: 0.15,
  chest: 0.07,
  backArm: 0.84,
  frontArm: -0.78,
  backLeg: 0.48,
  frontLeg: -0.38,
  kneeBack: 0.18,
  kneeFront: -0.16,
  headDrop: 2,
  shoulderDrop: 3,
  hipDrop: 2,
  legScale: 0.98
});

const PLAYER_WALL_FRAMES = makePoseFrames({
  head: 0,
  chest: -0.12,
  backArm: -1.18,
  frontArm: -0.88,
  backLeg: 1.1,
  frontLeg: 0.66,
  kneeBack: -0.4,
  kneeFront: 0.34,
  shoulderDrop: 1,
  hipDrop: 2,
  legScale: 0.95
});

const PLAYER_HALF_MANTLE_FRAMES = Array.from({ length: HALF_MANTLE_FRAME_COUNT }, (unused, frameIndex) => {
  const t = frameIndex / (HALF_MANTLE_FRAME_COUNT - 1);
  const reach = easeAmount(Math.min(1, t * 1.45));
  const settle = easeAmount(Math.max(0, (t - 0.26) / 0.74));
  const breathe = Math.sin(t * Math.PI * 2) * 0.08;
  return {
    head: lerpValue(0.12, -0.42, reach) + breathe,
    chest: lerpValue(-0.1, -0.3, reach) + settle * 0.16,
    backArm: lerpValue(-1.0, -1.42, reach) + settle * 0.22,
    frontArm: lerpValue(-0.7, -1.3, reach) + settle * 0.36,
    backLeg: lerpValue(0.62, 0.98, reach) - settle * 0.12,
    frontLeg: lerpValue(0.18, 0.58, reach) - settle * 0.1,
    kneeBack: lerpValue(-0.1, -0.42, reach),
    kneeFront: lerpValue(0.08, 0.28, reach),
    headDrop: lerpValue(12, -4, reach) + settle * 2,
    shoulderDrop: lerpValue(14, 2, reach) + settle * 1.5,
    hipDrop: lerpValue(18, 13, reach),
    legScale: lerpValue(0.72, 0.86, settle),
    lean: lerpValue(-18, -9, settle),
    compact: true
  };
});

const PLAYER_LEDGE_CLIMB_FRAMES = Array.from({ length: LEDGE_CLIMB_FRAME_COUNT }, (unused, frameIndex) => {
  const t = frameIndex / (LEDGE_CLIMB_FRAME_COUNT - 1);
  const pull = easeAmount(Math.min(1, t * 1.35));
  const kick = Math.sin(t * Math.PI);
  const settle = easeAmount(Math.max(0, (t - 0.58) / 0.42));
  return {
    head: lerpValue(-0.2, -0.65, pull) + settle * 0.45,
    chest: lerpValue(-0.28, 0.08, settle) - kick * 0.1,
    backArm: lerpValue(-1.36, -0.25, settle),
    frontArm: lerpValue(-1.42, 0.22, settle),
    backLeg: lerpValue(0.86, -0.32, settle) + kick * 0.22,
    frontLeg: lerpValue(0.28, 0.58, kick) - settle * 0.42,
    kneeBack: lerpValue(-0.42, 0.18, settle),
    kneeFront: lerpValue(0.36, -0.12, settle),
    headDrop: lerpValue(6, -9, pull) + settle * 9,
    shoulderDrop: lerpValue(7, -8, pull) + settle * 8,
    hipDrop: lerpValue(8, -5, pull) + settle * 5,
    legScale: lerpValue(0.88, 1.05, settle),
    lean: lerpValue(-10, 8, settle)
  };
});

const PLAYER_TURN_FRAMES = Array.from({ length: 20 }, (unused, frameIndex) => {
  const t = frameIndex / 19;
  const twist = Math.sin(t * Math.PI);
  const settle = easeAmount(t);
  const counter = Math.sin(t * Math.PI * 2) * 0.18;
  return {
    head: lerpValue(0.42, -0.24, settle) - twist * 0.22,
    chest: lerpValue(-0.18, 0.08, settle) - twist * 0.08,
    backArm: lerpValue(0.82, -0.74, settle) + counter,
    frontArm: lerpValue(-0.62, 0.72, settle) - counter,
    backLeg: lerpValue(-0.62, 0.52, settle) - twist * 0.22,
    frontLeg: lerpValue(0.78, -0.52, settle) + twist * 0.18,
    kneeBack: lerpValue(-0.22, 0.3, settle) + twist * 0.18,
    kneeFront: lerpValue(0.36, -0.24, settle) - twist * 0.16,
    headDrop: twist * 1.4,
    shoulderDrop: twist * 2.6,
    hipDrop: twist * 1.8,
    legScale: lerpValue(0.98, 1.04, twist),
    lean: lerpValue(-20, 18, settle)
  };
});

const PLAYER_PUNCH_FRAMES = [
  { head: 0.08, chest: -0.16, backArm: -0.7, frontArm: -0.85, backLeg: 0.26, frontLeg: -0.16, kneeBack: 0.2, kneeFront: -0.12, punchArm: -0.72, punchBend: 0.42, punchReach: 0.55, lean: -3 },
  { head: 0.02, chest: -0.24, backArm: -0.88, frontArm: -1.08, backLeg: 0.36, frontLeg: -0.22, kneeBack: 0.26, kneeFront: -0.16, punchArm: -1.04, punchBend: 0.5, punchReach: 0.5, lean: -6 },
  { head: -0.08, chest: -0.12, backArm: -0.58, frontArm: 0.2, backLeg: 0.24, frontLeg: -0.1, kneeBack: 0.16, kneeFront: -0.1, punchArm: 0.24, punchBend: 0.26, punchReach: 0.74, lean: 5 },
  { head: -0.14, chest: 0.04, backArm: -0.22, frontArm: 0.92, backLeg: 0.08, frontLeg: 0.08, kneeBack: 0.06, kneeFront: 0.04, punchArm: 0.92, punchBend: 0.12, punchReach: 0.94, lean: 10 },
  { head: -0.18, chest: 0.12, backArm: 0.1, frontArm: 1.24, backLeg: -0.04, frontLeg: 0.2, kneeBack: 0.02, kneeFront: 0.08, punchArm: 1.24, punchBend: 0.04, punchReach: 1.06, lean: 13 },
  { head: -0.12, chest: 0.18, backArm: 0.24, frontArm: 1.42, backLeg: -0.1, frontLeg: 0.28, kneeBack: -0.02, kneeFront: 0.12, punchArm: 1.42, punchBend: 0, punchReach: 1.14, lean: 15 },
  { head: -0.2, chest: 0.2, backArm: 0.32, frontArm: 1.55, backLeg: -0.16, frontLeg: 0.34, kneeBack: -0.05, kneeFront: 0.14, punchArm: 1.55, punchBend: -0.02, punchReach: 1.22, lean: 17 },
  { head: -0.02, chest: 0.02, backArm: -0.08, frontArm: 0.64, backLeg: 0.06, frontLeg: 0.08, kneeBack: 0.06, kneeFront: 0.02, punchArm: 0.68, punchBend: 0.22, punchReach: 0.88, lean: 5 }
];

const PLAYER_KICK_FRAMES = [
  { head: 0.08, chest: -0.12, backArm: -0.54, frontArm: 0.52, backLeg: 0.18, frontLeg: -0.3, kneeBack: 0.34, kneeFront: -0.42, kickLeg: -0.28, kickBend: -0.7, kickReach: 0.58, lean: -4 },
  { head: 0, chest: -0.2, backArm: -0.7, frontArm: 0.78, backLeg: 0.28, frontLeg: -0.62, kneeBack: 0.4, kneeFront: -0.72, kickLeg: -0.62, kickBend: -0.84, kickReach: 0.52, lean: -8 },
  { head: -0.08, chest: -0.16, backArm: -0.94, frontArm: 0.92, backLeg: 0.42, frontLeg: -0.86, kneeBack: 0.45, kneeFront: -0.82, kickLeg: -0.84, kickBend: -0.66, kickReach: 0.58, lean: -10 },
  { head: -0.12, chest: 0.02, backArm: -0.72, frontArm: 1.08, backLeg: 0.28, frontLeg: 0.24, kneeBack: 0.24, kneeFront: 0.08, kickLeg: 0.38, kickBend: -0.32, kickReach: 0.82, lean: 5 },
  { head: -0.18, chest: 0.1, backArm: -0.36, frontArm: 1.22, backLeg: 0.08, frontLeg: 0.82, kneeBack: 0.12, kneeFront: 0.02, kickLeg: 0.98, kickBend: -0.18, kickReach: 1.02, lean: 12 },
  { head: -0.24, chest: 0.18, backArm: -0.1, frontArm: 1.35, backLeg: -0.06, frontLeg: 1.24, kneeBack: 0.02, kneeFront: -0.06, kickLeg: 1.36, kickBend: -0.08, kickReach: 1.16, lean: 18 },
  { head: -0.22, chest: 0.22, backArm: 0.1, frontArm: 1.46, backLeg: -0.12, frontLeg: 1.5, kneeBack: -0.05, kneeFront: -0.08, kickLeg: 1.58, kickBend: -0.02, kickReach: 1.28, lean: 22 },
  { head: -0.05, chest: 0.04, backArm: -0.18, frontArm: 0.76, backLeg: 0.06, frontLeg: 0.36, kneeBack: 0.08, kneeFront: 0.08, kickLeg: 0.44, kickBend: -0.24, kickReach: 0.9, lean: 6 }
];

const CONTROL = {
  controllerOnly: true,
  controllerCurve: "expo",
  movementAssist: true,
  comfortFx: false,
  largeReticle: false
};

const STYLE = {
  max: 100,
  decay: 9,
  calloutLife: 1.15,
  killBonus: 16,
  weakSpotBonus: 10
};

const RESCUE_GRAPPLE = {
  pullVy: -640,
  pullVx: 380,
  spawnChance: 0.34,
  searchForward: 980,
  searchBackward: 520
};

const SECTION_THEMES = [
  { name: "ROOFTOPS", color: "#4df7ff", ids: ["wide-run", "dash-straight", "service-run", "broken-roofs", "broken-cover", "crash-deck", "roof-service", "split-deck"] },
  { name: "SKYWAYS", color: "#ffd166", ids: ["underpass", "overpass-bite", "rail-spine", "rail-pocket", "fallen-skyway", "skyhook"] },
  { name: "CRANES", color: "#ff7a30", ids: ["crane-hop", "storm-gantry", "spirewalk", "rain-corridor", "pipe-yard", "compressor"] },
  { name: "RADIO TOWERS", color: "#c66bff", ids: ["antenna-spine", "antenna-pocket", "signal-stairs", "airlock", "clutch-line"] }
];

const canvasState = {
  width: 0,
  height: 0,
  dpr: 1
};

const frameSmoothing = {
  enabled: false,
  opacity: 0.15,
  historyLimit: 5,
  futureFrames: 5,
  history: [],
  capture: document.createElement("canvas"),
  motionX: 0,
  motionY: 0,
  lastCameraX: 0,
  lastCameraY: 0,
  lastPlayerX: 0,
  lastPlayerY: 0,
  initialized: false
};

const aiFrameDirector = {
  enabled: false,
  frameCount: 2,
  predictionInterval: 0.1,
  predictionMode: "standard",
  influence: 0.16,
  useMode: "balanced",
  debugMode: "off",
  predictionTimer: 0,
  memory: new Map(),
  recent: [],
  context: "neutral",
  prediction: {
    action: "idle",
    context: "neutral",
    confidence: 0,
    nextX: 0,
    nextY: 0
  },
  history: []
};

const smartInventory = {
  enabled: false,
  tick: 0,
  settings: {
    weapon: "balanced",
    reload: "standard",
    pickup: "balanced",
    reserve: "balanced",
    swap: "assist"
  },
  lastAction: "",
  lastActionTimer: 0
};

const AI_SETTING_OPTIONS = {
  frameCount: [
    ["1", "1 MEMORY"],
    ["2", "2 MEMORY"],
    ["2_hold", "HOLD"],
    ["2_fast", "FAST"],
    ["2_safe", "SAFE"]
  ],
  prediction: [
    ["slow", "0.20s"],
    ["standard", "0.10s"],
    ["fast", "0.05s"],
    ["danger", "DANGER"],
    ["boss", "BOSS"]
  ],
  influence: [
    ["tiny", "TINY"],
    ["light", "LIGHT"],
    ["normal", "NORMAL"],
    ["sharp", "SHARP"],
    ["max", "MAX"]
  ],
  use: [
    ["balanced", "BALANCED"],
    ["player", "PLAYER"],
    ["enemy", "ENEMY"],
    ["combat", "COMBAT"],
    ["movement", "MOVE"]
  ],
  debug: [
    ["off", "OFF"],
    ["prediction", "PREDICT"],
    ["frames", "MEMORY"],
    ["inventory", "INV"],
    ["all", "ALL"]
  ]
};

const INVENTORY_SETTING_OPTIONS = {
  weapon: [
    ["balanced", "BALANCED"],
    ["ar", "AR"],
    ["smg", "SMG"],
    ["shotgun", "SHOTGUN"],
    ["pistol", "PISTOL"]
  ],
  reload: [
    ["standard", "STANDARD"],
    ["early", "EARLY"],
    ["late", "LATE"],
    ["safe", "SAFE"],
    ["empty", "EMPTY"]
  ],
  pickup: [
    ["balanced", "BALANCED"],
    ["current", "CURRENT"],
    ["ammo", "AMMO"],
    ["weapons", "WEAPONS"],
    ["rare", "RARE"]
  ],
  reserve: [
    ["balanced", "BALANCED"],
    ["save_ar", "SAVE AR"],
    ["spend_ar", "SPEND AR"],
    ["save_shells", "SAVE SG"],
    ["dump_low", "DUMP LOW"]
  ],
  swap: [
    ["assist", "ASSIST"],
    ["off", "OFF"],
    ["dps", "DPS"],
    ["close", "CLOSE"],
    ["ammo", "AMMO"]
  ]
};

const keys = {
  left: false,
  right: false,
  down: false,
  jump: false,
  moveX: 0,
  moveY: 0
};

const keyboardKeys = {
  left: false,
  right: false,
  down: false,
  jump: false,
  moveX: 0,
  moveY: 0
};

const gamepadControls = {
  connected: false,
  index: -1,
  left: false,
  right: false,
  moveX: 0,
  moveY: 0,
  aimX: 0,
  aimY: 0,
  down: false,
  jump: false,
  shoot: false,
  dash: false,
  combat: false,
  reload: false,
  cycle: false,
  shotgun: false,
  menu: false,
  menuUp: false,
  menuDown: false,
  ragdollGrab: false,
  downStartedAt: 0
};

const input = {
  downStartedAt: 0,
  shootQueued: false,
  reloadQueued: false,
  shotgunQueued: false,
  weaponCycleQueued: false,
  combatQueued: false,
  ragdollGrabQueued: false
};

const mouse = {
  x: 0,
  y: 0,
  worldX: 0,
  worldY: 0,
  active: false
};

const AUDIO_ASSETS = {
  background: "assets/685206__x1shi__video-game-music-seamless.wav",
  menuAccept: "assets/476818__victorium183__menuaccept.wav"
};

const AUDIO_LEVELS = {
  music: 0.14,
  musicMuffled: 0.056,
  sfx: 0.34,
  ambient: 0.018,
  ambientMuffled: 0.008,
  clearFilter: 12000,
  menuFilter: 1500
};

const music = {
  ctx: null,
  master: null,
  sfx: null,
  ambient: null,
  muffle: null,
  track: null,
  trackSource: null,
  trackGain: null,
  trackFallbackTimer: null,
  trackBlocked: false,
  menuAccept: null,
  menuAcceptShots: [],
  step: 0,
  timer: null,
  started: false
};

const musicLoop = {
  stepMs: 156.25,
  bass: [55, 55, 82.41, 55, 73.42, 55, 98, 82.41, 49, 49, 73.42, 49, 65.41, 73.42, 82.41, 98],
  lead: [0, 220, 0, 246.94, 0, 293.66, 0, 246.94, 0, 196, 0, 220, 0, 164.81, 196, 0]
};

let platforms = [];
let enemies = [];
let enemyPool = [];
let playerBullets = [];
let enemyBullets = [];
let powerCubes = [];
let pickups = [];
let particles = [];
let bloodSplatters = [];
let rain = [];
let camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
let shake = 0;
let time = 0;
let lastFrame = 0;
let gameState = "playing";
let score = 0;
let bestComboCount = 0;
let comboCount = 0;
let multiplier = 1;
let checkpoints = [];
let activeCheckpoint = null;
let levelSeed = 1337;
let menuIndex = 0;
let introMenuIndex = 0;
let mobileEnemySpawnCount = 0;
let finale = makeFinaleState();
let bonusClash = makeBonusClashState();
let bossMimicCinema = makeBossMimicCinemaState();
let endlessLoops = 0;
let tipsOpenedAt = 0;
let enemyStreamTimer = 0;
let enemyUpdateTick = 0;
let performanceFrameTime = 1 / 60;
let eliteTakedown = makeEliteTakedownState();
let enemyTakedown = makeEnemyTakedownState();
let sectionStream = makeSectionStreamState();
let secretDrop = { used: false, platform: null, checkpoint: null, trapped: false, whipTimer: 0 };
let styleState = { value: 0, peak: 0, callouts: [] };

const POWERUP = {
  duration: 12,
  playerScale: 1.28,
  weaponScale: 1.38,
  meleeScale: 1.32
};

const playerTactics = {
  gun: 0,
  melee: 0,
  slide: 0,
  air: 0,
  reload: 0,
  last: null,
  recent: []
};

const player = {
  x: 120,
  y: 480,
  w: 30,
  h: 50,
  standH: 50,
  slideH: 26,
  vx: 0,
  vy: 0,
  facing: 1,
  grounded: false,
  wasGrounded: false,
  coyoteTimer: 0,
  jumpBufferTimer: 0,
  canDoubleJump: true,
  wallSide: 0,
  hp: PLAYER_MAX_HP,
  shield: PLAYER_SHIELD_MAX,
  shieldPulse: 0,
  invuln: 0,
  weaponCooldown: 0,
  emptyTimer: 0,
  emptyMessage: "",
  weaponType: "ar",
  ammoBank: { ar: 0, pistol: 0, smg: 0, shotgun: 0 },
  shotgunAmmo: 12,
  magAmmo: WEAPONS.ar.clipSize,
  reserveAmmo: 0,
  reloadTimer: 0,
  reloadFrame: 0,
  powerTimer: 0,
  slideState: "none",
  slideHold: 0,
  slideDir: 1,
  airStrafeWindow: 0,
  airStrafeQueuedSuper: false,
  airStrafeDir: 1,
  airStrafeTimer: 0,
  superStrafeUsed: false,
  easyStrafeUsed: false,
  doubleJumpArmed: false,
  airHangTimer: 0,
  speedBoostTimer: 0,
  airCrouchBoosted: false,
  airTurnDir: 0,
  airTurnCooldown: 0,
  airTurnTimer: 0,
  airBodyAngle: 0,
  airSpin: 0,
  airSpinVelocity: 0,
  turnTimer: 0,
  turnDir: 1,
  runHoldDir: 0,
  runHoldTimer: 0,
  dashTimer: 0,
  dashCooldown: 0,
  meleeCooldown: 0,
  combatAssistTimer: 0,
  meleeTimer: 0,
  meleeType: null,
  meleeDir: 1,
  meleeHit: false,
  meleeFrame: 0,
  aimAngle: 0,
  animFrame: 0,
  poseKey: "idle",
  poseBlend: 1,
  previousPoseFrame: null,
  currentPoseFrame: null,
  ledge: null,
  ledgeClimbTimer: 0,
  ragdoll: null,
  ragdollMode: "none",
  deathRagdoll: false,
  deathAge: 0,
  deathBleedTimer: 0,
  ragdollAngle: 0,
  ragdollSpin: 0,
  ragdollShield: null,
  ragdollShieldFlash: 0,
  rescueGrapples: 0,
  rescueTimer: 0,
  maxDropVy: 0
};

function resize() {
  canvasState.width = window.innerWidth;
  canvasState.height = window.innerHeight;
  canvasState.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvasState.width * canvasState.dpr);
  canvas.height = Math.floor(canvasState.height * canvasState.dpr);
  frameSmoothing.capture.width = canvas.width;
  frameSmoothing.capture.height = canvas.height;
  frameSmoothing.history = [];
  frameSmoothing.initialized = false;
  ctx.setTransform(canvasState.dpr, 0, 0, canvasState.dpr, 0, 0);
  makeRain();
}

function makeRain() {
  rain = [];
  const count = Math.ceil((canvasState.width * canvasState.height) / 9500);
  for (let i = 0; i < count; i += 1) {
    rain.push({
      x: Math.random() * canvasState.width,
      y: Math.random() * canvasState.height,
      speed: 680 + Math.random() * 560,
      len: 12 + Math.random() * 20,
      alpha: 0.08 + Math.random() * 0.18
    });
  }
}

function ensureMusic() {
  if (music.started) {
    if (music.ctx && music.ctx.state === "suspended") {
      music.ctx.resume();
    }
    return;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }

  music.ctx = new AudioCtor();
  music.master = music.ctx.createGain();
  music.sfx = music.ctx.createGain();
  music.muffle = music.ctx.createBiquadFilter();
  music.master.gain.value = AUDIO_LEVELS.music;
  music.sfx.gain.value = AUDIO_LEVELS.sfx;
  music.muffle.type = "lowpass";
  music.muffle.frequency.value = AUDIO_LEVELS.clearFilter;
  music.master.connect(music.muffle).connect(music.ctx.destination);
  music.sfx.connect(music.ctx.destination);
  music.started = true;
  prepareMenuAccept();
  setAudioMuffle(gameState === "intro" || gameState === "paused" || gameState === "dead");
}

function prepareMenuAccept() {
  if (music.menuAccept) {
    return;
  }
  music.menuAccept = new Audio(AUDIO_ASSETS.menuAccept);
  music.menuAccept.preload = "auto";
  music.menuAccept.volume = 0.58;
}

function startBackgroundTrack() {
  if (!music.ctx || !music.master) {
    return;
  }
  if (music.ctx.state === "suspended") {
    music.ctx.resume().catch(() => {});
  }
  if (music.trackFallbackTimer) {
    window.clearTimeout(music.trackFallbackTimer);
    music.trackFallbackTimer = null;
  }
  if (!music.track) {
    const track = new Audio(AUDIO_ASSETS.background);
    const source = music.ctx.createMediaElementSource(track);
    const gain = music.ctx.createGain();
    track.loop = true;
    track.preload = "auto";
    track.volume = 1;
    track.addEventListener("error", () => {
      music.trackBlocked = true;
      startProceduralMusicLoop();
    });
    gain.gain.value = 1;
    source.connect(gain).connect(music.master);
    music.track = track;
    music.trackSource = source;
    music.trackGain = gain;
  }
  const playPromise = music.track.play();
  music.trackFallbackTimer = window.setTimeout(() => {
    music.trackFallbackTimer = null;
    if (!music.track || music.track.paused || music.trackBlocked) {
      startProceduralMusicLoop();
    }
  }, 700);
  if (playPromise) {
    playPromise.then(() => {
      music.trackBlocked = false;
      if (music.trackFallbackTimer) {
        window.clearTimeout(music.trackFallbackTimer);
        music.trackFallbackTimer = null;
      }
      stopProceduralMusicLoop();
    }).catch(() => {
      music.trackBlocked = true;
      if (music.trackFallbackTimer) {
        window.clearTimeout(music.trackFallbackTimer);
        music.trackFallbackTimer = null;
      }
      startProceduralMusicLoop();
    });
  }
}

function pauseBackgroundTrack(resetTime = false) {
  stopProceduralMusicLoop();
  if (music.trackFallbackTimer) {
    window.clearTimeout(music.trackFallbackTimer);
    music.trackFallbackTimer = null;
  }
  if (!music.track) {
    return;
  }
  music.track.pause();
  if (resetTime) {
    music.track.currentTime = 0;
  }
}

function startGameplayAudio() {
  ensureMusic();
  startBackgroundNoise();
  startBackgroundTrack();
  setAudioMuffle(false);
}

function startProceduralMusicLoop() {
  if (!music.ctx || music.timer) {
    return;
  }
  playMusicStep();
  music.timer = window.setInterval(playMusicStep, musicLoop.stepMs);
}

function stopProceduralMusicLoop() {
  if (!music.timer) {
    return;
  }
  window.clearInterval(music.timer);
  music.timer = null;
}

function unlockAudioFromGesture() {
  ensureMusic();
  if (gameState === "playing") {
    startGameplayAudio();
  }
}

function playMenuAccept() {
  ensureMusic();
  prepareMenuAccept();
  if (!music.menuAccept) {
    return;
  }
  const shot = music.menuAccept.cloneNode();
  shot.volume = music.menuAccept.volume;
  music.menuAcceptShots.push(shot);
  shot.addEventListener("ended", () => {
    music.menuAcceptShots = music.menuAcceptShots.filter((item) => item !== shot);
  }, { once: true });
  const playPromise = shot.play();
  if (playPromise) {
    playPromise.catch(() => {
      playClickTransient(0.12);
    });
  }
}

function playMusicStep() {
  if (!music.ctx || !music.master) {
    return;
  }

  const ctxNow = music.ctx.currentTime;
  const step = music.step % 64;
  const bassStep = Math.floor(step / 4) % musicLoop.bass.length;
  const leadStep = step % musicLoop.lead.length;

  if (step % 4 === 0 || step % 4 === 2) {
    playTone(musicLoop.bass[bassStep], 0.28, 0.065, "sawtooth", 0.0001, 0.06);
  }
  if (musicLoop.lead[leadStep] && step % 2 === 1) {
    playTone(musicLoop.lead[leadStep], 0.12, 0.032, "triangle", 0.0001, 0.035);
  }
  if (step % 16 === 0 || step % 16 === 10) {
    playKick(ctxNow);
  }
  if (step % 4 === 3) {
    playHat(ctxNow);
  }
  music.step += 1;
}

function playTone(freq, duration, volume, type = "square", attack = 0.002, release = 0.04) {
  if (!music.ctx || !music.master) {
    return;
  }
  const now = music.ctx.currentTime;
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
  osc.connect(gain).connect(music.master);
  osc.start(now);
  osc.stop(now + duration + release + 0.02);
}

function playKick(now) {
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(118, now);
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(music.master);
  osc.start(now);
  osc.stop(now + 0.18);
}

function playHat(now) {
  const buffer = music.ctx.createBuffer(1, Math.floor(music.ctx.sampleRate * 0.035), music.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = music.ctx.createBufferSource();
  const gain = music.ctx.createGain();
  noise.buffer = buffer;
  gain.gain.value = 0.035;
  noise.connect(gain).connect(music.master);
  noise.start(now);
}

function makeNoise(duration) {
  const length = Math.max(1, Math.floor(music.ctx.sampleRate * duration));
  const buffer = music.ctx.createBuffer(1, length, music.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const fade = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fade * fade;
  }
  const source = music.ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function makeLoopNoise(duration) {
  const length = Math.max(1, Math.floor(music.ctx.sampleRate * duration));
  const buffer = music.ctx.createBuffer(1, length, music.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
    data[sampleIndex] = Math.random() * 2 - 1;
  }
  const source = music.ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function startBackgroundNoise() {
  if (!music.ctx || music.ambient) {
    return;
  }

  const bed = makeLoopNoise(3.5);
  const bedFilter = music.ctx.createBiquadFilter();
  const bedGain = music.ctx.createGain();

  bed.loop = true;
  bedFilter.type = "lowpass";
  bedFilter.frequency.value = 240;
  bedFilter.Q.value = 0.35;
  bedGain.gain.value = AUDIO_LEVELS.ambient;

  bed.connect(bedFilter).connect(bedGain).connect(music.muffle || music.ctx.destination);
  bed.start();
  music.ambient = { bed, bedGain };
}

function playNoise(duration, volume, filterType, frequency, q = 0.8, delay = 0) {
  if (!music.ctx || !music.sfx) {
    return;
  }
  const now = music.ctx.currentTime + delay;
  const source = makeNoise(duration);
  const filter = music.ctx.createBiquadFilter();
  const gain = music.ctx.createGain();
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, now);
  filter.Q.value = q;
  gain.gain.setValueAtTime(Math.max(0.0001, volume), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.connect(filter).connect(gain).connect(music.sfx);
  source.start(now);
}

function playSweep(startFreq, endFreq, duration, volume, type = "sine", delay = 0) {
  if (!music.ctx || !music.sfx) {
    return;
  }
  const now = music.ctx.currentTime + delay;
  const osc = music.ctx.createOscillator();
  const gain = music.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
  gain.gain.setValueAtTime(Math.max(0.0001, volume), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(music.sfx);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playClickTransient(volume = 0.08, delay = 0) {
  playNoise(0.018, volume, "highpass", 2200, 0.5, delay);
}

function playSfx(kind) {
  if (!music.started || !music.ctx) {
    return;
  }
  if (kind === "shoot") {
    playNoise(0.12, 0.28, "bandpass", 1700, 1.6);
    playNoise(0.045, 0.22, "highpass", 3400, 0.7);
    playSweep(190, 48, 0.16, 0.24, "sine");
    playClickTransient(0.2);
  } else if (kind === "reload") {
    playNoise(0.08, 0.09, "highpass", 1900, 0.7);
    playClickTransient(0.12);
    playClickTransient(0.09, 0.42);
  } else if (kind === "dry") {
    playClickTransient(0.16);
    playSweep(420, 230, 0.035, 0.08, "square");
  } else if (kind === "pickup") {
    playSweep(360, 760, 0.09, 0.09, "triangle");
    playClickTransient(0.08);
  } else if (kind === "shotgun") {
    playNoise(0.12, 0.32, "lowpass", 520, 1.25);
    playNoise(0.055, 0.16, "highpass", 2600, 0.8);
    playSweep(120, 36, 0.18, 0.24, "sawtooth");
  } else if (kind === "deflect") {
    playNoise(0.055, 0.2, "highpass", 3200, 0.7);
    playSweep(420, 1200, 0.08, 0.14, "triangle");
    playClickTransient(0.16);
  } else if (kind === "punch") {
    playSweep(115, 62, 0.08, 0.2, "triangle");
    playNoise(0.06, 0.12, "lowpass", 520, 0.9);
  } else if (kind === "elbow") {
    playSweep(132, 58, 0.075, 0.22, "triangle");
    playNoise(0.055, 0.15, "bandpass", 720, 1.05);
  } else if (kind === "kick") {
    playSweep(92, 35, 0.16, 0.28, "sine");
    playNoise(0.1, 0.14, "lowpass", 380, 0.9);
  } else if (kind === "takedownStart") {
    playNoise(0.11, 0.2, "bandpass", 1320, 1.1);
    playSweep(360, 980, 0.12, 0.15, "triangle");
    playClickTransient(0.18, 0.04);
  } else if (kind === "takedownImpact") {
    playSweep(118, 42, 0.11, 0.26, "triangle");
    playNoise(0.09, 0.17, "lowpass", 430, 0.95);
    playClickTransient(0.14);
  } else if (kind === "takedownFinish") {
    playNoise(0.16, 0.26, "bandpass", 740, 1.25);
    playNoise(0.07, 0.18, "highpass", 2600, 0.75, 0.02);
    playSweep(210, 52, 0.2, 0.22, "sawtooth");
  } else if (kind === "strafe") {
    playNoise(0.18, 0.16, "bandpass", 1200, 0.7);
    playSweep(420, 980, 0.14, 0.08, "triangle");
  } else if (kind === "jump") {
    playNoise(0.09, 0.09, "bandpass", 900, 0.6);
    playSweep(210, 420, 0.08, 0.08, "triangle");
  } else if (kind === "doubleJump") {
    playNoise(0.12, 0.13, "bandpass", 1350, 0.8);
    playSweep(260, 720, 0.1, 0.11, "triangle");
  } else if (kind === "ledgeGrab") {
    playClickTransient(0.11);
    playNoise(0.055, 0.1, "highpass", 1150, 0.7);
  } else if (kind === "ledgeClimb") {
    playClickTransient(0.14);
    playClickTransient(0.1, 0.12);
    playNoise(0.12, 0.13, "bandpass", 540, 0.9);
    playSweep(170, 250, 0.08, 0.08, "triangle");
  } else if (kind === "dash") {
    playNoise(0.16, 0.18, "bandpass", 1500, 0.5);
    playSweep(180, 80, 0.12, 0.12, "sawtooth");
  } else if (kind === "land") {
    playSweep(72, 34, 0.13, 0.2, "sine");
    playNoise(0.11, 0.12, "lowpass", 310, 0.8);
  } else if (kind === "hit") {
    playNoise(0.08, 0.18, "bandpass", 900, 1.1);
    playSweep(160, 70, 0.09, 0.13, "triangle");
  } else if (kind === "death") {
    playNoise(0.22, 0.22, "bandpass", 820, 1.4);
    playNoise(0.12, 0.14, "highpass", 2400, 0.8, 0.03);
    playSweep(180, 38, 0.28, 0.22, "sawtooth");
  } else if (kind === "hurt") {
    playNoise(0.14, 0.18, "bandpass", 650, 1);
    playSweep(145, 54, 0.13, 0.14, "triangle");
  }
}

function rand(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function randomUint32() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] >>> 0;
  }
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

function makeRunSeed() {
  const now = Date.now() >>> 0;
  const perf = Math.floor(performance.now() * 1000) >>> 0;
  return (now ^ randomUint32() ^ ((perf << 7) >>> 0) ^ Math.floor(Math.random() * 4294967296)) >>> 0;
}

function makeFinaleState() {
  return {
    phase: "sections",
    chaseStartX: Infinity,
    bossStartX: Infinity,
    chaseTimer: 0,
    crowdJumpTimer: 0,
    bossIntroTimer: 0,
    bossTimer: 0,
    boss: null,
    crowd: [],
    pursuers: [],
    message: "",
    messageTimer: 0,
    armWrestle: {
      active: false,
      timer: 0,
      pull: 0,
      success: false,
      boss: null,
      combo: ""
    }
  };
}

function makeBonusClashState() {
  return {
    active: false,
    enemy: null,
    blueprint: null,
    timer: 0,
    duration: 0,
    action: "",
    label: "",
    hits: 0,
    needed: 1,
    flash: 0,
    resultTimer: 0,
    resultText: ""
  };
}

function makeBossMimicCinemaState() {
  return {
    active: false,
    timer: 0,
    duration: 1.15,
    tactic: "",
    color: "#c66bff",
    enemy: null,
    echoX: 0,
    echoY: 0
  };
}

function makeEliteTakedownState() {
  return {
    active: false,
    enemy: null,
    frame: 0,
    duration: ELITE_TRAITS.takedownFrames / ELITE_TRAITS.takedownFps,
    centerX: 0,
    surfaceY: 0,
    direction: 1,
    flash: 0
  };
}

function makeEnemyTakedownState() {
  return {
    active: false,
    enemy: null,
    frame: 0,
    frameLimit: ENEMY_TAKEDOWN_FRAMES,
    duration: ENEMY_TAKEDOWN_FRAMES / ELITE_TRAITS.takedownFps,
    combo: [],
    centerX: 0,
    surfaceY: 0,
    direction: 1,
    flash: 0
  };
}

function makeSectionStreamState() {
  return {
    rng: null,
    previous: null,
    lastY: 680,
    nextId: 1,
    sections: [],
    appendLockSection: -1,
    lastToolId: "",
    machine: makeLevelMachineState()
  };
}

function resetGame() {
  platforms = [];
  enemies = [];
  enemyPool = [];
  playerBullets = [];
  enemyBullets = [];
  powerCubes = [];
  pickups = [];
  particles = [];
  bloodSplatters = [];
  camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
  shake = 0;
  time = 0;
  score = 0;
  bestComboCount = 0;
  comboCount = 0;
  multiplier = 1;
  introOverlay.classList.remove("hidden");
  gameState = "intro";
  checkpoints = [];
  activeCheckpoint = null;
  levelSeed = makeRunSeed();
  menuIndex = 0;
  introMenuIndex = 0;
  mobileEnemySpawnCount = 0;
  finale = makeFinaleState();
  bonusClash = makeBonusClashState();
  bossMimicCinema = makeBossMimicCinemaState();
  eliteTakedown = makeEliteTakedownState();
  enemyTakedown = makeEnemyTakedownState();
  sectionStream = makeSectionStreamState();
  secretDrop = { used: false, platform: null, checkpoint: null, trapped: false, whipTimer: 0 };
  endlessLoops = 0;
  enemyStreamTimer = 0;
  enemyUpdateTick = 0;
  performanceFrameTime = 1 / 60;
  styleState = { value: 0, peak: 0, callouts: [] };
  aiFrameDirector.memory.clear();
  aiFrameDirector.history = [];
  aiFrameDirector.predictionTimer = 0;
  aiFrameDirector.prediction = {
    action: "idle",
    context: "neutral",
    confidence: 0,
    nextX: player.x,
    nextY: player.y
  };
  retryButton.textContent = CONTROL.controllerOnly ? "PRESS A TO RETRY RUN" : "RETRY RUN";
  pauseOverlay.classList.add("hidden");
  deathOverlay.classList.add("hidden");
  tipsOverlay.classList.add("hidden");
  updateIntroMenuButtons();
  updateMenuButtons();
  pauseBackgroundTrack(true);
  setAudioMuffle(true);
  const startingAmmo = Math.floor(AMMO.minStart + Math.random() * (AMMO.maxStart - AMMO.minStart + 1));
  Object.assign(playerTactics, {
    gun: 0,
    melee: 0,
    slide: 0,
    air: 0,
    reload: 0,
    last: null,
    recent: []
  });
  Object.assign(input, {
    downStartedAt: 0,
    shootQueued: false,
    reloadQueued: false,
    shotgunQueued: false,
    weaponCycleQueued: false,
    combatQueued: false,
    ragdollGrabQueued: false
  });

  Object.assign(player, {
    x: 120,
    y: 500,
    w: 30,
    h: 50,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: false,
    wasGrounded: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    canDoubleJump: true,
    wallSide: 0,
    hp: PLAYER_MAX_HP,
    shield: PLAYER_SHIELD_MAX,
    shieldPulse: 0,
    invuln: 0,
    weaponCooldown: 0,
    emptyTimer: 0,
    emptyMessage: "",
    weaponType: "ar",
    ammoBank: { ar: Math.max(0, startingAmmo - WEAPONS.ar.clipSize), pistol: 18, smg: 36, shotgun: 0 },
    shotgunAmmo: 12,
    magAmmo: Math.min(WEAPONS.ar.clipSize, startingAmmo),
    reserveAmmo: Math.max(0, startingAmmo - WEAPONS.ar.clipSize),
    reloadTimer: 0,
    reloadFrame: 0,
    powerTimer: 0,
    slideState: "none",
    slideHold: 0,
    slideDir: 1,
    airStrafeWindow: 0,
    airStrafeQueuedSuper: false,
    airStrafeDir: 1,
    airStrafeTimer: 0,
    superStrafeUsed: false,
    easyStrafeUsed: false,
    doubleJumpArmed: false,
    airHangTimer: 0,
    speedBoostTimer: 0,
    airCrouchBoosted: false,
    airTurnDir: 0,
    airTurnCooldown: 0,
    airTurnTimer: 0,
    airBodyAngle: 0,
    airSpin: 0,
    airSpinVelocity: 0,
    turnTimer: 0,
    turnDir: 1,
    runHoldDir: 0,
    runHoldTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    meleeCooldown: 0,
    combatAssistTimer: 0,
    meleeTimer: 0,
    meleeType: null,
    meleeDir: 1,
    meleeHit: false,
    meleeFrame: 0,
    aimAngle: 0,
    animFrame: 0,
    poseKey: "idle",
    poseBlend: 1,
    previousPoseFrame: null,
    currentPoseFrame: null,
    ledge: null,
    ledgeClimbTimer: 0,
    ragdoll: null,
    ragdollMode: "none",
    deathRagdoll: false,
    deathAge: 0,
    deathBleedTimer: 0,
    ragdollAngle: 0,
    ragdollSpin: 0,
    ragdollShield: null,
    ragdollShieldFlash: 0,
    rescueGrapples: 0,
    rescueTimer: 0,
    maxDropVy: 0
  });

  generateLevel();
  respawnAtCheckpoint(false);
  makeRain();
}

function addPlatform(x, y, w, h, kind = "slab") {
  const platform = { x, y, w, h, kind };
  platforms.push(platform);
  return platform;
}

function addCaveWall(x, y, w, h) {
  return addPlatform(x, y, w, h, "caveWall");
}

function addSlopePlatform(x, y, w, drop, thickness = 92, kind = "runSlope") {
  const endY = y + drop;
  const platform = {
    x,
    y: Math.min(y, endY),
    w,
    h: Math.abs(drop) + thickness,
    kind,
    slopeStartY: y,
    slopeEndY: endY,
    slopeThickness: thickness
  };
  platforms.push(platform);
  return platform;
}

function addCaveSlope(x, y, w, drop, thickness = 92) {
  return addSlopePlatform(x, y, w, drop, thickness, "caveSlope");
}

function isSlopePlatform(platform) {
  return platform && typeof platform.slopeStartY === "number" && typeof platform.slopeEndY === "number";
}

function platformSurfaceY(platform, x = platform.x + platform.w * 0.5) {
  if (isSlopePlatform(platform)) {
    const t = clamp((x - platform.x) / Math.max(1, platform.w), 0, 1);
    return lerpValue(platform.slopeStartY, platform.slopeEndY, t);
  }
  return platform.y;
}

function areaClear(candidate, padding = 10) {
  const padded = {
    x: candidate.x - padding,
    y: candidate.y - padding,
    w: candidate.w + padding * 2,
    h: candidate.h + padding * 2
  };
  return !platforms.some((platform) => rectsOverlap(padded, platform));
}

function addPlatformSafe(x, y, w, h, kind = "slab", padding = 10) {
  const candidate = { x, y, w, h, kind };
  if (!areaClear(candidate, padding)) {
    return null;
  }
  platforms.push(candidate);
  return candidate;
}

function addPlatformAfter(previous, gap, y, w, h, kind, nextRand, minY = 390, maxY = 1080) {
  const baseX = previous.x + previous.w + gap;
  for (let attempt = 0; attempt < 42; attempt += 1) {
    const x = baseX + attempt * 54;
    const nudge = attempt === 0 ? 0 : (nextRand() - 0.5) * Math.min(132, 54 + attempt * 4);
    const platform = addPlatformSafe(x, clamp(y + nudge, minY, maxY), w, h, kind, 18);
    if (platform) {
      return platform;
    }
  }

  const farX = platforms.reduce((right, platform) => Math.max(right, platform.x + platform.w), baseX) + Math.max(260, gap + 120);
  const fallback = addPlatformSafe(farX, clamp(y, minY, maxY), w, h, kind, 18);
  if (fallback) {
    return fallback;
  }
  return addPlatform(farX + w + 260, clamp(y, minY, maxY), w, h, kind);
}

function addCheckpoint(platform, offset = 48) {
  const x = platform.x + Math.min(offset, platform.w - 40);
  const checkpoint = {
    x,
    y: platformSurfaceY(platform, x),
    platform,
    active: false
  };
  checkpoints.push(checkpoint);
  if (!activeCheckpoint) {
    activeCheckpoint = checkpoint;
    checkpoint.active = true;
  }
  return checkpoint;
}

function findSecretDropX() {
  const baseX = Math.max(camera.x + canvasState.width * 0.16, player.x - SECRET_DROP.width * 0.28);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = baseX + attempt * 180;
    const candidate = { x, y: SECRET_DROP.y - 92, w: SECRET_DROP.width, h: SECRET_DROP.height + 92 };
    if (areaClear(candidate, 30)) {
      return x;
    }
  }
  return baseX + 720;
}

function createSecretDropSection() {
  const x = findSecretDropX();
  const platform = addPlatform(x, SECRET_DROP.y, SECRET_DROP.width, SECRET_DROP.height, "secretArena");
  addPlatform(x - 46, SECRET_DROP.y - 220, 38, 220, "secretWall");
  addPlatform(x + SECRET_DROP.width + 8, SECRET_DROP.y - 220, 38, 220, "secretWall");
  addPlatform(x - 46, SECRET_DROP.y - 254, SECRET_DROP.width + 92, 36, "secretWall");
  const checkpoint = addCheckpoint(platform, 74);
  checkpoint.secretDrop = true;

  addBasementRagdollProps(platform);

  const spacing = SECRET_DROP.width / (SECRET_DROP.enemyCount + 1);
  for (let i = 0; i < SECRET_DROP.enemyCount; i += 1) {
    const enemy = addEnemy("elite", platform, spacing * (i + 1), 5, { ignoreSpacing: true });
    if (!enemy) {
      continue;
    }
    enemy.secretDropGuard = true;
    enemy.basementWhip = true;
    enemy.weaponType = "whip";
    enemy.aiState = "combat";
    enemy.alert = 1;
    enemy.memoryTimer = AI.memoryTime;
    enemy.fireTimer = 999;
    enemy.shootDelay = 999;
    enemy.meleeType = "whip";
    enemy.meleeTimer = 1;
    enemy.meleeCooldown = 0;
    enemy.vx = 0;
  }

  WORLD.levelEndX = Math.max(WORLD.levelEndX, x + SECRET_DROP.width + 640);
  return { platform, checkpoint };
}

function addBasementRagdollProps(platform) {
  const count = SECRET_DROP.propRagdolls;
  const gap = (platform.w - 240) / Math.max(1, count - 1);
  for (let i = 0; i < count; i += 1) {
    const offset = clamp(120 + i * gap, 80, platform.w - 80);
    const prop = addEnemy("soldier", platform, offset, 5, { ignoreSpacing: true });
    if (!prop) {
      continue;
    }
    prop.secretBasementProp = true;
    prop.dead = true;
    prop.ragdollShieldEligible = false;
    prop.ragdollShieldHeld = false;
    prop.ragdollShieldSpent = true;
    startEnemyDeathRagdoll(prop);
    prop.ragdollShieldEligible = false;
    prop.ragdollShieldSpent = true;
    prop.deathAge = 0.35 + i * 0.18;
    prop.deathBleedTimer = 0;
    prop.vx = (i % 2 === 0 ? -1 : 1) * (35 + i * 9);
    prop.vy = -55 - i * 8;
  }
}

function enterSecretDropSection() {
  if (secretDrop.used) {
    return false;
  }
  const section = createSecretDropSection();
  secretDrop = { used: true, platform: section.platform, checkpoint: section.checkpoint, trapped: true, whipTimer: 0.15 };
  if (activeCheckpoint) {
    activeCheckpoint.active = false;
  }
  activeCheckpoint = section.checkpoint;
  activeCheckpoint.active = true;
  stopSlide(true);
  Object.assign(player, {
    x: section.checkpoint.x + 18,
    y: section.checkpoint.y - player.standH - 2,
    h: player.standH,
    vx: 0,
    vy: 0,
    grounded: true,
    wasGrounded: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    canDoubleJump: true,
    wallSide: 0,
    invuln: 999,
    ledge: null,
    ledgeClimbTimer: 0,
    slideState: "none",
    stunTimer: 999
  });
  camera.x = clamp(player.x - canvasState.width * 0.36, 0, Math.max(0, WORLD.levelEndX - canvasState.width));
  camera.y = clamp(player.y - canvasState.height * 0.58, 80, 430);
  enemyBullets = [];
  comboCount = 0;
  multiplier = 1;
  gameState = "captured";
  player.hp = Math.max(1, player.hp);
  finale.message = "BASEMENT TRAP: WHIP GUARDS";
  finale.messageTimer = 2.2;
  finalScore.textContent = "BASEMENT TRAP";
  bestCombo.textContent = "STUNNED - RESTART TO ESCAPE";
  retryButton.textContent = CONTROL.controllerOnly ? "PRESS A TO RESTART" : "RESTART RUN";
  deathOverlay.classList.remove("hidden");
  setAudioMuffle(true);
  shake = Math.max(shake, 10);
  playSfx("land");
  burstParticles(player.x + player.w * 0.5, player.y + player.h, "#ff7a30", 28, 380);
  return true;
}

function addPowerCube(platform, offset = platform.w * 0.55) {
  const size = 34;
  const x = platform.x + clamp(offset, 44, platform.w - size - 44);
  const y = platformSurfaceY(platform, x + size * 0.5) - size - 2;
  powerCubes.push({
    x,
    y,
    w: size,
    h: size,
    baseY: y,
    phase: hashRange(platform.x + offset, 0, Math.PI * 2),
    active: true
  });
}

function enemySpacingRadius(type) {
  return type === "finalBoss" ? ENEMY_MAX_SPACING * 1.2 : type === "boss" ? ENEMY_MAX_SPACING : ENEMY_MIN_SPACING;
}

function enemySpacingBlocked(spawnRect, type) {
  const cx = spawnRect.x + spawnRect.w * 0.5;
  const cy = spawnRect.y + spawnRect.h * 0.5;
  const radius = enemySpacingRadius(type);
  return enemies.some((enemy) => {
    if (enemy.dead) {
      return false;
    }
    const otherRadius = enemySpacingRadius(enemy.type);
    const distance = Math.hypot(enemy.x + enemy.w * 0.5 - cx, enemy.y + enemy.h * 0.5 - cy);
    return distance < Math.max(radius, otherRadius);
  });
}

function platformEnemyCount(platform) {
  return enemies.filter((enemy) => !enemy.dead && enemy.platform === platform).length;
}

function platformEnemyLimit(platform) {
  if (platform.kind === "finaldeck" || platform.kind === "bossgate") {
    return 5;
  }
  if (platform.kind === "caveSlope" || platform.kind === "caveFloor" || platform.kind === "runSlope") {
    return 4;
  }
  return clamp(Math.floor(platform.w / 190), 2, 4);
}

function addSectionEnemy(type, platform, offset, hp, pressure = 0) {
  if (platformEnemyCount(platform) >= platformEnemyLimit(platform) + pressure) {
    return null;
  }
  return addEnemy(type, platform, offset, hp);
}

function chooseEnemyRole(type) {
  if (type === "turret") {
    return "guard";
  }
  if (type === "elite") {
    return Math.random() < 0.55 ? "rusher" : "suppressor";
  }
  if (type === "boss" || type === "finalBoss") {
    return "commander";
  }
  const roll = Math.random();
  return roll < 0.34 ? "rusher" : roll < 0.67 ? "suppressor" : "guard";
}

function acquireEnemyObject() {
  const enemy = enemyPool.pop() || {};
  for (const key of Object.keys(enemy)) {
    delete enemy[key];
  }
  return enemy;
}

function recycleEnemy(enemy) {
  if (!enemy || activeBossEnemy(enemy) || enemyPool.length >= ENEMY_PERF.poolMax) {
    return;
  }
  enemy.dead = true;
  enemyPool.push(enemy);
}

function addEnemy(type, platform, offset, hp, options = {}) {
  const w = type === "finalBoss" ? 64 : type === "boss" ? 44 : 30;
  const h = type === "finalBoss" ? 92 : type === "boss" ? 70 : 52;
  let x = platform.x + Math.min(Math.max(offset, 30), platform.w - w - 30);
  let y = platformSurfaceY(platform, x + w * 0.5) - h;
  let spawnRect = { x, y, w, h };
  const blocked = () => platforms.some((other) => other !== platform && rectsOverlap(spawnRect, other)) || enemies.some((enemy) => !enemy.dead && rectsOverlap(spawnRect, enemy)) || (!options.ignoreSpacing && enemySpacingBlocked(spawnRect, type));
  for (let attempt = 0; attempt < 18 && blocked(); attempt += 1) {
    const lane = attempt % 2 === 0 ? attempt + 1 : 18 - attempt;
    x = platform.x + ENEMY_SPAWN_PADDING + (lane / 19) * Math.max(44, platform.w - w - ENEMY_SPAWN_PADDING * 2);
    y = platformSurfaceY(platform, x + w * 0.5) - h;
    spawnRect = { x, y, w, h };
  }
  if (blocked()) {
    return null;
  }
  const mobileEnemy = type === "soldier" || type === "elite";
  if (mobileEnemy) {
    mobileEnemySpawnCount += 1;
  }
  const airStrafeEnemy = false;
  const baseHp = enemyChallengeHp(type, hp);
  const enemy = acquireEnemyObject();
  Object.assign(enemy, {
    type,
    x,
    y,
    w,
    h,
    hp: baseHp,
    maxHp: baseHp,
    platform,
    vx: type === "finalBoss" ? -52 : type === "soldier" || type === "elite" ? (Math.random() < 0.5 ? -64 : 64) : 0,
    vy: 0,
    grounded: true,
    left: platform.x + 24,
    right: platform.x + platform.w - w - 24,
    fireTimer: type === "dummy" ? 999 : type === "finalBoss" ? 0.45 : type === "boss" ? 0.6 : type === "elite" ? ELITE_TRAITS.fireDelay + Math.random() * 0.18 : AI.regularFireInterval + Math.random() * 0.08,
    shootDelay: type === "dummy" ? 999 : type === "elite" ? ELITE_TRAITS.fireDelay : AI.shootDelay,
    shotWindup: 0,
    pendingShot: false,
    pendingBossBurst: false,
    burstShots: 0,
    burstGap: 0,
    weaponType: type === "turret" || type === "finalBoss" || type === "boss" ? "ar" : type === "elite" ? "smg" : Math.random() < 0.52 ? "ar" : Math.random() < 0.55 ? "smg" : "pistol",
    shield: type === "elite" ? ELITE_TRAITS.shieldShots : 0,
    maxShield: type === "elite" ? ELITE_TRAITS.shieldShots : 0,
    meleeCooldown: 0.65 + Math.random() * 0.3,
    meleeTimer: 0,
    meleeType: null,
    meleeHit: false,
    meleeFrame: 0,
    playerTakedownUsed: false,
    punchHits: 0,
    staggerTimer: 0,
    weakSpotHits: 0,
    squadRole: chooseEnemyRole(type),
    airStrafeEnemy: type === "elite" || airStrafeEnemy,
    airStrafeTimer: 0,
    airStrafeCooldown: 1.2 + Math.random() * 2.2,
    facing: -1,
    aimAngle: 0,
    animFrame: 0,
    aiState: "patrol",
    stateTimer: 0,
    memoryTimer: 0,
    searchTimer: 0,
    patrolDir: Math.random() < 0.5 ? -1 : 1,
    combatDir: Math.random() < 0.5 ? -1 : 1,
    lastSeenX: x,
    lastSeenY: y,
    tacticMemory: { gun: 0, melee: 0, slide: 0, air: 0, reload: 0 },
    masterPlan: { approach: "hold", desiredRange: 340, strafe: 1, confidence: 0.35 },
    decisionTimer: 0.2 + Math.random() * 0.35,
    updateSlot: Math.floor(Math.random() * ENEMY_PERF.batchFrames),
    simpleAiTimer: 0,
    crouchTimer: 0,
    dodgeCooldown: 0,
    alert: 0,
    dead: false,
    deathRagdoll: false,
    hurtFlash: 0
  });
  enemies.push(enemy);
  return enemy;
}

function enemyChallengeHp(type, hp) {
  if (type === "dummy") {
    return hp || 5;
  }
  if (type === "finalBoss") {
    return hp || 20;
  }
  if (type === "boss") {
    return hp || 10;
  }
  const requested = hp || 5;
  if (type === "elite") {
    return Math.max(requested + 3, 8);
  }
  if (type === "soldier") {
    return Math.max(requested + 2, 7);
  }
  return Math.max(requested + 1, 6);
}

function randomEnemyType(nextRand) {
  const roll = nextRand();
  if (roll < 1 / 60) {
    return "elite";
  }
  if (roll < 0.78) {
    return "soldier";
  }
  return "turret";
}

function randomStreamEnemyType() {
  const roll = Math.random();
  if (roll < 1 / 60) {
    return "elite";
  }
  if (roll < 0.78) {
    return "soldier";
  }
  return "turret";
}

function platformSupportsStreamingEnemy(platform) {
  return platform
    && !platform.enemyStreamRetired
    && !ENEMY_STREAM_BLOCKED_KINDS.has(platform.kind)
    && platform.w >= 185;
}

function activeBossEnemy(enemy) {
  return enemy
    && (enemy === finale.boss
      || enemy === bonusClash.enemy
      || enemy === eliteTakedown.enemy
      || enemy === finale.armWrestle.boss
      || (enemy.finalePursuer && finale.phase === "chase"));
}

function addStreamEnemy(platform) {
  if (!platformSupportsStreamingEnemy(platform) || (platform.streamSpawnCount || 0) >= ENEMY_STREAM.maxStreamSpawnsPerPlatform) {
    return null;
  }
  const allowed = platformEnemyLimit(platform);
  if (platformEnemyCount(platform) >= allowed) {
    return null;
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const edgePadding = clamp(platform.w * 0.16, 54, 130);
    const platformEnemies = enemies.filter((enemy) => !enemy.dead && enemy.platform === platform);
    let offset = edgePadding + Math.random() * Math.max(20, platform.w - edgePadding * 2);
    if (platformEnemies.length) {
      const anchor = platformEnemies[Math.floor(Math.random() * platformEnemies.length)];
      const dir = Math.random() < 0.5 ? -1 : 1;
      const spacing = ENEMY_MIN_SPACING + Math.random() * (ENEMY_MAX_SPACING - ENEMY_MIN_SPACING);
      offset = anchor.x - platform.x + anchor.w * 0.5 + dir * spacing;
    }
    offset = clamp(offset, edgePadding, Math.max(edgePadding, platform.w - edgePadding));
    const enemy = addSectionEnemy(randomStreamEnemyType(), platform, offset, 5, 0);
    if (!enemy) {
      continue;
    }
    enemy.streamSpawned = true;
    enemy.fireTimer += 0.2 + Math.random() * 0.45;
    enemy.aiState = "patrol";
    enemy.alert = 0;
    platform.streamSpawnCount = (platform.streamSpawnCount || 0) + 1;
    platform.streamCooldown = 2.2 + Math.random() * 3.4;
    return enemy;
  }

  platform.streamCooldown = 1.1 + Math.random() * 1.6;
  return null;
}

function shuffledFinaleSections(nextRand) {
  const sections = [];
  while (sections.length < FINALE.sectionCount) {
    const batch = [...FINALE_SECTION_KINDS];
    for (let i = batch.length - 1; i > 0; i -= 1) {
      const j = Math.floor(nextRand() * (i + 1));
      [batch[i], batch[j]] = [batch[j], batch[i]];
    }
    sections.push(...batch);
  }
  return sections.slice(0, FINALE.sectionCount);
}

function decorate2DSection(kind, platform, nextRand) {
  const x = platform.x;
  const y = platform.y;
  const width = platform.w;

  if (kind === "wall") {
    addPlatformSafe(x - 42, y - 230, 38, 230, "jumpwall", 4);
    if (nextRand() > 0.36) {
      addPlatformSafe(x + width + 10, y - 180, 36, 180, "jumpwall", 4);
    }
  }

  if (kind === "tunnel" || kind === "underpass") {
    addPlatformSafe(x + width + 8, y - 190, 34, 190, "jumpwall", 4);
  }

  if (["skyhook", "spirewalk", "glassspire", "railspine"].includes(kind)) {
    addPlatformSafe(x + width * 0.22, y - 210, 120, 24, "decoCatwalk", 8);
    addPlatformSafe(x + width * 0.58, y - 300, 148, 24, "decoCatwalk", 8);
    addPlatformSafe(x - 36, y - 220, 32, 220, "jumpwall", 4);
  }

  if (["datacenter", "vaultdoor", "arcade", "blackout"].includes(kind)) {
    addPlatformSafe(x + width * 0.2, y - 150, width * 0.58, 24, "lowceiling", 8);
    addPlatformSafe(x + width + 12, y - 210, 34, 210, "jumpwall", 4);
  }

  if (["waterworks", "coolanttower", "furnace", "stormgarden"].includes(kind)) {
    addPlatformSafe(x + width * 0.33, y - 112, 84, 22, "decoPipe", 8);
    addPlatformSafe(x + width * 0.66, y - 178, 112, 22, "decoPipe", 8);
  }

  if (["cablemaze", "dronebay", "signalnest", "satelliteyard"].includes(kind)) {
    addPlatformSafe(x + 44, y - 245, 30, 245, "jumpwall", 4);
    addPlatformSafe(x + width - 76, y - 205, 30, 205, "jumpwall", 4);
    addPlatformSafe(x + width * 0.38, y - 250, 128, 20, "decoAntenna", 8);
  }

  if (["ruinedmall", "helipad", "maglift", "splitstack"].includes(kind)) {
    addPlatformSafe(x + width * 0.16, y - 88, 112, 22, "slab");
    addPlatformSafe(x + width * 0.48, y - 168, 138, 22, "slab");
    addPlatformSafe(x + width * 0.72, y - 94, 96, 22, "slab");
  }
}

function populate2DSection(kind, platform, index, nextRand) {
  const width = platform.w;
  if (kind === "cave") {
    addCaveDummies(platform, nextRand);
    return;
  }
  const denseKind = ["gauntlet", "drop", "dronebay", "furnace", "railspine", "blackout", "vaultdoor"].includes(kind);
  const verticalKind = ["skyhook", "spirewalk", "glassspire", "cablemaze", "signalnest"].includes(kind);
  const minEnemies = 2;
  const maxEnemies = 4;
  const desiredEnemies = minEnemies + Math.floor(nextRand() * (maxEnemies - minEnemies + 1));
  const pressure = Math.max(0, desiredEnemies - platformEnemyLimit(platform));
  const squadGap = clamp(ENEMY_MIN_SPACING + nextRand() * (ENEMY_MAX_SPACING - ENEMY_MIN_SPACING), ENEMY_MIN_SPACING, ENEMY_MAX_SPACING);
  const squadWidth = squadGap * Math.max(0, desiredEnemies - 1);
  const squadStart = clamp(width * (0.32 + nextRand() * 0.36) - squadWidth * 0.5, 64, Math.max(64, width - squadWidth - 64));
  let spawned = 0;
  for (let attempt = 0; attempt < desiredEnemies * 3 && spawned < desiredEnemies; attempt += 1) {
    const slot = attempt < desiredEnemies ? spawned : Math.floor(nextRand() * desiredEnemies);
    const jitter = (nextRand() - 0.5) * Math.min(18, squadGap * 0.28);
    const offset = clamp(squadStart + slot * squadGap + jitter, 58, width - 58);
    if (addSectionEnemy(randomEnemyType(nextRand), platform, offset, 5, pressure)) {
      spawned += 1;
    }
  }
  if (["helipad", "maglift", "coolanttower", "satelliteyard", "ruinedmall"].includes(kind) && nextRand() > 0.84) {
    addPowerCube(platform, width * (0.32 + nextRand() * 0.36));
  }
}

function addCaveDummies(platform, nextRand) {
  const count = 2 + (nextRand() > 0.5 ? 1 : 0);
  for (let i = 0; i < count; i += 1) {
    const spacing = platform.w / (count + 1);
    const jitter = (nextRand() - 0.5) * Math.min(38, spacing * 0.35);
    const offset = clamp(spacing * (i + 1) + jitter, 70, platform.w - 70);
    const dummy = addEnemy("dummy", platform, offset, 5);
    if (dummy) {
      dummy.caveDummy = true;
      dummy.aiState = "idle";
      dummy.fireTimer = 999;
      dummy.shootDelay = 999;
      dummy.left = platform.x + 54;
      dummy.right = platform.x + platform.w - dummy.w - 54;
      dummy.vx = 0;
      dummy.facing = nextRand() > 0.5 ? 1 : -1;
    }
  }
}

function addChaseEnemy(type, platform, offset, hp) {
  const enemy = addEnemy(type, platform, offset, hp);
  if (enemy) {
    enemy.chaseAmbush = true;
    enemy.fireTimer = Math.min(enemy.fireTimer, 0.55);
  }
  return enemy;
}

function makeEvilTwinBoss(enemy) {
  if (!enemy) {
    return null;
  }
  enemy.evilTwin = true;
  enemy.hp = 40;
  enemy.maxHp = 40;
  enemy.aiState = "combat";
  enemy.fireTimer = 0.75;
  enemy.shootDelay = AI.shootDelay;
  enemy.comboTimer = 0;
  enemy.bossCombo = "mirror";
  enemy.armWrestleCooldown = 2.2;
  enemy.airStrafeCooldown = 0.8;
  enemy.dodgeCooldown = 0.18;
  enemy.left = enemy.platform.x + 60;
  enemy.right = enemy.platform.x + enemy.platform.w - enemy.w - 70;
  return enemy;
}

function addEarlyTwinEncounter(platform) {
  if (!platform) {
    return null;
  }
  const twin = makeEvilTwinBoss(addEnemy("finalBoss", platform, Math.min(platform.w - 120, platform.w * 0.68), 18));
  if (!twin) {
    return null;
  }
  twin.earlyTwin = true;
  twin.hp = 18;
  twin.maxHp = 18;
  twin.fireTimer = 1.1;
  twin.armWrestleCooldown = 0.2;
  twin.weaponType = "ar";
  twin.left = platform.x + 40;
  twin.right = platform.x + platform.w - twin.w - 40;
  addPowerCube(platform, platform.w * 0.3);
  return twin;
}

function bonusBossBlueprint(enemyOrId) {
  const id = typeof enemyOrId === "string" ? enemyOrId : enemyOrId?.bonusBossId;
  return BONUS_BOSSES.find((boss) => boss.id === id) || BONUS_BOSSES[0];
}

function addBonusBossEncounter(platform, index, nextRand) {
  if (!platform || platform.kind === "cave" || platform.kind === "caveSlope") {
    return null;
  }
  const blueprint = BONUS_BOSSES[Math.abs(Math.floor(index / 15)) % BONUS_BOSSES.length];
  const offset = clamp(platform.w * (0.46 + nextRand() * 0.28), 92, Math.max(96, platform.w - 120));
  const boss = addEnemy("boss", platform, offset, blueprint.hp);
  if (!boss) {
    return null;
  }
  boss.bonusBoss = true;
  boss.bonusBossId = blueprint.id;
  boss.bonusBossName = blueprint.name;
  boss.bonusColor = blueprint.color;
  boss.hp = blueprint.hp;
  boss.maxHp = blueprint.hp;
  boss.weaponType = blueprint.weaponType;
  boss.fireTimer = 0.7 + nextRand() * 0.35;
  boss.aiState = "combat";
  boss.alert = 1;
  boss.comboTimer = 0;
  boss.bossCombo = blueprint.id;
  boss.bonusQteCooldown = 1.1 + nextRand() * 1.2;
  boss.left = platform.x + 34;
  boss.right = platform.x + platform.w - boss.w - 34;

  if (platform.w > 520 && platformEnemyCount(platform) < 2) {
    addSectionEnemy(randomEnemyType(nextRand), platform, platform.w * 0.18, 5, 1);
  }
  addPowerCube(platform, platform.w * (nextRand() > 0.5 ? 0.24 : 0.76));
  addCheckpoint(platform, Math.min(90, platform.w * 0.24));
  return boss;
}

function addEndCaveSequence(previousPlatform, nextRand) {
  const caveGap = 100 + Math.floor(nextRand() * 56);
  const caveY = clamp(previousPlatform.y + 8 + Math.floor(nextRand() * 28), 560, 860);
  const slopeX = previousPlatform.x + previousPlatform.w + caveGap;
  const slopeWidth = 1160 + Math.floor(nextRand() * 150);
  const slopeDrop = 235 + Math.floor(nextRand() * 60);
  const slope = addCaveSlope(slopeX, caveY, slopeWidth, slopeDrop, 106);
  const exitFloor = addPlatform(slope.x + slope.w, slope.slopeEndY, 260, 78, "caveFloor");
  addCheckpoint(slope, 82);

  const shellLeft = slope.x - 98;
  const shellRight = exitFloor.x + exitFloor.w + 96;
  const shellTop = slope.slopeStartY - 315;
  const shellBottom = exitFloor.y + exitFloor.h + 70;
  slope.caveShell = {
    left: shellLeft,
    right: shellRight,
    top: shellTop,
    bottom: shellBottom,
    entranceY: slope.slopeStartY,
    exitY: slope.slopeEndY
  };

  const roofPieces = 7;
  for (let i = 0; i < roofPieces; i += 1) {
    const t = i / (roofPieces - 1);
    const x = slope.x + slope.w * t - 82;
    const roofY = lerpValue(slope.slopeStartY - 292, slope.slopeEndY - 250, t) + Math.sin(t * Math.PI) * -34;
    addCaveWall(x, roofY, 190, 52);
  }
  addCaveWall(shellLeft + 18, slope.slopeStartY - 260, 48, 138);
  addCaveWall(shellLeft + 18, slope.slopeStartY + 70, 48, 128);
  addCaveWall(shellRight - 62, exitFloor.y - 265, 52, 126);
  addPowerCube(exitFloor, exitFloor.w * 0.48);
  addCaveDummies(slope, nextRand);
  addCaveDummies(exitFloor, nextRand);
  return exitFloor;
}

function addFinaleSequence(previousPlatform, nextRand) {
  let x = previousPlatform.x + previousPlatform.w + 92;
  let y = clamp(previousPlatform.y + 24, 620, 980);
  let platform = addPlatform(x, y, 390, 84, "chaseStart");
  addCheckpoint(platform, 58);
  addPowerCube(platform, platform.w * 0.58);
  finale.chaseStartX = platform.x - 180;

  for (let i = 0; i < 8; i += 1) {
    x = platform.x + platform.w + 34 + Math.floor(nextRand() * 34);
    y = clamp(y + 22 + Math.floor(nextRand() * 22), 620, 1120);
    const width = 255 + Math.floor(nextRand() * 80);
    platform = addPlatform(x, y, width, 74, "downhill");

    if (i > 1 && nextRand() > 0.18) {
      addChaseEnemy(randomEnemyType(nextRand), platform, width * (0.42 + nextRand() * 0.36), 5);
    }
    if (i === 3 || i === 6) {
      addCheckpoint(platform, Math.min(80, platform.w * 0.33));
    }
  }

  const bossGate = addPlatform(platform.x + platform.w + 86, clamp(y + 20, 640, 1130), 380, 98, "bossgate");
  addCheckpoint(bossGate, 70);
  addPlatformSafe(bossGate.x - 54, bossGate.y - 260, 46, 260, "jumpwall", 4);
  finale.bossStartX = bossGate.x + bossGate.w - 80;

  const finalPlatform = addPlatform(bossGate.x + bossGate.w + 120, clamp(bossGate.y, 640, 1130), 960, 118, "finaldeck");
  addCheckpoint(finalPlatform, 82);
  addPowerCube(finalPlatform, 250);
  addPlatformSafe(finalPlatform.x - 58, finalPlatform.y - 290, 52, 290, "jumpwall", 4);
  finale.boss = makeEvilTwinBoss(addEnemy("finalBoss", finalPlatform, finalPlatform.w - 220, 40));
  WORLD.levelEndX = finalPlatform.x + finalPlatform.w + 520;
}

function randomRange(range, nextRand) {
  return range[0] + nextRand() * (range[1] - range[0]);
}

function makeLevelCodeModel() {
  return {
    toolCount: STREAM_SECTION_TOOLS.length,
    featureCatalog: [...STREAM_FEATURE_CATALOG],
    finaleKindCount: FINALE_SECTION_KINDS.length,
    bossKinds: BONUS_BOSSES.map((boss) => boss.id),
    weaponKinds: Object.keys(WEAPONS),
    movement: {
      maxRun: MOVE.maxRun,
      maxAir: MOVE.maxAir,
      airStrafeX: MOVE.airStrafeX,
      airStrafeHang: MOVE.easyStrafeHang,
      dashSpeed: MOVE.dashSpeed
    }
  };
}

function makeLevelMachineState() {
  return {
    codeModel: makeLevelCodeModel(),
    toolHistory: [],
    featureHistory: [],
    toolUse: new Map(),
    featureUse: new Map(),
    accepted: 0,
    rejected: 0
  };
}

function rememberLevelMachineTool(machine, tool) {
  if (!machine || !tool) {
    return;
  }
  const identity = tool.baseId || tool.id;
  machine.toolHistory.unshift(identity);
  machine.toolHistory.length = Math.min(machine.toolHistory.length, LEVEL_MACHINE_CONFIG.maxHistory);
  machine.toolUse.set(identity, (machine.toolUse.get(identity) || 0) + 1);
  for (const feature of tool.features || []) {
    machine.featureHistory.unshift(feature);
    machine.featureUse.set(feature, (machine.featureUse.get(feature) || 0) + 1);
  }
  machine.featureHistory.length = Math.min(machine.featureHistory.length, LEVEL_MACHINE_CONFIG.maxHistory * 3);
  machine.accepted += 1;
}

function machineRangeMutate(range, nextRand, minValue, maxValue, loose = 0.22) {
  const center = (range[0] + range[1]) * 0.5;
  const half = Math.max(12, (range[1] - range[0]) * (0.72 + nextRand() * 0.78));
  const shift = (nextRand() - 0.5) * (range[1] - range[0]) * loose * 2;
  const a = clamp(center + shift - half, minValue, maxValue);
  const b = clamp(center + shift + half, minValue, maxValue);
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  if (high - low < 4) {
    return [Math.max(minValue, low - 4), Math.min(maxValue, high + 4)];
  }
  return [low, high];
}

function chooseMachineFeature(machine, nextRand, currentFeatures) {
  let best = STREAM_FEATURE_CATALOG[Math.floor(nextRand() * STREAM_FEATURE_CATALOG.length)];
  let bestScore = -Infinity;
  for (const feature of STREAM_FEATURE_CATALOG) {
    if (currentFeatures.includes(feature)) {
      continue;
    }
    let score = nextRand() * 2;
    score -= (machine?.featureUse.get(feature) || 0) * 0.18;
    if (machine?.featureHistory.slice(0, 8).includes(feature)) {
      score -= 1.1;
    }
    if ((feature === "airGate" || feature === "farLedge") && player.airStrafeTimer > 0) {
      score += 1.2;
    }
    if ((feature === "lowTunnel" || feature === "slideGap") && keys.down) {
      score += 0.9;
    }
    if (score > bestScore) {
      bestScore = score;
      best = feature;
    }
  }
  return best;
}

function sanitizeMachineFeatures(features, nextRand) {
  const unique = [...new Set(features.filter(Boolean))];
  if (unique.includes("slideGap") && !unique.includes("ceiling")) {
    unique.push("ceiling");
  }
  const hard = unique.filter((feature) => ["airGate", "leftWall", "rightWall", "wallPost", "farLedge"].includes(feature));
  while (hard.length > 2) {
    const removed = hard.pop();
    unique.splice(unique.indexOf(removed), 1);
  }
  while (unique.length > LEVEL_MACHINE_CONFIG.maxFeatures) {
    const removableIndex = Math.floor(nextRand() * unique.length);
    unique.splice(removableIndex, 1);
  }
  return unique.length ? unique : ["longFloor", "ledgeMid"];
}

function mutateStreamTool(base, index, nextRand) {
  const machine = sectionStream.machine;
  let features = [...base.features];
  if (features.length > 2 && nextRand() < 0.44) {
    features.splice(Math.floor(nextRand() * features.length), 1);
  }
  const targetCount = clamp(2 + Math.floor(nextRand() * 4), 2, LEVEL_MACHINE_CONFIG.maxFeatures);
  while (features.length < targetCount) {
    features.push(chooseMachineFeature(machine, nextRand, features));
  }
  features = sanitizeMachineFeatures(features, nextRand);

  return {
    id: `machine-${base.id}-${index}-${Math.floor(nextRand() * 46656).toString(36)}`,
    baseId: base.id,
    generated: true,
    width: machineRangeMutate(base.width, nextRand, SECTION_STREAM_CONFIG.minSectionWidth * 0.74, SECTION_STREAM_CONFIG.maxSectionWidth, 0.32),
    gap: machineRangeMutate(base.gap, nextRand, 58, 270, 0.42),
    y: machineRangeMutate(base.y, nextRand, -175, 155, 0.62),
    features
  };
}

function scoreStreamToolCandidate(tool, index, nextRand) {
  const recent = recentActionCounts();
  const airBias = recent.air + (player.airStrafeTimer > 0 ? 2 : 0);
  const slideBias = recent.slide + (keys.down ? 1 : 0);
  const reloadBias = recent.reload;
  const machine = sectionStream.machine;
  const identity = tool.baseId || tool.id;
  const recentTools = machine?.toolHistory || [];
  const recentFeatures = machine?.featureHistory || [];
  let score = nextRand() * 3.6;

  if (tool.generated) {
    score += 0.7 + nextRand() * 0.55;
  }
  if (tool.features.includes("airGate") || tool.features.includes("farLedge")) {
    score += airBias * 0.85;
  }
  if (tool.features.includes("lowTunnel") || tool.features.includes("slideGap")) {
    score += slideBias * 0.78;
  }
  if (tool.features.includes("longFloor") || tool.features.includes("splitLane")) {
    score += reloadBias * 0.38;
  }
  if (index > 6 && (tool.features.includes("airGate") || tool.features.includes("wallPost"))) {
    score += 0.45;
  }
  if (index < 4 && (tool.features.includes("airGate") || tool.features.includes("leftWall") || tool.features.includes("rightWall"))) {
    score -= 1.2;
  }
  if (identity === sectionStream.lastToolId) {
    score -= 4.8;
  }
  if (recentTools.slice(0, 4).includes(identity)) {
    score -= 2.1;
  }
  score -= (machine?.toolUse.get(identity) || 0) * 0.12;
  for (const feature of tool.features) {
    if (recentFeatures.slice(0, 10).includes(feature)) {
      score -= 0.34;
    }
    score -= (machine?.featureUse.get(feature) || 0) * 0.035;
  }
  const gapMax = tool.gap[1];
  if (gapMax > 220 && !tool.features.includes("airGate") && !tool.features.includes("farLedge")) {
    score -= 1.4;
  }
  const routeHeight = Math.max(Math.abs(tool.y[0]), Math.abs(tool.y[1]));
  if (routeHeight > 130 && (tool.features.includes("stepUp") || tool.features.includes("upperDeck") || tool.features.includes("airGate"))) {
    score += 0.45;
  }
  score += (3 - Math.abs((tool.features.length || 1) - 3)) * 0.22;
  return score;
}

function chooseStreamTool(index, nextRand) {
  const candidates = [];
  for (let i = 0; i < LEVEL_MACHINE_CONFIG.candidateCount; i += 1) {
    const base = STREAM_SECTION_TOOLS[Math.floor(nextRand() * STREAM_SECTION_TOOLS.length)];
    candidates.push(nextRand() < LEVEL_MACHINE_CONFIG.generatedChance ? mutateStreamTool(base, index, nextRand) : base);
  }
  if (index % 5 === 0) {
    candidates.push(STREAM_SECTION_TOOLS[Math.floor(nextRand() * STREAM_SECTION_TOOLS.length)]);
  }

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const score = scoreStreamToolCandidate(candidate, index, nextRand);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  sectionStream.lastToolId = best.baseId || best.id;
  rememberLevelMachineTool(sectionStream.machine, best);
  return best;
}

function tagSectionPlatform(platform, sectionId, role = "main") {
  if (!platform) {
    return null;
  }
  platform.sectionId = sectionId;
  platform.streamRole = role;
  return platform;
}

function addSectionPlatform(section, platform, role = "tool") {
  if (!platform) {
    return null;
  }
  tagSectionPlatform(platform, section.id, role);
  section.platforms.push(platform);
  section.startX = Math.min(section.startX, platform.x);
  section.endX = Math.max(section.endX, platform.x + platform.w);
  return platform;
}

function addToolPlatform(section, x, y, w, h, kind = "slab", padding = 12) {
  return addSectionPlatform(section, addPlatformSafe(x, y, w, h, kind, padding), "tool");
}

function sectionThemeForTool(tool) {
  const identity = tool.baseId || tool.id || "";
  return SECTION_THEMES.find((theme) => theme.ids.some((id) => identity.includes(id))) || SECTION_THEMES[Math.abs(identity.length + sectionStream.nextId) % SECTION_THEMES.length];
}

function addSectionRiskLane(section, platform, theme, nextRand) {
  if (platform.w < 720 || nextRand() < 0.38) {
    return;
  }
  const laneW = clamp(platform.w * (0.24 + nextRand() * 0.1), 190, 330);
  const laneX = platform.x + platform.w * (0.48 + nextRand() * 0.22);
  const laneY = platform.y - (185 + nextRand() * 95);
  const risk = addToolPlatform(section, laneX, laneY, laneW, 22, "riskLane", 12);
  if (!risk) {
    return;
  }
  risk.theme = theme;
  risk.riskReward = true;
  const rewardX = risk.x + risk.w * 0.5;
  const rewardY = risk.y - 24;
  if (nextRand() < RESCUE_GRAPPLE.spawnChance) {
    spawnPickup("grapple", rewardX, rewardY, 1);
  } else if (nextRand() < 0.58) {
    spawnPickup("shield", rewardX, rewardY, SHIELD_PICKUP_VALUE);
  } else {
    const type = nextRand() < 0.55 ? "shotgun" : nextRand() < 0.75 ? "smg" : "ar";
    spawnPickup("ammo", rewardX, rewardY, type === "shotgun" ? 8 : type === "smg" ? 34 : 22, type);
  }
}

function decorateStreamingFeature(section, feature, platform, nextRand) {
  const x = platform.x;
  const y = platform.y;
  const width = platform.w;
  if (feature === "leftWall") addToolPlatform(section, x - 42, y - 240, 34, 240, "jumpwall", 4);
  if (feature === "rightWall") addToolPlatform(section, x + width + 12, y - 220, 34, 220, "jumpwall", 4);
  if (feature === "wallPost") addToolPlatform(section, x + width * (0.35 + nextRand() * 0.35), y - 210, 30, 210, "jumpwall", 4);
  if (feature === "ledgeHigh") addToolPlatform(section, x + width * 0.18, y - 210, 170, 24, "ledgeHigh", 8);
  if (feature === "ledgeMid") addToolPlatform(section, x + width * 0.46, y - 145, 190, 24, "ledgeMid", 8);
  if (feature === "ledgeLow") addToolPlatform(section, x + width * 0.66, y - 76, 150, 22, "ledgeLow", 8);
  if (feature === "farLedge") addToolPlatform(section, x + width - 230, y - 190, 205, 24, "farLedge", 8);
  if (feature === "upperDeck") addToolPlatform(section, x + width * 0.22, y - 245, width * 0.44, 24, "upperDeck", 10);
  if (feature === "lowerDeck") addToolPlatform(section, x + width * 0.48, y + 100, width * 0.38, 24, "lowerDeck", 10);
  if (feature === "ceiling") addToolPlatform(section, x + width * 0.2, y - 154, width * 0.58, 24, "lowceiling", 8);
  if (feature === "lowTunnel") addToolPlatform(section, x + width * 0.56, y - 104, width * 0.32, 22, "lowceiling", 8);
  if (feature === "slideGap") addToolPlatform(section, x + width * 0.18, y - 92, 120, 22, "lowceiling", 8);
  if (feature === "airGate") {
    addToolPlatform(section, x + width * 0.34, y - 252, 38, 252, "jumpwall", 4);
    addToolPlatform(section, x + width * 0.62, y - 210, 38, 210, "jumpwall", 4);
  }
  if (feature === "stagger") {
    addToolPlatform(section, x + width * 0.2, y - 92, 125, 22, "stagger", 8);
    addToolPlatform(section, x + width * 0.45, y - 172, 145, 22, "stagger", 8);
    addToolPlatform(section, x + width * 0.7, y - 116, 125, 22, "stagger", 8);
  }
  if (feature === "stepUp") addToolPlatform(section, x + width * 0.2, y - 78, 160, 24, "stepUp", 8);
  if (feature === "stepUp2") addToolPlatform(section, x + width * 0.48, y - 148, 175, 24, "stepUp", 8);
  if (feature === "stepDown") addToolPlatform(section, x + width * 0.26, y + 88, 180, 24, "stepDown", 8);
  if (feature === "stepDown2") addToolPlatform(section, x + width * 0.57, y + 154, 180, 24, "stepDown", 8);
  if (feature === "splitLane") {
    addToolPlatform(section, x + width * 0.08, y - 170, width * 0.33, 24, "splitLane", 8);
    addToolPlatform(section, x + width * 0.57, y - 92, width * 0.32, 24, "splitLane", 8);
  }
  if (feature === "pipes") {
    addToolPlatform(section, x + width * 0.28, y - 112, 120, 22, "decoPipe", 8);
    addToolPlatform(section, x + width * 0.62, y - 176, 150, 22, "decoPipe", 8);
  }
  if (feature === "antenna") addToolPlatform(section, x + width * 0.42, y - 266, 150, 22, "decoAntenna", 8);
  if (feature === "cube" && nextRand() > 0.45) addPowerCube(platform, width * (0.35 + nextRand() * 0.3));
}

function buildStreamingSection(tool, index, nextRand) {
  const previous = sectionStream.previous;
  const theme = sectionThemeForTool(tool);
  const section = {
    id: sectionStream.nextId,
    tool: tool.id,
    baseTool: tool.baseId || tool.id,
    theme,
    generated: !!tool.generated,
    platforms: [],
    startX: Infinity,
    endX: -Infinity,
    main: null
  };
  sectionStream.nextId += 1;

  const gap = Math.round(randomRange(tool.gap, nextRand));
  const widthScale = randomRange([1.12, 1.42], nextRand);
  const width = Math.round(clamp(randomRange(tool.width, nextRand) * widthScale, SECTION_STREAM_CONFIG.minSectionWidth, SECTION_STREAM_CONFIG.maxSectionWidth));
  const yDelta = Math.round(randomRange(tool.y, nextRand));
  const targetY = clamp(sectionStream.lastY + yDelta + Math.sin((index + levelSeed) * 0.71) * 24, 430, 1080);
  const startX = previous.x + previous.w + gap;
  let platform;

  if (tool.features.includes("slopeUp") || tool.features.includes("slopeDown")) {
    const slopeWidth = Math.round(clamp(width * (0.46 + nextRand() * 0.12), 420, width - 420));
    const startY = clamp(sectionStream.lastY + Math.round((nextRand() - 0.5) * 48), 430, 1080);
    const desiredDrop = tool.features.includes("slopeUp")
      ? -Math.abs(targetY - startY || randomRange([90, 170], nextRand))
      : Math.abs(targetY - startY || randomRange([90, 190], nextRand));
    const slope = addSlopePlatform(startX, startY, slopeWidth, desiredDrop, 96, "runSlope");
    addSectionPlatform(section, slope, "slope");
    const landingY = clamp(slope.slopeEndY, 430, 1080);
    platform = addPlatform(slope.x + slope.w + 24, landingY, Math.max(520, width - slopeWidth), 88, tool.id);
    addSectionPlatform(section, platform, "main");
  } else {
    platform = addPlatformAfter(previous, gap, targetY, width, 88, tool.id, nextRand, 430, 1080);
    addSectionPlatform(section, platform, "main");
  }

  section.main = platform;
  platform.theme = theme;
  sectionStream.previous = platform;
  sectionStream.lastY = platform.y;
  for (const feature of tool.features) {
    decorateStreamingFeature(section, feature, platform, nextRand);
  }
  addSectionRiskLane(section, platform, theme, nextRand);

  populate2DSection(tool.id, platform, index, nextRand);
  addCheckpoint(platform, Math.min(120, platform.w * 0.16));
  if (index > 5 && index % 13 === 6 && nextRand() > 0.35) {
    addBonusBossEncounter(platform, index, nextRand);
  } else if (index % 7 === 3 && nextRand() > 0.45) {
    addPowerCube(platform, platform.w * (0.38 + nextRand() * 0.32));
  }

  section.startX = Math.min(...section.platforms.map((p) => p.x));
  section.endX = Math.max(...section.platforms.map((p) => p.x + p.w));
  return section;
}

function appendStreamingSections(count = SECTION_STREAM_CONFIG.appendSections) {
  const nextRand = sectionStream.rng || rand(levelSeed);
  sectionStream.rng = nextRand;
  for (let i = 0; i < count; i += 1) {
    const index = sectionStream.nextId;
    const tool = chooseStreamTool(index, nextRand);
    const section = buildStreamingSection(tool, index, nextRand);
    sectionStream.sections.push(section);
  }
  WORLD.levelEndX = Math.max(WORLD.levelEndX, sectionStream.previous.x + sectionStream.previous.w + canvasState.width * 2.6);
}

function currentStreamTriggerSection() {
  if (!sectionStream.sections.length) {
    return null;
  }
  return sectionStream.sections[Math.min(SECTION_STREAM_CONFIG.appendAtActiveIndex, sectionStream.sections.length - 1)] || null;
}

function refreshActiveCheckpoint() {
  if (activeCheckpoint && checkpoints.includes(activeCheckpoint)) {
    return;
  }
  let best = null;
  const playerCenterX = player.x + player.w * 0.5;
  for (const checkpoint of checkpoints) {
    checkpoint.active = false;
    if (checkpoint.x <= playerCenterX + 40 && (!best || checkpoint.x > best.x)) {
      best = checkpoint;
    }
  }
  activeCheckpoint = best || checkpoints[0] || null;
  if (activeCheckpoint) {
    activeCheckpoint.active = true;
  }
}

function retireStreamSectionsBehindCamera() {
  if (sectionStream.sections.length <= SECTION_STREAM_CONFIG.initialSections + 1) {
    return;
  }
  const safeX = camera.x - SECTION_STREAM_CONFIG.keepBehind;
  const retireCount = Math.min(SECTION_STREAM_CONFIG.retireBatch, sectionStream.sections.length - SECTION_STREAM_CONFIG.initialSections);
  if (retireCount <= 0) {
    return;
  }
  const candidate = sectionStream.sections[retireCount - 1];
  if (!candidate || candidate.endX > safeX) {
    return;
  }
  const retired = sectionStream.sections.splice(0, retireCount);
  for (const section of retired) {
    for (const platform of section.platforms) {
      platform.enemyStreamRetired = true;
      platform.streamRetireTimer = ENEMY_STREAM.retireDelay;
    }
  }
}

function updateSectionStreaming() {
  if (!sectionStream.previous || gameState !== "playing") {
    return;
  }
  const trigger = currentStreamTriggerSection();
  const playerCenterX = player.x + player.w * 0.5;
  if (trigger && playerCenterX >= trigger.startX && sectionStream.appendLockSection !== trigger.id) {
    sectionStream.appendLockSection = trigger.id;
    appendStreamingSections(SECTION_STREAM_CONFIG.appendSections);
  }
  retireStreamSectionsBehindCamera();
}

function generateLevel() {
  const nextRand = rand(levelSeed);
  sectionStream = makeSectionStreamState();
  sectionStream.rng = nextRand;
  const start = addPlatform(-200, 680, 1120, 96, "start");
  tagSectionPlatform(start, 0, "start");
  addCheckpoint(start, 260);
  sectionStream.previous = start;
  sectionStream.lastY = start.y;
  sectionStream.sections.push({
    id: 0,
    tool: "start",
    platforms: [start],
    startX: start.x,
    endX: start.x + start.w,
    main: start
  });
  finale = makeFinaleState();
  appendStreamingSections(SECTION_STREAM_CONFIG.initialSections);
}

function findRightmostProgressPlatform() {
  let best = null;
  let bestRight = -Infinity;
  const blockedKinds = new Set(["jumpwall", "caveWall", "lowceiling", "routeBlocker", "decoCatwalk", "decoPipe", "decoAntenna"]);
  for (const platform of platforms) {
    if (blockedKinds.has(platform.kind)) {
      continue;
    }
    const right = platform.x + platform.w;
    if (right > bestRight) {
      bestRight = right;
      best = platform;
    }
  }
  return best || platforms[platforms.length - 1] || null;
}

function appendEndlessRunBatch() {
  const previous = findRightmostProgressPlatform();
  if (!previous) {
    return;
  }

  const loopIndex = endlessLoops + 1;
  const loopSeed = (levelSeed + loopIndex * 1000003 + Math.floor(time * 1000) + score * 97) >>> 0;
  const nextRand = rand(loopSeed);
  const previousLevelEnd = WORLD.levelEndX;
  let p = previous;
  let y = clamp(platformSurfaceY(previous, previous.x + previous.w * 0.5) + Math.floor((nextRand() - 0.5) * 84), 430, 1080);
  const sections = shuffledFinaleSections(nextRand).slice(0, ENDLESS_BATCH_SECTION_COUNT);

  endlessLoops = loopIndex;
  finale = makeFinaleState();
  finale.message = `ENDLESS LOOP ${endlessLoops + 1}`;
  finale.messageTimer = 2.7;
  enemyBullets = [];

  for (let i = 0; i < sections.length; i += 1) {
    const kind = sections[i];
    const gap = 58 + Math.floor(nextRand() * 112);
    const width = 300 + Math.floor(nextRand() * 245);
    const wave = Math.sin((i + 1 + endlessLoops * 3) * 0.76 + nextRand() * 1.8) * 54;
    const drop = 10 + Math.floor(nextRand() * 28) + (kind === "drop" || kind === "rampchain" ? 18 : 0);
    y = clamp(y + drop + wave, 430, 1080);
    const sectionWidth = kind === "cave" ? Math.max(width, 560) : width;
    p = addPlatformAfter(p, gap, y, sectionWidth, 88, kind, nextRand, 430, 1080);
    y = p.y;
    decorate2DSection(kind, p, nextRand);
    populate2DSection(kind, p, FINALE.sectionCount + endlessLoops * ENDLESS_BATCH_SECTION_COUNT + i, nextRand);
    if (i > 3 && i % 20 === 7) {
      addBonusBossEncounter(p, FINALE.sectionCount + endlessLoops * ENDLESS_BATCH_SECTION_COUNT + i, nextRand);
    }

    if (i % 12 === 1) {
      addCheckpoint(p, Math.min(90, p.w * 0.32));
    }
    if (i % 14 === 4) {
      addPowerCube(p, p.w * (0.34 + nextRand() * 0.38));
    }
  }

  p = addEndCaveSequence(p, nextRand);
  addFinaleSequence(p, nextRand);
  WORLD.levelEndX = Math.max(previousLevelEnd, WORLD.levelEndX, (finale.boss?.platform.x || p.x) + 1800);
  shake = Math.max(shake, 12);
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.35, "#b8fff3", 54, 520);
  playSfx("pickup");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function signNonZero(value) {
  return value < 0 ? -1 : 1;
}

function playerPowered() {
  return player.powerTimer > 0;
}

function playerVisualScale() {
  return playerPowered() ? POWERUP.playerScale : 1;
}

function playerWeaponScale() {
  return playerPowered() ? POWERUP.weaponScale : 1;
}

function weaponConfig(type = player.weaponType) {
  return WEAPONS[type] || WEAPONS.ar;
}

function currentClipSize() {
  return weaponConfig().clipSize;
}

function currentFireCooldown() {
  return weaponConfig().fireCooldown;
}

function currentReloadFrames() {
  return weaponConfig().reloadFrames;
}

function currentReloadDuration() {
  return weaponConfig().reloadDuration;
}

function syncCurrentReserveToBank() {
  if (!player.ammoBank) {
    player.ammoBank = { ar: 0, pistol: 0, smg: 0, shotgun: 0 };
  }
  player.ammoBank[player.weaponType || "ar"] = Math.max(0, player.reserveAmmo || 0);
}

function collectWeaponAmmo(type, amount) {
  const weaponType = WEAPONS[type] ? type : player.weaponType || "ar";
  if (!player.ammoBank) {
    player.ammoBank = { ar: 0, pistol: 0, smg: 0, shotgun: 0 };
  }
  const cappedAmount = Math.max(0, Math.floor(amount || 0));
  player.ammoBank[weaponType] = Math.min(999, (player.ammoBank[weaponType] || 0) + cappedAmount);
  if (weaponType === "shotgun" && player.weaponType !== "shotgun") {
    player.shotgunAmmo = Math.min(99, (player.shotgunAmmo || 0) + Math.max(1, Math.floor(cappedAmount * 0.45)));
  }
  if (weaponType === player.weaponType) {
    player.reserveAmmo = player.ammoBank[weaponType];
    if (player.magAmmo <= 0) {
      startReload();
    }
  }
  if (cappedAmount > 0) {
    clearStaleAmmoWarning();
  }
  if (smartInventory.enabled) {
    smartInventory.lastAction = `${weaponConfig(weaponType).label} AMMO +${cappedAmount}`;
    smartInventory.lastActionTimer = 1.1;
  }
}

function restorePlayerShield(amount = SHIELD_PICKUP_VALUE) {
  const before = player.shield;
  player.shield = Math.min(PLAYER_SHIELD_MAX, player.shield + amount);
  if (player.shield > before) {
    player.shieldPulse = 0.34;
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.42, "#b8fff3", 24, 330);
    if (smartInventory.enabled) {
      smartInventory.lastAction = `SHIELD +${amount}`;
      smartInventory.lastActionTimer = 1.15;
    }
  }
}

function equipWeapon(type, spareAmmo = 0, quiet = false) {
  const weapon = weaponConfig(type);
  syncCurrentReserveToBank();
  player.weaponType = WEAPONS[type] ? type : "ar";
  player.reserveAmmo = Math.min(999, (player.ammoBank[player.weaponType] || 0) + Math.max(0, spareAmmo));
  player.ammoBank[player.weaponType] = player.reserveAmmo;
  player.magAmmo = Math.min(weapon.clipSize, Math.max(1, Math.floor(weapon.clipSize * 0.65)));
  player.reloadTimer = 0;
  player.reloadFrame = 0;
  player.emptyTimer = 0;
  player.emptyMessage = "";
  player.weaponCooldown = Math.max(player.weaponCooldown, 0.12);
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.42, weapon.color, 18, 260);
  if (!quiet && smartInventory.enabled) {
    smartInventory.lastAction = `PICKED ${weapon.label}`;
    smartInventory.lastActionTimer = 1.2;
  }
}

function stashCurrentWeaponAmmo() {
  if (!player.ammoBank) {
    player.ammoBank = { ar: 0, pistol: 0, smg: 0, shotgun: 0 };
  }
  const currentType = WEAPONS[player.weaponType] ? player.weaponType : "ar";
  player.ammoBank[currentType] = Math.min(999, Math.max(0, player.reserveAmmo || 0) + Math.max(0, player.magAmmo || 0));
}

function switchWeaponFromBank(type) {
  if (!WEAPONS[type] || type === player.weaponType) {
    return false;
  }
  stashCurrentWeaponAmmo();
  const totalAmmo = Math.max(0, player.ammoBank[type] || 0);
  const weapon = weaponConfig(type);
  player.weaponType = type;
  player.magAmmo = Math.min(weapon.clipSize, totalAmmo);
  player.reserveAmmo = Math.max(0, totalAmmo - player.magAmmo);
  player.ammoBank[type] = player.reserveAmmo;
  player.reloadTimer = 0;
  player.reloadFrame = 0;
  player.emptyTimer = 0;
  player.emptyMessage = "";
  player.weaponCooldown = Math.max(player.weaponCooldown, 0.1);
  smartInventory.lastAction = `${weapon.label} READY`;
  smartInventory.lastActionTimer = 1;
  playSfx("pickup");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.42, weapon.color, 14, 220);
  return true;
}

function cycleWeaponRight() {
  if (gameState !== "playing" || player.meleeType) {
    return false;
  }
  const currentIndex = Math.max(0, WEAPON_CYCLE_ORDER.indexOf(player.weaponType));
  for (let step = 1; step <= WEAPON_CYCLE_ORDER.length; step += 1) {
    const type = WEAPON_CYCLE_ORDER[(currentIndex + step) % WEAPON_CYCLE_ORDER.length];
    if (type === player.weaponType) {
      continue;
    }
    const totalAmmo = type === player.weaponType
      ? Math.max(0, player.magAmmo || 0) + Math.max(0, player.reserveAmmo || 0)
      : Math.max(0, player.ammoBank?.[type] || 0);
    if (totalAmmo > 0 || type === "ar") {
      return switchWeaponFromBank(type);
    }
  }
  playSfx("dry");
  setPlayerAmmoWarning("OUT OF AMMO", 0.4);
  return false;
}

function lerpValue(from, to, amount) {
  return from + (to - from) * amount;
}

function lerpAngleValue(from, to, amount) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * amount;
}

function easeAmount(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function frameSegment(frame, start, end) {
  return easeAmount((frame - start) / Math.max(1, end - start));
}

function mixPoint(from, to, amount) {
  return {
    x: lerpValue(from.x, to.x, amount),
    y: lerpValue(from.y, to.y, amount)
  };
}

function playerPose(key, frames) {
  return { key, frames };
}

function poseFrameCount(unusedKey, frames) {
  return Array.isArray(frames) && frames.length > 0 ? frames.length : 1;
}

function nearestLiveEnemyDistance() {
  let best = Infinity;
  const px = player.x + player.w * 0.5;
  const py = player.y + player.h * 0.5;
  for (const enemy of enemies) {
    if (enemy.dead) {
      continue;
    }
    const distance = Math.hypot(enemy.x + enemy.w * 0.5 - px, enemy.y + enemy.h * 0.5 - py);
    best = Math.min(best, distance);
  }
  return best;
}

function nearestEnemyBulletDistance() {
  let best = Infinity;
  const px = player.x + player.w * 0.5;
  const py = player.y + player.h * 0.5;
  for (const bullet of enemyBullets) {
    const futureX = bullet.x + bullet.vx * 0.16;
    const futureY = bullet.y + bullet.vy * 0.16;
    best = Math.min(best, Math.hypot(futureX - px, futureY - py));
  }
  return best;
}

function nearestBonusBossDistance() {
  let best = Infinity;
  const px = player.x + player.w * 0.5;
  const py = player.y + player.h * 0.5;
  for (const enemy of enemies) {
    if (enemy.dead || !enemy.bonusBoss) {
      continue;
    }
    best = Math.min(best, Math.hypot(enemy.x + enemy.w * 0.5 - px, enemy.y + enemy.h * 0.5 - py));
  }
  return best;
}

function predictNextPlayerMove() {
  const bulletDistance = nearestEnemyBulletDistance();
  const enemyDistance = nearestLiveEnemyDistance();
  const bonusBossDistance = nearestBonusBossDistance();
  const airborne = !player.grounded || Math.abs(player.vy) > 160;
  const moving = Math.abs(player.vx) > 80 || Math.abs(keys.moveX) > 0.25;
  const lowAmmo = player.magAmmo <= Math.max(2, currentClipSize() * 0.18);
  const outOfAmmo = playerOutOfAllAmmo();
  const nextX = player.x + player.vx * aiFrameDirector.predictionInterval * 1.8;
  const nextY = player.y + player.vy * aiFrameDirector.predictionInterval * 1.8 + WORLD.gravity * 0.5 * aiFrameDirector.predictionInterval ** 2;
  let action = "idle";
  let context = "neutral";
  let confidence = 0.42;

  if (bonusClash.active) {
    action = "bonus-clash";
    context = "boss";
    confidence = 0.9;
  } else if (outOfAmmo) {
    action = "unarmed";
    context = "melee";
    confidence = 0.84;
  } else if (aiFrameDirector.predictionMode === "boss" && (finale.phase !== "sections" || bonusBossDistance < 520)) {
    action = "boss-read";
    context = "boss";
    confidence = 0.78;
  } else if (aiFrameDirector.predictionMode === "danger" && (bulletDistance < 300 || player.hp <= 3)) {
    action = airborne ? "air-dodge" : "dodge";
    context = "danger";
    confidence = bulletDistance < 150 ? 0.86 : 0.68;
  } else if (finale.armWrestle?.active || finale.phase === "boss") {
    action = "boss-read";
    context = "boss";
    confidence = 0.82;
  } else if (bulletDistance < 150 || player.hp <= 2 || player.shield <= 1) {
    action = airborne ? "air-dodge" : "dodge";
    context = "danger";
    confidence = bulletDistance < 90 ? 0.92 : 0.74;
  } else if (player.reloadTimer > 0 || lowAmmo || input.reloadQueued) {
    action = "reload";
    context = "reload";
    confidence = player.reloadTimer > 0 ? 0.86 : 0.68;
  } else if (player.airStrafeTimer > 0 || player.airHangTimer > 0 || (airborne && Math.abs(player.vx) > MOVE.maxRun * 0.7)) {
    action = "air-strafe";
    context = "air";
    confidence = 0.82;
  } else if (airborne) {
    action = player.vy > 260 ? "land" : "jump";
    context = "air";
    confidence = player.vy > 260 ? 0.7 : 0.62;
  } else if (player.slideState !== "none" || (keys.down && moving)) {
    action = "slide";
    context = "slide";
    confidence = 0.76;
  } else if (input.shootQueued || player.weaponCooldown > 0 || playerTactics.gun > 3) {
    action = "shoot";
    context = "combat";
    confidence = enemyDistance < 420 ? 0.78 : 0.58;
  } else if (input.combatQueued || player.meleeTimer > 0 || (enemyDistance < 145 && playerTactics.melee > 1)) {
    action = "melee";
    context = "melee";
    confidence = 0.72;
  } else if (bonusBossDistance < 520) {
    action = "boss-read";
    context = "boss";
    confidence = 0.72;
  } else if (player.dashCooldown <= 0 && moving && Math.abs(player.vx) > MOVE.maxRun * 0.84) {
    action = "dash";
    context = "speed";
    confidence = 0.66;
  } else if (moving) {
    action = "run";
    context = "speed";
    confidence = 0.58;
  }

  if (enemy.squadRole === "rusher" && approach !== "anti-air") {
    approach = distance < 120 ? "kite" : "pressure";
    desiredRange = Math.min(desiredRange, 190);
    confidence += 0.08;
  } else if (enemy.squadRole === "suppressor" && approach !== "pressure") {
    approach = tactic === "air" ? "anti-air" : "strafe";
    desiredRange = Math.max(desiredRange, 350);
    confidence += 0.05;
  } else if (enemy.squadRole === "guard") {
    approach = "hold";
    desiredRange = Math.max(desiredRange, 410);
  }

  return {
    action,
    context,
    confidence,
    nextX,
    nextY,
    bulletDistance,
    enemyDistance,
    bonusBossDistance,
    moveX: keys.moveX,
    grounded: player.grounded
  };
}

function updateAiManagement(dt) {
  if (!aiFrameDirector.enabled) {
    return;
  }
  aiFrameDirector.predictionTimer -= dt;
  if (aiFrameDirector.predictionTimer > 0) {
    return;
  }
  aiFrameDirector.predictionTimer = aiFrameDirector.predictionInterval;
  aiFrameDirector.prediction = predictNextPlayerMove();
  aiFrameDirector.context = aiFrameDirector.prediction.context;
  aiFrameDirector.history.unshift({
    time,
    action: aiFrameDirector.prediction.action,
    context: aiFrameDirector.prediction.context,
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy
  });
  aiFrameDirector.history.length = Math.min(aiFrameDirector.history.length, 24);

  const memoryKey = `action:${aiFrameDirector.prediction.action}`;
  const memory = aiFrameDirector.memory.get(memoryKey) || { uses: 0 };
  memory.uses = Math.min(40, memory.uses + 1);
  memory.lastContext = aiFrameDirector.prediction.context;
  memory.lastUsed = time;
  aiFrameDirector.memory.set(memoryKey, memory);

}

function notePlayerTactic(kind, amount = 1) {
  if (!(kind in playerTactics)) {
    return;
  }
  playerTactics[kind] = Math.min(24, playerTactics[kind] + amount);
  playerTactics.last = kind;
  const recent = playerTactics.recent;
  const last = recent[0];
  if (!last || last.kind !== kind || time - last.time > 0.18) {
    recent.unshift({
      kind,
      time,
      x: Math.round(player.x),
      y: Math.round(player.y),
      vx: Math.round(player.vx),
      vy: Math.round(player.vy),
      grounded: player.grounded,
      hp: player.hp,
      shield: player.shield,
      ammo: player.magAmmo,
      weapon: player.weaponType
    });
    recent.length = Math.min(recent.length, PLAYER_ACTION_MEMORY_LIMIT);
  }
}

function addStyle(reason, amount = 8, color = "#ffd166") {
  styleState.value = clamp(styleState.value + amount, 0, STYLE.max);
  styleState.peak = Math.max(styleState.peak, styleState.value);
  styleState.callouts.unshift({
    reason,
    color,
    life: STYLE.calloutLife,
    maxLife: STYLE.calloutLife,
    y: 0
  });
  styleState.callouts.length = Math.min(styleState.callouts.length, 5);
}

function updateStyle(dt) {
  styleState.value = Math.max(0, styleState.value - STYLE.decay * dt);
  for (const callout of styleState.callouts) {
    callout.life -= dt;
    callout.y += dt * 20;
  }
  styleState.callouts = styleState.callouts.filter((callout) => callout.life > 0);
}

function triggerBossMimicCinematic(enemy, tactic) {
  const color = enemy.bonusColor || (enemy.evilTwin ? "#4df7ff" : enemy.type === "boss" ? "#ffd166" : "#c66bff");
  bossMimicCinema = {
    active: true,
    timer: 1.15,
    duration: 1.15,
    tactic,
    color,
    enemy,
    echoX: enemy.x + enemy.w * 0.5,
    echoY: enemy.y + enemy.h * 0.45
  };
  enemy.cinematicMimicTimer = 1.15;
  enemy.bossMimic = tactic;
  finale.message = `BOSS COPIED: ${tactic.toUpperCase()}`;
  finale.messageTimer = 1.15;
  addStyle("BOSS COPY", 12, color);
  shake = Math.max(shake, CONTROL.comfortFx ? 4 : 10);
  burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.45, color, 42, 520);
  playSfx("deflect");
}

function updateBossMimicCinema(dt) {
  if (!bossMimicCinema.active) {
    return;
  }
  bossMimicCinema.timer = Math.max(0, bossMimicCinema.timer - dt);
  if (bossMimicCinema.timer <= 0) {
    bossMimicCinema.active = false;
    bossMimicCinema.enemy = null;
  }
}

function decayPlayerTactics(dt) {
  for (const kind of ["gun", "melee", "slide", "air", "reload"]) {
    playerTactics[kind] = Math.max(0, playerTactics[kind] - dt * 0.55);
  }
}

function currentPlayerTactic() {
  if (player.reloadTimer > 0) {
    return "reload";
  }
  if (player.meleeType) {
    return "melee";
  }
  if (player.airStrafeTimer > 0 || player.airHangTimer > 0) {
    return "air";
  }
  if (player.slideState !== "none" || (!player.grounded && keys.down)) {
    return "slide";
  }
  if (player.weaponCooldown > currentFireCooldown() - 0.08) {
    return "gun";
  }
  return playerTactics.last && playerTactics[playerTactics.last] > 0.6 ? playerTactics.last : null;
}

function dominantTacticForEnemy(enemy) {
  let best = "gun";
  let bestScore = -1;
  const recent = recentActionCounts();
  for (const kind of ["gun", "melee", "slide", "air", "reload"]) {
    const recentScore = (recent[kind] || 0) * 0.72;
    const score = playerTactics[kind] + recentScore + (enemy.tacticMemory?.[kind] || 0) * 1.4;
    if (score > bestScore) {
      bestScore = score;
      best = kind;
    }
  }
  return bestScore > 0.6 ? best : null;
}

function recentActionCounts(limit = PLAYER_ACTION_MEMORY_LIMIT) {
  const counts = { gun: 0, melee: 0, slide: 0, air: 0, reload: 0 };
  const recent = playerTactics.recent || [];
  for (let i = 0; i < Math.min(limit, recent.length); i += 1) {
    const action = recent[i];
    if (action.kind in counts) {
      counts[action.kind] += 1 + (limit - i) * 0.05;
    }
  }
  return counts;
}

function playerAmmoTotal() {
  const bank = player.ammoBank || {};
  const currentBank = Math.max(0, player.reserveAmmo || 0);
  let total = Math.max(0, player.magAmmo || 0) + Math.max(0, player.shotgunAmmo || 0);
  for (const type of Object.keys(WEAPONS)) {
    total += type === player.weaponType ? currentBank : Math.max(0, bank[type] || 0);
  }
  return total;
}

function playerOutOfAllAmmo() {
  return playerAmmoTotal() <= 0;
}

function setPlayerAmmoWarning(message, duration = 0.45) {
  player.emptyMessage = message;
  player.emptyTimer = Math.max(player.emptyTimer || 0, duration);
}

function clearStaleAmmoWarning() {
  if (player.emptyTimer <= 0) {
    player.emptyMessage = "";
    return;
  }
  if (player.emptyMessage === "OUT OF AMMO" && !playerOutOfAllAmmo()) {
    player.emptyTimer = 0;
    player.emptyMessage = "";
  }
}

function rememberPlayerTactic(enemy, amount = 0.45) {
  const tactic = currentPlayerTactic();
  if (!tactic || !enemy.tacticMemory || !(tactic in enemy.tacticMemory)) {
    return;
  }
  enemy.tacticMemory[tactic] = Math.min(12, enemy.tacticMemory[tactic] + amount);
  const recent = recentActionCounts(PLAYER_ACTION_MEMORY_LIMIT);
  for (const kind of Object.keys(recent)) {
    enemy.tacticMemory[kind] = Math.min(12, enemy.tacticMemory[kind] + recent[kind] * 0.035);
  }
}

function decayEnemyMemory(enemy, dt) {
  if (!enemy.tacticMemory) {
    return;
  }
  for (const kind of ["gun", "melee", "slide", "air", "reload"]) {
    enemy.tacticMemory[kind] = Math.max(0, enemy.tacticMemory[kind] - dt * 0.32);
  }
}

function enemyDefaultRange(enemy) {
  if (enemy.squadRole === "rusher") {
    return enemy.type === "elite" ? 185 : 175;
  }
  if (enemy.squadRole === "suppressor") {
    return enemy.type === "elite" ? 335 : 380;
  }
  if (enemy.squadRole === "guard") {
    return 430;
  }
  if (enemy.bonusBoss) {
    return bonusBossBlueprint(enemy).preferredRange || 280;
  }
  if (enemy.type === "finalBoss") {
    return 360;
  }
  if (enemy.type === "boss") {
    return 320;
  }
  if (enemy.type === "elite") {
    return 280;
  }
  if (enemy.type === "soldier") {
    return 250;
  }
  return 340;
}

function enemyMasterPlan(enemy, seesPlayer, incomingBullet, distance, distanceY) {
  const tactic = dominantTacticForEnemy(enemy);
  const recent = recentActionCounts(PLAYER_ACTION_MEMORY_LIMIT);
  const prediction = aiFrameDirector.prediction || {};
  const outOfAmmo = playerOutOfAllAmmo();
  const lowShield = player.shield <= 1;
  let approach = "hold";
  let desiredRange = enemyDefaultRange(enemy);
  let confidence = 0.42 + Math.min(0.28, (enemy.alert || 0) * 0.2);
  let strafe = enemy.combatDir || 1;

  if (incomingBullet) {
    approach = enemy.type === "turret" ? "hold" : "dodge";
    desiredRange += 90;
    confidence = 0.82;
    strafe = incomingBullet.vx > 0 ? -1 : 1;
  } else if (bonusClash.active || prediction.context === "boss") {
    approach = enemy.bonusBoss || enemy.type === "finalBoss" ? "pressure" : "spread";
    desiredRange += enemy.bonusBoss ? -20 : 70;
    confidence = 0.78;
  } else if (outOfAmmo) {
    approach = distance < 190 ? "kite" : "beginner-hold";
    desiredRange = Math.max(desiredRange, 260);
    confidence = 0.72;
  } else if (tactic === "reload" || recent.reload >= 2) {
    approach = "pressure";
    desiredRange = Math.max(130, desiredRange - 120);
    confidence = 0.84;
  } else if (tactic === "melee" || recent.melee >= 2) {
    approach = "kite";
    desiredRange = Math.max(desiredRange, 330);
    confidence = 0.8;
  } else if (tactic === "air" || recent.air >= 2 || prediction.action === "air-strafe") {
    approach = "anti-air";
    desiredRange += enemy.type === "elite" || enemy.bonusBoss ? 30 : 80;
    confidence = 0.76;
  } else if (tactic === "slide" || recent.slide >= 2) {
    approach = "cross-strafe";
    desiredRange += 35;
    confidence = 0.7;
  } else if (tactic === "gun" || recent.gun >= 3) {
    approach = lowShield ? "spread" : "strafe";
    desiredRange += lowShield ? 45 : 15;
    confidence = 0.68;
  } else if (!seesPlayer && enemy.memoryTimer > 0) {
    approach = "search";
    desiredRange = 240;
    confidence = 0.54;
  }

  if (enemy.type === "turret") {
    approach = "hold";
    desiredRange = 430;
  }
  if (Math.abs(distanceY) > 230 && approach !== "anti-air") {
    desiredRange += 80;
  }
  if (aiFrameDirector.predictionMode === "danger") {
    confidence += 0.06;
  } else if (aiFrameDirector.predictionMode === "boss" && (enemy.bonusBoss || enemy.type === "finalBoss" || enemy.type === "boss")) {
    confidence += 0.12;
  }
  if (smartInventory.enabled) {
    if (smartInventory.settings.reload === "safe" && player.magAmmo / Math.max(1, currentClipSize()) < 0.42) {
      approach = enemy.type === "turret" ? "hold" : "pressure";
      confidence += 0.08;
    }
    if (smartInventory.settings.swap === "close" && distance < 300) {
      desiredRange += 45;
      approach = approach === "pressure" ? "cross-strafe" : approach;
    }
  }

  return {
    approach,
    desiredRange: clamp(desiredRange, 140, enemy.type === "turret" ? 520 : 450),
    confidence: clamp(confidence, 0.25, 0.95),
    strafe,
    tactic,
    recent
  };
}

function enemySeparationBias(enemy) {
  let bias = 0;
  const cx = enemy.x + enemy.w * 0.5;
  const cy = enemy.y + enemy.h * 0.5;
  for (const other of enemies) {
    if (other === enemy || other.dead) {
      continue;
    }
    const ox = other.x + other.w * 0.5;
    const oy = other.y + other.h * 0.5;
    const minDistance = Math.max(enemySpacingRadius(enemy.type), enemySpacingRadius(other.type));
    const dx = cx - ox;
    const dy = cy - oy;
    const distance = Math.hypot(dx, dy);
    if (distance > 0 && distance < minDistance && Math.abs(dy) < minDistance * 0.9) {
      bias += Math.sign(dx || enemy.combatDir || 1) * (1 - distance / minDistance);
    }
  }
  return clamp(bias, -1, 1);
}

function resolveEnemySpacing(enemy) {
  if (enemy.type === "dummy" || enemy.type === "turret" || enemy.finalePursuer) {
    return;
  }
  const bias = enemySeparationBias(enemy);
  if (Math.abs(bias) < 0.01) {
    return;
  }
  enemy.x = clamp(enemy.x + bias * 1.8, enemy.left, enemy.right);
}

function makePoseFrames(basePose, count = 10) {
  return Array.from({ length: count }, (unused, frameIndex) => {
    const wave = Math.sin((frameIndex / count) * Math.PI * 2);
    const counterWave = Math.cos((frameIndex / count) * Math.PI * 2);
    return {
      ...basePose,
      head: basePose.head + wave * 0.18,
      chest: basePose.chest + counterWave * 0.02,
      backArm: basePose.backArm + wave * 0.09,
      frontArm: basePose.frontArm - wave * 0.09,
      backLeg: basePose.backLeg - counterWave * 0.08,
      frontLeg: basePose.frontLeg + counterWave * 0.08,
      kneeBack: basePose.kneeBack + wave * 0.08,
      kneeFront: basePose.kneeFront - wave * 0.08
    };
  });
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerRectAt(x, y, h = player.h) {
  return { x, y, w: player.w, h };
}

function setPlayerHeight(height) {
  if (player.h === height) {
    return;
  }
  const bottom = player.y + player.h;
  player.h = height;
  player.y = bottom - player.h;
}

function canStand() {
  const test = playerRectAt(player.x, player.y + player.h - player.standH, player.standH);
  return !platforms.some((platform) => rectsOverlap(test, platform));
}

function updateMouseFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  mouse.worldX = mouse.x + camera.x;
  mouse.worldY = mouse.y + camera.y;
  mouse.active = true;
  updateAimAngle();
}

function updateMouseWorld() {
  mouse.worldX = mouse.x + camera.x;
  mouse.worldY = mouse.y + camera.y;
}

function syncKeys() {
  const keyboardMove = (keyboardKeys.right ? 1 : 0) - (keyboardKeys.left ? 1 : 0);
  const keyboardForward = (keyboardKeys.jump ? -1 : 0) + (keyboardKeys.down ? 1 : 0);
  keys.left = keyboardKeys.left || gamepadControls.left;
  keys.right = keyboardKeys.right || gamepadControls.right;
  keys.down = keyboardKeys.down || gamepadControls.down;
  keys.jump = keyboardKeys.jump || gamepadControls.jump;
  keys.moveX = keyboardMove || gamepadControls.moveX || 0;
  keys.moveY = keyboardForward || gamepadControls.moveY || 0;
}

function beginDownInput() {
  input.downStartedAt = time;
  if (gameState === "playing") {
    startSlide(time);
  }
}

function endDownInput(held) {
  if (player.slideState === "none") {
    return;
  }
  if (held <= MOVE.strafeComboWindow) {
    if (held <= 0.1) {
      addStyle("PERFECT STRAFE WINDOW", 12, "#ffd166");
      finale.message = "PERFECT STRAFE";
      finale.messageTimer = 0.75;
    }
    player.airStrafeWindow = MOVE.strafeComboWindow;
    player.airStrafeQueuedSuper = !player.superStrafeUsed;
    player.airStrafeDir = player.slideDir || player.facing || 1;
    stopSlide(true);
  } else {
    player.airStrafeQueuedSuper = false;
    stopSlide(false);
  }
}

function beginJumpInput() {
  queueJump();
  if (player.ledge && !player.deathRagdoll) {
    vaultLedge();
  }
}

function endJumpInput() {
  if (player.vy < 0) {
    player.vy *= 0.48;
  }
}

function gamepadButton(gamepad, index, threshold = 0.5) {
  const button = gamepad.buttons[index];
  return !!button && (button.pressed || button.value > threshold);
}

function shapeControllerAxis(value, deadzone = 0.18) {
  const magnitude = Math.abs(value);
  if (magnitude <= deadzone) {
    return 0;
  }
  const normalized = clamp((magnitude - deadzone) / (1 - deadzone), 0, 1);
  const shaped = CONTROL.controllerCurve === "expo" ? Math.pow(normalized, 1.7) : normalized;
  return Math.sign(value) * shaped;
}

function setGamepadState(state = {}) {
  const moveX = state.moveX ?? 0;
  const moveY = state.moveY ?? 0;
  gamepadControls.left = moveX < -0.08;
  gamepadControls.right = moveX > 0.08;
  gamepadControls.moveX = moveX;
  gamepadControls.moveY = moveY;
  gamepadControls.aimX = state.aimX ?? 0;
  gamepadControls.aimY = state.aimY ?? 0;
  gamepadControls.down = !!state.downPressed;
  gamepadControls.jump = !!state.jumpPressed;
  gamepadControls.shoot = !!state.shootPressed;
  gamepadControls.dash = !!state.dashPressed;
  gamepadControls.combat = !!state.combatPressed;
  gamepadControls.reload = !!state.reloadPressed;
  gamepadControls.cycle = !!state.cyclePressed;
  gamepadControls.shotgun = !!state.shotgunPressed;
  gamepadControls.menu = !!state.menuPressed;
  gamepadControls.menuUp = !!state.menuUpPressed;
  gamepadControls.menuDown = !!state.menuDownPressed;
  gamepadControls.ragdollGrab = !!state.ragdollGrabPressed;
}

function clearGamepadState() {
  setGamepadState();
}

function pollGamepad() {
  if (!navigator.getGamepads) {
    syncKeys();
    return;
  }

  const pads = Array.from(navigator.getGamepads()).filter(Boolean);
  const gamepad = pads.find((pad) => pad.index === gamepadControls.index) || pads[0];
  if (!gamepad) {
    gamepadControls.connected = false;
    gamepadControls.index = -1;
    clearGamepadState();
    syncKeys();
    return;
  }

  gamepadControls.connected = true;
  gamepadControls.index = gamepad.index;

  const rawMoveX = gamepad.axes[0] || 0;
  const rawMoveY = gamepad.axes[1] || 0;
  const moveX = shapeControllerAxis(rawMoveX, 0.18);
  const moveY = shapeControllerAxis(rawMoveY, 0.28);
  const aimX = shapeControllerAxis(gamepad.axes[2] || 0, 0.12);
  const aimY = shapeControllerAxis(gamepad.axes[3] || 0, 0.12);
  const dpadUp = gamepadButton(gamepad, 12);
  const dpadDown = gamepadButton(gamepad, 13);
  const dpadRight = gamepadButton(gamepad, 15);
  const jumpPressed = gamepadButton(gamepad, 0);
  const dashPressed = gamepadButton(gamepad, 4);
  const combatPressed = gamepadButton(gamepad, 2);
  const cyclePressed = gamepadButton(gamepad, 1);
  const shotgunPressed = gamepadButton(gamepad, 5);
  const reloadPressed = gamepadButton(gamepad, 3);
  const shootPressed = gamepadButton(gamepad, 7, 0.28);
  const downPressed = gamepadButton(gamepad, 6, 0.28);
  const menuPressed = gamepadButton(gamepad, 9) || gamepadButton(gamepad, 8);
  const menuUpPressed = dpadUp || rawMoveY < -0.72;
  const menuDownPressed = dpadDown || rawMoveY > 0.72;
  const nextGamepadState = {
    moveX,
    moveY,
    aimX,
    aimY,
    downPressed,
    jumpPressed,
    shootPressed,
    dashPressed,
    combatPressed,
    reloadPressed,
    cyclePressed,
    shotgunPressed,
    menuPressed,
    menuUpPressed,
    menuDownPressed,
    ragdollGrabPressed: dpadRight
  };

  const failRestartPressed = jumpPressed || menuPressed || cyclePressed || combatPressed || reloadPressed || shotgunPressed || shootPressed;
  const failRestartEdge =
    (jumpPressed && !gamepadControls.jump) ||
    (menuPressed && !gamepadControls.menu) ||
    (cyclePressed && !gamepadControls.cycle) ||
    (combatPressed && !gamepadControls.combat) ||
    (reloadPressed && !gamepadControls.reload) ||
    (shotgunPressed && !gamepadControls.shotgun) ||
    (shootPressed && !gamepadControls.shoot);
  if ((gameState === "dead" || gameState === "captured") && failRestartPressed && failRestartEdge) {
    setGamepadState(nextGamepadState);
    syncKeys();
    restartRunFromFailState();
    return;
  }

  if (tipsOpen()) {
    if (tipsCanClose() && ((jumpPressed && !gamepadControls.jump) || (menuPressed && !gamepadControls.menu))) {
      playMenuAccept();
      closeTips();
    }
    setGamepadState(nextGamepadState);
    syncKeys();
    return;
  }

  if (menuPressed && !gamepadControls.menu && (gameState === "playing" || gameState === "paused")) {
    playMenuAccept();
    togglePause();
  }

  if (gameState === "intro" || gameState === "paused") {
    if (menuUpPressed && !gamepadControls.menuUp) {
      if (gameState === "intro") {
        moveIntroMenuSelection(-1);
      } else {
        moveMenuSelection(-1);
      }
    }
    if (menuDownPressed && !gamepadControls.menuDown) {
      if (gameState === "intro") {
        moveIntroMenuSelection(1);
      } else {
        moveMenuSelection(1);
      }
    }
    if (jumpPressed && !gamepadControls.jump) {
      ensureMusic();
      if (gameState === "intro") {
        activateIntroMenuSelection();
      } else {
        activateMenuSelection();
      }
    }
    setGamepadState(nextGamepadState);
    syncKeys();
    return;
  }

  if (gameState === "playing" && bonusClash.active) {
    if (jumpPressed && !gamepadControls.jump) {
      registerBonusClashInput("A");
    }
    if (combatPressed && !gamepadControls.combat) {
      registerBonusClashInput("X");
    }
    if (cyclePressed && !gamepadControls.cycle) {
      registerBonusClashInput("B");
    }
    if (shotgunPressed && !gamepadControls.shotgun) {
      registerBonusClashInput("RB");
    }
    if (dashPressed && !gamepadControls.dash) {
      registerBonusClashInput("LB");
    }
    if (moveX > 0.78 && gamepadControls.moveX <= 0.78) {
      registerBonusClashInput("RIGHT");
    } else if (moveX < -0.78 && gamepadControls.moveX >= -0.78) {
      registerBonusClashInput("LEFT");
    } else if (moveY < -0.78 && gamepadControls.moveY >= -0.78) {
      registerBonusClashInput("UP");
    } else if (moveY > 0.78 && gamepadControls.moveY <= 0.78) {
      registerBonusClashInput("DOWN");
    }
    setGamepadState(nextGamepadState);
    syncKeys();
    return;
  }

  if (aimX || aimY) {
    const origin = playerAimOrigin();
    mouse.active = true;
    mouse.worldX = origin.x + aimX * 260;
    mouse.worldY = origin.y + aimY * 190;
    mouse.x = mouse.worldX - camera.x;
    mouse.y = mouse.worldY - camera.y;
  }

  if (downPressed && !gamepadControls.down) {
    ensureMusic();
    gamepadControls.downStartedAt = time;
    beginDownInput();
  } else if (!downPressed && gamepadControls.down) {
    endDownInput(time - gamepadControls.downStartedAt);
  }

  if (jumpPressed && !gamepadControls.jump) {
    ensureMusic();
    beginJumpInput();
  } else if (!jumpPressed && gamepadControls.jump) {
    endJumpInput();
  }

  if (dashPressed && !gamepadControls.dash) {
    ensureMusic();
    tryDash();
  }
  if (combatPressed && !gamepadControls.combat) {
    ensureMusic();
    input.combatQueued = true;
  }
  if (cyclePressed && !gamepadControls.cycle) {
    ensureMusic();
    input.weaponCycleQueued = true;
  }
  if (shotgunPressed && !gamepadControls.shotgun) {
    ensureMusic();
    input.shotgunQueued = true;
  }
  if (reloadPressed && !gamepadControls.reload) {
    ensureMusic();
    input.reloadQueued = true;
  }
  if (dpadRight && !gamepadControls.ragdollGrab) {
    ensureMusic();
    input.ragdollGrabQueued = true;
  }
  if (shootPressed) {
    ensureMusic();
    input.shootQueued = true;
  }

  setGamepadState(nextGamepadState);
  syncKeys();
}

function setPaused(paused) {
  if (paused) {
    if (gameState !== "playing") {
      return;
    }
    gameState = "paused";
    pauseOverlay.classList.remove("hidden");
    updateMenuButtons();
    setAudioMuffle(true);
    return;
  }

  if (gameState !== "paused") {
    return;
  }
  gameState = "playing";
  pauseOverlay.classList.add("hidden");
  setAudioMuffle(false);
}

function startRunFromIntro() {
  if (gameState !== "intro") {
    return;
  }
  gameState = "playing";
  introOverlay.classList.add("hidden");
  startGameplayAudio();
}

function restartRunFromFailState() {
  ensureMusic();
  playMenuAccept();
  resetGame();
  startRunFromIntro();
}

function togglePause() {
  setPaused(gameState !== "paused");
}

function tipsOpen() {
  return !tipsOverlay.classList.contains("hidden");
}

function showTips() {
  tipsOpenedAt = performance.now();
  tipsOverlay.classList.remove("hidden");
  setAudioMuffle(true);
}

function closeTips() {
  tipsOverlay.classList.add("hidden");
  setAudioMuffle(gameState !== "playing");
}

function tipsCanClose() {
  return performance.now() - tipsOpenedAt > 260;
}

function toggleFrameSmoothing() {
  frameSmoothing.enabled = !frameSmoothing.enabled;
  frameSmoothing.history = [];
  updateIntroMenuButtons();
  updateMenuButtons();
}

function toggleAiFrames() {
  aiFrameDirector.enabled = !aiFrameDirector.enabled;
  player.poseKey = "";
  player.poseBlend = 0;
  updateIntroMenuButtons();
  updateMenuButtons();
}

function aiFramesMenuText() {
  return `TACTIC AI ${aiFrameDirector.enabled ? "ON" : "OFF"}`;
}

function toggleSmartInventory() {
  smartInventory.enabled = !smartInventory.enabled;
  smartInventory.lastAction = smartInventory.enabled ? "AUTO INVENTORY ONLINE" : "";
  smartInventory.lastActionTimer = smartInventory.enabled ? 1.6 : 0;
  updateIntroMenuButtons();
  updateMenuButtons();
}

function smartInventoryMenuText() {
  return `AUTO INVENTORY ${smartInventory.enabled ? "ON" : "OFF"}`;
}

function setSelectOptions(selects, options, value) {
  for (const select of selects) {
    select.innerHTML = options.map(([optionValue, label]) => `<option value="${optionValue}">${label}</option>`).join("");
    select.value = value;
  }
}

function syncLinkedSelects(selects, value) {
  for (const select of selects) {
    if (select.value !== value) {
      select.value = value;
    }
  }
}

function applyInventorySetting(key, value) {
  smartInventory.settings[key] = value;
  syncLinkedSelects(inventorySettingSelects[key], value);
  updateIntroMenuButtons();
  updateMenuButtons();
}

function applyAiSetting(key, value) {
  if (key === "frameCount") {
    aiFrameDirector.frameCount = value === "1" ? 1 : 2;
    aiFrameDirector.useMode = value.startsWith("2_") ? value : aiFrameDirector.useMode;
  } else if (key === "prediction") {
    aiFrameDirector.predictionMode = value;
    aiFrameDirector.predictionInterval = value === "slow" ? 0.2 : value === "fast" ? 0.05 : value === "danger" ? 0.08 : value === "boss" ? 0.075 : 0.1;
  } else if (key === "influence") {
    aiFrameDirector.influence = value === "tiny" ? 0.06 : value === "light" ? 0.1 : value === "sharp" ? 0.24 : value === "max" ? 0.34 : 0.16;
  } else if (key === "use") {
    aiFrameDirector.useMode = value;
  } else if (key === "debug") {
    aiFrameDirector.debugMode = value;
  }
  syncLinkedSelects(aiSettingSelects[key], value);
  updateIntroMenuButtons();
  updateMenuButtons();
}

function initializeSettingsMenus() {
  for (const [key, options] of Object.entries(AI_SETTING_OPTIONS)) {
    const value = key === "frameCount"
      ? String(aiFrameDirector.frameCount)
      : key === "prediction"
        ? aiFrameDirector.predictionMode
        : key === "influence"
          ? "normal"
          : key === "use"
            ? aiFrameDirector.useMode
            : aiFrameDirector.debugMode;
    setSelectOptions(aiSettingSelects[key], options, value);
    for (const select of aiSettingSelects[key]) {
      select.addEventListener("change", () => {
        playMenuAccept();
        applyAiSetting(key, select.value);
      });
    }
  }
  for (const [key, options] of Object.entries(INVENTORY_SETTING_OPTIONS)) {
    setSelectOptions(inventorySettingSelects[key], options, smartInventory.settings[key]);
    for (const select of inventorySettingSelects[key]) {
      select.addEventListener("change", () => {
        playMenuAccept();
        applyInventorySetting(key, select.value);
      });
    }
  }
}

function toggleControllerCurve() {
  CONTROL.controllerCurve = CONTROL.controllerCurve === "expo" ? "linear" : "expo";
  updateIntroMenuButtons();
  updateMenuButtons();
}

function toggleMovementAssist() {
  CONTROL.movementAssist = !CONTROL.movementAssist;
  updateIntroMenuButtons();
  updateMenuButtons();
}

function toggleComfortFx() {
  CONTROL.comfortFx = !CONTROL.comfortFx;
  updateIntroMenuButtons();
  updateMenuButtons();
}

function toggleReticleSize() {
  CONTROL.largeReticle = !CONTROL.largeReticle;
  updateIntroMenuButtons();
  updateMenuButtons();
}

function introMenuButtons() {
  return [startButton, introAliasButton, introAiFramesButton, introInventoryButton, introTipsButton, introControllerModeButton, introAssistButton, introComfortButton, introReticleButton];
}

function moveIntroMenuSelection(direction) {
  const count = introMenuButtons().length;
  introMenuIndex = (introMenuIndex + direction + count) % count;
  updateIntroMenuButtons();
}

function activateIntroMenuSelection() {
  playMenuAccept();
  if (introMenuIndex === 0) {
    startRunFromIntro();
  } else if (introMenuIndex === 1) {
    toggleFrameSmoothing();
  } else if (introMenuIndex === 2) {
    toggleAiFrames();
  } else if (introMenuIndex === 3) {
    toggleSmartInventory();
  } else if (introMenuIndex === 4) {
    showTips();
  } else if (introMenuIndex === 5) {
    toggleControllerCurve();
  } else if (introMenuIndex === 6) {
    toggleMovementAssist();
  } else if (introMenuIndex === 7) {
    toggleComfortFx();
  } else {
    toggleReticleSize();
  }
}

function moveMenuSelection(direction) {
  const count = menuButtons().length;
  menuIndex = (menuIndex + direction + count) % count;
  updateMenuButtons();
}

function activateMenuSelection() {
  playMenuAccept();
  if (menuIndex === 0) {
    setPaused(false);
  } else if (menuIndex === 1) {
    toggleFrameSmoothing();
  } else if (menuIndex === 2) {
    toggleAiFrames();
  } else if (menuIndex === 3) {
    toggleSmartInventory();
  } else if (menuIndex === 4) {
    showTips();
  } else if (menuIndex === 5) {
    toggleControllerCurve();
  } else if (menuIndex === 6) {
    toggleMovementAssist();
  } else if (menuIndex === 7) {
    toggleComfortFx();
  } else if (menuIndex === 8) {
    toggleReticleSize();
  } else {
    setPaused(false);
    resetGame();
  }
}

function menuButtons() {
  return [resumeButton, aliasButton, aiFramesButton, inventoryButton, tipsButton, controllerModeButton, assistButton, comfortButton, reticleButton, restartButton];
}

function updateMenuButtons() {
  aliasButton.textContent = `SMOOTHING ${frameSmoothing.enabled ? "ON" : "OFF"}`;
  aiFramesButton.textContent = aiFramesMenuText();
  inventoryButton.textContent = smartInventoryMenuText();
  controllerModeButton.textContent = `STICK RESPONSE ${CONTROL.controllerCurve.toUpperCase()}`;
  assistButton.textContent = `MOVEMENT ASSIST ${CONTROL.movementAssist ? "ON" : "HARDCORE"}`;
  comfortButton.textContent = `COMFORT FX ${CONTROL.comfortFx ? "ON" : "OFF"}`;
  reticleButton.textContent = `RETICLE ${CONTROL.largeReticle ? "LARGE" : "NORMAL"}`;
  aiSettings.classList.toggle("hidden", !aiFrameDirector.enabled);
  inventorySettings.classList.toggle("hidden", !smartInventory.enabled);
  menuButtons().forEach((button, index) => {
    button.classList.toggle("selected", index === menuIndex);
  });
}

function updateIntroMenuButtons() {
  updateIntroInstructions();
  introAliasButton.textContent = `SMOOTHING ${frameSmoothing.enabled ? "ON" : "OFF"}`;
  introAiFramesButton.textContent = aiFramesMenuText();
  introInventoryButton.textContent = smartInventoryMenuText();
  introControllerModeButton.textContent = `STICK RESPONSE ${CONTROL.controllerCurve.toUpperCase()}`;
  introAssistButton.textContent = `MOVEMENT ASSIST ${CONTROL.movementAssist ? "ON" : "HARDCORE"}`;
  introComfortButton.textContent = `COMFORT FX ${CONTROL.comfortFx ? "ON" : "OFF"}`;
  introReticleButton.textContent = `RETICLE ${CONTROL.largeReticle ? "LARGE" : "NORMAL"}`;
  introAiSettings.classList.toggle("hidden", !aiFrameDirector.enabled);
  introInventorySettings.classList.toggle("hidden", !smartInventory.enabled);
  introMenuButtons().forEach((button, index) => {
    button.classList.toggle("selected", index === introMenuIndex);
  });
}

function updateIntroInstructions() {
  const lines = [
    "Endless 2D rooftop run",
    "Left stick: run, air-turn, menu move",
    "LT tap then A: air strafe boost",
    "A: jump, double jump, vault cover",
    "Right stick: aim and rotate in air",
    "RT fire, Y reload, no ammo: melee",
    "LB: dash burst",
    "RB shotgun, X assisted combat, B cycle weapon",
    "Risk lanes pay out rescue gear",
    "Weak spots stagger enemies",
    "D-pad right: grab rare ragdoll guard",
    "Orange shields: break, get close, right stick right",
    "Shield drops: 30% chance, +1.5 armor",
    "Bosses copy habits you overuse",
    "Power cubes trigger overdrive",
    "Random polished rooftops stream forever",
    "Kills can drop ammo, shields, hearts",
    "Start: pause and settings"
  ];
  introInstructions.innerHTML = lines.map((line) => `<span>${line}</span>`).join("");
}

function setAudioMuffle(muffled) {
  if (!music.started || !music.ctx) {
    return;
  }
  const now = music.ctx.currentTime;
  if (music.master) {
    music.master.gain.cancelScheduledValues(now);
    music.master.gain.linearRampToValueAtTime(muffled ? AUDIO_LEVELS.musicMuffled : AUDIO_LEVELS.music, now + 0.12);
  }
  if (music.sfx) {
    music.sfx.gain.cancelScheduledValues(now);
    music.sfx.gain.linearRampToValueAtTime(AUDIO_LEVELS.sfx, now + 0.12);
  }
  if (music.ambient) {
    music.ambient.bedGain.gain.cancelScheduledValues(now);
    music.ambient.bedGain.gain.linearRampToValueAtTime(muffled ? AUDIO_LEVELS.ambientMuffled : AUDIO_LEVELS.ambient, now + 0.12);
  }
  if (music.muffle) {
    music.muffle.frequency.cancelScheduledValues(now);
    music.muffle.frequency.linearRampToValueAtTime(muffled ? AUDIO_LEVELS.menuFilter : AUDIO_LEVELS.clearFilter, now + 0.16);
  }
}

function playerAimOrigin() {
  if (player.ledge?.platform) {
    const edgeX = player.ledge.side > 0 ? player.ledge.platform.x : player.ledge.platform.x + player.ledge.platform.w;
    return {
      x: edgeX - player.ledge.side * 5,
      y: player.ledge.platform.y - 18
    };
  }
  return {
    x: player.x + player.w * 0.5,
    y: player.y + (player.slideState !== "none" ? player.h * 0.5 : player.h * 0.38)
  };
}

function updateAimAngle() {
  updateMouseWorld();
  const origin = playerAimOrigin();
  const targetX = mouse.active ? mouse.worldX : origin.x + player.facing * 120;
  const targetY = mouse.active ? mouse.worldY : origin.y;
  player.aimAngle = Math.atan2(targetY - origin.y, targetX - origin.x);
  if (mouse.active && Math.abs(targetX - origin.x) > 4) {
    player.facing = targetX >= origin.x ? 1 : -1;
  }
}

function getAimVector(useAssist) {
  updateAimAngle();
  const origin = playerAimOrigin();
  let tx = mouse.active ? mouse.worldX : origin.x + player.facing * 160;
  let ty = mouse.active ? mouse.worldY : origin.y;
  let assisted = false;
  let target = null;

  if (useAssist && Math.random() < 0.7) {
    const assistedTarget = findAimAssistTarget(origin, tx, ty);
    if (assistedTarget) {
      tx = assistedTarget.x * 0.92 + tx * 0.08;
      ty = assistedTarget.y * 0.92 + ty * 0.08;
      assisted = true;
      target = assistedTarget.enemy;
    }
  } else if (useAssist) {
    const miss = (Math.random() - 0.5) * 0.1;
    const dx = tx - origin.x;
    const dy = ty - origin.y;
    const angle = Math.atan2(dy, dx) + miss;
    const distance = Math.max(180, Math.hypot(dx, dy));
    tx = origin.x + Math.cos(angle) * distance;
    ty = origin.y + Math.sin(angle) * distance;
  }

  let dx = tx - origin.x;
  let dy = ty - origin.y;
  if (player.slideState !== "none") {
    dy = Math.max(dy, Math.abs(dx) * 0.12);
  }
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len, assisted, angle: Math.atan2(dy, dx), target };
}

function gunClearLength(origin, dir, length, padding = 4) {
  const step = 6;
  for (let dist = 8; dist <= length; dist += step) {
    const probe = {
      x: origin.x + dir.x * dist - padding,
      y: origin.y + dir.y * dist - padding,
      w: padding * 2,
      h: padding * 2
    };
    if (platforms.some((platform) => rectsOverlap(probe, platform))) {
      return Math.max(0, dist - step);
    }
  }
  return length;
}

function findAimAssistTarget(origin, tx, ty) {
  const aimDx = tx - origin.x;
  const aimDy = ty - origin.y;
  const aimLen = Math.hypot(aimDx, aimDy) || 1;
  let best = null;
  let bestScore = Infinity;

  for (const enemy of enemies) {
    if (enemy.dead) {
      continue;
    }
    const ex = enemy.x + enemy.w * 0.5;
    const ey = enemy.y + enemy.h * 0.45;
    const dx = ex - origin.x;
    const dy = ey - origin.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1 || dist > 900) {
      continue;
    }
    const dot = (dx / dist) * (aimDx / aimLen) + (dy / dist) * (aimDy / aimLen);
    if (dot < 0.82) {
      continue;
    }
    const score = dist * (1.12 - dot);
    if (score < bestScore) {
      bestScore = score;
      best = { x: ex, y: ey, enemy };
    }
  }

  return best;
}

function bulletTargetAlive(target) {
  return target && !target.dead;
}

function findBulletHomingTarget(bullet) {
  if (bulletTargetAlive(bullet.target)) {
    return bullet.target;
  }

  const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
  const dirX = bullet.vx / speed;
  const dirY = bullet.vy / speed;
  let best = null;
  let bestScore = Infinity;
  for (const enemy of enemies) {
    if (enemy.dead) {
      continue;
    }
    const ex = enemy.x + enemy.w * 0.5;
    const ey = enemy.y + enemy.h * 0.45;
    const dx = ex - bullet.x;
    const dy = ey - bullet.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8 || dist > PLAYER_BULLET_TRACKING.range) {
      continue;
    }
    const dot = (dx / dist) * dirX + (dy / dist) * dirY;
    if (dot < 0.64) {
      continue;
    }
    const score = dist * (1.18 - dot);
    if (score < bestScore) {
      bestScore = score;
      best = enemy;
    }
  }
  return best;
}

function updatePlayerBulletTracking(bullet, dt) {
  bullet.trackingAge = (bullet.trackingAge || 0) + dt;
  const strength = bullet.trackingStrength || 0;
  if (strength <= 0 || bullet.trackingAge > PLAYER_BULLET_TRACKING.lifeWindow) {
    return;
  }
  const target = findBulletHomingTarget(bullet);
  if (!target) {
    return;
  }
  bullet.target = target;
  const tx = target.x + target.w * 0.5;
  const ty = target.y + target.h * 0.45;
  const dx = tx - bullet.x;
  const dy = ty - bullet.y;
  const targetLen = Math.hypot(dx, dy) || 1;
  const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
  const currentX = bullet.vx / speed;
  const currentY = bullet.vy / speed;
  const turn = clamp(strength * PLAYER_BULLET_TRACKING.maxTurnPerSecond * dt, 0, 0.16);
  const mixedX = lerpValue(currentX, dx / targetLen, turn);
  const mixedY = lerpValue(currentY, dy / targetLen, turn);
  const mixedLen = Math.hypot(mixedX, mixedY) || 1;
  bullet.vx = (mixedX / mixedLen) * speed;
  bullet.vy = (mixedY / mixedLen) * speed;
}

function startSlide(now) {
  if (player.slideState !== "none" || !player.grounded || Math.abs(player.vx) < 150) {
    return false;
  }
  player.slideState = "tap";
  player.slideHold = 0;
  player.slideDir = signNonZero(player.vx || player.facing);
  input.downStartedAt = now;
  setPlayerHeight(player.slideH);
  player.vx += player.slideDir * MOVE.slideBoost;
  player.vx = clamp(player.vx, -MOVE.maxRun * 1.45, MOVE.maxRun * 1.45);
  notePlayerTactic("slide", 0.75);
  addStyle("SLIDE", 5, "#4df7ff");
  burstParticles(player.x + player.w * 0.5, player.y + player.h, "#4df7ff", 8, 170);
  return true;
}

function stopSlide(force = false) {
  if (player.slideState === "none") {
    return;
  }
  if (!force && !canStand()) {
    player.slideState = "full";
    return;
  }
  player.slideState = "none";
  setPlayerHeight(player.standH);
}

function queueJump() {
  player.jumpBufferTimer = MOVE.jumpBuffer;
}

function consumeJump() {
  if (player.jumpBufferTimer <= 0 || player.ledge) {
    return false;
  }

  if (player.airStrafeWindow > 0) {
    doAirStrafe(player.airStrafeQueuedSuper && !player.superStrafeUsed, player.airStrafeQueuedSuper ? MOVE.easyStrafeHang : null);
    return true;
  }

  if (player.slideState !== "none" && player.slideHold <= MOVE.strafeComboWindow && !player.superStrafeUsed) {
    player.airStrafeDir = player.slideDir || player.facing || 1;
    doAirStrafe(true, MOVE.easyStrafeHang);
    return true;
  }

  if (player.grounded || player.coyoteTimer > 0) {
    doJump(MOVE.jumpSpeed, false);
    return true;
  }

  if (player.wallSide !== 0) {
    const away = -player.wallSide;
    stopSlide(true);
    player.vx = away * MOVE.wallJumpX;
    player.vy = -MOVE.wallJumpY;
    player.facing = away;
    player.wallSide = 0;
    player.canDoubleJump = true;
    player.grounded = false;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
    addStyle("WALL BOUNCE", 10, "#b8fff3");
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.55, "#4df7ff", 14, 260);
    return true;
  }

  if (player.canDoubleJump && !(player.vy > 0 && groundBelowWithin(Math.max(70, player.vy * MOVE.jumpBuffer + 22)))) {
    doJump(MOVE.doubleJumpSpeed, true);
    player.canDoubleJump = false;
    return true;
  }

  return false;
}

function groundBelowWithin(distance) {
  const probe = {
    x: player.x + 3,
    y: player.y + player.h,
    w: player.w - 6,
    h: distance
  };
  return platforms.some((platform) => {
    if (isSlopePlatform(platform)) {
      const footX = player.x + player.w * 0.5;
      const surfaceY = platformSurfaceY(platform, footX);
      return footX >= platform.x && footX <= platform.x + platform.w && surfaceY >= player.y + player.h - 3 && surfaceY <= player.y + player.h + distance;
    }
    return platform.y >= player.y + player.h - 3 && rectsOverlap(probe, platform);
  });
}

function updateCheckpoints() {
  const playerCenterX = player.x + player.w * 0.5;
  for (const checkpoint of checkpoints) {
    if (playerCenterX >= checkpoint.x - 14 && player.y + player.h <= checkpoint.y + 130) {
      if (activeCheckpoint !== checkpoint) {
        if (activeCheckpoint) {
          activeCheckpoint.active = false;
        }
        activeCheckpoint = checkpoint;
        checkpoint.active = true;
        burstParticles(checkpoint.x, checkpoint.y - 44, "#ffd166", 18, 230);
        if (checkpoint.platform?.theme) {
          finale.message = checkpoint.platform.theme.name;
          finale.messageTimer = 0.95;
        }
      }
    }
  }
}

function respawnAtCheckpoint(playEffects = true) {
  const checkpoint = activeCheckpoint || checkpoints[0] || { x: 120, y: 680 };
  stopSlide(true);
  Object.assign(player, {
    x: checkpoint.x + 18,
    y: checkpoint.y - player.standH - 2,
    h: player.standH,
    vx: 0,
    vy: 0,
    grounded: false,
    wasGrounded: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    canDoubleJump: true,
    wallSide: 0,
    invuln: playEffects ? 1.1 : 0,
    emptyTimer: 0,
    emptyMessage: "",
    reloadTimer: 0,
    reloadFrame: 0,
    powerTimer: 0,
    slideState: "none",
    slideHold: 0,
    slideDir: 1,
    airStrafeWindow: 0,
    airStrafeQueuedSuper: false,
    airStrafeDir: 1,
    airStrafeTimer: 0,
    superStrafeUsed: false,
    easyStrafeUsed: false,
    doubleJumpArmed: false,
    airHangTimer: 0,
    speedBoostTimer: 0,
    airCrouchBoosted: false,
    airTurnDir: 0,
    airTurnCooldown: 0,
    airTurnTimer: 0,
    airBodyAngle: 0,
    airSpin: 0,
    airSpinVelocity: 0,
    turnTimer: 0,
    turnDir: 1,
    runHoldDir: 0,
    runHoldTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    meleeTimer: 0,
    meleeCooldown: 0,
    combatAssistTimer: 0,
    meleeType: null,
    meleeDir: 1,
    meleeHit: false,
    meleeFrame: 0,
    ledge: null,
    ledgeClimbTimer: 0,
    ragdoll: null,
    ragdollMode: "none",
    maxDropVy: 0
  });
  camera.x = clamp(player.x - canvasState.width * 0.36, 0, Math.max(0, WORLD.levelEndX - canvasState.width));
  camera.y = clamp(player.y - canvasState.height * 0.58, 80, 430);
  enemyBullets = [];
  if (playEffects) {
    shake = Math.max(shake, 8);
    playSfx("hurt");
    burstParticles(player.x + player.w * 0.5, player.y + player.h, "#4df7ff", 24, 280);
  }
}

function findRescuePlatform() {
  const playerCenterX = player.x + player.w * 0.5;
  let best = activeCheckpoint?.platform || null;
  let bestScore = best ? Math.abs((best.x + best.w * 0.5) - playerCenterX) * 0.4 : Infinity;
  for (const platform of platforms) {
    if (ENEMY_STREAM_BLOCKED_KINDS.has(platform.kind) || platform.kind === "secretArena" || platform.kind === "secretWall") {
      continue;
    }
    const centerX = platform.x + platform.w * 0.5;
    const distanceX = Math.abs(centerX - playerCenterX);
    if (distanceX > RESCUE_GRAPPLE.searchForward && centerX > playerCenterX) {
      continue;
    }
    if (distanceX > RESCUE_GRAPPLE.searchBackward && centerX < playerCenterX) {
      continue;
    }
    const score = distanceX + Math.max(0, platform.y - player.y) * 0.35;
    if (score < bestScore) {
      best = platform;
      bestScore = score;
    }
  }
  return best;
}

function tryUseRescueGrapple() {
  if ((player.rescueGrapples || 0) <= 0 || player.deathRagdoll) {
    return false;
  }
  const platform = findRescuePlatform();
  if (!platform) {
    return false;
  }
  player.rescueGrapples -= 1;
  const targetX = clamp(player.x, platform.x + 44, platform.x + platform.w - player.w - 44);
  const surfaceY = platformSurfaceY(platform, targetX + player.w * 0.5);
  player.x = targetX;
  player.y = surfaceY - player.h - 8;
  player.vx = signNonZero(player.facing || 1) * RESCUE_GRAPPLE.pullVx;
  player.vy = RESCUE_GRAPPLE.pullVy;
  player.grounded = false;
  player.coyoteTimer = MOVE.coyote;
  player.maxDropVy = 0;
  player.rescueTimer = 0.8;
  addStyle("RESCUE GRAPPLE", 20, "#ffd166");
  finale.message = "RESCUE GRAPPLE";
  finale.messageTimer = 1.15;
  shake = Math.max(shake, 7);
  playSfx("dash");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.4, "#ffd166", 34, 480);
  return true;
}

function handleFall() {
  if (tryUseRescueGrapple()) {
    return;
  }
  if (enterSecretDropSection()) {
    return;
  }
  player.hp -= 1;
  comboCount = 0;
  multiplier = 1;
  if (player.hp <= 0) {
    die();
    return;
  }
  respawnAtCheckpoint(true);
}

function updateGroundTurnIntent(moveDir, dt) {
  if (!player.grounded || player.slideState !== "none" || player.ledge || player.meleeType) {
    if (!player.grounded) {
      player.runHoldTimer = 0;
    }
    if (moveDir !== 0) {
      player.runHoldDir = moveDir;
    }
    return;
  }

  if (moveDir === 0) {
    player.runHoldTimer = Math.max(0, player.runHoldTimer - dt * 2.5);
    return;
  }

  const wasCommitted = player.runHoldDir !== 0 && moveDir !== player.runHoldDir && player.runHoldTimer >= 0.42;
  if (wasCommitted && player.turnTimer <= 0 && Math.abs(player.vx) > 120) {
    player.turnTimer = PLAYER_TURN_FRAMES.length / 60;
    player.turnDir = moveDir;
    player.animFrame = 0;
    player.poseBlend = 0;
    burstParticles(player.x + player.w * 0.5, player.y + player.h - 2, "#ffd166", 8, 180);
  }

  if (moveDir === player.runHoldDir) {
    player.runHoldTimer += dt;
  } else {
    player.runHoldDir = moveDir;
    player.runHoldTimer = dt;
  }
}

function doJump(speed, doubleJump) {
  stopSlide(true);
  player.vy = -speed;
  player.grounded = false;
  player.coyoteTimer = 0;
  player.jumpBufferTimer = 0;
  player.maxDropVy = 0;
  player.doubleJumpArmed = !!doubleJump;
  const color = doubleJump ? "#ffd166" : "#4df7ff";
  playSfx(doubleJump ? "doubleJump" : "jump");
  notePlayerTactic("air", doubleJump ? 0.8 : 0.35);
  addStyle(doubleJump ? "DOUBLE JUMP" : "JUMP", doubleJump ? 6 : 2, color);
  burstParticles(player.x + player.w * 0.5, player.y + player.h, color, doubleJump ? 16 : 10, doubleJump ? 280 : 190);
}

function doAirStrafe(superStrafe = false, hangDuration = null) {
  const dir = player.airStrafeDir || player.facing || 1;
  const boost = superStrafe ? MOVE.superStrafeBoost : 1;
  const duration = hangDuration || MOVE.superStrafeHang;
  stopSlide(true);
  player.vx = dir * MOVE.airStrafeX * boost;
  player.vy = -MOVE.airStrafeY * (superStrafe ? 0.92 : 1);
  player.facing = dir;
  player.grounded = false;
  player.coyoteTimer = 0;
  player.jumpBufferTimer = 0;
  player.airStrafeWindow = 0;
  player.airStrafeQueuedSuper = false;
  player.airStrafeTimer = superStrafe ? duration : 0.34;
  player.airCrouchBoosted = false;
  if (superStrafe) {
    player.superStrafeUsed = true;
    player.airHangTimer = duration;
    player.speedBoostTimer = duration;
  } else {
    player.speedBoostTimer = Math.max(player.speedBoostTimer, 0.55);
  }
  player.canDoubleJump = true;
  notePlayerTactic("air", superStrafe ? 2 : 1);
  addStyle(superStrafe ? "AIR STRAFE" : "AIR CUT", superStrafe ? 18 : 8, superStrafe ? "#ffd166" : "#4df7ff");
  shake = Math.max(shake, superStrafe ? 7 : 3);
  playSfx("strafe");
  burstParticles(player.x + player.w * 0.5, player.y + player.h, superStrafe ? "#ffd166" : "#4df7ff", superStrafe ? 34 : 20, superStrafe ? 460 : 320);
}

function vaultLedge() {
  if (!player.ledge) {
    return;
  }
  const ledge = player.ledge;
  const platform = ledge.platform;
  stopSlide(true);
  player.x = ledge.side > 0 ? platform.x + 10 : platform.x + platform.w - player.w - 10;
  player.y = platform.y - player.h - 1;
  player.vx = ledge.side * 180;
  player.vy = -250;
  player.ledge = null;
  player.ledgeClimbTimer = LEDGE_CLIMB_DURATION;
  player.airBodyAngle = 0;
  player.ragdoll = null;
  player.ragdollMode = "none";
  player.animFrame = 0;
  player.poseBlend = 0;
  player.grounded = true;
  player.canDoubleJump = true;
  player.jumpBufferTimer = 0;
  addStyle("LEDGE VAULT", 8, "#4df7ff");
  playSfx("ledgeClimb");
  burstParticles(player.x + player.w * 0.5, player.y + player.h, "#4df7ff", 10, 170);
}

function positionPlayerAtHalfMantle() {
  if (!player.ledge?.platform) {
    return;
  }
  const platform = player.ledge.platform;
  const side = player.ledge.side;
  player.x = side > 0 ? platform.x - player.w - 1 : platform.x + platform.w + 1;
  player.y = platform.y - player.h + 4;
}

function tryDash() {
  if (gameState !== "playing" || player.dashCooldown > 0 || player.ledge) {
    return;
  }
  const dir = player.facing || 1;
  player.dashTimer = MOVE.dashTime;
  player.dashCooldown = MOVE.dashCooldown;
  player.vx = dir * MOVE.dashSpeed;
  player.vy *= 0.35;
  player.facing = dir;
  shake = Math.max(shake, 4);
  addStyle("DASH", 5, "#4df7ff");
  playSfx("dash");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.55, "#4df7ff", 18, 310);
}

function startReload() {
  if (gameState !== "playing" || player.reloadTimer > 0 || player.magAmmo >= currentClipSize() || player.reserveAmmo <= 0) {
    return false;
  }
  player.reloadTimer = currentReloadDuration();
  player.reloadFrame = 0;
  player.weaponCooldown = Math.max(player.weaponCooldown, currentReloadDuration());
  notePlayerTactic("reload", 1.6);
  if (Math.abs(player.vx) > MOVE.maxRun * 0.72 || player.airStrafeTimer > 0) {
    addStyle("RELOAD CANCEL", 10, "#ffd166");
  }
  playSfx("reload");
  return true;
}

function updateReload(dt) {
  if (player.reloadTimer <= 0) {
    return;
  }
  player.reloadTimer = Math.max(0, player.reloadTimer - dt);
  const progress = 1 - player.reloadTimer / currentReloadDuration();
  player.reloadFrame = Math.min(currentReloadFrames() - 1, Math.floor(progress * currentReloadFrames()));
  if (player.reloadTimer <= 0) {
    finishReload();
  }
}

function finishReload() {
  const needed = currentClipSize() - player.magAmmo;
  const loaded = Math.min(needed, player.reserveAmmo);
  player.magAmmo += loaded;
  player.reserveAmmo -= loaded;
  syncCurrentReserveToBank();
  player.reloadTimer = 0;
  player.reloadFrame = 0;
}

function inventoryWeaponDps(type) {
  const weapon = weaponConfig(type);
  return (weapon.damage * (weapon.pellets || 1)) / Math.max(0.05, weapon.fireCooldown);
}

function availableAmmoForWeapon(type) {
  const bank = player.ammoBank?.[type] || 0;
  return bank + (player.weaponType === type ? player.magAmmo : 0);
}

function smartInventoryWeaponScore(type, spareAmmo = 0) {
  const settings = smartInventory.settings;
  const ammo = availableAmmoForWeapon(type) + spareAmmo;
  let score = inventoryWeaponDps(type) * 0.08 + Math.min(70, ammo) * 0.018;
  if (type === player.weaponType) {
    score += 1.2;
  }
  if (settings.weapon === type) {
    score += 3.2;
  } else if (settings.weapon === "balanced") {
    score += type === "ar" ? 1.2 : type === "smg" ? 0.8 : type === "shotgun" ? 0.7 : 0.45;
  }
  if (settings.reserve === "save_ar" && type === "ar") {
    score -= 1.1;
  } else if (settings.reserve === "spend_ar" && type === "ar") {
    score += 1.1;
  } else if (settings.reserve === "save_shells" && type === "shotgun") {
    score -= 0.9;
  } else if (settings.reserve === "dump_low" && ammo < weaponConfig(type).clipSize * 0.3) {
    score -= 1.4;
  }
  const closeEnemy = nearestLiveEnemyDistance() < 260;
  const bonusBossClose = nearestBonusBossDistance() < 360;
  if (settings.swap === "close" && closeEnemy && type === "shotgun") {
    score += 4;
  } else if (settings.swap === "dps") {
    score += inventoryWeaponDps(type) * 0.05;
  } else if (settings.swap === "ammo") {
    score += Math.min(120, ammo) * 0.028;
  }
  if (type === "shotgun" && !closeEnemy && settings.weapon !== "shotgun") {
    score -= 0.55;
  }
  if (bonusBossClose) {
    score += type === "shotgun" ? 2.1 : type === "smg" ? 1.35 : type === "ar" ? 0.9 : 0.25;
  }
  if (player.shield <= 1.5 && type === "shotgun" && closeEnemy) {
    score += 0.8;
  }
  return score;
}

function shouldEquipWeaponPickup(type, spareAmmo = 0) {
  if (!smartInventory.enabled || smartInventory.settings.pickup === "weapons") {
    return true;
  }
  if (smartInventory.settings.pickup === "ammo") {
    return false;
  }
  if (smartInventory.settings.pickup === "current") {
    return type === player.weaponType;
  }
  if (smartInventory.settings.pickup === "rare" && (type === "shotgun" || type === "smg")) {
    return true;
  }
  if (smartInventory.settings.swap === "off") {
    return type === player.weaponType;
  }
  return smartInventoryWeaponScore(type, spareAmmo) > smartInventoryWeaponScore(player.weaponType, 0) + 0.35;
}

function smartInventoryReloadThreshold() {
  const style = smartInventory.settings.reload;
  if (style === "empty") {
    return 0;
  }
  let threshold = style === "early" ? 0.58 : style === "late" ? 0.16 : style === "safe" ? 0.38 : 0.32;
  if (smartInventory.settings.reserve === "save_ar" && player.weaponType === "ar") {
    threshold *= 0.55;
  } else if (smartInventory.settings.reserve === "spend_ar" && player.weaponType === "ar") {
    threshold *= 1.2;
  } else if (smartInventory.settings.reserve === "save_shells" && player.weaponType === "shotgun") {
    threshold *= 0.5;
  }
  return clamp(threshold, 0, 0.72);
}

function smartInventoryCanReload() {
  if (!smartInventory.enabled || player.reloadTimer > 0 || player.reserveAmmo <= 0 || player.magAmmo >= currentClipSize()) {
    return false;
  }
  if (smartInventory.settings.reload === "safe") {
    return player.grounded && nearestLiveEnemyDistance() > (player.shield <= 1 ? 430 : 330) && nearestEnemyBulletDistance() > (player.shield <= 1 ? 240 : 180);
  }
  return true;
}

function smartInventoryBestWeapon() {
  if (!smartInventory.enabled || smartInventory.settings.swap === "off" || player.reloadTimer > 0) {
    return null;
  }
  let bestType = player.weaponType;
  let bestScore = smartInventoryWeaponScore(player.weaponType, 0);
  for (const type of Object.keys(WEAPONS)) {
    if (type !== player.weaponType && availableAmmoForWeapon(type) <= Math.max(2, weaponConfig(type).clipSize * 0.18)) {
      continue;
    }
    const score = smartInventoryWeaponScore(type, 0);
    if (score > bestScore + 1.35) {
      bestType = type;
      bestScore = score;
    }
  }
  return bestType !== player.weaponType ? bestType : null;
}

function updateSmartInventoryManagement(dt) {
  smartInventory.lastActionTimer = Math.max(0, smartInventory.lastActionTimer - dt);
  if (!smartInventory.enabled || gameState !== "playing") {
    return;
  }
  smartInventory.tick -= dt;
  if (smartInventory.tick > 0) {
    return;
  }
  smartInventory.tick = 0.12;

  const threshold = smartInventoryReloadThreshold();
  const lowMag = currentClipSize() > 0 && player.magAmmo / currentClipSize() <= threshold;
  if ((player.magAmmo <= 0 || lowMag) && smartInventoryCanReload() && startReload()) {
    smartInventory.lastAction = "AUTO RELOAD";
    smartInventory.lastActionTimer = 1.2;
    return;
  }

  const bestWeapon = smartInventoryBestWeapon();
  if (bestWeapon) {
    equipWeapon(bestWeapon, 0, true);
    smartInventory.lastAction = `AUTO ${weaponConfig(bestWeapon).label}`;
    smartInventory.lastActionTimer = 1.2;
  }
}

function shoot() {
  if (gameState !== "playing" || player.weaponCooldown > 0 || player.reloadTimer > 0) {
    return;
  }
  if (player.magAmmo <= 0) {
    if (playerOutOfAllAmmo() && startUnarmedAttack()) {
      return;
    }
    if (!startReload()) {
      playSfx("dry");
      setPlayerAmmoWarning("OUT OF AMMO", 0.75);
      player.weaponCooldown = 0.16;
    }
    return;
  }

  const airStrafeShot = player.airStrafeTimer > 0;
  const sliding = player.slideState !== "none";
  const powered = playerPowered();
  const weapon = weaponConfig();
  const weaponScale = playerWeaponScale();
  const aim = getAimVector(true);
  const dir = aim.x >= 0 ? 1 : -1;
  const speed = (airStrafeShot ? weapon.bulletSpeed * 1.3 : weapon.bulletSpeed) * (powered ? 1.12 : 1);
  const damage = weapon.damage * (powered ? 2 : 1);
  player.facing = dir;
  player.aimAngle = aim.angle;
  const origin = playerAimOrigin();
  const clearLength = gunClearLength(origin, aim, weapon.length * weaponScale + 8);
  if (clearLength < 18) {
    playSfx("dry");
    setPlayerAmmoWarning("SHOT BLOCKED", 0.45);
    player.weaponCooldown = 0.12;
    return;
  }
  const muzzleLength = Math.min(weapon.length * weaponScale, clearLength - 2);
  const muzzleX = origin.x + aim.x * muzzleLength;
  const muzzleY = origin.y + aim.y * muzzleLength + (sliding ? 5 : 0);

  const pellets = weapon.pellets || 1;
  for (let i = 0; i < pellets; i += 1) {
    const spread = pellets > 1 ? (i - (pellets - 1) / 2) * (weapon.spread / Math.max(1, pellets - 1)) + (Math.random() - 0.5) * weapon.spread * 0.18 : (Math.random() - 0.5) * weapon.spread;
    const shotAngle = aim.angle + spread;
    const shotX = Math.cos(shotAngle);
    const shotY = Math.sin(shotAngle);
    playerBullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: shotX * speed,
      vy: shotY * speed,
      r: (airStrafeShot || aim.assisted ? 4 : 3) * (powered ? 1.65 : 1) * (player.weaponType === "shotgun" ? 0.9 : 1),
      damage,
      life: player.weaponType === "shotgun" ? 0.42 : 0.75,
      trail: [],
      color: powered ? "#b8fff3" : airStrafeShot ? "#ffd166" : aim.assisted ? "#b8fff3" : weapon.color,
      weaponType: player.weaponType,
      target: aim.target || null,
      trackingStrength: (player.weaponType === "shotgun" ? 0.12 : PLAYER_BULLET_TRACKING.strength) * (airStrafeShot ? 1.15 : 1),
      trackingAge: 0
    });
  }

  player.magAmmo -= 1;
  player.weaponCooldown = weapon.fireCooldown;
  shake = Math.max(shake, airStrafeShot ? 2.4 + weapon.kick * 0.4 : weapon.kick);
  notePlayerTactic("gun", airStrafeShot ? 1.4 : 1);
  playSfx(player.weaponType === "shotgun" ? "shotgun" : "shoot");
  burstParticles(muzzleX, muzzleY, powered ? "#b8fff3" : airStrafeShot ? "#ffd166" : aim.assisted ? "#b8fff3" : weapon.color, powered ? 9 : airStrafeShot ? 7 : pellets > 1 ? 14 : 4, powered ? 170 : pellets > 1 ? 240 : 110);
  if (player.magAmmo <= 0) {
    startReload();
  }
}

function fireShotgun() {
  if (gameState !== "playing" || player.weaponCooldown > 0 || player.reloadTimer > 0) {
    return;
  }
  if (player.weaponType === "shotgun") {
    shoot();
    return;
  }
  if ((player.shotgunAmmo || 0) <= 0) {
    if (playerOutOfAllAmmo() && startUnarmedAttack()) {
      return;
    }
    playSfx("dry");
    setPlayerAmmoWarning("OUT OF AMMO", 0.75);
    player.weaponCooldown = 0.16;
    return;
  }

  const weapon = WEAPONS.shotgun;
  const powered = playerPowered();
  const aim = getAimVector(true);
  const dir = aim.x >= 0 ? 1 : -1;
  player.facing = dir;
  player.aimAngle = aim.angle;
  const origin = playerAimOrigin();
  const weaponScale = playerWeaponScale();
  const clearLength = gunClearLength(origin, aim, weapon.length * weaponScale + 8);
  if (clearLength < 18) {
    playSfx("dry");
    setPlayerAmmoWarning("SHOT BLOCKED", 0.45);
    player.weaponCooldown = 0.12;
    return;
  }
  const muzzleLength = Math.min(weapon.length * weaponScale, clearLength - 2);
  const muzzleX = origin.x + aim.x * muzzleLength;
  const muzzleY = origin.y + aim.y * muzzleLength;
  for (let i = 0; i < weapon.pellets; i += 1) {
    const spread = (i - (weapon.pellets - 1) / 2) * (weapon.spread / Math.max(1, weapon.pellets - 1)) + (Math.random() - 0.5) * weapon.spread * 0.22;
    const shotAngle = aim.angle + spread;
    playerBullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(shotAngle) * weapon.bulletSpeed,
      vy: Math.sin(shotAngle) * weapon.bulletSpeed,
      r: 3.2 * (powered ? 1.55 : 1),
      damage: weapon.damage * (powered ? 2 : 1),
      life: 0.42,
      trail: [],
      color: powered ? "#b8fff3" : weapon.color,
      weaponType: "shotgun",
      target: aim.target || null,
      trackingStrength: 0.12,
      trackingAge: 0
    });
  }
  player.shotgunAmmo = Math.max(0, player.shotgunAmmo - 1);
  player.weaponCooldown = weapon.fireCooldown;
  player.vx -= dir * 80;
  shake = Math.max(shake, 7);
  notePlayerTactic("gun", 1.6);
  playSfx("shotgun");
  burstParticles(muzzleX, muzzleY, weapon.color, 18, 260);
}

function isRegularRedEnemy(enemy) {
  return enemy && (enemy.type === "soldier" || enemy.type === "turret");
}

function enemyShoot(enemy, bossBurst = false) {
  const cx = enemy.x + enemy.w * 0.5;
  const cy = enemy.y + enemy.h * 0.42;
  const tactic = dominantTacticForEnemy(enemy);
  const leadBonus = tactic === "air" ? 0.18 : tactic === "slide" ? 0.08 : 0;
  const leadTime = (enemy.type === "finalBoss" ? 0.55 : enemy.type === "boss" ? 0.45 : enemy.type === "elite" ? 0.38 : 0.28) + leadBonus;
  let px = player.x + player.w * 0.5 + player.vx * leadTime;
  let py = player.y + player.h * (tactic === "slide" ? 0.7 : 0.5) + player.vy * leadTime * (tactic === "air" ? 0.46 : 0.35);
  if (aiFrameDirector.enabled && aiFrameDirector.prediction) {
    const predictionWeight = clamp(aiFrameDirector.prediction.confidence * (enemy.type === "finalBoss" ? 0.48 : enemy.type === "elite" ? 0.34 : 0.24), 0, 0.48);
    px = lerpValue(px, aiFrameDirector.prediction.nextX + player.w * 0.5, predictionWeight);
    py = lerpValue(py, aiFrameDirector.prediction.nextY + player.h * 0.5, predictionWeight);
  }
  const dx = px - cx;
  const dy = py - cy;
  const trueAngle = Math.atan2(dy, dx);
  const enemyAccuracy = enemy.type === "elite" ? ELITE_TRAITS.accuracy : AI.accuracy;
  const enemyAimAssist = enemy.type === "elite" ? ELITE_TRAITS.aimAssist : isRegularRedEnemy(enemy) ? AI.regularAimAssist : 0;
  const accurate = Math.random() < enemyAccuracy;
  const enemyWeapon = weaponConfig(enemy.weaponType || "ar");
  const burstSpread = bossBurst ? (Math.random() - 0.5) * (enemy.type === "finalBoss" ? 0.24 : 0.16) : 0;
  const missSpread = accurate ? 0 : (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.36);
  const weaponSpread = (enemyWeapon.spread || 0) * 0.55;
  const rawShotAngle = trueAngle + burstSpread + missSpread + (Math.random() - 0.5) * weaponSpread;
  const shotAngle = accurate ? rawShotAngle : lerpAngleValue(rawShotAngle, trueAngle, enemyAimAssist);
  const speed = Math.max(enemyWeapon.bulletSpeed * 0.46, enemy.type === "finalBoss" ? 500 : enemy.type === "boss" ? 455 : enemy.type === "elite" ? 430 : 360) * (tactic === "air" ? 1.08 : 1);
  enemy.aimAngle = shotAngle;
  enemyBullets.push({
    x: cx,
    y: cy,
    vx: Math.cos(shotAngle) * speed,
    vy: Math.sin(shotAngle) * speed,
    r: enemy.type === "finalBoss" ? 6 : enemy.type === "boss" || enemy.bonusBoss ? 5 : 4,
    life: 3,
    trail: [],
    color: enemy.type === "finalBoss" ? "#c66bff" : enemy.bonusBoss ? enemy.bonusColor : enemy.type === "boss" ? "#ffd166" : enemy.type === "elite" ? "#ff7a30" : enemyWeapon.color || "#ff304f",
    owner: enemy
  });
}

function queueEnemyShot(enemy, bossBurst = false) {
  if (enemy.pendingShot || enemy.type === "dummy") {
    return;
  }
  enemy.pendingShot = true;
  enemy.pendingBossBurst = bossBurst;
  const windup = enemy.type === "elite" ? ELITE_TRAITS.fireDelay : AI.shootDelay;
  enemy.shotWindup = windup;
  enemy.crouchTimer = Math.max(enemy.crouchTimer || 0, windup);
}

function releaseQueuedEnemyShot(enemy) {
  if (!enemy.pendingShot || enemy.shotWindup > 0) {
    return;
  }
  const bossBurst = !!enemy.pendingBossBurst;
  enemy.pendingShot = false;
  enemy.pendingBossBurst = false;
  enemyShoot(enemy, bossBurst);
  if (bossBurst) {
    enemy.burstShots = Math.max(0, enemy.burstShots - 1);
    enemy.burstGap = enemy.type === "finalBoss" ? 0.09 : enemy.bonusBoss ? (bonusBossBlueprint(enemy).id === "rail" ? 0.07 : 0.12) : enemy.type === "elite" ? 0.16 : 0.12;
  }
}

function enemyIsStaggered(enemy) {
  return (enemy.staggerTimer || 0) > 0 || (enemy.shield || 0) <= 0 && enemy.weakSpotHits >= 1 && enemy.hp <= Math.max(2, enemy.maxHp * 0.45);
}

function staggerEnemy(enemy, duration = 0.9, reason = "STAGGER") {
  if (!enemy || enemy.dead) {
    return;
  }
  enemy.staggerTimer = Math.max(enemy.staggerTimer || 0, duration);
  enemy.crouchTimer = Math.max(enemy.crouchTimer || 0, Math.min(duration, 0.32));
  enemy.pendingShot = false;
  enemy.burstShots = 0;
  enemy.fireTimer += Math.min(0.5, duration * 0.35);
  addStyle(reason, 8, "#ffd166");
}

function enemyWeakSpotAt(enemy, hitY, weaponType = "ar") {
  const relative = (hitY - enemy.y) / Math.max(1, enemy.h);
  if (relative < 0.27) {
    return { kind: "HEAD", damageScale: weaponType === "shotgun" ? 1.15 : 1.7, reward: "ammo" };
  }
  if (relative > 0.36 && relative < 0.58) {
    return { kind: "CORE", damageScale: 1.28, reward: "shield" };
  }
  return null;
}

function rewardWeakSpot(enemy, weakSpot, x, y) {
  if (!weakSpot || !enemy || enemy.dead) {
    return;
  }
  enemy.weakSpotHits = (enemy.weakSpotHits || 0) + 1;
  staggerEnemy(enemy, weakSpot.kind === "HEAD" ? 1.0 : 0.72, `${weakSpot.kind} STAGGER`);
  score += Math.round((weakSpot.kind === "HEAD" ? 45 : 30) * multiplier);
  if (weakSpot.reward === "ammo" && Math.random() < 0.55) {
    collectWeaponAmmo(player.weaponType, player.weaponType === "shotgun" ? 1 : 4);
  } else if (weakSpot.reward === "shield" && Math.random() < 0.22) {
    restorePlayerShield(0.5);
  }
  burstParticles(x, y, weakSpot.kind === "HEAD" ? "#ffd166" : "#b8fff3", weakSpot.kind === "HEAD" ? 20 : 14, 310);
}

function spawnMildBlood(x, y, count = 18) {
  const teenCount = Math.min(4, Math.max(1, Math.ceil(count * 0.18)));
  for (let i = 0; i < teenCount; i += 1) {
    const angle = -Math.PI * 0.82 + Math.random() * Math.PI * 1.64;
    const force = 48 + Math.random() * 95;
    const maxLife = BLOOD_EFFECT.maxLife;
    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - 25,
      life: maxLife,
      maxLife,
      color: Math.random() > 0.45 ? "#8a2638" : "#661827",
      size: 0.9 + Math.random() * 1.4,
      blood: true
    });
  }
}

function findPursuerSpawnPlatform() {
  let best = null;
  let bestScore = Infinity;
  const footY = player.y + player.h;
  for (const platform of platforms) {
    if (platform.kind === "routeBlocker" || platform.kind === "lowceiling") {
      continue;
    }
    const overlapsX = platform.x < player.x + player.w + 120 && platform.x + platform.w > player.x - 360;
    if (!overlapsX || platform.y < footY - 34 || platform.y > footY + 140) {
      continue;
    }
    const score = Math.abs(platform.y - footY) + Math.max(0, platform.x - player.x) * 0.25;
    if (score < bestScore) {
      bestScore = score;
      best = platform;
    }
  }
  return best || activeCheckpoint?.platform || platforms[0];
}

function spawnFinalePursuers() {
  finale.pursuers = [];
  const spawnPlatform = findPursuerSpawnPlatform();
  if (!spawnPlatform) {
    return;
  }
  for (let i = 0; i < 4; i += 1) {
    const offset = clamp(player.x - spawnPlatform.x - 92 - i * 44, 34, Math.max(36, spawnPlatform.w - 66));
    const enemy = addEnemy(i === 0 ? "elite" : "soldier", spawnPlatform, offset, 5);
    if (!enemy) {
      continue;
    }
    enemy.finalePursuer = true;
    enemy.finalePursuerIndex = i;
    enemy.chaseAmbush = true;
    enemy.aiState = "combat";
    enemy.alert = 1;
    enemy.shootDelay = 999;
    enemy.fireTimer = 999;
    enemy.left = -100000;
    enemy.right = 100000;
    enemy.vx = 250 + i * 34;
    enemy.vy = -140 - i * 18;
    enemy.ragdollAngle = (Math.random() - 0.5) * 0.8;
    enemy.ragdollSpin = (i % 2 === 0 ? 1 : -1) * (4.2 + Math.random() * 2.4);
    finale.pursuers.push(enemy);
  }
}

function finaleGroundForEnemy(enemy, prevY) {
  const cx = enemy.x + enemy.w * 0.5;
  let best = null;
  let bestY = Infinity;
  for (const platform of platforms) {
    if (!["chaseStart", "downhill", "bossgate", "finaldeck"].includes(platform.kind)) {
      continue;
    }
    if (cx < platform.x - 8 || cx > platform.x + platform.w + 8) {
      continue;
    }
    if (prevY + enemy.h > platform.y + 72 || enemy.y + enemy.h < platform.y) {
      continue;
    }
    if (platform.y < bestY) {
      bestY = platform.y;
      best = platform;
    }
  }
  return best;
}

function updateFinalePursuer(enemy, dt) {
  enemy.hurtFlash = Math.max(0, enemy.hurtFlash - dt);
  enemy.crouchTimer = Math.max(0, enemy.crouchTimer - dt);
  enemy.facing = 1;
  enemy.aimAngle = 0;
  enemy.alert = 1;
  enemy.animFrame += dt * (enemy.finaleRagdoll ? 18 : 10);

  if (!enemy.finaleRagdoll && (finale.chaseTimer > 0.42 || enemy.x > finale.chaseStartX + 90)) {
    enemy.finaleRagdoll = true;
    enemy.airStrafeTimer = 0.7;
    enemy.grounded = false;
    enemy.vx = 480 + enemy.finalePursuerIndex * 54;
    enemy.vy = -270 - enemy.finalePursuerIndex * 42;
    enemy.crouchTimer = 0.16;
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, "#ff304f", 8, 260);
  }

  if (!enemy.finaleRagdoll) {
    enemy.vx = approach(enemy.vx, Math.max(280, player.vx * 0.45 + 260), 1000 * dt);
    enemy.x += enemy.vx * dt;
    enemy.y = enemy.platform.y - enemy.h;
    return;
  }

  const prevY = enemy.y;
  enemy.airStrafeTimer = Math.max(0.12, enemy.airStrafeTimer - dt);
  enemy.vx = approach(enemy.vx, 620 + enemy.finalePursuerIndex * 34, 360 * dt);
  enemy.vy += WORLD.gravity * 0.9 * dt;
  enemy.vy = Math.min(enemy.vy, WORLD.maxFall);
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  enemy.ragdollAngle += enemy.ragdollSpin * dt;

  const ground = finaleGroundForEnemy(enemy, prevY);
  if (ground && enemy.y + enemy.h >= ground.y) {
    enemy.platform = ground;
    enemy.y = ground.y - enemy.h;
    enemy.vy = -210 - Math.random() * 150;
    enemy.vx += 55 + Math.random() * 85;
    enemy.ragdollSpin *= -0.82;
    enemy.crouchTimer = 0.12;
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, "#ff304f", 5, 160);
  }
}

function removeFinaleEnemiesForBoss() {
  let bloodBursts = 0;
  for (const enemy of enemies) {
    if (enemy.dead || enemy.type === "finalBoss") {
      continue;
    }
    if (enemy.finalePursuer || Math.abs(enemy.x - player.x) < 1200 || bloodBursts < 4) {
      spawnMildBlood(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.52, enemy.finalePursuer ? 18 : 5);
      bloodBursts += 1;
    }
    enemy.dead = true;
    startEnemyDeathRagdoll(enemy);
  }
  if (bloodBursts === 0) {
    spawnMildBlood(player.x - 80, player.y + player.h * 0.5, 18);
  }
  finale.pursuers = [];
  enemyBullets = [];
}

function beginFinalePurge() {
  if (finale.phase !== "chase") {
    return;
  }
  finale.phase = "purge";
  finale.bossIntroTimer = 0.62;
  finale.crowd = [];
  finale.crowdJumpTimer = 0;
  finale.message = "THEY DROP. THE TWIN WAITS.";
  finale.messageTimer = 1.4;
  removeFinaleEnemiesForBoss();
  shake = Math.max(shake, 12);
  playSfx("hit");
}

function startFinaleChase() {
  if (finale.phase !== "sections") {
    return;
  }
  finale.phase = "chase";
  finale.chaseTimer = 0;
  finale.crowdJumpTimer = FINALE.crowdJumpDuration;
  finale.message = "CHASE: DOWNHILL TO THE TWIN";
  finale.messageTimer = 2.3;
  finale.crowd = [];
  spawnFinalePursuers();
  shake = Math.max(shake, 8);
  playSfx("dash");
  burstParticles(player.x - 70, player.y + player.h, "#ff304f", 38, 430);
}

function startFinaleBoss() {
  if (finale.phase === "boss" || finale.phase === "clear") {
    return;
  }
  finale.phase = "boss";
  finale.bossTimer = 0;
  finale.bossIntroTimer = 0;
  finale.crowd = [];
  finale.pursuers = [];
  finale.crowdJumpTimer = 0;
  finale.message = "EVIL TWIN: WEAPONS NORMAL, BODY BUFFED";
  finale.messageTimer = 2.8;
  enemyBullets = [];
  for (const enemy of enemies) {
    if (enemy !== finale.boss) {
      if (!enemy.dead) {
        enemy.dead = true;
        startEnemyDeathRagdoll(enemy);
      }
    }
  }
  if (finale.boss && !finale.boss.dead) {
    finale.boss.hp = Math.max(finale.boss.hp, finale.boss.maxHp);
    finale.boss.aiState = "combat";
    finale.boss.alert = 1;
    finale.boss.shootDelay = Math.max(finale.boss.shootDelay || 0, AI.shootDelay);
  }
  shake = Math.max(shake, 11);
  playSfx("deflect");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.4, "#c66bff", 52, 520);
}

function startArmWrestle(enemy) {
  if (!enemy || enemy.dead || finale.armWrestle.active || enemy.armWrestleUsed) {
    return;
  }
  const combos = ["MIRROR LOCK", "ROOFTOP CLINCH", "AIR STRAFE CLASH", "TWIN BREAK"];
  const centerX = (player.x + player.w * 0.5 + enemy.x + enemy.w * 0.5) * 0.5;
  const surfaceY = platformSurfaceY(enemy.platform, centerX);
  const standY = surfaceY - player.h;
  stopSlide(true);
  enemy.armWrestleUsed = true;
  player.x = centerX - player.w - 34;
  player.y = standY;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.ledge = null;
  player.airBodyAngle = 0;
  enemy.x = centerX + 34;
  enemy.y = surfaceY - enemy.h;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.grounded = true;
  enemy.airStrafeTimer = 0;
  finale.armWrestle = {
    active: true,
    timer: FINALE.armWrestleDuration,
    pull: 0,
    success: false,
    boss: enemy,
    combo: combos[Math.floor(Math.random() * combos.length)]
  };
  finale.message = "LEFT STICK FULL LEFT";
  finale.messageTimer = FINALE.armWrestleDuration;
  shake = Math.max(shake, 9);
  playSfx("hit");
  burstParticles(centerX, surfaceY - 28, "#b8fff3", 34, 420);
}

function finishArmWrestle(success) {
  const enemy = finale.armWrestle.boss;
  finale.armWrestle.active = false;
  finale.armWrestle.timer = 0;
  if (!enemy || enemy.dead) {
    return;
  }

  if (success) {
    const damage = Math.ceil(enemy.maxHp * 0.18);
    enemy.hp -= damage;
    enemy.hurtFlash = 0.22;
    enemy.vx = 360;
    enemy.vy = -440;
    enemy.grounded = false;
    player.vx = -300;
    player.vy = -360;
    player.airSpinVelocity -= 7;
    shake = Math.max(shake, 15);
    playSfx("deflect");
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.45, "#b8fff3", 64, 640);
    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  } else {
    player.vx = -460;
    player.vy = -240;
    enemy.vx = 190;
    enemy.vy = -180;
    enemy.grounded = false;
    hurtPlayer(1.5);
    shake = Math.max(shake, 13);
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.45, "#ff304f", 42, 520);
  }
}

function startBonusClash(enemy) {
  if (!enemy || enemy.dead || !enemy.bonusBoss || bonusClash.active || finale.armWrestle.active) {
    return;
  }
  const blueprint = bonusBossBlueprint(enemy);
  const qte = blueprint.qte;
  enemy.bonusQteCooldown = (blueprint.qteCooldown || 4.2) + Math.random() * 1.2;
  enemy.bonusQteUsedCount = (enemy.bonusQteUsedCount || 0) + 1;
  const centerX = (player.x + player.w * 0.5 + enemy.x + enemy.w * 0.5) * 0.5;
  const surfaceY = platformSurfaceY(enemy.platform, centerX);
  bonusClash = {
    active: true,
    enemy,
    blueprint,
    timer: qte.duration,
    duration: qte.duration,
    action: qte.action,
    label: qte.label,
    hits: 0,
    needed: qte.taps,
    centerX,
    surfaceY,
    flash: 0,
    resultTimer: 0,
    resultText: ""
  };
  stopSlide(true);
  player.x = centerX - player.w - 46;
  player.y = surfaceY - player.h;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  enemy.x = centerX + 42;
  enemy.y = surfaceY - enemy.h;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.grounded = true;
  enemy.crouchTimer = 0.16;
  finale.message = `${blueprint.name}: ${qte.label}`;
  finale.messageTimer = qte.duration;
  shake = Math.max(shake, 8);
  playSfx("hit");
  burstParticles(centerX, surfaceY - 36, blueprint.color, 32, 440);
}

function registerBonusClashInput(action) {
  if (!bonusClash.active || gameState !== "playing") {
    return false;
  }
  if (action !== bonusClash.action) {
    bonusClash.flash = 0.12;
    shake = Math.max(shake, 4);
    return false;
  }
  bonusClash.hits = Math.min(bonusClash.needed, bonusClash.hits + 1);
  bonusClash.flash = 0.2;
  playSfx("deflect");
  const enemy = bonusClash.enemy;
  const cx = enemy ? enemy.x + enemy.w * 0.5 : player.x + player.w * 0.5;
  const cy = enemy ? enemy.y + enemy.h * 0.45 : player.y + player.h * 0.45;
  burstParticles(cx, cy, bonusClash.blueprint?.color || "#b8fff3", 18 + bonusClash.hits * 6, 420);
  if (bonusClash.hits >= bonusClash.needed) {
    finishBonusClash(true);
  }
  return true;
}

function finishBonusClash(success) {
  const clash = bonusClash;
  const enemy = clash.enemy;
  if (!clash.active) {
    return;
  }
  bonusClash.active = false;
  bonusClash.resultTimer = 0.7;
  bonusClash.resultText = success ? "BONUS LAUNCH" : "COUNTER MISSED";
  finale.message = bonusClash.resultText;
  finale.messageTimer = 1.15;
  if (!enemy || enemy.dead) {
    return;
  }

  const blueprint = clash.blueprint || bonusBossBlueprint(enemy);
  const qte = blueprint.qte;
  const away = enemy.x + enemy.w * 0.5 >= player.x + player.w * 0.5 ? 1 : -1;
  if (success) {
    const damage = Math.max(5, Math.ceil(enemy.maxHp * qte.damage));
    enemy.hp -= damage;
    enemy.hurtFlash = 0.32;
    enemy.grounded = false;
    enemy.vx = away * qte.flingX;
    enemy.vy = qte.flingY;
    enemy.airStrafeTimer = 0.54;
    player.vx = -away * 260;
    player.vy = -360;
    player.airSpinVelocity += away * 5;
    score += 250 + damage * 35;
    shake = Math.max(shake, 16);
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.45, blueprint.color, 76, 720);
    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  } else {
    player.vx = -away * 440;
    player.vy = -260;
    enemy.vx = away * 180;
    enemy.vy = -210;
    enemy.grounded = false;
    hurtPlayer(1.5);
    shake = Math.max(shake, 13);
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.45, "#ff304f", 38, 520);
  }
}

function updateBonusClash(dt) {
  if (!bonusClash.active) {
    bonusClash.resultTimer = Math.max(0, bonusClash.resultTimer - dt);
    return;
  }
  const enemy = bonusClash.enemy;
  if (!enemy || enemy.dead) {
    bonusClash.active = false;
    return;
  }
  bonusClash.timer = Math.max(0, bonusClash.timer - dt);
  bonusClash.flash = Math.max(0, bonusClash.flash - dt);
  const centerX = bonusClash.centerX;
  const surfaceY = bonusClash.surfaceY;
  const pressure = 1 - clamp(bonusClash.timer / Math.max(0.01, bonusClash.duration), 0, 1);
  const bob = Math.sin(pressure * Math.PI * 8) * 4;
  player.x = centerX - player.w - 42 - bonusClash.hits * 6;
  player.y += (surfaceY - player.h + bob - player.y) * Math.min(1, dt * 12);
  enemy.x = centerX + 42 + bonusClash.hits * 10;
  enemy.y += (surfaceY - enemy.h - bob - enemy.y) * Math.min(1, dt * 12);
  player.vx = 0;
  player.vy = 0;
  enemy.vx = 0;
  enemy.vy = 0;
  player.grounded = true;
  enemy.grounded = true;
  player.facing = 1;
  enemy.facing = -1;
  enemy.crouchTimer = 0.1;
  if (bonusClash.timer <= 0) {
    finishBonusClash(false);
  }
}

function canStartEliteTakedown(enemy, distance, distanceY) {
  return enemy.type === "elite"
    && !eliteTakedown.active
    && !bonusClash.active
    && !finale.armWrestle.active
    && (enemy.shield || 0) <= 0
    && distance < ELITE_TRAITS.takedownRange
    && Math.abs(distanceY) < 135
    && gamepadControls.aimX >= ELITE_TRAITS.rightStickThreshold;
}

function startEliteTakedown(enemy) {
  const centerX = (player.x + player.w * 0.5 + enemy.x + enemy.w * 0.5) * 0.5;
  const surfaceY = platformSurfaceY(enemy.platform, enemy.x + enemy.w * 0.5);
  const direction = enemy.x + enemy.w * 0.5 >= player.x + player.w * 0.5 ? 1 : -1;
  eliteTakedown = {
    active: true,
    enemy,
    frame: 0,
    duration: ELITE_TRAITS.takedownFrames / ELITE_TRAITS.takedownFps,
    centerX,
    surfaceY,
    direction,
    flash: 0
  };
  enemy.eliteTakedown = true;
  enemy.pendingShot = false;
  enemy.burstShots = 0;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.grounded = true;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.facing = direction;
  player.meleeType = "punch";
  player.meleeTimer = getMeleeDuration("punch");
  player.meleeCooldown = 0;
  input.shootQueued = false;
  input.shotgunQueued = false;
  input.reloadQueued = false;
  input.weaponCycleQueued = false;
  input.combatQueued = false;
  finale.message = "ORANGE TAKEDOWN";
  finale.messageTimer = eliteTakedown.duration;
  shake = Math.max(shake, 8);
  playSfx("takedownStart");
  burstParticles(centerX, surfaceY - 34, "#ff7a30", 34, 460);
}

function updateEliteTakedown(dt) {
  const take = eliteTakedown;
  const enemy = take.enemy;
  if (!take.active || !enemy || enemy.dead) {
    eliteTakedown = makeEliteTakedownState();
    player.meleeType = null;
    return;
  }

  const previousFrame = take.frame;
  input.shootQueued = false;
  input.shotgunQueued = false;
  input.reloadQueued = false;
  input.weaponCycleQueued = false;
  input.combatQueued = false;
  take.frame = Math.min(ELITE_TRAITS.takedownFrames, take.frame + dt * ELITE_TRAITS.takedownFps);
  const progress = clamp(take.frame / ELITE_TRAITS.takedownFrames, 0, 1);
  const arc = Math.sin(progress * Math.PI);
  const snap = Math.sin(progress * Math.PI * 6) * (1 - progress);
  const dir = take.direction || 1;
  const surfaceY = platformSurfaceY(enemy.platform, take.centerX);

  player.facing = dir;
  enemy.facing = -dir;
  player.x = take.centerX - player.w * 0.5 - dir * (52 - progress * 34);
  enemy.x = take.centerX - enemy.w * 0.5 + dir * (46 + progress * 78);
  player.y = surfaceY - player.h - arc * 82 + snap * 6;
  enemy.y = surfaceY - enemy.h - Math.sin(progress * Math.PI * 0.9) * 58 - snap * 4;
  player.vx = 0;
  player.vy = 0;
  enemy.vx = 0;
  enemy.vy = 0;
  player.grounded = progress > 0.82;
  enemy.grounded = progress > 0.9;
  enemy.crouchTimer = 0.18;
  enemy.hurtFlash = 0.08;
  player.airBodyAngle = dir * Math.sin(progress * Math.PI * 2) * 0.75;

  player.meleeType = progress < 0.25 ? "punch" : progress < 0.62 ? "kick" : progress < 0.82 ? "punch" : "elbow";
  const meleeDuration = getMeleeDuration(player.meleeType);
  player.meleeTimer = meleeDuration * (1 - (progress * 3) % 1);

  for (const impactFrame of [18, 44, 72, 108, 142, 176, 196]) {
    if (previousFrame < impactFrame && take.frame >= impactFrame) {
      const finisher = impactFrame >= 196;
      burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.45, finisher ? "#ffd166" : "#ff7a30", finisher ? 54 : 26, finisher ? 720 : 420);
      shake = Math.max(shake, finisher ? 16 : impactFrame >= 108 ? 10 : 7);
      playSfx(finisher ? "takedownFinish" : impactFrame >= 108 ? "takedownImpact" : "punch");
    }
  }

  if (take.frame >= ELITE_TRAITS.takedownFrames) {
    enemy.eliteTakedown = false;
    enemy.shield = 0;
    killEnemy(enemy);
    player.meleeType = null;
    player.meleeTimer = 0;
    player.airBodyAngle = 0;
    player.vx = dir * 260;
    player.vy = -180;
    eliteTakedown = makeEliteTakedownState();
  }
}

function enemyMeleeDuration(type) {
  return type === "kick" ? 0.58 : 0.26;
}

function enemyMeleeDamage(type) {
  return type === "kick" ? 1.5 : 1;
}

function startEnemyMelee(enemy, type = null) {
  if (!enemy || enemy.dead || enemy.meleeCooldown > 0 || enemy.meleeTimer > 0 || enemy.pendingShot || enemyTakedown.active) {
    return false;
  }
  enemy.meleeType = type || (Math.random() < (enemy.type === "elite" ? 0.58 : 0.42) ? "kick" : "punch");
  enemy.meleeTimer = enemyMeleeDuration(enemy.meleeType);
  enemy.meleeCooldown = enemy.meleeType === "kick" ? 0.96 : 0.48;
  enemy.meleeHit = false;
  enemy.meleeFrame = 0;
  enemy.crouchTimer = Math.max(enemy.crouchTimer || 0, 0.08);
  enemy.vx += enemy.facing * (enemy.meleeType === "kick" ? 120 : 80);
  playSfx(enemy.meleeType);
  return true;
}

function enemyMeleeHitbox(enemy) {
  const range = enemy.meleeType === "kick" ? 126 : 94;
  return {
    x: enemy.facing > 0 ? enemy.x + enemy.w - 6 : enemy.x - range + 6,
    y: enemy.y + 4,
    w: range,
    h: enemy.h - 4
  };
}

function damagePlayerFromEnemy(enemy, amount, source = "enemyMelee") {
  if (player.invuln > 0 || gameState !== "playing") {
    return false;
  }
  const canTakedown = enemy
    && (enemy.type === "soldier" || enemy.type === "elite")
    && source !== "fall"
    && enemyCanStartPlayerTakedown(enemy, amount);
  if (canTakedown) {
    startEnemyTakedown(enemy);
    return true;
  }
  return hurtPlayer(amount, source);
}

function updateEnemyMelee(enemy, dt) {
  if (!enemy.meleeType) {
    return false;
  }
  const duration = enemyMeleeDuration(enemy.meleeType);
  const frames = enemy.meleeType === "kick" ? PLAYER_KICK_FRAMES : PLAYER_PUNCH_FRAMES;
  const elapsed = duration - enemy.meleeTimer;
  const progress = clamp(elapsed / Math.max(0.001, duration), 0, 1);
  enemy.meleeFrame = Math.min(frames.length - 1, Math.floor(progress * frames.length));

  if (!enemy.meleeHit && enemy.meleeFrame >= MELEE.hitFrame) {
    enemy.meleeHit = true;
    const hitbox = enemyMeleeHitbox(enemy);
    if (rectsOverlap(hitbox, player)) {
      const damage = enemyMeleeDamage(enemy.meleeType);
      player.vx = enemy.facing * (enemy.meleeType === "kick" ? 360 : 230);
      player.vy = enemy.meleeType === "kick" ? -250 : -160;
      shake = Math.max(shake, enemy.meleeType === "kick" ? 11 : 7);
      burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.46, enemy.type === "elite" ? "#ff7a30" : "#ff304f", enemy.meleeType === "kick" ? 22 : 14, 320);
      damagePlayerFromEnemy(enemy, damage, "enemyMelee");
      if (enemyTakedown.active) {
        return true;
      }
    }
  }

  enemy.meleeTimer -= dt;
  if (enemy.meleeTimer <= 0) {
    enemy.meleeTimer = 0;
    enemy.meleeType = null;
    enemy.meleeHit = false;
    enemy.meleeFrame = 0;
  }
  return false;
}

function canEnemyMeleePlayer(enemy, distance, distanceY) {
  return (enemy.type === "soldier" || enemy.type === "elite")
    && enemy.grounded
    && enemy.aiState === "combat"
    && enemy.meleeCooldown <= 0
    && enemy.meleeTimer <= 0
    && Math.abs(distanceY) < 82
    && distance < AI.meleeRange + (enemy.type === "elite" ? 18 : 0);
}

function enemyCanStartPlayerTakedown(enemy, incomingDamage = 0) {
  if (!enemy || enemy.playerTakedownUsed || enemyTakedown.active || player.shield > 0) {
    return false;
  }
  if (enemy.type === "soldier") {
    return isExactRedTakedownHp(player.hp);
  }
  if (enemy.type === "elite") {
    return player.hp - incomingDamage <= 0;
  }
  return false;
}

function randomEnemyTakedownMove(previousType = "") {
  const moves = ["punch", "kick", "elbow"];
  let move = moves[Math.floor(Math.random() * moves.length)];
  if (move === previousType) {
    move = moves[(moves.indexOf(move) + 1 + Math.floor(Math.random() * 2)) % moves.length];
  }
  return move;
}

function makeEnemyTakedownCombo(frameLimit = ENEMY_TAKEDOWN_FRAMES) {
  const timings = [16, 40, 66, 94, 122, 150, 178, frameLimit - 7];
  const combo = [];
  let previousType = "";
  for (let i = 0; i < timings.length; i += 1) {
    const type = randomEnemyTakedownMove(previousType);
    previousType = type;
    combo.push({ frame: timings[i], type, finisher: i === timings.length - 1 });
  }
  return combo;
}

function enemyTakedownMoveAt(take, progress) {
  if (!take.combo?.length) {
    return progress < 0.36 ? "punch" : progress < 0.7 ? "kick" : "elbow";
  }
  let move = take.combo[0].type;
  for (const hit of take.combo) {
    if (take.frame + 10 >= hit.frame) {
      move = hit.type;
    }
  }
  return move;
}

function startEnemyTakedown(enemy) {
  if (!enemy || enemy.dead || enemyTakedown.active || gameState !== "playing") {
    return;
  }
  const centerX = (player.x + player.w * 0.5 + enemy.x + enemy.w * 0.5) * 0.5;
  const surfaceY = platformSurfaceY(enemy.platform, enemy.x + enemy.w * 0.5);
  const direction = player.x + player.w * 0.5 >= enemy.x + enemy.w * 0.5 ? 1 : -1;
  const frameLimit = ENEMY_TAKEDOWN_FRAMES;
  enemy.playerTakedownUsed = true;
  enemyTakedown = {
    active: true,
    enemy,
    frame: 0,
    frameLimit,
    duration: frameLimit / ELITE_TRAITS.takedownFps,
    combo: makeEnemyTakedownCombo(frameLimit),
    centerX,
    surfaceY,
    direction,
    flash: 0
  };
  enemy.pendingShot = false;
  enemy.burstShots = 0;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.grounded = true;
  enemy.meleeType = "punch";
  enemy.meleeTimer = enemyMeleeDuration("punch");
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.ledge = null;
  player.invuln = 999;
  player.meleeType = null;
  finale.message = enemy.type === "elite" ? "ORANGE EXECUTION" : "RED EXECUTION";
  finale.messageTimer = enemyTakedown.duration;
  shake = Math.max(shake, 14);
  playSfx("takedownStart");
  burstParticles(centerX, surfaceY - 38, enemy.type === "elite" ? "#ff7a30" : "#ff304f", 42, 520);
}

function updateEnemyTakedown(dt) {
  const take = enemyTakedown;
  const enemy = take.enemy;
  if (!take.active || !enemy || enemy.dead) {
    enemyTakedown = makeEnemyTakedownState();
    player.invuln = 0;
    return;
  }

  const previousFrame = take.frame;
  input.shootQueued = false;
  input.shotgunQueued = false;
  input.reloadQueued = false;
  input.weaponCycleQueued = false;
  input.combatQueued = false;
  const frameLimit = take.frameLimit || ENEMY_TAKEDOWN_FRAMES;
  take.frame = Math.min(frameLimit, take.frame + dt * ELITE_TRAITS.takedownFps);
  const progress = clamp(take.frame / frameLimit, 0, 1);
  const dir = take.direction || 1;
  const arc = Math.sin(progress * Math.PI);
  const snap = Math.sin(progress * Math.PI * 7) * (1 - progress);
  const surfaceY = platformSurfaceY(enemy.platform, take.centerX);

  enemy.facing = dir;
  player.facing = -dir;
  enemy.x = take.centerX - enemy.w * 0.5 - dir * (44 - progress * 22);
  player.x = take.centerX - player.w * 0.5 + dir * (48 + progress * 60);
  enemy.y = surfaceY - enemy.h - arc * 42 + snap * 4;
  player.y = surfaceY - player.h - Math.sin(progress * Math.PI * 0.92) * 74 - snap * 7;
  enemy.vx = 0;
  enemy.vy = 0;
  player.vx = 0;
  player.vy = 0;
  enemy.grounded = progress > 0.88;
  player.grounded = progress > 0.82;
  player.airBodyAngle = -dir * Math.sin(progress * Math.PI * 2.2) * 0.82;
  enemy.meleeType = enemyTakedownMoveAt(take, progress);
  enemy.meleeTimer = enemyMeleeDuration(enemy.meleeType) * (1 - (progress * 4) % 1);
  enemy.crouchTimer = 0.12;

  for (const impact of take.combo || []) {
    if (previousFrame < impact.frame && take.frame >= impact.frame) {
      const finisher = impact.finisher;
      const color = enemy.type === "elite" ? "#ff7a30" : "#ff304f";
      enemy.meleeType = impact.type;
      enemy.meleeTimer = enemyMeleeDuration(impact.type);
      const bloodCount = finisher ? 5 : 2;
      const hitY = player.y + player.h * (impact.type === "kick" ? 0.62 : impact.type === "elbow" ? 0.38 : 0.46);
      addBloodSplatters(player.x + player.w * 0.5 - dir * 8, hitY, dir, bloodCount, null, "playerTakedown");
      burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.45, finisher ? "#ffd166" : color, finisher ? 24 : 10, finisher ? 520 : 300);
      shake = Math.max(shake, finisher ? 18 : impact.frame >= 116 ? 12 : 8);
      playSfx(finisher ? "takedownFinish" : impact.type);
    }
  }

  if (take.frame >= frameLimit) {
    enemy.meleeType = null;
    enemy.meleeTimer = 0;
    player.invuln = 0;
    startPlayerDeathRagdoll("enemyTakedown", dir);
    enemyTakedown = makeEnemyTakedownState();
    die();
  }
}

function updateArmWrestle(dt) {
  const arm = finale.armWrestle;
  const enemy = arm.boss;
  if (!arm.active || !enemy || enemy.dead) {
    arm.active = false;
    return;
  }
  const pull = Math.max(keys.left ? 1 : 0, -keys.moveX);
  arm.pull = clamp(arm.pull + (pull > 0.86 ? dt : -dt * 0.7), 0, FINALE.armWrestleDuration);
  arm.success = arm.pull >= 0.38;
  arm.timer = Math.max(0, arm.timer - dt);

  const centerX = (player.x + player.w * 0.5 + enemy.x + enemy.w * 0.5) * 0.5;
  const surfaceY = platformSurfaceY(enemy.platform, centerX);
  const bob = Math.sin((FINALE.armWrestleDuration - arm.timer) * Math.PI * 4) * 3;
  player.x = centerX - player.w - 38 - arm.pull * 20;
  player.y += (surfaceY - player.h + bob - player.y) * Math.min(1, dt * 10);
  enemy.x = centerX + 38 - arm.pull * 30;
  enemy.y += (surfaceY - enemy.h - bob - enemy.y) * Math.min(1, dt * 10);
  player.vx = 0;
  player.vy = 0;
  enemy.vx = 0;
  enemy.vy = 0;
  player.grounded = true;
  enemy.grounded = true;
  enemy.facing = -1;
  player.facing = 1;
  player.airBodyAngle = 0;
  enemy.crouchTimer = 0.08;
  burstParticles(centerX, player.y + 30, arm.success ? "#b8fff3" : "#c66bff", 1, 90);

  if (arm.timer <= 0) {
    finishArmWrestle(arm.success);
  }
}

function updateFinale(dt) {
  finale.messageTimer = Math.max(0, finale.messageTimer - dt);
  if (finale.armWrestle.active) {
    updateArmWrestle(dt);
    return;
  }
  if (finale.phase === "sections" && player.x + player.w * 0.5 >= finale.chaseStartX) {
    startFinaleChase();
  }
  if (finale.phase === "chase") {
    finale.chaseTimer += dt;
    finale.crowdJumpTimer = Math.max(0, finale.crowdJumpTimer - dt);
    if (player.x + player.w * 0.5 >= finale.bossStartX) {
      beginFinalePurge();
    }
  }
  if (finale.phase === "purge") {
    finale.bossIntroTimer = Math.max(0, finale.bossIntroTimer - dt);
    if (finale.bossIntroTimer <= 0) {
      startFinaleBoss();
    }
  }
  if (finale.phase === "boss") {
    finale.bossTimer += dt;
    const boss = finale.boss;
    if (!boss || boss.dead) {
      appendEndlessRunBatch();
      return;
    }
    boss.armWrestleCooldown = Math.max(0, (boss.armWrestleCooldown || 0) - dt);
    const dx = player.x + player.w * 0.5 - (boss.x + boss.w * 0.5);
    const dy = player.y + player.h * 0.5 - (boss.y + boss.h * 0.5);
    const distance = Math.hypot(dx, dy);
    if (!boss.armWrestleUsed && boss.armWrestleCooldown <= 0 && finale.bossTimer > 2 && (distance < 260 || boss.hp <= boss.maxHp * 0.68 || finale.bossTimer > 5.5)) {
      startArmWrestle(boss);
    }
  }
}

function retireOldSections(dt) {
  const retireX = camera.x - ENEMY_STREAM.retireBehind;
  for (const platform of platforms) {
    if (platform.x + platform.w < retireX) {
      platform.streamRetireTimer = (platform.streamRetireTimer || 0) + dt;
      if (platform.streamRetireTimer >= ENEMY_STREAM.retireDelay) {
        platform.enemyStreamRetired = true;
      }
    } else {
      platform.streamRetireTimer = 0;
    }
    platform.streamCooldown = Math.max(0, (platform.streamCooldown || 0) - dt);
  }
}

function cleanupOldActors() {
  const retireX = camera.x - ENEMY_STREAM.retireBehind;
  const unseenLeftX = camera.x - 120;
  const cullX = Math.max(retireX, unseenLeftX);
  const farRight = camera.x + canvasState.width + ENEMY_STREAM.spawnAheadEnd + 900;

  enemies = enemies.filter((enemy) => {
    if (isCarriedRagdoll(enemy)) {
      return true;
    }
    if (activeBossEnemy(enemy)) {
      return true;
    }
    let keep = true;
    if (enemy.dead) {
      keep = enemy.x + enemy.w > cullX;
    } else {
      keep = !(enemy.platform?.enemyStreamRetired || enemy.x + enemy.w < cullX);
    }
    if (!keep) {
      recycleEnemy(enemy);
    }
    return keep;
  });

  playerBullets = playerBullets.filter((bullet) => bullet.life > 0 && bullet.x > cullX && bullet.x < farRight);
  enemyBullets = enemyBullets.filter((bullet) => bullet.life > 0 && bullet.x > cullX && bullet.x < farRight);
  pickups = pickups.filter((pickup) => !pickup.collected && pickup.life > 0 && pickup.x + pickup.w > cullX);
  particles = particles.filter((particle) => particle.life > 0 && particle.x > cullX);
  bloodSplatters = bloodSplatters.filter((splat) => splat.x > cullX);
  if (bloodSplatters.length > BLOOD_EFFECT.maxSplats) {
    bloodSplatters.splice(0, bloodSplatters.length - BLOOD_EFFECT.maxSplats);
  }
  powerCubes = powerCubes.filter((cube) => cube.active && cube.x + cube.w > cullX);
  platforms = platforms.filter((platform) => platform.x + platform.w > cullX || platform === activeCheckpoint?.platform);
  checkpoints = checkpoints.filter((checkpoint) => checkpoints.length <= 1 || checkpoint.x > cullX || checkpoint === activeCheckpoint);
  refreshActiveCheckpoint();
}

function enemyVisibleInCamera(enemy, margin = ENEMY_PERF.drawMargin) {
  return enemy.x + enemy.w > camera.x - margin
    && enemy.x < camera.x + canvasState.width + margin
    && enemy.y + enemy.h > camera.y - margin
    && enemy.y < camera.y + canvasState.height + margin;
}

function activeOnscreenEnemyCount() {
  let count = 0;
  for (const enemy of enemies) {
    if (!enemy.dead && enemyVisibleInCamera(enemy, 60)) {
      count += 1;
    }
  }
  return count;
}

function performanceStressAmount() {
  return clamp((performanceFrameTime - 1 / 60) / Math.max(0.001, ENEMY_PERF.stressFrameTime - 1 / 60), 0, 1);
}

function refillForwardEnemies() {
  const liveEnemies = enemies.filter((enemy) => !enemy.dead);
  const liveCount = liveEnemies.length;
  const stress = performanceStressAmount();
  const targetAhead = Math.round(lerpValue(ENEMY_STREAM.targetAhead, 22, stress));
  const maxAdds = Math.max(1, Math.round(lerpValue(ENEMY_STREAM.maxAddsPerTick, 1, stress)));
  const viewRight = camera.x + canvasState.width;
  const spawnStart = Math.max(viewRight + ENEMY_STREAM.spawnAheadStart, player.x + canvasState.width * 0.55);
  const spawnEnd = viewRight + ENEMY_STREAM.spawnAheadEnd;
  let aheadCount = 0;

  for (const enemy of liveEnemies) {
    const enemyX = enemy.x + enemy.w * 0.5;
    if (enemyX >= camera.x && enemyX <= spawnEnd) {
      aheadCount += 1;
    }
  }

  if (activeOnscreenEnemyCount() >= ENEMY_PERF.maxOnscreen || (liveCount >= ENEMY_STREAM.maxLive && aheadCount >= targetAhead)) {
    return;
  }

  const candidates = platforms
    .filter((platform) => platformSupportsStreamingEnemy(platform)
      && platform.x + platform.w > spawnStart
      && platform.x < spawnEnd
      && (platform.streamCooldown || 0) <= 0
      && platformEnemyCount(platform) < platformEnemyLimit(platform))
    .sort((a, b) => (a.x - b.x) + (Math.random() - 0.5) * 120);

  let added = 0;
  for (const platform of candidates) {
    if (added >= maxAdds) {
      break;
    }
    if (liveCount + added >= ENEMY_STREAM.maxLive && aheadCount + added >= targetAhead) {
      break;
    }
    if (addStreamEnemy(platform)) {
      added += 1;
    }
  }
}

function updateEnemyStreaming(dt) {
  retireOldSections(dt);
  cleanupOldActors();
  enemyStreamTimer = Math.max(0, enemyStreamTimer - dt);
  if (enemyStreamTimer > 0) {
    return;
  }
  enemyStreamTimer = ENEMY_STREAM.refillInterval;
  refillForwardEnemies();
}

function updateBasementTrap(dt) {
  if (gameState !== "captured" || !secretDrop.trapped) {
    return;
  }
  time += dt;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.wasGrounded = true;
  player.invuln = 999;
  player.stunTimer = 999;
  player.ledge = null;
  player.slideState = "none";
  player.airBodyAngle = Math.sin(time * 7) * 0.08;
  player.animFrame += dt * 2.5;
  secretDrop.whipTimer = Math.max(0, (secretDrop.whipTimer || 0) - dt);

  for (const enemy of enemies) {
    if (!enemy.secretDropGuard || enemy.dead) {
      continue;
    }
    const enemyCenter = enemy.x + enemy.w * 0.5;
    enemy.facing = player.x + player.w * 0.5 >= enemyCenter ? 1 : -1;
    enemy.vx = 0;
    enemy.vy = 0;
    enemy.grounded = true;
    enemy.y = platformSurfaceY(enemy.platform, enemyCenter) - enemy.h;
    enemy.aiState = "combat";
    enemy.alert = 1;
    enemy.memoryTimer = AI.memoryTime;
    enemy.pendingShot = false;
    enemy.fireTimer = 999;
    enemy.shootDelay = 999;
    enemy.meleeType = "whip";
    enemy.meleeTimer = 1;
    enemy.meleeCooldown = 0;
    enemy.animFrame += dt * 10;
    enemy.aimAngle = Math.atan2(
      player.y + player.h * 0.42 - (enemy.y + enemy.h * 0.45),
      player.x + player.w * 0.5 - enemyCenter
    );
  }

  updateDeadEnemyRagdolls(dt);
  updateRagdollShield(dt);
  updateBloodSplatters(dt);
  updateParticles(dt);
  updateRain(dt);
  updateCamera(dt);

  if (secretDrop.whipTimer <= 0) {
    secretDrop.whipTimer = 0.75;
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.45, "#ffd166", 14, 220);
    shake = Math.max(shake, 4);
    playSfx("takedownImpact");
  }
}

function update(dt) {
  pollGamepad();

  if (gameState === "paused") {
    updateFrameSmoothingMotion();
    return;
  }

  if (gameState !== "playing") {
    if (gameState === "captured") {
      updateBasementTrap(dt);
      updateFrameSmoothingMotion();
      return;
    }
    updateDeadEnemyRagdolls(dt);
    updatePlayerDeathRagdoll(dt);
    updateRagdollShield(dt);
    updateBloodSplatters(dt);
    updateParticles(dt);
    updateRain(dt);
    updateCamera(dt);
    updateFrameSmoothingMotion();
    return;
  }

  time += dt;
  performanceFrameTime = lerpValue(performanceFrameTime, dt, 0.04);
  player.weaponCooldown = Math.max(0, player.weaponCooldown - dt);
  player.emptyTimer = Math.max(0, player.emptyTimer - dt);
  clearStaleAmmoWarning();
  player.invuln = Math.max(0, player.invuln - dt);
  player.shieldPulse = Math.max(0, player.shieldPulse - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.rescueTimer = Math.max(0, (player.rescueTimer || 0) - dt);
  player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
  player.airStrafeWindow = Math.max(0, player.airStrafeWindow - dt);
  player.airStrafeTimer = Math.max(0, player.airStrafeTimer - dt);
  player.airHangTimer = Math.max(0, player.airHangTimer - dt);
  player.speedBoostTimer = Math.max(0, player.speedBoostTimer - dt);
  player.airTurnCooldown = Math.max(0, player.airTurnCooldown - dt);
  player.airTurnTimer = Math.max(0, player.airTurnTimer - dt);
  player.turnTimer = Math.max(0, player.turnTimer - dt);
  player.ledgeClimbTimer = Math.max(0, player.ledgeClimbTimer - dt);
  player.meleeCooldown = Math.max(0, player.meleeCooldown - dt);
  player.combatAssistTimer = Math.max(0, player.combatAssistTimer - dt);
  player.powerTimer = Math.max(0, player.powerTimer - dt);
  updateReload(dt);
  decayPlayerTactics(dt);
  updateAiManagement(dt);
  updateSmartInventoryManagement(dt);
  updateStyle(dt);
  multiplier = Math.max(1, multiplier - dt * 0.22);

  updateMouseWorld();
  updateAimAngle();
  updateFinale(dt);
  updateBonusClash(dt);
  updateBossMimicCinema(dt);
  if (gameState !== "playing") {
    if (gameState === "captured") {
      updateBasementTrap(dt);
      updateFrameSmoothingMotion();
      return;
    }
    updateDeadEnemyRagdolls(dt);
    updatePlayerDeathRagdoll(dt);
    updateRagdollShield(dt);
    updateBloodSplatters(dt);
    updateParticles(dt);
    updateRain(dt);
    updateCamera(dt);
    updateFrameSmoothingMotion();
    return;
  }
  if (finale.armWrestle.active) {
    updateDeadEnemyRagdolls(dt);
    updateRagdollShield(dt);
    updateBloodSplatters(dt);
    updateParticles(dt);
    updateRain(dt);
    updateCamera(dt);
    updateFrameSmoothingMotion();
    return;
  }
  if (bonusClash.active) {
    updateDeadEnemyRagdolls(dt);
    updateRagdollShield(dt);
    updateBloodSplatters(dt);
    updateParticles(dt);
    updateRain(dt);
    updateCamera(dt);
    updateFrameSmoothingMotion();
    return;
  }
  if (eliteTakedown.active) {
    updateEliteTakedown(dt);
    updateDeadEnemyRagdolls(dt);
    updateRagdollShield(dt);
    updateBloodSplatters(dt);
    updateParticles(dt);
    updateRain(dt);
    updateCamera(dt);
    updateFrameSmoothingMotion();
    return;
  }
  if (enemyTakedown.active) {
    updateEnemyTakedown(dt);
    updateDeadEnemyRagdolls(dt);
    updatePlayerDeathRagdoll(dt);
    updateRagdollShield(dt);
    updateBloodSplatters(dt);
    updateParticles(dt);
    updateRain(dt);
    updateCamera(dt);
    updateFrameSmoothingMotion();
    return;
  }
  updatePlayer(dt);
  if (gameState === "captured") {
    updateBasementTrap(dt);
    updateFrameSmoothingMotion();
    return;
  }
  updateRagdollShield(dt);
  updateCheckpoints();
  updateMelee(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateBloodSplatters(dt);
  updatePickups(dt);
  updateParticles(dt);
  updateRain(dt);
  updateSectionStreaming();
  updateCamera(dt);
  updateEnemyStreaming(dt);
  updateFrameSmoothingMotion();

  if (input.reloadQueued) {
    startReload();
    input.reloadQueued = false;
  }

  if (input.weaponCycleQueued) {
    cycleWeaponRight();
    input.weaponCycleQueued = false;
  }

  if (input.ragdollGrabQueued) {
    tryEquipRagdollShield();
    input.ragdollGrabQueued = false;
  }

  if (input.shootQueued) {
    shoot();
    input.shootQueued = false;
  }

  if (input.shotgunQueued) {
    fireShotgun();
    input.shotgunQueued = false;
  }

  if (input.combatQueued) {
    startCombatAttack();
    input.combatQueued = false;
  }

  if (player.y > WORLD.floorKillY) {
    handleFall();
  }
}

function updatePlayer(dt) {
  if (player.ledge) {
    player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
    player.ledge.holdTime = (player.ledge.holdTime || 0) + dt;
    positionPlayerAtHalfMantle();
    updateAimAngle();
    updatePlayerAnimation(dt);
    if (player.jumpBufferTimer > 0) {
      vaultLedge();
      return;
    }
    if (keys.down || (keys.left && player.ledge.side > 0) || (keys.right && player.ledge.side < 0)) {
      player.ledge = null;
      player.vy = 80;
    } else {
      player.vx = 0;
      player.vy = 0;
      player.wallSide = 0;
      player.grounded = false;
      return;
    }
  }

  const move = Math.abs(keys.moveX) > 0.01 ? keys.moveX : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const moveDir = Math.abs(move) > 0.08 ? signNonZero(move) : 0;
  updateGroundTurnIntent(moveDir, dt);
  if (moveDir !== 0) {
    player.facing = moveDir;
  }

  if (keys.down && player.grounded && player.slideState === "none" && Math.abs(player.vx) > 150) {
    startSlide(time);
  }

  if (player.slideState !== "none") {
    player.slideHold += dt;
    if (player.slideState === "tap" && player.slideHold >= MOVE.slideTap) {
      player.slideState = "full";
      player.vx += player.slideDir * 120;
    }
    if ((!keys.down || Math.abs(player.vx) < 80 || !player.grounded) && player.slideState === "full") {
      stopSlide(false);
    }
  }

  consumeJump();
  applyAirTurnBoost(move);
  applyAirCrouchBoost(dt);

  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    player.vx = player.facing * MOVE.dashSpeed;
  } else if (player.slideState !== "none") {
    const before = player.vx;
    player.vx = approach(player.vx, 0, MOVE.slideFriction * dt);
    if (Math.sign(before) !== Math.sign(player.vx) && Math.abs(player.vx) < 30) {
      player.vx = 0;
    }
  } else {
    const airStrafeCrouching = !player.grounded && keys.down && player.airStrafeTimer > 0;
    const airCrouchPrecision = airStrafeCrouching ? MOVE.airCrouchPrecision : 1;
    const assistAir = CONTROL.movementAssist && !player.grounded && player.airStrafeTimer <= 0;
    const accel = player.grounded ? MOVE.groundAccel : MOVE.airAccel * airCrouchPrecision * (assistAir ? 1.22 : 1);
    const friction = player.grounded ? MOVE.groundFriction : MOVE.airFriction * airCrouchPrecision * (assistAir && move === 0 ? 1.55 : 1);
    const airTurnMaxBoost = player.airTurnTimer > 0 ? 1 + MOVE.airTurnBoost * 0.3 : 1;
    const max = player.grounded ? MOVE.maxRun : MOVE.maxAir * (player.speedBoostTimer > 0 ? 1.65 : 1) * airTurnMaxBoost * (airStrafeCrouching ? 1.14 : 1) * (assistAir ? 1.07 : 1);
    if (move !== 0) {
      player.vx += move * accel * dt;
      player.vx = clamp(player.vx, -max, max);
    } else {
      player.vx = approach(player.vx, 0, friction * dt);
    }
  }

  const hangScale = !player.grounded && player.airHangTimer > 0 ? 0.24 : 1;
  const gravityScale = (player.vy < 0 && keys.jump ? 0.82 : player.vy < 0 ? 1.62 : 1.08) * hangScale;
  player.vy += WORLD.gravity * gravityScale * dt;
  if (player.airHangTimer > 0) {
    player.vy = Math.min(player.vy, 230);
  }
  player.vy = Math.min(player.vy, WORLD.maxFall);
  player.maxDropVy = Math.max(player.maxDropVy, player.vy);

  moveAndCollide(dt);
  findWallTouch();
  if (!player.ledge && player.ledgeClimbTimer <= 0 && !player.deathRagdoll) {
    stopPlayerVisualRagdoll();
  }

  if (player.grounded) {
    player.coyoteTimer = MOVE.coyote;
    player.canDoubleJump = true;
    player.superStrafeUsed = false;
    player.easyStrafeUsed = false;
    player.doubleJumpArmed = false;
    player.airHangTimer = 0;
    player.speedBoostTimer = 0;
    player.airCrouchBoosted = false;
    player.airTurnDir = moveDir;
    player.airTurnTimer = 0;
    player.airBodyAngle = approach(player.airBodyAngle, 0, 8 * dt);
    player.airSpin = 0;
    player.airSpinVelocity = 0;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }

  consumeJump();
  updateAirBodyPose(move, dt);
  updatePlayerAnimation(dt);
}

function applyAirTurnBoost(move) {
  const turnDir = Math.abs(move) > 0.18 ? signNonZero(move) : 0;
  if (player.grounded || player.ledge || turnDir === 0) {
    if (player.grounded) {
      player.airTurnDir = turnDir;
    }
    return;
  }
  const currentDir = Math.sign(player.vx);
  const changedStick = player.airTurnDir !== 0 && turnDir !== player.airTurnDir;
  const cuttingVelocity = Math.abs(player.vx) > 160 && currentDir !== 0 && currentDir !== turnDir;
  if ((changedStick || cuttingVelocity) && player.airTurnCooldown <= 0) {
    const burstSpeed = Math.max(Math.abs(player.vx) * MOVE.airTurnBoost, MOVE.maxAir * 0.55);
    player.vx = clamp(turnDir * burstSpeed, -MOVE.maxAir * MOVE.airTurnMax, MOVE.maxAir * MOVE.airTurnMax);
    player.vy = Math.min(player.vy, -65);
    player.facing = turnDir;
    player.airTurnCooldown = MOVE.airTurnCooldown;
    player.airTurnTimer = 0.2;
    player.airSpinVelocity += -turnDir * 6.5;
    shake = Math.max(shake, 2.2);
    notePlayerTactic("air", 1.35);
    addStyle("AIR TURN", 8, "#b8fff3");
    burstParticles(player.x + player.w * 0.5 - turnDir * 6, player.y + player.h * 0.55, "#b8fff3", 12, 250);
  }
  player.airTurnDir = turnDir;
}

function updateAirBodyPose(move, dt) {
  if (player.grounded || player.ledge) {
    player.airBodyAngle = approach(player.airBodyAngle, 0, 8 * dt);
    return;
  }
  const aimLean = clamp(Math.sin(player.aimAngle) * 0.78, -0.95, 0.95);
  const speedLean = clamp(player.vx / (MOVE.maxAir * MOVE.airTurnMax), -0.42, 0.42);
  const turnLean = player.airTurnTimer > 0 ? -signNonZero(player.vx || move || player.facing) * 0.58 : 0;
  const target = aimLean + speedLean + turnLean;
  player.airSpinVelocity = approach(player.airSpinVelocity, 0, 7 * dt);
  player.airSpin += player.airSpinVelocity * dt;
  if (Math.abs(player.airSpin) > Math.PI * 2) {
    player.airSpin -= Math.sign(player.airSpin) * Math.PI * 2;
  }
  player.airBodyAngle = lerpValue(player.airBodyAngle, clamp(target + player.airSpin, -Math.PI * 1.15, Math.PI * 1.15), clamp(dt * 9, 0, 1));
}

function makeRagdollPoint(x, y, vx = 0, vy = 0, radius = 4) {
  const step = 1 / 60;
  return {
    x,
    y,
    oldX: x - vx * step,
    oldY: y - vy * step,
    radius
  };
}

function makePlayerRagdoll(mode = "air", vx = player.vx, vy = player.vy) {
  const cx = player.x + player.w * 0.5;
  const top = player.y;
  const facing = player.facing || 1;
  const baseX = cx;
  const baseY = top + 22;
  const side = facing;

  const points = {
    head: makeRagdollPoint(baseX - side * 2, baseY - 16, vx, vy, 7.5),
    neck: makeRagdollPoint(baseX, baseY - 4, vx, vy, 3.4),
    chest: makeRagdollPoint(baseX, baseY + 8, vx, vy, 6.2),
    hip: makeRagdollPoint(baseX - side * 2, baseY + 32, vx, vy, 6),
    lShoulder: makeRagdollPoint(baseX - 8, baseY + 4, vx, vy, 4.4),
    rShoulder: makeRagdollPoint(baseX + 8, baseY + 4, vx, vy, 4.4),
    lElbow: makeRagdollPoint(baseX - 17, baseY + 19, vx, vy, 4.2),
    rElbow: makeRagdollPoint(baseX + 17, baseY + 19, vx, vy, 4.2),
    lHand: makeRagdollPoint(baseX - 22, baseY + 36, vx, vy, 4.5),
    rHand: makeRagdollPoint(baseX + 22, baseY + 36, vx, vy, 4.5),
    lHip: makeRagdollPoint(baseX - 7, baseY + 32, vx, vy, 4.8),
    rHip: makeRagdollPoint(baseX + 7, baseY + 32, vx, vy, 4.8),
    lKnee: makeRagdollPoint(baseX - 12, baseY + 51, vx, vy, 4.4),
    rKnee: makeRagdollPoint(baseX + 12, baseY + 51, vx, vy, 4.4),
    lFoot: makeRagdollPoint(baseX - 15, baseY + 70, vx, vy, 5),
    rFoot: makeRagdollPoint(baseX + 15, baseY + 70, vx, vy, 5)
  };

  const sticks = [
    ["head", "neck", 12, 0.92],
    ["neck", "chest", 13, 0.95],
    ["chest", "hip", 25, 0.95],
    ["lShoulder", "rShoulder", 17, 0.85],
    ["lHip", "rHip", 15, 0.85],
    ["lShoulder", "chest", 9, 0.8],
    ["rShoulder", "chest", 9, 0.8],
    ["lHip", "hip", 8, 0.8],
    ["rHip", "hip", 8, 0.8],
    ["lShoulder", "lElbow", 18, 1],
    ["lElbow", "lHand", 18, 1],
    ["rShoulder", "rElbow", 18, 1],
    ["rElbow", "rHand", 18, 1],
    ["lHip", "lKnee", 20, 1],
    ["lKnee", "lFoot", 20, 1],
    ["rHip", "rKnee", 20, 1],
    ["rKnee", "rFoot", 20, 1],
    ["lShoulder", "rHip", 31, 0.35],
    ["rShoulder", "lHip", 31, 0.35]
  ];

  return {
    mode,
    age: 0,
    points,
    sticks
  };
}

function enemyRagdollScale(enemy) {
  return clamp((enemy?.h || 52) / 86, 0.54, 1.2);
}

function makeEnemyRagdoll(enemy, vx = enemy.vx || 0, vy = enemy.vy || 0) {
  const scale = enemyRagdollScale(enemy);
  const cx = enemy.x + enemy.w * 0.5;
  const footY = enemy.y + enemy.h;
  const facing = enemy.facing || -1;
  const baseY = footY - 70 * scale;
  const twist = -facing * (110 + Math.random() * 130);
  const lift = -35 - Math.random() * 90;
  const sideVelocity = (side) => twist * side * 0.24;
  const point = (x, y, radius, side = 0, extraVy = 0) => makeRagdollPoint(
    x,
    y,
    vx + sideVelocity(side),
    vy + lift * (0.25 + Math.abs(side) * 0.18) + extraVy,
    radius * scale
  );

  const points = {
    head: point(cx - facing * 2 * scale, baseY - 16 * scale, 7.5, 0, -16),
    neck: point(cx, baseY - 4 * scale, 3.4),
    chest: point(cx, baseY + 8 * scale, 6.2),
    hip: point(cx - facing * 2 * scale, baseY + 32 * scale, 6),
    lShoulder: point(cx - 8 * scale, baseY + 4 * scale, 4.4, -1),
    rShoulder: point(cx + 8 * scale, baseY + 4 * scale, 4.4, 1),
    lElbow: point(cx - 17 * scale, baseY + 19 * scale, 4.2, -1.35, 18),
    rElbow: point(cx + 17 * scale, baseY + 19 * scale, 4.2, 1.35, -8),
    lHand: point(cx - 22 * scale, baseY + 36 * scale, 4.5, -1.65, 34),
    rHand: point(cx + 22 * scale, baseY + 36 * scale, 4.5, 1.65, 20),
    lHip: point(cx - 7 * scale, baseY + 32 * scale, 4.8, -0.45),
    rHip: point(cx + 7 * scale, baseY + 32 * scale, 4.8, 0.45),
    lKnee: point(cx - 12 * scale, baseY + 51 * scale, 4.4, -0.75, 24),
    rKnee: point(cx + 12 * scale, baseY + 51 * scale, 4.4, 0.75, -4),
    lFoot: point(cx - 15 * scale, baseY + 70 * scale, 5, -0.95, 42),
    rFoot: point(cx + 15 * scale, baseY + 70 * scale, 5, 0.95, 18)
  };

  const sticks = [
    ["head", "neck", 12, 0.92],
    ["neck", "chest", 13, 0.95],
    ["chest", "hip", 25, 0.95],
    ["lShoulder", "rShoulder", 17, 0.85],
    ["lHip", "rHip", 15, 0.85],
    ["lShoulder", "chest", 9, 0.8],
    ["rShoulder", "chest", 9, 0.8],
    ["lHip", "hip", 8, 0.8],
    ["rHip", "hip", 8, 0.8],
    ["lShoulder", "lElbow", 18, 1],
    ["lElbow", "lHand", 18, 1],
    ["rShoulder", "rElbow", 18, 1],
    ["rElbow", "rHand", 18, 1],
    ["lHip", "lKnee", 20, 1],
    ["lKnee", "lFoot", 20, 1],
    ["rHip", "rKnee", 20, 1],
    ["rKnee", "rFoot", 20, 1],
    ["lShoulder", "rHip", 31, 0.35],
    ["rShoulder", "lHip", 31, 0.35]
  ].map(([a, b, length, stiffness]) => [a, b, length * scale, stiffness]);

  return {
    mode: "death",
    age: 0,
    scale,
    grounded: false,
    points,
    sticks
  };
}

function startPlayerVisualRagdoll(mode, vx = player.vx, vy = player.vy) {
  player.ragdollMode = mode;
  player.ragdoll = makePlayerRagdoll(mode, vx, vy);
}

function ensurePlayerVisualRagdoll(mode) {
  if (!player.ragdoll || player.ragdollMode === "none") {
    startPlayerVisualRagdoll(mode);
    return;
  }
  player.ragdollMode = mode;
  player.ragdoll.mode = mode;
}

function stopPlayerVisualRagdoll() {
  if (player.deathRagdoll) {
    return;
  }
  player.ragdollMode = "none";
  player.ragdoll = null;
}

function updatePlayerVisualRagdoll(dt, mode) {
  ensurePlayerVisualRagdoll(mode);
  const ragdoll = player.ragdoll;
  if (!ragdoll) {
    return;
  }
  ragdoll.age += dt;
  const gravity = PLAYER_RAGDOLL.gravity;
  const damping = mode === "death" ? PLAYER_RAGDOLL.damping : 0.972;

  for (const point of Object.values(ragdoll.points)) {
    const velocityX = (point.x - point.oldX) * damping;
    const velocityY = (point.y - point.oldY) * damping;
    point.oldX = point.x;
    point.oldY = point.y;
    point.x += velocityX;
    point.y += velocityY + gravity * dt * dt;
  }

  for (let i = 0; i < PLAYER_RAGDOLL.iterations; i += 1) {
    solvePlayerRagdollSticks(ragdoll);
    collidePlayerRagdollWithWorld(ragdoll);
  }
}

function updateEnemyPhysicsRagdoll(enemy, dt) {
  const ragdoll = enemy.ragdoll;
  if (!ragdoll) {
    return false;
  }
  ragdoll.age += dt;
  ragdoll.grounded = false;
  const damping = PLAYER_RAGDOLL.damping;

  for (const point of Object.values(ragdoll.points)) {
    const velocityX = (point.x - point.oldX) * damping;
    const velocityY = (point.y - point.oldY) * damping;
    point.oldX = point.x;
    point.oldY = point.y;
    point.x += velocityX;
    point.y += velocityY + PLAYER_RAGDOLL.gravity * dt * dt;
  }

  for (let i = 0; i < PLAYER_RAGDOLL.iterations; i += 1) {
    solvePlayerRagdollSticks(ragdoll);
    ragdoll.grounded = collidePlayerRagdollWithWorld(ragdoll) || ragdoll.grounded;
  }

  const points = Object.values(ragdoll.points);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    const radius = point.radius || 3;
    minX = Math.min(minX, point.x - radius);
    minY = Math.min(minY, point.y - radius);
    maxX = Math.max(maxX, point.x + radius);
    maxY = Math.max(maxY, point.y + radius);
  }

  const chest = ragdoll.points.chest;
  const hip = ragdoll.points.hip;
  const step = Math.max(dt, 1 / 120);
  enemy.vx = ((chest.x + hip.x) * 0.5 - (chest.oldX + hip.oldX) * 0.5) / step;
  enemy.vy = ((chest.y + hip.y) * 0.5 - (chest.oldY + hip.oldY) * 0.5) / step;
  enemy.ragdollAngle = Math.atan2(hip.x - chest.x, hip.y - chest.y);
  enemy.grounded = ragdoll.grounded;
  enemy.x = minX - 4;
  enemy.y = minY - 4;
  enemy.w = Math.max(18, maxX - minX + 8);
  enemy.h = Math.max(28, maxY - minY + 8);
  return true;
}

function addRagdollPointVelocity(point, impulseX, impulseY) {
  const step = 1 / 60;
  point.oldX -= clamp(impulseX, -RAGDOLL_INTERACTION.maxImpulse, RAGDOLL_INTERACTION.maxImpulse) * step;
  point.oldY -= clamp(impulseY, -RAGDOLL_INTERACTION.maxImpulse, RAGDOLL_INTERACTION.maxImpulse) * step;
}

function expandedActorRect(actor, padding) {
  return {
    x: actor.x - padding,
    y: actor.y - padding,
    w: actor.w + padding * 2,
    h: actor.h + padding * 2
  };
}

function pushRagdollFromActor(ragdoll, actor, actorVx = 0, actorVy = 0, strength = 1) {
  if (!ragdoll?.points || !actor) {
    return false;
  }
  const actorRect = expandedActorRect(actor, RAGDOLL_INTERACTION.bodyPadding);
  const actorSpeed = Math.hypot(actorVx, actorVy);
  if (actorSpeed < 18 && actor !== player) {
    return false;
  }
  let touched = false;
  const centerX = actor.x + actor.w * 0.5;
  const centerY = actor.y + actor.h * 0.5;
  for (const point of Object.values(ragdoll.points)) {
    const closestX = clamp(point.x, actorRect.x, actorRect.x + actorRect.w);
    const closestY = clamp(point.y, actorRect.y, actorRect.y + actorRect.h);
    let dx = point.x - closestX;
    let dy = point.y - closestY;
    let distance = Math.hypot(dx, dy);
    const radius = (point.radius || 4) + 10;
    if (distance > radius) {
      continue;
    }
    if (distance < 0.001) {
      dx = point.x - centerX || (actorVx !== 0 ? Math.sign(actorVx) : 1);
      dy = point.y - centerY || -0.35;
      distance = Math.hypot(dx, dy) || 1;
    }
    const nx = dx / distance;
    const ny = dy / distance;
    const overlap = (radius - distance) * RAGDOLL_INTERACTION.bodyPush * strength;
    point.x += nx * overlap;
    point.y += ny * overlap;
    const impulse = (70 + actorSpeed * RAGDOLL_INTERACTION.bodyImpulse) * strength;
    addRagdollPointVelocity(point, nx * impulse + actorVx * 0.08, ny * impulse + actorVy * 0.08);
    touched = true;
  }
  return touched;
}

function applyActorImpulsesToEnemyRagdoll(enemy) {
  if (!enemy.ragdoll || !enemyVisibleInCamera(enemy, 260)) {
    return;
  }
  if (!player.deathRagdoll) {
    pushRagdollFromActor(enemy.ragdoll, player, player.vx, player.vy, 1);
  }
  for (const actor of enemies) {
    if (actor === enemy || actor.dead || actor.finalePursuer) {
      continue;
    }
    if (Math.abs((actor.x + actor.w * 0.5) - (enemy.x + enemy.w * 0.5)) > 160 || Math.abs((actor.y + actor.h * 0.5) - (enemy.y + enemy.h * 0.5)) > 170) {
      continue;
    }
    pushRagdollFromActor(enemy.ragdoll, actor, actor.vx || 0, actor.vy || 0, actor.type === "elite" || actor.type === "boss" ? 1.15 : 0.82);
  }
}

function applyActorImpulsesToPlayerRagdoll() {
  if (!player.deathRagdoll || !player.ragdoll) {
    return;
  }
  for (const actor of enemies) {
    if (actor.dead) {
      continue;
    }
    if (Math.abs((actor.x + actor.w * 0.5) - (player.x + player.w * 0.5)) > 170 || Math.abs((actor.y + actor.h * 0.5) - (player.y + player.h * 0.5)) > 180) {
      continue;
    }
    pushRagdollFromActor(player.ragdoll, actor, actor.vx || 0, actor.vy || 0, 1);
  }
}

function applyBulletImpulseToRagdoll(ragdoll, bullet) {
  if (!ragdoll?.points) {
    return false;
  }
  const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
  const dirX = bullet.vx / speed;
  const dirY = bullet.vy / speed;
  let touched = false;
  for (const point of Object.values(ragdoll.points)) {
    const dx = point.x - bullet.x;
    const dy = point.y - bullet.y;
    const distance = Math.hypot(dx, dy);
    const radius = RAGDOLL_INTERACTION.bulletRadius + (point.radius || 4);
    if (distance > radius) {
      continue;
    }
    const amount = 1 - distance / radius;
    point.x += dirX * amount * 4;
    point.y += dirY * amount * 4;
    addRagdollPointVelocity(point, bullet.vx * RAGDOLL_INTERACTION.bulletImpulse * amount, bullet.vy * RAGDOLL_INTERACTION.bulletImpulse * amount);
    touched = true;
  }
  return touched;
}

function hitAnyRagdollWithBullet(bullet, source = "player") {
  const bulletRect = { x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 };
  for (const enemy of enemies) {
    if (!enemy.dead || isCarriedRagdoll(enemy) || !enemy.deathRagdoll || !enemy.ragdoll || !enemyVisibleInCamera(enemy, 180) || !rectsOverlap(bulletRect, expandedActorRect(enemy, 12))) {
      continue;
    }
    if (!applyBulletImpulseToRagdoll(enemy.ragdoll, bullet)) {
      continue;
    }
    addBloodSplatters(bullet.x, bullet.y, signNonZero(bullet.vx || player.facing), 1, enemy, "ragdoll");
    burstParticles(bullet.x, bullet.y, bullet.color, 5, 130);
    return true;
  }
  if (player.deathRagdoll && player.ragdoll && rectsOverlap(bulletRect, expandedActorRect(player, 18)) && applyBulletImpulseToRagdoll(player.ragdoll, bullet)) {
    addPlayerBloodSplatters(1, signNonZero(bullet.vx || -player.facing), "shot");
    burstParticles(bullet.x, bullet.y, bullet.color, 5, 130);
    return true;
  }
  return false;
}

function solvePlayerRagdollSticks(ragdoll) {
  for (const [aKey, bKey, length, stiffness] of ragdoll.sticks) {
    const a = ragdoll.points[aKey];
    const b = ragdoll.points[bKey];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.max(0.001, Math.hypot(dx, dy));
    const diff = (distance - length) / distance * stiffness;
    a.x += dx * diff * 0.5;
    a.y += dy * diff * 0.5;
    b.x -= dx * diff * 0.5;
    b.y -= dy * diff * 0.5;
  }
}

function collidePlayerRagdollWithWorld(ragdoll) {
  let touched = false;
  for (const point of Object.values(ragdoll.points)) {
    for (const platform of platforms) {
      if (point.x < platform.x - 2 || point.x > platform.x + platform.w + 2) {
        continue;
      }
      const surfaceY = platformSurfaceY(platform, point.x);
      const radius = point.radius || 3;
      if (point.y + radius > surfaceY - 1 && point.oldY + radius <= surfaceY + 34) {
        const vx = point.x - point.oldX;
        const vy = point.y - point.oldY;
        point.y = surfaceY - radius;
        point.oldX = point.x - vx * PLAYER_RAGDOLL.floorFriction;
        point.oldY = point.y + Math.abs(vy) * PLAYER_RAGDOLL.floorBounce;
        touched = true;
      }
    }
  }
  return touched;
}

function applyAirCrouchBoost(dt) {
  const strafing = player.airStrafeTimer > 0;
  if (player.grounded || !keys.down || !strafing) {
    return;
  }
  const dir = signNonZero(player.vx || player.facing);
  const max = MOVE.maxAir * 2.65;
  if (!player.airCrouchBoosted) {
    player.vx = clamp(player.vx * 1.22 + dir * 110, -max, max);
    player.vy = Math.min(player.vy, -42);
    player.airHangTimer = Math.min(MOVE.easyStrafeHang, player.airHangTimer + 0.55);
    player.airCrouchBoosted = true;
    notePlayerTactic("slide", 1.1);
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.72, "#ffd166", 12, 260);
  } else {
    player.vx = clamp(player.vx + dir * MOVE.airCrouchAccel * dt, -max, max);
    player.airBodyAngle = approach(player.airBodyAngle, 0, 3.5 * dt);
  }
}

function approach(value, target, amount) {
  if (value < target) {
    return Math.min(value + amount, target);
  }
  if (value > target) {
    return Math.max(value - amount, target);
  }
  return target;
}

function updatePlayerAnimation(dt) {
  if (player.ledgeClimbTimer > 0) {
    const frameCount = poseFrameCount("player:ledgeClimb", PLAYER_LEDGE_CLIMB_FRAMES);
    player.animFrame = Math.min(frameCount - 1, player.animFrame + dt * 60 * (frameCount / PLAYER_LEDGE_CLIMB_FRAMES.length));
    return;
  }
  if (player.ledge) {
    const frameCount = poseFrameCount("player:halfMantle", PLAYER_HALF_MANTLE_FRAMES);
    player.animFrame = Math.min(frameCount - 1, player.animFrame + dt * 60 * (frameCount / PLAYER_HALF_MANTLE_FRAMES.length));
    return;
  }
  if (player.turnTimer > 0) {
    const frameCount = poseFrameCount("player:turn", PLAYER_TURN_FRAMES);
    player.animFrame = Math.min(frameCount - 1, player.animFrame + dt * 60 * (frameCount / PLAYER_TURN_FRAMES.length));
    return;
  }
  if (player.meleeType) {
    player.animFrame += dt * 22;
    return;
  }
  if (player.grounded && player.slideState === "none" && Math.abs(player.vx) > 30) {
    const frameCount = poseFrameCount("player:run", PLAYER_RUN_FRAMES);
    player.animFrame += dt * (7 + Math.abs(player.vx) / 70) * RUN_FRAME_RATE_SCALE * (frameCount / PLAYER_RUN_FRAMES.length);
  } else if (!player.grounded) {
    player.animFrame += dt * 5;
  } else {
    player.animFrame += dt * 1.8;
  }
}

function moveAndCollide(dt) {
  player.wasGrounded = player.grounded;
  player.grounded = false;
  player.wallSide = 0;

  const prevX = player.x;
  const prevY = player.y;

  player.x += player.vx * dt;
  for (const platform of platforms) {
    if (isSlopePlatform(platform)) {
      continue;
    }
    if (!rectsOverlap(player, platform)) {
      continue;
    }

    const side = player.vx > 0 ? 1 : -1;
    if (tryGrabLedge(platform, side, prevX, prevY)) {
      return;
    }

    if (player.vx > 0) {
      player.x = platform.x - player.w;
      player.wallSide = 1;
    } else if (player.vx < 0) {
      player.x = platform.x + platform.w;
      player.wallSide = -1;
    }
    player.vx = 0;
    player.dashTimer = 0;
  }

  player.y += player.vy * dt;
  for (const platform of platforms) {
    if (isSlopePlatform(platform)) {
      collidePlayerWithSlope(platform, prevY);
      continue;
    }
    if (!rectsOverlap(player, platform)) {
      continue;
    }

    if (player.vy > 0 && prevY + player.h <= platform.y + 12) {
      landPlayerOnSurface(platform.y);
    } else if (player.vy < 0 && prevY >= platform.y + platform.h - 8) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }
}

function landPlayerOnSurface(surfaceY) {
  player.y = surfaceY - player.h;
  player.vy = 0;
  player.grounded = true;
  if (!player.wasGrounded && player.maxDropVy > 500) {
    playSfx("land");
  }
  if (!player.wasGrounded && player.maxDropVy > 820) {
    shake = Math.max(shake, clamp(player.maxDropVy / 180, 5, 13));
    burstParticles(player.x + player.w * 0.5, player.y + player.h, "#cbd4dd", 18, 280);
  }
  player.maxDropVy = 0;
}

function collidePlayerWithSlope(platform, prevY) {
  const withinX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
  if (!withinX) {
    return;
  }
  const footX = clamp(player.x + player.w * 0.5, platform.x, platform.x + platform.w);
  const surfaceY = platformSurfaceY(platform, footX);
  const prevBottom = prevY + player.h;
  const bottom = player.y + player.h;
  const thickness = platform.slopeThickness || 90;
  if (bottom >= surfaceY && bottom <= surfaceY + thickness + 30 && (player.vy >= 0 || prevBottom <= surfaceY + 18)) {
    landPlayerOnSurface(surfaceY);
  }
}

function tryGrabLedge(platform, side, prevX, prevY) {
  if (isSlopePlatform(platform) || platform.kind === "caveWall") {
    return false;
  }
  if (player.grounded || player.slideState !== "none" || player.vy > 80 || player.ledge) {
    return false;
  }

  const playerBottom = prevY + player.h;
  const nearTop = playerBottom > platform.y - 32 && playerBottom < platform.y + 34;
  const wasBeside = side > 0 ? prevX + player.w <= platform.x + 8 : prevX >= platform.x + platform.w - 8;
  if (!nearTop || !wasBeside) {
    return false;
  }

  player.ledge = { platform, side, mode: "halfMantle", holdTime: 0 };
  player.vx = 0;
  player.vy = 0;
  player.facing = side;
  positionPlayerAtHalfMantle();
  player.jumpBufferTimer = 0;
  player.airBodyAngle = 0;
  player.animFrame = 0;
  player.poseBlend = 0;
  player.ragdoll = null;
  player.ragdollMode = "none";
  playSfx("ledgeGrab");
  burstParticles(player.x + player.w * 0.5, player.y + 12, "#4df7ff", 6, 130);
  return true;
}

function findWallTouch() {
  if (player.grounded || player.ledge) {
    return;
  }
  for (const platform of platforms) {
    if (isSlopePlatform(platform)) {
      continue;
    }
    const verticalOverlap = player.y + player.h > platform.y + 6 && player.y < platform.y + platform.h - 6;
    if (!verticalOverlap) {
      continue;
    }
    if (Math.abs(player.x + player.w - platform.x) < 4) {
      player.wallSide = 1;
      return;
    }
    if (Math.abs(player.x - (platform.x + platform.w)) < 4) {
      player.wallSide = -1;
      return;
    }
  }
}

function startMelee(type) {
  if (gameState !== "playing" || player.meleeCooldown > 0 || player.reloadTimer > 0 || player.ledge) {
    return;
  }
  updateAimAngle();
  const aim = getAimVector(false);
  const assistedDir = findMeleeTargetDir(type);
  player.meleeType = type;
  player.meleeDir = assistedDir || (aim.x >= 0 ? 1 : -1);
  player.facing = player.meleeDir;
  player.meleeHit = false;
  player.meleeFrame = 0;
  player.meleeTimer = getMeleeDuration(type);
  const assistedCombat = player.combatAssistTimer > 0;
  const unarmedAssist = playerOutOfAllAmmo();
  const meleeAssist = assistedCombat || unarmedAssist;
  const baseCooldown = type === "kick" ? MELEE.kickCooldown : type === "elbow" ? MELEE.elbowCooldown : MELEE.punchCooldown;
  player.meleeCooldown = baseCooldown * (meleeAssist ? UNARMED.cooldownScale : 1);
  player.vx += player.meleeDir * ((type === "kick" ? 125 : type === "elbow" ? 92 : 75) + (meleeAssist ? UNARMED.lunge : 0));
  notePlayerTactic("melee", type === "kick" ? 1.4 : type === "elbow" ? 1.25 : 1);
  playSfx(type);
}

function chooseCombatMove() {
  const nearest = nearestLiveEnemyDistance();
  if (!player.grounded || player.airStrafeTimer > 0 || Math.abs(player.vx) > MOVE.maxRun * 0.8) {
    return Math.random() < 0.54 ? "kick" : Math.random() < 0.5 ? "elbow" : "punch";
  }
  if (nearest < 105) {
    return Math.random() < 0.5 ? "elbow" : Math.random() < 0.55 ? "punch" : "kick";
  }
  return Math.random() < 0.42 ? "punch" : Math.random() < 0.66 ? "elbow" : "kick";
}

function startCombatAttack() {
  if (gameState !== "playing" || player.meleeCooldown > 0 || player.reloadTimer > 0 || player.ledge) {
    return false;
  }
  player.combatAssistTimer = 0.42;
  startMelee(chooseCombatMove());
  return true;
}

function chooseUnarmedMove() {
  const nearest = nearestLiveEnemyDistance();
  if (nearest < 135) {
    return Math.random() < 0.62 ? "kick" : "punch";
  }
  if (!player.grounded || Math.abs(player.vx) > MOVE.maxRun * 0.72) {
    return Math.random() < 0.55 ? "kick" : "punch";
  }
  return Math.random() < 0.58 ? "punch" : "kick";
}

function startUnarmedAttack() {
  if (gameState !== "playing" || player.meleeCooldown > 0 || player.reloadTimer > 0 || player.ledge) {
    return false;
  }
  setPlayerAmmoWarning("OUT OF AMMO", 0.35);
  addStyle("NO AMMO SAVE", 10, "#ffd166");
  startMelee(chooseUnarmedMove());
  return true;
}

function getMeleeDuration(type) {
  return type === "kick" ? MELEE.kickDuration : type === "elbow" ? MELEE.elbowDuration : MELEE.punchDuration;
}

function getMeleeFrames(type) {
  return type === "kick" ? PLAYER_KICK_FRAMES : PLAYER_PUNCH_FRAMES;
}

function meleeHitReady() {
  return player.meleeFrame >= MELEE.hitFrame;
}

function findMeleeTargetDir(type) {
  const unarmedAssist = playerOutOfAllAmmo();
  const combatAssist = player.combatAssistTimer > 0;
  const assistScale = unarmedAssist || combatAssist ? UNARMED.assistReach * (combatAssist ? 1.18 : 1) : 1;
  const reach = (type === "kick" ? 150 : type === "elbow" ? 112 : 118) * (playerPowered() ? POWERUP.meleeScale : 1) * assistScale;
  const playerCenterX = player.x + player.w * 0.5;
  const playerCenterY = player.y + player.h * 0.5;
  let best = null;
  let bestScore = Infinity;
  for (const enemy of enemies) {
    if (enemy.dead) {
      continue;
    }
    const enemyCenterX = enemy.x + enemy.w * 0.5;
    const enemyCenterY = enemy.y + enemy.h * 0.5;
    const dx = enemyCenterX - playerCenterX;
    const dy = enemyCenterY - playerCenterY;
    const dist = Math.hypot(dx, dy);
    if (dist > reach || Math.abs(dy) > 78) {
      continue;
    }
    const facingBonus = Math.sign(dx || player.facing) === player.facing ? 0.72 : 1;
    const score = dist * facingBonus;
    if (score < bestScore) {
      bestScore = score;
      best = dx >= 0 ? 1 : -1;
    }
  }
  return best;
}

function updateMelee(dt) {
  if (!player.meleeType) {
    return;
  }

  const duration = getMeleeDuration(player.meleeType);
  const frames = getMeleeFrames(player.meleeType);
  const elapsed = duration - player.meleeTimer;
  const progress = clamp(elapsed / duration, 0, 1);
  player.meleeFrame = Math.min(frames.length - 1, Math.floor(progress * frames.length));
  if (meleeHitReady() && !player.meleeHit) {
    applyMeleeHit();
    player.meleeHit = true;
  }

  player.meleeTimer -= dt;
  if (player.meleeTimer <= 0) {
    player.meleeTimer = 0;
    player.meleeType = null;
    player.meleeHit = false;
    player.meleeFrame = 0;
  }
}

function applyMeleeHit() {
  const powerReach = playerPowered() ? POWERUP.meleeScale : 1;
  const unarmedAssist = playerOutOfAllAmmo();
  const combatAssist = player.combatAssistTimer > 0;
  const meleeAssist = unarmedAssist || combatAssist;
  const assistScale = meleeAssist ? UNARMED.assistReach * (combatAssist ? 1.12 : 1) : 1;
  const range = (player.meleeType === "kick" ? 128 : player.meleeType === "elbow" ? 92 : 98) * powerReach * assistScale;
  const height = (player.meleeType === "kick" ? 92 : player.meleeType === "elbow" ? 84 : 78) * powerReach * (meleeAssist ? 1.12 : 1);
  const hitbox = {
    x: player.meleeDir > 0 ? player.x + player.w - 10 : player.x - range + 10,
    y: player.y - 18,
    w: range,
    h: height
  };

  let hitAnything = false;
  if (hitPowerCubes(hitbox, player.x + player.w * 0.5 + player.meleeDir * range, player.y + player.h * 0.45)) {
    hitAnything = true;
  }
  for (const enemy of enemies) {
    if (enemy.dead || !rectsOverlap(hitbox, enemy)) {
      continue;
    }

    hitAnything = true;
    enemy.hurtFlash = 0.12;
    enemy.alert = 1;
    enemy.memoryTimer = AI.memoryTime;
    enemy.tacticMemory.melee = Math.min(12, enemy.tacticMemory.melee + 2.4);
    setEnemyState(enemy, "combat", 0.2);
    const cx = enemy.x + enemy.w * 0.5;
    const cy = enemy.y + enemy.h * 0.45;
    addBloodSplatters(cx, cy, player.meleeDir, player.meleeType === "kick" ? 38 : player.meleeType === "elbow" ? 30 : 24, enemy, "melee");
    const staggered = enemyIsStaggered(enemy);
    const heavyEnemy = enemy.type === "finalBoss" || enemy.type === "boss" || enemy.bonusBoss;
    if (player.meleeType === "kick") {
      enemy.vx = player.meleeDir * (meleeAssist ? 340 : 260);
      enemy.vy = meleeAssist ? -320 : -260;
      enemy.grounded = false;
      if (heavyEnemy) {
        enemy.hp -= 4;
        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }
      } else if (staggered) {
        addStyle("KICK FINISHER", 14, "#ffd166");
        killEnemy(enemy);
      } else {
        enemy.punchHits += 1.4;
        enemy.hp = Math.max(1, enemy.hp - (meleeAssist ? 3 : 2));
        staggerEnemy(enemy, 0.82, "KICK STAGGER");
      }
      shake = Math.max(shake, 10);
      burstParticles(cx, cy, "#ffd166", 30, 430);
    } else if (player.meleeType === "elbow") {
      enemy.punchHits += 1.65;
      enemy.hp = Math.max(1, enemy.hp - (meleeAssist ? 3 : 2));
      enemy.x += player.meleeDir * 24;
      enemy.vx = player.meleeDir * (meleeAssist ? 290 : 210);
      enemy.vy = meleeAssist ? -180 : -110;
      enemy.grounded = false;
      enemy.fireTimer += 0.12;
      enemy.shootDelay = Math.max(enemy.shootDelay || 0, 0.18);
      shake = Math.max(shake, 6);
      burstParticles(cx, cy, "#b8fff3", 22, 330);
      if (!heavyEnemy && staggered && (enemy.punchHits >= (meleeAssist ? 2.4 : 3) || enemy.hp <= 1)) {
        addStyle("ELBOW FINISHER", 14, "#b8fff3");
        killEnemy(enemy);
      } else if (enemy.punchHits >= (meleeAssist ? 2.4 : 3) || enemy.hp <= 1) {
        staggerEnemy(enemy, 0.9, "STAGGERED");
      }
    } else {
      enemy.punchHits += 1;
      enemy.hp = Math.max(1, enemy.hp - (meleeAssist ? 2 : 1));
      enemy.x += player.meleeDir * 18;
      enemy.vx = player.meleeDir * (meleeAssist ? 230 : 170);
      enemy.vy = meleeAssist ? -135 : -95;
      enemy.grounded = false;
      shake = Math.max(shake, 4);
      burstParticles(cx, cy, "#4df7ff", 18, 290);
      if (!heavyEnemy && staggered && enemy.punchHits >= (meleeAssist ? 2 : 3)) {
        addStyle("PUNCH FINISHER", 12, "#4df7ff");
        killEnemy(enemy);
      } else if (enemy.punchHits >= (meleeAssist ? 2 : 3)) {
        staggerEnemy(enemy, 0.8, "STAGGERED");
      }
    }
  }

  if (hitAnything) {
    playSfx("hit");
    player.vx += -player.meleeDir * (player.meleeType === "kick" ? 90 : player.meleeType === "elbow" ? 55 : 35);
  } else {
    burstParticles(
      player.x + player.w * 0.5 + player.meleeDir * range,
      player.y + player.h * 0.45,
      player.meleeType === "kick" ? "#ffd166" : player.meleeType === "elbow" ? "#b8fff3" : "#4df7ff",
      player.meleeType === "kick" ? 6 : player.meleeType === "elbow" ? 5 : 4,
      120
    );
  }
}

function setEnemyState(enemy, state, timer = 0) {
  if (enemy.aiState !== state) {
    enemy.aiState = state;
    enemy.stateTimer = timer;
    if (state === "alert" || state === "combat") {
      enemy.shootDelay = Math.max(enemy.shootDelay || 0, AI.shootDelay);
      enemy.fireTimer = Math.min(enemy.fireTimer || AI.shootDelay, AI.shootDelay);
    }
  } else {
    enemy.stateTimer = Math.max(enemy.stateTimer, timer);
  }
}

function lineBlockedByPlatform(x1, y1, x2, y2, enemy) {
  for (const platform of platforms) {
    if (platform === enemy.platform && Math.min(y1, y2) < platform.y) {
      continue;
    }
    for (let step = 1; step <= 7; step += 1) {
      const t = step / 8;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (px > platform.x + 4 && px < platform.x + platform.w - 4 && py > platform.y + 4 && py < platform.y + platform.h - 4) {
        return true;
      }
    }
  }
  return false;
}

function enemyCanSeePlayer(enemy, distance, distanceY, enemyCenterX, enemyCenterY, playerCenterX, playerCenterY) {
  const range = enemy.type === "finalBoss" ? 1300 : enemy.type === "boss" ? 1120 : enemy.type === "elite" ? 980 : 880;
  if (distance > range || Math.abs(distanceY) > 280) {
    return false;
  }
  return !lineBlockedByPlatform(enemyCenterX, enemyCenterY, playerCenterX, playerCenterY, enemy);
}

function updateEnemyState(enemy, seesPlayer, incomingBullet, distance, distanceY, playerCenterX, playerCenterY, dt) {
  enemy.stateTimer = Math.max(0, enemy.stateTimer - dt);
  enemy.memoryTimer = Math.max(0, enemy.memoryTimer - dt);
  enemy.searchTimer = Math.max(0, enemy.searchTimer - dt);
  decayEnemyMemory(enemy, dt);
  enemy.masterPlan = enemyMasterPlan(enemy, seesPlayer, incomingBullet, distance, distanceY);
  const copiedTactic = dominantTacticForEnemy(enemy);
  if ((enemy.type === "finalBoss" || enemy.type === "boss" || enemy.bonusBoss) && copiedTactic) {
    enemy.bossMimic = copiedTactic;
    if (distance < 900 && time > (enemy.bossMimicAnnounceAt || 0)) {
      enemy.bossMimicAnnounceAt = time + 3.2;
      triggerBossMimicCinematic(enemy, copiedTactic);
    }
  }

  if (incomingBullet) {
    enemy.alert = 1;
    enemy.tacticMemory.gun = Math.min(12, enemy.tacticMemory.gun + 1.2);
    setEnemyState(enemy, enemy.type === "turret" ? "alert" : "combat", 0.25);
  }

  if (seesPlayer) {
    enemy.alert = 1;
    enemy.lastSeenX = playerCenterX;
    enemy.lastSeenY = playerCenterY;
    enemy.memoryTimer = AI.memoryTime + (enemy.type === "elite" || enemy.bonusBoss ? 0.7 : 0);
    rememberPlayerTactic(enemy, enemy.type === "elite" || enemy.type === "finalBoss" || enemy.bonusBoss ? 0.72 : 0.45);
    if (enemy.aiState === "patrol" || enemy.aiState === "search") {
      setEnemyState(enemy, "alert", AI.alertTime);
    } else if (enemy.aiState === "alert" && enemy.stateTimer <= 0) {
      setEnemyState(enemy, "combat");
    }
  } else if (enemy.aiState === "combat" && enemy.memoryTimer <= 0) {
    setEnemyState(enemy, "search", AI.searchTime);
    enemy.searchTimer = AI.searchTime;
  } else if (enemy.aiState === "alert" && enemy.stateTimer <= 0) {
    setEnemyState(enemy, "search", AI.searchTime);
    enemy.searchTimer = AI.searchTime;
  } else if (enemy.aiState === "search" && enemy.searchTimer <= 0) {
    setEnemyState(enemy, "patrol");
  }

  if ((enemy.type === "finalBoss" || enemy.type === "boss" || enemy.bonusBoss) && distance < 1180 && Math.abs(distanceY) < 310) {
    setEnemyState(enemy, seesPlayer || enemy.memoryTimer > 0 ? "combat" : "alert", seesPlayer ? 0 : 0.2);
  }
}

function moveMobileEnemy(enemy, dt, distance, distanceX) {
  const speedBoost = enemy.type === "elite" ? 1.38 : 1;
  const tactic = dominantTacticForEnemy(enemy);
  const plan = enemy.masterPlan || enemyMasterPlan(enemy, true, null, distance, 0);
  if (!enemy.grounded) {
    const desiredAirVx = enemy.facing * (enemy.type === "elite" ? 440 : 370);
    enemy.vx = approach(enemy.vx, desiredAirVx, 520 * dt);
    enemy.x += enemy.vx * dt;
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    return;
  }
  if (enemy.type === "elite"
    && enemy.airStrafeCooldown <= 0
    && (enemy.aiState === "combat" || enemy.aiState === "alert")
    && distance < 560
    && Math.random() < 0.035) {
    enemy.grounded = false;
    enemy.airStrafeTimer = 0.58;
    enemy.airStrafeCooldown = 1.15 + Math.random() * 0.65;
    enemy.vy = ELITE_TRAITS.airStrafeVy;
    enemy.vx = (distanceX >= 0 ? 1 : -1) * ELITE_TRAITS.airStrafeVx + enemy.combatDir * 135;
    enemy.crouchTimer = 0.16;
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, "#ff7a30", 18, 320);
    return;
  }
  if (enemy.decisionTimer <= 0) {
    enemy.combatDir = Math.random() < 0.5 ? -1 : 1;
    enemy.decisionTimer = enemy.type === "elite" ? 0.22 + Math.random() * 0.26 : 0.34 + Math.random() * 0.42;
  }

  let desiredVx = enemy.vx;
  if (enemy.aiState === "patrol") {
    desiredVx = enemy.patrolDir * 58 * speedBoost;
  } else if (enemy.aiState === "alert") {
    desiredVx = -enemy.facing * (tactic === "melee" ? 70 : 24) * speedBoost;
  } else if (enemy.aiState === "search") {
    const searchDir = Math.abs(enemy.lastSeenX - (enemy.x + enemy.w * 0.5)) > 35 ? signNonZero(enemy.lastSeenX - (enemy.x + enemy.w * 0.5)) : enemy.combatDir;
    desiredVx = searchDir * 72 * speedBoost;
  } else if (enemy.aiState === "combat") {
    if (enemy.squadRole === "guard") {
      desiredVx = Math.abs(distance - plan.desiredRange) > 90 ? enemy.facing * 42 * speedBoost : enemy.combatDir * 28 * speedBoost;
      enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.04);
    } else if (enemy.squadRole === "rusher" && distance > AI.meleeRange * 0.7) {
      desiredVx = enemy.facing * 178 * speedBoost;
      enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.06);
    } else if (enemy.squadRole === "suppressor" && distance < plan.desiredRange - 60) {
      desiredVx = -enemy.facing * 118 * speedBoost + enemy.combatDir * 42 * speedBoost;
    } else if (enemy.type === "soldier" && distance < 430 && distance > AI.meleeRange * 0.78) {
      desiredVx = enemy.facing * 156 * speedBoost;
      enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.05);
    } else if (plan.approach === "beginner-hold") {
      desiredVx = distance < plan.desiredRange ? -enemy.facing * 80 * speedBoost : enemy.combatDir * 54 * speedBoost;
    } else if (plan.approach === "pressure" || tactic === "reload") {
      desiredVx = enemy.facing * 132 * speedBoost;
    } else if (plan.approach === "kite" || tactic === "melee" || distance < 155) {
      desiredVx = -enemy.facing * 136 * speedBoost;
    } else if (plan.approach === "anti-air" || tactic === "air") {
      desiredVx = enemy.combatDir * 126 * speedBoost;
      enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.08);
    } else if (plan.approach === "cross-strafe" || tactic === "slide") {
      desiredVx = (-enemy.facing * 70 + enemy.combatDir * 58) * speedBoost;
      enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.1);
    } else if (plan.approach === "strafe" || plan.approach === "spread" || tactic === "gun") {
      desiredVx = enemy.combatDir * 116 * speedBoost;
      if (distance < plan.desiredRange - 35) {
        desiredVx += -enemy.facing * 64 * speedBoost;
      } else if (distance > plan.desiredRange + 70) {
        desiredVx += enemy.facing * 70 * speedBoost;
      }
    } else if (distance > Math.max(520, plan.desiredRange + 110)) {
      desiredVx = enemy.facing * 92 * speedBoost;
    } else {
      desiredVx = -enemy.facing * 54 * speedBoost + enemy.combatDir * 54 * speedBoost;
    }
  }

  desiredVx += enemySeparationBias(enemy) * 190 * speedBoost;
  enemy.vx = approach(enemy.vx, desiredVx, (enemy.type === "elite" ? 900 : 680) * dt);
  enemy.x += enemy.vx * dt;
  if (enemy.x < enemy.left || enemy.x > enemy.right) {
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    enemy.patrolDir *= -1;
    enemy.combatDir *= -1;
    enemy.vx *= -0.35;
  }

  if (Math.abs(distanceX) < 16 && enemy.aiState === "search") {
    enemy.combatDir *= -1;
  }
}

function updateEnemyVertical(enemy, dt) {
  enemy.airStrafeCooldown = Math.max(0, (enemy.airStrafeCooldown || 0) - dt);
  enemy.airStrafeTimer = Math.max(0, (enemy.airStrafeTimer || 0) - dt);
  const surfaceY = platformSurfaceY(enemy.platform, enemy.x + enemy.w * 0.5);
  if (enemy.grounded) {
    enemy.y = surfaceY - enemy.h;
    enemy.vy = 0;
    return;
  }
  enemy.vy += WORLD.gravity * 0.86 * dt;
  enemy.vy = Math.min(enemy.vy, WORLD.maxFall);
  enemy.y += enemy.vy * dt;
  if (enemy.y + enemy.h >= surfaceY) {
    enemy.y = surfaceY - enemy.h;
    enemy.vy = 0;
    enemy.grounded = true;
    enemy.airStrafeTimer = 0;
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, "#ff7a30", 8, 180);
  }
}

function startEnemyDeathRagdoll(enemy) {
  const dir = signNonZero(player.vx || player.facing || enemy.facing || 1);
  const launchVx = dir * (170 + Math.random() * 150) + (Math.random() - 0.5) * 90;
  const launchVy = -(250 + Math.random() * 210);
  enemy.deathRagdoll = true;
  enemy.deathAge = 0;
  enemy.deathBleedTimer = 0.05;
  enemy.ragdollShieldEligible = enemy.type !== "dummy" && Math.random() < RAGDOLL_SHIELD.eligibleChance;
  enemy.ragdollShieldHeld = false;
  enemy.ragdollShieldSpent = false;
  enemy.finaleRagdoll = true;
  enemy.airStrafeTimer = 0.55;
  enemy.grounded = false;
  enemy.pendingShot = false;
  enemy.burstShots = 0;
  enemy.meleeType = null;
  enemy.meleeTimer = 0;
  enemy.vx = launchVx;
  enemy.vy = launchVy;
  enemy.ragdollAngle = (Math.random() - 0.5) * 0.9;
  enemy.ragdollSpin = -dir * (3.4 + Math.random() * 4.2);
  enemy.ragdollPhase = Math.random() * Math.PI * 2;
  enemy.ragdollLimbSwing = 1.1 + Math.random() * 0.7;
  enemy.ragdoll = makeEnemyRagdoll(enemy, launchVx, launchVy);
}

function isCarriedRagdoll(enemy) {
  return !!player.ragdollShield && player.ragdollShield.enemy === enemy;
}

function ragdollShieldHitbox() {
  if (!player.ragdollShield) {
    return null;
  }
  const facing = player.facing || 1;
  return {
    x: facing > 0 ? player.x + player.w - 2 : player.x - RAGDOLL_SHIELD.width + 2,
    y: player.y + player.h * 0.5 - RAGDOLL_SHIELD.height * 0.5,
    w: RAGDOLL_SHIELD.width,
    h: RAGDOLL_SHIELD.height
  };
}

function moveEnemyRagdollBy(enemy, dx, dy) {
  if (!enemy.ragdoll?.points) {
    return;
  }
  for (const point of Object.values(enemy.ragdoll.points)) {
    point.x += dx;
    point.y += dy;
    point.oldX += dx;
    point.oldY += dy;
  }
}

function positionCarriedRagdollShield() {
  const shield = player.ragdollShield;
  const enemy = shield?.enemy;
  const box = ragdollShieldHitbox();
  if (!shield || !enemy || !enemy.dead || !enemy.deathRagdoll || !box) {
    releaseRagdollShield(false);
    return;
  }
  const targetX = box.x + box.w * 0.5 - enemy.w * 0.5;
  const targetY = box.y + box.h * 0.5 - enemy.h * 0.5;
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  enemy.x = targetX;
  enemy.y = targetY;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.grounded = false;
  enemy.facing = -signNonZero(player.facing || 1);
  enemy.ragdollAngle = signNonZero(player.facing || 1) * (0.9 + Math.sin(time * 5.5) * 0.08);
  enemy.ragdollSpin = 0;
  enemy.hurtFlash = Math.max(enemy.hurtFlash || 0, player.ragdollShieldFlash * 0.5);
  moveEnemyRagdollBy(enemy, dx, dy);
}

function findRagdollShieldCandidate() {
  const playerCenterX = player.x + player.w * 0.5;
  const playerCenterY = player.y + player.h * 0.5;
  let best = null;
  let bestDistance = Infinity;
  for (const enemy of enemies) {
    if (!enemy.dead || !enemy.deathRagdoll || !enemy.ragdollShieldEligible || enemy.ragdollShieldHeld || enemy.ragdollShieldSpent) {
      continue;
    }
    const enemyCenterX = enemy.x + enemy.w * 0.5;
    const enemyCenterY = enemy.y + enemy.h * 0.5;
    const distance = Math.hypot(enemyCenterX - playerCenterX, enemyCenterY - playerCenterY);
    if (distance < RAGDOLL_SHIELD.grabRange && distance < bestDistance) {
      best = enemy;
      bestDistance = distance;
    }
  }
  return best;
}

function tryEquipRagdollShield() {
  if (player.deathRagdoll || player.ragdollShield) {
    return false;
  }
  const enemy = findRagdollShieldCandidate();
  if (!enemy) {
    finale.message = "NO RARE RAGDOLL NEARBY";
    finale.messageTimer = 0.9;
    playSfx("dry");
    return false;
  }
  enemy.ragdollShieldHeld = true;
  enemy.ragdollShieldEligible = false;
  enemy.ragdollShieldSpent = true;
  player.ragdollShield = {
    enemy,
    shots: RAGDOLL_SHIELD.shots,
    maxShots: RAGDOLL_SHIELD.shots
  };
  player.ragdollShieldFlash = 0.25;
  positionCarriedRagdollShield();
  finale.message = "RAGDOLL GUARD: 7 SHOTS";
  finale.messageTimer = 1.4;
  playSfx("pickup");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.42, "#ffd166", 18, 260);
  return true;
}

function releaseRagdollShield(broken = true) {
  const shield = player.ragdollShield;
  const enemy = shield?.enemy;
  if (enemy) {
    enemy.ragdollShieldHeld = false;
    enemy.ragdollShieldEligible = false;
    enemy.ragdollShieldSpent = true;
    enemy.vx = signNonZero(player.facing || 1) * (broken ? 330 : 150);
    enemy.vy = broken ? -270 : -120;
    enemy.grounded = false;
    enemy.deathBleedTimer = 0.04;
    if (enemy.ragdoll?.points) {
      for (const point of Object.values(enemy.ragdoll.points)) {
        point.oldX = point.x - enemy.vx / 60;
        point.oldY = point.y - enemy.vy / 60;
      }
    }
  }
  player.ragdollShield = null;
  player.ragdollShieldFlash = 0;
  if (broken) {
    finale.message = "RAGDOLL GUARD BROKE";
    finale.messageTimer = 1.2;
    shake = Math.max(shake, 8);
    playSfx("deflect");
  }
}

function updateRagdollShield(dt) {
  player.ragdollShieldFlash = Math.max(0, (player.ragdollShieldFlash || 0) - dt);
  if (!player.ragdollShield) {
    return;
  }
  positionCarriedRagdollShield();
}

function absorbRagdollShieldShot(bullet) {
  const shield = player.ragdollShield;
  const box = ragdollShieldHitbox();
  if (!shield || !box) {
    return false;
  }
  const bulletRect = { x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 };
  if (!rectsOverlap(bulletRect, box)) {
    return false;
  }
  shield.shots -= 1;
  player.ragdollShieldFlash = 0.22;
  addBloodSplatters(bullet.x, bullet.y, signNonZero(bullet.vx || player.facing), 2, shield.enemy, "ragdoll");
  burstParticles(bullet.x, bullet.y, bullet.color || "#ffd166", 12, 230);
  shake = Math.max(shake, 4);
  playSfx("deflect");
  if (shield.shots <= 0) {
    releaseRagdollShield(true);
  }
  return true;
}

function updateDeathRagdoll(enemy, dt) {
  enemy.deathAge = (enemy.deathAge || 0) + dt;
  enemy.animFrame += dt * 8;
  enemy.airStrafeTimer = Math.max(0, (enemy.airStrafeTimer || 0) - dt);
  enemy.hurtFlash = Math.max(0, enemy.hurtFlash - dt);
  enemy.alert = 0;

  if (updateEnemyPhysicsRagdoll(enemy, dt)) {
    applyActorImpulsesToEnemyRagdoll(enemy);
  } else {
    const previousY = enemy.y;
    const centerX = enemy.x + enemy.w * 0.5;
    const surfaceY = enemy.platform ? platformSurfaceY(enemy.platform, centerX) : Infinity;
    if (!enemy.grounded) {
      enemy.vy += WORLD.gravity * 0.88 * dt;
      enemy.vy = Math.min(enemy.vy, WORLD.maxFall);
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.ragdollAngle += (enemy.ragdollSpin || 0) * dt;
      if (enemy.vy >= 0 && previousY + enemy.h <= surfaceY + 6 && enemy.y + enemy.h >= surfaceY) {
        enemy.y = surfaceY - enemy.h;
        enemy.vy = -Math.abs(enemy.vy) * DEATH_RAGDOLL.bounceDamp;
        enemy.vx *= 0.62;
        enemy.ragdollSpin *= -0.48;
        enemy.grounded = Math.abs(enemy.vy) < 95;
        if (enemy.grounded) {
          enemy.vy = 0;
          enemy.ragdollAngle += (Math.random() - 0.5) * 0.28;
        }
        burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.82, "#7a0018", 5, 130);
      }
    } else {
      enemy.y = surfaceY - enemy.h;
      enemy.vx = approach(enemy.vx, 0, DEATH_RAGDOLL.groundFriction * dt);
      enemy.x += enemy.vx * dt;
      enemy.ragdollSpin = approach(enemy.ragdollSpin || 0, 0, 5 * dt);
      enemy.ragdollAngle += (enemy.ragdollSpin || 0) * dt;
    }
  }

  enemy.deathBleedTimer = Math.max(0, (enemy.deathBleedTimer || 0) - dt);
  if (enemy.deathAge < DEATH_RAGDOLL.bleedDuration && enemy.deathBleedTimer <= 0) {
    enemy.deathBleedTimer = DEATH_RAGDOLL.bleedInterval + Math.random() * 0.12;
    const bleedPoint = enemy.ragdoll?.points?.chest || enemy.ragdoll?.points?.hip;
    const bleedX = bleedPoint ? bleedPoint.x : enemy.x + enemy.w * 0.5;
    const bleedY = bleedPoint ? bleedPoint.y : enemy.y + enemy.h * 0.55;
    addBloodSplatters(bleedX, bleedY, signNonZero(enemy.vx || player.facing), 1 + Math.floor(Math.random() * 2), enemy, "ragdoll");
  }
}

function findPlayerLandingSurface(prevY) {
  const cx = player.x + player.w * 0.5;
  let best = null;
  for (const platform of platforms) {
    if (cx < platform.x - 8 || cx > platform.x + platform.w + 8) {
      continue;
    }
    const surfaceY = platformSurfaceY(platform, cx);
    if (prevY + player.h <= surfaceY + 8 && player.y + player.h >= surfaceY - 2 && (!best || surfaceY < best.y)) {
      best = { platform, y: surfaceY };
    }
  }
  return best;
}

function startPlayerDeathRagdoll(source = "death", dir = -player.facing) {
  if (player.deathRagdoll) {
    return;
  }
  releaseRagdollShield(false);
  const direction = signNonZero(dir || -player.facing || 1);
  player.deathRagdoll = true;
  player.deathAge = 0;
  player.deathBleedTimer = 0;
  player.shield = 0;
  player.ledge = null;
  player.slideState = "none";
  player.meleeType = null;
  player.reloadTimer = 0;
  player.reloadFrame = 0;
  player.airBodyAngle = direction * 0.55;
  player.vx = direction * (190 + Math.random() * 140);
  player.vy = source === "enemyTakedown" ? -(315 + Math.random() * 120) : Math.min(player.vy, -180);
  player.grounded = false;
  player.ragdollAngle = direction * (0.45 + Math.random() * 0.35);
  player.ragdollSpin = direction * (4.4 + Math.random() * 2.8);
  startPlayerVisualRagdoll("death", player.vx, player.vy);
  addPlayerBloodSplatters(source === "enemyTakedown" ? 5 : 3, direction, "playerTakedown");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.5, "#8f1d2c", source === "enemyTakedown" ? 8 : 5, 280);
}

function updatePlayerDeathRagdoll(dt) {
  if (!player.deathRagdoll) {
    return;
  }
  const previousY = player.y;
  player.deathAge += dt;
  player.deathBleedTimer = Math.max(0, player.deathBleedTimer - dt);
  player.animFrame += dt * 7;
  player.vy += WORLD.gravity * 0.86 * dt;
  player.vy = Math.min(player.vy, WORLD.maxFall);
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.ragdollAngle += player.ragdollSpin * dt;
  player.airBodyAngle = player.ragdollAngle;
  updatePlayerVisualRagdoll(dt, "death");
  applyActorImpulsesToPlayerRagdoll();

  const landing = player.vy >= 0 ? findPlayerLandingSurface(previousY) : null;
  if (landing) {
    player.y = landing.y - player.h;
    player.vy = -Math.abs(player.vy) * PLAYER_DEATH_RAGDOLL.bounceDamp;
    player.vx *= 0.58;
    player.ragdollSpin *= -0.48;
    if (Math.abs(player.vy) < 100) {
      player.vy = 0;
      player.grounded = true;
    }
  }
  if (player.grounded) {
    player.vx = approach(player.vx, 0, PLAYER_DEATH_RAGDOLL.groundFriction * dt);
    player.ragdollSpin = approach(player.ragdollSpin, 0, 5.2 * dt);
  }
  if (player.deathAge < PLAYER_DEATH_RAGDOLL.bleedDuration && player.deathBleedTimer <= 0) {
    player.deathBleedTimer = PLAYER_DEATH_RAGDOLL.bleedInterval + Math.random() * 0.1;
    addPlayerBloodSplatters(1 + Math.floor(Math.random() * 2), signNonZero(player.vx || player.facing), "playerTakedown");
  }
}

function moveEvilTwinBoss(enemy, dt, distance, distanceX, distanceY) {
  enemy.comboTimer = Math.max(0, (enemy.comboTimer || 0) - dt);
  enemy.airStrafeCooldown = Math.max(0, (enemy.airStrafeCooldown || 0) - dt);
  enemy.cinematicMimicTimer = Math.max(0, (enemy.cinematicMimicTimer || 0) - dt);
  const tactic = dominantTacticForEnemy(enemy);
  const mimic = enemy.bossMimic || tactic;
  const mimicBoost = enemy.cinematicMimicTimer > 0 ? 1.18 : 1;
  const plan = enemy.masterPlan || enemyMasterPlan(enemy, true, null, distance, distanceY);
  const combos = ["mirror", "rush", "air", "counter", "bait"];
  if (enemy.comboTimer <= 0) {
    enemy.bossCombo = combos[Math.floor(Math.random() * combos.length)];
    enemy.comboTimer = 0.44 + Math.random() * 0.58;
    enemy.combatDir = Math.random() < 0.5 ? -1 : 1;
  }

  if (enemy.grounded && enemy.airStrafeCooldown <= 0 && (mimic === "air" || player.airStrafeTimer > 0 || enemy.bossCombo === "air" || (distance < 330 && Math.random() < 0.04))) {
    enemy.grounded = false;
    enemy.airStrafeTimer = mimic === "air" ? 0.94 : 0.72;
    enemy.airStrafeCooldown = 1.15 + Math.random() * 0.45;
    enemy.vy = mimic === "air" ? -620 : -560;
    enemy.vx = ((distanceX >= 0 ? 1 : -1) * 520 + enemy.combatDir * 180) * mimicBoost;
    enemy.crouchTimer = 0.18;
    shake = Math.max(shake, 5);
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, "#c66bff", 20, 360);
  }

  if (!enemy.grounded) {
    const targetVx = (distanceX >= 0 ? 1 : -1) * 440 + enemy.combatDir * 210;
    enemy.vx = approach(enemy.vx, targetVx, 820 * dt);
    enemy.x += enemy.vx * dt;
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    enemy.aimAngle = Math.atan2(distanceY, distanceX);
    return;
  }

  let desiredVx = enemy.facing * 158;
  if (enemy.bossCombo === "rush" || plan.approach === "pressure" || mimic === "reload") {
    desiredVx = enemy.facing * (mimic === "reload" ? 272 : 230);
  } else if (enemy.bossCombo === "counter" || plan.approach === "kite" || mimic === "melee" || distance < 180) {
    desiredVx = -enemy.facing * 190 + enemy.combatDir * 48;
    enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.12);
  } else if (enemy.bossCombo === "bait" || plan.approach === "strafe" || mimic === "gun") {
    desiredVx = enemy.combatDir * (mimic === "gun" ? 245 : 205);
  } else if (enemy.bossCombo === "mirror") {
    desiredVx = clamp(player.vx * 0.7, -235, 235);
  }
  if (mimic === "slide") {
    desiredVx = enemy.combatDir * 280;
    enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.2);
  }

  desiredVx = clamp(desiredVx * mimicBoost, -360, 360);
  desiredVx += enemySeparationBias(enemy) * 210;
  enemy.vx = approach(enemy.vx, desiredVx, 1380 * dt);
  enemy.x += enemy.vx * dt;
  if (enemy.x < enemy.left || enemy.x > enemy.right) {
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    enemy.combatDir *= -1;
    enemy.vx *= -0.5;
  }
}

function moveFinalBoss(enemy, dt, distance, distanceX = 0, distanceY = 0) {
  if (enemy.evilTwin) {
    moveEvilTwinBoss(enemy, dt, distance, distanceX, distanceY);
    return;
  }
  enemy.cinematicMimicTimer = Math.max(0, (enemy.cinematicMimicTimer || 0) - dt);
  const tactic = dominantTacticForEnemy(enemy);
  const mimic = enemy.bossMimic || tactic;
  const mimicBoost = enemy.cinematicMimicTimer > 0 ? 1.16 : 1;
  const plan = enemy.masterPlan || enemyMasterPlan(enemy, true, null, distance, distanceY);
  const speedBase = enemy.hp < enemy.maxHp * 0.45 ? 108 : 72;
  let desiredVx = enemy.facing * speedBase;
  if (enemy.decisionTimer <= 0) {
    enemy.combatDir = Math.random() < 0.5 ? -1 : 1;
    enemy.decisionTimer = 0.2 + Math.random() * 0.24;
  }
  if (plan.approach === "pressure" || mimic === "reload") {
    desiredVx = enemy.facing * (speedBase + (mimic === "reload" ? 72 : 42));
  } else if (plan.approach === "kite" || mimic === "melee" || distance < 190) {
    desiredVx = -enemy.facing * (speedBase + 20);
  } else if (plan.approach === "anti-air" || mimic === "air") {
    desiredVx = enemy.combatDir * (speedBase + (mimic === "air" ? 62 : 36));
    enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.08);
  }
  if (mimic === "slide") {
    desiredVx = enemy.combatDir * (speedBase + 88);
    enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.16);
  } else if (mimic === "gun") {
    desiredVx += enemy.combatDir * 44;
    enemy.fireTimer = Math.min(enemy.fireTimer, 0.2);
  }
  desiredVx = clamp(desiredVx * mimicBoost, -260, 260);
  desiredVx += enemySeparationBias(enemy) * 140;
  enemy.vx = approach(enemy.vx, desiredVx, 760 * dt);
  enemy.x += enemy.vx * dt;
  if (enemy.x < enemy.left || enemy.x > enemy.right) {
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    enemy.combatDir *= -1;
    enemy.vx *= -0.45;
  }
}

function moveBonusBoss(enemy, dt, distance, distanceX = 0) {
  const blueprint = bonusBossBlueprint(enemy);
  const speedScale = blueprint.moveSpeed || 1;
  const plan = enemy.masterPlan || enemyMasterPlan(enemy, true, null, distance, 0);
  enemy.comboTimer = Math.max(0, (enemy.comboTimer || 0) - dt);
  enemy.bonusQteCooldown = Math.max(0, (enemy.bonusQteCooldown || 0) - dt);
  if (enemy.comboTimer <= 0) {
    const options = blueprint.id === "vanta"
      ? ["rush", "rush", "bait", "hop", "vanta"]
      : blueprint.id === "echo"
        ? ["guard", "guard", "rush", "echo", "bait"]
        : blueprint.id === "null"
          ? ["hop", "rush", "guard", "null", "bait"]
          : blueprint.id === "rail"
            ? ["guard", "bait", "rail", "rail", "hop"]
            : ["hop", "hop", "sky", "bait", "rush"];
    enemy.bossCombo = options[Math.floor(Math.random() * options.length)];
    enemy.comboTimer = (blueprint.id === "vanta" ? 0.24 : blueprint.id === "rail" ? 0.62 : 0.36) + Math.random() * 0.44;
    enemy.combatDir = Math.random() < 0.5 ? -1 : 1;
  }

  if (!enemy.grounded) {
    const airTarget = enemy.facing * (blueprint.id === "sky" ? 350 : 260) + enemy.combatDir * (blueprint.id === "null" ? 220 : 160);
    enemy.vx = approach(enemy.vx, airTarget * speedScale, 620 * speedScale * dt);
    enemy.x += enemy.vx * dt;
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    return;
  }

  if ((enemy.bossCombo === "hop" || enemy.bossCombo === "sky" || blueprint.id === "sky") && enemy.airStrafeCooldown <= 0 && distance < 460) {
    enemy.grounded = false;
    enemy.airStrafeTimer = blueprint.id === "sky" ? 0.72 : 0.48;
    enemy.airStrafeCooldown = (blueprint.id === "sky" ? 0.82 : 1.3) + Math.random() * 0.65;
    enemy.vy = blueprint.id === "sky" ? -610 : -470;
    enemy.vx = ((distanceX >= 0 ? 1 : -1) * (blueprint.id === "vanta" ? 520 : 330) + enemy.combatDir * 120) * speedScale;
    enemy.crouchTimer = 0.18;
    burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, blueprint.color, 18, 320);
    return;
  }

  let desiredVx = enemy.combatDir * 110 * speedScale;
  if (plan.approach === "pressure" || distance > blueprint.preferredRange + 90 || enemy.bossCombo === "rush" || enemy.bossCombo === "vanta") {
    desiredVx = enemy.facing * (blueprint.id === "vanta" ? 310 : 170) * speedScale;
  } else if (plan.approach === "kite" || distance < blueprint.preferredRange - 65 || enemy.bossCombo === "guard" || enemy.bossCombo === "echo") {
    desiredVx = -enemy.facing * (blueprint.id === "echo" ? 205 : 145) * speedScale;
    enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.1);
  } else if (plan.approach === "strafe" || plan.approach === "spread" || enemy.bossCombo === "bait" || enemy.bossCombo === "rail") {
    desiredVx = enemy.combatDir * (blueprint.id === "rail" ? 132 : 220) * speedScale;
  } else if (enemy.bossCombo === "null") {
    desiredVx = (distance < 210 ? -enemy.facing : enemy.facing) * 240 * speedScale;
  }

  desiredVx += enemySeparationBias(enemy) * 230 * speedScale;
  enemy.vx = approach(enemy.vx, desiredVx, 1080 * speedScale * dt);
  enemy.x += enemy.vx * dt;
  if (enemy.x < enemy.left || enemy.x > enemy.right) {
    enemy.x = clamp(enemy.x, enemy.left, enemy.right);
    enemy.combatDir *= -1;
    enemy.vx *= -0.5;
  }
}

function updateEnemies(dt) {
  enemyUpdateTick += 1;
  for (const enemy of enemies) {
    if (enemy.dead) {
      if (enemy.deathRagdoll && !isCarriedRagdoll(enemy)) {
        updateDeathRagdoll(enemy, dt);
      }
      continue;
    }
    if (enemy.finalePursuer) {
      updateFinalePursuer(enemy, dt);
      continue;
    }

    enemy.hurtFlash = Math.max(0, enemy.hurtFlash - dt);
    enemy.decisionTimer = Math.max(0, enemy.decisionTimer - dt);
    enemy.crouchTimer = Math.max(0, enemy.crouchTimer - dt);
    enemy.dodgeCooldown = Math.max(0, enemy.dodgeCooldown - dt);
    enemy.staggerTimer = Math.max(0, (enemy.staggerTimer || 0) - dt);
    enemy.meleeCooldown = Math.max(0, (enemy.meleeCooldown || 0) - dt);
    enemy.shootDelay = Math.max(0, (enemy.shootDelay || 0) - dt);
    enemy.shotWindup = Math.max(0, (enemy.shotWindup || 0) - dt);
    enemy.alert = Math.max(0, enemy.alert - dt * 0.25);

    const enemyCenterX = enemy.x + enemy.w * 0.5;
    const enemyCenterY = enemy.y + enemy.h * 0.45;
    const playerCenterX = player.x + player.w * 0.5;
    const playerCenterY = player.y + player.h * 0.5;
    const distanceX = playerCenterX - enemyCenterX;
    const distanceY = playerCenterY - enemyCenterY;
    const distance = Math.hypot(distanceX, distanceY);
    enemy.facing = distanceX >= 0 ? 1 : -1;
    enemy.aimAngle = Math.atan2(distanceY, distanceX);

    const visible = enemyVisibleInCamera(enemy, 260);
    const protectedEnemy = activeBossEnemy(enemy);
    if (!protectedEnemy && distance > ENEMY_PERF.simpleAiDistance) {
      enemy.pendingShot = false;
      enemy.burstShots = 0;
      enemy.fireTimer = Math.max(enemy.fireTimer || 0, 0.5);
      enemy.animFrame += dt * 0.8;
      if (!enemy.grounded) {
        updateEnemyVertical(enemy, dt);
      } else {
        enemy.y = platformSurfaceY(enemy.platform, enemy.x + enemy.w * 0.5) - enemy.h;
      }
      continue;
    }
    if (!protectedEnemy
      && !visible
      && distance > ENEMY_PERF.fullAiDistance
      && ((enemyUpdateTick + (enemy.updateSlot || 0)) % ENEMY_PERF.batchFrames !== 0)) {
      enemy.animFrame += dt * 1.1;
      if (!enemy.grounded) {
        updateEnemyVertical(enemy, dt);
      }
      continue;
    }

    const seesPlayer = enemyCanSeePlayer(enemy, distance, distanceY, enemyCenterX, enemyCenterY, playerCenterX, playerCenterY);
    const incomingBullet = playerBullets.find((bullet) => {
      if ((bullet.vx > 0 && bullet.x > enemy.x + enemy.w) || (bullet.vx < 0 && bullet.x < enemy.x)) {
        return false;
      }
      return Math.abs(bullet.y - enemyCenterY) < 34 && Math.abs(bullet.x - enemyCenterX) < 290;
    });

    if (enemy.type === "dummy") {
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.grounded = true;
      enemy.y = platformSurfaceY(enemy.platform, enemy.x + enemy.w * 0.5) - enemy.h;
      enemy.aimAngle = 0;
      enemy.animFrame += dt * 1.6;
      continue;
    }

    if (canStartEliteTakedown(enemy, distance, distanceY)) {
      startEliteTakedown(enemy);
      continue;
    }

    if (incomingBullet && enemy.dodgeCooldown <= 0 && enemy.type !== "turret") {
      const dodgeStrength = dominantTacticForEnemy(enemy) === "gun" ? 285 : 215;
      enemy.crouchTimer = 0.28;
      enemy.dodgeCooldown = enemy.type === "elite" ? 0.38 : 0.52;
      enemy.vx = incomingBullet.vx > 0 ? -dodgeStrength : dodgeStrength;
      if (enemy.grounded && (enemy.type === "soldier" || enemy.type === "elite") && Math.random() < (enemy.type === "elite" ? 0.68 : 0.54)) {
        enemy.grounded = false;
        enemy.vy = enemy.type === "elite" ? -470 : -390;
        enemy.airStrafeTimer = enemy.type === "elite" ? 0.28 : 0.16;
        burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h, enemy.type === "elite" ? "#ff7a30" : "#ff304f", 12, 260);
      }
    }

    updateEnemyState(enemy, seesPlayer, incomingBullet, distance, distanceY, playerCenterX, playerCenterY, dt);

    if (enemy.bonusBoss) {
      moveBonusBoss(enemy, dt, distance, distanceX);
    } else if (enemy.type === "soldier" || enemy.type === "elite") {
      moveMobileEnemy(enemy, dt, distance, distanceX);
    } else if (enemy.type === "finalBoss") {
      moveFinalBoss(enemy, dt, distance, distanceX, distanceY);
    } else {
      enemy.vx = 0;
    }
    updateEnemyVertical(enemy, dt);
    resolveEnemySpacing(enemy);
    if (updateEnemyMelee(enemy, dt)) {
      return;
    }
    releaseQueuedEnemyShot(enemy);

    enemy.animFrame += dt * (enemy.crouchTimer > 0 ? 4 : (4 + Math.abs(enemy.vx) / 35) * RUN_FRAME_RATE_SCALE);

    if (canEnemyMeleePlayer(enemy, distance, distanceY)) {
      startEnemyMelee(enemy);
    }

    const canFire = enemy.type !== "dummy" && !enemy.meleeType && !enemy.pendingShot && enemy.shootDelay <= 0 && enemy.airStrafeTimer <= 0.25 && distance < 1050 && (seesPlayer || enemy.memoryTimer > 0 || enemy.type === "finalBoss" || enemy.bonusBoss) && (enemy.aiState === "alert" || enemy.aiState === "combat");
    if (enemy.earlyTwin && !enemy.armWrestleUsed && !finale.armWrestle.active && distance < 270) {
      startArmWrestle(enemy);
    }
    if (enemy.bonusBoss && !bonusClash.active && enemy.bonusQteCooldown <= 0 && distance < 255 && Math.abs(distanceY) < 120) {
      startBonusClash(enemy);
      if (bonusClash.active && bonusClash.enemy === enemy) {
        continue;
      }
    }
    if (canFire) {
      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0) {
        const tactic = dominantTacticForEnemy(enemy);
        if (enemy.type === "finalBoss") {
          enemy.burstShots = (enemy.hp < enemy.maxHp * 0.5 ? 10 : 7) + (tactic === "air" ? 2 : 0);
          enemy.burstGap = 0;
          enemy.fireTimer = (enemy.hp < enemy.maxHp * 0.5 ? 1.05 : 1.35) * (tactic === "reload" ? 0.82 : 1);
        } else if (enemy.bonusBoss) {
          const blueprint = bonusBossBlueprint(enemy);
          enemy.burstShots = blueprint.id === "rail" ? 6 : blueprint.id === "echo" ? 2 : blueprint.id === "vanta" ? 4 : blueprint.id === "sky" ? 5 : 3;
          enemy.burstGap = 0;
          enemy.fireTimer = (blueprint.id === "vanta" ? 0.84 : blueprint.id === "rail" ? 1.65 : blueprint.id === "echo" ? 1.2 : 1.05) + Math.random() * 0.2;
        } else if (enemy.type === "boss") {
          enemy.burstShots = tactic === "air" ? 6 : 5;
          enemy.burstGap = 0;
          enemy.fireTimer = tactic === "reload" ? 1.45 : 1.8;
        } else if (enemy.type === "elite") {
          queueEnemyShot(enemy);
          enemy.fireTimer = ELITE_TRAITS.fireDelay * (enemy.squadRole === "suppressor" || tactic === "air" ? 0.78 : enemy.squadRole === "rusher" ? 1.12 : 1);
          enemy.crouchTimer = Math.max(enemy.crouchTimer, 0.08);
        } else {
          queueEnemyShot(enemy);
          const roleRate = enemy.squadRole === "suppressor" || tactic === "air" ? 0.72 : enemy.squadRole === "rusher" ? 1.18 : enemy.squadRole === "guard" ? 1.05 : 1;
          enemy.fireTimer = AI.regularFireInterval * roleRate + Math.random() * 0.05;
          enemy.crouchTimer = enemy.type === "turret" ? 0.2 : 0.08;
        }
      }
    }

    if ((enemy.type === "finalBoss" || enemy.type === "boss") && enemy.burstShots > 0) {
      enemy.burstGap -= dt;
      if (enemy.burstGap <= 0 && !enemy.pendingShot) {
        queueEnemyShot(enemy, true);
      }
    }

    if (rectsOverlap(player, enemy)) {
      damagePlayerFromEnemy(enemy, 1, "enemyBody");
      if (enemyTakedown.active) {
        return;
      }
      const push = player.x + player.w * 0.5 < enemy.x + enemy.w * 0.5 ? -1 : 1;
      player.vx = push * 420;
      player.vy = -300;
    }
  }
}

function updateBullets(dt) {
  for (const bullet of playerBullets) {
    bullet.life -= dt;
    bullet.trail.push({ x: bullet.x, y: bullet.y, life: 0.16 });
    updatePlayerBulletTracking(bullet, dt);
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.trail.forEach((point) => {
      point.life -= dt;
    });
    bullet.trail = bullet.trail.filter((point) => point.life > 0);

    if (hitPowerCubes({ x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 }, bullet.x, bullet.y)) {
      bullet.life = 0;
      continue;
    }

    if (hitAnyRagdollWithBullet(bullet, "player")) {
      bullet.life = 0;
      continue;
    }

    if (platforms.some((platform) => rectsOverlap({ x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 }, platform))) {
      bullet.life = 0;
      burstParticles(bullet.x, bullet.y, bullet.color, 7, 150);
      continue;
    }

    for (const enemy of enemies) {
      if (enemy.dead || !rectsOverlap({ x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 }, enemy)) {
        continue;
      }
      bullet.life = 0;
      if ((enemy.shield || 0) > 0) {
        enemy.shield = Math.max(0, enemy.shield - 1);
        enemy.hurtFlash = 0.12;
        enemy.alert = 1;
        enemy.memoryTimer = AI.memoryTime;
        enemy.crouchTimer = Math.max(enemy.crouchTimer || 0, 0.14);
        enemy.vx += Math.sign(bullet.vx || player.facing) * 42;
        burstParticles(bullet.x, bullet.y, "#ff7a30", enemy.shield <= 0 ? 24 : 12, enemy.shield <= 0 ? 390 : 220);
        if (enemy.shield <= 0) {
          staggerEnemy(enemy, 1.0, "SHIELD BREAK");
          shake = Math.max(shake, 5);
          finale.message = "ORANGE SHIELD DOWN: RIGHT STICK FULL RIGHT";
          finale.messageTimer = 1.1;
        }
        break;
      }
      const weakSpot = enemyWeakSpotAt(enemy, bullet.y, bullet.weaponType);
      const finalDamage = bullet.damage * (weakSpot ? weakSpot.damageScale : 1);
      enemy.hp -= finalDamage;
      enemy.hurtFlash = 0.08;
      if (weakSpot) {
        rewardWeakSpot(enemy, weakSpot, bullet.x, bullet.y);
      }
      addBloodSplatters(bullet.x, bullet.y, signNonZero(bullet.vx || player.facing), enemy.hp <= 0 ? BLOOD_EFFECT.killSplats : BLOOD_EFFECT.gunSplats + Math.ceil(finalDamage * 8), enemy, "gun");
      burstParticles(bullet.x, bullet.y, bullet.color, 14, 250);
      shake = Math.max(shake, finalDamage > 1 ? 5 : 2);
      if (enemy.hp <= 0) {
        killEnemy(enemy);
      }
      break;
    }
  }
  playerBullets = playerBullets.filter((bullet) => bullet.life > 0);

  for (const bullet of enemyBullets) {
    if (bullet.life <= 0) {
      continue;
    }
    bullet.life -= dt;
    bullet.trail.push({ x: bullet.x, y: bullet.y, life: 0.18 });
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.trail.forEach((point) => {
      point.life -= dt;
    });
    bullet.trail = bullet.trail.filter((point) => point.life > 0);

    if (absorbRagdollShieldShot(bullet)) {
      bullet.life = 0;
      continue;
    }

    if (hitAnyRagdollWithBullet(bullet, "enemy")) {
      bullet.life = 0;
      continue;
    }

    if (rectsOverlap({ x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 }, player)) {
      bullet.life = 0;
      const owner = bullet.owner && !bullet.owner.dead ? bullet.owner : null;
      const ownerDistance = owner ? Math.hypot((owner.x + owner.w * 0.5) - (player.x + player.w * 0.5), (owner.y + owner.h * 0.5) - (player.y + player.h * 0.5)) : Infinity;
      if (owner && (owner.type === "soldier" || owner.type === "elite") && enemyCanStartPlayerTakedown(owner, 1.5) && ownerDistance < 360) {
        startEnemyTakedown(owner);
      } else {
        const damaged = hurtPlayer(1.5, "shot", {
          x: bullet.x,
          y: bullet.y,
          dir: signNonZero(bullet.vx || -player.facing),
          color: bullet.color
        });
        if (!damaged) {
          burstParticles(bullet.x, bullet.y, bullet.color, 8, 160);
        }
      }
    }

    if (platforms.some((platform) => rectsOverlap({ x: bullet.x - bullet.r, y: bullet.y - bullet.r, w: bullet.r * 2, h: bullet.r * 2 }, platform))) {
      bullet.life = 0;
      burstParticles(bullet.x, bullet.y, bullet.color, 7, 120);
    }
  }
  enemyBullets = enemyBullets.filter((bullet) => bullet.life > 0);
}

function hitPowerCubes(hitbox, hitX, hitY) {
  let hit = false;
  for (const cube of powerCubes) {
    if (!cube.active || !rectsOverlap(hitbox, cube)) {
      continue;
    }
    activatePowerCube(cube, hitX ?? cube.x + cube.w * 0.5, hitY ?? cube.y + cube.h * 0.5);
    hit = true;
  }
  powerCubes = powerCubes.filter((cube) => cube.active);
  return hit;
}

function activatePowerCube(cube, x, y) {
  cube.active = false;
  player.powerTimer = POWERUP.duration;
  player.reloadTimer = 0;
  player.reloadFrame = 0;
  player.magAmmo = currentClipSize();
  shake = Math.max(shake, 9);
  playSfx("pickup");
  burstParticles(x, y, "#b8fff3", 42, 520);
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.45, "#ffd166", 28, 360);
}

function killEnemy(enemy) {
  if (enemy.dead) {
    return;
  }
  enemy.dead = true;
  startEnemyDeathRagdoll(enemy);
  comboCount += 1;
  bestComboCount = Math.max(bestComboCount, comboCount);
  const speed = Math.hypot(player.vx, player.vy);
  multiplier = Math.max(multiplier, clamp(1 + speed / 260, 1.1, 5));
  addStyle(player.airStrafeTimer > 0 ? "STRAFE KILL" : speed > MOVE.maxRun * 1.25 ? "SPEED KILL" : comboCount > 2 ? "COMBO KILL" : "KILL", STYLE.killBonus + Math.min(10, comboCount * 2), enemy.type === "elite" ? "#ff7a30" : enemy.type === "boss" || enemy.bonusBoss ? "#ffd166" : "#4df7ff");
  const points = enemy.type === "finalBoss" ? 3000 : enemy.bonusBoss ? 1800 : enemy.type === "boss" ? 1200 : enemy.type === "turret" ? 240 : 180;
  score += Math.round(points * multiplier);
  const healedHp = Math.min(PLAYER_MAX_HP, player.hp + 1);
  if (healedHp > player.hp) {
    player.hp = healedHp;
    burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.35, "#4df7ff", 16, 240);
  }
  spawnDrops(enemy);
  playSfx("death");
  addBloodSplatters(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.48, signNonZero(player.vx || player.facing), enemy.type === "finalBoss" ? 10 : enemy.type === "boss" || enemy.bonusBoss ? 8 : BLOOD_EFFECT.killSplats, enemy, "kill");
  burstParticles(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.5, enemy.type === "finalBoss" ? "#c66bff" : enemy.bonusBoss ? enemy.bonusColor : "#ff304f", enemy.type === "finalBoss" ? 34 : enemy.type === "boss" || enemy.bonusBoss ? 24 : 12, enemy.type === "finalBoss" ? 620 : enemy.type === "boss" || enemy.bonusBoss ? 440 : 280);
  shake = Math.max(shake, enemy.type === "finalBoss" ? 22 : enemy.type === "boss" || enemy.bonusBoss ? 15 : 6);
}

function spawnDrops(enemy) {
  const cx = enemy.x + enemy.w * 0.5;
  const cy = enemy.y + enemy.h * 0.45;
  const coinCount = enemy.type === "finalBoss" ? 18 : enemy.bonusBoss ? 14 : enemy.type === "boss" ? 10 : enemy.type === "elite" ? 5 : 3;
  for (let i = 0; i < coinCount; i += 1) {
    spawnPickup("coin", cx, cy, enemy.type === "finalBoss" ? 125 : enemy.type === "boss" ? 85 : 35);
  }
  if (Math.random() < SHIELD_DROP_CHANCE) {
    spawnPickup("shield", cx, cy, SHIELD_PICKUP_VALUE + (enemy.type === "finalBoss" || enemy.bonusBoss ? 0.5 : 0));
  }
  if ((enemy.type === "boss" || enemy.type === "finalBoss" || enemy.bonusBoss || Math.random() < 0.06) && Math.random() < 0.28) {
    spawnPickup("grapple", cx, cy, 1);
  }
  const ammoRoll = Math.random();
  const ammoWeapon = ammoRoll < 0.6 ? "ar" : ammoRoll < 0.78 ? "shotgun" : ammoRoll < 0.9 ? "smg" : "pistol";
  const ammoAmount = ammoWeapon === "ar"
    ? 18 + Math.floor(Math.random() * (enemy.type === "finalBoss" ? 42 : 24))
    : ammoWeapon === "shotgun"
      ? 8 + Math.floor(Math.random() * (enemy.type === "finalBoss" ? 12 : 7))
      : ammoWeapon === "smg"
        ? 28 + Math.floor(Math.random() * 28)
        : 10 + Math.floor(Math.random() * 14);
  spawnPickup("ammo", cx, cy, ammoAmount, ammoWeapon);
  const weaponDropChance = enemy.type === "finalBoss" ? 1 : enemy.bonusBoss ? 0.95 : enemy.type === "boss" ? 0.85 : enemy.type === "elite" ? 0.55 : 0.32;
  if (enemy.weaponType && Math.random() < weaponDropChance) {
    const dropType = enemy.type === "finalBoss" && Math.random() < 0.45 ? "shotgun" : enemy.weaponType;
    spawnPickup("weapon", cx, cy, dropType === "shotgun" ? 10 : dropType === "smg" ? 48 : 18, dropType);
  }
}

function updateDeadEnemyRagdolls(dt) {
  for (const enemy of enemies) {
    if (enemy.dead && enemy.deathRagdoll && !isCarriedRagdoll(enemy)) {
      updateDeathRagdoll(enemy, dt);
    }
  }
}

function spawnPickup(type, x, y, value, weaponType = null) {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
  const force = 160 + Math.random() * 220;
  const weapon = weaponType ? weaponConfig(weaponType) : null;
  pickups.push({
    type,
    x,
    y,
    w: type === "weapon" ? 26 : type === "ammo" ? 18 : type === "shield" ? 16 : type === "grapple" ? 20 : 12,
    h: type === "weapon" ? 13 : type === "ammo" ? 11 : type === "shield" ? 18 : type === "grapple" ? 20 : 12,
    vx: Math.cos(angle) * force,
    vy: Math.sin(angle) * force,
    value,
    weaponType,
    color: weapon?.color || null,
    spin: Math.random() * Math.PI * 2,
    life: 16,
    collected: false
  });
}

function updatePickups(dt) {
  for (const pickup of pickups) {
    pickup.life -= dt;
    pickup.vy += WORLD.gravity * 0.52 * dt;
    pickup.x += pickup.vx * dt;
    pickup.y += pickup.vy * dt;
    pickup.vx = approach(pickup.vx, 0, 55 * dt);
    pickup.spin += dt * 8;

    for (const platform of platforms) {
      if (!rectsOverlap(pickup, platform)) {
        continue;
      }
      if (pickup.vy > 0) {
        pickup.y = platform.y - pickup.h;
        pickup.vy *= -0.28;
        pickup.vx *= 0.78;
      }
    }

    const playerCenterX = player.x + player.w * 0.5;
    const playerCenterY = player.y + player.h * 0.48;
    const pickupCenterX = pickup.x + pickup.w * 0.5;
    const pickupCenterY = pickup.y + pickup.h * 0.5;
    const pullDistance = Math.hypot(playerCenterX - pickupCenterX, playerCenterY - pickupCenterY);
    const pullRadius = pickup.type === "shield" && player.shield < PLAYER_SHIELD_MAX ? 165 : pickup.type === "grapple" ? 140 : 115;
    if (pullDistance < pullRadius) {
      const pull = (pullRadius - pullDistance) * 7 * dt;
      pickup.vx += ((playerCenterX - pickupCenterX) / Math.max(1, pullDistance)) * pull * 22;
      pickup.vy += ((playerCenterY - pickupCenterY) / Math.max(1, pullDistance)) * pull * 22;
    }

    if (rectsOverlap({ x: pickup.x - 6, y: pickup.y - 6, w: pickup.w + 12, h: pickup.h + 12 }, player)) {
      if (pickup.type === "ammo") {
        collectWeaponAmmo(pickup.weaponType || player.weaponType, pickup.value);
      } else if (pickup.type === "shield") {
        restorePlayerShield(pickup.value || SHIELD_PICKUP_VALUE);
      } else if (pickup.type === "weapon") {
        const pickupWeaponType = pickup.weaponType || "pistol";
        if (shouldEquipWeaponPickup(pickupWeaponType, pickup.value || 0)) {
          equipWeapon(pickupWeaponType, pickup.value || 0);
        } else {
          collectWeaponAmmo(pickupWeaponType, Math.max(1, Math.floor((pickup.value || 0) * 0.55)));
          smartInventory.lastAction = `STORED ${weaponConfig(pickupWeaponType).label}`;
          smartInventory.lastActionTimer = 1.1;
        }
      } else if (pickup.type === "grapple") {
        player.rescueGrapples = Math.min(2, (player.rescueGrapples || 0) + 1);
        addStyle("RESCUE READY", 8, "#ffd166");
        finale.message = "RESCUE GRAPPLE READY";
        finale.messageTimer = 1.1;
      } else {
        score += Math.round(pickup.value * multiplier);
      }
      pickup.collected = true;
      playSfx("pickup");
      burstParticles(pickupCenterX, pickupCenterY, pickup.type === "weapon" ? weaponConfig(pickup.weaponType).color : pickup.type === "ammo" ? weaponConfig(pickup.weaponType || player.weaponType).color : pickup.type === "shield" ? "#b8fff3" : pickup.type === "grapple" ? "#ffd166" : "#ffd166", 7, 120);
    }
  }
  pickups = pickups.filter((pickup) => pickup.life > 0 && !pickup.collected);
}

function absorbPlayerShield() {
  if (player.shield <= 0) {
    return false;
  }
  player.shield = Math.max(0, player.shield - 1);
  player.shieldPulse = 0.26;
  player.invuln = Math.max(player.invuln, 0.18);
  shake = Math.max(shake, 7);
  playSfx("deflect");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.5, "#b8fff3", 34, 440);
  if (player.shield <= 0) {
    addPlayerBloodSplatters(2, -player.facing, "shieldBreak");
  }
  return true;
}

function addPlayerBloodSplatters(count = 14, dir = -player.facing, source = "player") {
  addBloodSplatters(
    player.x + player.w * 0.5,
    player.y + player.h * 0.45,
    dir,
    count,
    null,
    source
  );
}

function addPlayerBulletHitEffect(x, y, dir, color = "#ff304f") {
  addBloodSplatters(x, y, signNonZero(dir || -player.facing), BLOOD_EFFECT.gunSplats + 3, null, "gun");
  burstParticles(x, y, color, 14, 250);
  burstParticles(x, y, "#8a2638", 5, 160);
}

function hurtPlayer(amount, source = "impact", impact = null) {
  if (player.invuln > 0 || gameState !== "playing") {
    return false;
  }
  if (source === "shot" && absorbPlayerShield()) {
    return false;
  }
  player.hp -= amount;
  player.invuln = 0.8;
  comboCount = 0;
  multiplier = 1;
  shake = Math.max(shake, 12);
  playSfx("hurt");
  burstParticles(player.x + player.w * 0.5, player.y + player.h * 0.5, "#4df7ff", 24, 360);
  if (source === "shot") {
    if (impact) {
      addPlayerBulletHitEffect(impact.x, impact.y, impact.dir, impact.color);
    } else {
      addPlayerBloodSplatters(3, -player.facing, "playerShot");
    }
  }
  if (player.hp <= 0) {
    die();
  }
  return true;
}

function die() {
  if (!player.deathRagdoll && player.y < WORLD.floorKillY) {
    startPlayerDeathRagdoll("death", -player.facing);
  }
  gameState = "dead";
  player.hp = 0;
  shake = Math.max(shake, 20);
  finalScore.textContent = `DOWNED // SCORE ${score}`;
  bestCombo.textContent = `BEST COMBO ${bestComboCount}`;
  retryButton.textContent = CONTROL.controllerOnly ? "PRESS A TO RETRY RUN" : "RETRY RUN";
  deathOverlay.classList.remove("hidden");
  pauseBackgroundTrack();
  setAudioMuffle(true);
}

function burstParticles(x, y, color, count, speed) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const force = speed * (0.3 + Math.random() * 0.7);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - 40,
      life: 0.18 + Math.random() * 0.38,
      maxLife: 0.55,
      color,
      size: 1.5 + Math.random() * 3
    });
  }
}

function bloodSplatCount(count, source = "hit") {
  const cap = source === "kill" ? 6 : source === "gun" ? 4 : source === "melee" ? 4 : source === "ragdoll" ? 2 : 3;
  return Math.min(cap, Math.max(0, Math.ceil((Number.isFinite(count) ? count : BLOOD_EFFECT.minSplats) * 0.2)));
}

function addBloodSplatters(x, y, dir = 1, count = BLOOD_EFFECT.minSplats, enemy = null, source = "hit") {
  const splatCount = bloodSplatCount(count, source);
  if (splatCount <= 0 || x < camera.x - BLOOD_PHYSICS.fadeBehindCamera) {
    return;
  }
  const direction = signNonZero(dir);
  const surfaceX = enemy?.platform ? clamp(x, enemy.platform.x + 8, enemy.platform.x + enemy.platform.w - 8) : x;
  const surfaceY = enemy?.platform ? platformSurfaceY(enemy.platform, surfaceX) : enemy ? enemy.y + enemy.h : y + 38;
  const sourceScale = source === "gun" ? 0.72 : source === "kill" ? 0.82 : source === "ragdoll" ? 0.5 : 0.64;
  for (let i = 0; i < splatCount; i += 1) {
    const floorBias = Math.random() < (source === "gun" ? 0.5 : 0.58);
    const sx = x + (Math.random() - 0.5) * 7 + direction * Math.random() * 5;
    const bodyY = y + (Math.random() - 0.5) * 24;
    const sy = Math.min(bodyY, surfaceY - 14 - Math.random() * 16);
    const heavy = Math.random() < (source === "kill" ? 0.08 : 0.03);
    const sizeScale = BLOOD_EFFECT.sizeScale * sourceScale;
    const launch = floorBias ? 0.58 : 0.82;
    const maxLife = BLOOD_EFFECT.maxLife;
    const alpha = 0.44 + Math.random() * 0.18;
    bloodSplatters.push({
      x: sx,
      y: sy,
      w: ((heavy ? 2.6 : 1.35) + Math.random() * (heavy ? 1.9 : 1.3)) * sizeScale,
      h: ((heavy ? 1.9 : 1.05) + Math.random() * (heavy ? 1.4 : 0.9)) * sizeScale,
      angle: Math.random() * Math.PI,
      color: BLOOD_EFFECT.colors[Math.floor(Math.random() * BLOOD_EFFECT.colors.length)],
      alpha,
      baseAlpha: alpha,
      drip: 0,
      outline: false,
      vx: (direction * (58 + Math.random() * 78) + (Math.random() - 0.5) * 85) * sourceScale * launch,
      vy: -(115 + Math.random() * (floorBias ? 150 : 230)) * sourceScale,
      spin: (Math.random() - 0.5) * 7,
      settled: false,
      bounces: 0,
      age: 0,
      life: maxLife,
      maxLife
    });
  }
  if (bloodSplatters.length > BLOOD_EFFECT.maxSplats) {
    bloodSplatters.splice(0, bloodSplatters.length - BLOOD_EFFECT.maxSplats);
  }
}

function findBloodLandingSurface(x, fromY, toY) {
  let best = null;
  for (const platform of platforms) {
    if (x < platform.x - 6 || x > platform.x + platform.w + 6) {
      continue;
    }
    const surfaceY = platformSurfaceY(platform, x);
    if (fromY <= surfaceY + 3 && toY >= surfaceY - 2 && (!best || surfaceY < best.y)) {
      best = { platform, y: surfaceY };
    }
  }
  return best;
}

function settleBloodSplat(splat, landing) {
  const slopeAngle = isSlopePlatform(landing.platform)
    ? Math.atan2(landing.platform.slopeEndY - landing.platform.slopeStartY, landing.platform.w)
    : 0;
  splat.y = landing.y - Math.max(0.5, splat.h * 0.25);
  splat.vx = 0;
  splat.vy = 0;
  splat.spin = 0;
  splat.settled = true;
  splat.angle = slopeAngle + (Math.random() - 0.5) * 0.42;
  splat.w *= 1.08;
  splat.h *= 0.78;
}

function updateBloodSplatters(dt) {
  let activeCount = 0;
  for (const splat of bloodSplatters) {
    splat.age += dt;
    splat.life = (splat.life ?? BLOOD_EFFECT.maxLife) - dt;
    if (!splat.settled) {
      activeCount += 1;
      if (activeCount > BLOOD_PHYSICS.maxActive) {
        splat.settled = true;
        splat.vx = 0;
        splat.vy = 0;
      } else {
        const previousY = splat.y;
        splat.vy += BLOOD_PHYSICS.gravity * dt;
        splat.vx *= Math.pow(BLOOD_PHYSICS.airDrag, dt * 60);
        splat.x += splat.vx * dt;
        splat.y += splat.vy * dt;
        splat.angle += splat.spin * dt;

        const landing = splat.vy >= 0 ? findBloodLandingSurface(splat.x, previousY, splat.y + splat.h) : null;
        if (landing) {
          const speed = Math.hypot(splat.vx, splat.vy);
          if (speed > 260 && splat.bounces < 1 && Math.random() < 0.45) {
            splat.y = landing.y - Math.max(0.5, splat.h * 0.25);
            splat.vy = -Math.abs(splat.vy) * BLOOD_PHYSICS.bounceDamp;
            splat.vx *= BLOOD_PHYSICS.slideDamp;
            splat.bounces += 1;
          } else {
            settleBloodSplat(splat, landing);
          }
        } else if (splat.age > 1.2 && Math.abs(splat.vx) < BLOOD_PHYSICS.settleSpeed * 0.2 && Math.abs(splat.vy) < BLOOD_PHYSICS.settleSpeed) {
          splat.settled = true;
        } else if (splat.y > WORLD.floorKillY + 240) {
          splat.settled = true;
          splat.vx = 0;
          splat.vy = 0;
        }
      }
    }

    const movedOn = splat.x < player.x - BLOOD_PHYSICS.fadeBehindPlayer || splat.x < camera.x - BLOOD_PHYSICS.fadeBehindCamera;
    if (movedOn) {
      splat.life = Math.min(splat.life, 0.18);
      splat.alpha = Math.max(0, splat.alpha - BLOOD_PHYSICS.fadeRate * dt);
    } else {
      const lifeFade = clamp(splat.life / Math.max(0.001, splat.maxLife || BLOOD_EFFECT.maxLife), 0, 1);
      splat.alpha = Math.min(splat.alpha, (splat.baseAlpha || 0.5) * lifeFade);
    }
  }
  const cullX = camera.x - BLOOD_PHYSICS.fadeBehindCamera;
  bloodSplatters = bloodSplatters.filter((splat) => splat.alpha > 0.02 && splat.life > 0 && splat.x > cullX);
  if (bloodSplatters.length > BLOOD_EFFECT.maxSplats) {
    bloodSplatters.splice(0, bloodSplatters.length - BLOOD_EFFECT.maxSplats);
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.life -= dt;
    p.vy += 900 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  const cullX = camera.x - 120;
  particles = particles.filter((p) => p.life > 0 && p.x > cullX);
}

function updateRain(dt) {
  for (const drop of rain) {
    drop.x -= drop.speed * 0.18 * dt;
    drop.y += drop.speed * dt;
    if (drop.y > canvasState.height + 60) {
      drop.y = -60;
      drop.x = Math.random() * canvasState.width + 80;
    }
    if (drop.x < -80) {
      drop.x = canvasState.width + 80;
    }
  }
}

function updateCamera(dt) {
  camera.targetX = clamp(player.x - canvasState.width * 0.36, 0, Math.max(0, WORLD.levelEndX - canvasState.width));
  camera.targetY = clamp(player.y - canvasState.height * 0.58, 80, 430);
  camera.x += (camera.targetX - camera.x) * Math.min(1, dt * 6.5);
  camera.y += (camera.targetY - camera.y) * Math.min(1, dt * 4.8);
  shake = Math.max(0, shake - dt * 26);
}

function updateFrameSmoothingMotion() {
  const screenPlayerX = player.x - camera.x;
  const screenPlayerY = player.y - camera.y;
  if (!frameSmoothing.initialized) {
    frameSmoothing.initialized = true;
    frameSmoothing.lastCameraX = camera.x;
    frameSmoothing.lastCameraY = camera.y;
    frameSmoothing.lastPlayerX = screenPlayerX;
    frameSmoothing.lastPlayerY = screenPlayerY;
    return;
  }

  const cameraMotionX = frameSmoothing.lastCameraX - camera.x;
  const cameraMotionY = frameSmoothing.lastCameraY - camera.y;
  const playerMotionX = screenPlayerX - frameSmoothing.lastPlayerX;
  const playerMotionY = screenPlayerY - frameSmoothing.lastPlayerY;
  frameSmoothing.motionX = clamp((cameraMotionX + playerMotionX * 0.35) * canvasState.dpr, -18, 18);
  frameSmoothing.motionY = clamp((cameraMotionY + playerMotionY * 0.35) * canvasState.dpr, -14, 14);
  frameSmoothing.lastCameraX = camera.x;
  frameSmoothing.lastCameraY = camera.y;
  frameSmoothing.lastPlayerX = screenPlayerX;
  frameSmoothing.lastPlayerY = screenPlayerY;
}

function makeFrameCanvas() {
  const frame = document.createElement("canvas");
  frame.width = canvas.width;
  frame.height = canvas.height;
  return frame;
}

function blendTemporalFrames() {
  if (!frameSmoothing.enabled || canvas.width === 0 || canvas.height === 0) {
    return;
  }

  const captureCtx = frameSmoothing.capture.getContext("2d");
  captureCtx.setTransform(1, 0, 0, 1, 0, 0);
  captureCtx.clearRect(0, 0, frameSmoothing.capture.width, frameSmoothing.capture.height);
  captureCtx.drawImage(canvas, 0, 0);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = "blur(0.7px)";
  const fallbackX = player.facing * 0.65 * canvasState.dpr;
  const fallbackY = (player.vy < 0 ? -0.35 : 0.35) * canvasState.dpr;
  const motionX = Math.abs(frameSmoothing.motionX) > 0.05 ? frameSmoothing.motionX : fallbackX;
  const motionY = Math.abs(frameSmoothing.motionY) > 0.05 ? frameSmoothing.motionY : fallbackY;
  ctx.globalAlpha = frameSmoothing.opacity;
  for (let i = 0; i < frameSmoothing.history.length; i += 1) {
    const age = i + 1;
    ctx.drawImage(frameSmoothing.history[i], -motionX * age, -motionY * age);
  }
  for (let i = 1; i <= frameSmoothing.futureFrames; i += 1) {
    ctx.drawImage(frameSmoothing.capture, motionX * i, motionY * i);
  }
  ctx.globalAlpha = frameSmoothing.opacity * 0.62;
  ctx.drawImage(frameSmoothing.capture, 0.65 * canvasState.dpr, 0);
  ctx.drawImage(frameSmoothing.capture, -0.65 * canvasState.dpr, 0);
  ctx.drawImage(frameSmoothing.capture, 0, 0.65 * canvasState.dpr);
  ctx.drawImage(frameSmoothing.capture, 0, -0.65 * canvasState.dpr);
  ctx.globalAlpha = 0.28;
  ctx.filter = "contrast(1.35) saturate(1.08)";
  ctx.drawImage(frameSmoothing.capture, 0, 0);
  ctx.restore();

  const storedFrame = frameSmoothing.history.length >= frameSmoothing.historyLimit ? frameSmoothing.history.pop() : makeFrameCanvas();
  if (storedFrame.width !== canvas.width || storedFrame.height !== canvas.height) {
    storedFrame.width = canvas.width;
    storedFrame.height = canvas.height;
  }
  storedFrame.getContext("2d").drawImage(frameSmoothing.capture, 0, 0);
  frameSmoothing.history.unshift(storedFrame);
}

function render() {
  const w = canvasState.width;
  const h = canvasState.height;
  ctx.setTransform(canvasState.dpr, 0, 0, canvasState.dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  drawBackground(w, h);

  const effectiveShake = CONTROL.comfortFx ? shake * 0.45 : shake;
  const sx = (Math.random() - 0.5) * effectiveShake;
  const sy = (Math.random() - 0.5) * effectiveShake;
  ctx.save();
  ctx.translate(Math.round(-camera.x + sx), Math.round(-camera.y + sy));
  drawWorld();
  drawBloodSplatters();
  drawPowerCubes();
  drawPickups();
  drawBullets(playerBullets);
  drawBullets(enemyBullets);
  drawFinaleCrowd();
  drawEnemies();
  drawPlayer();
  drawCarriedRagdollShield();
  drawParticles();
  drawDashArc();
  drawReticle();
  ctx.restore();

  drawRain();
  blendTemporalFrames();
  drawUI();
  drawFinaleOverlay(w, h);
  drawBonusClashOverlay(w, h);
  drawBossMimicOverlay(w, h);
}

function drawBackground(w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#020408");
  sky.addColorStop(0.28, "#071017");
  sky.addColorStop(0.68, "#10161b");
  sky.addColorStop(1, "#191b1e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawClouds(w, h);
  drawAtmosphere(w, h);
  drawBirds(w, h);
  drawRooftopTrafficLayer(w, h);
  drawElevatedSubwayLayer(w, h);
  drawRealCityLayer(0.08, 220, 130, 0.34, "#091018", "#0d1720", 0.1);
  drawRealCityLayer(0.2, 185, 210, 0.55, "#101820", "#18222b", 0.18);
  drawRealCityLayer(0.42, 150, 305, 0.82, "#1b2027", "#29313a", 0.34);
  drawWetReflections(w, h);

  const lowerFog = ctx.createLinearGradient(0, h * 0.48, 0, h);
  lowerFog.addColorStop(0, "rgba(172, 194, 206, 0)");
  lowerFog.addColorStop(0.58, "rgba(172, 194, 206, 0.045)");
  lowerFog.addColorStop(1, "rgba(5, 8, 10, 0.34)");
  ctx.fillStyle = lowerFog;
  ctx.fillRect(0, 0, w, h);
}

function hash01(value) {
  const x = Math.sin(value * 127.1 + 91.7) * 43758.5453;
  return x - Math.floor(x);
}

function hashRange(value, min, max) {
  return min + hash01(value) * (max - min);
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function drawRooftopTrafficLayer(w, h) {
  ctx.save();
  ctx.globalAlpha = 0.34;
  for (let lane = 0; lane < 3; lane += 1) {
    const parallax = 0.09 + lane * 0.07;
    const y = h * (0.34 + lane * 0.13) + Math.sin(time * 0.4 + lane) * 8;
    const speed = 34 + lane * 18;
    const spacing = 420 - lane * 42;
    const offset = positiveModulo(time * speed - camera.x * parallax + lane * 137, spacing);
    for (let i = -1; i < w / spacing + 3; i += 1) {
      const seed = i + lane * 31 + Math.floor(camera.x * parallax / spacing);
      const x = offset + i * spacing + hashRange(seed + 0.2, -40, 40);
      if (hash01(seed + 0.5) > 0.66) {
        drawRooftopDrone(x, y + hashRange(seed + 0.7, -26, 22), seed, lane);
      } else {
        drawRooftopCableCar(x, y + hashRange(seed + 0.9, -18, 18), seed, lane);
      }
    }
  }
  ctx.restore();
}

function drawRooftopDrone(x, y, seed, lane) {
  const pulse = 0.5 + Math.sin(time * 5 + seed) * 0.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(77, 247, 255, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(18, 0);
  ctx.moveTo(0, -10);
  ctx.lineTo(0, 10);
  ctx.stroke();
  ctx.fillStyle = "rgba(9, 14, 18, 0.78)";
  ctx.fillRect(-11, -7, 22, 14);
  ctx.fillStyle = lane === 2 ? "rgba(255, 209, 102, 0.5)" : "rgba(77, 247, 255, 0.5)";
  ctx.fillRect(-3, -2, 6 + pulse * 4, 4);
  ctx.restore();
}

function drawRooftopCableCar(x, y, seed, lane) {
  const sway = Math.sin(time * 1.7 + seed) * 3;
  ctx.save();
  ctx.translate(x, y + sway);
  ctx.strokeStyle = "rgba(155, 171, 176, 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-90, -30 - sway);
  ctx.lineTo(92, -34 + sway);
  ctx.stroke();
  ctx.fillStyle = "rgba(10, 15, 19, 0.76)";
  ctx.fillRect(-34, -18, 68, 24);
  ctx.strokeStyle = lane === 1 ? "rgba(255, 209, 102, 0.3)" : "rgba(77, 247, 255, 0.28)";
  ctx.strokeRect(-34, -18, 68, 24);
  ctx.fillStyle = "rgba(77, 247, 255, 0.14)";
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(-24 + i * 18, -11, 10, 8);
  }
  ctx.restore();
}

function drawElevatedSubwayLayer(w, h) {
  const railY = h * 0.5 + Math.sin(time * 0.22) * 5;
  const parallax = 0.18;
  const railOffset = -positiveModulo(camera.x * parallax, 96);
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "rgba(155, 171, 176, 0.22)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, railY);
  ctx.lineTo(w, railY + 8);
  ctx.moveTo(0, railY + 22);
  ctx.lineTo(w, railY + 30);
  ctx.stroke();
  ctx.fillStyle = "rgba(8, 12, 16, 0.44)";
  for (let x = railOffset - 120; x < w + 140; x += 96) {
    ctx.save();
    ctx.translate(x, railY + 18);
    ctx.rotate(0.06);
    ctx.fillRect(-34, 0, 68, 6);
    ctx.restore();
  }

  const cycle = 7.6 + hashRange(levelSeed * 0.01, 0, 2.2);
  const phase = positiveModulo(time + hashRange(levelSeed * 0.02, 0, cycle), cycle);
  const duration = 2.7;
  if (phase < duration) {
    const progress = phase / duration;
    const trainW = w * 0.92;
    const trainH = Math.max(58, h * 0.085);
    const dir = Math.floor(time / cycle) % 2 === 0 ? -1 : 1;
    const trainX = dir < 0
      ? w + 60 - progress * (w + trainW + 120)
      : -trainW - 60 + progress * (w + trainW + 120);
    drawElevatedSubwayTrain(trainX, railY - trainH - 4, trainW, trainH, dir);
  }

  ctx.restore();
}

function drawElevatedSubwayTrain(x, y, w, h, dir) {
  ctx.save();
  ctx.globalAlpha = 0.74;
  ctx.fillStyle = "#151c22";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(4, 7, 10, 0.56)";
  ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
  ctx.fillStyle = "rgba(255, 209, 102, 0.24)";
  ctx.fillRect(x + (dir < 0 ? w - 72 : 32), y + 9, 46, 9);
  ctx.strokeStyle = "rgba(237, 247, 251, 0.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  for (let i = 0; i < 13; i += 1) {
    const wx = x + 58 + i * (w - 126) / 13;
    const ww = Math.max(18, w * 0.032);
    const pulse = 0.55 + Math.sin(time * 7 + i * 1.6) * 0.32;
    ctx.fillStyle = `rgba(77, 247, 255, ${0.12 + pulse * 0.18})`;
    ctx.fillRect(wx, y + h * 0.2, ww, h * 0.33);
    if (i % 4 === 2) {
      ctx.fillStyle = "rgba(2, 5, 8, 0.5)";
      ctx.beginPath();
      ctx.arc(wx + ww * 0.52 + Math.sin(time * 5 + i) * 2, y + h * 0.33, Math.max(3, h * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#edf7fb";
  for (let i = 0; i < 6; i += 1) {
    ctx.fillRect(x + hashRange(i * 17 + time, 0, w), y + hashRange(i * 31, 8, h - 8), w * 0.08, 2);
  }
  ctx.restore();
}

function drawSubwayTunnelBack(w, h) {
  ctx.save();
  const centerY = h * 0.48 + Math.sin(time * 0.18) * 3;
  const arch = ctx.createRadialGradient(w * 0.5, centerY, h * 0.08, w * 0.5, centerY, h * 0.86);
  arch.addColorStop(0, "rgba(77, 247, 255, 0.08)");
  arch.addColorStop(0.34, "rgba(28, 43, 49, 0.42)");
  arch.addColorStop(0.72, "rgba(3, 6, 8, 0.72)");
  arch.addColorStop(1, "rgba(0, 0, 0, 0.94)");
  ctx.fillStyle = arch;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(129, 151, 158, 0.08)";
  ctx.lineWidth = 2;
  const archSpacing = 260;
  const offset = -positiveModulo(camera.x * 0.07, archSpacing);
  for (let x = offset - archSpacing; x < w + archSpacing; x += archSpacing) {
    ctx.beginPath();
    ctx.ellipse(x + archSpacing * 0.5, h * 0.55, 150, h * 0.46, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSubwayWallLayer(w, h, parallax, tileW, alpha) {
  const offset = -positiveModulo(camera.x * parallax, tileW);
  const y = h * (0.24 + parallax * 0.5) + camera.y * parallax * 0.12;
  const wallH = h * (0.34 + parallax * 0.28);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = parallax < 0.15 ? "#0b1418" : "#162026";
  ctx.fillRect(0, y, w, wallH);

  ctx.strokeStyle = "rgba(155, 171, 176, 0.11)";
  ctx.lineWidth = 1;
  for (let x = offset - tileW; x < w + tileW; x += tileW) {
    const seed = Math.floor((camera.x * parallax) / tileW) + Math.floor(x / tileW) + Math.floor(parallax * 1000);
    const flicker = 0.62 + Math.max(0, Math.sin(time * (4.2 + parallax * 5) + seed)) * 0.34;
    ctx.strokeRect(x, y, tileW, wallH);
    ctx.fillStyle = hash01(seed + 0.4) > 0.64 ? `rgba(255, 209, 102, ${0.11 + flicker * 0.12})` : `rgba(77, 247, 255, ${0.08 + flicker * 0.1})`;
    ctx.fillRect(x + tileW * 0.12, y + 18, tileW * 0.44, 3);
    ctx.fillStyle = `rgba(237, 247, 251, ${0.035 + flicker * 0.055})`;
    ctx.fillRect(x + 8, y + wallH - 18, tileW - 16, 2);
    if (hash01(seed + 0.9) > 0.54) {
      drawSubwayPoster(x + tileW * 0.58, y + wallH * 0.16, tileW * 0.26, wallH * 0.42, seed);
    }
    if (hash01(seed + 1.3) > 0.7) {
      drawSubwaySign(x + tileW * 0.16, y + wallH * 0.65, tileW * 0.58, seed);
    }
  }

  ctx.fillStyle = "rgba(77, 247, 255, 0.08)";
  ctx.fillRect(0, y + wallH - 5, w, 2);
  ctx.restore();
}

function drawSubwayPoster(x, y, w, h, seed) {
  ctx.save();
  const pulse = 0.5 + Math.sin(time * 2.2 + seed) * 0.5;
  const scanY = y + positiveModulo(time * 28 + seed * 11, h);
  ctx.fillStyle = "rgba(5, 8, 10, 0.8)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = hash01(seed) > 0.5 ? "rgba(255, 209, 102, 0.42)" : "rgba(77, 247, 255, 0.38)";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = `rgba(237, 247, 251, ${0.12 + pulse * 0.12})`;
  ctx.fillRect(x + 8, y + 8, w - 16, 4);
  ctx.fillRect(x + 8, y + 18, w * 0.58, 3);
  ctx.fillStyle = hash01(seed + 0.7) > 0.5 ? `rgba(255, 48, 79, ${0.18 + pulse * 0.14})` : `rgba(77, 247, 255, ${0.15 + pulse * 0.12})`;
  ctx.fillRect(x + 8, y + h * 0.46, w - 16, h * 0.22);
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.fillRect(x + 4, scanY, w - 8, 2);
  ctx.restore();
}

function drawSubwaySign(x, y, w, seed) {
  ctx.save();
  const pulse = 0.55 + Math.sin(time * 3.4 + seed * 0.7) * 0.45;
  const scroll = positiveModulo(time * 34 + seed * 17, w - 18);
  ctx.fillStyle = "rgba(2, 5, 7, 0.86)";
  ctx.strokeStyle = `rgba(255, 209, 102, ${0.26 + pulse * 0.22})`;
  ctx.fillRect(x, y, w, 22);
  ctx.strokeRect(x, y, w, 22);
  ctx.fillStyle = hash01(seed) > 0.5 ? "#ffd166" : "#4df7ff";
  ctx.fillRect(x + 8, y + 8, w * 0.24, 3);
  ctx.fillStyle = `rgba(237, 247, 251, ${0.18 + pulse * 0.2})`;
  ctx.fillRect(x + w * 0.38, y + 8, w * 0.38, 3);
  ctx.fillStyle = "rgba(77, 247, 255, 0.35)";
  ctx.fillRect(x + 9 + scroll, y + 15, 10, 2);
  ctx.restore();
}

function drawMovingSubwayTrains(w, h) {
  for (let lane = 0; lane < 3; lane += 1) {
    const cycle = 9.5 + lane * 3.4 + hashRange(lane + levelSeed * 0.01, 0, 3.5);
    const duration = 2.3 + lane * 0.38;
    const phase = positiveModulo(time + hashRange(lane + 18.7, 0, cycle), cycle);
    if (phase > duration) {
      continue;
    }
    const progress = phase / duration;
    const dir = lane % 2 === 0 ? -1 : 1;
    const trainW = w * (1.04 + lane * 0.12);
    const trainH = h * (0.13 + lane * 0.018);
    const y = h * (0.38 + lane * 0.105);
    const x = dir < 0
      ? w + 80 - progress * (w + trainW + 180)
      : -trainW - 80 + progress * (w + trainW + 180);
    drawSubwayTrain(x, y, trainW, trainH, dir, lane);
  }
}

function drawSubwayTrain(x, y, w, h, dir, lane) {
  ctx.save();
  const blur = lane === 0 ? 0 : 0.4;
  ctx.globalAlpha = 0.48 + lane * 0.13;
  ctx.fillStyle = lane === 1 ? "#202831" : "#151c22";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(4, 7, 10, 0.62)";
  ctx.fillRect(x, y + h * 0.76, w, h * 0.24);
  ctx.fillStyle = "rgba(255, 209, 102, 0.2)";
  ctx.fillRect(x + (dir < 0 ? w - 68 : 28), y + 10, 40, 10);
  for (let i = 0; i < 12; i += 1) {
    const wx = x + 72 + i * (w - 140) / 12;
    const windowPulse = 0.58 + Math.sin(time * 7 + i * 1.7 + lane) * 0.28;
    const ww = Math.max(18, w * 0.035);
    ctx.fillStyle = `rgba(77, 247, 255, ${0.16 + windowPulse * 0.15})`;
    ctx.fillRect(wx, y + h * 0.2, ww, h * 0.34);
    if (i % 3 === (lane % 3)) {
      const riderShift = Math.sin(time * 5 + i) * 2;
      ctx.fillStyle = "rgba(2, 5, 8, 0.58)";
      ctx.beginPath();
      ctx.arc(wx + ww * 0.5 + riderShift, y + h * 0.32, Math.max(3, h * 0.055), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(wx + ww * 0.48 + riderShift, y + h * 0.38, Math.max(3, ww * 0.16), h * 0.14);
    }
    if (i % 4 === 1) {
      ctx.fillStyle = "rgba(237, 247, 251, 0.08)";
      const doorOpen = Math.max(0, Math.sin(time * 2 + lane + i));
      ctx.fillRect(wx + ww + 5, y + h * 0.18, 2 + doorOpen * 5, h * 0.52);
    }
  }
  ctx.strokeStyle = "rgba(237, 247, 251, 0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.13 + blur);
  ctx.lineTo(x + w, y + h * 0.13 - blur);
  ctx.moveTo(x, y + h * 0.7);
  ctx.lineTo(x + w, y + h * 0.7);
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#edf7fb";
  for (let streak = 0; streak < 8; streak += 1) {
    ctx.fillRect(x + hashRange(streak + lane * 22, 0, w), y + hashRange(streak + lane * 41, 8, h - 12), w * 0.08, 2);
  }
  ctx.restore();
}

function drawSubwayCommuterLoop(w, h) {
  const platformY = h * 0.64;
  ctx.save();
  ctx.fillStyle = "rgba(5, 8, 10, 0.38)";
  ctx.fillRect(0, platformY + 6, w, 5);
  ctx.globalAlpha = 0.5;
  for (let layer = 0; layer < 2; layer += 1) {
    const count = 6 + layer * 3;
    const speed = 18 + layer * 15;
    const parallax = 0.12 + layer * 0.05;
    const dir = layer % 2 === 0 ? 1 : -1;
    for (let i = 0; i < count; i += 1) {
      const seed = i * 19.7 + layer * 103;
      const laneW = w + 260;
      const loop = positiveModulo(time * speed * dir - camera.x * parallax + seed * 67, laneW);
      const x = dir > 0 ? loop - 130 : w + 130 - loop;
      const y = platformY + hashRange(seed + 0.2, -18, 18) + layer * 18;
      const pace = time * (6.8 + hashRange(seed + 0.5, -1.2, 1.8)) + seed;
      const alert = Math.max(0, Math.sin(time * 0.7 + seed));
      drawTinyCommuter(x, y, dir, pace, alert, layer);
    }
  }
  ctx.restore();
}

function drawTinyCommuter(x, y, dir, pace, alert, layer) {
  const bob = Math.sin(pace) * 2.5;
  const stride = Math.sin(pace);
  const scale = layer === 0 ? 0.86 : 1.04;
  const accent = alert > 0.82 ? "#ffd166" : layer === 0 ? "#4df7ff" : "#c66bff";
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  ctx.strokeStyle = layer === 0 ? "rgba(5, 10, 13, 0.82)" : "rgba(10, 14, 18, 0.92)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.fillStyle = accent;
  ctx.globalAlpha *= layer === 0 ? 0.72 : 0.86;
  ctx.beginPath();
  ctx.arc(0, -32, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(dir * 2, -9);
  ctx.moveTo(dir * 2, -20);
  ctx.lineTo(dir * (10 + stride * 4), -14);
  ctx.moveTo(dir * -1, -19);
  ctx.lineTo(dir * (-9 + stride * 2), -13);
  ctx.moveTo(dir * 2, -9);
  ctx.lineTo(dir * (8 + stride * 7), 0);
  ctx.moveTo(dir * 1, -9);
  ctx.lineTo(dir * (-8 - stride * 7), 0);
  ctx.stroke();
  if (alert > 0.9) {
    ctx.strokeStyle = "rgba(255, 209, 102, 0.34)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -32, 11, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBackgroundFightLoop(w, h) {
  const spacing = 390;
  const offset = -positiveModulo(camera.x * 0.16, spacing);
  const baseY = h * 0.58 + Math.sin(time * 0.4) * 3;
  ctx.save();
  ctx.globalAlpha = 0.62;
  for (let i = -1; i < w / spacing + 3; i += 1) {
    const seed = Math.floor(camera.x * 0.16 / spacing) + i * 13;
    if (hash01(seed + 0.1) < 0.18) {
      continue;
    }
    const x = offset + i * spacing + hashRange(seed + 0.2, -42, 48) + Math.sin(time * 1.2 + seed) * 14;
    const y = baseY + hashRange(seed + 0.4, -34, 28);
    drawBackgroundFightPair(x, y, seed);
  }
  ctx.restore();
}

function drawBackgroundFightPair(x, y, seed) {
  const phase = positiveModulo(time * (1.85 + hashRange(seed, -0.25, 0.42)) + seed, 2.2) / 2.2;
  const swing = Math.sin(phase * Math.PI * 2);
  const hit = Math.max(0, Math.sin((phase - 0.18) * Math.PI * 2));
  const dodge = Math.sin(phase * Math.PI * 4 + seed) * 5;
  drawTinyFighter(x - 24 - hit * 3, y + dodge, 1, swing, "#071116", "#4df7ff", 1.18);
  drawTinyFighter(x + 28 + hit * 14, y + hit * 5 - dodge * 0.5, -1, -swing, "#16080d", "#ff304f", 1.18);
  if (hit > 0.72) {
    ctx.fillStyle = "rgba(255, 209, 102, 0.42)";
    ctx.beginPath();
    ctx.arc(x + 4, y - 36, 10 + hit * 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTinyFighter(x, y, dir, swing, bodyColor, accent, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.fillStyle = accent;
  ctx.globalAlpha *= 0.92;
  ctx.beginPath();
  ctx.arc(0, -42, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(0, -33);
  ctx.lineTo(dir * 4, -10);
  ctx.moveTo(dir * 2, -24);
  ctx.lineTo(dir * (22 + swing * 12), -27 + swing * 4);
  ctx.moveTo(dir * -2, -20);
  ctx.lineTo(dir * -15, -14 - swing * 2);
  ctx.moveTo(dir * 4, -10);
  ctx.lineTo(dir * 17, 0);
  ctx.moveTo(dir * 3, -10);
  ctx.lineTo(dir * -12, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBasementFightLoops() {
  for (const platform of platforms) {
    if (platform.kind !== "secretArena") {
      continue;
    }
    drawBasementFightLoop(platform);
  }
}

function drawBasementFightLoop(platform) {
  const frame = Math.floor((time * 60) % 430);
  const loop = frame / 430;
  const floorY = platform.y - 6;
  const left = platform.x + 120;
  const groups = 5;
  ctx.save();
  ctx.fillStyle = "rgba(3, 5, 8, 0.42)";
  ctx.fillRect(platform.x + 28, platform.y - 142, platform.w - 56, 136);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(platform.x + 30, platform.y - 140, platform.w - 60, 132);
  ctx.fillStyle = "rgba(255, 209, 102, 0.2)";
  ctx.fillRect(platform.x + 50, platform.y - 126, 180, 4);
  ctx.fillStyle = "rgba(77, 247, 255, 0.16)";
  ctx.fillRect(platform.x + platform.w - 250, platform.y - 126, 130, 4);

  for (let i = 0; i < groups; i += 1) {
    const seed = platform.x * 0.01 + i * 23;
    const x = left + i * ((platform.w - 240) / Math.max(1, groups - 1));
    const stagger = positiveModulo(loop + i * 0.137, 1);
    const beat = Math.sin(stagger * Math.PI * 2);
    const hit = Math.max(0, Math.sin((stagger * Math.PI * 2) - 0.9));
    const duck = Math.max(0, Math.sin((stagger * Math.PI * 2) + 1.4));
    const y = floorY + hashRange(seed + 0.2, -5, 5);
    const spread = 32 + hit * 18 + Math.sin(stagger * Math.PI * 4) * 4;
    const scale = 1.22 + hashRange(seed + 0.4, -0.08, 0.12);
    drawBasementFighter(x - spread, y + duck * 5, 1, beat, hit, scale, "#4df7ff");
    drawBasementFighter(x + spread, y + hit * 6, -1, -beat, duck * 0.7, scale, "#ff304f");
    if (hit > 0.72) {
      ctx.fillStyle = "rgba(255, 209, 102, 0.32)";
      ctx.beginPath();
      ctx.arc(x + Math.sin(stagger * Math.PI * 2) * 8, y - 58, 9 + hit * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawBasementFighter(x, y, dir, beat, hit, scale, accent) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "rgba(4, 7, 10, 0.92)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.fillStyle = accent;
  const bob = Math.sin(beat * Math.PI) * 2;
  ctx.beginPath();
  ctx.arc(0, -52 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -43 + bob);
  ctx.lineTo(dir * (4 + hit * 5), -16 + bob);
  ctx.moveTo(dir * 2, -35 + bob);
  ctx.lineTo(dir * (25 + hit * 18), -34 + beat * 7);
  ctx.moveTo(dir * -1, -32 + bob);
  ctx.lineTo(dir * (-18 + beat * 5), -23 - hit * 4);
  ctx.moveTo(dir * 4, -16 + bob);
  ctx.lineTo(dir * (17 + beat * 8), 0);
  ctx.moveTo(dir * 2, -16 + bob);
  ctx.lineTo(dir * (-14 - beat * 7), 0);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 209, 102, 0.2)";
  ctx.lineWidth = 2;
  if (hit > 0.6) {
    ctx.beginPath();
    ctx.moveTo(dir * 24, -39 + beat * 7);
    ctx.lineTo(dir * 42, -48 + beat * 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSubwayTrackLayer(w, h) {
  ctx.save();
  const baseY = h * 0.74;
  const drift = -positiveModulo(camera.x * 0.34, 72);
  const pulseDrift = positiveModulo(time * 120 - camera.x * 0.12, w + 180) - 90;
  ctx.fillStyle = "rgba(3, 5, 6, 0.72)";
  ctx.fillRect(0, baseY, w, h - baseY);
  ctx.strokeStyle = "rgba(155, 171, 176, 0.3)";
  ctx.lineWidth = 3;
  for (let rail = 0; rail < 3; rail += 1) {
    const y = baseY + rail * 34;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + rail * 4);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(110, 118, 120, 0.18)";
  for (let x = drift - 80; x < w + 120; x += 72) {
    ctx.save();
    ctx.translate(x, baseY + 28);
    ctx.rotate(0.05);
    ctx.fillRect(-24, 0, 48, 5);
    ctx.restore();
  }
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "rgba(77, 247, 255, 0.12)";
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(pulseDrift - i * 220, baseY + 9 + i * 25, 120, 2);
  }
  ctx.restore();
}

function drawSubwayAtmosphere(w, h) {
  ctx.save();
  const glowX = w * 0.5 - positiveModulo(camera.x * 0.03, w * 0.32);
  const glow = ctx.createRadialGradient(glowX, h * 0.34, 20, glowX, h * 0.34, h * 0.8);
  glow.addColorStop(0, "rgba(77, 247, 255, 0.1)");
  glow.addColorStop(0.45, "rgba(255, 209, 102, 0.032)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 5; i += 1) {
    const y = h * (0.2 + i * 0.12) - positiveModulo(camera.y * 0.02 + time * (5 + i), 40);
    const haze = ctx.createLinearGradient(0, y - 20, 0, y + 28);
    haze.addColorStop(0, "rgba(157, 181, 193, 0)");
    haze.addColorStop(0.5, i % 2 ? "rgba(157, 181, 193, 0.08)" : "rgba(77, 247, 255, 0.045)");
    haze.addColorStop(1, "rgba(157, 181, 193, 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, y, w, 28);
  }
  ctx.restore();
}

function drawClouds(w, h) {
  const driftTime = time + lastFrame * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let layer = 0; layer < 3; layer += 1) {
    const parallax = 0.035 + layer * 0.035;
    const spacing = 310 - layer * 32;
    const yBase = h * (0.1 + layer * 0.115) + camera.y * parallax * 0.18;
    const offset = -positiveModulo(camera.x * parallax - driftTime * (7 + layer * 5), spacing);
    const alpha = 0.055 + layer * 0.026;
    for (let i = -2; i < w / spacing + 4; i += 1) {
      const seed = i + layer * 71 + Math.floor(camera.x * parallax / spacing);
      const x = offset + i * spacing + hashRange(seed + 0.2, -34, 34);
      const y = yBase + hashRange(seed + 0.4, -20, 26);
      const scale = hashRange(seed + 0.6, 0.8, 1.55) * (1 + layer * 0.12);
      drawCloudBank(x, y, scale, alpha, seed);
    }
  }
  ctx.restore();
}

function drawCloudBank(x, y, scale, alpha, seed) {
  const gradient = ctx.createLinearGradient(x, y - 34 * scale, x, y + 32 * scale);
  gradient.addColorStop(0, `rgba(148, 169, 181, ${alpha * 1.2})`);
  gradient.addColorStop(0.58, `rgba(83, 104, 119, ${alpha})`);
  gradient.addColorStop(1, "rgba(27, 37, 47, 0)");
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 18 * scale;
  ctx.shadowColor = `rgba(77, 247, 255, ${alpha * 0.35})`;
  ctx.beginPath();
  for (let lobe = 0; lobe < 6; lobe += 1) {
    const lx = x + (lobe - 2.5) * 35 * scale + hashRange(seed + lobe * 1.4, -10, 10) * scale;
    const ly = y + Math.sin(lobe + seed) * 7 * scale;
    const rx = hashRange(seed + lobe * 2.1, 38, 70) * scale;
    const ry = hashRange(seed + lobe * 2.7, 12, 26) * scale;
    ctx.ellipse(lx, ly, rx, ry, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawBirds(w, h) {
  const driftTime = time + lastFrame * 0.001;
  ctx.save();
  ctx.strokeStyle = "rgba(4, 8, 12, 0.82)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (let flock = 0; flock < 4; flock += 1) {
    const speed = 18 + flock * 7;
    const parallax = 0.045 + flock * 0.018;
    const baseX = positiveModulo(driftTime * speed - camera.x * parallax + flock * 240, w + 260) - 130;
    const baseY = h * hashRange(flock + 12.4, 0.12, 0.34) + Math.sin(driftTime * 0.7 + flock) * 12;
    const count = 4 + Math.floor(hashRange(flock + 18.3, 0, 4));
    for (let i = 0; i < count; i += 1) {
      const bx = baseX - i * hashRange(flock + i * 3.2, 14, 28);
      const by = baseY + (i % 2 === 0 ? -1 : 1) * hashRange(flock + i * 4.1, 4, 16);
      const size = hashRange(flock + i * 5.8, 4, 7);
      const flap = Math.sin(driftTime * 5.2 + i + flock) * 1.2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx - size, by - size * 0.7 - flap, bx - size * 2, by + flap);
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + size, by - size * 0.7 + flap, bx + size * 2, by - flap);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawAtmosphere(w, h) {
  const glowX = w * 0.72 - positiveModulo(camera.x * 0.018, w * 0.18);
  const glow = ctx.createRadialGradient(glowX, h * 0.24, 20, glowX, h * 0.24, h * 0.85);
  glow.addColorStop(0, "rgba(77, 247, 255, 0.12)");
  glow.addColorStop(0.42, "rgba(77, 247, 255, 0.035)");
  glow.addColorStop(1, "rgba(77, 247, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = 0.24;
  for (let band = 0; band < 5; band += 1) {
    const y = h * (0.12 + band * 0.11) - positiveModulo(camera.y * (0.02 + band * 0.004), 46);
    const drift = -positiveModulo(camera.x * (0.035 + band * 0.012), 360);
    const fog = ctx.createLinearGradient(0, y - 18, 0, y + 34);
    fog.addColorStop(0, "rgba(157, 181, 193, 0)");
    fog.addColorStop(0.5, band % 2 ? "rgba(157, 181, 193, 0.09)" : "rgba(77, 247, 255, 0.055)");
    fog.addColorStop(1, "rgba(157, 181, 193, 0)");
    ctx.fillStyle = fog;
    for (let x = drift - 360; x < w + 420; x += 360) {
      ctx.fillRect(x, y, 260 + band * 28, 20 + band * 5);
    }
  }
  ctx.restore();
}

function drawRealCityLayer(parallax, spacing, heightBase, opacity, nearColor, sideColor, windowAlpha) {
  const w = canvasState.width;
  const h = canvasState.height;
  const offset = -positiveModulo(camera.x * parallax, spacing);
  const baseY = h - 82 + camera.y * parallax * 0.18;
  ctx.save();
  ctx.globalAlpha = opacity;

  for (let i = -2; i < w / spacing + 5; i += 1) {
    const seed = Math.floor((camera.x * parallax) / spacing) + i + Math.floor(parallax * 1000);
    const bx = offset + i * spacing + hashRange(seed + 0.1, -20, 18);
    const bw = hashRange(seed + 0.2, spacing * 0.42, spacing * 0.88);
    const bh = heightBase + hashRange(seed + 0.3, 20, heightBase * 0.92);
    const by = baseY - bh;
    const depth = hashRange(seed + 0.4, 8, 22);

    const face = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    face.addColorStop(0, nearColor);
    face.addColorStop(0.72, sideColor);
    face.addColorStop(1, "#070a0d");
    ctx.fillStyle = face;
    ctx.fillRect(bx, by, bw, bh + 130);

    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.moveTo(bx + bw, by + depth);
    ctx.lineTo(bx + bw + depth, by + depth * 1.6);
    ctx.lineTo(bx + bw + depth, by + bh + 130);
    ctx.lineTo(bx + bw, by + bh + 130);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(160, 180, 188, 0.08)";
    ctx.fillRect(bx, by, bw, 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
    ctx.fillRect(bx + bw * 0.08, by + 8, bw * 0.84, 2);

    drawBuildingWindows(bx, by, bw, bh, seed, windowAlpha, parallax);
    drawRoofDetails(bx, by, bw, bh, seed, parallax);
  }
  ctx.restore();
}

function drawBuildingWindows(x, y, w, h, seed, alpha, parallax) {
  const cols = Math.max(3, Math.floor(w / hashRange(seed + 3.1, 16, 24)));
  const rows = Math.max(4, Math.floor(h / hashRange(seed + 3.2, 18, 28)));
  const padX = Math.min(12, w * 0.12);
  const padY = 16;
  const cellW = (w - padX * 2) / cols;
  const cellH = (h - padY * 2) / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const lit = hash01(seed * 31 + row * 7.7 + col * 13.1 + Math.floor(camera.x * parallax * 0.006)) > 0.58;
      const wx = x + padX + col * cellW + cellW * 0.24;
      const wy = y + padY + row * cellH + cellH * 0.26;
      const ww = Math.max(2, cellW * 0.34);
      const wh = Math.max(3, cellH * 0.28);
      ctx.fillStyle = lit
        ? (hash01(seed + row + col) > 0.78 ? `rgba(255, 209, 102, ${alpha + 0.16})` : `rgba(77, 247, 255, ${alpha})`)
        : "rgba(2, 5, 7, 0.34)";
      ctx.fillRect(wx, wy, ww, wh);
      if (lit && alpha > 0.25) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(wx, wy, ww, 1);
      }
    }
  }
}

function drawRoofDetails(x, y, w, h, seed, parallax) {
  ctx.fillStyle = "rgba(3, 5, 7, 0.74)";
  const unitCount = 1 + Math.floor(hashRange(seed + 8.1, 0, 3));
  for (let i = 0; i < unitCount; i += 1) {
    const ux = x + hashRange(seed + i * 2.3, w * 0.08, w * 0.78);
    const uw = hashRange(seed + i * 2.4, 10, 26);
    const uh = hashRange(seed + i * 2.5, 5, 13);
    ctx.fillRect(ux, y - uh, uw, uh);
  }
  if (hash01(seed + 9.2) > 0.55) {
    const ax = x + w * hashRange(seed + 9.3, 0.18, 0.82);
    const antennaH = hashRange(seed + 9.4, 28, 70) * (parallax + 0.55);
    ctx.strokeStyle = "rgba(119, 142, 153, 0.44)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax, y);
    ctx.lineTo(ax + hashRange(seed + 9.5, -4, 4), y - antennaH);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 48, 79, 0.34)";
    ctx.fillRect(ax - 1, y - antennaH - 2, 2, 2);
  }
}

function drawWetReflections(w, h) {
  ctx.save();
  const y = h * 0.63;
  const sheen = ctx.createLinearGradient(0, y, 0, h);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0)");
  sheen.addColorStop(0.3, "rgba(77, 247, 255, 0.035)");
  sheen.addColorStop(1, "rgba(255, 209, 102, 0.04)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, y, w, h - y);

  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 18; i += 1) {
    const seed = i * 17.3;
    const rx = positiveModulo(hashRange(seed, 0, w) - camera.x * 0.06, w + 220) - 110;
    const ry = h * hashRange(seed + 0.4, 0.68, 0.96);
    const rw = hashRange(seed + 0.8, 34, 160);
    ctx.fillStyle = hash01(seed + 1.2) > 0.6 ? "rgba(77, 247, 255, 0.08)" : "rgba(255, 48, 79, 0.055)";
    ctx.fillRect(rx, ry, rw, 1);
    ctx.fillRect(rx + rw * 0.18, ry + 4, rw * 0.5, 1);
  }
  ctx.restore();
}

function drawWorld() {
  for (const platform of platforms) {
    drawPlatform(platform);
  }
  drawBasementFightLoops();
  drawCheckpoints();
}

function drawCaveShell(p) {
  const shell = p.caveShell || {};
  const left = shell.left ?? p.x - 46;
  const right = shell.right ?? p.x + p.w + 54;
  const top = shell.top ?? p.y - 270;
  const entranceY = shell.entranceY ?? p.y;
  const exitY = shell.exitY ?? p.y;
  const mid = top + (Math.max(entranceY, exitY) - top) * 0.5;
  const bottom = shell.bottom ?? p.y + p.h + 26;
  const mouth = right - 96;

  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(125, 134, 140, 0.4)";
  ctx.fillStyle = "#60666c";
  ctx.beginPath();
  ctx.moveTo(left + 78, bottom);
  ctx.lineTo(left + 20, entranceY - 38);
  ctx.quadraticCurveTo(left + 6, mid, left + 46, top + 76);
  ctx.quadraticCurveTo(left + 96, top + 18, left + 162, top);
  ctx.quadraticCurveTo(left + 288, top + 40, mouth - 10, top + 72);
  ctx.quadraticCurveTo(right - 10, top + 126, right - 20, mid + 44);
  ctx.lineTo(right + 14, bottom);
  ctx.lineTo(left + 78, bottom);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a1118";
  ctx.beginPath();
  ctx.moveTo(left + 112, entranceY + 1);
  ctx.lineTo(left + 78, entranceY - 42);
  ctx.quadraticCurveTo(left + 56, mid + 8, left + 86, top + 96);
  ctx.quadraticCurveTo(left + 130, top + 48, left + 178, top + 38);
  ctx.quadraticCurveTo(left + 292, top + 72, mouth - 34, top + 100);
  ctx.quadraticCurveTo(right - 54, top + 150, right - 54, mid + 72);
  ctx.lineTo(right - 4, bottom - 6);
  ctx.lineTo(left + 112, bottom - 6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(left + 68, entranceY - 22, 78, 116, 0.05, -Math.PI * 0.52, Math.PI * 0.52);
  ctx.lineTo(left + 10, entranceY + 86);
  ctx.lineTo(left + 10, entranceY - 132);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#8a9095";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(left + 28, entranceY - 44);
  ctx.quadraticCurveTo(left + 8, mid, left + 46, top + 76);
  ctx.quadraticCurveTo(left + 96, top + 18, left + 162, top);
  ctx.quadraticCurveTo(left + 288, top + 40, mouth - 10, top + 72);
  ctx.quadraticCurveTo(right - 10, top + 126, right - 20, mid + 44);
  ctx.stroke();

  ctx.strokeStyle = "rgba(77, 247, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x + 38, p.y + 15);
  ctx.lineTo(Math.min(right - 120, p.x + p.w - 28), p.y + 15);
  ctx.stroke();
  ctx.restore();
}

function drawCaveSlopePlatform(p) {
  const topLeft = p.slopeStartY;
  const topRight = p.slopeEndY;
  const bottom = Math.max(topLeft, topRight) + (p.slopeThickness || 92);
  ctx.save();
  ctx.fillStyle = "#3d4349";
  ctx.beginPath();
  ctx.moveTo(p.x, topLeft);
  ctx.lineTo(p.x + p.w, topRight);
  ctx.lineTo(p.x + p.w, bottom);
  ctx.lineTo(p.x, bottom);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#242a30";
  ctx.beginPath();
  ctx.moveTo(p.x + 18, topLeft + 22);
  ctx.lineTo(p.x + p.w + 18, topRight + 22);
  ctx.lineTo(p.x + p.w + 18, bottom + 18);
  ctx.lineTo(p.x + 18, bottom + 18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#8a9095";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p.x, topLeft);
  ctx.lineTo(p.x + p.w, topRight);
  ctx.stroke();

  ctx.strokeStyle = "rgba(77, 247, 255, 0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x + 42, topLeft + 15);
  ctx.lineTo(p.x + p.w - 50, topRight + 15);
  ctx.stroke();

  ctx.fillStyle = "rgba(237, 247, 251, 0.12)";
  for (let i = 0; i < 9; i += 1) {
    const t = (i + 0.35) / 9;
    const x = p.x + p.w * t;
    const y = platformSurfaceY(p, x) + 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(topRight - topLeft, p.w));
    ctx.fillRect(-18, 0, 36, 2);
    ctx.restore();
  }
  ctx.restore();
}

function drawThemeSetPiece(p) {
  if (!p.theme || p.streamRole !== "main" || p.w < 520 || p.kind === "routeBlocker") {
    return;
  }
  const name = p.theme.name;
  if (name === "CRANES") {
    drawCraneTheme(p);
  } else if (name === "RADIO TOWERS") {
    drawRadioTheme(p);
  } else if (name === "SKYWAYS") {
    drawSkywayTheme(p);
  } else {
    drawRooftopTheme(p);
  }
}

function drawCraneTheme(p) {
  const baseX = p.x + clamp(p.w * (0.62 + hashRange(p.x, -0.08, 0.08)), 260, p.w - 170);
  const mastH = clamp(p.w * 0.18, 86, 154);
  const armW = clamp(p.w * 0.33, 190, 330);
  const color = p.theme.color;
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 122, 48, 0.36)";
  ctx.beginPath();
  ctx.moveTo(baseX, p.y + 5);
  ctx.lineTo(baseX, p.y - mastH);
  ctx.lineTo(baseX + armW, p.y - mastH + 18);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 209, 102, 0.28)";
  for (let i = 0; i < 6; i += 1) {
    const x = baseX + i * (armW / 6);
    ctx.beginPath();
    ctx.moveTo(x, p.y - mastH + 1);
    ctx.lineTo(x + armW / 8, p.y - mastH + 20);
    ctx.stroke();
  }
  const hookX = baseX + armW * (0.72 + Math.sin(time * 0.7 + p.x) * 0.04);
  ctx.strokeStyle = `${color}88`;
  ctx.beginPath();
  ctx.moveTo(hookX, p.y - mastH + 14);
  ctx.lineTo(hookX, p.y - mastH + 58);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(hookX + 4, p.y - mastH + 65, 9, Math.PI * 0.25, Math.PI * 1.45);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 122, 48, 0.2)";
  ctx.fillRect(baseX - 22, p.y - 42, 44, 42);
  ctx.restore();
}

function drawRadioTheme(p) {
  const mastX = p.x + clamp(p.w * (0.5 + hashRange(p.y, -0.12, 0.12)), 190, p.w - 160);
  const mastH = clamp(p.w * 0.16, 90, 168);
  const color = p.theme.color;
  ctx.save();
  ctx.strokeStyle = "rgba(198, 107, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mastX, p.y);
  ctx.lineTo(mastX, p.y - mastH);
  ctx.lineTo(mastX - 36, p.y - 18);
  ctx.moveTo(mastX, p.y - mastH);
  ctx.lineTo(mastX + 42, p.y - 18);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(77, 247, 255, 0.28)";
  for (let i = 0; i < 4; i += 1) {
    const y = p.y - 30 - i * 28;
    ctx.beginPath();
    ctx.moveTo(mastX - 24, y);
    ctx.lineTo(mastX + 24, y - 6);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.28 + Math.sin(time * 2 + p.x) * 0.08;
  for (let r = 30; r <= 86; r += 28) {
    ctx.beginPath();
    ctx.arc(mastX, p.y - mastH + 8, r, -0.55, 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mastX, p.y - mastH + 8, r, Math.PI - 0.55, Math.PI + 0.55);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSkywayTheme(p) {
  const railY = p.y - 38;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 209, 102, 0.34)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x + 38, railY);
  ctx.lineTo(p.x + p.w - 42, railY + Math.sin(p.x * 0.01) * 6);
  ctx.stroke();
  ctx.strokeStyle = "rgba(77, 247, 255, 0.22)";
  ctx.lineWidth = 2;
  for (let x = p.x + 54; x < p.x + p.w - 58; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x, railY);
    ctx.lineTo(x + 20, p.y - 2);
    ctx.stroke();
  }
  const signX = p.x + p.w * 0.18;
  ctx.fillStyle = "rgba(5, 9, 12, 0.8)";
  ctx.strokeStyle = "rgba(255, 209, 102, 0.38)";
  ctx.fillRect(signX, p.y - 64, 150, 32);
  ctx.strokeRect(signX, p.y - 64, 150, 32);
  ctx.fillStyle = "rgba(255, 209, 102, 0.5)";
  ctx.fillRect(signX + 12, p.y - 52, 70, 4);
  ctx.fillStyle = "rgba(77, 247, 255, 0.34)";
  ctx.fillRect(signX + 92, p.y - 52, 38, 4);
  ctx.restore();
}

function drawRooftopTheme(p) {
  const unitCount = p.w > 900 ? 3 : 2;
  ctx.save();
  for (let i = 0; i < unitCount; i += 1) {
    const x = p.x + p.w * (0.35 + i * 0.16) + hashRange(p.x + i, -18, 18);
    const w = 46 + hashRange(p.y + i, 0, 22);
    const h = 22 + hashRange(p.x - i, 0, 12);
    ctx.fillStyle = "rgba(13, 19, 24, 0.78)";
    ctx.fillRect(x, p.y - h, w, h);
    ctx.fillStyle = "rgba(77, 247, 255, 0.2)";
    ctx.fillRect(x + 7, p.y - h + 7, w - 14, 3);
    ctx.fillStyle = "rgba(237, 247, 251, 0.16)";
    ctx.fillRect(x + 8, p.y - h - 5, w * 0.55, 4);
  }
  if (p.w > 760) {
    const tankX = p.x + p.w - 145;
    ctx.strokeStyle = "rgba(77, 247, 255, 0.26)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tankX, p.y);
    ctx.lineTo(tankX + 18, p.y - 58);
    ctx.moveTo(tankX + 62, p.y);
    ctx.lineTo(tankX + 44, p.y - 58);
    ctx.stroke();
    ctx.fillStyle = "rgba(77, 247, 255, 0.09)";
    ctx.beginPath();
    ctx.ellipse(tankX + 31, p.y - 62, 36, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlatform(p) {
  const depth = p.kind === "lowceiling" ? 9 : 18;
  const blocker = p.kind === "routeBlocker";
  if (p.caveShell) {
    drawCaveShell(p);
  }
  if (isSlopePlatform(p)) {
    drawCaveSlopePlatform(p);
    return;
  }
  if (p.kind === "caveWall") {
    ctx.fillStyle = "#5d646b";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "rgba(8, 12, 16, 0.38)";
    ctx.fillRect(p.x + 4, p.y + 4, Math.max(0, p.w - 8), Math.max(0, p.h - 8));
    ctx.strokeStyle = "rgba(138, 144, 149, 0.72)";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
    return;
  }
  const caveFloor = p.kind === "cave" || p.kind === "caveFloor";
  const secret = p.kind === "secretArena" || p.kind === "secretWall";
  ctx.fillStyle = blocker ? "#1b2027" : caveFloor ? "#3d4349" : secret ? "#38353b" : p.kind === "jumpwall" ? "#252a30" : p.kind === "downhill" || p.kind === "chaseStart" ? "#343940" : "#31363d";
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = blocker ? "#12171d" : caveFloor ? "#242a30" : secret ? "#242126" : p.kind === "finaldeck" || p.kind === "bossgate" ? "#282234" : p.kind === "downhill" || p.kind === "chaseStart" ? "#262c31" : p.kind === "bossdeck" ? "#23282e" : "#242a31";
  ctx.fillRect(p.x + depth, p.y + p.h, p.w, depth);
  ctx.fillStyle = "#4a5059";
  ctx.fillRect(p.x, p.y, p.w, 5);
  ctx.fillStyle = "rgba(77, 247, 255, 0.2)";
  ctx.fillRect(p.x + 18, p.y + 10, Math.min(120, p.w - 36), 2);
  if (blocker) {
    ctx.fillStyle = "rgba(255, 48, 79, 0.18)";
    for (let x = p.x + 12; x < p.x + p.w - 12; x += 38) {
      ctx.fillRect(x, p.y + 10, 22, 3);
    }
  }
  if (p.kind === "downhill") {
    ctx.fillStyle = "rgba(255, 209, 102, 0.12)";
    for (let x = p.x + 24; x < p.x + p.w - 12; x += 54) {
      ctx.fillRect(x, p.y + 16, 28, 3);
    }
  }
  if (p.kind === "riskLane") {
    ctx.fillStyle = "rgba(255, 209, 102, 0.22)";
    ctx.fillRect(p.x + 12, p.y + 8, Math.max(0, p.w - 24), 3);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.55)";
    ctx.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
  } else if (p.theme?.color) {
    ctx.fillStyle = `${p.theme.color}33`;
    ctx.fillRect(p.x + Math.max(18, p.w - 170), p.y + 10, Math.min(130, p.w - 36), 2);
  }
  drawThemeSetPiece(p);
  if (secret) {
    ctx.fillStyle = "rgba(255, 122, 48, 0.18)";
    for (let x = p.x + 20; x < p.x + p.w - 20; x += 64) {
      ctx.fillRect(x, p.y + 14, 34, 3);
    }
  }
  if (p.kind === "tunnel" || p.kind === "bossdeck" || p.kind === "finaldeck" || p.kind === "bossgate") {
    ctx.fillStyle = "rgba(255, 209, 102, 0.18)";
    ctx.fillRect(p.x + p.w - 120, p.y + 14, 70, 3);
  }
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
}

function drawCheckpoints() {
  for (const checkpoint of checkpoints) {
    const glow = checkpoint === activeCheckpoint ? "#ffd166" : "#4df7ff";
    ctx.save();
    ctx.shadowBlur = checkpoint === activeCheckpoint ? 18 : 9;
    ctx.shadowColor = glow;
    ctx.strokeStyle = glow;
    ctx.fillStyle = checkpoint === activeCheckpoint ? "rgba(255, 209, 102, 0.18)" : "rgba(77, 247, 255, 0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(checkpoint.x, checkpoint.y);
    ctx.lineTo(checkpoint.x, checkpoint.y - 58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(checkpoint.x, checkpoint.y - 56);
    ctx.lineTo(checkpoint.x + 34, checkpoint.y - 46);
    ctx.lineTo(checkpoint.x, checkpoint.y - 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawPowerCubes() {
  for (const cube of powerCubes) {
    if (!cube.active) {
      continue;
    }
    const bob = Math.sin(time * 3.2 + cube.phase) * 4;
    const cx = cube.x + cube.w * 0.5;
    const cy = cube.baseY + cube.h * 0.5 + bob;
    const pulse = 0.5 + Math.sin(time * 5 + cube.phase) * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(time * 1.7 + cube.phase) * 0.12);
    ctx.shadowBlur = 22 + pulse * 16;
    ctx.shadowColor = "#b8fff3";
    ctx.strokeStyle = "#b8fff3";
    ctx.fillStyle = "rgba(77, 247, 255, 0.2)";
    ctx.lineWidth = 3;
    ctx.fillRect(-cube.w * 0.5, -cube.h * 0.5, cube.w, cube.h);
    ctx.strokeRect(-cube.w * 0.5, -cube.h * 0.5, cube.w, cube.h);
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-cube.w * 0.28, 0);
    ctx.lineTo(0, -cube.h * 0.3);
    ctx.lineTo(cube.w * 0.28, 0);
    ctx.lineTo(0, cube.h * 0.3);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.38 + pulse * 0.24;
    ctx.beginPath();
    ctx.arc(0, 0, cube.w * 0.82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBullets(list) {
  for (const bullet of list) {
    for (let i = 0; i < bullet.trail.length; i += 1) {
      const point = bullet.trail[i];
      ctx.globalAlpha = clamp(point.life / 0.18, 0, 1);
      ctx.fillStyle = bullet.color;
      ctx.fillRect(point.x - 8, point.y - 1, 16, 2);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 14;
    ctx.shadowColor = bullet.color;
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

function drawPickups() {
  for (const pickup of pickups) {
    ctx.save();
    const color = pickup.type === "weapon" ? weaponConfig(pickup.weaponType).color : pickup.type === "ammo" ? weaponConfig(pickup.weaponType || player.weaponType).color : pickup.type === "shield" ? "#b8fff3" : pickup.type === "grapple" ? "#ffd166" : "#ffd166";
    ctx.translate(pickup.x + pickup.w * 0.5, pickup.y + pickup.h * 0.5);
    ctx.rotate(pickup.spin);
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.fillStyle = pickup.type === "weapon" ? "rgba(255, 122, 48, 0.16)" : pickup.type === "ammo" ? "rgba(77, 247, 255, 0.16)" : pickup.type === "shield" ? "rgba(184, 255, 243, 0.2)" : pickup.type === "grapple" ? "rgba(255, 209, 102, 0.18)" : "rgba(255, 209, 102, 0.22)";
    ctx.lineWidth = 2;
    if (pickup.type === "weapon") {
      ctx.strokeRect(-pickup.w * 0.5, -pickup.h * 0.5, pickup.w, pickup.h);
      ctx.beginPath();
      ctx.moveTo(-pickup.w * 0.38, 0);
      ctx.lineTo(pickup.w * 0.4, 0);
      ctx.moveTo(pickup.w * 0.12, 0);
      ctx.lineTo(pickup.w * 0.24, pickup.h * 0.36);
      ctx.stroke();
    } else if (pickup.type === "ammo") {
      ctx.fillRect(-pickup.w * 0.5, -pickup.h * 0.5, pickup.w, pickup.h);
      ctx.strokeRect(-pickup.w * 0.5, -pickup.h * 0.5, pickup.w, pickup.h);
      ctx.beginPath();
      ctx.moveTo(-pickup.w * 0.16, -pickup.h * 0.45);
      ctx.lineTo(-pickup.w * 0.16, pickup.h * 0.45);
      ctx.stroke();
    } else if (pickup.type === "shield") {
      ctx.beginPath();
      ctx.moveTo(0, -pickup.h * 0.55);
      ctx.lineTo(pickup.w * 0.5, -pickup.h * 0.18);
      ctx.lineTo(pickup.w * 0.35, pickup.h * 0.42);
      ctx.lineTo(0, pickup.h * 0.58);
      ctx.lineTo(-pickup.w * 0.35, pickup.h * 0.42);
      ctx.lineTo(-pickup.w * 0.5, -pickup.h * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -pickup.h * 0.34);
      ctx.lineTo(0, pickup.h * 0.35);
      ctx.stroke();
    } else if (pickup.type === "grapple") {
      ctx.beginPath();
      ctx.arc(0, 0, pickup.w * 0.42, 0.2, Math.PI * 1.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -pickup.h * 0.48);
      ctx.lineTo(pickup.w * 0.42, -pickup.h * 0.12);
      ctx.lineTo(pickup.w * 0.18, pickup.h * 0.04);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pickup.h * 0.2);
      ctx.lineTo(0, pickup.h * 0.55);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, pickup.w * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -pickup.w * 0.32);
      ctx.lineTo(0, pickup.w * 0.32);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawFinaleCrowd() {
  if (finale.phase !== "chase" || !finale.crowd.length) {
    return;
  }
  const jumpProgress = 1 - clamp(finale.crowdJumpTimer / FINALE.crowdJumpDuration, 0, 1);
  const jumpFrame = Math.floor(jumpProgress * 60);
  for (const actor of finale.crowd) {
    const run = finale.chaseTimer * (58 + actor.lane * 5);
    const x = player.x - actor.offset + Math.min(180, run) + Math.sin(time * 7 + actor.phase) * 9;
    const baseY = player.y + player.h + 6 + actor.lane * 8;
    const actorProgress = clamp((jumpProgress - actor.jumpDelay) / 0.72, 0, 1);
    const jumpY = Math.sin(actorProgress * Math.PI) * (70 + actor.lane * 4);
    const y = baseY - jumpY;
    if (x < camera.x - 120 || x > camera.x + canvasState.width + 80) {
      continue;
    }
    const scale = 0.82 + actor.lane * 0.045;
    const stride = Math.sin((time * 11 + actor.phase) + jumpFrame * 0.09);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff304f";
    ctx.strokeStyle = "#ff304f";
    ctx.fillStyle = "#120509";
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -38, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(Math.sin(stride) * 5, -10);
    ctx.stroke();
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-12 - stride * 7, -13 + Math.abs(stride) * 4);
    ctx.moveTo(0, -23);
    ctx.lineTo(12 + stride * 7, -14 + Math.abs(stride) * 4);
    ctx.moveTo(Math.sin(stride) * 5, -10);
    ctx.lineTo(-10 + stride * 8, 4);
    ctx.moveTo(Math.sin(stride) * 5, -10);
    ctx.lineTo(10 - stride * 8, 4);
    ctx.stroke();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#ff304f";
    ctx.fillRect(-18, 4, 36, 3);
    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    if (isCarriedRagdoll(enemy)) {
      continue;
    }
    if (enemy.dead && !enemy.deathRagdoll) {
      continue;
    }
    if (!activeBossEnemy(enemy) && !enemyVisibleInCamera(enemy)) {
      continue;
    }
    drawEnemyHuman(enemy);
  }
}

function drawCarriedRagdollShield() {
  const shield = player.ragdollShield;
  if (!shield?.enemy) {
    return;
  }
  drawEnemyHuman(shield.enemy);
  const box = ragdollShieldHitbox();
  if (!box) {
    return;
  }
  const pulse = player.ragdollShieldFlash > 0 ? Math.sin(time * 34) * 0.5 + 0.5 : 0;
  ctx.save();
  ctx.globalAlpha = 0.34 + pulse * 0.36;
  ctx.strokeStyle = "#ffd166";
  ctx.shadowBlur = 12 + pulse * 14;
  ctx.shadowColor = "#ffd166";
  ctx.lineWidth = 2.4;
  ctx.strokeRect(box.x - 5, box.y - 5, box.w + 10, box.h + 10);
  ctx.restore();
}

function drawEnemyGun(shoulder, angle, color, length) {
  const grip = {
    x: shoulder.x + Math.cos(angle) * length * 0.38,
    y: shoulder.y + Math.sin(angle) * length * 0.38
  };
  const muzzle = {
    x: shoulder.x + Math.cos(angle) * length,
    y: shoulder.y + Math.sin(angle) * length
  };
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(grip.x, grip.y);
  ctx.stroke();
  ctx.strokeStyle = "#160609";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(grip.x, grip.y);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(grip.x, grip.y);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();
}

function drawEnemyWhip(hand, facing, scale, phase = 0) {
  const curl = Math.sin(time * 9 + phase);
  ctx.save();
  ctx.strokeStyle = "#ffd166";
  ctx.shadowBlur = 13;
  ctx.shadowColor = "#ffd166";
  ctx.lineWidth = Math.max(1.2, 2.2 * scale);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.bezierCurveTo(
    hand.x + facing * (24 + curl * 6) * scale,
    hand.y + (10 - curl * 4) * scale,
    hand.x + facing * (46 - curl * 8) * scale,
    hand.y + (22 + curl * 7) * scale,
    hand.x + facing * 68 * scale,
    hand.y + (12 + curl * 14) * scale
  );
  ctx.stroke();
  ctx.restore();
}

function drawEnemyPhysicsRagdoll(enemy, color) {
  const ragdoll = enemy.ragdoll;
  if (!ragdoll?.points) {
    return false;
  }
  const p = ragdoll.points;
  const widthScale = clamp(ragdoll.scale || 0.72, 0.55, 1.25);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;

  drawRagdollBodyHull(p, color, true);
  drawRagdollSegment(p.neck, p.chest, color, 8.4 * widthScale, 0.9);
  drawRagdollSegment(p.chest, p.hip, color, 10.2 * widthScale, 0.95);

  drawRagdollSegment(p.lShoulder, p.lElbow, color, 7.6 * widthScale, 0.72);
  drawRagdollSegment(p.lElbow, p.lHand, color, 7 * widthScale, 0.72);
  drawRagdollSegment(p.rShoulder, p.rElbow, color, 7.8 * widthScale, 0.9);
  drawRagdollSegment(p.rElbow, p.rHand, color, 7.2 * widthScale, 0.9);

  drawRagdollSegment(p.lHip, p.lKnee, color, 8.4 * widthScale, 0.74);
  drawRagdollSegment(p.lKnee, p.lFoot, color, 7.8 * widthScale, 0.74);
  drawRagdollSegment(p.rHip, p.rKnee, color, 8.6 * widthScale, 0.9);
  drawRagdollSegment(p.rKnee, p.rFoot, color, 8 * widthScale, 0.9);
  drawRagdollSegment(p.neck, p.head, color, 5.8 * widthScale, 0.9);

  for (const key of ["lShoulder", "rShoulder", "lElbow", "rElbow", "lHand", "rHand", "lHip", "rHip", "lKnee", "rKnee", "lFoot", "rFoot"]) {
    drawRagdollJoint(p[key], color, p[key].radius, key.includes("Hand") || key.includes("Foot") ? 0.78 : 0.58);
  }

  ctx.fillStyle = "#100509";
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, 3 * widthScale);
  ctx.beginPath();
  ctx.arc(p.head.x, p.head.y, p.head.radius || 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (enemy.deathAge < DEATH_RAGDOLL.bleedDuration) {
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#9c0822";
    ctx.lineWidth = Math.max(1.2, 1.8 * widthScale);
    ctx.beginPath();
    ctx.arc(p.hip.x, p.hip.y, 8 * widthScale + Math.sin((enemy.deathAge || 0) * 10) * 1.6 * widthScale, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (enemy.ragdollShieldEligible) {
    const pulse = 0.5 + Math.sin(time * 7 + enemy.ragdollPhase) * 0.5;
    ctx.globalAlpha = 0.48 + pulse * 0.28;
    ctx.strokeStyle = "#ffd166";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#ffd166";
    ctx.lineWidth = Math.max(1.3, 2 * widthScale);
    ctx.beginPath();
    ctx.arc(p.chest.x, p.chest.y, 18 * widthScale + pulse * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return true;
}

function drawEnemyDeathRagdoll(enemy, color, scale, centerX, footY) {
  if (drawEnemyPhysicsRagdoll(enemy, color)) {
    return;
  }
  const age = enemy.deathAge || 0;
  const phase = enemy.ragdollPhase || 0;
  const airborne = !enemy.grounded;
  const bodyAngle = (enemy.ragdollAngle || 0) + (airborne ? Math.sin(age * 11 + phase) * 0.22 : Math.sin(age * 4 + phase) * 0.06);
  const swing = (enemy.ragdollLimbSwing || 1.2) * (airborne ? 1 : 0.38);
  const midX = centerX;
  const midY = footY - (airborne ? 27 : 20) * scale;
  const torsoLen = 27 * scale;
  const ux = Math.sin(bodyAngle);
  const uy = Math.cos(bodyAngle);
  const shoulder = {
    x: midX - ux * torsoLen * 0.5,
    y: midY - uy * torsoLen * 0.5
  };
  const hip = {
    x: midX + ux * torsoLen * 0.5,
    y: midY + uy * torsoLen * 0.5
  };
  const head = {
    x: shoulder.x - ux * 13 * scale + Math.sin(age * 8 + phase) * 2 * scale,
    y: shoulder.y - uy * 13 * scale + Math.cos(age * 6 + phase) * 2 * scale
  };
  const loose = Math.sin(age * 13 + phase) * 0.5 * swing;
  const looseAlt = Math.cos(age * 11 + phase * 1.7) * 0.55 * swing;
  const sideX = Math.sin(bodyAngle + Math.PI * 0.5) * 3 * scale;
  const armA = bodyAngle + (airborne ? -1.7 : -1.15) + loose;
  const armB = bodyAngle + (airborne ? 1.55 : 1.05) + looseAlt;
  const legA = bodyAngle + (airborne ? -0.92 : -0.56) - looseAlt;
  const legB = bodyAngle + (airborne ? 0.96 : 0.42) - loose;

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.fillStyle = "#100509";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.globalAlpha = 0.5;
  drawLimb(shoulder.x - sideX, shoulder.y, armA, 12 * scale, 14 * scale, airborne ? 0.85 : 1.25, 1, color, 4.5 * scale);
  drawLimb(hip.x - sideX, hip.y, legA, 14 * scale, 15 * scale, airborne ? -0.75 : -1.05, 1, color, 5.2 * scale);
  ctx.globalAlpha = 1;

  ctx.lineWidth = 7 * scale;
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(hip.x, hip.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(head.x, head.y, 7.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawLimb(shoulder.x + sideX, shoulder.y + scale, armB, 12 * scale, 15 * scale, airborne ? -0.75 : -1.1, 1, color, 5.2 * scale);
  drawLimb(hip.x + sideX, hip.y, legB, 15 * scale, 16 * scale, airborne ? 0.75 : 1.05, 1, color, 5.8 * scale);

  if (enemy.deathAge < DEATH_RAGDOLL.bleedDuration) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#9c0822";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(hip.x, hip.y, 10 * scale + Math.sin(age * 10) * 2 * scale, 0, Math.PI * 1.5);
    ctx.stroke();
  }
  if (enemy.ragdollShieldEligible) {
    const pulse = 0.5 + Math.sin(time * 7 + phase) * 0.5;
    ctx.globalAlpha = 0.48 + pulse * 0.28;
    ctx.strokeStyle = "#ffd166";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#ffd166";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(shoulder.x, shoulder.y + 14 * scale, 19 * scale + pulse * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemyHuman(enemy) {
  const airDashActive = enemy.airStrafeTimer > 0;
  const alertColor = airDashActive ? "#ffd166" : enemy.type === "dummy" ? "#3047d6" : enemy.evilTwin ? "#4df7ff" : enemy.bonusBoss ? enemy.bonusColor : enemy.type === "finalBoss" ? "#c66bff" : enemy.type === "boss" ? "#ffd166" : enemy.type === "elite" ? "#ff7a30" : "#ff304f";
  const color = enemy.hurtFlash > 0 ? "#ffd166" : alertColor;
  const facing = enemy.facing || -1;
  const poseKey = enemy.meleeType === "kick" ? "kick" : enemy.meleeType === "punch" || enemy.meleeType === "elbow" || enemy.meleeType === "whip" || enemy.basementWhip ? "punch" : enemy.crouchTimer > 0 || enemy.aiState === "crouch" ? "crouch" : Math.abs(enemy.vx) > 28 ? "run" : "idle";
  const baseFrames = poseKey === "kick" ? PLAYER_KICK_FRAMES : poseKey === "punch" ? PLAYER_PUNCH_FRAMES : poseKey === "crouch" ? PLAYER_CROUCH_FRAMES : poseKey === "run" ? PLAYER_RUN_FRAMES : PLAYER_IDLE_FRAMES;
  const frames = baseFrames;
  const frame = frames[Math.floor(enemy.animFrame) % frames.length];
  const scale = enemy.type === "dummy" ? 0.96 : enemy.evilTwin ? 1.34 : enemy.type === "finalBoss" ? 1.65 : enemy.bonusBoss ? 1.42 : enemy.type === "boss" ? 1.32 : 0.92;
  const centerX = enemy.x + enemy.w * 0.5;
  const footY = enemy.y + enemy.h;
  const headDrop = (enemy.crouchTimer > 0 ? 9 : 0) * scale;
  const shoulder = {
    x: centerX,
    y: footY - 31 * scale + (frame.shoulderDrop || 0) * scale + headDrop * 0.45
  };
  const hip = {
    x: centerX - facing * frame.chest * 6 * scale,
    y: footY - 15 * scale + (frame.hipDrop || 0) * scale + headDrop * 0.35
  };
  const head = {
    x: centerX,
    y: footY - 43 * scale + frame.head * scale + headDrop
  };

  ctx.save();
  if (enemy.deathRagdoll) {
    drawEnemyDeathRagdoll(enemy, color, scale, centerX, footY);
    ctx.restore();
    return;
  }
  if (enemy.finaleRagdoll) {
    const pivotX = centerX;
    const pivotY = footY - 24 * scale;
    ctx.translate(pivotX, pivotY);
    ctx.rotate(enemy.ragdollAngle || 0);
    ctx.translate(-pivotX, -pivotY);
  }
  if (enemy.airStrafeEnemy && !airDashActive) {
    ctx.globalAlpha = 0.45 + Math.sin(time * 8) * 0.12;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff7a30";
    ctx.strokeStyle = "#ff7a30";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, footY - 4, 13 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (airDashActive) {
    ctx.shadowBlur = 22;
    ctx.shadowColor = "#ffd166";
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.72;
    const trailDir = -signNonZero(enemy.vx || enemy.facing);
    for (let i = 0; i < 5; i += 1) {
      const trailX = centerX + trailDir * (18 + i * 18) * scale;
      const trailY = footY - (18 + i * 5) * scale + Math.sin(time * 18 + i) * 4;
      ctx.globalAlpha = 0.5 - i * 0.07;
      ctx.beginPath();
      ctx.moveTo(trailX, trailY);
      ctx.lineTo(trailX + trailDir * 18 * scale, trailY + 8 * scale);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(centerX, footY - 28 * scale, 28 * scale, -0.4, Math.PI * 1.35);
    ctx.stroke();
  }
  if ((enemy.shield || 0) > 0) {
    const shieldRatio = clamp(enemy.shield / Math.max(1, enemy.maxShield || ELITE_TRAITS.shieldShots), 0, 1);
    ctx.globalAlpha = 0.28 + shieldRatio * 0.3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff7a30";
    ctx.strokeStyle = "#ff7a30";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, footY - 25 * scale, (27 + shieldRatio * 8) * scale, -Math.PI * 0.25, Math.PI * (1.35 + shieldRatio * 0.35));
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (enemy.type === "elite" && !enemy.eliteTakedown) {
    ctx.globalAlpha = 0.22 + Math.sin(time * 8) * 0.08;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, footY - 28 * scale, 23 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (enemy.pendingShot || enemy.burstShots > 0 || enemy.staggerTimer > 0) {
    const warningColor = enemy.staggerTimer > 0 ? "#ffd166" : enemy.type === "elite" || enemy.bonusBoss ? "#ff7a30" : "#ff304f";
    const warningPulse = 0.55 + Math.sin(time * 18 + (enemy.ragdollPhase || 0)) * 0.25;
    ctx.globalAlpha = enemy.staggerTimer > 0 ? 0.48 : warningPulse;
    ctx.strokeStyle = warningColor;
    ctx.fillStyle = warningColor;
    ctx.lineWidth = 2.4 * scale;
    ctx.beginPath();
    ctx.arc(centerX, head.y - 18 * scale, (7 + warningPulse * 3) * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `900 ${12 * scale}px Segoe UI, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(enemy.staggerTimer > 0 ? "!" : ">", centerX, head.y - 18 * scale);
    ctx.globalAlpha = 1;
  }

  ctx.shadowBlur = airDashActive ? 28 : 18;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.fillStyle = enemy.type === "dummy" ? "#050923" : enemy.evilTwin ? "#071015" : "#13090c";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 7 * scale;
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(hip.x, hip.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(head.x, head.y, 7.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 0.58;
  drawLimb(shoulder.x - facing * 3 * scale, shoulder.y + 2 * scale, frame.backArm, 10 * scale, 12 * scale, 0.2, facing, color, 4.2 * scale);
  drawLimb(hip.x - facing * 3 * scale, hip.y, frame.backLeg, 12 * scale, 13 * scale, frame.kneeBack, facing, color, 5.2 * scale);
  ctx.globalAlpha = 1;
  drawLimb(hip.x + facing * 3 * scale, hip.y, frame.frontLeg, 12 * scale, 13 * scale, frame.kneeFront, facing, color, 5.8 * scale);
  if (enemy.meleeType === "kick") {
    drawLimb(hip.x + facing * 3 * scale, hip.y, frame.kickLeg ?? 1.1, 18 * scale * (frame.kickReach || 1), 18 * scale * (frame.kickReach || 1), frame.kickBend ?? -0.08, facing, "#ffd166", 7 * scale);
    drawLimb(shoulder.x + facing * 4 * scale, shoulder.y + scale, frame.frontArm * 0.72, 10 * scale, 11 * scale, -0.12, facing, color, 4.2 * scale);
  } else if (enemy.meleeType === "elbow") {
    drawLimb(shoulder.x + facing * 3 * scale, shoulder.y + scale, (frame.punchArm ?? 1.2) - 0.42, 9 * scale * (frame.punchReach || 1), 10 * scale * (frame.punchReach || 1), 0.92, facing, "#b8fff3", 6.4 * scale);
  } else if (enemy.meleeType === "punch") {
    drawLimb(shoulder.x + facing * 3 * scale, shoulder.y + scale, frame.punchArm ?? 1.2, 13 * scale * (frame.punchReach || 1), 17 * scale * (frame.punchReach || 1), frame.punchBend ?? 0.05, facing, color, 5.8 * scale);
  } else if (enemy.basementWhip || enemy.meleeType === "whip") {
    const hand = drawLimb(shoulder.x + facing * 3 * scale, shoulder.y + scale, (frame.punchArm ?? 1.2) + Math.sin(time * 8 + (enemy.ragdollPhase || 0)) * 0.18, 13 * scale, 17 * scale, frame.punchBend ?? 0.05, facing, "#ffd166", 5.8 * scale);
    drawEnemyWhip(hand, facing, scale, enemy.ragdollPhase || 0);
  } else if (enemy.type === "dummy") {
    drawLimb(shoulder.x + facing * 3 * scale, shoulder.y + scale, frame.frontArm, 10 * scale, 11 * scale, -0.05, facing, color, 4.2 * scale);
  } else {
    drawEnemyGun({ x: shoulder.x + facing * 3 * scale, y: shoulder.y + scale }, enemy.aimAngle, color, enemy.evilTwin ? 44 : enemy.type === "finalBoss" ? 54 : enemy.bonusBoss ? 48 : enemy.type === "boss" ? 43 : 32);
  }

  if (enemy.alert > 0.4) {
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, head.y, 18 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  if (!enemy.dead) {
    drawEnemyHealth(enemy);
  }
  ctx.restore();
}

function drawEnemyHealth(enemy) {
  if (enemy.maxHp <= 1) {
    return;
  }
  const pct = clamp(enemy.hp / enemy.maxHp, 0, 1);
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(enemy.x, enemy.y - 10, enemy.w, 4);
  ctx.fillStyle = enemy.type === "dummy" ? "#3047d6" : enemy.evilTwin ? "#4df7ff" : enemy.bonusBoss ? enemy.bonusColor : enemy.type === "finalBoss" ? "#c66bff" : enemy.type === "boss" ? "#ffd166" : "#ff304f";
  ctx.fillRect(enemy.x, enemy.y - 10, enemy.w * pct, 4);
  if ((enemy.maxShield || 0) > 0) {
    const shieldPct = clamp((enemy.shield || 0) / enemy.maxShield, 0, 1);
    ctx.fillStyle = "rgba(255, 122, 48, 0.22)";
    ctx.fillRect(enemy.x, enemy.y - 16, enemy.w, 3);
    ctx.fillStyle = "#ff7a30";
    ctx.fillRect(enemy.x, enemy.y - 16, enemy.w * shieldPct, 3);
  }
  if (enemy.bonusBoss) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 10px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = enemy.bonusColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = enemy.bonusColor;
    ctx.fillText(enemy.bonusBossName, enemy.x + enemy.w * 0.5, enemy.y - 25);
    ctx.restore();
  }
}

function drawLimb(x, y, angle, upper, lower, bend, facing, color, width = 6) {
  const elbow = {
    x: x + Math.sin(angle) * upper * facing,
    y: y + Math.cos(angle) * upper
  };
  const hand = {
    x: elbow.x + Math.sin(angle + bend) * lower * facing,
    y: elbow.y + Math.cos(angle + bend) * lower
  };
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(elbow.x, elbow.y);
  ctx.lineTo(hand.x, hand.y);
  ctx.stroke();
  return hand;
}

function playerUsesVisualRagdoll() {
  return !!player.ragdoll && player.deathRagdoll;
}

function drawRagdollSegment(a, b, color, width, alpha = 1) {
  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = previousAlpha * alpha;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.82)";
  ctx.lineWidth = width + 7;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.strokeStyle = "#05090b";
  ctx.lineWidth = width + 3;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.6, width * 0.28);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.globalAlpha = previousAlpha;
}

function drawRagdollJoint(point, color, radius = point.radius || 4, alpha = 1) {
  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = previousAlpha * alpha;
  ctx.fillStyle = "#05090b";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = previousAlpha;
}

function drawRagdollBodyHull(p, color, deadRagdoll) {
  const previousAlpha = ctx.globalAlpha;
  ctx.globalAlpha = previousAlpha * (deadRagdoll ? 0.78 : 0.95);
  ctx.fillStyle = deadRagdoll ? "#130307" : "#030608";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(p.lShoulder.x, p.lShoulder.y);
  ctx.lineTo(p.rShoulder.x, p.rShoulder.y);
  ctx.lineTo(p.rHip.x, p.rHip.y);
  ctx.lineTo(p.lHip.x, p.lHip.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = previousAlpha;
}

function drawPlayerPhysicsRagdoll(glow, flicker, deadRagdoll) {
  const ragdoll = player.ragdoll;
  if (!ragdoll) {
    return false;
  }
  const p = ragdoll.points;
  const bodyAlpha = flicker ? 0.38 : 1;
  ctx.globalAlpha = bodyAlpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = deadRagdoll ? 12 : 20;
  ctx.shadowColor = glow;

  drawRagdollBodyHull(p, glow, deadRagdoll);
  drawRagdollSegment(p.neck, p.chest, glow, 8.4, 0.92);
  drawRagdollSegment(p.chest, p.hip, glow, 10.4, 0.96);

  drawRagdollSegment(p.lShoulder, p.lElbow, glow, 7.8, deadRagdoll ? 0.74 : 0.92);
  drawRagdollSegment(p.lElbow, p.lHand, glow, 7.2, deadRagdoll ? 0.72 : 0.92);
  drawRagdollSegment(p.rShoulder, p.rElbow, glow, 8.2, 1);
  drawRagdollSegment(p.rElbow, p.rHand, glow, 7.6, 1);

  drawRagdollSegment(p.lHip, p.lKnee, glow, 8.8, deadRagdoll ? 0.72 : 0.9);
  drawRagdollSegment(p.lKnee, p.lFoot, glow, 8.2, deadRagdoll ? 0.72 : 0.9);
  drawRagdollSegment(p.rHip, p.rKnee, glow, 9.2, 1);
  drawRagdollSegment(p.rKnee, p.rFoot, glow, 8.6, 1);

  drawRagdollSegment(p.neck, p.head, glow, 6.2, 0.95);
  for (const key of ["lShoulder", "rShoulder", "lElbow", "rElbow", "lHand", "rHand", "lHip", "rHip", "lKnee", "rKnee", "lFoot", "rFoot"]) {
    drawRagdollJoint(p[key], glow, p[key].radius, key.includes("Hand") || key.includes("Foot") ? 0.92 : 0.7);
  }
  ctx.fillStyle = "#020405";
  ctx.strokeStyle = glow;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(p.head.x, p.head.y, deadRagdoll ? 7.8 : 7.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (!deadRagdoll && !player.ledge && player.ledgeClimbTimer <= 0) {
    const weaponHand = player.facing >= 0 ? p.rHand : p.lHand;
    if (player.reloadTimer > 0) {
      drawReloadGun(weaponHand, glow, player.facing || 1);
    } else {
      drawAimedGun(weaponHand, glow);
    }
  }

  ctx.globalAlpha = 1;
  return true;
}

function drawAimedGun(shoulder, color) {
  const angle = player.aimAngle;
  const weapon = weaponConfig();
  const s = playerWeaponScale();
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const perp = { x: -Math.sin(angle), y: Math.cos(angle) };
  const clearLength = gunClearLength(shoulder, dir, weapon.length * s + 10, 5);
  const tucked = clearLength < weapon.length * s * 0.72;
  const barrelLength = Math.max(4 * s, Math.min(weapon.length * s, Math.max(0, clearLength - 2)));
  const stockLength = player.weaponType === "pistol" ? 6 : 17;
  const stockEnd = {
    x: shoulder.x - dir.x * stockLength * s + perp.x * 2 * s,
    y: shoulder.y - dir.y * stockLength * s + perp.y * 2 * s
  };
  const grip = {
    x: shoulder.x + dir.x * 12 * s + perp.x * 7 * s,
    y: shoulder.y + dir.y * 12 * s + perp.y * 7 * s
  };
  const magTop = {
    x: shoulder.x + dir.x * 21 * s + perp.x * 5 * s,
    y: shoulder.y + dir.y * 21 * s + perp.y * 5 * s
  };
  const magBottom = {
    x: magTop.x + perp.x * 18 * s - dir.x * 3 * s,
    y: magTop.y + perp.y * 18 * s - dir.y * 3 * s
  };
  const muzzle = {
    x: shoulder.x + dir.x * barrelLength - (tucked ? dir.x * 5 * s : 0),
    y: shoulder.y + dir.y * barrelLength - (tucked ? dir.y * 5 * s : 0)
  };
  const muzzleCap = tucked ? 0 : 8 * s;

  ctx.strokeStyle = color;
  ctx.lineWidth = 5 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(grip.x, grip.y);
  ctx.stroke();

  ctx.strokeStyle = "#030608";
  ctx.lineWidth = 8 * s;
  ctx.beginPath();
  ctx.moveTo(stockEnd.x, stockEnd.y);
  ctx.lineTo(shoulder.x + dir.x * 8 * s, shoulder.y + dir.y * 8 * s);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(stockEnd.x, stockEnd.y);
  ctx.lineTo(shoulder.x + dir.x * 8 * s, shoulder.y + dir.y * 8 * s);
  ctx.stroke();

  ctx.strokeStyle = "#030608";
  ctx.lineWidth = 10 * s;
  ctx.beginPath();
  ctx.moveTo(shoulder.x + dir.x * 5 * s, shoulder.y + dir.y * 5 * s);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(shoulder.x + dir.x * 5 * s, shoulder.y + dir.y * 5 * s);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();

  ctx.strokeStyle = "#030608";
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(shoulder.x + dir.x * 29 * s - perp.x * 3 * s, shoulder.y + dir.y * 29 * s - perp.y * 3 * s);
  ctx.lineTo(muzzle.x + dir.x * 6 * s - perp.x * 1 * s, muzzle.y + dir.y * 6 * s - perp.y * 1 * s);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(shoulder.x + dir.x * 29 * s - perp.x * 3 * s, shoulder.y + dir.y * 29 * s - perp.y * 3 * s);
  ctx.lineTo(muzzle.x + dir.x * 6 * s - perp.x * 1 * s, muzzle.y + dir.y * 6 * s - perp.y * 1 * s);
  ctx.stroke();

  ctx.strokeStyle = "#030608";
  ctx.lineWidth = 7 * s;
  ctx.beginPath();
  ctx.moveTo(magTop.x, magTop.y);
  ctx.lineTo(magBottom.x, magBottom.y);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(magTop.x, magTop.y);
  ctx.lineTo(magBottom.x, magBottom.y);
  ctx.stroke();

  ctx.strokeStyle = "#b8fff3";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(muzzle.x, muzzle.y);
  ctx.lineTo(muzzle.x + dir.x * muzzleCap, muzzle.y + dir.y * muzzleCap);
  ctx.stroke();
}

function drawReloadArm(from, to, color, width, bend = 1) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const elbow = {
    x: (from.x + to.x) * 0.5 - (dy / len) * 8 * bend,
    y: (from.y + to.y) * 0.5 + (dx / len) * 8 * bend
  };
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(elbow.x, elbow.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function drawReloadMagazine(center, angle, color, alpha = 1, seated = false, weaponType = player.weaponType) {
  const magProfile = weaponType === "pistol"
    ? { w: 6, h: 13, marks: 1 }
    : weaponType === "smg"
      ? { w: 8, h: 23, marks: 3 }
      : { w: 8, h: 17, marks: 2 };
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);
  ctx.fillStyle = "#030608";
  ctx.strokeStyle = color;
  ctx.lineWidth = seated ? 1.5 : 2;
  ctx.shadowBlur = seated ? 7 : 13;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.rect(-magProfile.w * 0.5, -magProfile.h * 0.5, magProfile.w, magProfile.h);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#ffd166";
  ctx.globalAlpha *= 0.78;
  ctx.beginPath();
  for (let i = 0; i < magProfile.marks; i += 1) {
    const x = -magProfile.w * 0.24 + i * (magProfile.w * 0.48 / Math.max(1, magProfile.marks - 1));
    ctx.moveTo(x, -magProfile.h * 0.3);
    ctx.lineTo(x, magProfile.h * 0.3);
  }
  ctx.stroke();
  ctx.restore();
}

function drawReloadShell(center, angle, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#ff7a30";
  ctx.fillStyle = "#ff7a30";
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-7, -3, 14, 6, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(4, -2.2, 2.6, 4.4);
  ctx.restore();
}

function drawShotgunReload(shoulder, color, facing, frame, reloadFrames, progress) {
  const shellFeed = frameSegment(frame, 9, Math.max(24, reloadFrames - 22));
  const pumpReach = frameSegment(frame, Math.max(24, reloadFrames - 22), Math.max(31, reloadFrames - 12));
  const pumpBack = frameSegment(frame, Math.max(31, reloadFrames - 12), Math.max(38, reloadFrames - 5));
  const settle = frameSegment(frame, Math.max(38, reloadFrames - 5), reloadFrames - 1);
  const pumpSnap = Math.sin(pumpBack * Math.PI);
  const angle = player.aimAngle + facing * (0.24 * Math.sin(progress * Math.PI) - pumpSnap * 0.12);
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const perp = { x: -Math.sin(angle), y: Math.cos(angle) };
  const receiver = {
    x: shoulder.x + dir.x * 8,
    y: shoulder.y + dir.y * 8
  };
  const muzzle = {
    x: receiver.x + dir.x * (49 - pumpSnap * 4),
    y: receiver.y + dir.y * (49 - pumpSnap * 4)
  };
  const tube = {
    x: receiver.x + dir.x * 21 + perp.x * 7,
    y: receiver.y + dir.y * 21 + perp.y * 7
  };
  const shellStart = {
    x: shoulder.x - facing * 28,
    y: shoulder.y + 29 + Math.sin(frame * 0.42) * 2
  };
  const shellTarget = {
    x: tube.x - dir.x * 4 + perp.x * 2,
    y: tube.y - dir.y * 4 + perp.y * 2
  };
  const shellArc = Math.sin(shellFeed * Math.PI) * 14;
  const shell = {
    x: lerpValue(shellStart.x, shellTarget.x, shellFeed) - perp.x * shellArc,
    y: lerpValue(shellStart.y, shellTarget.y, shellFeed) - perp.y * shellArc
  };
  const pumpForward = {
    x: receiver.x + dir.x * 29 - perp.x * 7,
    y: receiver.y + dir.y * 29 - perp.y * 7
  };
  const pumpBackPos = {
    x: receiver.x + dir.x * 12 - perp.x * 8,
    y: receiver.y + dir.y * 12 - perp.y * 8
  };
  const supportHand = frame < reloadFrames - 22
    ? { x: shell.x - perp.x * 8, y: shell.y - perp.y * 8 }
    : mixPoint(pumpForward, pumpBackPos, pumpBack || pumpReach);
  const triggerHand = {
    x: receiver.x - dir.x * 7 + perp.x * 3,
    y: receiver.y - dir.y * 7 + perp.y * 3
  };

  drawReloadArm(shoulder, triggerHand, color, 5, -0.35);
  drawReloadArm({ x: shoulder.x - facing * 4, y: shoulder.y + 3 }, supportHand, "#ffd166", 4.8, facing * 0.7);

  ctx.strokeStyle = "#030608";
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(receiver.x - dir.x * 9, receiver.y - dir.y * 9);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(receiver.x - dir.x * 9, receiver.y - dir.y * 9);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();

  ctx.strokeStyle = "#ff7a30";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(receiver.x + perp.x * 8, receiver.y + perp.y * 8);
  ctx.lineTo(muzzle.x + perp.x * 7 - dir.x * 9, muzzle.y + perp.y * 7 - dir.y * 9);
  ctx.stroke();

  if (frame < reloadFrames - 18) {
    drawReloadShell(shell, angle + facing * 0.22, 1);
    drawReloadShell({ x: shellStart.x - facing * 12, y: shellStart.y + 8 }, angle - facing * 0.4, 0.55);
  }

  const pumpFlash = Math.max(0, 1 - Math.abs(frame - (reloadFrames - 11)) / 5);
  if (pumpFlash > 0) {
    ctx.globalAlpha *= pumpFlash;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pumpBackPos.x, pumpBackPos.y, 10 + settle * 6, -0.4, Math.PI * 1.25);
    ctx.stroke();
    ctx.globalAlpha /= pumpFlash || 1;
  }
}

function drawReloadGun(shoulder, color, facing) {
  const reloadFrames = currentReloadFrames();
  const frame = clamp(player.reloadFrame, 0, reloadFrames - 1);
  const progress = frame / Math.max(1, reloadFrames - 1);
  if (player.weaponType === "shotgun") {
    drawShotgunReload(shoulder, color, facing, frame, reloadFrames, progress);
    return;
  }
  const tiltIn = frameSegment(frame, 0, 9);
  const magRelease = frameSegment(frame, 8, 17);
  const newMagIn = frameSegment(frame, 22, 41);
  const rackReach = frameSegment(frame, 41, 47);
  const rackPull = frameSegment(frame, 47, 53);
  const settle = frameSegment(frame, 52, 59);
  const readyCheck = frameSegment(frame, Math.max(12, reloadFrames - 21), reloadFrames - 1);
  const readyPulse = Math.sin(readyCheck * Math.PI);
  const reloadTilt = tiltIn * (1 - settle) + readyPulse * 0.08;
  const rackSnap = Math.sin(rackPull * Math.PI) + readyPulse * 0.14;
  const angle = player.aimAngle + facing * (reloadTilt * 0.74 - rackSnap * 0.15);
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const perp = { x: -Math.sin(angle), y: Math.cos(angle) };
  const recoilJitter = Math.sin(frame * 1.9) * (reloadTilt * 0.6 + rackSnap * 1.2);
  const grip = {
    x: shoulder.x + dir.x * 13 + perp.x * (reloadTilt * 4 + recoilJitter),
    y: shoulder.y + dir.y * 13 + perp.y * (reloadTilt * 4 + recoilJitter)
  };
  const barrelReach = player.weaponType === "pistol" ? 22 : player.weaponType === "smg" ? 36 : 43;
  const muzzle = {
    x: grip.x + dir.x * (barrelReach - rackSnap * 4) - perp.x * rackSnap * 2,
    y: grip.y + dir.y * (barrelReach - rackSnap * 4) - perp.y * rackSnap * 2
  };
  const receiver = {
    x: grip.x - dir.x * 4,
    y: grip.y - dir.y * 4
  };
  const magWell = {
    x: grip.x - dir.x * 2 + perp.x * 9,
    y: grip.y - dir.y * 2 + perp.y * 9
  };
  const restHand = {
    x: shoulder.x - facing * 8,
    y: shoulder.y + 18
  };
  const oldMag = {
    x: magWell.x + perp.x * (9 + magRelease * (player.weaponType === "pistol" ? 22 : 32)) - dir.x * magRelease * 8,
    y: magWell.y + perp.y * (9 + magRelease * (player.weaponType === "pistol" ? 22 : 32)) - dir.y * magRelease * 8
  };
  const newMagStart = {
    x: shoulder.x - facing * 21,
    y: shoulder.y + 33
  };
  const newMagTarget = {
    x: magWell.x + perp.x * 4,
    y: magWell.y + perp.y * 4
  };
  const newMagArc = Math.sin(newMagIn * Math.PI) * 8;
  const newMag = {
    x: lerpValue(newMagStart.x, newMagTarget.x, newMagIn) - perp.x * newMagArc,
    y: lerpValue(newMagStart.y, newMagTarget.y, newMagIn) - perp.y * newMagArc
  };
  const rackForward = {
    x: receiver.x + dir.x * 16 - perp.x * 10,
    y: receiver.y + dir.y * 16 - perp.y * 10
  };
  const rackBack = {
    x: receiver.x + dir.x * 3 - perp.x * 11,
    y: receiver.y + dir.y * 3 - perp.y * 11
  };
  let supportHand = mixPoint(restHand, magWell, frameSegment(frame, 0, 14));
  if (frame >= 18 && frame < 42) {
    supportHand = {
      x: newMag.x - perp.x * 7,
      y: newMag.y - perp.y * 7
    };
  } else if (frame >= 42 && frame < 53) {
    supportHand = mixPoint(rackForward, rackBack, rackPull || rackReach);
  } else if (frame >= 53) {
    const readyHand = {
      x: receiver.x + dir.x * 11 - perp.x * (13 + readyPulse * 5),
      y: receiver.y + dir.y * 11 - perp.y * (13 + readyPulse * 5)
    };
    supportHand = readyCheck > 0 ? mixPoint(restHand, readyHand, readyPulse) : mixPoint(rackBack, restHand, settle);
  }

  const triggerHand = {
    x: grip.x - dir.x * 2 + perp.x * 2,
    y: grip.y - dir.y * 2 + perp.y * 2
  };

  drawReloadArm(shoulder, triggerHand, color, 5, -0.35);
  drawReloadArm({ x: shoulder.x - facing * 4, y: shoulder.y + 3 }, supportHand, "#ffd166", 4.8, facing * 0.7);

  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";

  ctx.strokeStyle = "#030608";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(receiver.x, receiver.y);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(receiver.x, receiver.y);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();

  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(receiver.x + dir.x * 7 - perp.x * (6 + rackSnap * 3), receiver.y + dir.y * 7 - perp.y * (6 + rackSnap * 3));
  ctx.lineTo(receiver.x + dir.x * 19 - perp.x * (6 + rackSnap * 3), receiver.y + dir.y * 19 - perp.y * (6 + rackSnap * 3));
  ctx.stroke();

  const oldMagAlpha = frame < 9 ? 1 : frame < 30 ? 1 - frameSegment(frame, 22, 30) : 0;
  if (oldMagAlpha > 0.02) {
    drawReloadMagazine(oldMag, angle + facing * (0.12 + magRelease * 0.85), "#ff304f", oldMagAlpha, false, player.weaponType);
  }
  if (frame >= 19 && frame < 46) {
    drawReloadMagazine(newMag, angle - facing * (0.42 * (1 - newMagIn)), "#ffd166", 1, newMagIn > 0.88, player.weaponType);
  }
  if (frame >= 39) {
    drawReloadMagazine(magWell, angle, "#4df7ff", frameSegment(frame, 39, 46), true, player.weaponType);
  }

  const seatFlash = Math.max(0, 1 - Math.abs(frame - 41) / 3);
  const rackFlash = Math.max(0, 1 - Math.abs(frame - 51) / 4);
  const checkFlash = Math.max(0, 1 - Math.abs(frame - 68) / 7) * 0.65;
  if (seatFlash > 0 || rackFlash > 0 || checkFlash > 0) {
    const flash = Math.max(seatFlash, rackFlash, checkFlash);
    const flashCenter = checkFlash >= seatFlash && checkFlash >= rackFlash ? receiver : seatFlash > rackFlash ? magWell : rackForward;
    ctx.globalAlpha *= flash;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const burstAngle = angle + (i - 1.5) * 0.65;
      ctx.beginPath();
      ctx.moveTo(flashCenter.x, flashCenter.y);
      ctx.lineTo(flashCenter.x + Math.cos(burstAngle) * 10, flashCenter.y + Math.sin(burstAngle) * 10);
      ctx.stroke();
    }
    ctx.globalAlpha /= flash || 1;
  }

  ctx.globalAlpha *= 0.55;
  ctx.strokeStyle = "#4df7ff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(shoulder.x, shoulder.y + 2, 20 + progress * 7, -0.8, 0.9);
  ctx.stroke();
  ctx.globalAlpha /= 0.55;
}

function selectPlayerFrames() {
  if (player.deathRagdoll) {
    return playerPose("deathRagdoll", PLAYER_JUMP_FALL_FRAMES);
  }
  if (player.meleeType === "punch") {
    return playerPose("meleePunch", PLAYER_PUNCH_FRAMES);
  }
  if (player.meleeType === "elbow") {
    return playerPose("meleeElbow", PLAYER_PUNCH_FRAMES);
  }
  if (player.meleeType === "kick") {
    return playerPose("meleeKick", PLAYER_KICK_FRAMES);
  }
  if (player.turnTimer > 0) {
    return playerPose("turn", PLAYER_TURN_FRAMES);
  }
  if (player.ledgeClimbTimer > 0) {
    return playerPose("ledgeClimb", PLAYER_LEDGE_CLIMB_FRAMES);
  }
  if (player.ledge) {
    return playerPose("halfMantle", PLAYER_HALF_MANTLE_FRAMES);
  }
  if (!player.grounded && player.wallSide !== 0) {
    return playerPose("wall", PLAYER_WALL_FRAMES);
  }
  if (player.slideState === "full") {
    return playerPose("slide", PLAYER_SLIDE_FRAMES);
  }
  if (player.slideState !== "none" || keys.down) {
    return playerPose("crouch", PLAYER_CROUCH_FRAMES);
  }
  if (!player.grounded) {
    return player.vy < 0 ? playerPose("jumpRise", PLAYER_JUMP_RISE_FRAMES) : playerPose("jumpFall", PLAYER_JUMP_FALL_FRAMES);
  }
  if (Math.abs(player.vx) < 24 && !player.meleeType) {
    return playerPose("idle", PLAYER_IDLE_FRAMES);
  }
  return playerPose("run", PLAYER_RUN_FRAMES);
}

function blendPoseFrame(fromFrame, toFrame, amount) {
  if (!fromFrame) {
    return toFrame;
  }
  const frame = { ...toFrame };
  const keysToBlend = ["head", "chest", "backArm", "frontArm", "backLeg", "frontLeg", "kneeBack", "kneeFront", "headDrop", "shoulderDrop", "hipDrop", "legScale", "lean", "punchArm", "punchBend", "punchReach", "kickLeg", "kickBend", "kickReach"];
  for (const key of keysToBlend) {
    const fromValue = fromFrame[key] ?? (key === "legScale" ? 1 : 0);
    const toValue = toFrame[key] ?? (key === "legScale" ? 1 : 0);
    frame[key] = fromValue + (toValue - fromValue) * amount;
  }
  frame.compact = amount > 0.48 ? !!toFrame.compact : !!fromFrame.compact;
  return frame;
}

function easedPoseFrame(pose) {
  let frameIndex = Math.floor(player.animFrame) % pose.frames.length;
  if (pose.key.startsWith("melee") && player.meleeType) {
    const duration = getMeleeDuration(player.meleeType);
    const elapsed = duration - player.meleeTimer;
    const progress = clamp(elapsed / duration, 0, 1);
    frameIndex = Math.min(pose.frames.length - 1, Math.floor(progress * pose.frames.length));
  }
  const targetFrame = pose.frames[frameIndex % pose.frames.length];
  if (player.poseKey !== pose.key) {
    player.previousPoseFrame = player.currentPoseFrame || targetFrame;
    player.poseKey = pose.key;
    player.poseBlend = 0;
  }
  player.poseBlend = clamp(player.poseBlend + 0.2, 0, 1);
  const amount = player.poseBlend * player.poseBlend * (3 - 2 * player.poseBlend);
  player.currentPoseFrame = blendPoseFrame(player.previousPoseFrame, targetFrame, amount);
  return player.currentPoseFrame;
}

function drawPlayer() {
  ctx.save();
  const deadRagdoll = !!player.deathRagdoll;
  const flicker = !deadRagdoll && player.invuln > 0 && Math.floor(time * 22) % 2 === 0;
  const powered = !deadRagdoll && playerPowered();
  const visualScale = playerVisualScale();
  const glow = deadRagdoll ? "#8f1d2c" : powered ? "#b8fff3" : player.airHangTimer > 0 ? "#ffd166" : player.airStrafeTimer > 0 ? "#ffd166" : "#4df7ff";
  const visualRagdoll = playerUsesVisualRagdoll();
  const frame = visualRagdoll ? null : easedPoseFrame(selectPlayerFrames());
  const facing = player.facing || 1;
  const showWeapon = !deadRagdoll;
  const centerX = player.x + player.w * 0.5;
  const lifePulse = Math.sin(time * 2.4) * (player.grounded ? 0.8 : 0.25);
  const reloadProgress = player.reloadTimer > 0 ? player.reloadFrame / Math.max(1, currentReloadFrames() - 1) : 0;
  const reloadBody = Math.sin(reloadProgress * Math.PI) * (player.reloadTimer > 0 ? 1 : 0);

  ctx.globalAlpha = flicker ? 0.38 : 1;
  ctx.shadowBlur = 20;
  ctx.shadowColor = glow;
  ctx.strokeStyle = glow;
  ctx.fillStyle = "#020405";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (powered) {
    const pivotX = centerX;
    const pivotY = player.y + player.h;
    ctx.translate(pivotX, pivotY);
    ctx.scale(visualScale, visualScale);
    ctx.translate(-pivotX, -pivotY);
    ctx.globalAlpha = flicker ? 0.3 : 0.56;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, player.y + player.h * 0.56, 34 + Math.sin(time * 8) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = flicker ? 0.38 : 1;
    ctx.strokeStyle = glow;
  }
  if (player.shield > 0 && !deadRagdoll) {
    const shieldRatio = player.shield / PLAYER_SHIELD_MAX;
    const pulse = player.shieldPulse > 0 ? player.shieldPulse / 0.26 : 0;
    ctx.globalAlpha = flicker ? 0.18 : 0.22 + shieldRatio * 0.28 + pulse * 0.26;
    ctx.strokeStyle = "#b8fff3";
    ctx.shadowBlur = 18 + pulse * 16;
    ctx.shadowColor = "#b8fff3";
    ctx.lineWidth = 2.4 + pulse * 1.8;
    ctx.beginPath();
    ctx.arc(centerX, player.y + player.h * 0.52, 34 + shieldRatio * 7 + pulse * 10 + Math.sin(time * 4.5) * 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = flicker ? 0.38 : 1;
    ctx.shadowBlur = 20;
    ctx.shadowColor = glow;
    ctx.strokeStyle = glow;
  }
  if (visualRagdoll) {
    drawPlayerPhysicsRagdoll(glow, flicker, deadRagdoll);
    if (player.ledge) {
      ctx.fillStyle = "#4df7ff";
      ctx.fillRect(player.x + (player.ledge.side > 0 ? player.w - 1 : -4), player.y + 8, 5, 8);
    }
    ctx.restore();
    return;
  }
  if (deadRagdoll || Math.abs(player.airBodyAngle) > 0.01) {
    let pivotX = centerX;
    let pivotY = player.y + player.h * 0.52;
    let rotateAmount = deadRagdoll ? player.ragdollAngle || player.airBodyAngle || 0 : 0;
    if (!deadRagdoll && !player.grounded && !player.ledge) {
      rotateAmount = player.airBodyAngle;
    }
    if (deadRagdoll || Math.abs(rotateAmount) > 0.01) {
      ctx.translate(pivotX, pivotY);
      ctx.rotate(rotateAmount);
      ctx.translate(-pivotX, -pivotY);
    }
  }
  if (player.airTurnTimer > 0) {
    const trailDir = -signNonZero(player.vx || player.facing);
    ctx.globalAlpha = flicker ? 0.18 : 0.5;
    ctx.strokeStyle = "#b8fff3";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i += 1) {
      const tx = centerX + trailDir * (18 + i * 16);
      const ty = player.y + player.h * (0.36 + i * 0.08);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + trailDir * 18, ty + 6);
      ctx.stroke();
    }
    ctx.globalAlpha = flicker ? 0.38 : 1;
    ctx.strokeStyle = glow;
  }

  if (frame.compact) {
    const footY = player.y + player.h;
    const lean = (frame.lean || 0) * facing;
    const head = { x: centerX - facing * 17 + lean * 0.18 - facing * reloadBody * 2, y: footY - 25 + frame.head + lifePulse + reloadBody * 1.4 };
    const shoulder = { x: centerX - facing * 3 + lean * 0.24 - facing * reloadBody * 1.5, y: footY - 15 + lifePulse * 0.45 + reloadBody * 1.1 };
    const hip = { x: centerX + facing * 8 + lean * 0.35 + facing * reloadBody * 1.2, y: footY - 7 };
    const legUpper = 10 * (frame.legScale || 1);
    const legLower = 11 * (frame.legScale || 1);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(hip.x, hip.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = flicker ? 0.22 : 0.58;
    drawLimb(hip.x - facing * 4, hip.y, frame.backLeg, legUpper, legLower, frame.kneeBack, facing, glow, 5.4);
    ctx.globalAlpha = flicker ? 0.38 : 1;
    drawLimb(hip.x + facing * 3, hip.y, frame.frontLeg, legUpper, legLower, frame.kneeFront, facing, glow, 6);
    drawLimb(shoulder.x - facing * 3, shoulder.y + 1, frame.backArm, 10, 12, 0.18, facing, glow, 4.8);
    if (!showWeapon) {
      drawLimb(shoulder.x + facing * 4, shoulder.y + 1, frame.frontArm * 0.82, 10, 12, 0.12, facing, glow, 4.8);
    } else if (player.reloadTimer > 0) {
      drawReloadGun({ x: shoulder.x + facing * 5, y: shoulder.y - 1 }, glow, facing);
    } else {
      drawAimedGun({ x: shoulder.x + facing * 5, y: shoulder.y - 1 }, glow);
    }
  } else {
    const bob = player.grounded ? frame.head : Math.sin(time * 9) * 0.8 + frame.head;
    const head = { x: centerX - facing * reloadBody * 1.8, y: player.y + 8 + bob + (frame.headDrop || 0) + lifePulse + reloadBody * 1.2 };
    const shoulder = { x: centerX - facing * reloadBody * 1.4, y: player.y + 20 + (frame.shoulderDrop || 0) + lifePulse * 0.45 + reloadBody * 1.6 };
    const hip = { x: centerX - facing * frame.chest * 8 + facing * reloadBody * 1.5, y: player.y + 35 + (frame.hipDrop || 0) + lifePulse * 0.2 };
    const legUpper = 13 * (frame.legScale || 1);
    const legLower = 14 * (frame.legScale || 1);

    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(hip.x, hip.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(head.x, head.y, 7.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = flicker ? 0.22 : 0.55;
    drawLimb(shoulder.x - facing * 3, shoulder.y + 2, frame.backArm, 11, 12, 0.22, facing, glow, 4.5);
    drawLimb(hip.x - facing * 3, hip.y, frame.backLeg, legUpper, legLower, frame.kneeBack, facing, glow, 5.5);
    ctx.globalAlpha = flicker ? 0.38 : 1;

    if (player.meleeType === "kick") {
      drawLimb(hip.x + player.meleeDir * 3, hip.y, frame.kickLeg ?? 1.1, 18 * (frame.kickReach || 1), 18 * (frame.kickReach || 1), frame.kickBend ?? -0.08, player.meleeDir, "#ffd166", 7.5);
      drawLimb(hip.x - player.meleeDir * 4, hip.y, frame.backLeg, legUpper, legLower, frame.kneeBack, player.meleeDir, glow, 5.4);
      drawLimb(shoulder.x + player.meleeDir * 4, shoulder.y + 1, frame.frontArm * 0.72, 11, 12, -0.15, player.meleeDir, glow, 5);
    } else if (player.meleeType === "punch") {
      const punchShoulder = { x: shoulder.x + player.meleeDir * 3, y: shoulder.y + 1 };
      drawLimb(punchShoulder.x, punchShoulder.y, frame.punchArm ?? 1.2, 13 * (frame.punchReach || 1), 18 * (frame.punchReach || 1), frame.punchBend ?? 0.05, player.meleeDir, "#4df7ff", 6.4);
      drawLimb(shoulder.x - player.meleeDir * 3, shoulder.y + 2, frame.backArm, 11, 12, 0.22, player.meleeDir, glow, 4.5);
      drawLimb(hip.x + player.meleeDir * 3, hip.y, frame.frontLeg, legUpper, legLower, frame.kneeFront, player.meleeDir, glow, 6);
    } else if (player.meleeType === "elbow") {
      const elbowShoulder = { x: shoulder.x + player.meleeDir * 2, y: shoulder.y + 1 };
      drawLimb(elbowShoulder.x, elbowShoulder.y, (frame.punchArm ?? 1.2) - 0.42, 9 * (frame.punchReach || 1), 10 * (frame.punchReach || 1), 0.92, player.meleeDir, "#b8fff3", 7.2);
      drawLimb(shoulder.x - player.meleeDir * 3, shoulder.y + 2, frame.backArm, 11, 12, 0.22, player.meleeDir, glow, 4.5);
      drawLimb(hip.x + player.meleeDir * 3, hip.y, frame.frontLeg, legUpper, legLower, frame.kneeFront, player.meleeDir, glow, 6);
    } else {
      drawLimb(hip.x + facing * 3, hip.y, frame.frontLeg, legUpper, legLower, frame.kneeFront, facing, glow, 6);
      if (!showWeapon) {
        drawLimb(shoulder.x + facing * 3, shoulder.y + 2, frame.frontArm, 11, 12, 0.22, facing, glow, 4.9);
      } else if (player.reloadTimer > 0) {
        drawReloadGun({ x: shoulder.x + facing * 3, y: shoulder.y + 1 }, glow, facing);
      } else {
        drawAimedGun({ x: shoulder.x + facing * 3, y: shoulder.y + 1 }, glow);
      }
    }
  }

  if (player.ledge) {
    ctx.fillStyle = "#4df7ff";
    ctx.fillRect(player.x + (player.ledge.side > 0 ? player.w - 1 : -4), player.y + 8, 5, 8);
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawBloodSplatters() {
  if (!bloodSplatters.length) {
    return;
  }
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
  for (const splat of bloodSplatters) {
    ctx.save();
    ctx.translate(splat.x, splat.y);
    ctx.rotate(splat.angle);
    ctx.globalAlpha = splat.alpha;
    ctx.fillStyle = splat.color;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(0, 0, splat.w, splat.h, 0, 0, Math.PI * 2);
    ctx.fill();
    if (splat.outline) {
      ctx.globalAlpha = Math.min(1, splat.alpha + 0.12);
      ctx.strokeStyle = "rgba(18, 0, 4, 0.82)";
      ctx.lineWidth = Math.max(0.6, Math.min(2.5, splat.w * 0.18));
      ctx.stroke();
    }
    ctx.globalAlpha = splat.alpha * 0.18;
    ctx.fillStyle = "#2a0710";
    ctx.beginPath();
    ctx.ellipse(splat.w * 0.08, 0, splat.w * 0.34, splat.h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    if (splat.drip > 0) {
      ctx.globalAlpha = splat.alpha * 0.72;
      ctx.fillStyle = splat.color;
      ctx.fillRect(-splat.w * 0.22, 0, Math.max(1, splat.w * 0.35), splat.drip);
      ctx.beginPath();
      ctx.arc(0, splat.drip, Math.max(1.4, splat.w * 0.28), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawDashArc() {
  const cx = player.x + player.w * 0.5;
  const cy = player.y + player.h + 16;
  const progress = player.dashCooldown <= 0 ? 1 : 1 - player.dashCooldown / MOVE.dashCooldown;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
  ctx.beginPath();
  ctx.arc(cx, cy, 16, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.strokeStyle = player.dashCooldown <= 0 ? "#4df7ff" : "#ffd166";
  ctx.beginPath();
  ctx.arc(cx, cy, 16, Math.PI * 0.15, Math.PI * (0.15 + 0.7 * progress));
  ctx.stroke();
  ctx.restore();
}

function drawReticle() {
  if (!mouse.active) {
    return;
  }
  const size = CONTROL.largeReticle ? 1.55 : 1;
  ctx.save();
  ctx.strokeStyle = "rgba(77, 247, 255, 0.72)";
  ctx.lineWidth = CONTROL.largeReticle ? 2.2 : 1.5;
  ctx.shadowBlur = CONTROL.largeReticle ? 16 : 10;
  ctx.shadowColor = "#4df7ff";
  ctx.beginPath();
  ctx.arc(mouse.worldX, mouse.worldY, 9 * size, 0, Math.PI * 2);
  ctx.moveTo(mouse.worldX - 15 * size, mouse.worldY);
  ctx.lineTo(mouse.worldX - 7 * size, mouse.worldY);
  ctx.moveTo(mouse.worldX + 7 * size, mouse.worldY);
  ctx.lineTo(mouse.worldX + 15 * size, mouse.worldY);
  ctx.moveTo(mouse.worldX, mouse.worldY - 15 * size);
  ctx.lineTo(mouse.worldX, mouse.worldY - 7 * size);
  ctx.moveTo(mouse.worldX, mouse.worldY + 7 * size);
  ctx.lineTo(mouse.worldX, mouse.worldY + 15 * size);
  ctx.stroke();
  ctx.restore();
}

function drawFinaleOverlay(w, h) {
  const arm = finale.armWrestle;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (finale.messageTimer > 0 && finale.message) {
    const alpha = clamp(finale.messageTimer / 0.35, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.font = "900 18px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "rgba(4, 7, 10, 0.72)";
    ctx.fillRect(w * 0.5 - 210, 95, 420, 36);
    ctx.strokeStyle = finale.phase === "boss" ? "#c66bff" : "#ffd166";
    ctx.strokeRect(w * 0.5 - 210, 95, 420, 36);
    ctx.fillStyle = "#edf7fb";
    ctx.fillText(finale.message, w * 0.5, 113);
    ctx.globalAlpha = 1;
  }

  if (arm.active) {
    const progress = 1 - clamp(arm.timer / FINALE.armWrestleDuration, 0, 1);
    const pull = clamp(arm.pull / 0.45, 0, 1);
    const panelW = Math.min(520, w - 46);
    const x = (w - panelW) * 0.5;
    const y = h * 0.68;
    ctx.fillStyle = "rgba(4, 7, 10, 0.82)";
    ctx.fillRect(x, y, panelW, 112);
    ctx.strokeStyle = arm.success ? "#b8fff3" : "#c66bff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelW, 112);
    ctx.font = "900 15px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#ffd166";
    ctx.fillText(arm.combo, w * 0.5, y + 23);
    ctx.font = "900 23px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#edf7fb";
    ctx.fillText("PULL LEFT STICK ALL THE WAY LEFT", w * 0.5, y + 52);
    ctx.fillStyle = "rgba(198, 107, 255, 0.22)";
    ctx.fillRect(x + 26, y + 76, panelW - 52, 10);
    ctx.fillStyle = arm.success ? "#b8fff3" : "#c66bff";
    ctx.fillRect(x + 26, y + 76, (panelW - 52) * pull, 10);
    ctx.strokeStyle = "rgba(237, 247, 251, 0.5)";
    ctx.strokeRect(x + 26, y + 76, panelW - 52, 10);
    ctx.fillStyle = "rgba(237, 247, 251, 0.68)";
    ctx.font = "800 12px Segoe UI, Arial, sans-serif";
    ctx.fillText(`${Math.ceil((1 - progress) * 60)} FRAMES`, w * 0.5, y + 98);
  }
  ctx.restore();
}

function drawBonusClashOverlay(w, h) {
  const active = bonusClash.active;
  if (!active && bonusClash.resultTimer <= 0) {
    return;
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const panelW = Math.min(540, w - 44);
  const x = (w - panelW) * 0.5;
  const y = h * 0.54;
  const color = bonusClash.blueprint?.color || "#b8fff3";
  ctx.fillStyle = "rgba(3, 7, 10, 0.84)";
  ctx.fillRect(x, y, panelW, active ? 128 : 66);
  ctx.strokeStyle = color;
  ctx.lineWidth = bonusClash.flash > 0 ? 4 : 2;
  ctx.strokeRect(x, y, panelW, active ? 128 : 66);
  ctx.font = "900 15px Segoe UI, Arial, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText(active ? bonusClash.blueprint.name : bonusClash.resultText, w * 0.5, y + 22);
  if (active) {
    const timePct = clamp(bonusClash.timer / Math.max(0.01, bonusClash.duration), 0, 1);
    const hitPct = clamp(bonusClash.hits / Math.max(1, bonusClash.needed), 0, 1);
    ctx.font = "900 28px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#edf7fb";
    ctx.fillText(bonusClash.label, w * 0.5, y + 56);
    ctx.fillStyle = "rgba(237, 247, 251, 0.16)";
    ctx.fillRect(x + 28, y + 82, panelW - 56, 9);
    ctx.fillStyle = color;
    ctx.fillRect(x + 28, y + 82, (panelW - 56) * timePct, 9);
    ctx.fillStyle = "rgba(255, 209, 102, 0.18)";
    ctx.fillRect(x + 28, y + 101, panelW - 56, 9);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(x + 28, y + 101, (panelW - 56) * hitPct, 9);
    ctx.font = "800 12px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "rgba(237, 247, 251, 0.72)";
    ctx.fillText(`${bonusClash.hits}/${bonusClash.needed} HITS`, w * 0.5, y + 119);
  }
  ctx.restore();
}

function drawBossMimicOverlay(w, h) {
  if (!bossMimicCinema.active) {
    return;
  }
  const pct = clamp(bossMimicCinema.timer / Math.max(0.01, bossMimicCinema.duration), 0, 1);
  const flash = Math.sin((1 - pct) * Math.PI);
  const color = bossMimicCinema.color || "#c66bff";
  const enemy = bossMimicCinema.enemy;
  const echoX = enemy ? enemy.x + enemy.w * 0.5 - camera.x : bossMimicCinema.echoX - camera.x;
  const echoY = enemy ? enemy.y + enemy.h * 0.45 - camera.y : bossMimicCinema.echoY - camera.y;
  ctx.save();
  ctx.globalAlpha = 0.1 + flash * 0.12;
  ctx.fillStyle = "#020408";
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(2, 4, 8, 0.76)";
  ctx.fillRect(0, 0, w, 54);
  ctx.fillRect(0, h - 54, w, 54);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.38 + flash * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.36);
  ctx.lineTo(w, h * 0.16);
  ctx.moveTo(0, h * 0.68);
  ctx.lineTo(w, h * 0.48);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 1;
  ctx.font = "900 13px Segoe UI, Arial, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText("BOSS COPY", w * 0.5, 30);
  ctx.font = "900 30px Segoe UI, Arial, sans-serif";
  ctx.fillStyle = "#edf7fb";
  ctx.fillText((bossMimicCinema.tactic || "PLAYER").toUpperCase(), w * 0.5, h * 0.22);

  if (Number.isFinite(echoX) && Number.isFinite(echoY)) {
    ctx.translate(echoX, echoY);
    for (let i = 0; i < 4; i += 1) {
      const scale = 1 + i * 0.24 + flash * 0.08;
      ctx.globalAlpha = (0.32 - i * 0.055) * flash;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 - i * 0.35;
      ctx.beginPath();
      ctx.ellipse(i * 18 - 28, -i * 10, 28 * scale, 42 * scale, -0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * 18 - 28, -48 * scale);
      ctx.lineTo(i * 18 - 28 + 30 * scale, 38 * scale);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawRain() {
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < rain.length; i += 1) {
    if (CONTROL.comfortFx && i % 2 === 1) {
      continue;
    }
    const drop = rain[i];
    ctx.globalAlpha = drop.alpha * (CONTROL.comfortFx ? 0.45 : 1);
    ctx.strokeStyle = "#9fb6c4";
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 6, drop.y + drop.len);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawUI() {
  ctx.save();
  ctx.font = "900 18px Segoe UI, Arial, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#edf7fb";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#4df7ff";
  ctx.fillText("FAULTLINE", 24, 22);

  for (let i = 0; i < PLAYER_MAX_HP; i += 1) {
    const x = 24 + i * 30;
    const y = 55;
    const fillAmount = clamp(player.hp - i, 0, 1);
    ctx.strokeStyle = "#4df7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 13, y);
    ctx.lineTo(x + 25, y + 11);
    ctx.lineTo(x + 13, y + 23);
    ctx.lineTo(x + 1, y + 11);
    ctx.closePath();
    ctx.stroke();
    if (fillAmount > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + 13, y);
      ctx.lineTo(x + 25, y + 11);
      ctx.lineTo(x + 13, y + 23);
      ctx.lineTo(x + 1, y + 11);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = "#4df7ff";
      ctx.fillRect(x, y - 1, 26 * fillAmount, 25);
      ctx.restore();
    }
  }

  const shieldStartX = 24 + PLAYER_MAX_HP * 30 + 28;
  ctx.font = "900 10px Segoe UI, Arial, sans-serif";
  ctx.fillStyle = "rgba(184, 255, 243, 0.78)";
  ctx.fillText("SHIELD", shieldStartX, 42);
  for (let i = 0; i < PLAYER_SHIELD_MAX; i += 1) {
    const x = shieldStartX + i * 23;
    const y = 55;
    const fillAmount = clamp(player.shield - i, 0, 1);
    ctx.strokeStyle = fillAmount > 0 ? "#b8fff3" : "rgba(184, 255, 243, 0.34)";
    ctx.fillStyle = "rgba(184, 255, 243, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 17, y + 5);
    ctx.lineTo(x + 15, y + 18);
    ctx.lineTo(x + 9, y + 23);
    ctx.lineTo(x + 3, y + 18);
    ctx.lineTo(x + 1, y + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (fillAmount > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + 9, y);
      ctx.lineTo(x + 17, y + 5);
      ctx.lineTo(x + 15, y + 18);
      ctx.lineTo(x + 9, y + 23);
      ctx.lineTo(x + 3, y + 18);
      ctx.lineTo(x + 1, y + 5);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = "rgba(184, 255, 243, 0.76)";
      ctx.fillRect(x, y + 24 - 24 * fillAmount, 18, 24 * fillAmount);
      ctx.restore();
    }
  }

  if (player.ragdollShield) {
    const guardX = shieldStartX + PLAYER_SHIELD_MAX * 23 + 22;
    const shots = Math.max(0, player.ragdollShield.shots || 0);
    ctx.font = "900 10px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#ffd166";
    ctx.fillText("RAGDOLL", guardX, 42);
    ctx.strokeStyle = "#ffd166";
    ctx.fillStyle = "rgba(255, 209, 102, 0.16)";
    ctx.lineWidth = 2;
    ctx.strokeRect(guardX, 55, 84, 13);
    ctx.fillRect(guardX, 55, 84 * clamp(shots / RAGDOLL_SHIELD.shots, 0, 1), 13);
    ctx.fillStyle = "#f4f7fb";
    ctx.fillText(`${shots}/7`, guardX + 90, 54);
  }

  ctx.font = "900 14px Segoe UI, Arial, sans-serif";
  const unarmedMode = playerOutOfAllAmmo();
  const hudWarning = player.emptyTimer > 0 ? player.emptyMessage : "";
  const currentWeapon = weaponConfig();
  ctx.fillStyle = unarmedMode ? "#ffd166" : hudWarning ? "#ff304f" : player.reloadTimer > 0 ? "#ffd166" : "#4df7ff";
  ctx.fillText(unarmedMode ? "UNARMED: RT AUTO COMBAT" : `${currentWeapon.label} ${currentWeapon.personality} ${player.magAmmo}/${currentClipSize()}  RES ${player.reserveAmmo}  SG ${player.shotgunAmmo || 0}`, 24, 88);
  if (hudWarning) {
    ctx.fillStyle = "#ff304f";
    ctx.fillText(hudWarning, 24, 106);
  }
  const statusOffset = hudWarning ? 18 : 0;
  if (player.powerTimer > 0) {
    const progress = player.powerTimer / POWERUP.duration;
    ctx.fillStyle = "rgba(184, 255, 243, 0.18)";
    ctx.fillRect(24, 110 + statusOffset, 132, 5);
    ctx.fillStyle = "#b8fff3";
    ctx.fillRect(24, 110 + statusOffset, 132 * progress, 5);
    ctx.fillText(`OVERDRIVE ${Math.ceil(player.powerTimer)}s`, 24, 118 + statusOffset);
  }
  if (player.reloadTimer > 0) {
    const progress = 1 - player.reloadTimer / currentReloadDuration();
    const reloadY = (player.powerTimer > 0 ? 138 : 110) + statusOffset;
    ctx.fillStyle = "rgba(255, 209, 102, 0.18)";
    ctx.fillRect(24, reloadY, 116, 5);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(24, reloadY, 116 * progress, 5);
    ctx.fillText(`RELOAD ${Math.min(currentReloadFrames(), player.reloadFrame + 1)}/${currentReloadFrames()}`, 148, (player.powerTimer > 0 ? 132 : 104) + statusOffset);
  }
  if (smartInventory.enabled && smartInventory.lastActionTimer > 0) {
    ctx.fillStyle = "#b8fff3";
    ctx.fillText(smartInventory.lastAction, 24, (player.powerTimer > 0 || player.reloadTimer > 0 ? 156 : 126) + statusOffset);
  }

  ctx.shadowBlur = 0;
  ctx.textAlign = "right";
  ctx.fillStyle = "#f4f7fb";
  ctx.fillText(`SCORE ${score}`, canvasState.width - 24, 22);
  ctx.fillStyle = multiplier > 2.5 ? "#ffd166" : "#4df7ff";
  ctx.fillText(`X${multiplier.toFixed(1)}`, canvasState.width - 24, 50);

  const styleW = Math.min(220, canvasState.width * 0.22);
  const styleX = canvasState.width - styleW - 24;
  const styleY = 74;
  const stylePct = clamp(styleState.value / STYLE.max, 0, 1);
  ctx.fillStyle = "rgba(77, 247, 255, 0.12)";
  ctx.fillRect(styleX, styleY, styleW, 6);
  ctx.fillStyle = stylePct > 0.72 ? "#ffd166" : "#4df7ff";
  ctx.fillRect(styleX, styleY, styleW * stylePct, 6);
  ctx.fillStyle = "#cbd4dd";
  ctx.font = "900 10px Segoe UI, Arial, sans-serif";
  ctx.fillText(`STYLE ${Math.round(styleState.value)}`, canvasState.width - 24, styleY + 10);
  ctx.textAlign = "center";
  for (let i = 0; i < styleState.callouts.length; i += 1) {
    const callout = styleState.callouts[i];
    const alpha = clamp(callout.life / Math.max(0.001, callout.maxLife), 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = callout.color;
    ctx.font = `900 ${14 + i * -1}px Segoe UI, Arial, sans-serif`;
    ctx.fillText(callout.reason, canvasState.width * 0.5, 64 + i * 19 - callout.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "right";

  if (player.rescueGrapples > 0) {
    ctx.fillStyle = "#ffd166";
    ctx.font = "900 12px Segoe UI, Arial, sans-serif";
    ctx.fillText(`GRAPPLE x${player.rescueGrapples}`, canvasState.width - 24, 106);
  }
  if (CONTROL.controllerOnly) {
    ctx.textAlign = "center";
    ctx.font = "900 14px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = gamepadControls.connected ? "rgba(77, 247, 255, 0.75)" : "#ffd166";
    ctx.fillText(gamepadControls.connected ? "CONTROLLER ONLINE" : "CONNECT CONTROLLER", canvasState.width * 0.5, 22);
  }
  ctx.restore();
}

function loop(nowMs) {
  if (!lastFrame) {
    lastFrame = nowMs;
  }
  const dt = Math.min(0.033, (nowMs - lastFrame) / 1000);
  lastFrame = nowMs;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function handleKey(event, pressed) {
  const code = event.code;
  if (tipsOpen() && tipsCanClose() && pressed && (code === "Escape" || code === "Enter" || code === "Space")) {
    playMenuAccept();
    closeTips();
    event.preventDefault();
    return;
  }
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space", "ShiftLeft", "ShiftRight", "KeyA", "KeyD", "KeyS", "KeyW", "KeyE", "KeyR", "KeyQ"].includes(code)) {
    event.preventDefault();
  }
  if (CONTROL.controllerOnly) {
    return;
  }
  if (pressed) {
    ensureMusic();
  }

  if (code === "ArrowLeft" || code === "KeyA") {
    keyboardKeys.left = pressed;
  } else if (code === "ArrowRight" || code === "KeyD") {
    keyboardKeys.right = pressed;
  } else if (code === "ArrowDown" || code === "KeyS") {
    if (pressed && !keyboardKeys.down) {
      beginDownInput();
    }
    if (!pressed && keyboardKeys.down) {
      endDownInput(time - input.downStartedAt);
    }
    keyboardKeys.down = pressed;
  } else if (code === "ArrowUp" || code === "Space" || code === "KeyW") {
    if (pressed && !keyboardKeys.jump) {
      beginJumpInput();
    }
    if (!pressed && keyboardKeys.jump) {
      endJumpInput();
    }
    keyboardKeys.jump = pressed;
  } else if (pressed && (code === "ShiftLeft" || code === "ShiftRight")) {
    tryDash();
  } else if (pressed && code === "KeyE") {
    input.combatQueued = true;
  } else if (pressed && code === "KeyQ") {
    input.shotgunQueued = true;
  } else if (pressed && code === "KeyR") {
    input.weaponCycleQueued = true;
  }
  syncKeys();
}

window.addEventListener("resize", resize);
window.addEventListener("pointerdown", unlockAudioFromGesture, { capture: true });
window.addEventListener("touchstart", unlockAudioFromGesture, { capture: true, passive: true });
window.addEventListener("keydown", (event) => {
  unlockAudioFromGesture();
  handleKey(event, true);
});
window.addEventListener("keyup", (event) => handleKey(event, false));
canvas.addEventListener("pointermove", (event) => {
  if (!CONTROL.controllerOnly) {
    updateMouseFromEvent(event);
  }
});
canvas.addEventListener("pointerdown", (event) => {
  unlockAudioFromGesture();
  if (CONTROL.controllerOnly) {
    event.preventDefault();
    return;
  }
  ensureMusic();
  updateMouseFromEvent(event);
  if (event.button === 0) {
    event.preventDefault();
    input.shootQueued = true;
  }
});
retryButton.addEventListener("click", () => {
  if (gameState === "dead" || gameState === "captured") {
    restartRunFromFailState();
  }
});
startButton.addEventListener("click", () => {
  playMenuAccept();
  startRunFromIntro();
});
introAliasButton.addEventListener("click", () => {
  playMenuAccept();
  toggleFrameSmoothing();
});
introAiFramesButton.addEventListener("click", () => {
  playMenuAccept();
  toggleAiFrames();
});
introInventoryButton.addEventListener("click", () => {
  playMenuAccept();
  toggleSmartInventory();
});
introTipsButton.addEventListener("click", () => {
  playMenuAccept();
  showTips();
});
introControllerModeButton.addEventListener("click", () => {
  playMenuAccept();
  toggleControllerCurve();
});
introAssistButton.addEventListener("click", () => {
  playMenuAccept();
  toggleMovementAssist();
});
introComfortButton.addEventListener("click", () => {
  playMenuAccept();
  toggleComfortFx();
});
introReticleButton.addEventListener("click", () => {
  playMenuAccept();
  toggleReticleSize();
});
resumeButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    setPaused(false);
  }
});
aliasButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleFrameSmoothing();
  }
});
aiFramesButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleAiFrames();
  }
});
inventoryButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleSmartInventory();
  }
});
tipsButton.addEventListener("click", () => {
  playMenuAccept();
  showTips();
});
controllerModeButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleControllerCurve();
  }
});
assistButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleMovementAssist();
  }
});
comfortButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleComfortFx();
  }
});
reticleButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    toggleReticleSize();
  }
});
tipsCloseButton.addEventListener("click", () => {
  playMenuAccept();
  closeTips();
});
restartButton.addEventListener("click", () => {
  playMenuAccept();
  if (!CONTROL.controllerOnly) {
    setPaused(false);
    resetGame();
  }
});

resize();
initializeSettingsMenus();
resetGame();
updateMenuButtons();
requestAnimationFrame(loop);
