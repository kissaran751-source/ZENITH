import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { GlassCard } from '../../components/GlassCard';
import { useAuth } from '../../contexts/AuthContext';

export default function StoreItemsTab() {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'store_items'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firebaseUser) return;
    fetchItems();
  }, [firebaseUser]);

  const handleSave = async (item: any) => {
    try {
      setSaving(true);
      if (item.id) {
        const docRef = doc(db, 'store_items', item.id);
        const { id, ...data } = item;
        await updateDoc(docRef, data);
      } else {
        let newId = item.itemId;
        if (!newId) {
          if (!item.title) return; // Cannot save without title
          newId = item.title.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
        }
        const docRef = doc(db, 'store_items', newId);
        await setDoc(docRef, { ...item, itemId: newId });
      }
      setEditingItem(null);
      fetchItems();
    } catch (e) {
      console.error(e);
      // fallback manual error handling if needed, but no alert
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'store_items', id));
      setConfirmDeleteId(null);
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (item: any) => {
    try {
      await updateDoc(doc(db, 'store_items', item.id), { enabled: !item.enabled });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading store items...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-sora font-semibold text-lg">Store Items</h2>
        <button
          onClick={() => setEditingItem({ title: '', category: 'Beverage Passes', price: 1000, icon: '🌟', enabled: true, glowColor: 'rgba(59,130,246,0.5)', description: '' })}
          className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          Add Item
        </button>
      </div>

      {editingItem && (
        <GlassCard className="!p-4">
          <h3 className="font-bold mb-3">{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
          <div className="flex flex-col gap-3">
            <input placeholder="Item Title" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm" />
            <input placeholder="Category" value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm" />
            <input placeholder="Description" value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm" />
            <div className="flex gap-2">
              <input type="number" placeholder="Price" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm flex-1" />
              <input placeholder="Icon (Emoji)" value={editingItem.icon} onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm w-20" />
            </div>
            <input placeholder="Image URL (PNG/JPG)" value={editingItem.image || ''} onChange={e => setEditingItem({ ...editingItem, image: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm" />
            <input placeholder="Glow Color (rgba)" value={editingItem.glowColor} onChange={e => setEditingItem({ ...editingItem, glowColor: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm" />
            
            <div className="flex justify-end gap-2 mt-2">
              <button disabled={saving} onClick={() => setEditingItem(null)} className="px-4 py-2 bg-white/10 rounded-xl text-sm">Cancel</button>
              <button disabled={saving} onClick={() => handleSave(editingItem)} className="px-4 py-2 bg-green-600 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {items.map(item => (
        <GlassCard key={item.id} className="!p-4 flex flex-col gap-2">
          {confirmDeleteId === item.id ? (
            <div className="flex items-center justify-between p-2 font-sora font-semibold">
              <span>Delete {item.title}?</span>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1 bg-white/10 rounded-lg text-xs">Cancel</button>
                <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold">Yes, Delete</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="font-sora font-semibold">{item.title}</div>
                    <div className="text-xs text-white/50">{item.category} • {item.price} Coins</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => handleToggle(item)} className={`px-3 py-1 rounded-full text-xs font-semibold ${item.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     {item.enabled ? 'Enabled' : 'Disabled'}
                   </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2 border-t border-white/10 pt-2">
                <button onClick={() => setEditingItem(item)} className="px-3 py-1 bg-white/5 rounded-lg text-xs">Edit</button>
                <button onClick={() => setConfirmDeleteId(item.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">Delete</button>
              </div>
            </>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
