import { useMetadataPolling } from '@/hooks/useMetadataPolling'
import type { MetadataSectionConfig } from '@/types/metadataConfig'
import { ChartMetadataSection } from './ChartMetadataSection'
import { GridMetadataSection } from './GridMetadataSection'
import { TextMetadataSection } from './TextMetadataSection'

interface MetadataSectionRendererProps {
  section: MetadataSectionConfig
  sourceId: string
  active: boolean
  onSelectEvent?: (eventId: number) => void
}

export function MetadataSectionRenderer({ section, sourceId, active, onSelectEvent }: MetadataSectionRendererProps) {
  const polling = useMetadataPolling(section, sourceId, active)
  const commonProps = { section, polling }

  if (section.type === 'text') return <TextMetadataSection {...commonProps} />
  if (section.type === 'grid') return <GridMetadataSection {...commonProps} onSelectEvent={onSelectEvent} />
  return <ChartMetadataSection {...commonProps} />
}
