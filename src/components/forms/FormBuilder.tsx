import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FormQuestion } from '@/lib/types'

type DefaultField = {
  label: string
  type: string
}

type Props = {
  section: 'athlete' | 'team'
  title: string
  helperText?: string
  questions: FormQuestion[]
  onChange: (questions: FormQuestion[]) => void
  defaultFields?: DefaultField[]
}

const typeLabels: Record<FormQuestion['type'], string> = {
  short_text: 'Short answer',
  long_text: 'Long answer',
  single_select: 'Dropdown',
  file_upload: 'File upload',
}

type EditorState = {
  type: FormQuestion['type']
  label: string
  description: string
  required: boolean
  options: string[]
}

const emptyEditor: EditorState = {
  type: 'short_text',
  label: '',
  description: '',
  required: false,
  options: [''],
}

export function FormBuilder({ section, title, helperText, questions, onChange, defaultFields }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(emptyEditor)
  const [editorErrors, setEditorErrors] = useState<Record<string, string>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  function openAdd() {
    setEditingId('__new__')
    setEditor(emptyEditor)
    setEditorErrors({})
  }

  function openEdit(q: FormQuestion) {
    setEditingId(q.id)
    setEditor({
      type: q.type,
      label: q.label,
      description: q.description || '',
      required: q.required,
      options: q.options?.length ? q.options : [''],
    })
    setEditorErrors({})
  }

  function cancelEditor() {
    setEditingId(null)
    setEditor(emptyEditor)
    setEditorErrors({})
  }

  function saveEditor() {
    const errs: Record<string, string> = {}
    if (!editor.label.trim()) errs.label = 'Field label is required'
    if (editor.type === 'single_select') {
      const validOptions = editor.options.filter((o) => o.trim())
      if (validOptions.length < 2) errs.options = 'At least 2 options are required'
    }
    setEditorErrors(errs)
    if (Object.keys(errs).length > 0) return

    const question: FormQuestion = {
      id: editingId === '__new__' ? `q-${Date.now()}` : editingId!,
      appliesTo: section,
      type: editor.type,
      label: editor.label.trim(),
      description: editor.description.trim() || undefined,
      required: editor.required,
      options: editor.type === 'single_select' ? editor.options.filter((o) => o.trim()) : undefined,
    }

    if (editingId === '__new__') {
      onChange([...questions, question])
    } else {
      onChange(questions.map((q) => (q.id === editingId ? question : q)))
    }
    cancelEditor()
  }

  function deleteQuestion(id: string) {
    onChange(questions.filter((q) => q.id !== id))
    setDeleteConfirmId(null)
  }

  function moveUp(index: number) {
    if (index === 0) return
    const updated = [...questions]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  function moveDown(index: number) {
    if (index === questions.length - 1) return
    const updated = [...questions]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  function addOption() {
    setEditor((prev) => ({ ...prev, options: [...prev.options, ''] }))
  }

  function removeOption(index: number) {
    setEditor((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }))
  }

  function updateOption(index: number, value: string) {
    setEditor((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? value : o)),
    }))
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-neutral-900 pb-4 border-b border-neutral-200 mb-4">{title}</h3>
        {helperText && <p className="text-xs text-neutral-500 mb-4">{helperText}</p>}

        {/* Default fields */}
        {defaultFields && defaultFields.length > 0 && (
          <TooltipProvider delayDuration={200}>
            <div className="mb-2">
              {defaultFields.map((field, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 cursor-default">
                      <div className="flex flex-col gap-0.5">
                        <span className="p-0.5"><ChevronUp className="h-3.5 w-3.5 text-neutral-300" /></span>
                        <span className="p-0.5"><ChevronDown className="h-3.5 w-3.5 text-neutral-300" /></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-400">{field.label}</p>
                        <p className="text-xs text-neutral-300">{field.type}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Default question for all sports</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}

        {questions.length === 0 && editingId === null && (
          <p className="text-sm text-neutral-500 mb-4">No custom questions added yet.</p>
        )}

        {/* Question list */}
        {questions.map((q, i) => (
          <div key={q.id} className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="p-0.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-3.5 w-3.5 text-neutral-500" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(i)}
                disabled={i === questions.length - 1}
                className="p-0.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{q.label}{!q.required ? ' (optional)' : ''}</p>
              <p className="text-xs text-neutral-500">{typeLabels[q.type]}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => openEdit(q)} className="p-1.5 rounded hover:bg-neutral-100">
                <Pencil className="h-3.5 w-3.5 text-neutral-500" />
              </button>
              <button type="button" onClick={() => setDeleteConfirmId(q.id)} className="p-1.5 rounded hover:bg-neutral-100">
                <Trash2 className="h-3.5 w-3.5 text-neutral-500" />
              </button>
            </div>
          </div>
        ))}

        {/* Inline editor */}
        {editingId && (
          <div className="mt-4 border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-4">
            <div className="space-y-2">
              <Label>Field type</Label>
              <Select value={editor.type} onValueChange={(v) => setEditor((prev) => ({ ...prev, type: v as FormQuestion['type'] }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_text">Short answer</SelectItem>
                  <SelectItem value="long_text">Long answer</SelectItem>
                  <SelectItem value="single_select">Dropdown</SelectItem>
                  <SelectItem value="file_upload">File upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Field label</Label>
              <Input
                value={editor.label}
                onChange={(e) => { setEditor((prev) => ({ ...prev, label: e.target.value })); if (editorErrors.label) setEditorErrors((prev) => ({ ...prev, label: '' })) }}
                placeholder="e.g. Jersey colour – Light"
                className={editorErrors.label ? 'border-red-500' : ''}
              />
              {editorErrors.label && <p className="text-xs text-red-600">{editorErrors.label}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={editor.description}
                onChange={(e) => setEditor((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Helper text below the label"
              />
            </div>

            {editor.type === 'single_select' && (
              <div className="space-y-2">
                <Label>Options</Label>
                {editor.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1"
                    />
                    {editor.options.length > 1 && (
                      <button type="button" onClick={() => removeOption(i)} className="p-1 rounded hover:bg-neutral-100">
                        <Trash2 className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add option
                </Button>
                {editorErrors.options && <p className="text-xs text-red-600">{editorErrors.options}</p>}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editor.required}
                  onCheckedChange={(c) => setEditor((prev) => ({ ...prev, required: c as boolean }))}
                />
                <span className="text-sm text-neutral-700">Required for the registerer</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <Button size="sm" onClick={saveEditor}>
                {editingId === '__new__' ? 'Add question' : 'Save changes'}
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEditor}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Add button */}
        {!editingId && (
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add question
          </Button>
        )}
      </CardContent>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this question?</DialogTitle>
            <DialogDescription>
              This will permanently remove the question from the form. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteQuestion(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
