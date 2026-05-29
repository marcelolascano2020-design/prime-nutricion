import CalorieRing from './CalorieRing'
import { MiniStat, Tile, MicroLabel } from './ui'
import { fmtNum } from '../theme'

export default function HeroCard({ palette, consumed, burned, goal }) {
  const net = consumed - burned

  return (
    <Tile palette={palette} style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <MicroLabel>Energía · Hoy</MicroLabel>
        <MicroLabel style={{ color: palette.accent, opacity: 1 }}>● en curso</MicroLabel>
      </div>

      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '8px 0',
      }}>
        <CalorieRing net={net} goal={goal} palette={palette} size={220} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
        paddingTop: 20,
        borderTop: `1px solid ${palette.ink}`,
        opacity: 1,
      }}>
        <MiniStat label="Consumidas" value={fmtNum(consumed)} unit="kcal" />
        <MiniStat label="Quemadas" value={'−' + fmtNum(burned)} unit="kcal" color={palette.accent} />
        <MiniStat label="Objetivo" value={fmtNum(goal)} unit="kcal" />
      </div>
    </Tile>
  )
}
