import { useState } from 'react'
import { Plus, Minus, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveRecipe, uploadRecipeImage } from './recipeService'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Ingredient } from '@/types/recipe'

interface AddRecipeModalProps {
  open: boolean
  onClose: () => void
  userId: string
}

export function AddRecipeModal({ open, onClose, userId }: AddRecipeModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '', unit: '' }])
  const [instructions, setInstructions] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const addIngredient = () => setIngredients((prev) => [...prev, { name: '', amount: '', unit: '' }])
  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i))
  const updateIngredient = (i: number, field: keyof Ingredient, value: string) =>
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleClose = () => {
    setTitle('')
    setIngredients([{ name: '', amount: '', unit: '' }])
    setInstructions('')
    setImageFile(null)
    setImagePreview(null)
    onClose()
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Recipe name is required')
      return
    }
    setIsSaving(true)
    try {
      let image: string | null = null
      if (imageFile) {
        image = await uploadRecipeImage(imageFile, userId)
      }
      const validIngredients = ingredients.filter((i) => i.name.trim())
      await saveRecipe(
        {
          title: title.trim(),
          image,
          ingredients: validIngredients,
          instructions: instructions.trim() || null,
          source: 'custom',
          createdBy: userId,
        },
        userId
      )
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] })
      toast.success('Recipe saved!')
      handleClose()
    } catch {
      toast.error('Failed to save recipe')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Recipe name *</Label>
            <Input placeholder="e.g. Chicken Pasta" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Image upload */}
          <div className="space-y-1">
            <Label>Photo</Label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
              )}
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground">
                <Upload size={14} />
                Upload image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-1">
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Amt"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                    className="w-16"
                  />
                  <Input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                    className="w-16"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length === 1}
                  >
                    <Minus size={13} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus size={13} className="mr-1.5" /> Add ingredient
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <Label>Instructions</Label>
            <Textarea
              placeholder="Step-by-step cooking instructions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save recipe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
