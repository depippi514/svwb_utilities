"use client"

import { useState, useCallback, useMemo, useEffect, FC, ReactNode } from "react"
import {
  AppShell,
  Stack,
  Title,
  Grid,
  Group,
  Button,
  ActionIcon,
  Text,
  rem,
  Card,
  Radio,
  Switch,
  Badge,
  Textarea,
  Tabs,
  ScrollArea,
  Modal,
  Checkbox,
  NumberInput,
  Image,
  Container,
  Box,
  SimpleGrid,
  useMantineTheme,
  Divider,
  Collapse,
  HoverCard,
  AspectRatio,
} from "@mantine/core"
import { useMediaQuery, useDisclosure } from "@mantine/hooks"
import {
  IconCircleFilled,
  IconCircle,
  IconSword,
  IconHistory,
  IconUsers,
  IconRefresh,
  IconPlus,
  IconMinus,
  IconBoxMultiple,
  IconSettings,
  IconPin,
  IconChevronDown,
} from "@tabler/icons-react"
import REMOVAL_CARDS_JSON from './removalCards.json';

// --- Type Definitions ---

type Leader = "elf" | "royal" | "witch" | "dragon" | "nightmare" | "bishop" | "nemesis" | "neutral"
type CardType = "follower" | "spell"
type EffectMode = "default" | "enhance" | "evolve" | "super_evolve" | "necromancy" | "awakening"

interface EffectCondition {
  minTurn?: number
  minPP?: number
  evolveTokenMin?: number
  superEvolveTokenMin?: number
  necromancyCost?: number
}

interface CardEffect {
  mode: EffectMode
  cost: number
  conditions: EffectCondition
  effect: string
}

interface CardData {
  id: string
  name: string
  type: CardType
  leader: Leader
  baseCost: number
  attack?: number
  toughness?: number
  effects: CardEffect[]
  imageUrl: string
}

interface GameState {
  turn: number
  ppMax: number
  ppCurrent: number
  ep: number
  sep: number
  handCount: number
  graveyardCount: number
  firstOrSecond: "first" | "second"
  leader: Leader | null
  extraPPBonus: boolean
  evolveUsedThisTurn: boolean
}

interface GameHistoryEntry {
  turn: number
  action: string
  pp: number
  hand: number
}

interface NemesisToken {
  id: string
  name: string
  cost: number
  attack: number | null
  defense: number | null
  effect: string
  category: string
  imageUrl: string
}

interface SynthesisState {
    isModalOpen: boolean;
    targetId: string | null;
    baseMaterial: string | null;
    subMaterials: string[];
    error: string;
}


// --- Constants & Data Definitions ---

const REMOVAL_CARDS: CardData[] = REMOVAL_CARDS_JSON as CardData[];

const CARD_TYPES: Record<CardType, ReactNode> = {
  follower: <Badge miw={100} size="lg" color="blue" variant="light" c="white">フォロワー</Badge>,
  spell: <Badge miw={100} size="lg" color="blue" variant="light" c="white">スペル</Badge>,
}

const EFFECT_MODES: Record<EffectMode, ReactNode> = {
    default: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}}  miw={90} color="gray" variant="filled">基本効果</Badge>,
    enhance: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}}  miw={90} color="orange" variant="filled">エンハンス</Badge>,
    evolve: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="yellow" variant="filled">進化</Badge>,
    super_evolve: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="violet" variant="filled">超進化</Badge>,
    necromancy: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="grape" variant="filled">ネクロマンス</Badge>,
    awakening: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="red" variant="filled">覚醒</Badge>,
}

const LEADERS: { value: Leader; label: string }[] = [
  { value: "elf", label: "エルフ" },
  { value: "royal", label: "ロイヤル" },
  { value: "witch", label: "ウィッチ" },
  { value: "dragon", label: "ドラゴン" },
  { value: "nightmare", label: "ナイトメア" },
  { value: "bishop", label: "ビショップ" },
  { value: "nemesis", label: "ネメシス" },
]

const NEMESIS_ARTIFACT_TOKENS: NemesisToken[] = [
  { id: "puppet", name: "操り人形", cost: 0, attack: 1, defense: 1, effect: "【突進】相手のターン終了時に破壊される", category: "puppet", imageUrl: "/svwb_utilities/img/1/nemesis/token/操り人形.png" },
  { id: "enhanced_puppet", name: "改良型操り人形", cost: 1, attack: 3, defense: 3, effect: "【突進】相手のターン終了時に破壊される", category: "puppet", imageUrl: "/svwb_utilities/img/1/nemesis/token/改良型操り人形.png" },
  { id: "past_core", name: "パスト・コア", cost: 1, attack: null, defense: null, effect: "1コストのアーティファクトと合成した時にキャッスルアーティファクトに変身する。", category: "core", imageUrl: "/svwb_utilities/img/1/nemesis/token/パスト・コア.png" },
  { id: "future_core", name: "フューチャー・コア", cost: 1, attack: null, defense: null, effect: "1コストのアーティファクトと合成した時にアタックアーティファクトに変身する。", category: "core", imageUrl: "/svwb_utilities/img/1/nemesis/token/フューチャー・コア.png" },
  { id: "castle_artifact", name: "キャッスルアーティファクト", cost: 3, attack: 5, defense: 1, effect: "【融合】...【守護】", category: "intermediate_artifact", imageUrl: "/svwb_utilities/img/1/nemesis/token/キャッスルアーティファクト.png" },
  { id: "attack_artifact", name: "アタックアーティファクト", cost: 3, attack: 1, defense: 5, effect: "【融合】...【突進】", category: "intermediate_artifact", imageUrl: "/svwb_utilities/img/1/nemesis/token/アタックアーティファクト.png" },
  { id: "destroy_artifact_alpha", name: "デストロイアーティファクトα", cost: 5, attack: 3, defense: 5, effect: "【融合】...自分のターン終了時、自分のリーダーを3回復。", category: "destroy_artifact", imageUrl: "/svwb_utilities/img/1/nemesis/token/デストロイアーティファクトα.png" },
  { id: "destroy_artifact_beta", name: "デストロイアーティファクトβ", cost: 5, attack: 4, defense: 4, effect: "自分のターン終了時、相手のリーダーに3ダメージ。", category: "destroy_artifact", imageUrl: "/svwb_utilities/img/1/nemesis/token/デストロイアーティファクトβ.png" },
  { id: "destroy_artifact_gamma", name: "デストロイアーティファクトγ", cost: 5, attack: 5, defense: 3, effect: "自分のターン終了時、相手の場のフォロワーすべてに3ダメージ。", category: "destroy_artifact", imageUrl: "/svwb_utilities/img/1/nemesis/token/デストロイアーティファクトγ.png" },
  { id: "exceed_artifact_omega", cost: 10, name: "イクシードアーティファクトΩ", attack: 10, defense: 10, effect: "【ファンファーレ】...【疾走】【守護】【オーラ】", category: "final_artifact", imageUrl: "/svwb_utilities/img/1/nemesis/token/イクシードアーティファクトΩ.png" },
];

// --- Helper Functions & Hooks ---

interface EffectContext {
  turn: number;
  pp: number;
  ppMax: number;
  ep: number;
  sep: number;
  graveyardCount: number;
  evolveUsedThisTurn: boolean;
  isEpUsable: boolean;
  isSepUsable: boolean;
}

const isEffectActive = (effect: CardEffect, ctx: EffectContext): boolean => {
  const c = effect.conditions;
  if (effect.cost > ctx.pp) return false;
  if (c.minTurn && ctx.turn < c.minTurn) return false;
  if (c.minPP && ctx.ppMax < c.minPP) return false;
  if (c.necromancyCost && ctx.graveyardCount < c.necromancyCost) return false;
  if (effect.mode === 'evolve' && (!ctx.isEpUsable || ctx.evolveUsedThisTurn || (c.evolveTokenMin && ctx.ep < c.evolveTokenMin))) return false;
  if (effect.mode === 'super_evolve' && (!ctx.isSepUsable || ctx.evolveUsedThisTurn || (c.superEvolveTokenMin && ctx.sep < c.superEvolveTokenMin))) return false;
  if (effect.mode === 'awakening' && ctx.ppMax < 7) return false;
  return true;
};

const getActionableEffect = (card: CardData, ctx: EffectContext): CardEffect | null => {
  const enhanceEffect = card.effects.find(e => e.mode === 'enhance');
  if (enhanceEffect && isEffectActive(enhanceEffect, ctx)) return enhanceEffect;
  const defaultEffect = card.effects.find(e => e.mode === 'default');
  if (defaultEffect && isEffectActive(defaultEffect, ctx)) return defaultEffect;
  return null;
};

// --- Components ---

interface DotSelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
  knownCount?: number;
  knownColor?: string;
}

const DotSelector: FC<DotSelectorProps> = ({ value, max, onChange, label, disabled = false, knownCount = 0, knownColor = "green" }) => (
  <Stack gap={4}>
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c={disabled ? "dark.3" : "blue.3"}>{label}</Text>
      <Text size="sm" c={disabled ? "dark.4" : "blue.4"}>{`${value} / ${max}`}</Text>
    </Group>
    <Group gap={6} wrap="nowrap">
      {Array.from({ length: max }, (_, i) => {
        const isSelected = i < value;
        const color = isSelected ? (i < knownCount ? knownColor : "blue") : "dark";
        return (
          <ActionIcon key={i} radius="xl" variant="light" disabled={disabled} color={color} size={rem(28)} onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
            styles={{ root: { backgroundColor: `var(--mantine-color-${color}-9)`, border: `1px solid var(--mantine-color-${color}-7)`, '&[data-disabled]': { backgroundColor: 'var(--mantine-color-dark-8) !important', borderColor: 'var(--mantine-color-dark-6) !important', color: 'var(--mantine-color-dark-4) !important' } } }}
          >
            {isSelected ? <IconCircleFilled size={18} /> : <IconCircle size={18} />}
          </ActionIcon>
        );
      })}
    </Group>
  </Stack>
);

interface RemovalCardBlockProps {
    card: CardData;
    onUseCard: (card: CardData, effect: CardEffect) => void;
    effectContext: EffectContext;
}

const RemovalCardBlock: FC<RemovalCardBlockProps> = ({ card, onUseCard, effectContext }) => {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const actionableEffect = getActionableEffect(card, effectContext);
    const allActiveEffects = useMemo(() => card.effects.filter(eff => eff !== actionableEffect && isEffectActive(eff, effectContext)).sort((a, b) => a.cost - b.cost), [card, effectContext, actionableEffect]);
    const displayEffects = actionableEffect ? [actionableEffect, ...allActiveEffects] : allActiveEffects;

    const postitEffects = useMemo(() => {
        const effectsToShow = displayEffects.filter(eff => eff.mode !== 'default');
        if (effectsToShow.length === 0) return null;
        return <Stack gap="xs" style={{ position: "absolute", top: 65, right: -8, zIndex: 1 }}>{effectsToShow.map((eff, i) => <Box key={i}>{EFFECT_MODES[eff.mode]}</Box>)}</Stack>;
    }, [displayEffects]);

    const handleUseClick = () => {
        if (actionableEffect) {
            onUseCard(card, actionableEffect);
            if(showDetailsModal) setShowDetailsModal(false);
        }
    };

    const hoverCardContent = useMemo(() => {
        if (displayEffects.length === 0) {
            return <Text size="sm" c="white">現在使用可能な効果はありません。</Text>;
        }
        return (
            <Stack gap={4}>
                {displayEffects.map((eff, i) => (
                    <Group key={i} wrap="nowrap" align="center" gap="xs">
                        {EFFECT_MODES[eff.mode]}
                        <Text size="sm" c="white" dangerouslySetInnerHTML={{ __html: eff.effect.replace(/\n/g, '<br/>') }} />
                    </Group>
                ))}
            </Stack>
        );
    }, [displayEffects]);

    return (
        <>
            <Card shadow="sm" p="sm" radius="md" style={{ backgroundColor: "var(--mantine-color-dark-7)", overflow: 'visible' }}>
                <Stack gap="xs" align="stretch">
                    <Button size="compact-xs" variant="filled" color="blue" onClick={handleUseClick} disabled={!actionableEffect}>使用</Button>
                     <HoverCard width={400} shadow="md" openDelay={200} position="bottom" withArrow styles={{ dropdown: { backgroundColor: "var(--mantine-color-dark-5)", borderColor: "var(--mantine-color-blue-7)" } }}>
                        <HoverCard.Target>
                            <Box style={{ position: "relative" }}>
                                <AspectRatio ratio={3 / 4}>
                                    <Image src={card.imageUrl} alt={card.name} radius="md" style={{ cursor: 'pointer' }} onClick={() => setShowDetailsModal(true)} fallbackSrc="https://placehold.co/300x400/FF0000/FFFFFF?text=No+Image"/>
                                </AspectRatio>
                                {postitEffects}
                            </Box>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            {hoverCardContent}
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Stack>
            </Card>
            <Modal opened={showDetailsModal} size="xl" onClose={() => setShowDetailsModal(false)} title={<Title order={3} c="blue.3">{card.name} - 全能力</Title>} centered styles={{ content: { backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-blue-9)" }, header: { backgroundColor: "var(--mantine-color-dark-8)", borderBottom: '1px solid var(--mantine-color-dark-6)' } }}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Image src={card.imageUrl} alt={card.name} radius="md" fallbackSrc="https://placehold.co/300x420/FF0000/FFFFFF?text=No+Image" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <ScrollArea style={{ height: '100%', maxHeight: '60vh' }}>
                            <Stack gap="md">
                                {card.effects.map((eff, i) => (
                                    <Group key={`modal-effect-${i}`} wrap="nowrap" align="flex-start">
                                        <Box mt={4}>{EFFECT_MODES[eff.mode]}</Box>
                                        <Text size="sm" c="white" dangerouslySetInnerHTML={{ __html: eff.effect.replace(/\n/g, '<br/>') }} />
                                    </Group>
                                ))}
                            </Stack>
                        </ScrollArea>
                        <Button mt="md" fullWidth onClick={handleUseClick} disabled={!actionableEffect} color="blue">このカードを使用</Button>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

interface NemesisTokenCardProps {
  token: NemesisToken;
  count: number;
  onCountChange: (tokenId: string, change: number) => void;
  handCount: number;
}

const NemesisTokenCard: FC<NemesisTokenCardProps> = ({ token, count, onCountChange, handCount }) => (
    <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
      <Group justify="space-between" wrap="wrap">
        <Text size="sm" c="blue.4" fw={500}>{token.name}</Text>
        <Group gap="xs" wrap="nowrap">
            <ActionIcon variant="filled" color="red" size="sm" onClick={() => onCountChange(token.id, -1)} disabled={count <= 0}><IconMinus size={16} /></ActionIcon>
            <Text size="lg" fw="bold" c="cyan.1" miw={20} ta="center">{count}</Text>
            <ActionIcon variant="filled" color="blue" size="sm" onClick={() => onCountChange(token.id, 1)} disabled={handCount >= 9}><IconPlus size={16} /></ActionIcon>
        </Group>
      </Group>
    </Card>
);


// --- Main Application Component ---

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const theme = useMantineTheme();
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    turn: 1, ppMax: 1, ppCurrent: 1, ep: 2, sep: 2, handCount: 4, graveyardCount: 0,
    firstOrSecond: "first", leader: null, extraPPBonus: false, evolveUsedThisTurn: false,
  });
  const [ppMaxBonus, setPpMaxBonus] = useState(0);
  const [fairyCount, setFairyCount] = useState(0);
  const [artifactCounts, setArtifactCounts] = useState<Record<string, number>>({});
  const [tokenNotes, setTokenNotes] = useState("");
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [isLeaderModalOpened, setIsLeaderModalOpened] = useState(true);
  const [tempLeader, setTempLeader] = useState<Leader | null>(null);
  const [tempFirstOrSecond, setTempFirstOrSecond] = useState<'first' | 'second'>('first');
  const [synthesisState, setSynthesisState] = useState<SynthesisState>({ isModalOpen: false, targetId: null, baseMaterial: null, subMaterials: [], error: "" });

  const isEpUsable = useMemo(() => (gameState.firstOrSecond === "first" && gameState.turn >= 5) || (gameState.firstOrSecond === "second" && gameState.turn >= 4), [gameState.firstOrSecond, gameState.turn]);
  const isSepUsable = useMemo(() => (gameState.firstOrSecond === "first" && gameState.turn >= 7) || (gameState.firstOrSecond === "second" && gameState.turn >= 6), [gameState.firstOrSecond, gameState.turn]);
  
  const totalPpMax = useMemo(() => {
    const base = Math.min(10, gameState.turn);
    const dragonBonus = gameState.leader === 'dragon' ? ppMaxBonus : 0;
    const extra = gameState.extraPPBonus ? 1 : 0;
    return Math.min(10, base + dragonBonus) + extra;
  }, [gameState.turn, gameState.leader, ppMaxBonus, gameState.extraPPBonus]);

  const effectContext = useMemo((): EffectContext => ({
      turn: gameState.turn, pp: gameState.ppCurrent, ppMax: totalPpMax, ep: gameState.ep, sep: gameState.sep,
      graveyardCount: gameState.graveyardCount, evolveUsedThisTurn: gameState.evolveUsedThisTurn, isEpUsable, isSepUsable,
  }), [gameState, totalPpMax, isEpUsable, isSepUsable]);

  const totalKnownTokens = useMemo(() => {
    if (gameState.leader === "elf") return fairyCount;
    if (gameState.leader === "nemesis") return Object.values(artifactCounts).reduce((sum, count) => sum + (count || 0), 0);
    return 0;
  }, [gameState.leader, fairyCount, artifactCounts]);

  const addHistory = (action: string) => setGameHistory(prev => [{ turn: gameState.turn, action, pp: gameState.ppCurrent, hand: gameState.handCount }, ...prev].slice(0, 20));

  const resetGameStates = useCallback((keepSettings = false) => {
    setGameState(prev => ({
      turn: 1, ppMax: 1, ppCurrent: 1, ep: 2, sep: 2, handCount: 4, graveyardCount: 0,
      firstOrSecond: keepSettings ? prev.firstOrSecond : "first", 
      leader: keepSettings ? prev.leader : null, 
      extraPPBonus: false, 
      evolveUsedThisTurn: false,
    }));
    setPpMaxBonus(0); setFairyCount(0); setArtifactCounts({}); setTokenNotes(""); setGameHistory([]);
    if (!keepSettings) {
        setTempLeader(null);
        setTempFirstOrSecond('first');
        setIsLeaderModalOpened(true);
    }
  }, []);
  
  useEffect(() => setGameState(prev => ({ ...prev, ppMax: totalPpMax, ppCurrent: Math.min(prev.ppCurrent, totalPpMax) })), [totalPpMax]);
  
  const advanceTurn = useCallback(() => {
    setGameState(prev => {
      const newTurn = prev.turn + 1;
      const newBasePpMax = Math.min(10, newTurn);
      const dragonBonus = prev.leader === 'dragon' ? ppMaxBonus : 0;
      const extra = prev.extraPPBonus ? 1 : 0;
      const newTotalPpMax = Math.min(10, newBasePpMax + dragonBonus) + extra;
      
      addHistory(`ターン${newTurn}へ進行`);

      return { 
        ...prev, 
        turn: newTurn, 
        ppMax: newTotalPpMax, 
        ppCurrent: newTotalPpMax, 
        handCount: Math.min(prev.handCount + 1, 9), 
        evolveUsedThisTurn: false,
      };
    });
  }, [gameState.extraPPBonus, ppMaxBonus]);

  const handleUseCard = useCallback((card: CardData, effect: CardEffect) => {
      let newGraveyardCount = gameState.graveyardCount + 1;
      const necromancyEffect = card.effects.find(e => e.mode === 'necromancy' && isEffectActive(e, effectContext));
      if (necromancyEffect?.conditions.necromancyCost) newGraveyardCount = Math.max(0, gameState.graveyardCount - necromancyEffect.conditions.necromancyCost);
      setGameState(prev => ({ ...prev, ppCurrent: prev.ppCurrent - effect.cost, handCount: prev.handCount - 1, graveyardCount: newGraveyardCount }));
      addHistory(`${card.name} (${(EFFECT_MODES[effect.mode] as any).props.children})使用`);
  }, [gameState, effectContext]);

  const handlePpMaxBonusChange = (change: number) => setPpMaxBonus(prev => Math.max(0, Math.min(prev + change, 10 - Math.min(10, gameState.turn))));
  
  const handleEvolve = (type: 'ep' | 'sep') => {
      setGameState(prev => ({ ...prev, ep: type === 'ep' ? prev.ep - 1 : prev.ep, sep: type === 'sep' ? prev.sep - 1 : prev.sep, evolveUsedThisTurn: true }));
      addHistory(`${type.toUpperCase()} を使用`);
  }

  const handleArtifactCountChange = (tokenId: string, change: number) => setArtifactCounts(prev => ({ ...prev, [tokenId]: Math.max(0, (prev[tokenId] || 0) + change) }));
  
  useEffect(() => setGameState(prev => ({ ...prev, handCount: Math.max(prev.handCount, totalKnownTokens) })), [totalKnownTokens]);
  
  const executeSynthesis = (targetId: string, baseMaterial: string | null, subMaterials: string[]) => {
    const newCounts = { ...artifactCounts };
    let consumedCount = 0;
    
    const consume = (id: string, count = 1) => {
        if ((newCounts[id] || 0) < count) throw new Error(`${NEMESIS_ARTIFACT_TOKENS.find(t=>t.id===id)?.name}が足りません。`);
        newCounts[id] -= count;
        consumedCount += count;
    };

    try {
        if (baseMaterial) consume(baseMaterial);
        subMaterials.forEach(sub => consume(sub));

        newCounts[targetId] = (newCounts[targetId] || 0) + 1;
        
        setArtifactCounts(newCounts);
        setGameState(prev => ({ ...prev, handCount: prev.handCount - consumedCount + 1 }));
        const targetName = NEMESIS_ARTIFACT_TOKENS.find(t=>t.id === targetId)?.name;
        addHistory(`${targetName}を合成`);
        setSynthesisState({ isModalOpen: false, targetId: null, baseMaterial: null, subMaterials: [], error: "" });

    } catch (e: any) {
        setSynthesisState(prev => ({ ...prev, error: e.message }));
    }
  };
  
  const handleSynthesisClick = (targetId: string) => {
    let combinations: { baseMaterial: string; subMaterials: string[] }[] = [];

    switch (targetId) {
      case 'castle_artifact': {
        const past = artifactCounts['past_core'] || 0;
        const future = artifactCounts['future_core'] || 0;
        if (past >= 2) combinations.push({ baseMaterial: 'past_core', subMaterials: ['past_core'] });
        if (past >= 1 && future >= 1) combinations.push({ baseMaterial: 'past_core', subMaterials: ['future_core'] });
        break;
      }
      case 'attack_artifact': {
        const past = artifactCounts['past_core'] || 0;
        const future = artifactCounts['future_core'] || 0;
        if (future >= 2) combinations.push({ baseMaterial: 'future_core', subMaterials: ['future_core'] });
        if (future >= 1 && past >= 1) combinations.push({ baseMaterial: 'future_core', subMaterials: ['past_core'] });
        break;
      }
      case 'destroy_artifact_alpha': {
        const bases = ['castle_artifact', 'attack_artifact'].filter(id => (artifactCounts[id] || 0) > 0);
        const materials = ['past_core', 'future_core'].filter(id => (artifactCounts[id] || 0) > 0);
        bases.forEach(base => {
          materials.forEach(mat => {
            combinations.push({ baseMaterial: base, subMaterials: [mat] });
          });
        });
        break;
      }
      case 'destroy_artifact_beta': {
        const bases = ['castle_artifact', 'attack_artifact'].filter(id => (artifactCounts[id] || 0) > 0);
        const past = artifactCounts['past_core'] || 0;
        const future = artifactCounts['future_core'] || 0;
        bases.forEach(base => {
          if (past >= 2) combinations.push({ baseMaterial: base, subMaterials: ['past_core', 'past_core'] });
          if (past >= 1 && future >= 1) combinations.push({ baseMaterial: base, subMaterials: ['past_core', 'future_core'] });
          if (future >= 2) combinations.push({ baseMaterial: base, subMaterials: ['future_core', 'future_core'] });
        });
        break;
      }
      case 'destroy_artifact_gamma': {
        const bases = ['castle_artifact', 'attack_artifact'].filter(id => (artifactCounts[id] || 0) > 0);
        const materials = ['castle_artifact', 'attack_artifact', 'destroy_artifact_alpha', 'destroy_artifact_beta', 'destroy_artifact_gamma'].filter(id => (artifactCounts[id] || 0) > 0);
        bases.forEach(base => {
          materials.forEach(mat => {
            if (base === mat) {
              if ((artifactCounts[base] || 0) >= 2) {
                combinations.push({ baseMaterial: base, subMaterials: [mat] });
              }
            } else {
              combinations.push({ baseMaterial: base, subMaterials: [mat] });
            }
          });
        });
        break;
      }
      case 'exceed_artifact_omega': {
        if ((artifactCounts['destroy_artifact_alpha'] || 0) >= 1 && (artifactCounts['destroy_artifact_beta'] || 0) >= 1 && (artifactCounts['destroy_artifact_gamma'] || 0) >= 1) {
          combinations.push({ baseMaterial: 'destroy_artifact_alpha', subMaterials: ['destroy_artifact_beta', 'destroy_artifact_gamma'] });
        }
        break;
      }
    }

    const uniqueCombinations = Array.from(new Map(combinations.map(item => [JSON.stringify(item.subMaterials.sort()), item])).values());

    if (uniqueCombinations.length === 1) {
      const { baseMaterial, subMaterials } = uniqueCombinations[0];
      executeSynthesis(targetId, baseMaterial, subMaterials);
    } else {
      setSynthesisState({ isModalOpen: true, targetId, baseMaterial: null, subMaterials: [], error: "" });
    }
  };

  const filteredCards = useMemo(() => {
    if (gameState.handCount === 0 || !gameState.leader) return [];
    return REMOVAL_CARDS.filter(card => (card.leader === gameState.leader || card.leader === "neutral") && getActionableEffect(card, effectContext) !== null)
      .sort((a, b) => (getActionableEffect(b, effectContext)?.cost ?? 0) - (getActionableEffect(a, effectContext)?.cost ?? 0));
  }, [gameState.leader, gameState.handCount, effectContext]);

  const currentLeaderLabel = useMemo(() => {
    return LEADERS.find((l) => l.value === gameState.leader)?.label || "リーダーを選択";
  }, [gameState.leader]);

  const synthesisModalContent = useMemo(() => {
    if (!synthesisState.targetId) return null;
    
    const { targetId, baseMaterial, subMaterials } = synthesisState;
    const counts = { ...artifactCounts };
    if (baseMaterial) counts[baseMaterial] = (counts[baseMaterial] || 0) - 1;
    subMaterials.forEach(sub => { counts[sub] = (counts[sub] || 0) - 1; });

    const renderRadioGroup = (title: string, options: string[], value: string | null, onChange: (value: string) => void, availableCounts: Record<string, number>) => (
        <Stack>
            <Text fw={500} c="gray.2">{title}</Text>
            <Radio.Group value={value} onChange={onChange}>
                <Group>
                    {options
                        .filter(id => (availableCounts[id] || 0) > 0 || id === value)
                        .map(id => {
                            const token = NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id);
                            if (!token) return null;
                            return <Radio key={id} value={id} label={`${token.name} (${availableCounts[id] || 0})`} styles={{ label: { color: theme.colors.gray[2] } }} />;
                        })}
                </Group>
            </Radio.Group>
        </Stack>
    );

    const renderCheckboxGroup = (title: string, options: string[], value: string[], onChange: (value: string[]) => void, availableCounts: Record<string, number>, limit: number) => (
        <Stack>
            <Text fw={500} c="gray.2">{title}</Text>
            <Checkbox.Group value={value} onChange={onChange}>
                <Group>
                    {options
                        .filter(id => (availableCounts[id] || 0) > 0 || value.includes(id))
                        .map(id => {
                            const token = NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id);
                            if (!token) return null;
                            const isDisabled = (value.length >= limit && !value.includes(id));
                            return <Checkbox key={id} value={id} label={`${token.name} (${availableCounts[id] || 0})`} disabled={isDisabled} styles={{ label: { color: theme.colors.gray[2] } }} />;
                        })}
                </Group>
            </Checkbox.Group>
        </Stack>
    );
    
    switch(targetId) {
        case 'castle_artifact':
            return <>
                {renderRadioGroup("合成元 (1枚)", ['past_core'], baseMaterial, (v) => setSynthesisState(p => ({...p, baseMaterial: v, subMaterials: []})), artifactCounts)}
                {renderRadioGroup("合成素材 (1枚)", ['past_core', 'future_core'], subMaterials[0] || null, (v) => setSynthesisState(p => ({...p, subMaterials: [v]})), counts)}
            </>;
        case 'attack_artifact':
            return <>
                {renderRadioGroup("合成元 (1枚)", ['future_core'], baseMaterial, (v) => setSynthesisState(p => ({...p, baseMaterial: v, subMaterials: []})), artifactCounts)}
                {renderRadioGroup("合成素材 (1枚)", ['past_core', 'future_core'], subMaterials[0] || null, (v) => setSynthesisState(p => ({...p, subMaterials: [v]})), counts)}
            </>;
        case 'destroy_artifact_alpha':
            return <>
                {renderRadioGroup("合成元 (1枚)", ['castle_artifact', 'attack_artifact'], baseMaterial, (v) => setSynthesisState(p => ({...p, baseMaterial: v, subMaterials: []})), artifactCounts)}
                {renderRadioGroup("合成素材 (1枚)", ['past_core', 'future_core'], subMaterials[0] || null, (v) => setSynthesisState(p => ({...p, subMaterials: [v]})), counts)}
            </>
        case 'destroy_artifact_beta':
            return <>
                {renderRadioGroup("合成元 (1枚)", ['castle_artifact', 'attack_artifact'], baseMaterial, (v) => setSynthesisState(p => ({...p, baseMaterial: v, subMaterials: []})), artifactCounts)}
                {renderCheckboxGroup("合成素材 (2枚)", ['past_core', 'future_core'], subMaterials, (v) => setSynthesisState(p => ({...p, subMaterials: v})), counts, 2)}
            </>
        case 'destroy_artifact_gamma':
            return <>
                {renderRadioGroup("合成元 (1枚)", ['castle_artifact', 'attack_artifact'], baseMaterial, (v) => setSynthesisState(p => ({...p, baseMaterial: v, subMaterials: []})), artifactCounts)}
                {renderRadioGroup("合成素材 (1枚)", ['castle_artifact', 'attack_artifact', 'destroy_artifact_alpha', 'destroy_artifact_beta', 'destroy_artifact_gamma'], subMaterials[0] || null, (v) => setSynthesisState(p => ({...p, subMaterials: [v]})), counts)}
            </>
        case 'exceed_artifact_omega':
            return <>
                {renderRadioGroup("合成元 (1枚)", ['destroy_artifact_alpha'], baseMaterial, (v) => setSynthesisState(p => ({...p, baseMaterial: v, subMaterials: []})), artifactCounts)}
                {renderCheckboxGroup("合成素材 (2枚)", ['destroy_artifact_beta', 'destroy_artifact_gamma'], subMaterials, (v) => setSynthesisState(p => ({...p, subMaterials: v})), counts, 2)}
            </>
        default: return null;
    }
  }, [synthesisState, artifactCounts]);

  const isSynthesisDisabled = useMemo(() => {
    const { targetId, baseMaterial, subMaterials } = synthesisState;
    if (!baseMaterial && targetId !== 'exceed_artifact_omega') return true; 
    switch(targetId) {
        case 'castle_artifact': return !(baseMaterial === 'past_core' && subMaterials.length === 1);
        case 'attack_artifact': return !(baseMaterial === 'future_core' && subMaterials.length === 1);
        case 'destroy_artifact_alpha': return !(baseMaterial && subMaterials.length === 1);
        case 'destroy_artifact_beta': return !(baseMaterial && subMaterials.length === 2);
        case 'destroy_artifact_gamma': return !(baseMaterial && subMaterials.length === 1);
        case 'exceed_artifact_omega': return !(baseMaterial === 'destroy_artifact_alpha' && subMaterials.length === 2 && subMaterials.includes('destroy_artifact_beta') && subMaterials.includes('destroy_artifact_gamma'));
        default: return true;
    }
  }, [synthesisState]);

  const tokenGroups = {
    puppets: { ids: ['puppet', 'enhanced_puppet'] },
    cores: { ids: ['past_core', 'future_core'] },
    intermediate: { ids: ['castle_artifact', 'attack_artifact'] },
    destroy: { ids: ['destroy_artifact_alpha', 'destroy_artifact_beta', 'destroy_artifact_gamma'] },
    final: { ids: ['exceed_artifact_omega'] },
  };
  
  const disabledButtonStyles = {
    root: {
      '&[data-disabled]': {
        backgroundColor: theme.colors.dark[6],
        borderColor: theme.colors.dark[5],
        color: theme.colors.dark[3],
        cursor: 'not-allowed',
      },
    }
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned((p) => !p);
  };

  const handleConfirmInitialSettings = () => {
    if (!tempLeader) return;
    resetGameStates(false);
    setGameState(prev => ({
        ...prev,
        leader: tempLeader,
        firstOrSecond: tempFirstOrSecond,
    }));
    setIsLeaderModalOpened(false);
  };

  const openChangeSettingsModal = () => {
    setTempLeader(gameState.leader);
    setTempFirstOrSecond(gameState.firstOrSecond);
    setIsLeaderModalOpened(true);
  };


  if (!isClient) {
    return null; // Render nothing until the component has mounted on the client
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{ 
        main: { background: "linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0d1117 100%)" },
        header: { backgroundColor: theme.colors.dark[8], borderBottom: `1px solid ${theme.colors.dark[6]}` }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
            <Group>
                <Title order={isMobile ? 4 : 2} c="blue.1">シャドバ対戦補助ツール</Title>
                <Card withBorder p="xs" radius="md" style={{backgroundColor: 'transparent', cursor: 'pointer'}} onClick={openChangeSettingsModal}>
                    <Group>
                        <IconUsers size={20} color={theme.colors.blue[4]} />
                        <Text size="sm" c="blue.2" fw={500} truncate>{currentLeaderLabel} / {gameState.firstOrSecond === 'first' ? '先手' : '後手'}</Text>
                    </Group>
                </Card>
            </Group>
            <ActionIcon variant="filled" color="red" size="lg" radius="xl" onClick={() => resetGameStates(true)} title="ゲーム状態をリセット"><IconRefresh size={20} /></ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Stack>
            <Card withBorder radius="md" p={0} style={{backgroundColor: theme.colors.dark[8], border: `1px solid ${theme.colors.dark[6]}`}}
                onMouseEnter={() => !isPinned && setDetailsOpened(true)}
                onMouseLeave={() => !isPinned && setDetailsOpened(false)}
            >
                <Group justify="space-between" p="xs" wrap="nowrap">
                    <Group gap="xs">
                        <ActionIcon variant="transparent" color={isPinned ? 'blue' : 'gray'} onClick={handlePinClick}>
                            <IconPin size={20} style={{ transform: isPinned ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </ActionIcon>
                         <ActionIcon variant="transparent" c="blue.4" onClick={() => setDetailsOpened(o => !o)}>
                            <IconChevronDown size={20} style={{ transform: detailsOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </ActionIcon>
                        <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                            <Button onClick={() => handleEvolve('ep')} disabled={gameState.ep === 0 || gameState.evolveUsedThisTurn || !isEpUsable} size="xs" color="blue" variant="outline" styles={disabledButtonStyles}>EP ({gameState.ep})</Button>
                            <Button onClick={() => handleEvolve('sep')} disabled={gameState.sep === 0 || gameState.evolveUsedThisTurn || !isSepUsable} size="xs" color="violet" variant="outline" styles={disabledButtonStyles}>SEP ({gameState.sep})</Button>
                            <Button onClick={advanceTurn} size="xs" variant="gradient" gradient={{ from: "blue.8", to: "blue.6" }} leftSection={<IconSword size={14} />}>次ターンへ</Button>
                        </Group>
                    </Group>
                    <Group>
                        <Text fw={500} c="blue.2">ターン: {gameState.turn}</Text>
                        <Divider orientation="vertical" />
                        <Text fw={500} c="blue.2">手札: {gameState.handCount}</Text>
                        <Divider orientation="vertical" />
                        <Text fw={500} c="blue.2">PP: {gameState.ppCurrent}/{totalPpMax}</Text>
                    </Group>
                </Group>
                <Collapse in={detailsOpened}>
                    <Box p="md" style={{borderTop: `1px solid ${theme.colors.dark[6]}`}}>
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                            <Stack>
                                <DotSelector value={gameState.turn} max={10} onChange={(v) => setGameState(p => ({...p, turn: v}))} label="ターン数" />
                                <DotSelector value={gameState.handCount} max={9} onChange={(v) => setGameState(p => ({...p, handCount: v}))} label="相手の手札枚数" knownCount={totalKnownTokens} knownColor={gameState.leader === 'elf' ? 'green' : 'cyan'} />
                            </Stack>
                            <Stack>
                                <DotSelector value={gameState.ppCurrent} max={totalPpMax} onChange={(v) => setGameState(p => ({...p, ppCurrent: v}))} label={`現在のPP（上限: ${totalPpMax}）`} />
                                {gameState.leader === "dragon" && <Group grow><Button onClick={() => handlePpMaxBonusChange(-1)} color="red" size="xs" variant="light">PP上限 -1</Button><Button onClick={() => handlePpMaxBonusChange(1)} size="xs" variant="light" color="blue">PP上限 +1</Button></Group>}
                                {gameState.firstOrSecond === "second" && <Switch label="エクストラPP" checked={gameState.extraPPBonus} color="blue" onChange={(e) => {
                                    const checked = e.currentTarget.checked;
                                    setGameState(p => {
                                        const newTotalPpMax = (() => {
                                        const base = Math.min(10, p.turn);
                                        const dragonBonus = p.leader === 'dragon' ? ppMaxBonus : 0;
                                        const extra = checked ? 1 : 0;
                                        return Math.min(10, base + dragonBonus) + extra;
                                        })();
                                        
                                        let newPpCurrent = p.ppCurrent;
                                        if (checked) {
                                        newPpCurrent = p.ppCurrent + 1;
                                        }
                                        
                                        newPpCurrent = Math.min(newPpCurrent, newTotalPpMax);

                                        return {
                                        ...p,
                                        extraPPBonus: checked,
                                        ppMax: newTotalPpMax,
                                        ppCurrent: newPpCurrent,
                                        };
                                    });
                                }} styles={{label: {color: 'white'}}} />}
                            </Stack>
                            <Stack>
                                {gameState.leader === "nightmare" && 
                                    <Card withBorder p="sm" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                                        <Group justify="space-between">
                                            <Text size="sm" c="blue.3">墓地枚数</Text>
                                            <Group gap="xs" wrap="nowrap">
                                                <ActionIcon variant="light" color="red" size="md" onClick={() => setGameState(p => ({...p, graveyardCount: p.graveyardCount - 1}))} disabled={gameState.graveyardCount <= 0}><IconMinus size={16} /></ActionIcon>
                                                <NumberInput value={gameState.graveyardCount} onChange={(v) => setGameState(p => ({...p, graveyardCount: Number(v)}))} hideControls styles={{ input: { textAlign: 'center', backgroundColor: "var(--mantine-color-dark-6)", color: "var(--mantine-color-blue-1)", border: "1px solid var(--mantine-color-dark-4)", width: rem(60) } }} />
                                                <ActionIcon variant="light" color="blue" size="md" onClick={() => setGameState(p => ({...p, graveyardCount: p.graveyardCount + 1}))}><IconPlus size={16} /></ActionIcon>
                                            </Group>
                                        </Group>
                                    </Card>
                                }
                                <DotSelector value={gameState.ep} max={2} onChange={(v) => setGameState(p => ({...p, ep: v}))} label="進化ポイント(EP)" />
                                <DotSelector value={gameState.sep} max={2} onChange={(v) => setGameState(p => ({...p, sep: v}))} label="超進化ポイント(SEP)" />
                            </Stack>
                        </SimpleGrid>
                    </Box>
                </Collapse>
            </Card>

            <Tabs defaultValue="removal" color="blue" h="100%" display="flex" style={{flexDirection: 'column', flexGrow: 1}}>
                <Tabs.List>
                    <Tabs.Tab value="removal" leftSection={<IconSword size={16} />} style={{color: 'white'}}>除去カード</Tabs.Tab>
                    <Tabs.Tab value="tokens" leftSection={<IconBoxMultiple size={16} />} style={{color: 'white'}}>トークン管理</Tabs.Tab>
                    <Tabs.Tab value="history" leftSection={<IconHistory size={16} />} style={{color: 'white'}}>ゲーム履歴</Tabs.Tab>
                </Tabs.List>
                <Box style={{flex: 1, overflow: 'hidden', paddingTop: rem(10)}}>
                    <ScrollArea h="100%">
                        <Tabs.Panel value="removal">
                            <Title order={3} c="blue.3" mb="md">使用可能な除去カード</Title>
                            {filteredCards.length > 0 ? (
                                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing="sm">
                                    {filteredCards.map((card) => <RemovalCardBlock key={card.id} card={card} onUseCard={handleUseCard} effectContext={effectContext} />)}
                                </SimpleGrid>
                            ) : <Text c="blue.4">現在使用可能な除去カードはありません。</Text>}
                        </Tabs.Panel>
                        <Tabs.Panel value="tokens">
                            <Stack gap="md">
                                <Title order={3} c="blue.3">トークン・特殊効果メモ</Title>
                                {gameState.leader === 'elf' && <Card withBorder p="md" style={{backgroundColor: 'var(--mantine-color-dark-7)'}}><DotSelector value={fairyCount} max={gameState.handCount} onChange={setFairyCount} label="確定フェアリー数" /></Card>}
                                {gameState.leader === 'nemesis' && (
                                    <Grid gutter="xl">
                                        <Grid.Col span={{ base: 12, lg: 7 }}>
                                            <Stack>
                                                <Title order={4} c="blue.3">トークン所持数</Title>
                                                {Object.values(tokenGroups).map((group, index) => (
                                                    <SimpleGrid key={index} cols={group.ids.length > 2 ? 3 : (group.ids.length > 1 ? 2 : 1)} spacing="sm">
                                                        {group.ids.map(id => {
                                                            const token = NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id);
                                                            if (!token) return null;
                                                            return <NemesisTokenCard key={id} token={token} count={artifactCounts[id] || 0} onCountChange={handleArtifactCountChange} handCount={gameState.handCount} />
                                                        })}
                                                    </SimpleGrid>
                                                ))}
                                            </Stack>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, lg: 5 }}>
                                            <Stack>
                                                <Title order={4} c="blue.3">アーティファクト合成</Title>
                                                <SimpleGrid cols={2} spacing="sm">
                                                    <Button onClick={() => handleSynthesisClick('castle_artifact')} disabled={!((artifactCounts['past_core'] || 0) >= 1 && ((artifactCounts['past_core'] || 0) -1 + (artifactCounts['future_core'] || 0) >= 1))} styles={disabledButtonStyles}>キャッスル合成</Button>
                                                    <Button onClick={() => handleSynthesisClick('attack_artifact')} disabled={!((artifactCounts['future_core'] || 0) >= 1 && ((artifactCounts['future_core'] || 0) -1 + (artifactCounts['past_core'] || 0) >= 1))} styles={disabledButtonStyles}>アタック合成</Button>
                                                </SimpleGrid>
                                                <SimpleGrid cols={3} spacing="sm">
                                                    <Button onClick={() => handleSynthesisClick('destroy_artifact_alpha')} disabled={!(((artifactCounts['castle_artifact'] || 0) + (artifactCounts['attack_artifact'] || 0) >= 1) && ((artifactCounts['past_core'] || 0) + (artifactCounts['future_core'] || 0) >= 1))} styles={disabledButtonStyles}>デストロイα</Button>
                                                    <Button onClick={() => handleSynthesisClick('destroy_artifact_beta')} disabled={!(((artifactCounts['castle_artifact'] || 0) + (artifactCounts['attack_artifact'] || 0) >= 1) && ((artifactCounts['past_core'] || 0) + (artifactCounts['future_core'] || 0) >= 2))} styles={disabledButtonStyles}>デストロイβ</Button>
                                                    <Button onClick={() => handleSynthesisClick('destroy_artifact_gamma')} disabled={!(((artifactCounts['castle_artifact'] || 0) + (artifactCounts['attack_artifact'] || 0) + (artifactCounts['destroy_artifact_alpha'] || 0) + (artifactCounts['destroy_artifact_beta'] || 0) + (artifactCounts['destroy_artifact_gamma'] || 0)) >= 2)} styles={disabledButtonStyles}>デストロイγ</Button>
                                                </SimpleGrid>
                                                <Button onClick={() => handleSynthesisClick('exceed_artifact_omega')} disabled={!((artifactCounts['destroy_artifact_alpha'] || 0) >= 1 && (artifactCounts['destroy_artifact_beta'] || 0) >= 1 && (artifactCounts['destroy_artifact_gamma'] || 0) >= 1)} styles={disabledButtonStyles}>イクシードΩ合成</Button>
                                            </Stack>
                                        </Grid.Col>
                                    </Grid>
                                )}
                                {(gameState.leader !== 'elf' && gameState.leader !== 'nemesis') && <Text c="blue.4">このクラスには特定のトークン管理機能はありません。</Text>}
                                <Textarea placeholder="生成されたトークンや特殊効果について記録..." value={tokenNotes} onChange={(e) => setTokenNotes(e.currentTarget.value)} minRows={4} autosize styles={{ input: { backgroundColor: "var(--mantine-color-dark-7)", color: "var(--mantine-color-blue-2)" } }} />
                            </Stack>
                        </Tabs.Panel>
                        <Tabs.Panel value="history">
                            <Stack gap="xs">{gameHistory.map((entry, index) => <Card key={index} withBorder p="xs" style={{backgroundColor: 'var(--mantine-color-dark-7)'}}><Group justify="space-between"><Text size="sm" c="blue.2"><Text span c="dimmed" mr={5}>T{entry.turn}:</Text> {entry.action}</Text><Text size="sm" c="dimmed">PP: {entry.pp} / 手札: {entry.hand}</Text></Group></Card>)}</Stack>
                        </Tabs.Panel>
                    </ScrollArea>
                </Box>
            </Tabs>
        </Stack>
      </AppShell.Main>

      <Modal opened={isLeaderModalOpened} onClose={() => setIsLeaderModalOpened(false)} title={<Title order={3} c="blue.3">リーダーと先攻/後攻を選択</Title>} centered styles={{ content: { backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-blue-9)" }, header: { backgroundColor: "var(--mantine-color-dark-8)", borderBottom: '1px solid var(--mantine-color-dark-6)' } }}>
        <Stack>
            <Grid gutter="md">{LEADERS.map((leaderOption) => <Grid.Col span={6} key={leaderOption.value}><Card shadow="sm" withBorder p="md" onClick={() => setTempLeader(leaderOption.value)} style={{ cursor: 'pointer', backgroundColor: leaderOption.value === tempLeader ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-7)', borderColor: leaderOption.value === tempLeader ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-5)', textAlign: 'center' }}><Text size="lg" fw={700} c={leaderOption.value === tempLeader ? 'white' : 'blue.2'}>{leaderOption.label}</Text></Card></Grid.Col>)}</Grid>
            <Divider my="sm" />
            <Grid gutter="md">
                <Grid.Col span={6}>
                    <Card shadow="sm" withBorder p="md" onClick={() => setTempFirstOrSecond('first')} style={{ cursor: 'pointer', backgroundColor: tempFirstOrSecond === 'first' ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-7)', borderColor: tempFirstOrSecond === 'first' ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-5)', textAlign: 'center' }}>
                        <Text size="lg" fw={700} c={tempFirstOrSecond === 'first' ? 'white' : 'blue.2'}>先手</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Card shadow="sm" withBorder p="md" onClick={() => setTempFirstOrSecond('second')} style={{ cursor: 'pointer', backgroundColor: tempFirstOrSecond === 'second' ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-7)', borderColor: tempFirstOrSecond === 'second' ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-5)', textAlign: 'center' }}>
                        <Text size="lg" fw={700} c={tempFirstOrSecond === 'second' ? 'white' : 'blue.2'}>後手</Text>
                    </Card>
                </Grid.Col>
            </Grid>
            <Group grow>
                <Button variant="default" onClick={() => setIsLeaderModalOpened(false)}>キャンセル</Button>
                <Button disabled={!tempLeader} onClick={handleConfirmInitialSettings}>決定</Button>
            </Group>
        </Stack>
      </Modal>

      <Modal opened={synthesisState.isModalOpen} onClose={() => setSynthesisState({ isModalOpen: false, targetId: null, baseMaterial: null, subMaterials: [], error: "" })} title={<Title order={3} c="blue.3">素材を選択して合成</Title>} centered styles={{ content: { backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-blue-9)" }, header: { backgroundColor: "var(--mantine-color-dark-8)", borderBottom: '1px solid var(--mantine-color-dark-6)' } }}>
        <Stack>
            <Title order={5} c="gray.2">合成ターゲット: {NEMESIS_ARTIFACT_TOKENS.find(t => t.id === synthesisState.targetId)?.name}</Title>
            <Divider />
            {synthesisModalContent}
            {synthesisState.error && <Text c="red" size="sm">{synthesisState.error}</Text>}
            <Button onClick={() => executeSynthesis(synthesisState.targetId!, synthesisState.baseMaterial, synthesisState.subMaterials)} disabled={isSynthesisDisabled}>合成実行</Button>
        </Stack>
      </Modal>
    </AppShell>
  );
}
