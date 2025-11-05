# Form Pattern

Standard form handling with validation for Next.js 15 + React Server Actions.

## File Structure

```
app/actions/{feature}.ts              # Server action
components/{feature}/{Feature}Form.tsx # Form component
lib/validations/{feature}.ts          # Zod schemas
```

## Implementation Template

### 1. Validation Schema (`lib/validations/{feature}.ts`)

```typescript
import { z } from 'zod'

export const featureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().datetime(),
  status: z.enum(['active', 'inactive', 'pending']),
  description: z.string().max(500).optional(),
})

export type FeatureFormData = z.infer<typeof featureSchema>
```

### 2. Server Action (`app/actions/{feature}.ts`)

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { featureSchema } from '@/lib/validations/{feature}'
import { revalidatePath } from 'next/cache'

export async function submitFeatureForm(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Parse form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    status: formData.get('status'),
    description: formData.get('description'),
  }

  // Validate
  const validatedFields = featureSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    }
  }

  // Process
  try {
    const { data, error } = await supabase
      .from('{table}')
      .insert(validatedFields.data)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    revalidatePath('/{path}')

    return {
      success: true,
      message: 'Form submitted successfully',
      data,
    }
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}
```

### 3. Form Component (`components/{feature}/{Feature}Form.tsx`)

```typescript
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitFeatureForm } from '@/app/actions/{feature}'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect } from 'react'
import { toast } from 'sonner'

const initialState = {
  success: false,
  message: '',
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <span className="mr-2">⏳</span>
          Submitting...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  )
}

export function FeatureForm() {
  const [state, formAction] = useFormState(submitFeatureForm, initialState)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
    } else if (state?.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          aria-describedby={state?.errors?.name ? 'name-error' : undefined}
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">
            {state.errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          aria-describedby={state?.errors?.email ? 'email-error' : undefined}
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.errors.email}
          </p>
        )}
      </div>

      {/* Phone (optional) */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="1234567890"
          aria-describedby={state?.errors?.phone ? 'phone-error' : undefined}
        />
        {state?.errors?.phone && (
          <p id="phone-error" className="text-sm text-destructive">
            {state.errors.phone}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">
          Amount <span className="text-destructive">*</span>
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          aria-describedby={state?.errors?.amount ? 'amount-error' : undefined}
        />
        {state?.errors?.amount && (
          <p id="amount-error" className="text-sm text-destructive">
            {state.errors.amount}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select name="status" required>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        {state?.errors?.status && (
          <p className="text-sm text-destructive">{state.errors.status}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          aria-describedby={state?.errors?.description ? 'description-error' : undefined}
        />
        {state?.errors?.description && (
          <p id="description-error" className="text-sm text-destructive">
            {state.errors.description}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
```

## Features

✅ **Validation**: Zod schema with detailed error messages
✅ **Server Actions**: Progressive enhancement
✅ **Loading States**: Disabled submit button while pending
✅ **Error Display**: Field-level error messages
✅ **Success Feedback**: Toast notifications
✅ **Accessibility**: Proper labels, aria-describedby, required indicators
✅ **Type Safety**: TypeScript throughout

## Checklist

- [ ] Zod schema defined
- [ ] Server action created
- [ ] Form component with useFormState
- [ ] All fields have labels
- [ ] Required fields marked with *
- [ ] Error messages displayed
- [ ] Loading state during submission
- [ ] Success/error toast notifications
- [ ] Accessibility attributes
- [ ] Mobile responsive
- [ ] Form reset on success (optional)
