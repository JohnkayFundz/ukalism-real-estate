import { useRef, useState } from 'react'
import { CheckCircle2, Film, ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './MediaUploader.css'

const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024

function safeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function MediaUploader({ images = [], videoUrl = '', onImagesChange, onVideoChange, folder = 'inventory' }) {
  const imageInput = useRef(null)
  const videoInput = useRef(null)
  const [uploading, setUploading] = useState({ images: false, video: false })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const uploadFile = async (file, type) => {
    const isVideo = type === 'video'
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) throw new Error(`${file.name} is too large. Maximum size is ${isVideo ? '100MB' : '15MB'}.`)

    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('inventory-media').upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('inventory-media').getPublicUrl(path)
    return data.publicUrl
  }

  const handleImages = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    setError(''); setStatus(''); setUploading((v) => ({ ...v, images: true }))
    try {
      const uploaded = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image file.`)
        uploaded.push(await uploadFile(file, 'image'))
      }
      onImagesChange([...images, ...uploaded])
      setStatus(`${uploaded.length} photo${uploaded.length === 1 ? '' : 's'} uploaded successfully.`)
    } catch (err) {
      setError(err.message || 'Image upload failed.')
    } finally {
      setUploading((v) => ({ ...v, images: false }))
    }
  }

  const handleVideo = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(''); setStatus(''); setUploading((v) => ({ ...v, video: true }))
    try {
      if (!file.type.startsWith('video/')) throw new Error('Please select a video file.')
      const url = await uploadFile(file, 'video')
      onVideoChange(url)
      setStatus('Property/vehicle video uploaded successfully.')
    } catch (err) {
      setError(err.message || 'Video upload failed.')
    } finally {
      setUploading((v) => ({ ...v, video: false }))
    }
  }

  const removeImage = (index) => onImagesChange(images.filter((_, itemIndex) => itemIndex !== index))

  return (
    <div className="media-uploader">
      <div className="media-upload-grid">
        <div className="media-upload-card">
          <div className="media-upload-card-icon"><ImagePlus size={20} /></div>
          <div>
            <strong>Photos</strong>
            <p>Add multiple listing photos directly from your device.</p>
          </div>
          <button type="button" className="media-upload-button" onClick={() => imageInput.current?.click()} disabled={uploading.images}>
            {uploading.images ? <><Loader2 className="media-spin" size={16} /> Uploading…</> : <><UploadCloud size={16} /> Upload photos</>}
          </button>
          <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple hidden onChange={handleImages} />
        </div>

        <div className="media-upload-card">
          <div className="media-upload-card-icon"><Film size={20} /></div>
          <div>
            <strong>Video tour</strong>
            <p>Upload one main property or vehicle tour video.</p>
          </div>
          <button type="button" className="media-upload-button" onClick={() => videoInput.current?.click()} disabled={uploading.video}>
            {uploading.video ? <><Loader2 className="media-spin" size={16} /> Uploading…</> : <><UploadCloud size={16} /> Upload video</>}
          </button>
          <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={handleVideo} />
        </div>
      </div>

      {images.length > 0 && (
        <div className="media-preview-grid">
          {images.map((url, index) => (
            <div className="media-preview" key={`${url}-${index}`}>
              <img src={url} alt={`Listing photo ${index + 1}`} loading="lazy" />
              <button type="button" onClick={() => removeImage(index)} aria-label={`Remove photo ${index + 1}`}><Trash2 size={15} /></button>
              {index === 0 && <span className="media-cover-badge"><CheckCircle2 size={12} /> Cover</span>}
            </div>
          ))}
        </div>
      )}

      {videoUrl && (
        <div className="media-video-preview">
          <video src={videoUrl} controls preload="metadata" />
          <button type="button" onClick={() => onVideoChange('')} aria-label="Remove video"><Trash2 size={15} /> Remove video</button>
        </div>
      )}

      {(status || error) && <div className={error ? 'media-status error' : 'media-status success'}>{error || status}</div>}
      <small className="media-help">Images up to 15MB each. Videos up to 100MB. The first photo becomes the listing cover.</small>
    </div>
  )
}
