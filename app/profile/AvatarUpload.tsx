'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('') || '?'
  )
}

export default function AvatarUpload({
  initialAvatarUrl,
  fullName,
}: {
  initialAvatarUrl: string | null
  fullName: string
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be smaller than 5MB.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be signed in to upload a photo.')
        return
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('user_id', user.id)
      if (updateError) {
        setError(updateError.message)
        return
      }

      setAvatarUrl(publicUrlData.publicUrl)
    } catch {
      setError('Upload failed — please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-2xl font-bold shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile photo" className="w-full h-full object-cover" />
        ) : (
          initialsOf(fullName)
        )}
      </div>
      <div>
        <label className="btn-outline text-xs px-4 py-2 cursor-pointer inline-block">
          {uploading ? 'Uploading…' : 'Change photo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">JPG, PNG or WEBP. Max 5MB.</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>
    </div>
  )
}
