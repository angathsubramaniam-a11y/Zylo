import { motion } from 'framer-motion';
import { PlusCircle, Sparkles, UploadCloud, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApp } from '../context/AppContext.jsx';

const conditions = ['New', 'Like New', 'Good', 'Used'];

export default function SellProductPage() {
  const { categories, createListing } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'books',
    condition: 'Good',
    tags: ''
  });
  const [preview, setPreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tags = useMemo(
    () =>
      form.tags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean)
        .slice(0, 5),
    [form.tags]
  );

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImageFile(file);
    setImageDataUrl('');
    setPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const readImageAsDataUrl = () =>
    new Promise((resolve, reject) => {
      if (!imageFile) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(imageFile);
    });

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const encodedImage = imageDataUrl || (await readImageAsDataUrl());
      const product = await createListing({ ...form, tags, imageDataUrl: encodedImage });
      if (product) {
        navigate(`/product/${product.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-band min-h-screen">
      <div className="page-pad">
        <SectionHeader
          eyebrow="Sell"
          title="Add a product in 3 simple steps"
          copy="Upload one clear photo, add the product details, then publish it for students to see."
        />

        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Product title</span>
                <input required value={form.title} onChange={update('title')} className="field" placeholder="Product name" />
              </label>

              <label>
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Price</span>
                <input required type="number" min="1" value={form.price} onChange={update('price')} className="field" placeholder="2500" />
              </label>

              <label>
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Category</span>
                <select value={form.category} onChange={update('category')} className="field">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Condition</span>
                <select value={form.condition} onChange={update('condition')} className="field">
                  {conditions.map((condition) => (
                    <option key={condition}>{condition}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Tags</span>
                <input value={form.tags} onChange={update('tags')} className="field" placeholder="gaming, hostel, exam" />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">Description</span>
                <textarea
                  required
                  value={form.description}
                  onChange={update('description')}
                  className="field min-h-36 resize-none"
                  placeholder="Condition, included accessories, pickup spot, and any student-friendly details."
                />
              </label>
            </div>

            <button className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
              <PlusCircle size={19} />
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-5">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
              className="group flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-violet-300 bg-white/60 p-6 text-center shadow-card backdrop-blur-2xl transition hover:border-sky-400 hover:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
            >
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
              {preview ? (
                <span className="relative block w-full overflow-hidden rounded-[1.75rem]">
                  <img src={preview} alt="Product preview" className="aspect-[4/3] w-full object-cover" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      if (preview) URL.revokeObjectURL(preview);
                      setImageFile(null);
                      setPreview('');
                      setImageDataUrl('');
                    }}
                    className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl bg-white/85 text-slate-700 shadow-lg"
                  >
                    <X size={18} />
                  </button>
                </span>
              ) : (
                <>
                  <span className="grid h-20 w-20 place-items-center rounded-[1.75rem] bg-brand text-white shadow-glow transition group-hover:scale-105">
                    <UploadCloud size={34} />
                  </span>
                  <span className="mt-5 text-xl font-black">Upload product photo</span>
                  <span className="mt-2 max-w-sm text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Use a clear photo so buyers know exactly what they are getting.
                  </span>
                </>
              )}
            </label>

            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-400 text-slate-950">
                  <Sparkles size={21} />
                </span>
                <div>
                  <p className="font-black">Optional tags</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tags help students find your product faster.</p>
                </div>
              </div>
              {tags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="mini-badge">#{tag}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  Add tags to preview them here.
                </p>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </section>
  );
}
