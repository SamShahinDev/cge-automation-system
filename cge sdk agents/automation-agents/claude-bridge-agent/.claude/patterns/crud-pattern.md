# CRUD Pattern

Standard Create, Read, Update, Delete implementation pattern for Next.js 15 + Supabase.

## File Structure

```
app/
├── (dashboard)/
│   └── {feature}/
│       ├── page.tsx                    # Main list/index page
│       ├── [id]/page.tsx              # Detail/edit page
│       └── new/page.tsx               # Create page
├── actions/
│   └── {feature}.ts                   # Server actions
├── api/
│   └── {feature}/
│       └── route.ts                   # API routes (if needed)
components/
├── {feature}/
│   ├── {Feature}List.tsx              # List component
│   ├── {Feature}Form.tsx              # Form component
│   └── {Feature}Detail.tsx            # Detail component
types/
└── {feature}.ts                       # TypeScript types
```

## Implementation Template

### 1. Types (`types/{feature}.ts`)

```typescript
import { Database } from '@/types/supabase'

export type Feature = Database['public']['Tables']['{table_name}']['Row']
export type FeatureInsert = Database['public']['Tables']['{table_name}']['Insert']
export type FeatureUpdate = Database['public']['Tables']['{table_name}']['Update']

export interface FeatureFormData {
  // Form-specific fields
  name: string
  description?: string
  // ... other fields
}
```

### 2. Server Actions (`app/actions/{feature}.ts`)

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const FeatureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  // ... other validations
})

export async function createFeature(formData: FormData) {
  const supabase = await createClient()

  // Validate
  const validatedFields = FeatureSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Insert
  const { data, error } = await supabase
    .from('{table_name}')
    .insert(validatedFields.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/{feature}')
  redirect(`/{feature}/${data.id}`)
}

export async function updateFeature(id: string, formData: FormData) {
  const supabase = await createClient()

  const validatedFields = FeatureSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase
    .from('{table_name}')
    .update(validatedFields.data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/{feature}')
  revalidatePath(`/{feature}/${id}`)
}

export async function deleteFeature(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('{table_name}')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/{feature}')
  redirect('/{feature}')
}

export async function getFeatures() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('{table_name}')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getFeature(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('{table_name}')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
```

### 3. List Page (`app/(dashboard)/{feature}/page.tsx`)

```typescript
import { Suspense } from 'react'
import { getFeatures } from '@/app/actions/{feature}'
import { FeatureList } from '@/components/{feature}/FeatureList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function FeaturesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Features</h1>
        <Button asChild>
          <Link href="/{feature}/new">Create New</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <FeatureListWrapper />
      </Suspense>
    </div>
  )
}

async function FeatureListWrapper() {
  const features = await getFeatures()
  return <FeatureList features={features} />
}
```

### 4. Form Component (`components/{feature}/{Feature}Form.tsx`)

```typescript
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createFeature, updateFeature } from '@/app/actions/{feature}'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Feature } from '@/types/{feature}'

interface FeatureFormProps {
  feature?: Feature
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </Button>
  )
}

export function FeatureForm({ feature }: FeatureFormProps) {
  const action = feature
    ? updateFeature.bind(null, feature.id)
    : createFeature

  const [state, formAction] = useFormState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={feature?.name}
          required
        />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={feature?.description || ''}
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">{state.errors.description}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
```

## Checklist

- [ ] Types defined in `types/{feature}.ts`
- [ ] Server actions in `app/actions/{feature}.ts`
- [ ] Zod validation schema
- [ ] List page with Suspense
- [ ] Create page with form
- [ ] Edit page with pre-filled form
- [ ] Delete confirmation
- [ ] Error handling
- [ ] Loading states
- [ ] Revalidation after mutations
- [ ] TypeScript strict mode
- [ ] Accessibility (labels, aria-*)
- [ ] Mobile responsive
