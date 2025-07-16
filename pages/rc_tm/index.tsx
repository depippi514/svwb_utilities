"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import {
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
  Collapse,
  Modal,
  Checkbox,
  NumberInput,
  HoverCard, // HoverCardをインポート
  Image,
  Container,
  Box,
} from "@mantine/core"
import { IconCircleFilled, IconCircle, IconSword, IconShield, IconBrain, IconHistory, IconChevronDown, IconChevronUp, IconUsers, IconRefresh, IconPlus, IconMinus, IconBoxMultiple } from "@tabler/icons-react"

// --- Constants & Data Definitions ---
90
const CARD_TYPES = {
  // miwを調整し、フォロワーとスペルのバッジの幅を揃え、サイズを大きくしました
  follower: <Badge miw={100} size="lg" color="blue" variant="light" c="white">フォロワー</Badge>,
  spell: <Badge miw={100} size="lg" color="blue" variant="light" c="white">スペル</Badge>,
}

const EFFECT_MODES = {
  default: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}}  miw={90} color="gray" variant="filled">基本効果</Badge>,
  enhance: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}}  miw={90} color="orange" variant="filled">エンハンス</Badge>,
  evolve: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="yellow" variant="filled">進化</Badge>,
  super_evolve: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="violet" variant="filled">超進化</Badge>,
  necromancy: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="grape" variant="filled">ネクロマンス</Badge>, // Added necromancy
  awakening: <Badge styles={{label: {textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`,},}} style={{border:"2px solid white"}} miw={90} color="red" variant="filled">覚醒</Badge>, // Added awakening
}
const THREAT_COLORS = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "blue",
}

const THREAT_LABELS = {
  critical: "最重要",
  high: "重要",
  medium: "注意",
  low: "軽微",
}

const REMOVAL_CARDS = [
  {
    id: "royal1",
    name: "勇猛のルミナスランサー",
    type: "follower",
    leader: "royal",
    baseCost: 2,
    attack: 1,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "ナイト1枚を自分の場に出す。<br> 自分の兵士・フォロワーが場に出たとき、それは【突進】を持つ" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/勇猛のルミナスランサー.png", // Placeholder image
  },{
    id: "royal2",
    name: "異端の侍",
    type: "follower",
    leader: "royal",
    baseCost: 2,
    attack: 2,
    toughness: 1,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "超進化可能ターンなら、これは【必殺】を持つ<br>【突進】" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/異端の侍.png", // Placeholder image
  },{
    id: "royal3",
    name: "刹那のクイックブレイダー",
    type: "follower",
    leader: "royal",
    baseCost: 1,
    attack: 1,
    toughness: 1,
    effects: [
      { mode: "default", cost: 1, conditions: {}, effect: "【疾走】" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/刹那のクイックブレイダー.png", // Placeholder image
  },{
    id: "royal4",
    name: "ミリタリードッグ",
    type: "follower",
    leader: "royal",
    baseCost: 3,
    attack: 4,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "突進" },
      { mode: "enhance", cost: 6, conditions: {}, effect: "【6コスト】ミリタリードッグ2枚を自分の場に出す" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/ミリタリードッグ.png", // Placeholder image
  },{
    id: "royal5",
    name: "サイレントスナイパー・ワルツ",
    type: "follower",
    leader: "royal",
    baseCost: 3,
    attack: 2,
    toughness: 1,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それに5ダメージ" },
      { mode: "enhance", cost: 6, conditions: {}, effect: "【6コスト】これは+2/+2して【潜伏】を持つ" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/サイレントスナイパー・ワルツ.png", // Placeholder image
  },{
    id: "royal6",
    name: "レヴィオンの迅雷・アルベール",
    type: "follower",
    leader: "royal",
    baseCost: 5,
    attack: 3,
    toughness: 5,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "【疾走】" },
      { mode: "enhance", cost: 9, conditions: {}, effect: "【9コスト】相手の場のフォロワーすべてに3ダメージ。これは「1ターンに2回攻撃できる。」をもつ" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/レヴィオンの迅雷・アルベール.png", // Placeholder image
  },{
    id: "royal7",
    name: "レヴィオンアックス・ジェノ",
    type: "follower",
    leader: "royal",
    baseCost: 7,
    attack: 7,
    toughness: 6,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "【突進】<br>1ターンに2回攻撃できる。<br>【攻撃時】これは【バリア】を持つ。ナイト1枚を自分の場に出す" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/レヴィオンアックス・ジェノ.png", // Placeholder image
  },{
    id: "royal8",
    name: "テンタクルバイト",
    type: "spell",
    leader: "royal",
    baseCost: 7,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "相手の場のフォロワー1枚か相手のリーダーを選ぶ。それに5ダメージ。自分のリーダーを5回復" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/テンタクルバイト.png", // Placeholder image
  },{
    id: "royal9",
    name: "ケンタウロスの騎士",
    type: "follower",
    leader: "royal",
    baseCost: 8,
    attack: 7,
    toughness: 5,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "【疾走】" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/ケンタウロスの騎士.png", // Placeholder image
  },{
    id: "royal10",
    name: "煌刃の勇者・アマリア",
    type: "follower",
    leader: "royal",
    baseCost: 8,
    attack: 6,
    toughness: 6,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "スティールナイト(2/2)4枚を自分の場に出す。<br>自分の他のフォロワーが場に出たとき、それは+1/+0して【突進】と【守護】を持つ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/煌刃の勇者・アマリア.png", // Placeholder image
  },{
    id: "royal11",
    name: "剣士の斬撃",
    type: "spell",
    leader: "royal",
    baseCost: 4,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それを破壊。『スティールナイト』1枚を自分の場に出す。s" },
    ],
    imageUrl: "/svwb_utilities/img/1/royal/剣士の斬撃.png", // Placeholder image
  },

  
  {
    id: "neutral1",
    name: "楽朗の天宮・フィルドア",
    type: "follower",
    leader: "neutral",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それを破壊' },
    ],
    imageUrl: "/svwb_utilities/img/1/neutral/楽朗の天宮・フィルドア.png", // Placeholder image
  },{
    id: "neutral2",
    name: "迸る巧妙・アポロン",
    type: "follower",
    leader: "neutral",
    baseCost: 3,
    attack: 1,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "敵全体に1ダメージ" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: "敵全体に1ダメージ" },
    ],
    imageUrl: "/svwb_utilities/img/1/neutral/迸る巧妙・アポロン.png", // Placeholder image
  },{
    id: "neutral3",
    name: "神の雷霆",
    type: "spell",
    leader: "neutral",
    baseCost: 4,
    effects: [{ mode: "default", cost: 5, conditions: {}, effect: "相手の場の攻撃力最大のフォロワーからランダムに1枚を破壊。相手の場のフォロワーすべてに1ダメージ" }],
    imageUrl: "/svwb_utilities/img/1/neutral/神の雷霆.png", // Placeholder image
  },{
    id: "neutral5",
    name: "勇壮の堕天使・オリヴィエ",
    type: "follower",
    leader: "neutral",
    baseCost: 7,
    attack: 4,
    toughness: 4,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "自分のデッキから2枚引く。自分のリーダーを2回復。自分のPPを2回復" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: "自分の場の他の進化前野フォロワーを1枚選ぶ。それは超進化する" },
    ],
    imageUrl: "/svwb_utilities/img/1/neutral/勇壮の堕天使・オリヴィエ.png", // Placeholder image
  },
  {
    id: "elf1",
    name: "アドエンチャーエルフ・メイ",
    type: "follower",
    leader: "elf",
    baseCost: 1,
    attack: 1,
    toughness: 1,
    effects: [
      { mode: "default", cost: 1, conditions: {}, effect: "【コンボ_3】相手の場のフォロワー1枚を選ぶ。それに3ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/アドエンチャーエルフ・メイ.png", // Placeholder image
  },{
    id: "elf2",
    name: "虫の知らせ",
    type: "spell",
    leader: "elf",
    baseCost: 1,
    effects: [
      { mode: "default", cost: 1, conditions: {}, effect: "自分の場のカード1枚を選ぶ。それを手札に戻す。相手の場のフォロワーからランダム1枚に2ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/虫の知らせ.png", // Placeholder image
  },{
    id: "elf3",
    name: "ピュアクリスタリア・リリィ",
    type: "follower",
    leader: "elf",
    baseCost: 2,
    attack: 1,
    toughness: 3,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "【コンボ_3】相手の場のフォロワー1枚を選ぶ。それは体力1になる。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '自分のデッキから1枚を引く。相手の場のフォロワー1枚を選ぶ。それに1ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/ピュアクリスタリア・リリィ.png", // Placeholder image
  },{
    id: "elf4",
    name: "殺戮のリノセウス",
    type: "follower",
    leader: "elf",
    baseCost: 3,
    attack: 0,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "これは+X/+0する。Xは自分の【コンボ】である。<br>【疾走】" },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/殺戮のリノセウス.png", // Placeholder image
  },{
    id: "elf5",
    name: "ビギンズブレイダー・アマツ",
    type: "follower",
    leader: "elf",
    baseCost: 3,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "これは+X/+Xする。Xは自分の手札の妖精フォロワーの枚数である。<br>【守護】" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '「相手の場のフォロワーからランダム1枚に1ダメージ。」をX回行う。Xは自分の手札の妖精フォロワーの枚数である。' },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/ビギンズブレイダー・アマツ.png", // Placeholder image
  },{
    id: "elf6",
    name: "薫交の天宮・バックウッド",
    type: "follower",
    leader: "elf",
    baseCost: 5,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "自分のデッキから2枚を引く。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワーすべてにXダメージを割りふる。Xは自分の手札の枚数である。' },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/薫交の天宮・バックウッド.png", // Placeholder image
  },{
    id: "elf7",
    name: "煌撃の戦士・ベイル",
    type: "follower",
    leader: "elf",
    baseCost: 8,
    attack: 4,
    toughness: 4,
    effects: [
      { mode: "default", cost: 0, conditions: {}, effect: "手札で働く。自分のフォロワーが場を離れたとき、これのコストを-1する。<br>【ファンファーレ】相手の場のフォロワー1枚を選ぶ。それに4ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/elf/煌撃の戦士・ベイル.png", // Placeholder image
  }, {
    id: "witch1",
    name: "ストームブラスト",
    type: "spell",
    leader: "witch",
    baseCost: 1,
    effects: [
      { mode: "default", cost: 1, conditions: {}, effect: "Xは2から始まる。<br>【スペルブースト時】これのXを+1する。<br>相手の場のフォロワー1枚を選ぶ。それにXダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/ストームブラスト.png", // Placeholder image
  },{
    id: "witch2",
    name: "アドラブルティーチャー・ミラ",
    type: "follower",
    leader: "witch",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "自分の手札すべては1回スペルブーストする。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それに3ダメージ。自分の手札すべては1回スペルブーストする。' }
    ],
    imageUrl: "/svwb_utilities/img/1/witch/アドラブルティーチャー・ミラ.png", // Placeholder image
  },{
    id: "witch3",
    name: "成長したですぅ！",
    type: "spell",
    leader: "witch",
    baseCost: 1,
    effects: [
      { mode: "default", cost: 1, conditions: { minTurn:4 }, effect: "自分のデッキから2枚を引く。相手の場のフォロワーからランダム1枚に2ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/成長したですぅ！.png", // Placeholder image
  },{
    id: "witch4",
    name: "理光の証明",
    type: "spell",
    leader: "witch",
    baseCost: 3,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "【モード】1つを選んでその能力が働く。<br>（1）自分の場の土の印を+4する。<br>（2）自分のリーダーを4回復。<br>（3）【土の秘術_3】相手の場のフォロワーすべてに4ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/理光の証明.png", // Placeholder image
  },{
    id: "witch5",
    name: "イラプション",
    type: "spell",
    leader: "witch",
    baseCost: 4,
    effects: [
      { mode: "default", cost: 4, conditions: {}, effect: "場のフォロワーすべてに2ダメージ。【土の秘術_1】自分のデッキから1枚を引く。" },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/イラプション.png", // Placeholder image
  },{
    id: "witch6",
    name: "理光の天宮・エーデルワイス",
    type: "follower",
    leader: "witch",
    baseCost: 4,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "【土の秘術_2】これは進化する。<br>これが進化したとき、相手の場のフォロワーからランダム1枚に4ダメージ。自分のPPを2回復。" },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/理光の天宮・エーデルワイス.png", // Placeholder image
  },{
    id: "witch7",
    name: "マナリアフレンズ・アン＆グレア",
    type: "follower",
    leader: "witch",
    baseCost: 5,
    attack: 4,
    toughness: 4,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "『アンの大英霊』1枚を自分の場に出す。自分の手札すべては3回スペルブーストする。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それに3ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/マナリアフレンズ・アン＆グレア.png", // Placeholder image
  },{
    id: "witch8",
    name: "マナリアの学徒・ウィリアム",
    type: "follower",
    leader: "witch",
    baseCost: 6,
    attack: 5,
    toughness: 5,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "Xは0から始まる。<br>【スペルブースト時】これのXを+1する。<br>相手の場のフォロワーすべてにXダメージ。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '自分の手札すべては2回スペルブーストする。' },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/マナリアの学徒・ウィリアム.png", // Placeholder image
  },{
    id: "witch9",
    name: "鬼呼びの術",
    type: "spell",
    leader: "witch",
    baseCost: 7,
    effects: [
      { mode: "default", cost: 0, conditions: {}, effect: "【スペルブースト時】これのコストを-1する。<br>『式神暴鬼』1枚を自分の場に出す。" },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/鬼呼びの術.png", // Placeholder image
  },{
    id: "witch10",
    name: "五行の果て・クオン",
    type: "follower",
    leader: "witch",
    baseCost: 7,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "『式神天后』1枚と『式神暴鬼』1枚と『式神形代』を自分の場に出す。" },
      { mode: "enhance", cost: 10, conditions: {}, effect: "【エンハンス_10】自分の式神フォロワーすべてを破壊。『式神貴人』1枚を自分の場に出す。" },
      { mode: 'super_evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '自分の場の式神フォロワーを1枚選ぶ。それは【疾走】を持つ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/witch/五行の果て・クオン.png", // Placeholder image
  },{
    id: "dragon1",
    name: "ドラゴニュートクラッシュ",
    type: "spell",
    leader: "dragon",
    baseCost: 1,
    effects: [
      { mode: "default", cost: 1, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それに2ダメージ。" },
      { mode: "awakening", cost: 1, conditions: { minPP: 7 }, effect: "2ダメージではなく4ダメージ。" }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/ドラゴニュートクラッシュ.png", // Placeholder image
  },{
    id: "dragon2",
    name: "烈火のファイアリザード",
    type: "follower",
    leader: "dragon",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それに1ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/烈火のファイアリザード.png", // Placeholder image
  },
  {
    id: "dragon3",
    name: "風を駆る者・エイファ",
    type: "follower",
    leader: "dragon",
    baseCost: 3,
    attack: 2,
    toughness: 3,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "【疾走】" },
      { mode: "awakening", cost: 0, conditions: { minPP: 7 }, effect: "【覚醒】なら、これは【威圧】を持つ。" }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/風を駆る者・エイファ.png", // Placeholder image
  },
  {
    id: "dragon4",
    name: "栄弦の天宮・リュウフウ",
    type: "follower",
    leader: "dragon",
    baseCost: 4,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: "awakening", cost: 0, conditions: { minPP: 7 }, effect: "【覚醒】なら、これは進化する。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: 'これが進化したとき、自分のPP最大値を+1する。' },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/栄弦の天宮・リュウフウ.png", // Placeholder image
  },
  {
    id: "dragon5",
    name: "駆け出しのドラゴンスレイヤー",
    type: "follower",
    leader: "dragon",
    baseCost: 4,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 4, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それを破壊。" },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/駆け出しのドラゴンスレイヤー.png", // Placeholder image
  },
  {
    id: "dragon6",
    name: "猛撃のドラゴンウォーリアー",
    type: "follower",
    leader: "dragon",
    baseCost: 4,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それに4ダメージ。' },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '1枚を選ぶのではなくすべて。' }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/猛撃のドラゴンウォーリアー.png", // Placeholder image
  },
  {
    id: "dragon7",
    name: "海溝の大剣竜",
    type: "follower",
    leader: "dragon",
    baseCost: 5,
    attack: 4,
    toughness: 6,
    effects: [
      { mode: "awakening", cost: 0, conditions: { minPP: 7 }, effect: "【覚醒】なら、これは【疾走】を持つ。" }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/海溝の大剣竜.png", // Placeholder image
  },
  {
    id: "dragon8",
    name: "ディザスターブレス",
    type: "spell",
    leader: "dragon",
    baseCost: 6,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "場のフォロワーすべてに5ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/ディザスターブレス.png", // Placeholder image
  },
  {
    id: "dragon9",
    name: "覇道の竜翼・フォルテ",
    type: "follower",
    leader: "dragon",
    baseCost: 6,
    attack: 5,
    toughness: 2,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "【疾走】<br>【威圧】" },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/覇道の竜翼・フォルテ.png", // Placeholder image
  },
  {
    id: "dragon10",
    name: "灼熱のアナテマバーンドナイト",
    type: "follower",
    leader: "dragon",
    baseCost: 7,
    attack: 7,
    toughness: 7,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "自分の手札1枚を選ぶ。それを捨てる。相手の場のフォロワーすべてにXダメージ。Xは選んだカードのコストである<br>【威圧】" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '相手は『クレスト：灼熱のアナテマバーンドナイト』を持つ。<br><Card>自分のターン開始時、自分のリーダーに1ダメージ。<br>自分のリーダーが回復したとき、自分のターンごとに1回、自分のリーダーに1ダメージ。</Card>' }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/灼熱のアナテマバーンドナイト.png", // Placeholder image
  },
  {
    id: "dragon11",
    name: "シャークソルジャー",
    type: "follower",
    leader: "dragon",
    baseCost: 8,
    attack: 6,
    toughness: 6,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "相手のリーダーに6ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/シャークソルジャー.png", // Placeholder image
  },
  {
    id: "dragon12",
    name: "龍人演義・ガリュウ",
    type: "follower",
    leader: "dragon",
    baseCost: 8,
    attack: 5,
    toughness: 5,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "『覇道の金龍』1枚と『覇道の銀龍』1枚を自分の場に出す。" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '自分の場の『覇道の金龍』すべては【疾走】を持つ。自分の場の『覇道の銀龍』すべては【バリア】を持つ。' }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/龍人演義・ガリュウ.png", // Placeholder image
  },
  {
    id: "dragon13",
    name: "ナイトフォールドラゴン",
    type: "follower",
    leader: "dragon",
    baseCost: 9,
    attack: 9,
    toughness: 9,
    effects: [
      { mode: "default", cost: 9, conditions: {}, effect: "相手の場のフォロワーすべては-0/-9する。" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '自分のデッキから3枚を引く。' }
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/ナイトフォールドラゴン.png", // Placeholder image
  },
  {
    id: "dragon14",
    name: "再臨のジェネシスドラゴン",
    type: "follower",
    leader: "dragon",
    baseCost: 10,
    attack: 9,
    toughness: 10,
    effects: [
      { mode: "default", cost: 10, conditions: {}, effect: "【疾走】" },
    ],
    imageUrl: "/svwb_utilities/img/1/dragon/再臨のジェネシスドラゴン.png", // Placeholder image
  },
  {
    id: "nemesis1",
    name: "愛執のドールユーザー",
    type: "follower",
    leader: "nemesis",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "『操り人形』1枚を自分の手札に加える。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '『操り人形』1枚を自分の手札に加える。' },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/愛執のドールユーザー.png", // Placeholder image
  },
  {
    id: "nemesis2",
    name: "アンストッパブルガンナー",
    type: "follower",
    leader: "nemesis",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "『フューチャーコア』1枚を自分の手札に加える。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それに3ダメージ' },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/アンストッパブルガンナー.png", // Placeholder image
  },
  {
    id: "nemesis3",
    name: "命の奔流",
    type: "spell",
    leader: "nemesis",
    baseCost: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それに3ダメージ。『パストコア』1枚を自分の手札に加える。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/命の奔流.png", // Placeholder image
  },
  {
    id: "nemesis4",
    name: "ドールズシアター",
    type: "spell",
    leader: "nemesis",
    baseCost: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "『操り人形』1枚を自分の手札に加える。<br><br>【カウントダウン_2】<br>自分のターン終了時、『操り人形』1枚を自分の手札に加える。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/ドールズシアター.png", // Placeholder image
  },
  {
    id: "nemesis5",
    name: "マリオネットランサー",
    type: "follower",
    leader: "nemesis",
    baseCost: 2,
    attack: 2,
    toughness: 1,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "『改良型操り人形』1枚を自分の手札に加える。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/マリオネットランサー.png", // Placeholder image
  },
  {
    id: "nemesis6",
    name: "オートマタアサシン",
    type: "follower",
    leader: "nemesis",
    baseCost: 3,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "『改良型操り人形』1枚を自分の手札に加える。<br>自分の人形フォロワーが場に出たとき、自分のターンごとに1回、それは【必殺】を持つ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/オートマタアサシン.png", // Placeholder image
  },
  {
    id: "nemesis7",
    name: "人形の身代わり",
    type: "spell",
    leader: "nemesis",
    baseCost: 3,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "『改良型操り人形』2枚を自分の場に出す。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/人形の身代わり.png", // Placeholder image
  },
  {
    id: "nemesis8",
    name: "砲撃の猫獣人",
    type: "follower",
    leader: "nemesis",
    baseCost: 3,
    attack: 3,
    toughness: 2,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "『フューチャーコア』1枚を自分の手札に加える。<br>【突進】" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/砲撃の猫獣人.png", // Placeholder image
  },
  {
    id: "nemesis9",
    name: "異次元からの銃撃",
    type: "spell",
    leader: "nemesis",
    baseCost: 4,
    effects: [
      { mode: "default", cost: 4, conditions: {}, effect: "相手の場のフォロワー1枚を選ぶ。それを破壊。<br>『フューチャーコア』1枚と『パストコア』1枚を自分の手札に加える。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/異次元からの銃撃.png", // Placeholder image
  },
  {
    id: "nemesis10",
    name: "ストラグルリーダー・ルキナ",
    type: "follower",
    leader: "nemesis",
    baseCost: 4,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: "default", cost: 4, conditions: {}, effect: "『フューチャーコア』1枚と『パストコア』1枚を自分の手札に加える。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '『アタックアーティファクト』1枚を自分の場に出す。' },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/ストラグルリーダー・ルキナ.png", // Placeholder image
  },
  {
    id: "nemesis11",
    name: "遺産の砲撃",
    type: "spell",
    leader: "nemesis",
    baseCost: 5,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "『フューチャーコア』1枚を自分の手札に加える。<br>自分が【融合】したとき、相手の場のフォロワーからランダム1枚に2ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/遺産の砲撃.png", // Placeholder image
  },
  {
    id: "nemesis12",
    name: "改境の再動",
    type: "spell",
    leader: "nemesis",
    baseCost: 5,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "自分の手札のコスト5以下のアーティファクトフォロワー2枚を選ぶ。それのコピー1枚を自分の場に出す。それは「相手のターン終了時、これを破壊。」を持つ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/改境の再動.png", // Placeholder image
  },
  {
    id: "nemesis13",
    name: "改境の天宮・アルエット",
    type: "follower",
    leader: "nemesis",
    baseCost: 5,
    attack: 2,
    toughness: 4,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "『フューチャーコア』1枚と『パストコア』1枚を自分の手札に加える。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '自分の手札のコスト5以下のアーティファクトフォロワー1枚を選ぶ。それのコピー1枚を自分の場に出す。' },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/改境の天宮・アルエット.png", // Placeholder image
  },
  {
    id: "nemesis14",
    name: "殺意の糸・ノア",
    type: "follower",
    leader: "nemesis",
    baseCost: 6,
    attack: 5,
    toughness: 6,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "『操り人形』3枚を自分の手札に加える。自分の手札の人形フォロワーすべては+1/+0する。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/殺意の糸・ノア.png", // Placeholder image
  },
  {
    id: "nemesis15",
    name: "箱庭の断罪者・シルヴィア",
    type: "follower",
    leader: "nemesis",
    baseCost: 6,
    attack: 5,
    toughness: 5,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "【モード】1つを選んでその能力が働く。<br>（1）自分のデッキから2枚を引く。<br>（2）自分のリーダーを4回復。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それを破壊。' },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '相手の場のフォロワー2枚を選ぶ。それを破壊。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/箱庭の断罪者・シルヴィア.png", // Placeholder image
  },
  {
    id: "nemesis16",
    name: "ブーストエクステンド・ララミア",
    type: "follower",
    leader: "nemesis",
    baseCost: 8,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "自分の手札のコスト5以下のアーティファクトフォロワー3枚を選ぶ。それのコピー1枚を自分の場に出す。" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '自分の場のアーティファクトフォロワーすべては+1/+1する。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/ブーストエクステンド・ララミア.png", // Placeholder image
  },
  {
    id: "nemesis17",
    name: "プロシードハート・オーキス",
    type: "follower",
    leader: "nemesis",
    baseCost: 8,
    attack: 5,
    toughness: 5,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "『ロイド』1枚を自分の場に出す。<br>自分の人形フォロワーが場に出たとき、それは【疾走】と【必殺】を持つ。" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '『改良型操り人形』2枚を自分の場に出す。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/プロシードハート・オーキス.png", // Placeholder image
  },
  {
    id: "nemesis18",
    name: "狂気の創造者・リーアム",
    type: "follower",
    leader: "nemesis",
    baseCost: 10,
    attack: 8,
    toughness: 8,
    effects: [
      { mode: "default", cost: 10, conditions: {}, effect: "『改良型操り人形』3枚を自分の場に出す" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '自分の場の人形フォロワーすべては【守護】と「【ラストワード】相手のリーダーに2ダメージ。」を持つ。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nemesis/狂気の創造者・リーアム.png", // Placeholder image
  },
  {
    id: "nightmare1",
    name: "死神の一振り",
    type: "spell",
    leader: "nightmare",
    baseCost: 1,
    effects: [
      { mode: "default", cost: 1, conditions: { }, effect: "自分の場のフォロワー1枚と相手の場のフォロワー1枚を選ぶ。それを破壊。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/死神の一振り.png", // Placeholder image
  },
  {
    id: "nightmare2",
    name: "悪辣のレッサーマミー",
    type: "follower",
    leader: "nightmare",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: { }, effect: "-" },
      { mode: "necromancy_modifier", cost: 0, conditions: { necromancyCost: 4 }, effect: "【ネクロマンス_4】これは【疾走】を持つ。" }, // Changed to modifier
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/悪辣のレッサーマミー.png", // Placeholder image
  },
  {
    id: "nightmare3",
    name: "蛇神の怒り",
    type: "spell",
    leader: "nightmare",
    baseCost: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "相手の場のフォロワー1枚か相手のリーダーを選ぶ。それに3ダメージ。自分のリーダーに2ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/蛇神の怒り.png", // Placeholder image
  },
  {
    id: "nightmare4",
    name: "燃え盛る魔剣オルトロス",
    type: "follower",
    leader: "nightmare",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "自分の墓場を+2する。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1, necromancyCost :4 }, effect: '【ネクロマンス_4】「相手の場のフォロワーからランダム1枚に2ダメージ。」を2回行う。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/燃え盛る魔剣オルトロス.png", // Placeholder image
  },
  {
    id: "nightmare5",
    name: "辣腕の死神ミーノ",
    type: "follower",
    leader: "nightmare",
    baseCost: 2,
    attack: 2,
    toughness: 2,
    effects: [
      { mode: "default", cost: 2, conditions: {}, effect: "【ラストワード】『スケルトン』1枚を自分の手札に加える。" },
      { mode: 'enhance', cost: 4, conditions: {}, effect: '【エンハンス_4】これは【突進】と【必殺】を持つ。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/辣腕の死神ミーノ.png", // Placeholder image
  },
  {
    id: "nightmare6",
    name: "ミッドナイトヴァンパイアエラル",
    type: "follower",
    leader: "nightmare",
    baseCost: 3,
    attack: 1,
    toughness: 1,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "【ファンファーレ】『バット』1枚を自分の場に出す。<br>自分の『バット』が場に出たとき、それは【疾走】を持つ。自分のリーダーに1ダメージ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/ミッドナイトヴァンパイアエラル.png", // Placeholder image
  },
  {
    id: "nightmare7",
    name: "瞑地の霊園",
    type: "spell",
    leader: "nightmare",
    baseCost: 3,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "自分の墓場を+2する。<br>【アクト】これを破壊。『ゴースト』2枚を自分の場に出す。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/瞑地の霊園.png", // Placeholder image
  },
  {
    id: "nightmare8",
    name: "ラバーズネクロマンサー",
    type: "follower",
    leader: "nightmare",
    baseCost: 4,
    attack: 5,
    toughness: 4,
    effects: [
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '『ゴースト』2枚を自分の場に出す。' },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '『ゴースト』2枚を自分の場に出す。それは【ドレイン】を持つ。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/ラバーズネクロマンサー.png", // Placeholder image
  },
  {
    id: "nightmare9",
    name: "エンドレスハンターアラガヴィ",
    type: "follower",
    leader: "nightmare",
    baseCost: 5,
    attack: 4,
    toughness: 3,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "自分の墓場を+2する。<br>相手の場のフォロワーすべてに7ダメージを割りふる。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: 'リーダーすべてに3ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/エンドレスハンターアラガヴィ.png", // Placeholder image
  },
  {
    id: "nightmare10",
    name: "禁約の悪魔",
    type: "follower",
    leader: "nightmare",
    baseCost: 5,
    attack: 4,
    toughness: 3,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "自分の墓場を+2する。<br>自分のデッキから2枚を引く。自分のリーダーに2ダメージ。" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それに6ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/禁約の悪魔.png", // Placeholder image
  },
  {
    id: "nightmare11",
    name: "ウルフマスター",
    type: "follower",
    leader: "nightmare",
    baseCost: 6,
    attack: 5,
    toughness: 5,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "【疾走】<br>【必殺】" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それに6ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/ウルフマスター.png", // Placeholder image
  },
  {
    id: "nightmare12",
    name: "猛毒姫・メドゥーサ",
    type: "follower",
    leader: "nightmare",
    baseCost: 7,
    attack: 3,
    toughness: 7,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "【突進】<br>1ターンに3回攻撃できる。<br>【攻撃時】フォロワーへの攻撃なら、交戦相手を破壊。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/猛毒姫・メドゥーサ.png", // Placeholder image
  },
  {
    id: "nightmare13",
    name: "串刺し公・ヴラド",
    type: "follower",
    leader: "nightmare",
    baseCost: 8,
    attack: 5,
    toughness: 8,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "【ファンファーレ】相手の場のフォロワー1枚を選ぶ。それに5ダメージ。自分のリーダーを5回復。" },
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/串刺し公・ヴラド.png", // Placeholder image
  },
  {
    id: "nightmare14",
    name: "奔放なる獄炎・ケルベロス",
    type: "follower",
    leader: "nightmare",
    baseCost: 8,
    attack: 6,
    toughness: 6,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "『番犬の右腕ミミ』1枚と『番犬の左腕ココ』1枚を自分の場に出す。【ネクロマンス_6】自分の場の他のフォロワーすべては+2/+0する。" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '【リアニメイト_1】を2回行う。' }
    ],
    imageUrl: "/svwb_utilities/img/1/nightmare/奔放なる獄炎・ケルベロス.png", // Placeholder image
  },
  {
    id: "bishop1",
    name: "セイクリッドインジェクション",
    type: "spell",
    leader: "bishop",
    baseCost: 3,
    effects: [
      { mode: "default", cost: 3, conditions: {}, effect: "【アクト】これを破壊。相手の場のフォロワー1枚を選ぶ。それに4ダメージ。自分のリーダーを1回復。" },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/セイクリッドインジェクション.png", // Placeholder image
  },
  {
    id: "bishop2",
    name: "禁密の天宮・ロナヴェロ",
    type: "follower",
    leader: "bishop",
    baseCost: 4,
    attack: 1,
    toughness: 3,
    effects: [
      { mode: "default", cost: 4, conditions: {}, effect: "【潜伏】" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場のフォロワー1枚を選ぶ。それを破壊。' },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/禁密の天宮・ロナヴェロ.png", // Placeholder image
  },
  {
    id: "bishop3",
    name: "鉄拳の神父",
    type: "follower",
    leader: "bishop",
    baseCost: 4,
    attack: 5,
    toughness: 4,
    effects: [
      { mode: "default", cost: 4, conditions: {}, effect: "-" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手の場の体力3以下のフォロワー1枚を選ぶ。それを消滅。' },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '1枚を選ぶのではなくすべて。' }
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/鉄拳の神父.png", // Placeholder image
  },
  {
    id: "bishop4",
    name: "水の守護神サレファ",
    type: "follower",
    leader: "bishop",
    baseCost: 5,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "自分のリーダーを3回復。<br>【守護】" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手のフォロワーすべてに3ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/鉄拳の神父.png", // Placeholder image
  },
  {
    id: "bishop5",
    name: "終焉のスカルフェイン",
    type: "follower",
    leader: "bishop",
    baseCost: 6,
    attack: 4,
    toughness: 4,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "自分の場のアミュレットすべてを破壊。相手の場のフォロワーすべてと相手のリーダーにXダメージ。Xはこれで破壊した枚数である。" },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/終焉のスカルフェイン.png", // Placeholder image
  },
  {
    id: "bishop6",
    name: "水の守護神・サレファ",
    type: "follower",
    leader: "bishop",
    baseCost: 5,
    attack: 3,
    toughness: 3,
    effects: [
      { mode: "default", cost: 5, conditions: {}, effect: "自分のリーダーを3回復。<br>【守護】" },
      { mode: 'evolve', cost: 0, conditions: { evolveTokenMin: 1 }, effect: '相手のフォロワーすべてに3ダメージ。' },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/水の守護神・サレファ.png", // Placeholder image
  },
  {
    id: "bishop7",
    name: "邪教の器",
    type: "spell",
    leader: "bishop",
    baseCost: 6,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "自分のリーダーを3回復。<br>【アクト】これを破壊。場のフォロワーすべてを破壊。" },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/邪教の器.png", // Placeholder image
  },
  {
    id: "bishop8",
    name: "フェザーレイン",
    type: "spell",
    leader: "bishop",
    baseCost: 6,
    effects: [
      { mode: "default", cost: 6, conditions: {}, effect: "相手の場のフォロワーすべてに3ダメージ。『ホーリーファルコン』1枚を自分の場に出す。" },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/フェザーレイン.png", // Placeholder image
  },
  {
    id: "bishop9",
    name: "裁決のアナテマ・ロデオ",
    type: "follower",
    leader: "bishop",
    baseCost: 7,
    attack: 5,
    toughness: 5,
    effects: [
      { mode: "default", cost: 7, conditions: {}, effect: "自分の手札1枚を選ぶ。それを捨てる。自分のデッキのコスト3以下のアミュレットからランダム3種類を自分の場に出す。" },
      { mode: 'super_evolve', cost: 0, conditions: { superEvolveTokenMin: 1 }, effect: '相手の場の攻撃力最大のフォロワーからランダム1枚を破壊。相手の場のフォロワーすべてに1ダメージ。' }
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/裁決のアナテマ・ロデオ.png", // Placeholder image
  },
  {
    id: "bishop10",
    name: "純白の聖女・ジャンヌ",
    type: "follower",
    leader: "bishop",
    baseCost: 8,
    attack: 6,
    toughness: 6,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "相手の場のフォロワーすべてに6ダメージ。自分の場の他のフォロワーすべては+2/+4する。<br>【守護】" },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/純白の聖女・ジャンヌ.png", // Placeholder image
  },
  {
    id: "bishop11",
    name: "セイクリッドグリフォン",
    type: "follower",
    leader: "bishop",
    baseCost: 8,
    attack: 6,
    toughness: 6,
    effects: [
      { mode: "default", cost: 8, conditions: {}, effect: "【守護】<br>自分がアミュレットを【アクト】したとき、これは【疾走】を持つ。" },
    ],
    imageUrl: "/svwb_utilities/img/1/bishop/セイクリッドグリフォン.png", // Placeholder image
  },
]

const STRONG_MOVES = {
  dragon: [
    { turn: 4, move: "ドラゴンナイト召喚 + PP加速", threat: "high" },
    { turn: 6, move: "大型フォロワー展開", threat: "critical" },
    { turn: 7, move: "覚醒能力発動 + 全体除去", threat: "critical" }, // Added awakening move
    { turn: 8, move: "バハムート級の切り札", threat: "critical" },
  ],
  witch: [
    { turn: 3, move: "スペルブースト蓄積", threat: "medium" },
    { turn: 5, move: "知恵の光 + 手札補充", threat: "high" },
    { turn: 7, move: "超越コンボ開始", threat: "critical" },
  ],
  bishop: [
    { turn: 4, move: "治癒の祈り + 回復", threat: "low" },
    { turn: 6, move: "テミスの審判", threat: "high" },
    { turn: 8, move: "セラフ召喚", threat: "critical" },
  ],
  nightmare: [
    { turn: 3, move: "スケルトン召喚 + 墓地肥やし", threat: "medium" },
    { turn: 5, move: "ファントムハウル + 墓地消費", threat: "high" },
    { turn: 7, move: "モルディカイ降臨", threat: "critical" },
  ],
}

const LEADERS = [
  { value: "elf", label: "エルフ" },
  { value: "royal", label: "ロイヤル" },
  { value: "witch", label: "ウィッチ" },
  { value: "dragon", label: "ドラゴン" },
  { value: "nightmare", label: "ナイトメア" },
  { value: "bishop", label: "ビショップ" },
  { value: "nemesis", label: "ネメシス" },
];

// ネメシスアーティファクトトークンのデータ定義
const NEMESIS_ARTIFACT_TOKENS = [
  // Puppets
  { id: "puppet", name: "操り人形", cost: 0, attack: 1, defense: 1, effect: "【突進】相手のターン終了時に破壊される", category: "puppet" },
  { id: "enhanced_puppet", name: "改良型操り人形", cost: 1, attack: 3, defense: 3, effect: "【突進】相手のターン終了時に破壊される", category: "puppet" },
  // Cores
  { id: "past_core", name: "パスト・コア", cost: 1, attack: null, defense: null, effect: "1コストのアーティファクトと合成した時にキャッスルアーティファクトに変身する", category: "core" },
  { id: "future_core", name: "フューチャー・コア", cost: 1, attack: null, defense: null, effect: "1コストのアーティファクトと合成した時にアタックアーティファクトに変身する", category: "core" },
  // Intermediate Artifacts (formed from cores)
  { id: "castle_artifact", name: "キャッスルアーティファクト", cost: 3, attack: 5, defense: 1, effect: "【融合】アーティファクトカード<br>これに【融合】したカードのコストの合計によって変身する。<br>1⇒『デストロイアーティファクトα』<br>2⇒『デストロイアーティファクトβ』<br>3以上⇒『デストロイアーティファクトγ』<br><br>【守護】", category: "intermediate_artifact" },
  { id: "attack_artifact", name: "アタックアーティファクト", cost: 3, attack: 1, defense: 5, effect: "【融合】アーティファクトカード<br>これに【融合】したカードのコストの合計によって変身する。<br>1⇒『デストロイアーティファクトα』<br>2⇒『デストロイアーティファクトβ』<br>3以上⇒『デストロイアーティファクトγ』<br>【突進】", category: "intermediate_artifact" },
  // Destroy Artifacts
  { id: "destroy_artifact_alpha", name: "デストロイアーティファクトα", cost: 5, attack: 3, defense: 5, effect: "【融合】『デストロイアーティファクトβ』や『デストロイアーティファクトγ』<br>これに【融合】したとき、これに【融合】した種類が2なら、これは『イクシードアーティファクトΩ』に変身する。<br>自分のターン終了時、自分のリーダーを3回復。<br>", category: "destroy_artifact" },
  { id: "destroy_artifact_beta", name: "デストロイアーティファクトβ", cost: 5, attack: 4, defense: 4, effect: "自分のターン終了時、相手のリーダーに3ダメージ。", category: "destroy_artifact" },
  { id: "destroy_artifact_gamma", name: "デストロイアーティファクトγ", cost: 5, attack: 5, defense: 3, effect: "自分のターン終了時、相手の場のフォロワーすべてに3ダメージ。", category: "destroy_artifact" },
  // Final Artifact
  { id: "exceed_artifact_omega", cost: 10, name: "イクシードアーティファクトΩ", attack: 10, defense: 10, effect: "【ファンファーレ】相手の場のフォロワーすべてに5ダメージ。自分のリーダーを5回復。<br>【疾走】<br>【守護】<br>【オーラ】", category: "final_artifact" },
];


// --- Helper Functions ---

/**
 * Determines if a card effect is active based on current game context.
 * This function now differentiates between playable effects and modifier effects.
 * @param {object} effect - The effect object with conditions and mode.
 * @param {object} ctx - The game context (turn, pp, ppMax, ep, sep, graveyardCount, cardEffects, evolveUsedThisTurn, isEpUsable, isSepUsable).
 * @returns {boolean} - True if the effect is active, false otherwise.
 */
function isEffectActive(effect: any, ctx: any): boolean {
  const c = effect.conditions || {};

  // Special handling for modifier effects: they don't have a direct PP cost for activation
  if (effect.mode === 'necromancy_modifier') {
    return c.necromancyCost !== undefined && ctx.graveyardCount >= c.necromancyCost;
  }
  if (effect.mode === 'awakening_modifier') {
    // Awakening condition: ppMax >= 7
    return ctx.ppMax !== undefined && ctx.ppMax >= 7;
  }

  // For playable effects (default, enhance, evolve, super_evolve)
  if (c.minTurn !== undefined && ctx.turn < c.minTurn) return false;
  if (c.minPP !== undefined && ctx.pp < c.minPP) return false;

  // If EP or SEP is required and already used this turn, effect is not active.
  if ((c.evolveTokenMin !== undefined || c.superEvolveTokenMin !== undefined) && ctx.evolveUsedThisTurn) {
    return false;
  }
  if (c.evolveTokenMin !== undefined && ctx.ep < c.evolveTokenMin) return false;
  if (c.superEvolveTokenMin !== undefined && ctx.sep < c.superEvolveTokenMin) return false;

  // Add checks for turn-based EP/SEP usability
  if (effect.mode === 'evolve' && !ctx.isEpUsable) return false;
  if (effect.mode === 'super_evolve' && !ctx.isSepUsable) return false;

  // IMPORTANT: Removed the logic that skips default if enhance is available.
  // isEffectActive should only check if *this specific effect* is active.
  // The prioritization logic belongs in getActionableEffect.

  return effect.cost <= ctx.pp; // Playable effect is active if its cost is affordable
}

/**
 * Determines the most relevant actionable effect for a card based on current game context.
 * This is used to decide which effect the "使用" button should trigger.
 * It returns the primary playable effect, without combining modifier text here.
 * @param {object} card - The card object.
 * @param {object} ctx - The game context (turn, pp, ppMax, ep, sep, graveyardCount, cardEffects, evolveUsedThisTurn, isEpUsable, isSepUsable).
 * @returns {object | null} - The most relevant actionable effect, or null if none.
 */
function getActionableEffect(card: any, ctx: any): any | null {
  // Prioritize enhance effect first if it's active and affordable
  const enhanceEffect = card.effects.find((eff: any) => eff.mode === 'enhance');
  if (enhanceEffect && isEffectActive(enhanceEffect, {
      turn: ctx.turn, pp: ctx.pp, ppMax: ctx.ppMax, ep: ctx.ep, sep: ctx.sep, graveyardCount: ctx.graveyardCount,
      cardEffects: card.effects, evolveUsedThisTurn: ctx.evolveUsedThisTurn,
      isEpUsable: ctx.isEpUsable, isSepUsable: ctx.isSepUsable,
  })) {
    return enhanceEffect;
  }

  // If no active enhance, check for active default effect
  const defaultEffect = card.effects.find((eff: any) => eff.mode === 'default');
  if (defaultEffect && isEffectActive(defaultEffect, {
      turn: ctx.turn, pp: ctx.pp, ppMax: ctx.ppMax, ep: ctx.ep, sep: ctx.sep, graveyardCount: ctx.graveyardCount,
      cardEffects: card.effects, evolveUsedThisTurn: ctx.evolveUsedThisTurn,
      isEpUsable: ctx.isEpUsable, isSepUsable: ctx.isSepUsable,
  })) {
    return defaultEffect;
  }

  return null; // Card is not playable via its base or enhance cost
}


// --- Components ---

/**
 * DotSelector Component: A visual selector for numeric values using filled and unfilled circles.
 * @param {object} props - Component props.
 * @param {number} props.value - Current selected value (total count).
 * @param {number} props.max - Maximum possible value.
 * @param {function} props.onChange - Callback when value changes.
 * @param {string} props.label - Label for the selector.
 * @param {boolean} [props.disabled=false] - Whether the selector is disabled.
 * @param {number} [props.knownCount=0] - Number of known items (for special coloring).
 * @param {string} [props.knownColor="green"] - Color for known items.
 */
function DotSelector({ value, max, onChange, label, disabled = false, knownCount = 0, knownColor = "green" }: any) {
  return (
    <Stack gap={4}>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" c={disabled ? "dark.3" : "blue.3"}>
          {label}
        </Text>
        <Text size="sm" c={disabled ? "dark.4" : "blue.4"}>{`${value} / ${max}`}</Text>
      </Group>
      <Group gap={6}>
        {Array.from({ length: max }, (_, i) => {
          const isKnown = i < knownCount;
          const isSelected = i < value;
          let dotColor = "dark"; // Unselected color

          if (isKnown) {
            dotColor = knownColor; // Known items color
          } else if (isSelected) {
            dotColor = "blue"; // Other selected items color
          }

          return (
            <ActionIcon
              key={i}
              radius="xl"
              variant="light"
              disabled={disabled}
              color={dotColor} // Use the determined dotColor
              size={rem(32)}
              onClick={() => {
                const clickValue = i + 1; // onClickハンドラ内でclickValueを定義
                onChange(clickValue === value ? 0 : clickValue);
              }}
              style={{
                backgroundColor: dotColor === knownColor ? `var(--mantine-color-${knownColor}-9)` : (dotColor === "blue" ? `var(--mantine-color-blue-9)` : `var(--mantine-color-dark-6)`),
                border: `1px solid ${dotColor === knownColor ? `var(--mantine-color-${knownColor}-7)` : (dotColor === "blue" ? `var(--mantine-color-blue-7)` : `var(--mantine-color-dark-4)`)}`,
                // Disabled state styling for ActionIcon
                ...(disabled && {
                  backgroundColor: "var(--mantine-color-dark-9)", // Darker background
                  border: "1px solid var(--mantine-color-dark-7)", // Darker border
                  color: "var(--mantine-color-dark-5)", // Darker icon color
                }),
              }}
            >
              {isSelected ? <IconCircleFilled size={20} /> : <IconCircle size={20} />}
            </ActionIcon>
          )
        })}
      </Group>
    </Stack>
  )
}

/**
 * RemovalCardBlock Component: Displays a single removal card with its effects and a usage button.
 * @param {object} props - Component props.
 * @param {object} props.card - The card object (now includes displayCost).
 * @param {number} props.ppCurrent - Current PP.
 * @param {number} props.ppMax - Max PP.
 * @param {function} props.onUseCard - Callback when the card is used.
 * @param {object} props.actionableEffect - The effect that the '使用' button will trigger, or null.
 */
function RemovalCardBlock({ card, ppCurrent, ppMax, onUseCard, actionableEffect }: any) {
  const [showDetailsModal, setShowDetailsModal] = useState(false); // 全能力表示用モーダルの状態

  // The button is always enabled if actionableEffect is passed to this component
  // because the filtering in Home component ensures only actionable cards are displayed.
  const isDisabled = !actionableEffect;

  // HoverCardに表示する効果テキストを生成
  const hoverCardContent = useMemo(() => {
    if (!actionableEffect) {
      return <Text size="sm" c="white">現在使用可能な効果はありません。</Text>;
    }
    // HoverCardには、現在アクティブな効果すべてをバッジとテキストで表示
    const activeEffects = card.availableEffects
      .filter((eff: any) => eff.effect) // 効果テキストが存在するもののみ
      .map((eff: any, i: number) => (
        <Group key={i} wrap="nowrap" align={"center"} gap="xs">
          {eff.mode.endsWith('_modifier') ? (
              EFFECT_MODES[eff.mode.replace('_modifier', '') as keyof typeof EFFECT_MODES]
          ) : (
              EFFECT_MODES[eff.mode as keyof typeof EFFECT_MODES]
          )}
          <Text size="sm" c="white" dangerouslySetInnerHTML={{ __html: eff.effect.replace(/\n/g, '<br/>') }} />
        </Group>
      ));
    return activeEffects.length > 0 ? <Stack gap={4}>{activeEffects}</Stack> : <Text size="sm" c="white">効果なし</Text>;
  }, [actionableEffect, card.availableEffects]);

  const postitEffects = useMemo(() => {
    if (!actionableEffect) {
      return <></>
    }
    // HoverCardには、現在アクティブな効果すべてをバッジとテキストで表示
    const activeEffects = card.availableEffects
      .filter((eff: any) => eff.mode != "default") // 効果テキストが存在するもののみ
      .map((eff: any, i: number) => (
        <>
          {eff.mode.endsWith('_modifier') ? (
              EFFECT_MODES[eff.mode.replace('_modifier', '') as keyof typeof EFFECT_MODES]
          ) : (
              EFFECT_MODES[eff.mode as keyof typeof EFFECT_MODES]
          )}
        </>
      ));
    return activeEffects.length > 0 ? <Stack gap="xs" style={{position:"absolute", top:50, right:-8}}>{activeEffects}</Stack> : <></>;
  }, [actionableEffect, card.availableEffects]);


  return (
    <Card
      shadow="sm"
      style={{ backgroundColor: "var(--mantine-color-dark-7)" }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        {/* カード画像と使用ボタン */}
          <HoverCard
            width={400}
            shadow="md"
            openDelay={50}
            closeDelay={300}
            position="bottom"
            offset={10}
            withArrow
            styles={{
              dropdown: {
                backgroundColor: "var(--mantine-color-dark-5)",
                borderColor: "var(--mantine-color-blue-7)",
                borderWidth: 1,
                borderStyle: 'solid',
              }
            }}
          >
            <HoverCard.Target>
              <Stack gap="xs" align={"stretch"}>
                <Button
                  size={"compact-xs"}
                  variant="filled"
                  color="blue"
                  onClick={() => actionableEffect && onUseCard(card, actionableEffect)}
                  disabled={isDisabled}
                  styles={{
                    root: {
                      "&[data-disabled]": {
                        backgroundColor: "var(--mantine-color-dark-9) !important",
                        color: "var(--mantine-color-dark-5) !important",
                        cursor: "not-allowed",
                      },
                    },
                  }}
                >
                  使用
                </Button>
                    <div style={{position:"relative"}}>
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      width={150}
                      height={225}
                      radius="md"
                      style={{ cursor: 'pointer', border: '2px solid var(--mantine-color-blue-6)' }}
                      onClick={() => setShowDetailsModal(true)} // 画像クリックでモーダルを開く
                      fallbackSrc="https://placehold.co/100x150/FF0000/FFFFFF?text=No+Image" // Fallback image
                    />
                    {postitEffects}
                  </div>
              </Stack>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              {hoverCardContent}
            </HoverCard.Dropdown>
          </HoverCard>
        {/* カード情報（名称、タイプ、コスト、攻撃力/体力）
        <Stack gap="xs" style={{ flexGrow: 1 }}>
          <Text fw="bold" c="blue.2" size="lg">
            {card.name}
          </Text>
          <Group gap="xs">
            {CARD_TYPES[card.type]}
            <Badge color="blue" variant="light" c="white" size="lg">
              {card.displayCost}コスト
            </Badge>
            {card.type === "follower" && card.attack !== undefined && card.toughness !== undefined && (
              <Badge color="gray" variant="light" c="white" size="lg">
                {card.attack}/{card.toughness}
              </Badge>
            )}
          </Group>
        </Stack> */}
      </Group>

      {/* 全能力表示用モーダル */}
      <Modal
        opened={showDetailsModal}
        size={"xl"}
        onClose={() => setShowDetailsModal(false)}
        title={
          <Group justify={"space-between"}>
            <Title order={3} c="blue.3">{card.name} - 全能力</Title>
            <Button
              size={"compact-xs"}
              variant="filled"
              color="blue"
              onClick={() => actionableEffect && onUseCard(card, actionableEffect)}
              disabled={isDisabled}
              styles={{
                root: {
                  "&[data-disabled]": {
                    backgroundColor: "var(--mantine-color-dark-9) !important",
                    color: "var(--mantine-color-dark-5) !important",
                    cursor: "not-allowed",
                  },
                },
              }}
            >
              使用
            </Button>
          </Group>
          }
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: { backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-blue-9)" },
          header: { backgroundColor: "var(--mantine-color-dark-8)", borderBottom: '1px solid var(--mantine-color-dark-6)' },
          title: { color: "var(--mantine-color-blue-3)" },
          close: { color: "var(--mantine-color-blue-3)" },
        }}
      >
        <Container size="lg">
          <Grid>
            <Grid.Col span={"content"}>
              <Image
                src={card.imageUrl}
                alt={card.name}
                width={240}
                height={360}
                radius="md"
                style={{ cursor: 'pointer', border: '2px solid var(--mantine-color-blue-6)' }}
                onClick={() => setShowDetailsModal(true)} // 画像クリックでモーダルを開く
                fallbackSrc="https://placehold.co/100x150/FF0000/FFFFFF?text=No+Image" // Fallback image
              />
            </Grid.Col>
            <Grid.Col span={"auto"}>
              <Stack gap="xs">
                {card.effects.map((eff: any, i: number) => (
                  <Group key={`modal-effect-${i}`} mt="xs" wrap="nowrap" align="center">
                    {eff.mode.endsWith('_modifier') ? (
                        EFFECT_MODES[eff.mode.replace('_modifier', '') as keyof typeof EFFECT_MODES]
                    ) : (
                        EFFECT_MODES[eff.mode as keyof typeof EFFECT_MODES]
                    )}
                    <Text size="sm" c="white" dangerouslySetInnerHTML={{ __html: eff.effect.replace(/\n/g, '<br/>') }} />
                  </Group>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Modal>
    </Card>
  )
}

/**
 * ThreatBadge Component: Displays a threat level with appropriate color and label.
 * @param {object} props - Component props.
 * @param {string} props.threat - The threat level (e.g., "critical", "high").
 */
function ThreatBadge({ threat }: { threat: keyof typeof THREAT_COLORS }) {
  return (
    <Badge color={THREAT_COLORS[threat]} variant="light">
      <Text color="white">
        {THREAT_LABELS[threat]}
      </Text>
    </Badge>
  )
}

// トークンデータの型定義
interface NemesisToken {
    id: string;
    name: string;
    cost: number;
    attack: number | null;
    defense: number | null;
    effect: string;
    category: string;
}

interface NemesisTokenCardProps {
  token: NemesisToken;
  count: number;
  handleArtifactCountChange: (tokenId: string, change: number) => void;
  handCount: number;
}

/**
 * NemesisTokenCard Component: Displays a single Nemesis artifact token with its count and details.
 * @param {object} props - Component props.
 * @param {object} props.token - The token object from NEMESIS_ARTIFACT_TOKENS.
 * @param {number} props.count - The current count of this token.
 * @param {function} props.handleArtifactCountChange - Callback to change the token count.
 * @param {number} props.handCount - Current total hand count (for + button disabled state).
 */
function NemesisTokenCard({ token, count, handleArtifactCountChange, handCount }: NemesisTokenCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card withBorder style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
      <Group justify="space-between" wrap="nowrap">
        <Group>
          <Text size="sm" c="blue.4">{token.name}</Text>
          {/* 修正箇所: BadgeからTextに変更し、サイズと太さを調整 */}
          <Text size="lg" fw="bold" c="cyan.1">{count}枚</Text>
          <ActionIcon variant="filled" color="blue" size="sm" onClick={() => handleArtifactCountChange(token.id, 1)} disabled={handCount >= 9}><IconPlus size={16} /></ActionIcon>
          <ActionIcon variant="filled" color="red" size="sm" onClick={() => handleArtifactCountChange(token.id, -1)} disabled={count <= 0}><IconMinus size={16} /></ActionIcon>
        </Group>
        <ActionIcon variant="filled" onClick={() => setShowDetails(o => !o)} color="blue" size="md">
          {showDetails ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
        </ActionIcon>
      </Group>
      <Collapse in={showDetails}>
        <Stack gap="xs" mt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-5)', paddingTop: '10px' }}>
          <Text size="xs" c="blue.1">
            コスト: {token.cost}
            {token.attack !== null && <><br />攻撃力: {token.attack}</>}
            {token.defense !== null && <><br />体力: {token.defense}</>}
            {token.effect && <><br />効果: {token.effect}</>}
          </Text>
        </Stack>
      </Collapse>
    </Card>
  );
}

/**
 * NumericCounter Component: A generic numeric counter with +/- buttons and a label.
 * @param {object} props - Component props.
 * @param {number} props.value - Current value.
 * @param {function} props.onChange - Callback when value changes.
 * @param {string} props.label - Label for the counter.
 * @param {number} [props.min=0] - Minimum allowed value.
 * @param {number} [props.max=Infinity] - Maximum allowed value.
 */
function NumericCounter({ value, onChange, label, min = 0, max = Infinity }: any) {
  return (
    <Card withBorder padding="md" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
      <Stack gap={4}>
        <Text size="sm" c="blue.3">{label}</Text>
        <Group justify="space-between" wrap="nowrap">
          <ActionIcon
            variant="light"
            color="red"
            size="lg"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
          >
            <IconMinus size={20} />
          </ActionIcon>
          <NumberInput
            value={value}
            onChange={(val) => {
              if (typeof val === 'number') {
                onChange(Math.min(max, Math.max(min, val)));
              }
            }}
            min={min}
            max={max}
            hideControls
            styles={{
              input: {
                textAlign: 'center',
                backgroundColor: "var(--mantine-color-dark-6)",
                color: "var(--mantine-color-blue-1)",
                border: "1px solid var(--mantine-color-dark-4)",
              },
            }}
            maw={100}
          />
          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}


// --- Main Application Component ---

export default function Home() {
  // --- State Management ---
  const [turn, setTurn] = useState(1)
  const [basePpMax, setBasePpMax] = useState(1)
  const [extraPpMax, setExtraPpMax] = useState(0)
  const [turnPpBonus, setTurnPpBonus] = useState(0)
  const [ppCurrent, setPpCurrent] = useState(1)
  const [ep, setEp] = useState(2)
  const [sep, setSep] = useState(2)
  const [firstOrSecond, setFirstOrSecond] = useState("first")
  const [extraPPUsedThisTurn, setExtraPPUsedThisTurn] = useState(false)
  const [evolveUsedThisTurn, setEvolveUsedThisTurn] = useState(false)
  const [handCount, setHandCount] = useState(4)
  const [leader, setLeader] = useState<string | null>(null) // 初期値をnullに設定
  const [fairyCount, setFairyCount] = useState(0); // Add state for Fairy tokens
  const [showFairyDetails, setShowFairyDetails] = useState(false); // State for fairy details collapse
  const [graveyardCount, setGraveyardCount] = useState(0); // New state for graveyard count

  // ネメシスアーティファクトトークンの状態
  const [puppetCount, setPuppetCount] = useState(0);
  const [enhancedPuppetCount, setEnhancedPuppetCount] = useState(0);
  const [pastCoreCount, setPastCoreCount] = useState(0);
  const [futureCoreCount, setFutureCoreCount] = useState(0);
  const [castleArtifactCount, setCastleArtifactCount] = useState(0);
  const [attackArtifactCount, setAttackArtifactCount] = useState(0);
  const [destroyArtifactAlphaCount, setDestroyArtifactAlphaCount] = useState(0);
  const [destroyArtifactBetaCount, setDestroyArtifactBetaCount] = useState(0);
  const [destroyArtifactGammaCount, setDestroyArtifactGammaCount] = useState(0);
  const [exceedArtifactOmegaCount, setExceedArtifactOmegaCount] = useState(0);

  // 各ネメシストークンの詳細表示状態
  const [showPuppetDetails, setShowPuppetDetails] = useState(false);
  const [showEnhancedPuppetDetails, setShowEnhancedPuppetDetails] = useState(false);
  const [showPastCoreDetails, setShowPastCoreDetails] = useState(false);
  const [showFutureCoreDetails, setShowFutureCoreDetails] = useState(false);
  const [showCastleArtifactDetails, setShowCastleArtifactDetails] = useState(false);
  const [showAttackArtifactDetails, setShowAttackArtifactDetails] = useState(false);
  const [showDestroyArtifactAlphaDetails, setShowDestroyArtifactAlphaDetails] = useState(false);
  const [showDestroyArtifactBetaDetails, setShowDestroyArtifactBetaDetails] = useState(false);
  const [showDestroyArtifactGammaDetails, setShowDestroyArtifactGammaDetails] = useState(false);
  const [showExceedArtifactOmegaDetails, setShowExceedArtifactOmegaDetails] = useState(false);


  const [tokenNotes, setTokenNotes] = useState("")
  const [gameHistory, setGameHistory] = useState<Array<{ turn: number; action: string; pp: number; hand: number }>>([])
  const [isLeaderModalOpened, setIsLeaderModalOpened] = useState(false); // State for leader selection modal

  // Synthesis Modal States
  const [isSynthesisModalOpened, setIsSynthesisModalOpened] = useState(false);
  const [synthesisTarget, setSynthesisTarget] = useState<string | null>(null); // e.g., "castle_artifact", "destroy_alpha"
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({}); // { tokenId: count } for selected materials
  const [synthesisError, setSynthesisError] = useState(""); // For displaying synthesis errors to user


  // --- Helper to reset all game states (excluding leader) ---
  const resetGameStates = useCallback(() => {
    setTurn(1);
    setBasePpMax(1);
    setExtraPpMax(0);
    setTurnPpBonus(0);
    setPpCurrent(1);
    setEp(2);
    setSep(2);
    setFirstOrSecond("first");
    setExtraPPUsedThisTurn(false);
    setEvolveUsedThisTurn(false);
    setHandCount(4);
    setFairyCount(0);
    setGraveyardCount(0); // Reset graveyard count
    // ネメシスアーティファクトトークンのリセット
    setPuppetCount(0);
    setEnhancedPuppetCount(0);
    setPastCoreCount(0);
    setFutureCoreCount(0);
    setCastleArtifactCount(0);
    setAttackArtifactCount(0);
    setDestroyArtifactAlphaCount(0);
    setDestroyArtifactBetaCount(0);
    setDestroyArtifactGammaCount(0);
    setExceedArtifactOmegaCount(0);
    setTokenNotes("");
    setGameHistory([]);
    setSynthesisError("");
  }, []);

  // --- Auto-open leader selection modal on initial load ---
  useEffect(() => {
    setIsLeaderModalOpened(true);
  }, []); // 空の依存配列で、コンポーネントのマウント時に一度だけ実行

  // --- Derived State (useMemo for performance) ---

  const isEpUsable = useMemo(() => (firstOrSecond === "first" && turn >= 5) || (firstOrSecond === "second" && turn >= 4), [firstOrSecond, turn])
  const isSepUsable = useMemo(() => (firstOrSecond === "first" && turn >= 7) || (firstOrSecond === "second" && turn >= 6), [firstOrSecond, turn])

  // Total PP Max calculation: Base + Extra (capped at 10) + Turn bonus (for second player)
  const ppMax = useMemo(() => {
    const currentBaseMax = Math.min(10, turn);
    const currentExtraCapped = Math.min(extraPpMax, 10 - currentBaseMax);
    return Math.min(10, currentBaseMax + currentExtraCapped) + turnPpBonus;
  }, [turn, extraPpMax, turnPpBonus]);


  const filteredCards = useMemo(() => {
    // 手札が0枚の場合は、除去カード候補を一切表示しない
    if (handCount === 0) {
      return [];
    }
    // リーダーが未選択の場合は除去カード候補を一切表示しない
    if (leader === null) {
      return [];
    }

    return REMOVAL_CARDS
      .filter((card) => card.leader === leader || card.leader === "neutral")
      .map((card) => {
        // 1. Determine the primary actionable effect (default or enhance)
        const actionableEffectForButton = getActionableEffect(card, {
          turn, pp: ppCurrent, ppMax, ep, sep, graveyardCount, evolveUsedThisTurn, isEpUsable, isSepUsable
        });

        // 2. If no primary actionable effect, the card is not playable via its main cost
        if (!actionableEffectForButton) {
            return null;
        }

        // 3. The display cost is always from the primary actionable effect
        const calculatedDisplayCost = actionableEffectForButton.cost;

        // 4. Build the list of all *currently active* effects for display in HoverCard
        const displayableEffects = [];

        // Add the primary actionable effect first
        displayableEffects.push(actionableEffectForButton);

        // Add other active effects (Evolve, Super-evolve, Necromancy, Awakening)
        // Ensure we don't duplicate the primary actionable effect
        card.effects.forEach((eff: any) => {
            // Skip if it's the same as the primary actionable effect (already added)
            if (eff === actionableEffectForButton) return;

            // Check if this other effect is active based on its own conditions
            if (isEffectActive(eff, {
                turn, pp: ppCurrent, ppMax, ep, sep, graveyardCount, cardEffects: card.effects,
                evolveUsedThisTurn, isEpUsable, isSepUsable,
            })) {
                // If it's a modifier, adjust mode for display
                const displayMode = eff.mode.endsWith('_modifier') ? eff.mode.replace('_modifier', '') : eff.mode;
                displayableEffects.push({ ...eff, mode: displayMode });
            }
        });

        // Sort the final displayable effects list for consistent presentation
        // Prioritize: Enhance > Default > Awakening > Necromancy > Evolve > Super-evolve
        displayableEffects.sort((a: any, b: any) => {
            const order = {
                'enhance': 1,
                'default': 2,
                'awakening': 3,
                'necromancy': 4,
                'evolve': 5,
                'super_evolve': 6,
            };
            return (order[a.mode as keyof typeof order] || 99) - (order[b.mode as keyof typeof order] || 99);
        });

        return {
          ...card,
          displayCost: calculatedDisplayCost,
          actionableEffect: actionableEffectForButton, // The effect for the button
          availableEffects: displayableEffects, // The list of effects to display
        };
      })
      .filter((c) => c !== null) // Filter out nulls (cards not playable)
      .sort((a, b) => b.displayCost - a.displayCost); // Sort by display cost
  }, [leader, turn, ppCurrent, ppMax, ep, sep, graveyardCount, evolveUsedThisTurn, isEpUsable, isSepUsable, handCount]);

  const currentStrongMoves = useMemo(() => {
    // リーダーが未選択の場合は強い動きを一切表示しない
    if (leader === null) {
      return [];
    }
    return STRONG_MOVES[leader as keyof typeof STRONG_MOVES]?.filter((move) => move.turn <= turn + 2 && move.turn >= turn) || []
  }, [leader, turn])

  // Calculate total known artifacts for hand display
  const totalKnownArtifacts = useMemo(() => {
    if (leader === "elf") {
      return fairyCount;
    } else if (leader === "nemesis") {
      return (puppetCount || 0) + (enhancedPuppetCount || 0) + (pastCoreCount || 0) + (futureCoreCount || 0) +
             (castleArtifactCount || 0) + (attackArtifactCount || 0) + (destroyArtifactAlphaCount || 0) +
             (destroyArtifactBetaCount || 0) + (destroyArtifactGammaCount || 0) + (exceedArtifactOmegaCount || 0);
    }
    return 0;
  }, [leader, fairyCount, puppetCount, enhancedPuppetCount, pastCoreCount, futureCoreCount,
      castleArtifactCount, attackArtifactCount, destroyArtifactAlphaCount,
      destroyArtifactBetaCount, destroyArtifactGammaCount, exceedArtifactOmegaCount]);


  // --- Handlers ---

  const advanceTurn = useCallback(() => {
    const newTurn = turn + 1
    const newBasePpMax = Math.min(10, newTurn)

    const currentExtraCapped = Math.min(extraPpMax, 10 - newBasePpMax)

    let newTurnPpBonus = 0
    if (firstOrSecond === "second" && !extraPPUsedThisTurn) {
      newTurnPpBonus = 1;
    }

    const newPpMaxForNextTurn = Math.min(10, newBasePpMax + currentExtraCapped) + newTurnPpBonus;

    setGameHistory((prev) => [
      ...prev,
      {
        turn,
        action: `ターン${newTurn}へ進行`,
        pp: ppCurrent,
        hand: handCount,
      },
    ])

    setTurn(newTurn)
    setBasePpMax(newBasePpMax)
    setExtraPpMax(currentExtraCapped)
    setTurnPpBonus(newTurnPpBonus)
    setPpCurrent(newPpMaxForNextTurn)
    setHandCount((prev) => Math.min(prev + 1, 9))
    setEvolveUsedThisTurn(false)
    setExtraPPUsedThisTurn(false);
    // Increment graveyard count by 1 each turn (representing a card drawn and potentially discarded later)
    // Or more accurately, a card played from hand goes to graveyard.
    // For simplicity, let's assume one card goes to graveyard each turn.
    // Reset fairy count if leader changes or turn advances
    if (leader !== "elf") { // Only reset if not Elf, otherwise it's managed by user
        setFairyCount(0);
    }
    // Reset Nemesis artifact counts on turn advance if not Nemesis leader
    if (leader !== "nemesis") {
      setPuppetCount(0);
      setEnhancedPuppetCount(0);
      setPastCoreCount(0);
      setFutureCoreCount(0);
      setCastleArtifactCount(0);
      setAttackArtifactCount(0);
      setDestroyArtifactAlphaCount(0);
      setDestroyArtifactBetaCount(0);
      setDestroyArtifactGammaCount(0);
      setExceedArtifactOmegaCount(0);
    }
  }, [turn, extraPpMax, ppCurrent, handCount, firstOrSecond, extraPPUsedThisTurn, leader])


  const handleTurnChange = useCallback((newTurn: number) => {
    if (newTurn !== turn) {
      setEvolveUsedThisTurn(false)
      setExtraPPUsedThisTurn(false)
      setEp(2)
      setSep(2)
    }

    const newBase = Math.min(10, newTurn)
    const cappedExtra = Math.min(extraPpMax, 10 - newBase)
    const newCalculatedPpMax = Math.min(10, newBase + cappedExtra) + (firstOrSecond === "second" && !extraPPUsedThisTurn ? 1 : 0);

    setTurn(newTurn)
    setBasePpMax(newBase)
    setExtraPpMax(cappedExtra)
    setTurnPpBonus((firstOrSecond === "second" && !extraPPUsedThisTurn) ? 1 : 0)
    setPpCurrent(newCalculatedPpMax)
    // Reset fairy count if leader changes or turn advances
    if (leader !== "elf") { // Only reset if not Elf, otherwise it's managed by user
        setFairyCount(0);
    }
    // Reset Nemesis artifact counts on turn change if not Nemesis leader
    if (leader !== "nemesis") {
      setPuppetCount(0);
      setEnhancedPuppetCount(0);
      setPastCoreCount(0);
      setFutureCoreCount(0);
      setCastleArtifactCount(0);
      setAttackArtifactCount(0);
      setDestroyArtifactAlphaCount(0);
      setDestroyArtifactBetaCount(0);
      setDestroyArtifactGammaCount(0);
      setExceedArtifactOmegaCount(0);
    }
  }, [turn, extraPpMax, firstOrSecond, extraPPUsedThisTurn, leader])

  const handleUseCard = useCallback((card: any, effectToUse: any) => {
    const newPp = Math.max(0, ppCurrent - effectToUse.cost)
    let newHandCount = Math.max(0, handCount - 1)
    let newGraveyardCount = graveyardCount;

    // If necromancy effect is used, consume graveyard count
    // This logic needs to be careful: effectToUse is the PRIMARY effect.
    // We need to check if the card *also* had an active necromancy_modifier.
    const necromancyModifier = card.effects.find((eff: any) => eff.mode === 'necromancy_modifier');
    if (necromancyModifier && isEffectActive(necromancyModifier, {
        turn, pp: ppCurrent, ppMax, ep, sep, graveyardCount, cardEffects: card.effects,
        evolveUsedThisTurn, isEpUsable, isSepUsable,
    })) {
        newGraveyardCount = Math.max(0, graveyardCount - (necromancyModifier.conditions?.necromancyCost || 0));
    } else {
      // For any card played from hand (that isn't a consumed Necromancy), it goes to graveyard
      newGraveyardCount = graveyardCount + 1;
    }


    setPpCurrent(newPp)
    setHandCount(newHandCount)
    setGraveyardCount(newGraveyardCount); // Update graveyard count
    setGameHistory((prev) => [
      ...prev,
      {
        turn,
        action: `${card.name} (${(EFFECT_MODES[effectToUse.mode as keyof typeof EFFECT_MODES] as any).props.children})使用`,
        pp: newPp,
        hand: newHandCount,
      },
    ])
    // If a Fairy token is used, decrement fairyCount if it's not 0
    if (card.id === "fairy_token" && fairyCount > 0) { // Assuming a fairy token card has id "fairy_token"
        setFairyCount(prev => Math.max(0, prev - 1));
    } else if (fairyCount > 0) { // If any other card is used and there are known fairies, it means an unknown card was used
        // This is a simplification. In a real game, you'd need to know *which* card was used.
        // For now, if a non-fairy card is used and fairies are known, we assume an unknown card was used.
        // If the used card was a known fairy, the above 'fairy_token' check handles it.
        // If the used card was not a fairy, and fairyCount is > 0, it means one of the 'unknown' cards was used.
        // The handCount already decreases, so the visual representation will adjust.
        // No direct change to fairyCount here unless the card itself is a fairy.
    }
  }, [ppCurrent, handCount, graveyardCount, turn, fairyCount, ppMax])


  const handlePpMaxIncrease = useCallback(() => {
    setExtraPpMax((prevExtra) => {
      const newBase = Math.min(10, turn);
      const newExtra = Math.min(prevExtra + 1, 10 - newBase);
      const potentialPpMax = Math.min(10, newBase + newExtra) + turnPpBonus;
      if (ppCurrent > potentialPpMax) setPpCurrent(potentialPpMax);
      return newExtra;
    });
  }, [turn, ppCurrent, turnPpBonus]);

  const handlePpMaxDecrease = useCallback(() => {
    setExtraPpMax((prevExtra) => {
      const newBase = Math.min(10, turn);
      const newExtra = Math.max(0, prevExtra - 1);
      const potentialPpMax = Math.min(10, newBase + newExtra) + turnPpBonus;
      if (ppCurrent > potentialPpMax) setPpCurrent(potentialPpMax);
      return newExtra;
    });
  }, [turn, ppCurrent, turnPpBonus]);

  // --- Nemesis Artifact Handlers ---

  // Generic function to get artifact count by ID
  const getArtifactCount = useCallback((tokenId: string) => {
    switch (tokenId) {
      case "puppet": return puppetCount;
      case "enhanced_puppet": return enhancedPuppetCount;
      case "past_core": return pastCoreCount;
      case "future_core": return futureCoreCount;
      case "castle_artifact": return castleArtifactCount;
      case "attack_artifact": return attackArtifactCount;
      case "destroy_artifact_alpha": return destroyArtifactAlphaCount;
      case "destroy_artifact_beta": return destroyArtifactBetaCount;
      case "destroy_artifact_gamma": return destroyArtifactGammaCount;
      case "exceed_artifact_omega": return exceedArtifactOmegaCount;
      default: return 0;
    }
  }, [puppetCount, enhancedPuppetCount, pastCoreCount, futureCoreCount,
      castleArtifactCount, attackArtifactCount, destroyArtifactAlphaCount,
      destroyArtifactBetaCount, destroyArtifactGammaCount, exceedArtifactOmegaCount]);

  // Generic function to set artifact count by ID
  const setArtifactCount = useCallback((tokenId: string, newCount: number) => {
    switch (tokenId) {
      case "puppet": setPuppetCount(newCount); break;
      case "enhanced_puppet": setEnhancedPuppetCount(newCount); break;
      case "past_core": setPastCoreCount(newCount); break;
      case "future_core": setFutureCoreCount(newCount); break;
      case "castle_artifact": setCastleArtifactCount(newCount); break;
      case "attack_artifact": setAttackArtifactCount(newCount); break;
      case "destroy_artifact_alpha": setDestroyArtifactAlphaCount(newCount); break;
      case "destroy_artifact_beta": setDestroyArtifactBetaCount(newCount); break;
      case "destroy_artifact_gamma": setDestroyArtifactGammaCount(newCount); break;
      case "exceed_artifact_omega": setExceedArtifactOmegaCount(newCount); break;
      default: break;
    }
  }, []);

  // Handle artifact count changes with +/- buttons
  const handleArtifactCountChange = useCallback((tokenId: string, change: number) => {
    const currentCount = getArtifactCount(tokenId);
    const newCount = Math.max(0, currentCount + change);

    // Update the specific token count
    setArtifactCount(tokenId, newCount);

    // If removing an artifact, decrease hand count.
    // If adding, hand count will be adjusted by the useEffect based on totalKnownArtifacts.
    if (change < 0 && currentCount > 0) {
      setHandCount(prev => Math.max(0, prev - 1));
    }
  }, [getArtifactCount, setArtifactCount]);

  // Effect to synchronize handCount with totalKnownArtifacts
  // Ensures handCount is always at least totalKnownArtifacts
  useEffect(() => {
    setHandCount(prevHandCount => Math.max(prevHandCount, totalKnownArtifacts));
  }, [totalKnownArtifacts]);

  // Synthesis Logic
  const executeSynthesis = useCallback((materialsToConsume: Record<string, number>, targetArtifactId: string) => {
    let canSynthesize = true;
    let actionMessage = "";
    let producedArtifact: string | null = null;

    // Check if enough materials are available in hand
    for (const [materialId, requiredCount] of Object.entries(materialsToConsume)) {
      if (getArtifactCount(materialId) < requiredCount) {
        canSynthesize = false;
        setSynthesisError(`${NEMESIS_ARTIFACT_TOKENS.find(t => t.id === materialId)?.name}が足りません。`);
        break;
      }
    }

    if (!canSynthesize) {
      return;
    }

    // --- Synthesis Rules ---
    if (targetArtifactId === "castle_artifact") {
      // Rule 1: 2 Past Cores
      const isTwoPastCore = (materialsToConsume["past_core"] || 0) === 2 && Object.keys(materialsToConsume).length === 1;
      // Rule 2: 1 Past Core and 1 Future Core
      const isOneEachCore = (materialsToConsume["past_core"] || 0) === 1 && (materialsToConsume["future_core"] || 0) === 1 && Object.keys(materialsToConsume).length === 2;

      if (isTwoPastCore || isOneEachCore) {
        producedArtifact = "castle_artifact";
        actionMessage = isTwoPastCore ? `パスト・コア2枚を合成しキャッスルアーティファクトを生成` : `パスト・コアとフューチャー・コアを合成しキャッスルアーティファクトを生成`;
      } else {
        canSynthesize = false;
        setSynthesisError("キャッスルアーティファクトの合成条件を満たしていません (パスト・コア2枚、またはパスト・コアとフューチャー・コアが1枚ずつ必要です)。");
      }
    } else if (targetArtifactId === "attack_artifact") {
      // Rule 1: 2 Future Cores
      const isTwoFutureCore = (materialsToConsume["future_core"] || 0) === 2 && Object.keys(materialsToConsume).length === 1;
      // Rule 2: 1 Past Core and 1 Future Core
      const isOneEachCore = (materialsToConsume["past_core"] || 0) === 1 && (materialsToConsume["future_core"] || 0) === 1 && Object.keys(materialsToConsume).length === 2;

      if (isTwoFutureCore || isOneEachCore) {
        producedArtifact = "attack_artifact";
        actionMessage = isTwoFutureCore ? `フューチャー・コア2枚を合成しアタックアーティファクトを生成` : `パスト・コアとフューチャー・コアを合成しアタックアーティファクトを生成`;
      } else {
        canSynthesize = false;
        setSynthesisError("アタックアーティファクトの合成条件を満たしていません (フューチャー・コア2枚、またはパスト・コアとフューチャー・コアが1枚ずつ必要です)。");
      }
    } else if (targetArtifactId === "destroy_artifact_alpha") {
        const intermediateArtifacts = ["castle_artifact", "attack_artifact"];
        const oneCostArtifacts = ["past_core", "future_core"];

        const selectedIntermediateId = Object.keys(materialsToConsume).find(id => intermediateArtifacts.includes(id) && (materialsToConsume[id] || 0) === 1);
        const selectedOneCostId = Object.keys(materialsToConsume).find(id => oneCostArtifacts.includes(id) && (materialsToConsume[id] || 0) === 1);

        if (selectedIntermediateId && selectedOneCostId && Object.keys(materialsToConsume).length === 2) {
            producedArtifact = "destroy_artifact_alpha";
            actionMessage = `${NEMESIS_ARTIFACT_TOKENS.find(t => t.id === selectedIntermediateId)?.name}と${NEMESIS_ARTIFACT_TOKENS.find(t => t.id === selectedOneCostId)?.name}を合成しデストロイアーティファクトαを生成`;
        } else { canSynthesize = false; setSynthesisError("デストロイアーティファクトαの合成条件を満たしていません。"); }
    } else if (targetArtifactId === "destroy_artifact_beta") {
        const intermediateArtifacts = ["castle_artifact", "attack_artifact"];
        const oneCostArtifacts = ["past_core", "future_core"];

        const selectedIntermediateId = Object.keys(materialsToConsume).find(id => intermediateArtifacts.includes(id) && (materialsToConsume[id] || 0) === 1);
        // Count 1-cost materials, allowing for duplicates if multiple copies of the same token are used
        let oneCostMaterialCount = 0;
        for (const id of oneCostArtifacts) {
            oneCostMaterialCount += (materialsToConsume[id] || 0);
        }

        if (selectedIntermediateId && oneCostMaterialCount === 2 && Object.keys(materialsToConsume).length >= 2) { // Allow 2 or 3 keys if two 1-cost are same or different
            producedArtifact = "destroy_artifact_beta";
            actionMessage = `${NEMESIS_ARTIFACT_TOKENS.find(t => t.id === selectedIntermediateId)?.name}と1コストアーティファクト2枚を合成しデストロイアーティファクトβを生成`;
        } else { canSynthesize = false; setSynthesisError("デストロイアーティファクトβの合成条件を満たしていません。"); }
    } else if (targetArtifactId === "destroy_artifact_gamma") {
        const intermediateArtifacts = ["castle_artifact", "attack_artifact"]; // 3-cost base
        const otherMaterials = ["castle_artifact", "attack_artifact", "destroy_artifact_alpha", "destroy_artifact_beta", "destroy_artifact_gamma"]; // 3-cost or 5-cost other

        const selectedIntermediateBaseId = Object.keys(materialsToConsume).find(id => intermediateArtifacts.includes(id) && (materialsToConsume[id] || 0) === 1);
        const selectedOtherMaterialId = Object.keys(materialsToConsume).find(id => id !== selectedIntermediateBaseId && otherMaterials.includes(id) && (materialsToConsume[id] || 0) === 1);

        if (selectedIntermediateBaseId && selectedOtherMaterialId && Object.keys(materialsToConsume).length === 2) {
            producedArtifact = "destroy_artifact_gamma";
            actionMessage = `${NEMESIS_ARTIFACT_TOKENS.find(t => t.id === selectedIntermediateBaseId)?.name}と${NEMESIS_ARTIFACT_TOKENS.find(t => t.id === selectedOtherMaterialId)?.name}を合成しデストロイアーティファクトγを生成`;
        } else { canSynthesize = false; setSynthesisError("デストロイアーティファクトγの合成条件を満たしていません。"); }
    } else if (targetArtifactId === "exceed_artifact_omega") {
        // New rule: requires 1 Alpha, 1 Beta, 1 Gamma
        if ((materialsToConsume["destroy_artifact_alpha"] || 0) === 1 &&
            (materialsToConsume["destroy_artifact_beta"] || 0) === 1 &&
            (materialsToConsume["destroy_artifact_gamma"] || 0) === 1 &&
            Object.keys(materialsToConsume).length === 3) {
            producedArtifact = "exceed_artifact_omega";
            actionMessage = `デストロイアーティファクトα、β、γを合成しイクシードアーティファクトΩを生成`;
        } else { canSynthesize = false; setSynthesisError("イクシードアーティファクトΩの合成条件を満たしていません (デストロイα、β、γがそれぞれ1枚ずつ必要です)。"); }
    }

    if (canSynthesize && producedArtifact) {
      let currentHandCount = handCount;
      // Consume materials
      for (const [materialId, count] of Object.entries(materialsToConsume)) {
        setArtifactCount(materialId, getArtifactCount(materialId) - count);
        currentHandCount -= count;
      }
      // Produce artifacts
      setArtifactCount(producedArtifact, getArtifactCount(producedArtifact) + 1);
      currentHandCount += 1; // Always produce 1 artifact

      setHandCount(currentHandCount); // Update total hand count
      setGameHistory(prev => [...prev, { turn, action: actionMessage, pp: ppCurrent, hand: currentHandCount }]);
      setIsSynthesisModalOpened(false);
      setSelectedMaterials({}); // Clear selected materials after successful synthesis
      setSynthesisError("");
    } else {
      // Error already set by synthesis rule checks
    }
  }, [getArtifactCount, setArtifactCount, handCount, turn, ppCurrent]);


  const openSynthesisModal = useCallback((targetId: string) => {
    setSynthesisTarget(targetId);
    setSelectedMaterials({}); // Reset selected materials
    setSynthesisError(""); // Clear previous errors

    // Auto-selection for Castle/Attack Synthesis
    if (targetId === "castle_artifact") {
      const canTwoPastCore = pastCoreCount >= 2;
      const canOneEachCore = pastCoreCount >= 1 && futureCoreCount >= 1;

      // Pre-select if only one option is available, but still open modal
      if (canTwoPastCore && !canOneEachCore) {
        setSelectedMaterials({ "past_core": 2 });
      } else if (!canTwoPastCore && canOneEachCore) {
        setSelectedMaterials({ "past_core": 1, "future_core": 1 });
      }
      // If both are possible, no pre-selection, let user choose
      // If neither is possible, setSelectedMaterials remains empty, and the button should be disabled
    } else if (targetId === "attack_artifact") {
      const canTwoFutureCore = futureCoreCount >= 2;
      const canOneEachCore = pastCoreCount >= 1 && futureCoreCount >= 1;

      // Pre-select if only one option is available, but still open modal
      if (canTwoFutureCore && !canOneEachCore) {
        setSelectedMaterials({ "future_core": 2 });
      } else if (!canTwoFutureCore && canOneEachCore) {
        setSelectedMaterials({ "past_core": 1, "future_core": 1 });
      }
    }
    // Auto-selection for Destroy artifacts' 3-cost material
    else if (["destroy_artifact_alpha", "destroy_artifact_beta", "destroy_artifact_gamma"].includes(targetId)) {
      const available3Cost = [];
      if (castleArtifactCount > 0) available3Cost.push("castle_artifact");
      if (attackArtifactCount > 0) available3Cost.push("attack_artifact");

      let initialSelectedMaterials: Record<string, number> = {};
      if (available3Cost.length === 1) {
        initialSelectedMaterials[available3Cost[0]] = 1;
      }
      setSelectedMaterials(initialSelectedMaterials);
    }
    // Auto-synthesis for Exceed Omega
    else if (targetId === "exceed_artifact_omega") {
      const currentDestroyAlpha = destroyArtifactAlphaCount || 0;
      const currentDestroyBeta = destroyArtifactBetaCount || 0;
      const currentDestroyGamma = destroyArtifactGammaCount || 0;

      // New auto-synthesis: if exactly 1 of each (Alpha, Beta, Gamma) is available
      if (currentDestroyAlpha === 1 && currentDestroyBeta === 1 && currentDestroyGamma === 1) {
        executeSynthesis({ "destroy_artifact_alpha": 1, "destroy_artifact_beta": 1, "destroy_artifact_gamma": 1 }, targetId);
        return;
      }
      // Pre-select available destroy artifacts if not auto-synthesizing
      const preselected: Record<string, number> = {};
      if (currentDestroyAlpha > 0) preselected["destroy_artifact_alpha"] = 1;
      if (currentDestroyBeta > 0) preselected["destroy_artifact_beta"] = 1;
      if (currentDestroyGamma > 0) preselected["destroy_artifact_gamma"] = 1;
      setSelectedMaterials(preselected);
    }

    setIsSynthesisModalOpened(true); // Open modal if auto-synthesis not met or partial auto-selection
  }, [pastCoreCount, futureCoreCount, castleArtifactCount, attackArtifactCount, destroyArtifactAlphaCount, destroyArtifactBetaCount, destroyArtifactGammaCount, executeSynthesis]);


  const handleMaterialSelection = useCallback((tokenId: string, checked: boolean, isBaseMaterial: boolean = false) => {
    setSelectedMaterials(prev => {
      const newMaterials: Record<string, number> = { ...prev };

      if (isBaseMaterial) {
        // For base material radio groups (e.g., 3-cost for Destroy, core combinations for Castle/Attack)
        // Clear previous selection for this group and set the new one
        const currentBaseMaterialIds = ["castle_artifact", "attack_artifact", "past_core_x2", "future_core_x2", "past_future_x1"];
        currentBaseMaterialIds.forEach(id => {
          // Special handling to remove individual cores if a combination was previously selected
          if (id === "past_core_x2" || id === "past_future_x1") delete newMaterials["past_core"];
          if (id === "future_core_x2" || id === "past_future_x1") delete newMaterials["future_core"];
          delete newMaterials[id]; // Remove the combination ID
        });

        if (checked) {
          // Special handling for core combinations to store individual cores
          if (tokenId === "past_core_x2") {
            newMaterials["past_core"] = 2;
          } else if (tokenId === "future_core_x2") {
            newMaterials["future_core"] = 2;
          } else if (tokenId === "past_future_x1") {
            newMaterials["past_core"] = 1;
            newMaterials["future_core"] = 1;
          } else {
            newMaterials[tokenId] = 1;
          }
        }
      } else {
        // For other materials (e.g., 1-cost for Destroy, or individual Destroy for Omega)
        if (checked) {
          newMaterials[tokenId] = (newMaterials[tokenId] || 0) + 1; // Allow multiple if needed (e.g., for Destroy Beta)
        } else {
          newMaterials[tokenId] = (newMaterials[tokenId] || 0) - 1;
          if (newMaterials[tokenId] <= 0) {
            delete newMaterials[tokenId];
          }
        }
      }
      return newMaterials;
    });
  }, []);


  // Filter available materials for the synthesis modal
  const availableMaterials = useMemo(() => {
    const materials: Array<any> = []; // Explicitly type materials array
    NEMESIS_ARTIFACT_TOKENS.forEach(token => {
      const count = getArtifactCount(token.id);
      if (count > 0) {
        materials.push({ ...token, currentCount: count }); // Add currentCount for display
      }
    });
    return materials;
  }, [getArtifactCount]);

  // Generate combinations for Destroy Beta
  const generateDestroyBetaCombinations = useCallback(() => {
    const oneCostTokens = availableMaterials.filter(t => ["past_core", "future_core"].includes(t.id));
    const combinations: Array<{ id: string; materials: string[]; name: string }> = []; // Explicitly type combinations array

    // Flatten the available 1-cost tokens into an array of individual tokens
    const individualOneCostTokens: string[] = []; // Explicitly type individualOneCostTokens array
    oneCostTokens.forEach(token => {
      for (let i = 0; i < token.currentCount; i++) {
        individualOneCostTokens.push(token.id);
      }
    });

    if (individualOneCostTokens.length < 2) return []; // Need at least two 1-cost tokens

    for (let i = 0; i < individualOneCostTokens.length; i++) {
      for (let j = i + 1; j < individualOneCostTokens.length; j++) {
        const combo = [individualOneCostTokens[i], individualOneCostTokens[j]].sort(); // Sort to ensure uniqueness
        const comboId = combo.join('-'); // Unique ID for the combination
        const comboNames = combo.map(id => NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id)?.name).join('と');
        combinations.push({ id: comboId, materials: combo, name: comboNames });
      }
    }
    // Filter out duplicate combinations (e.g., [puppet, puppet] if only one puppet exists)
    // This simple combination generation might produce duplicates if multiple copies of same token are available.
    // Need to ensure distinct pairs of *actual tokens*, not just token types.
    // The current approach using `individualOneCostTokens` should handle this correctly.
    // Filter out combinations where a token is used more than its available count.
    const uniqueCombinations = Array.from(new Set(combinations.map(c => c.id))).map(id => combinations.find(c => c.id === id)) as Array<{ id: string; materials: string[]; name: string }>;

    return uniqueCombinations;
  }, [availableMaterials]);


  // --- Render ---

  // Get current leader label for display
  const currentLeaderLabel = useMemo(() => {
    const foundLeader = LEADERS.find(l => l.value === leader);
    return foundLeader ? foundLeader.label : "リーダーを選択";
  }, [leader]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0d1117 100%)",
        color: "var(--mantine-color-blue-1)",
      }}
    >
      <Group align="flex-start" wrap="nowrap" gap="xl" p="sm">
        <Title order={1} c="blue.1">
            Shadowverse: Worlds Beyond - 盤面整理ツール
        </Title>
      </Group>
      <Group align="flex-start" wrap="nowrap" gap="xl" p="xl">
        {/* 左側：入力エリア */}
        <Card
          shadow="xl"
          withBorder
          style={{
            height:"calc(100vh-133px)",
            minWidth: 380,
            backgroundColor: "var(--mantine-color-dark-8)",
            borderColor: "var(--mantine-color-blue-9)",
          }}
        >
          <Stack gap="lg">
            <Group justify="space-between"> {/* Added justify="space-between" to align title and button */}
              <Group>
                <IconBrain size={24} color="var(--mantine-color-blue-4)" />
                <Title order={2} c="blue.3">
                  対戦状況
                </Title>
              </Group>
              <ActionIcon
                variant="filled"
                color="red"
                size="lg"
                radius="xl"
                onClick={resetGameStates}
                title="全ての情報をリセット"
                styles={{
                  root: {
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-red-7)",
                    },
                  },
                }}
              >
                <IconRefresh size={20} />
              </ActionIcon>
            </Group>

            <Card withBorder p="md" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
              <Text size="sm" c="blue.4" mb="xs">
                相手リーダーと先後
              </Text>
              <Group gap="md">
                {/* Leader selection card to open modal */}
                <Card
                  withBorder
                  p="xs"
                  onClick={() => setIsLeaderModalOpened(true)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--mantine-color-dark-6)',
                    borderColor: 'var(--mantine-color-blue-7)',
                    flexGrow: 1,
                  }}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" c="blue.2" fw={500}>
                      {currentLeaderLabel}
                    </Text>
                    <IconUsers size={20} color="var(--mantine-color-blue-4)" />
                  </Group>
                </Card>

                <Radio.Group value={firstOrSecond} color="blue" onChange={setFirstOrSecond}>
                  <Group gap="md">
                    <Radio value="first" label={<Text color="blue">先手</Text>} color="blue" />
                    <Radio value="second" label={<Text color="blue">後手</Text>} color="blue" />
                  </Group>
                </Radio.Group>
              </Group>
            </Card>

            <Button
              onClick={advanceTurn}
              size="md"
              variant="gradient"
              gradient={{ from: "blue.8", to: "blue.6" }}
              leftSection={<IconSword size={16} />}
              styles={{
                root: {
                  "&[data-disabled]": {
                    backgroundColor: "var(--mantine-color-dark-9) !important",
                    color: "var(--mantine-color-dark-5) !important",
                    cursor: "not-allowed",
                  },
                },
              }}
            >
              次ターンへ →
            </Button>

            <DotSelector value={turn} max={10} onChange={handleTurnChange} label="ターン数" />
            <DotSelector
              value={handCount}
              max={9}
              onChange={(val: number) => {
                setHandCount(Math.max(val, totalKnownArtifacts)); // Ensure handCount is at least totalKnownArtifacts
              }}
              label="相手の手札枚数"
              knownCount={totalKnownArtifacts} // Reflect total known artifacts
              knownColor={leader === "elf" ? "green" : "cyan"} // Different color for Nemesis artifacts
            />
            <DotSelector
              value={ppCurrent}
              max={ppMax}
              onChange={(val: number) => setPpCurrent(Math.min(val, ppMax))}
              label={`現在のPP（上限: ${ppMax}）`}
            />

            {leader === "nightmare" && (
                <NumericCounter
                    value={graveyardCount}
                    onChange={setGraveyardCount}
                    label="墓地枚数"
                    min={0}
                    // No max for graveyard count, it can grow indefinitely
                />
            )}

            <Group wrap="nowrap">
              {leader === "dragon" && (
                <>
                  <Button
                    onClick={handlePpMaxDecrease}
                    color="red"
                    size="xs"
                    variant="light"
                    styles={{
                      root: {
                        "&[data-disabled]": {
                          backgroundColor: "var(--mantine-color-dark-9) !important",
                          color: "var(--mantine-color-dark-5) !important",
                          cursor: "not-allowed",
                        },
                      },
                    }}
                  >
                    PP上限 -1
                  </Button>
                  <Button
                    onClick={handlePpMaxIncrease}
                    size="xs"
                    variant="light"
                    color="blue"
                    styles={{
                      root: {
                        "&[data-disabled]": {
                          backgroundColor: "var(--mantine-color-dark-9) !important",
                          color: "var(--mantine-color-dark-5) !important",
                          cursor: "not-allowed",
                        },
                      },
                    }}
                  >
                    PP上限 +1
                  </Button>
                </>
              )}

              {firstOrSecond === "second" && (
                <Switch
                  label={<Text color="blue">エクストラPP</Text>}
                  checked={turnPpBonus === 1}
                  color="blue"
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    setTurnPpBonus(checked ? 1 : 0)
                    setPpCurrent((prev) => Math.min(prev + (checked ? 1 : -1), ppMax+1))
                    setExtraPPUsedThisTurn(!checked);
                  }}
                />
              )}
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <Card withBorder padding="md" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                  <Group gap="xs" wrap="nowrap">
                    <DotSelector value={ep} max={2} onChange={setEp} disabled={!isEpUsable || evolveUsedThisTurn} label="EP" />
                    <Button
                      onClick={() => {
                        setEp((v) => Math.max(0, v - 1))
                        setEvolveUsedThisTurn(true)
                      }}
                      disabled={ep === 0 || evolveUsedThisTurn || !isEpUsable}
                      size="sm"
                      variant="filled"
                      color="blue"
                      styles={{
                        root: {
                          "&[data-disabled]": {
                            backgroundColor: "var(--mantine-color-dark-9) !important",
                            color: "var(--mantine-color-dark-5) !important",
                            cursor: "not-allowed",
                          },
                        },
                      }}
                    >
                      使用
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card withBorder padding="md" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                  <Group gap="xs" wrap="nowrap">
                    <DotSelector value={sep} max={2} onChange={setSep} disabled={!isSepUsable || evolveUsedThisTurn} label="SEP" />
                    <Button
                      onClick={() => {
                        setSep((v) => Math.max(0, v - 1))
                        setEvolveUsedThisTurn(true)
                      }}
                      disabled={sep === 0 || evolveUsedThisTurn || !isSepUsable}
                      size="sm"
                      variant="filled"
                      color="blue"
                      styles={{
                        root: {
                          "&[data-disabled]": {
                            backgroundColor: "var(--mantine-color-dark-9) !important",
                            color: "var(--mantine-color-dark-5) !important",
                            cursor: "not-allowed",
                          },
                        },
                      }}
                    >
                      使用
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* 右側：分析エリア */}
        <Card
          shadow="xl"
          withBorder
          style={{
            height:"calc(100vh-133px)",
            flex: 1,
            backgroundColor: "var(--mantine-color-dark-8)",
            borderColor: "var(--mantine-color-blue-9)",
          }}
        >
          <Tabs defaultValue="removal" color="blue" style={{ flexShrink: 0 }}>
            <Tabs.List style={{ color: "white" }}>
              <Tabs.Tab
                value="removal"
                leftSection={<IconSword size={16} />}
                style={{ color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                除去カード
              </Tabs.Tab>
              <Tabs.Tab
                value="tokens"
                leftSection={<IconShield size={16} />}
                style={{ color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                トークン管理
              </Tabs.Tab>
            </Tabs.List>
            <Box style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Tabs.Panel value="removal" pt="md" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
              <Stack gap="md">
                <Title order={3} c="blue.3">
                  使用可能な除去カード
                </Title>
                  <Group gap="sm">
                    {filteredCards.length > 0 ? (
                      filteredCards.map((card) => (
                        <RemovalCardBlock
                          key={card.id}
                          card={card}
                          ppCurrent={ppCurrent}
                          ppMax={ppMax}
                          onUseCard={handleUseCard}
                          actionableEffect={card.actionableEffect} // Pass the actionable effect
                        />
                      ))
                    ) : (
                      <Text c="blue.4">現在使用可能な除去カードはありません。</Text>
                    )}
                  </Group>
              </Stack>
              </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value="tokens" pt="md" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
              <Stack gap="md">
                <Title order={3} c="blue.3">
                  トークン・特殊効果メモ
                </Title>
                {leader === "elf" ? (
                  <Stack gap="md">
                    <Card withBorder style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                      <Group justify="space-between" wrap="nowrap">
                        <Group>
                          <Text size="sm" c="blue.4">
                            フェアリー
                          </Text>
                          <Badge color="green" variant="light">
                            {fairyCount}枚
                          </Badge>
                        </Group>
                        <ActionIcon
                          variant="light"
                          onClick={() => setShowFairyDetails((o) => !o)}
                          color="blue"
                          size="md"
                        >
                          {showFairyDetails ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                        </ActionIcon>
                      </Group>
                      <Collapse in={showFairyDetails}>
                        <Stack gap="xs" mt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-5)', paddingTop: '10px' }}>
                          <Text size="sm" c="blue.4" mb="xs">
                            フェアリーの効果:
                          </Text>
                          <Text size="xs" c="dark.3">
                            コスト: 1
                            <br />攻撃力: 1
                            <br />体力: 1
                            <br />効果: 突進
                          </Text>
                        </Stack>
                      </Collapse>
                    </Card>
                    <DotSelector
                      value={fairyCount}
                      max={handCount} // フェアリーの最大数は手札枚数まで
                      onChange={(val: number) => setFairyCount(Math.min(val, handCount))} // 手札枚数を超えないように調整
                      label="確定フェアリー数"
                    />
                  </Stack>
                ) : leader === "nemesis" ? (
                  <Stack gap="md">
                    <Text size="sm" c="blue.4" mb="xs">
                      操り人形トークン
                    </Text>
                    <Grid gutter="xs">
                      {/* 操り人形、強化型操り人形 */}
                      <Grid.Col span={6}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "puppet")!}
                          count={puppetCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "enhanced_puppet")!}
                          count={enhancedPuppetCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                    </Grid>

                    <Text size="sm" c="blue.4" mb="xs" mt="md">
                      コア・アーティファクト
                    </Text>
                    <Grid gutter="xs">
                      {/* パストコア、フューチャーコア */}
                      <Grid.Col span={6}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "past_core")!}
                          count={pastCoreCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "future_core")!}
                          count={futureCoreCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>

                      {/* キャッスルアーティファクト、アタックアーティファクト */}
                      <Grid.Col span={6}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "castle_artifact")!}
                          count={castleArtifactCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "attack_artifact")!}
                          count={attackArtifactCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>

                      {/* デストロイアーティファクトα、β、γ */}
                      <Grid.Col span={4}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "destroy_artifact_alpha")!}
                          count={destroyArtifactAlphaCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "destroy_artifact_beta")!}
                          count={destroyArtifactBetaCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "destroy_artifact_gamma")!}
                          count={destroyArtifactGammaCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>

                      {/* イクシードアーティファクトΩ */}
                      <Grid.Col span={12}>
                        <NemesisTokenCard
                          token={NEMESIS_ARTIFACT_TOKENS.find(t => t.id === "exceed_artifact_omega")!}
                          count={exceedArtifactOmegaCount}
                          handleArtifactCountChange={handleArtifactCountChange}
                          handCount={handCount}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* 合成ボタンのセクション */}
                    <Title order={4} c="blue.3" mt="md">
                      アーティファクト合成
                    </Title>
                    <Group grow>
                      <Button
                        onClick={() => openSynthesisModal("castle_artifact")}
                        disabled={!(pastCoreCount >= 2 || (pastCoreCount >= 1 && futureCoreCount >= 1))}
                        size="sm"
                        variant="gradient"
                        gradient={{ from: "teal.8", to: "teal.6" }}
                        leftSection={<IconBoxMultiple size={16} />}
                        styles={{
                          root: {
                            "&[data-disabled]": {
                              backgroundColor: "var(--mantine-color-dark-9) !important",
                              color: "var(--mantine-color-dark-5) !important",
                              cursor: "not-allowed",
                            },
                          },
                        }}
                      >
                        キャッスル合成
                      </Button>
                      <Button
                        onClick={() => openSynthesisModal("attack_artifact")}
                        disabled={!(futureCoreCount >= 2 || (pastCoreCount >= 1 && futureCoreCount >= 1))}
                        size="sm"
                        variant="gradient"
                        gradient={{ from: "teal.8", to: "teal.6" }}
                        leftSection={<IconBoxMultiple size={16} />}
                        styles={{
                          root: {
                            "&[data-disabled]": {
                              backgroundColor: "var(--mantine-color-dark-9) !important",
                              color: "var(--mantine-color-dark-5) !important",
                              cursor: "not-allowed",
                            },
                          },
                        }}
                      >
                        アタック合成
                      </Button>
                    </Group>
                    <Group grow>
                      <Button
                        onClick={() => openSynthesisModal("destroy_artifact_alpha")}
                        disabled={!(((castleArtifactCount || 0) + (attackArtifactCount || 0)) >= 1 && ((puppetCount || 0) + (enhancedPuppetCount || 0) + (pastCoreCount || 0) + (futureCoreCount || 0)) >= 1)}
                        size="sm"
                        variant="gradient"
                        gradient={{ from: "orange.8", to: "orange.6" }}
                        leftSection={<IconBoxMultiple size={16} />}
                        styles={{
                          root: {
                            "&[data-disabled]": {
                              backgroundColor: "var(--mantine-color-dark-9) !important",
                              color: "var(--mantine-color-dark-5) !important",
                              cursor: "not-allowed",
                            },
                          },
                        }}
                      >
                        デストロイα合成
                      </Button>
                      <Button
                        onClick={() => openSynthesisModal("destroy_artifact_beta")}
                        disabled={!(((castleArtifactCount || 0) + (attackArtifactCount || 0)) >= 1 && ((puppetCount || 0) + (enhancedPuppetCount || 0) + (pastCoreCount || 0) + (futureCoreCount || 0)) >= 2)}
                        size="sm"
                        variant="gradient"
                        gradient={{ from: "orange.8", to: "orange.6" }}
                        leftSection={<IconBoxMultiple size={16} />}
                        styles={{
                          root: {
                            "&[data-disabled]": {
                              backgroundColor: "var(--mantine-color-dark-9) !important",
                              color: "var(--mantine-color-dark-5) !important",
                              cursor: "not-allowed",
                            },
                          },
                        }}
                      >
                        デストロイβ合成
                      </Button>
                      <Button
                        onClick={() => openSynthesisModal("destroy_artifact_gamma")}
                        disabled={!(
                            (castleArtifactCount >= 2) ||
                            (attackArtifactCount >= 2) ||
                            (castleArtifactCount >= 1 && attackArtifactCount >= 1) ||
                            (
                                ((castleArtifactCount || 0) + (attackArtifactCount || 0)) >= 1 &&
                                ((destroyArtifactAlphaCount || 0) + (destroyArtifactBetaCount || 0) + (destroyArtifactGammaCount || 0)) >= 1
                            )
                        )}
                        size="sm"
                        variant="gradient"
                        gradient={{ from: "orange.8", to: "orange.6" }}
                        leftSection={<IconBoxMultiple size={16} />}
                        styles={{
                          root: {
                            "&[data-disabled]": {
                              backgroundColor: "var(--mantine-color-dark-9) !important",
                              color: "var(--mantine-color-dark-5) !important",
                              cursor: "not-allowed",
                            },
                          },
                        }}
                      >
                        デストロイγ合成
                      </Button>
                    </Group>
                    <Button
                      onClick={() => openSynthesisModal("exceed_artifact_omega")}
                      disabled={!((destroyArtifactAlphaCount || 0) >= 1 && (destroyArtifactBetaCount || 0) >= 1 && (destroyArtifactGammaCount || 0) >= 1)}
                      size="sm"
                      variant="gradient"
                      gradient={{ from: "grape.8", to: "grape.6" }}
                      leftSection={<IconBoxMultiple size={16} />}
                      styles={{
                        root: {
                          "&[data-disabled]": {
                            backgroundColor: "var(--mantine-color-dark-9) !important",
                            color: "var(--mantine-color-dark-5) !important",
                            cursor: "not-allowed",
                          },
                        },
                      }}
                    >
                      イクシードΩ合成
                    </Button>

                  </Stack>
                ) : (
                  <Text c="blue.4">このクラスには特定のトークン管理機能はありません。</Text>
                )}
                <Textarea
                  placeholder="生成されたトークンや特殊効果について記録..."
                  value={tokenNotes}
                  onChange={(e) => setTokenNotes(e.currentTarget.value)}
                  minRows={4}
                  maxRows={10}
                  autosize
                  styles={{
                    input: {
                      backgroundColor: "var(--mantine-color-dark-7)",
                      color: "var(--mantine-color-blue-2)",
                      border: "1px solid var(--mantine-color-dark-4)",
                    },
                  }}
                />
              </Stack>
              </ScrollArea>
            </Tabs.Panel>
            </Box>
          </Tabs>
        </Card>
      </Group>

      {/* Leader Selection Modal */}
      <Modal
        opened={isLeaderModalOpened}
        onClose={() => setIsLeaderModalOpened(false)}
        title={<Title order={3} c="blue.3">リーダーを選択</Title>}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: { backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-blue-9)" },
          header: { backgroundColor: "var(--mantine-color-dark-8)", borderBottom: '1px solid var(--mantine-color-dark-6)' },
          title: { color: "var(--mantine-color-blue-3)" },
          close: { color: "var(--mantine-color-blue-3)" },
        }}
      >
        <Grid gutter="md">
          {LEADERS.map((leaderOption) => (
            <Grid.Col span={6} key={leaderOption.value}>
              <Card
                shadow="sm"
                withBorder
                p="md"
                onClick={() => {
                  const newLeader = leaderOption.value;
                  setLeader(newLeader);
                  resetGameStates(); // Reset all other game states
                  setIsLeaderModalOpened(false); // Close modal on selection
                }}
                style={{
                  cursor: 'pointer',
                  backgroundColor: leaderOption.value === leader ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-7)',
                  borderColor: leaderOption.value === leader ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-5)',
                  textAlign: 'center',
                  transition: 'background-color 0.2s, border-color 0.2s',
                  '&:hover': {
                    backgroundColor: leaderOption.value === leader ? 'var(--mantine-color-blue-8)' : 'var(--mantine-color-dark-6)',
                  },
                }}
              >
                <Text size="lg" fw={700} c={leaderOption.value === leader ? 'white' : 'blue.2'}>
                  {leaderOption.label}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Modal>

      {/* Synthesis Material Selection Modal */}
      <Modal
        opened={isSynthesisModalOpened}
        onClose={() => {
            setIsSynthesisModalOpened(false);
            setSelectedMaterials({}); // Reset selected materials on close
            setSynthesisError(""); // Clear errors on close
        }}
        title={<Title order={3} c="blue.3">素材を選択して合成</Title>}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: { backgroundColor: "var(--mantine-color-dark-8)", borderColor: "var(--mantine-color-blue-9)" },
          header: { backgroundColor: "var(--mantine-color-dark-8)", borderBottom: '1px solid var(--mantine-color-dark-6)' },
          title: { color: "var(--mantine-color-blue-3)" },
          close: { color: "var(--mantine-color-blue-3)" },
        }}
      >
        <Stack gap="md">
          <Text c="blue.4">
            合成対象: {NEMESIS_ARTIFACT_TOKENS.find(t => t.id === synthesisTarget)?.name}
          </Text>
          {synthesisError && (
            <Text c="red.5" size="sm" mt="xs">
              エラー: {synthesisError}
            </Text>
          )}

          {/* Conditional rendering for different synthesis types */}
          {synthesisTarget === "castle_artifact" && (
            <Stack>
              <Text c="blue.4">合成素材:</Text>
              <Radio.Group
                value={
                  (selectedMaterials["past_core"] === 2 && Object.keys(selectedMaterials).length === 1) ? "past_core_x2" :
                  (selectedMaterials["past_core"] === 1 && selectedMaterials["future_core"] === 1 && Object.keys(selectedMaterials).length === 2) ? "past_future_x1" : ""
                }
                onChange={(value) => {
                  if (value === "past_core_x2") {
                    setSelectedMaterials({ "past_core": 2 });
                  } else if (value === "past_future_x1") {
                    setSelectedMaterials({ "past_core": 1, "future_core": 1 });
                  }
                }}
              >
                <Stack>
                  <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                    <Radio
                      value="past_core_x2"
                      label={`パスト・コア 2枚 (${pastCoreCount}枚所持)`}
                      disabled={pastCoreCount < 2}
                      styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                    />
                  </Card>
                  <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                    <Radio
                      value="past_future_x1"
                      label={`パスト・コア 1枚とフューチャー・コア 1枚 (${pastCoreCount}枚/ ${futureCoreCount}枚所持)`}
                      disabled={!(pastCoreCount >= 1 && futureCoreCount >= 1)}
                      styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                    />
                  </Card>
                </Stack>
              </Radio.Group>
            </Stack>
          )}

          {synthesisTarget === "attack_artifact" && (
            <Stack>
              <Text c="blue.4">合成素材:</Text>
              <Radio.Group
                value={
                  (selectedMaterials["future_core"] === 2 && Object.keys(selectedMaterials).length === 1) ? "future_core_x2" :
                  (selectedMaterials["past_core"] === 1 && selectedMaterials["future_core"] === 1 && Object.keys(selectedMaterials).length === 2) ? "past_future_x1" : ""
                }
                onChange={(value) => {
                  if (value === "future_core_x2") {
                    setSelectedMaterials({ "future_core": 2 });
                  } else if (value === "past_future_x1") {
                    setSelectedMaterials({ "past_core": 1, "future_core": 1 });
                  }
                }}
              >
                <Stack>
                  <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                    <Radio
                      value="future_core_x2"
                      label={`フューチャー・コア 2枚 (${futureCoreCount}枚所持)`}
                      disabled={futureCoreCount < 2}
                      styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                    />
                  </Card>
                  <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                    <Radio
                      value="past_future_x1"
                      label={`パスト・コア 1枚とフューチャー・コア 1枚 (${pastCoreCount}枚/ ${futureCoreCount}枚所持)`}
                      disabled={!(pastCoreCount >= 1 && futureCoreCount >= 1)}
                      styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                    />
                  </Card>
                </Stack>
              </Radio.Group>
            </Stack>
          )}

          {synthesisTarget === "destroy_artifact_alpha" && (
            <Stack>
              <Text c="blue.4">3コストのアーティファクト (1枚):</Text>
              <Radio.Group
                value={Object.keys(selectedMaterials).find(id => ["castle_artifact", "attack_artifact"].includes(id)) || ""}
                onChange={(value) => {
                  setSelectedMaterials(prev => {
                    const newMaterials: Record<string, number> = {};
                    if (value) newMaterials[value] = 1;
                    // Preserve 1-cost selection if exists
                    const current1Cost = Object.keys(prev).find(id => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(id));
                    if (current1Cost) newMaterials[current1Cost] = prev[current1Cost];
                    return newMaterials;
                  });
                }}
              >
                <Group>
                  {availableMaterials.filter(m => ["castle_artifact", "attack_artifact"].includes(m.id)).map(material => (
                    <Card key={material.id} withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                      <Radio
                        value={material.id}
                        label={`${material.name} (${material.currentCount}枚)`}
                        disabled={material.currentCount === 0}
                        styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                      />
                    </Card>
                  ))}
                </Group>
              </Radio.Group>

              <Text c="blue.4" mt="md">1コストのアーティファクト (1枚):</Text>
              <Radio.Group
                value={Object.keys(selectedMaterials).find(id => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(id)) || ""}
                onChange={(value) => {
                  setSelectedMaterials(prev => {
                    const newMaterials: Record<string, number> = {};
                    if (value) newMaterials[value] = 1;
                    // Preserve 3-cost selection if exists
                    const current3Cost = Object.keys(prev).find(id => ["castle_artifact", "attack_artifact"].includes(id));
                    if (current3Cost) newMaterials[current3Cost] = prev[current3Cost];
                    return newMaterials;
                  });
                }}
              >
                <Grid>
                  {availableMaterials.filter(m => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(m.id)).map(material => (
                    <Grid.Col span={6} key={material.id}>
                      <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                        <Radio
                          value={material.id}
                          label={`${material.name} (${material.currentCount}枚)`}
                          disabled={material.currentCount === 0}
                          styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                        />
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Radio.Group>
            </Stack>
          )}

          {synthesisTarget === "destroy_artifact_beta" && (
            <Stack>
              <Text c="blue.4">3コストのアーティファクト (1枚):</Text>
              <Radio.Group
                value={Object.keys(selectedMaterials).find(id => ["castle_artifact", "attack_artifact"].includes(id)) || ""}
                onChange={(value) => {
                  setSelectedMaterials(prev => {
                    const newMaterials: Record<string, number> = {};
                    if (value) newMaterials[value] = 1;
                    // Preserve 1-cost selections
                    const current1Costs = Object.keys(prev).filter(id => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(id));
                    current1Costs.forEach(id => newMaterials[id] = prev[id]);
                    return newMaterials;
                  });
                }}
              >
                <Group>
                  {availableMaterials.filter(m => ["castle_artifact", "attack_artifact"].includes(m.id)).map(material => (
                    <Card key={material.id} withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                      <Radio
                        value={material.id}
                        label={`${material.name} (${material.currentCount}枚)`}
                        disabled={material.currentCount === 0}
                        styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                      />
                    </Card>
                  ))}
                </Group>
              </Radio.Group>

              <Text c="blue.4" mt="md">1コストのアーティファクト (2枚):</Text>
              <Radio.Group
                value={JSON.stringify(Object.keys(selectedMaterials).filter(id => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(id)).sort()) || ""}
                onChange={(value) => {
                  const selectedCombo = JSON.parse(value);
                  setSelectedMaterials(prev => {
                    const newMaterials: Record<string, number> = {};
                    // Preserve 3-cost selection
                    const current3Cost = Object.keys(prev).find(id => ["castle_artifact", "attack_artifact"].includes(id));
                    if (current3Cost) newMaterials[current3Cost] = prev[current3Cost];

                    // Set 1-cost selections
                    selectedCombo.forEach((id: string) => {
                      newMaterials[id] = (newMaterials[id] || 0) + 1;
                    });
                    return newMaterials;
                  });
                }}
              >
                <Grid>
                  {generateDestroyBetaCombinations().map(combo => (
                    <Grid.Col span={6} key={combo.id}>
                      <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                        <Radio
                          value={JSON.stringify(combo.materials)}
                          label={combo.name}
                          styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                        />
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Radio.Group>
            </Stack>
          )}

          {synthesisTarget === "destroy_artifact_gamma" && (
            <Stack>
              <Text c="blue.4">3コストのアーティファクト (1枚):</Text>
              <Radio.Group
                value={Object.keys(selectedMaterials).find(id => ["castle_artifact", "attack_artifact"].includes(id)) || ""}
                onChange={(value) => {
                  setSelectedMaterials(prev => {
                    const newMaterials: Record<string, number> = {};
                    if (value) newMaterials[value] = 1;
                    // Clear previous other material selection if it's the same as the new base
                    const prevOtherMaterialId = Object.keys(prev).find(id => !["castle_artifact", "attack_artifact"].includes(id) && (NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id)?.cost === 3 || NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id)?.cost === 5));
                    if (prevOtherMaterialId && prevOtherMaterialId !== value) { // Only preserve if not the new base
                      newMaterials[prevOtherMaterialId] = prev[prevOtherMaterialId];
                    }
                    return newMaterials;
                  });
                }}
              >
                <Group>
                  {availableMaterials.filter(m => ["castle_artifact", "attack_artifact"].includes(m.id)).map(material => (
                    <Card key={material.id} withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                      <Radio
                        value={material.id}
                        label={`${material.name} (${material.currentCount}枚)`}
                        disabled={material.currentCount === 0}
                        styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                      />
                    </Card>
                  ))}
                </Group>
              </Radio.Group>

              <Text c="blue.4" mt="md">3コストまたは5コストのアーティファクト (1枚):</Text>
              <Radio.Group
                value={Object.keys(selectedMaterials).find(id =>
                  (["castle_artifact", "attack_artifact", "destroy_artifact_alpha", "destroy_artifact_beta", "destroy_artifact_gamma"].includes(id)) &&
                  (id !== Object.keys(selectedMaterials).find(mid => ["castle_artifact", "attack_artifact"].includes(mid) && selectedMaterials[mid] === 1))
                ) || ""}
                onChange={(value) => {
                  setSelectedMaterials(prev => {
                    const newMaterials: Record<string, number> = {};
                    // Preserve first 3-cost selection
                    const first3Cost = Object.keys(prev).find(id => ["castle_artifact", "attack_artifact"].includes(id));
                    if (first3Cost) newMaterials[first3Cost] = prev[first3Cost];
                    if (value) newMaterials[value] = 1;
                    return newMaterials;
                  });
                }}
              >
                <Grid>
                  {availableMaterials.filter(m =>
                    (["castle_artifact", "attack_artifact", "destroy_artifact_alpha", "destroy_artifact_beta", "destroy_artifact_gamma"].includes(m.id)) &&
                    // Exclude the currently selected 3-cost base material if it's already selected
                    !(Object.keys(selectedMaterials).find(id => ["castle_artifact", "attack_artifact"].includes(id)) === m.id && selectedMaterials[m.id] === 1)
                  ).map(material => {
                    const isDisabled = material.currentCount === 0;
                    return (
                      <Grid.Col span={6} key={material.id}>
                        <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                          <Radio
                            value={material.id}
                            label={`${material.name} (${material.currentCount}枚)`}
                            disabled={isDisabled}
                            styles={{ label: { color: "var(--mantine-color-blue-1)" }, radio: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                          />
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Radio.Group>
            </Stack>
          )}

          {synthesisTarget === "exceed_artifact_omega" && (
            <Stack>
              <Text c="blue.4" mb="md">デストロイアーティファクトα、β、γをそれぞれ1枚ずつ消費します。</Text>
              <Grid>
                {availableMaterials.filter(m => ["destroy_artifact_alpha", "destroy_artifact_beta", "destroy_artifact_gamma"].includes(m.id)).map(material => (
                  <Grid.Col span={6} key={material.id}>
                    <Card withBorder p="xs" style={{ backgroundColor: "var(--mantine-color-dark-7)", flex: 1 }}>
                      <Checkbox
                        checked={(selectedMaterials[material.id] || 0) > 0}
                        onChange={(e) => handleMaterialSelection(material.id, e.currentTarget.checked)}
                        label={`${material.name} (${material.currentCount}枚)`}
                        disabled={material.currentCount === 0}
                        styles={{ label: { color: "var(--mantine-color-blue-1)" }, input: { '&[data-checked]': { backgroundColor: 'var(--mantine-color-blue-6)' }, '&[data-disabled]': { borderColor: 'var(--mantine-color-dark-5)', backgroundColor: 'var(--mantine-color-dark-7)' } } }}
                      />
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          )}

          <Button
            onClick={() => executeSynthesis(selectedMaterials, synthesisTarget!)} // synthesisTargetがnullでないことを保証
            disabled={
              // General check: no materials selected
              Object.keys(selectedMaterials).length === 0 ||
              // Castle Artifact specific checks
              (synthesisTarget === "castle_artifact" &&
                !(
                  (selectedMaterials["past_core"] === 2 && Object.keys(selectedMaterials).length === 1) ||
                  (selectedMaterials["past_core"] === 1 && selectedMaterials["future_core"] === 1 && Object.keys(selectedMaterials).length === 2)
                )
              ) ||
              // Attack Artifact specific checks
              (synthesisTarget === "attack_artifact" &&
                !(
                  (selectedMaterials["future_core"] === 2 && Object.keys(selectedMaterials).length === 1) ||
                  (selectedMaterials["past_core"] === 1 && selectedMaterials["future_core"] === 1 && Object.keys(selectedMaterials).length === 2)
                )
              ) ||
              // Destroy Alpha specific checks
              (synthesisTarget === "destroy_artifact_alpha" &&
                !(
                  Object.keys(selectedMaterials).some(id => ["castle_artifact", "attack_artifact"].includes(id)) &&
                  Object.keys(selectedMaterials).some(id => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(id)) &&
                  Object.keys(selectedMaterials).length === 2
                )
              ) ||
              // Destroy Beta specific checks (requires 1 3-cost and 2 1-cost)
              (synthesisTarget === "destroy_artifact_beta" &&
                !(
                  Object.keys(selectedMaterials).some(id => ["castle_artifact", "attack_artifact"].includes(id)) &&
                  (Object.keys(selectedMaterials).filter(id => ["puppet", "enhanced_puppet", "past_core", "future_core"].includes(id)).reduce((sum, id) => sum + (selectedMaterials[id] || 0), 0) === 2) &&
                  Object.keys(selectedMaterials).length >= 2 // Can be 2 keys if two of same 1-cost, or 3 if two different 1-cost
                )
              ) ||
              // Destroy Gamma specific checks (requires 1 3-cost base and 1 other 3-cost or 5-cost)
              (synthesisTarget === "destroy_artifact_gamma" &&
                !(
                  Object.keys(selectedMaterials).some(id => ["castle_artifact", "attack_artifact"].includes(id)) &&
                  Object.keys(selectedMaterials).some(id => id !== Object.keys(selectedMaterials).find(mid => ["castle_artifact", "attack_artifact"].includes(mid)) && (NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id)?.cost === 3 || NEMESIS_ARTIFACT_TOKENS.find(t => t.id === id)?.cost === 5)) &&
                  Object.keys(selectedMaterials).length === 2
                )
              ) ||
              // Exceed Omega specific checks
              (synthesisTarget === "exceed_artifact_omega" &&
                !(
                  (selectedMaterials["destroy_artifact_alpha"] || 0) === 1 &&
                  (selectedMaterials["destroy_artifact_beta"] || 0) === 1 &&
                  (selectedMaterials["destroy_artifact_gamma"] || 0) === 1 &&
                  Object.keys(selectedMaterials).length === 3
                )
              )
            }
            size="md"
            variant="gradient"
            gradient={{ from: "blue.8", to: "blue.6" }}
            styles={{
              root: {
                "&[data-disabled]": {
                  backgroundColor: "var(--mantine-color-dark-9) !important", // Darker background
                  color: "var(--mantine-color-dark-5) !important", // Darker text
                  cursor: "not-allowed",
                },
              },
            }}
          >
            合成実行
          </Button>
        </Stack>
      </Modal>
    </div>
  )
}
