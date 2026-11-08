import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { removeImageByUrl, uploadImage } from '../lib/storage';
import { isValidUrl, parseList } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import Loader from '../components/Loader';

const EMPTY = {
  title: '',
  description: '',
  category_id: '',
  technology: '',
  year_created: String(new Date().getFullYear()),
  demo_url: '',
  github_url: '',
  status: 'published',
};

function validate(form) {
  const errors = {};
  const year = Number(form.year_created);
  if (form.title.trim().length < 3) errors.title = 'Гарчиг дор хаяж 3 тэмдэгт байна.';
  if (form.title.trim().length > 150) errors.title = 'Гарчиг 150 тэмдэгтээс хэтрэхгүй.';
  if (form.description.trim().length < 20) errors.description = 'Тайлбар дор хаяж 20 тэмдэгт байна.';
  if (!form.category_id) errors.category_id = 'Ангилал сонгоно уу.';
  if (form.year_created && (!Number.isInteger(year) || year < 1924 || year > new Date().getFullYear() + 1)) {
    errors.year_created = `Он 1924–${new Date().getFullYear() + 1} хооронд байна.`;
  }
  if (!isValidUrl(form.demo_url)) errors.demo_url = 'https://-ээр эхэлсэн зөв холбоос оруулна уу.';
  if (!isValidUrl(form.github_url)) errors.github_url = 'https://-ээр эхэлсэн зөв холбоос оруулна уу.';
  if (form.github_url && !/github\.com/i.test(form.github_url)) errors.github_url = 'GitHub холбоос байх ёстой.';
  return errors;
}

export default function ExhibitForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [removeOld, setRemoveOld] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('exhibition_categories').select('id, name').order('name')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    supabase.from('exhibits').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (error || !data) {
        setSubmitError('Үзмэр олдсонгүй.');
      } else if (data.creator_id !== user.id && !isAdmin) {
        setSubmitError('Та зөвхөн өөрийн бүтээлийг засах эрхтэй.');
      } else {
        setForm({
          title: data.title,
          description: data.description ?? '',
          category_id: data.category_id ? String(data.category_id) : '',
          technology: (data.technology_stack ?? []).join(', '),
          year_created: data.year_created ? String(data.year_created) : '',
          demo_url: data.demo_url ?? '',
          github_url: data.github_url ?? '',
          status: data.status,
        });
        setImageUrl(data.image_url ?? '');
      }
      setLoading(false);
    });
  }, [id, isEdit, user.id, isAdmin]);

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setSubmitError('');
    try {
      let finalImage = removeOld ? null : imageUrl || null;
      if (imageFile) finalImage = await uploadImage(imageFile, user.id, 'exhibits');

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.category_id),
        technology_stack: parseList(form.technology),
        year_created: form.year_created ? Number(form.year_created) : null,
        demo_url: form.demo_url.trim() || null,
        github_url: form.github_url.trim() || null,
        status: form.status,
        image_url: finalImage,
      };

      let result;
      if (isEdit) {
        result = await supabase.from('exhibits').update(payload).eq('id', id).select('id').single();
      } else {
        result = await supabase
          .from('exhibits')
          .insert({ ...payload, creator_id: user.id })
          .select('id')
          .single();
      }
      if (result.error) throw result.error;

      // Хуучин зургийг солисон/арилгасан бол Storage-оос устгана
      if (isEdit && imageUrl && (imageFile || removeOld)) await removeImageByUrl(imageUrl);

      navigate(`/exhibits/${result.data.id}`);
    } catch (err) {
      setSubmitError(err.message || 'Хадгалах үед алдаа гарлаа.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="container section narrow">
      <Link to={isEdit ? `/exhibits/${id}` : '/my-exhibits'} className="link-back">← Буцах</Link>
      <h1>{isEdit ? 'Бүтээл засах' : 'Шинэ бүтээл нэмэх'}</h1>
      <p className="muted">Од (*) бүхий талбарыг заавал бөглөнө.</p>

      {submitError && <div className="notice notice--error">{submitError}</div>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span className="field__label">Гарчиг *</span>
          <input className="input" name="title" value={form.title} onChange={update} maxLength={150} />
          {errors.title && <span className="field__error">{errors.title}</span>}
        </label>

        <label className="field">
          <span className="field__label">Тайлбар *</span>
          <textarea className="input" name="description" rows={6} value={form.description} onChange={update}
            placeholder="Төслийн зорилго, шийдсэн асуудал, таны хувь нэмэр…" />
          <span className="field__hint">{form.description.trim().length} тэмдэгт</span>
          {errors.description && <span className="field__error">{errors.description}</span>}
        </label>

        <div className="form__row">
          <label className="field">
            <span className="field__label">Ангилал *</span>
            <select className="input" name="category_id" value={form.category_id} onChange={update}>
              <option value="">— Сонгох —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <span className="field__error">{errors.category_id}</span>}
          </label>
          <label className="field">
            <span className="field__label">Он</span>
            <input className="input" name="year_created" type="number" value={form.year_created} onChange={update} />
            {errors.year_created && <span className="field__error">{errors.year_created}</span>}
          </label>
        </div>

        <label className="field">
          <span className="field__label">Ашигласан технологи</span>
          <input className="input" name="technology" value={form.technology} onChange={update}
            placeholder="React, Supabase, Python (таслалаар тусгаарлана)" />
        </label>

        <div className="form__row">
          <label className="field">
            <span className="field__label">Demo холбоос</span>
            <input className="input" name="demo_url" type="url" value={form.demo_url} onChange={update} placeholder="https://" />
            {errors.demo_url && <span className="field__error">{errors.demo_url}</span>}
          </label>
          <label className="field">
            <span className="field__label">GitHub холбоос</span>
            <input className="input" name="github_url" type="url" value={form.github_url} onChange={update} placeholder="https://github.com/…" />
            {errors.github_url && <span className="field__error">{errors.github_url}</span>}
          </label>
        </div>

        <ImageUpload
          label="Нүүр зураг"
          currentUrl={imageUrl}
          onFileChange={(file) => {
            setImageFile(file);
            if (file) setRemoveOld(false);
          }}
          onRemove={() => setRemoveOld(true)}
        />

        <label className="field">
          <span className="field__label">Төлөв</span>
          <select className="input" name="status" value={form.status} onChange={update}>
            <option value="published">Нийтлэх — бүгдэд харагдана</option>
            <option value="draft">Ноорог — зөвхөн надад харагдана</option>
            {isAdmin && <option value="archived">Архив</option>}
          </select>
        </label>

        <div className="form__actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Хадгалж байна…' : isEdit ? 'Өөрчлөлт хадгалах' : 'Бүтээл нэмэх'}
          </button>
        </div>
      </form>
    </div>
  );
}
