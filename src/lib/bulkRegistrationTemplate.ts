import * as XLSX from 'xlsx'
import type { Sport, Workspace } from './types'

const FIXED_COLUMNS = [
  'Event Name',
  'Participant Name',
  'NRIC/FIN',
  'Date of Birth (YYYY-MM-DD)',
  'Gender (Male/Female)',
  'Residency (SG Citizen/SG PR/Valid Pass Holder)',
  'Mobile',
  'Email',
  'Team Name',
]

function getCustomQuestionColumns(sport: Sport): string[] {
  const columns: string[] = []
  const seen = new Set<string>()

  for (const q of sport.customQuestions) {
    if (!seen.has(q.label)) {
      columns.push(q.label)
      seen.add(q.label)
    }
  }

  for (const event of sport.events) {
    for (const q of event.customQuestions) {
      if (!seen.has(q.label)) {
        columns.push(q.label)
        seen.add(q.label)
      }
    }
  }

  return columns
}

function getExampleRow(sport: Sport): Record<string, string> {
  const firstEvent = sport.events[0]
  return {
    'Event Name': firstEvent?.name || 'Event Name Here',
    'Participant Name': 'John Tan',
    'NRIC/FIN': 'S1234567A',
    'Date of Birth (YYYY-MM-DD)': '1990-05-15',
    'Gender (Male/Female)': 'Male',
    'Residency (SG Citizen/SG PR/Valid Pass Holder)': 'SG Citizen',
    'Mobile': '91234567',
    'Email': 'john.tan@example.com',
    'Team Name': firstEvent?.isTeamEvent ? 'Team Alpha' : '',
  }
}

export function generateTemplate(sports: Sport[], _workspace: Workspace): void {
  const wb = XLSX.utils.book_new()

  for (const sport of sports) {
    const sheetName = sport.name.slice(0, 31)
    const customCols = getCustomQuestionColumns(sport)
    const allColumns = [...FIXED_COLUMNS, ...customCols]

    const headerRow: Record<string, string> = {}
    for (const col of allColumns) {
      headerRow[col] = col
    }

    const exampleRow = getExampleRow(sport)
    for (const col of customCols) {
      exampleRow[col] = ''
    }

    const ws = XLSX.utils.json_to_sheet([exampleRow], { header: allColumns })

    const colWidths = allColumns.map((col) => ({ wch: Math.max(col.length + 2, 15) }))
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  XLSX.writeFile(wb, 'bulk_registration_template.xlsx')
}
