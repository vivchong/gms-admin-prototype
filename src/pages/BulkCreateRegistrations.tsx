import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { X, Download, Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useStore } from '@/lib/store'
import { generateTemplate } from '@/lib/bulkRegistrationTemplate'
import { parseUpload } from '@/lib/bulkRegistrationParser'
import type { ParseResult } from '@/lib/bulkRegistrationParser'
import type { Sport } from '@/lib/types'

export function BulkCreateRegistrations() {
  const navigate = useNavigate()
  const workspace = useStore((s) => s.workspace)
  const addRegistrations = useStore((s) => s.addRegistrations)
  const addTeams = useStore((s) => s.addTeams)

  const [selectedSports, setSelectedSports] = useState<Sport[]>([])
  const [sportPickerOpen, setSportPickerOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableSports = workspace.sports.filter((s) => s.events.length > 0)

  function toggleSport(sport: Sport) {
    setSelectedSports((prev) =>
      prev.find((s) => s.id === sport.id)
        ? prev.filter((s) => s.id !== sport.id)
        : [...prev, sport]
    )
    setUploadedFile(null)
    setParseResult(null)
  }

  function removeSport(sportId: string) {
    setSelectedSports((prev) => prev.filter((s) => s.id !== sportId))
    setUploadedFile(null)
    setParseResult(null)
  }

  function handleDownloadTemplate() {
    if (selectedSports.length === 0) return
    generateTemplate(selectedSports, workspace)
    toast('Template downloaded')
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    setIsProcessing(true)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const result = parseUpload(workbook, selectedSports, workspace)
      setParseResult(result)
    } catch {
      setParseResult({ registrations: [], teams: [], errors: [{ sheet: '—', row: 0, message: 'Failed to parse file. Please ensure it is a valid Excel file.' }], totalRows: 0 })
    } finally {
      setIsProcessing(false)
    }
  }

  function handleRemoveFile() {
    setUploadedFile(null)
    setParseResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleCreateRegistrations() {
    if (!parseResult || parseResult.registrations.length === 0) return

    addRegistrations(parseResult.registrations)
    if (parseResult.teams.length > 0) {
      addTeams(parseResult.teams)
    }

    toast(`${parseResult.registrations.length} registrations created`)
    navigate('/registrations')
  }

  const validCount = parseResult ? parseResult.registrations.length : 0
  const errorCount = parseResult ? parseResult.errors.length : 0

  return (
    <div>
      <PageHeader
        title="Create multiple registrations"
        subtitle="Bulk register participants by uploading an Excel file"
        breadcrumbs={[
          { label: 'Registrations', path: '/registrations' },
          { label: 'Bulk create' },
        ]}
      />

      <div className="max-w-2xl space-y-6">
        {/* Instructions */}
        <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-3">
          <p className="text-sm font-medium text-neutral-900 mb-1">How it works</p>
          <ul className="text-sm text-neutral-700 space-y-1 list-disc list-inside">
            <li>Select the sports you are registering participants for</li>
            <li>Download the template to see the required columns and format</li>
            <li>Fill in participant data — one row per participant</li>
            <li>For team events, use the same <strong>Team Name</strong> to group participants into a team</li>
            <li>Upload the completed file to create all registrations at once</li>
          </ul>
        </div>

        {/* Section 1: Select sports */}
        <Card className="py-0 gap-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">1. Select sports</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-neutral-600">
                Choose which sports you want to create registrations for. The template will include one sheet per sport.
              </p>

              <Popover open={sportPickerOpen} onOpenChange={setSportPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {selectedSports.length === 0
                      ? 'Select sports...'
                      : `${selectedSports.length} sport${selectedSports.length > 1 ? 's' : ''} selected`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search sports..." />
                    <CommandList>
                      <CommandEmpty>No sports with events found.</CommandEmpty>
                      <CommandGroup>
                        {availableSports.map((sport) => {
                          const isSelected = selectedSports.some((s) => s.id === sport.id)
                          return (
                            <CommandItem
                              key={sport.id}
                              onSelect={() => toggleSport(sport)}
                              className="flex items-center justify-between"
                            >
                              <span>{sport.name}</span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedSports.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSports.map((sport) => (
                    <Badge key={sport.id} variant="secondary" className="gap-1 pr-1">
                      {sport.name}
                      <button
                        type="button"
                        onClick={() => removeSport(sport.id)}
                        className="ml-1 p-0.5 rounded hover:bg-neutral-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Download template */}
        <Card className="py-0 gap-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">2. Download template</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-neutral-600">
                Download the Excel template with the correct columns for your selected sports. Fill in participant details following the format shown in the example row.
              </p>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={selectedSports.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download template
              </Button>
              {selectedSports.length === 0 && (
                <p className="text-xs text-neutral-500">Select at least one sport to download the template.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Upload file */}
        <Card className="py-0 gap-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">3. Upload file</h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!uploadedFile ? (
                <div className="border border-dashed border-neutral-400 rounded-xl p-6">
                  <p className="text-sm text-neutral-700 mb-4">
                    Upload your completed Excel file with participant data.
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-3 mb-6">
                    <p className="text-sm text-neutral-700">Supported file types: .xlsx, .xls</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={selectedSports.length === 0}
                    >
                      <Upload className="h-4 w-4" />
                      Upload file
                    </Button>
                    <p className="text-sm text-neutral-500">or drop it here</p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-900">{uploadedFile.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 text-blue-700 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Validation results */}
        {isProcessing && (
          <Card className="py-0 gap-0">
            <CardContent className="p-0">
              <div className="px-6 py-6">
                <p className="text-sm text-neutral-600">Processing file...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {parseResult && !isProcessing && (
          <Card className="py-0 gap-0">
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-base font-semibold text-neutral-900">4. Review results</h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-neutral-200 p-3 text-center">
                    <p className="text-2xl font-semibold text-neutral-900">{parseResult.totalRows}</p>
                    <p className="text-xs text-neutral-500">Total rows</p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                    <p className="text-2xl font-semibold text-green-700">{validCount}</p>
                    <p className="text-xs text-green-600">Valid</p>
                  </div>
                  <div className={`rounded-lg border p-3 text-center ${errorCount > 0 ? 'border-red-200 bg-red-50' : 'border-neutral-200'}`}>
                    <p className={`text-2xl font-semibold ${errorCount > 0 ? 'text-red-700' : 'text-neutral-900'}`}>{errorCount}</p>
                    <p className={`text-xs ${errorCount > 0 ? 'text-red-600' : 'text-neutral-500'}`}>Errors</p>
                  </div>
                </div>

                {parseResult.teams.length > 0 && (
                  <p className="text-sm text-neutral-600">
                    {parseResult.teams.length} team{parseResult.teams.length > 1 ? 's' : ''} will be created.
                  </p>
                )}

                {errorCount > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-700 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      Errors found
                    </p>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
                      {parseResult.errors.slice(0, 20).map((err, i) => (
                        <p key={i} className="text-xs text-red-700">
                          <span className="font-medium">{err.sheet} Row {err.row}:</span> {err.message}
                        </p>
                      ))}
                      {parseResult.errors.length > 20 && (
                        <p className="text-xs text-red-500 pt-1">
                          ...and {parseResult.errors.length - 20} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {validCount > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700">
                      {validCount} registration{validCount > 1 ? 's' : ''} ready to create
                      {errorCount > 0 ? ' (rows with errors will be skipped)' : ''}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/registrations')}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRegistrations}
            disabled={!parseResult || validCount === 0}
          >
            Create {validCount > 0 ? `${validCount} ` : ''}registration{validCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
