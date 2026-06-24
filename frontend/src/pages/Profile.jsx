import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/client';
import Layout from '../components/Layout';
import { Camera } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await userApi.updateProfile({ name });
      updateUser(res.data.data);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await userApi.uploadPhoto(file);
      updateUser(res.data.data);
      setMessage('Photo uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account details</p>

      <div className="card" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 120, height: 120, borderRadius: '50%', margin: '0 auto 1rem',
              background: 'var(--primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '3rem', fontWeight: 800,
              overflow: 'hidden', position: 'relative', cursor: 'pointer',
            }}
            onClick={() => fileRef.current?.click()}
          >
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.5)', padding: '0.25rem', fontSize: '0.75rem',
            }}>
              <Camera size={16} style={{ margin: '0 auto' }} />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          {message && <p className="success-msg">{message}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
