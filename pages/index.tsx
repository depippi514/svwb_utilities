// pages/index.tsx
import { Button, createTheme, Container, Card, Grid, Title, Text } from '@mantine/core';



export default function Home() {
  return (
    <div 
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0d1117 100%)",
        color: "var(--mantine-color-blue-1)",
      }}>

        <Container size="lg" className="w-full"> {/* max-width: 1200px, width: 100% */}
          <Title order={1} c="blue.3" ta="center" mb="2rem"> {/* text-4xl, font-bold, mb-8, text-align: center */}
            Shadowverse WB 便利ツール集
          </Title>

          <Grid gutter="xl"> {/* gap-8 */}
            {/* Tool Card 1: 盤面整理ツール */}
            <Grid.Col span={{ base: 12, md: 12, lg: 6 }}> {/* grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
              <Card
                shadow="xl"
                padding="lg"
                radius="md" // rounded-xl
                withBorder
                style={{
                  backgroundColor: 'var(--mantine-color-dark-7)', // dark-8 equivalent
                  borderColor: 'var(--mantine-color-blue-9)', // blue-9 equivalent
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem', // gap-4
                  height: '100%', // Ensure cards in a row have equal height
                }}
              >
                <Title order={2} c="blue.2" style={{ fontSize: '1.5rem', fontWeight: 600 }}> {/* text-2xl, font-semibold */}
                  除去確認+トークン整理ツール
                </Title>
                <Text c="blue.4" style={{ flexGrow: 1 }}> {/* text-base, flex-grow for description to push button to bottom */}
                  ゲーム中のPP、EP、SEP、手札、墓地などの状況を詳細に管理し、相手の除去カードの候補を表示するツールです。ネメシスやエルフの公開情報になったトークンを記録する機能もあります。
                </Text>
                <Button
                  component="a" // aタグとしてレンダリング
                  href="rc_tm"
                  size="md" // py-3 px-6
                  variant="gradient"
                  gradient={{ from: 'blue.8', to: 'blue.6' }} // blue-8 to blue-6 equivalent
                  style={{
                    fontWeight: 600, // font-semibold
                    textAlign: 'center',
                    textDecoration: 'none',
                    marginTop: 'auto', // Push button to bottom
                  }}
                >
                  ツールを開く
                </Button>
              </Card>
            </Grid.Col>

            {/* Tool Card 2: (仮) デッキ構築シミュレーター */}
            <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
              <Card
                shadow="xl"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  backgroundColor: 'var(--mantine-color-dark-7)',
                  borderColor: 'var(--mantine-color-blue-9)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  height: '100%',
                }}
              >
                <Title order={2} c="blue.2" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  (作成予定) リノセウス打点計算シミュレーター
                </Title>
                <Text c="blue.4" style={{ flexGrow: 1 }}>
                  カードの枚数を入力すると出せる打点を自動計算して.....くれるものがつくれたら
                </Text>
                <Button
                  component="a"
                  href="deck-builder-simulator.html"
                  size="md"
                  variant="gradient"
                  disabled
                  gradient={{ from: 'blue.8', to: 'blue.6' }}
                  style={{
                    fontWeight: 600,
                    textAlign: 'center',
                    textDecoration: 'none',
                    marginTop: 'auto',
                  }}
                >
                  ツールを開く
                </Button>
              </Card>
            </Grid.Col>

            {/* 必要に応じてさらにツールカードを追加 */}
          </Grid>
        </Container>
    </div>
  );
}