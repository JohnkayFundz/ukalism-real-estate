import { useEffect, useState } from 'react'
import { ArrowLeft, Car, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { ADMIN_EMAIL, supabase } from '../lib/supabase'
import './AdminPage.css'

const emptyVehicle = { title:'', make:'', model:'', year:new Date().getFullYear(), condition:'Foreign Used', price:'', location:'Lagos, Nigeria', mileage:0, transmission:'Automatic', fuel_type:'Petrol', body_type:'SUV', images:'', video_url:'', description:'', features:'' }

const rowToForm = (row) => ({ ...row, images:(row.images || []).join('\n'), features:(row.features || []).join('\n'), video_url:row.video_url || '' })
const formToRow = (form) => ({ title:form.title.trim(), make:form.make.trim(), model:form.model.trim(), year:Number(form.year), condition:form.condition, price:form.price.trim(), location:form.location.trim(), mileage:Number(form.mileage || 0), transmission:form.transmission, fuel_type:form.fuel_type, body_type:form.body_type, images:form.images.split(/\n|,/).map((v)=>v.trim()).filter(Boolean), video_url:form.video_url.trim() || null, description:form.description.trim(), features:form.features.split(/\n|,/).map((v)=>v.trim()).filter(Boolean) })

function AutosAdmin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState(emptyVehicle)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const isAdmin = session?.user?.email === ADMIN_EMAIL

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => mounted && setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => { if (isAdmin) loadVehicles(); else setLoading(false) }, [isAdmin])

  async function loadVehicles() {
    setLoading(true)
    const { data, error } = await supabase.from('vehicles').select('*').order('id', { ascending:false })
    if (error) setMessage(error.message)
    else setVehicles(data || [])
    setLoading(false)
  }

  async function login(event) {
    event.preventDefault(); setMessage(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email:email.trim(), password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  async function saveVehicle(event) {
    event.preventDefault(); setSaving(true); setMessage('')
    const payload = formToRow(form)
    const result = editingId
      ? await supabase.from('vehicles').update(payload).eq('id', editingId)
      : await supabase.from('vehicles').insert(payload)
    if (result.error) setMessage(result.error.message)
    else { setMessage(editingId ? 'Vehicle updated.' : 'Vehicle added.'); setForm(emptyVehicle); setEditingId(null); await loadVehicles() }
    setSaving(false)
  }

  async function removeVehicle(id) {
    if (!window.confirm('Delete this vehicle listing?')) return
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) setMessage(error.message); else loadVehicles()
  }

  if (!isAdmin) return <div className="admin-page"><div className="admin-login-card"><div className="admin-logo"><Car size={25} /></div><h1>Ukalism Autos Admin</h1><p>Sign in to manage vehicle listings.</p><form onSubmit={login}><label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label><button className="admin-primary-button" disabled={loading}>{loading ? 'Checking...' : 'Sign in'}</button></form>{message && <div className="admin-message error">{message}</div>}</div></div>

  return <div className="admin-page"><header className="admin-header"><div><div className="admin-title"><Car size={22} /> Autos Inventory</div><p>Manage Ukalism vehicle listings</p></div><div className="admin-header-actions"><a href="/autos" className="admin-secondary-button"><ArrowLeft size={16} /> View Autos</a><button className="admin-secondary-button" onClick={()=>supabase.auth.signOut()}><LogOut size={16} /> Sign out</button></div></header><main className="admin-content"><section className="admin-editor-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">Inventory</span><h2>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2></div>{editingId && <button className="admin-secondary-button" onClick={()=>{setEditingId(null);setForm(emptyVehicle)}}>Cancel</button>}</div><form onSubmit={saveVehicle} className="admin-form"><div className="admin-form-grid"><label>Title<input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required /></label><label>Make<input value={form.make} onChange={(e)=>setForm({...form,make:e.target.value})} required /></label><label>Model<input value={form.model} onChange={(e)=>setForm({...form,model:e.target.value})} required /></label><label>Year<input type="number" value={form.year} onChange={(e)=>setForm({...form,year:e.target.value})} required /></label><label>Condition<select value={form.condition} onChange={(e)=>setForm({...form,condition:e.target.value})}><option>Brand New</option><option>Foreign Used</option><option>Nigerian Used</option></select></label><label>Price<input value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} placeholder="₦25,000,000" required /></label><label>Location<input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} required /></label><label>Mileage (km)<input type="number" min="0" value={form.mileage} onChange={(e)=>setForm({...form,mileage:e.target.value})} /></label><label>Transmission<select value={form.transmission} onChange={(e)=>setForm({...form,transmission:e.target.value})}><option>Automatic</option><option>Manual</option><option>CVT</option><option>AMT</option></select></label><label>Fuel type<select value={form.fuel_type} onChange={(e)=>setForm({...form,fuel_type:e.target.value})}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Hybrid</option><option>Electric</option></select></label><label>Body type<select value={form.body_type} onChange={(e)=>setForm({...form,body_type:e.target.value})}>{['Sedan','SUV','Hatchback','Coupe','Wagon','Van','Truck','Bus','Motorcycle'].map((v)=><option key={v}>{v}</option>)}</select></label></div><label>Image URLs (one per line)<textarea rows="4" value={form.images} onChange={(e)=>setForm({...form,images:e.target.value})} placeholder="https://..." /></label><label>Video URL (optional)<input value={form.video_url} onChange={(e)=>setForm({...form,video_url:e.target.value})} placeholder="https://..." /></label><label>Description<textarea rows="5" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></label><label>Features (one per line)<textarea rows="4" value={form.features} onChange={(e)=>setForm({...form,features:e.target.value})} /></label><button className="admin-primary-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Vehicle' : 'Add Vehicle'} {editingId ? <Pencil size={16} /> : <Plus size={16} />}</button></form>{message && <div className="admin-message">{message}</div>}</section><section className="admin-list-card"><div className="admin-card-heading"><div><span className="admin-eyebrow">Published inventory</span><h2>{vehicles.length} Vehicles</h2></div></div>{loading ? <p>Loading vehicles...</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Vehicle</th><th>Condition</th><th>Price</th><th>Location</th><th>Actions</th></tr></thead><tbody>{vehicles.map((vehicle)=><tr key={vehicle.id}><td><strong>{vehicle.title}</strong><small>{vehicle.year} · {vehicle.mileage?.toLocaleString()} km · {vehicle.transmission}</small></td><td>{vehicle.condition}</td><td>{vehicle.price}</td><td>{vehicle.location}</td><td><div className="admin-row-actions"><button onClick={()=>{setEditingId(vehicle.id);setForm(rowToForm(vehicle));window.scrollTo({top:0,behavior:'smooth'})}} className="admin-icon-button"><Pencil size={16} /></button><button onClick={()=>removeVehicle(vehicle.id)} className="admin-icon-button danger"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}</section></main></div>
}

export default AutosAdmin
